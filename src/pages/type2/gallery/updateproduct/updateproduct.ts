import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController,ActionSheetController } from 'ionic-angular';
import { CommonService,ToastMessageType,ToastPlacement,} from "../../../../services/common.service";
import { Storage } from "@ionic/storage";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import { product_images } from '../model/gallery.model';
import { ImagePicker,ImagePickerOptions } from '@ionic-native/image-picker';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { GalleryModel, GalleryCategories } from '../model/gallery.model';
import { SharedServices } from '../../../services/sharedservice';
//import {NgxImageCompressService} from "ngx-image-compress";

/**
 * Generated class for the UpdateproductPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-updateproduct',
  templateUrl: 'updateproduct.html',
  providers:[ImagePicker]
})
export class UpdateproductPage {
  gallery_item:GalleryModel;
  gallery_categories:GalleryCategories[];
  deleted_imgs:string[] = [];
  imgUrls = [];
  new_img_urls:product_images[] = [];
  parent_clubkey:string;
  variant_sizes:{id:string,name:string}[] = [
    {id:"S", name:"S"},
    {id:"L", name:"L"},
    {id:"XL", name:"XL"}
  ] 
  product_category:string;
  showFullImage:boolean = false;
  full_view_img:string;
  selected_img_index:number = 0;
  max_image_index = 0;
  prod_imgs_len:number = 0;
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private alertCtrl: AlertController,
    public actionSheetCtrl: ActionSheetController,
    private apollo: Apollo,
    public http: HttpClient,
    public commonService: CommonService,
    public sharedservice: SharedServices,
    private imagePicker: ImagePicker) {
      //getCloudfrontURL()
    this.gallery_item = <GalleryModel>this.navParams.get("gallery_item");
    this.parent_clubkey = this.navParams.get("ParentClubKey");
    if(this.gallery_item.images && this.gallery_item.images.length > 0){
      this.prod_imgs_len = this.gallery_item.images.length;
      this.max_image_index = Math.max.apply(Math, this.gallery_item.images.map(image => Number(image.image_sequence)));
    }
    this.getProductCategories();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UpdateproductPage'); 
  }

  showFullViewImage(){
    this.full_view_img = `${this.gallery_item.images[this.selected_img_index].image_url}`;
    this.showFullImage = true;
  }
  

  //getting categories
  getProductCategories = () => {
    //this.commonService.showLoader("Please wait");
    const gallery_categories_input = {
      ParentClubKey:this.parent_clubkey,
      MemberKey:"",
      AppType:0, //Which app {0:Admin,1:Member,2:Applus}
      ActionType:0 //as of now
    }
    //parentClubId removes from res object as it's giving err
    const galleryQuery = gql`
      query getAllProductCategoriesForParentClub($getCategoriesInput: getProductCategoryInput!) {
        getAllProductCategoriesForParentClub(categoryInput: $getCategoriesInput) {
          id
          category_name
          category_description
          category_image
        }
      }
    `;
    this.apollo
      .query({
        query: galleryQuery,
        fetchPolicy: "no-cache",
        variables: { getCategoriesInput: gallery_categories_input},
      })
      .subscribe(
        ({ data }) => {
          //this.commonService.hideLoader();
          //this.commonService.toastMessage("Categories fetched",2500,ToastMessageType.Success,ToastPlacement.Bottom);
          this.gallery_categories = data["getAllProductCategoriesForParentClub"] as GalleryCategories[];
          console.log("categories data" + JSON.stringify(this.gallery_categories));
          if(this.gallery_categories.length > 0) this.product_category = this.gallery_item.productCategory.id;
        },
        (err) => {
          //this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage("Categories fetch failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }
      );
  };

  //image related actions
  showImageActions(index:number){
    this.selected_img_index = index;
    const actionSheet = this.actionSheetCtrl.create({
      //title: `Modify ${this.gallery_item.variant_shortname}`,
      buttons: [
        {
          text: 'View',
          icon: 'ios-eye',
          handler: () => {
            this.showFullViewImage();
          }
        },{
          text: 'Edit',
          icon: 'ios-create',
          handler: () => {
            this.chooseGalleryImages(false); //false nothing but editing existing image
          }
        },{
          text: 'Delete',
          icon: 'ios-trash',
          handler: () => {
            this.deleteProdGalleryItem();
          }
        },{
          text: 'Cancel',
          icon: 'ios-close',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }

  //delete gallery item image
  deleteProdGalleryItem(){
    this.commonService.commonAlter('Delete item', 'Are you sure, want to delete?', async () => {
      this.deleted_imgs.push(this.gallery_item.images[this.selected_img_index].id);
      this.gallery_item.images.splice(this.selected_img_index,1);
      this.new_img_urls = [];
      this.prod_imgs_len--; //decrement available images length
      this.updateGalleryItem();
    });
  }

  //getting random name for image name
  getRandomString(){
    return this.commonService.randomString(6, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ')
  }

  async chooseGalleryImages(status:boolean){
    //false nothing but editing existing image,true means uploading new extra images
    //have to check already existed images and max imag count is 5
    const img_cnt_to_upload = 5 - this.prod_imgs_len;
    let len_to_check = status ? img_cnt_to_upload : 1;//if edit only 1 can upload, otherwise 5
    this.imgUrls = [];
    this.deleted_imgs = [];
    const options:ImagePickerOptions = {
      maximumImagesCount:status ? img_cnt_to_upload : 1, //have to check already existed images and max imag count is 5
      //width:200,
      //height:200,
      quality:80,
      outputType:1
    }
    // window.imagePicker.OutputType.FILE_URI (0) or 
    // window.imagePicker.OutputType.BASE64_STRING (1)
    
    this.imagePicker.getPictures(options).then(async (results) => {
      try{
          results.forEach(async(base64_uri,index)=> {
            //if(this.imgUrls.length <= len_to_check){
              const image_url = base64_uri.split(/[\s/]+/);
              const image_name = image_url[image_url.length - 1];
              const base64Response = await fetch("data:image/jpeg;base64," + base64_uri);
              const parseUrl = `${this.parent_clubkey}/${image_name.charAt(0)}${image_name.charAt(1)}${this.getRandomString()}.jpeg`;
              this.getSignedUrl(parseUrl).then(async (res) => {
                console.log(`signedname:${res[0].name}`);
                //console.log(`signedurl:${res[0].url}`);
                this.imgUrls.push({file_uri:`data:image/jpeg;base64,${base64_uri}`, base64_uri:base64Response, img_name:res[0].name, signed_url:res[0].url});
                if(status){ // staus true
                  this.prod_imgs_len++;
                  this.gallery_item.images.push({id:"",image_url:`data:image/jpeg;base64,${base64_uri}`});
                }else{
                  this.deleted_imgs.push(this.gallery_item.images[this.selected_img_index].id);
                  this.gallery_item.images[this.selected_img_index].image_url = `data:image/jpeg;base64,${base64_uri}`;
                }
                
                
              });  
            //}
            // else{
            //   this.commonService.toastMessage("Cannot upload morethan 1",2500,ToastMessageType.Error,ToastPlacement.Bottom);
            // }
          });
      }catch(err){
        //this.commonService.toastMessage("Error in upload",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        console.log(JSON.stringify(err));
      }
      
    }, (err) => {
      //this.commonService.toastMessage("Error in upload",2500,ToastMessageType.Error,ToastPlacement.Bottom);
      console.log("imagepicker plugin issue");
      console.log(JSON.stringify(err));
     });
  }
  
  //dev =>https://i97kakk5tk.execute-api.eu-west-2.amazonaws.com/Dev/generatesignedurl
  getSignedUrl(imageUrl: any) {
    console.log(this.sharedservice.getPresignedURL());
    return new Promise((resolve, reject) => {
      this.http
        .post(
          `${this.sharedservice.getPresignedURL()}`,
          {
            name: "galary",
            type: "IMAGE",
            files: [imageUrl],
          }
        )
        .subscribe(
          (res: any) => {
            if (res) {
              console.log(res);
              resolve(res);
            }
          },
          (err) => {
            console.log(`signederr:${JSON.stringify(err)}`);
            reject(err);
          }
        );
    });
  }
  putUrl(data, url) {
    return new Promise((resolve, reject) => {
      // const options = this.prepareOptions();
      const thisRef = this;
      let headers = new HttpHeaders();
      headers = headers.append("Content-Type", "image/jpeg");
      this.http.put(url, data, { headers }).subscribe(
        (res: any) => {
          resolve(res);
        },
        (err) => {
          reject(err);
        }
      );
    });
  }
  


  showUpdatePrompt() {
    const prompt = this.alertCtrl.create({
      title: 'Update Product ? ',
      message: `Are you sure want to update ${this.gallery_item.variant_shortname} ?`,
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Update',
          handler: () => {
            this.uploadPhotos();
          }
        }
      ]
    });
    prompt.present();
  }

  async uploadPhotos(){
    this.new_img_urls = [];
    try{
      //if(this.validateGalleryItem()){
        if(this.imgUrls.length > 0){
          this.commonService.showLoader("Please wait");
          this.imgUrls.forEach(async(img,index) => {
            //for s3 u have to convert base64 into blob, So below Converting a base64 string to a blob in JavaScript
          let img_index = index;
          this.new_img_urls.push({ProductVariantId:"",ImageUrl:img.img_name,ImageSequence:this.max_image_index++});
          let upload_Res = await this.putUrl(await img.base64_uri.blob(), img.signed_url).catch(()=>{this.commonService.hideLoader();});
            console.log(`uploadres:${upload_Res}`);
            if(index == this.imgUrls.length-1){
              this.commonService.hideLoader();
              this.updateGalleryItem();
            }
          });  
        }else{
          this.updateGalleryItem();
        }
         
      //}
    }catch(err){
      this.commonService.hideLoader();
      //alert(JSON.stringify(err));
      this.commonService.toastMessage("Images upload failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
    }
    
  }

  //updating gallery item
  updateGalleryItem() {
    this.commonService.showLoader("Please wait");
    const modify_item_input = {
      ParentClubKey:this.parent_clubkey, //removed
      ProductId:this.gallery_item.id,
      ProductCategoryId: this.product_category,
      Variant_ShortName:this.gallery_item.variant_shortname,
      Variant_Size: this.gallery_item.variant_size,
      Variant_Price: this.gallery_item.variant_price.toString(),
      Variant_Description: this.gallery_item.variant_description,
      quantity:Number(this.gallery_item.quantity),
      AppType: 0, //removed //Which app {0:Admin,1:Member,2:Applus}
      ActionType:2,//removed  // 1for delete, 2 for edit, 3 for hide gallery item
      transactionType:3,
      addNewimages:this.new_img_urls,
      deleteImages:this.deleted_imgs
    }
    //this.commonService.showLoader("Please wait...");
    this.apollo
      .mutate({
        mutation: gql`
          mutation modifyGalleryItem($gallery_modify_input: modifyProductVariantInput!) {
            modifyGalleryItem(modifyInput: $gallery_modify_input)
          }
        `,
        variables: { gallery_modify_input: modify_item_input },
      })
      .subscribe(
        ({ data }) => {
          this.commonService.hideLoader();
          this.commonService.toastMessage(`${this.gallery_item.variant_shortname} updated successfully`,2500,ToastMessageType.Success,ToastPlacement.Bottom);
          console.log("gallery data" + data["modifyProductVariantInput"]);
          //this.commonService.updateCategory("gallerylist");
          this.navCtrl.pop();
        },
        (err) => {
          this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage(`${this.gallery_item.variant_shortname} updation failed`,2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }
      );
  }

}

