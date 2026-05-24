import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController,ActionSheetController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonService, ToastPlacement, ToastMessageType } from '../../../services/common.service';
import { Camera, PictureSourceType, CameraOptions } from '@ionic-native/camera';
/**
 * Generated class for the AppimagePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-appimage',
  templateUrl: 'appimage.html',
})
export class Appimage {
  loading: any;
  imgObj={};
  ParentClubKey:string = "";
  SetupObj= {LandingPageImageURL:""};
  AppName:string = "";
  constructor(public navCtrl: NavController, public navParams: NavParams, public loadingCtrl: LoadingController, public actionSheetCtrl: ActionSheetController, public storage: Storage,public fb: FirebaseService,
    private camera: Camera, public commonService: CommonService,) {
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      this.ParentClubKey = val.UserInfo[0].ParentClubKey;
      this.AppName = val.Name.split(" ").join(""); 
      console.log(this.AppName);
      this.getParentClbDets();
    })
      
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AppimagePage');
  }

  getParentClbDets() {
    this.fb.getAllWithQuery("ParentClub/Type2/", { orderByKey: true, equalTo: this.ParentClubKey }).subscribe((data) => {
      console.log(data[0]);
      if(data!=undefined){ 
        this.SetupObj.LandingPageImageURL = data[0]["LandingPageImageURL"];
      }
    })
  }

//Uploading Image By Vinod Starts Here
async SelectProfImg() {
  const actionSheet = await this.actionSheetCtrl.create({
    //header: 'Choose File',
    buttons: [{
      text: 'Camera',
      role: 'destructive',
      icon: 'ios-camera',
      handler: () => {
        //console.log('clicked');
        this.CaptureImage(this.camera.PictureSourceType.CAMERA);
      }
    }, {
      text: 'Gallery',
      icon: 'ios-image',
      handler: () => {
        //console.log('Share clicked');
        this.CaptureImage(this.camera.PictureSourceType.PHOTOLIBRARY);
      }
    }, {
      text: 'Cancel',
      icon: 'close',
      role: 'cancel',
      handler: () => {
       //console.log('Cancel clicked');
      }
    }
    ]
  });
  await actionSheet.present();
}
async CaptureImage(sourceType: PictureSourceType) {
  const options: CameraOptions = {
    quality: 80,
    sourceType: sourceType,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    correctOrientation: true,
  }
  try {
    this.camera.getPicture(options).then((encode_img)=>{
      let url = encode_img.startsWith('data:image/jpeg;base64,') ? encode_img: `data:image/jpeg;base64,${encode_img}`;
      this.SetupObj.LandingPageImageURL = url;
      this.imgObj = {};
      this.imgObj["url"] = url;
      this.imgObj["upload_type"] = "applandingimage",
      this.imgObj["app_name"] = this.AppName;
      // imgObj["club_name"] = item.ParentClubKey;
      console.log(this.imgObj);
    });
  } catch (e) {
    console.log(e.message);
    let message = "Image update failed";
    this.commonService.toastMessage(message,2500,ToastMessageType.Error);
  }
}

UploadImage(){
  try{
    this.loading = this.loadingCtrl.create({
      content: 'Image updating...'
    });
   this.loading.present();
   this.fb.uploadPhoto(this.imgObj).then((url)=>{
    console.log(`url:${url}`);
    this.loading.dismiss();
    this.UpdateConfig(url);
  }).catch((err)=>{
    this.loading.dismiss();
    let message = "Image update failed";
    this.commonService.toastMessage(message,2500,ToastMessageType.Error);
  })

  }catch(err){

  }
}
  //updating  theme config
  UpdateConfig(imgUrl){
    this.fb.update(this.ParentClubKey,`ParentClub/Type2/`,{LandingPageImageURL:imgUrl}).then((data)=>{
      this.commonService.toastMessage("Updated successfully",2500,ToastMessageType.Success);
    }).catch((err)=>{
      this.commonService.toastMessage("Updated successfully",2500,ToastMessageType.Error);
    })
  }

}
