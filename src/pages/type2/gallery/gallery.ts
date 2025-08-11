import { Component } from '@angular/core';
import { IonicPage,NavController,NavParams,PopoverController,AlertController,ActionSheetController,LoadingController,} from "ionic-angular";
import { FirebaseService } from "../../../services/firebase.service";
import { SharedServices } from "../../services/sharedservice";
import { CommonService,ToastMessageType,ToastPlacement,} from "../../../services/common.service";
import { Storage } from "@ionic/storage";
import { Apollo } from "apollo-angular";
import { HttpLink } from "apollo-angular-link-http";
import gql from "graphql-tag";
import { first } from "rxjs/operators";
import { GalleryModel, GalleryCategories } from './model/gallery.model';
/**
 * Generated class for the GalleryPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-gallery',
  templateUrl: 'gallery.html',
})
export class GalleryPage {

  gallery:GalleryModel[] =[];
  unmutated_gallery:GalleryModel[] = [];
  is_gallery_empty:boolean = false;
  parent_clubkey:string;
  activityList = [];
  selectedActivity:string;
  gallery_categories:GalleryCategories[];
  product_category:string
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private apollo: Apollo,
    private httpLink: HttpLink,
    public actionSheetCtrl: ActionSheetController,
    public popoverCtrl: PopoverController,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public fb: FirebaseService,
    public sharedservice: SharedServices) {
      this.storage.get("userObj").then((val) => {
        val = JSON.parse(val);
        if (val.$key != "") {
          this.parent_clubkey = val.UserInfo[0].ParentClubKey;
          this.getProductCategories();
        }
      });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GalleryPage');
  }

  doRefresh(refresher){
    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parent_clubkey = val.UserInfo[0].ParentClubKey;
        this.getGallery();
        refresher.complete();
      }
    });
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }
  //getting categories
  getProductCategories = () => {
    //this.commonService.showLoader("Please wait");
    const gallery_categories_input = {
      ParentClubKey:this.parent_clubkey,
      MemberKey:"",
      AppType:0, //Which app {0:Admin,1:Member,2:Applus}
      //ActionType:0 //as of now
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
          if(this.gallery_categories.length > 0){
            this.product_category = 'all';
            this.getGallery();
          } 
        },
        (err) => {
          //this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage("Categories fetch failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }
      );
  };




  //getting gallery
  getGallery = (type?: number) => {
    this.commonService.showLoader("Please wait");
    const gallery_input = {
      ParentClubKey:this.parent_clubkey,
      MemberKey:"",
      AppType:0, //Which app {0:Admin,1:Member,2:Applus}
      ActionType:0 //as of now
    }
    //parentClubId removes from res object as it's giving err
    //id is gallery_item id
    //product_id is category id
    //product_id 
    const galleryQuery = gql`
      query getAllGalleryItemsForAdmin($getGalleryInput: getProductVariantInput!) {
        getAllGalleryItemsForAdmin(getProducts: $getGalleryInput) {
          id
          productCategory{
            id
          }
          variant_type
          variant_size
          variant_color
          variant_price
          variant_description
          paymentType
          variant_shortname
          quantity
          images{
            id
            image_url
            image_sequence
          }
        }
      }
    `;
    this.apollo
      .query({
        query: galleryQuery,
        fetchPolicy: "no-cache",
        variables: { getGalleryInput: gallery_input},
      })
      .subscribe(
        ({ data }) => {
          console.log('gallery data' + data["getAllGalleryItemsForAdmin"]);
          this.commonService.hideLoader();
          this.gallery = data["getAllGalleryItemsForAdmin"] as GalleryModel[];
          //this.gallery = this.unmutated_gallery.filter(gallery_item => gallery_item.productCategory.id === this.product_category);
          this.unmutated_gallery = JSON.parse(JSON.stringify(this.gallery));
          
          this.is_gallery_empty = this.gallery.length > 0 ? false : true;
          console.log("gallery data" + JSON.stringify(this.gallery));
          if(this.gallery.length > 0 && this.product_category!= "all"){
            this.onChangeProductCategory();
          } else{
            this.commonService.toastMessage(`${this.gallery.length} gallery items fetched`,2500,ToastMessageType.Success,ToastPlacement.Bottom);
          }
          
        },
        (err) => {
          this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage("Gallery fetch failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }
      );
  };

  onChangeProductCategory(){
    if(this.product_category == "all"){
      this.gallery = this.unmutated_gallery;
    }else{
      this.gallery = this.unmutated_gallery.filter(gallery_item => gallery_item.productCategory.id === this.product_category);
    }
    this.commonService.toastMessage(`${this.gallery.length} gallery items fetched`,2500,ToastMessageType.Success,ToastPlacement.Bottom);
    this.is_gallery_empty = this.gallery.length > 0 ? false : true;
  }

  showActions(gallery_index:number) {
      const actionSheet = this.actionSheetCtrl.create({
      title:this.gallery[gallery_index].variant_shortname,
      cssClass: "action-sheets-basic-page",
      buttons: [
        // {
        //   text: "View",
        //   icon: "ios-eye",
        //   handler: () => {
        //     // this.navCtrl.push("Editchallenge", {
        //     //   challenge: ChallengeOrTempObj,
        //     //   ParentClubKey: this.parentClubKey,
        //     // });
        //   },
        // },
        {
          text: "Edit",
          icon: "ios-create",
          handler: () => {
            this.navCtrl.push("UpdateproductPage", {
              gallery_item: this.gallery[gallery_index],
              ParentClubKey: this.parent_clubkey,
            });
          },
        },
        {
          text: "Delete",
          icon: "ios-trash",
          handler: () => {
            this.deleteGalleyItemConfirm(gallery_index);
          },
        },
        {
          text: "Close",
          icon: "ios-close",
          role: "cancel",
          handler: () => {},
        },
      ],
    });
    actionSheet.present();
  }

  deleteGalleyItemConfirm(gallery_index:number) {
    let alert = this.alertCtrl.create({
      title: "Delete ",
      message:`Are you sure, You want to delete ${this.gallery[gallery_index].variant_shortname} ?`,
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          handler: () => {
            //console.log('Cancel clicked');
          },
        },
        {
          text: "Yes:Delete",
          handler: () => {
            this.deleteGalleryItem(gallery_index);
          },
        },
      ],
    });
    alert.present();
  }

  

  deleteGalleryItem(gallery_item_index) {
    const delete_item_input = {
      ParentClubKey:this.parent_clubkey,
      ProductId: this.gallery[gallery_item_index].id,
      AppType: 0, //Which app {0:Admin,1:Member,2:Applus}
      ActionType:1, // 1for delete, 2 for edit, 3 for hide gallery item
      transactionType:0
    }
    this.commonService.showLoader("Please wait...");
    this.apollo
      .mutate({
        mutation: gql`
          mutation modifyGalleryItem($gallery_modify_input: modifyProductVariantInput!) {
            modifyGalleryItem(modifyInput: $gallery_modify_input)
          }
        `,
        variables: { gallery_modify_input: delete_item_input },
      })
      .subscribe(
        ({ data }) => {
          this.commonService.hideLoader();
          this.commonService.toastMessage("item deleted successfully",2500,ToastMessageType.Success,ToastPlacement.Bottom);
          console.log("gallery data" + data["modifyProductVariantInput"]);
          //this.commonService.updateCategory("gallerylist");
          this.getGallery();
        },
        (err) => {
          this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage("item deletion failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }
      );
  }

  //Filter gallery
  FilterGallery(ev: any) {
    let val = ev.target.value;
    if (val && val.trim() != "") {
      this.gallery = this.unmutated_gallery.filter((gallery) => {
        if (gallery.variant_price != undefined) {
          if (gallery.variant_price.toLowerCase().indexOf(val.toLowerCase()) >-1) {
            return true;
          }
        }
        if (gallery.variant_shortname != undefined) {
          if (gallery.variant_shortname.toLowerCase().indexOf(val.toLowerCase()) >-1) {
            return true;
          }
        }
        // if (challenge.AgeGroup != undefined) {
        //   if (challenge.AgeGroup.indexOf(val.toLowerCase()) > -1) {
        //     return true;
        //   }
        // }
      });
    } else {
      this.onChangeProductCategory();
    }
  }

  //navigate to create gallery item page
  navigateCreateItem(){
    this.navCtrl.push("CreteproductPage");
  }

  


}


