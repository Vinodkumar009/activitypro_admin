import { Component } from '@angular/core';
import { IonicPage,NavController,NavParams,AlertController,ActionSheetController,LoadingController,} from "ionic-angular";
import { FirebaseService } from "../../../../services/firebase.service";
import { SharedServices } from "../../../services/sharedservice";
import { CommonService,ToastMessageType,ToastPlacement,} from "../../../../services/common.service";
import { Storage } from "@ionic/storage";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import { ImagePicker,ImagePickerOptions } from '@ionic-native/image-picker';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { GalleryItemModel, GalleryCategories } from '../model/gallery.model';
import { Camera, CameraOptions } from "@ionic-native/camera";
//import {NgxImageCompressService} from "ngx-image-compress";
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/forkJoin'
/**
 * Generated class for the CreteproductPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and na~vigation.
 */

@IonicPage()
@Component({
  selector: 'page-creteproduct',
  templateUrl: 'creteproduct.html',
  providers:[ImagePicker,Camera]
})
export class CreteproductPage {
  imgUrls = [];
  presigned_urls = [];
  gallery_item:GalleryItemModel = {
    ParentClubKey: "", //ParentClub Key
    MemberKey: "", //ParentClub Key
    AppType: 0, //Which app {0:Admin,1:Member,2:Applus}
    ActionType: 0,
    ProductCategoryId: "",
    Variant_ShortName: "",
    Variant_Size: "",
    Variant_Price: "",
    Variant_Description: "",
    Variant_Quantity: 10000,
    Variant_Visibility:0,
    images:[]
  };
  variant_parice:number;
  gallery_categories:GalleryCategories[];
  parent_clubkey:string;
  variant_sizes:{id:string,name:string}[] = [
    {id:"S", name:"S"},
    {id:"L", name:"L"},
    {id:"XL", name:"XL"}
  ] 
  showFullImage:boolean = false;
  full_view_img:string;
  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    private apollo: Apollo,
    private camera: Camera,
    public actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public fb: FirebaseService,
    private imagePicker: ImagePicker,
    public http: HttpClient,
    public sharedservice: SharedServices) {
      console.log(this.sharedservice.getPresignedURL());
      this.gallery_item.Variant_Size = this.variant_sizes[0].id;
      this.storage.get("userObj").then((val) => {
        val = JSON.parse(val);
        if (val.$key != "") {
          this.parent_clubkey = val.UserInfo[0].ParentClubKey;
          this.gallery_item.ParentClubKey = this.parent_clubkey;
          this.getProductCategories();
          //this.getTemplates();
        }
      });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CreteproductPage');
  }

  showFullViewImage(img_index:number){
    this.full_view_img = this.imgUrls[img_index].file_uri;
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
          if(this.gallery_categories.length > 0) this.gallery_item.ProductCategoryId = this.gallery_categories[0].id;
        },
        (err) => {
          //this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage("Categories fetch failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }
      );
  };

  showCreatePrompt() {
    const prompt = this.alertCtrl.create({
      title: 'Create Product ? ',
      message: `Are you sure want to create ${this.gallery_item.Variant_ShortName} Product ?`,
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Create',
          handler: () => {
            this.createGalleryItem();
          }
        }
      ]
    });
    prompt.present();
  }

  validateGalleryItem(){
    if(this.gallery_item.Variant_ShortName == ""){
      this.commonService.toastMessage("Please enter variant short name",2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    // else if(this.variant_parice == 0 ){
    //   this.commonService.toastMessage("Please enter variant short name",2500,ToastMessageType.Error,ToastPlacement.Bottom);
    //   return false;
    // }
    else if(this.gallery_item.Variant_Quantity == 0){
      this.commonService.toastMessage("Please enter variant quantity",2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    else if(this.imgUrls.length == 0){
      this.commonService.toastMessage("Please upload atleast one image",2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    else{
      return true;
    }
  }



  async chooseGalleryImages(){
    const options:ImagePickerOptions = {
      maximumImagesCount:5,
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
            if(this.imgUrls.length < 5){
              const image_url = base64_uri.split(/[\s/]+/);
              const image_name = image_url[image_url.length - 1];
              const base64Response = await fetch("data:image/jpeg;base64," + base64_uri);
              //console.log(`after fetch:${JSON.stringify(base64Response)}`);
              const parseUrl = `${this.parent_clubkey}/${image_name.charAt(0)}${image_name.charAt(1)}${this.getRandomString()}.jpeg`;
              this.getSignedUrl(parseUrl).then(async (res) => {
                console.log(`signedname:${res[0].name}`);
                console.log(`signedurl:${res[0].url}`);
                this.imgUrls.push({file_uri:`data:image/jpeg;base64,${base64_uri}`, base64_uri:base64Response, img_name:res[0].name, signed_url:res[0].url});
              });  
            }else{
              this.commonService.toastMessage("Cannot upload morethan 5",2500,ToastMessageType.Error,ToastPlacement.Bottom);
            }
          });
      }catch(err){
        //this.commonService.toastMessage("Error in upload",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        alert(JSON.stringify(err));
      }
      
    }, (err) => {
      //this.commonService.toastMessage("Error in upload",2500,ToastMessageType.Error,ToastPlacement.Bottom);
      console.log("imagepicker plugin issue");
      alert(JSON.stringify(err));
      console.log(JSON.stringify(err));
     });
  }

  

  //uploading photos
  async uploadPhotos(){
    try{
      if(this.validateGalleryItem()){
        this.commonService.showLoader("Please wait");
        this.imgUrls.forEach(async(img,index) => {
          //for s3 u have to convert base64 into blob, So below Converting a base64 string to a blob in JavaScript
        let img_index = index;
         this.presigned_urls.push({ProductVariantId:"",ImageUrl:img.img_name,ImageSequence:img_index++});
         let upload_Res = await this.putUrl(await img.base64_uri.blob(), img.signed_url).catch(()=>{this.commonService.hideLoader();});
          
          //alert(`${index}:${this.imgUrls.length-1}`)
          if(index == this.imgUrls.length-1){
            //alert(`inside`);
            this.createGalleryItem();
          }
        });    
      }
    }catch(err){
      this.commonService.hideLoader();
      //alert(JSON.stringify(err));
      this.commonService.toastMessage("Images upload failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
    }
    
  }

  //creating gallery item
  createGalleryItem() {
    //if(this.validateGalleryItem()){
      //this.commonService.showLoader("Please wait...");
      this.gallery_item.Variant_Price = this.variant_parice.toString();
      this.gallery_item.Variant_Quantity = Number(this.gallery_item.Variant_Quantity);
      this.gallery_item.images = this.presigned_urls;
      //parentClubId
      this.apollo
        .mutate({
          mutation: gql`
            mutation createProductForGallery($gallery_item_input: createProductVariantInput!) {
              createProductForGallery(createInput: $gallery_item_input){
                id
                variant_type
                variant_size
              }
            }
          `,
          variables: { gallery_item_input: this.gallery_item },
        })
        .subscribe(
          ({ data }) => {
            this.commonService.hideLoader();
            console.log("gallery data" + data["createProductForGallery"]);
            this.commonService.toastMessage(`${this.gallery_item.Variant_ShortName} created successfully`,2500,ToastMessageType.Success,ToastPlacement.Bottom);
            //this.commonService.updateCategory("gallerylist");
            this.navCtrl.pop();
          },
          (err) => {
            this.commonService.hideLoader();
            console.log(JSON.stringify(err));
            this.commonService.toastMessage("item creation failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
          }
        );
    //}
    
  }

  //delete an image from selected images 
  deleteImage(img_index:number){
    this.imgUrls.splice(img_index,1);
  }

  getRandomString(){
    return this.commonService.randomString(6, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ')
  }
  
  //dev =>https://i97kakk5tk.execute-api.eu-west-2.amazonaws.com/Dev/generatesignedurl
  getSignedUrl(imageUrl: any) {
    //console.log(this.sharedservice.getPresignedURL());
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



}



