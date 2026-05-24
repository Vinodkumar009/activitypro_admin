import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController,ActionSheetController,ToastController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
// import { Dashboard } from './../../dashboard/dashboard';

//import { Platform } from 'ionic-angular';

import { File } from '@ionic-native/file';
import { Camera, PictureSourceType, CameraOptions } from '@ionic-native/camera';
import {IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType } from '../../../services/common.service';

@IonicPage()
@Component({
    selector: 'addpromotion-page',
    templateUrl: 'addpromotion.html'
})

export class Type2AddPromotion {
    themeType: number;
    parentClubKey: string;
    menus: Array<{ DisplayTitle: string; 
        OriginalTitle:string;
        MobComponent: string;
        WebComponent: string; 
        MobIcon:string;
        WebIcon:string;
        MobLocalImage: string;
        MobCloudImage: string; 
        WebLocalImage: string;
        WebCloudImage:string;
        MobileAccess:boolean;
        WebAccess:boolean;
        Role: number;
        Type: number;
        Level: number }>;
    responseDetails: any;
    selectedClub: any;
    allClub = [];
    promotionObj = {
        PromotionTitle: '',
        StartDate: '',
        EndDate: '',
        Description: '',
        PromotionType: '',
        SlideShowSpeed: '',
        Sequence: 1,
        CreateDate: '',
        UpdatedDate: '',
      
    }
    imageArr = [];
    imageObj = {
        ImagePath: '',
        ImageToShow: true,
        ImageRedirectURL:'',
        Caption:'',
    };
    promotionKey: any;
    toppings: any;
    isSelectAll = false;
    isUnselectAll = false;
    loading: any;
    TitleUrl: string;
    constructor(public actionSheetCtrl: ActionSheetController,private camera: Camera, public loadingCtrl: LoadingController, storage: Storage,
        public navCtrl: NavController, 
        public sharedservice: SharedServices,
        public commonService: CommonService,
        public fb: FirebaseService, public popoverCtrl: PopoverController) {

        this.themeType = sharedservice.getThemeType();
        this.menus = sharedservice.getMenuList();



        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            for (let club of val.UserInfo)
                if (val.$key != "") {
                    this.parentClubKey = club.ParentClubKey;
                    this.getClubList();

                }
        })
    }



    presentPopover(myEvent) {
        let popover = this.popoverCtrl.create("PopoverPage");
        popover.present({
            ev: myEvent
        });
    }


    goToDashboardMenuPage() {
        this.navCtrl.setRoot("Dashboard");
    }

    getClubList() {
        this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
            if (data.length > 0) {
                this.allClub = data;
            }
        })
    }

   

    addImages() {
        this.imageArr.push(this.imageObj);
        this.imageObj = {
            ImagePath: '',
            ImageToShow: true,
            ImageRedirectURL:'',
            Caption:''
        };
    }

    selectAllToggole(){
        this.isSelectAll = !this.isSelectAll
        this.allClub.forEach(club => {
            if(this.isSelectAll){
                club.isSelect = true;
            }else{
                club.isSelect = false;
            }
              
          });
    }
  
    selectVenue(event) {
        
        this.allClub.forEach(club => {
          if (club.ClubName == event.ClubName) {
            club.isSelect = !club.isSelect
          } 
        });
    }
  

    checkDateForStartDate() {
        if (this.promotionObj.EndDate != "" && (new Date(this.promotionObj.EndDate).getTime() < new Date(this.promotionObj.StartDate).getTime())) {
            this.promotionObj.StartDate = "";
            this.promotionObj.EndDate = "";

            const message = "End Date must be greater than Start Date.Please Choose Again Start Date and End Date.";
            this.commonService.toastMessage(message,2500,ToastMessageType.Error);
        }
    }

    checkDateForEndDate() {
        if (new Date(this.promotionObj.StartDate).getTime() > new Date(this.promotionObj.EndDate).getTime()) {
            this.promotionObj.EndDate = "";
            let message = "End Date must be greater than Start Date.Please Choose Again.";
            this.commonService.toastMessage(message,2500,ToastMessageType.Error);
        }
    }
    SelectProfImg(index) {
        const actionSheet = this.actionSheetCtrl.create({
          //header: 'Choose File',
          buttons: [{
            text: 'Camera',
            role: 'destructive',
            icon: 'ios-camera',
            handler: () => {
              console.log('clicked');
              this.CaptureImage(this.camera.PictureSourceType.CAMERA,index );
            }
          }, {
            text: 'Gallery',
            icon: 'ios-image',
            handler: () => {
              console.log('Share clicked');
             this.CaptureImage(this.camera.PictureSourceType.PHOTOLIBRARY,index);
            }
          }, {
            text: 'Cancel',
            icon: 'close',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          }
          ]
        });
        actionSheet.present();
      }
      async CaptureImage(sourceType: PictureSourceType, index:any) {
        const options: CameraOptions = {
          quality: 60,
          sourceType: sourceType,
          destinationType: this.camera.DestinationType.DATA_URL,
          encodingType: this.camera.EncodingType.JPEG,
          mediaType: this.camera.MediaType.PICTURE
        }
        try {
          this.camera.getPicture(options).then((imageData)=>{
            this.loading = this.loadingCtrl.create({
                content: 'Profile updating...'
             });
            this.loading.present();
            const url = imageData.startsWith('data:image/jpeg;base64,') ? imageData : `data:image/jpeg;base64,${imageData}`;
            //let url = "data:image/jpeg;base64," + data;
            let imgObj = {};
            //console.log(2)
            imgObj["url"] = url;
            imgObj["upload_type"] = 'promotion'
            imgObj["Parentclub_name"] =  this.parentClubKey;
           
              this.fb.uploadPhoto(imgObj).then((url)=>{
                this.loading.dismiss();
                this.updateProgImg(url, index);
                //console.log(2)
              }).catch((err)=>{
                this.loading.dismiss();
                let message = "Uploading failed";
                this.commonService.toastMessage(message,2500,ToastMessageType.Error);
              })
           
           // }
        //  , 20000);
          });
        } catch (e) {
          console.log(e.message);
          let message = "Uploading failed";
          this.commonService.toastMessage(message,2500,ToastMessageType.Error);
        }
      }
    
      // updating prof image
    updateProgImg(url:any, index:any){
      
      this.imageArr[index].ImagePath = url;
       let message = "Upload Success";
       this.commonService.toastMessage(message,2500,ToastMessageType.Success);
    }

    addPromotion() {
        
        if (this.validatePromotion()) {

            for (let index = 0; index < this.allClub.length; index++) {
                if (this.allClub[index].isSelect != undefined) {
                    let imageSaveObj = { ImagePath: '', ImageToShow: false ,ImageRedirectURL:''};
                    this.promotionObj.StartDate = (new Date(this.promotionObj.StartDate)).toString();
                    this.promotionObj.EndDate = (new Date(this.promotionObj.EndDate)).toString();
                    this.promotionObj.PromotionType = 'LongScroll';
                    this.promotionObj.CreateDate = ((new Date()).getTime()).toString();
                    this.promotionObj.UpdatedDate = ((new Date()).getTime()).toString();
                    this.promotionKey = this.fb.saveReturningKey("/Promotion/Type2/" + this.parentClubKey + "/" + this.allClub[index].$key + "/", this.promotionObj);

                    for (let i = 0; i < this.imageArr.length; i++) {
                        imageSaveObj.ImagePath = this.imageArr[i].ImagePath;
                        imageSaveObj.ImageToShow = this.imageArr[i].ImageToShow;
                        imageSaveObj.ImageRedirectURL = this.imageArr[i].ImageRedirectURL;
                        this.fb.saveReturningKey("/Promotion/Type2/" + this.parentClubKey + "/" + this.allClub[index].$key + "/" + this.promotionKey + "/Images/", imageSaveObj);
                    }
                }
            }

            // let imageSaveObj = { ImagePath: '', ImageToShow: false };
            // this.promotionKey = this.fb.saveReturningKey("/Promotion/Type2/" + this.parentClubKey + "/" + this.selectedClub + "/", this.promotionObj);

            // for (let i = 0; i < this.imageArr.length; i++) {
            //     imageSaveObj.ImagePath = this.imageArr[i].ImagePath;
            //     imageSaveObj.ImageToShow = this.imageArr[i].ImageToShow;
            //     this.fb.saveReturningKey("/Promotion/Type2/" + this.parentClubKey + "/" + this.selectedClub + "/" + this.promotionKey + "/Images/", imageSaveObj);
            // }
            if (this.promotionKey != undefined) {
                let message = "Successfully saved.";
                this.commonService.toastMessage(message,2500,ToastMessageType.Success);
                this.navCtrl.pop();
            }
        }
    }

    validatePromotion(): boolean {
        let flag = false;
        for (let i = 0; i < this.allClub.length; i++) {
            if (this.allClub[i].isSelect == true) {
                flag = true;
                break;
            }
        }
        if (flag) {
            if (this.promotionObj.PromotionTitle == "" || this.promotionObj.PromotionTitle == undefined) {
                let message = "Please enter promotion name.";
                this.commonService.toastMessage(message,2500,ToastMessageType.Error);
                return false;
            }
            else if (this.promotionObj.StartDate == "" || this.promotionObj.StartDate == undefined) {
                let message = "Please select start date.";
                this.commonService.toastMessage(message,2500,ToastMessageType.Error);
                return false;
            }
            else if (this.promotionObj.EndDate == "" || this.promotionObj.EndDate == undefined) {
                let message = "Please select end date.";
                this.commonService.toastMessage(message,2500,ToastMessageType.Error);
                return false;
            }

          
            else if (this.promotionObj.EndDate == "" || this.promotionObj.Sequence == undefined) {
                let message = "Please enter sequence.";
                this.commonService.toastMessage(message,2500,ToastMessageType.Error);
                return false;
            }
       

            else if (this.imageArr.length == 0) {
                let message = "Please add images";
                this.commonService.toastMessage(message,2500,ToastMessageType.Error);
                return false;
            }

     
            if (this.promotionObj.StartDate != "" && this.promotionObj.EndDate != "") {
                if (new Date(this.promotionObj.StartDate).getTime() > new Date(this.promotionObj.EndDate).getTime()) {
                    let message = "End Date must be greater than Start Date.";
                    this.commonService.toastMessage(message,2500,ToastMessageType.Error);
                    return false;
                }
            }

        }
        else if (!flag) {
            let message = "Please select a venue.";
            this.commonService.toastMessage(message,2500,ToastMessageType.Error);
            return false;
        }
        for (let i = 0; i < this.imageArr.length; i++) {
            if (this.imageArr[i].ImageToShow == true) {
                if (this.imageArr[i].ImagePath == "") {
                    let message = "Please upload an image.";
                    this.commonService.toastMessage(message,2500,ToastMessageType.Error);
                    return false;
                }
            }
        }
        return true;
    }
    

    cancelPromotion() {
        this.navCtrl.pop();
    }

    sequenceHint(){
        this.commonService.toastMessage('In case of multiple active promotions, lower sequence number will appear first in the member app',2500,ToastMessageType.Info);
    }
    removeImage(index:number,arr:Array<any>){
        arr.splice(index, 1)
        if(this.imageArr[index] != undefined){
            this.fb.deletePhoto(this.imageArr[index],'promotion')
        }
        
    }

}
