import { Component } from '@angular/core';
import { ActionSheetController, AlertController, IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { CommonService } from '../../../../../services/common.service';
import { FirebaseService } from '../../../../../services/firebase.service';
import { SharedServices } from '../../../../services/sharedservice';
import { File } from '@ionic-native/file';
import { Camera, PictureSourceType, CameraOptions } from '@ionic-native/camera';
/**
 * Generated class for the TipsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-createtip',
  templateUrl: 'createtip.html',
})
export class Createtip {
  parentClubKey: any;
  allClub=[];
  activity=[];
  selectedActivity: string;
  tips = {
    Title : '',
    DisplayTitle:'',
    Type : '',
    Description: '',
    ImageUrl: '',
    CreateDate: '',
    IsActive: true,
    IsEnable: true
  }
  isUpdate = false 
  tipList = []
  
  constructor(public alertCtrl: AlertController, public actionSheetCtrl: ActionSheetController,
     private camera: Camera, public navParam: NavParams,
     storage: Storage,public commonService:CommonService,
     public fb: FirebaseService, public navCtrl: NavController,
     public sharedservice: SharedServices, public popoverCtrl: PopoverController) {
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        let tips = this.navParam.get('tip')

        if (tips){
          this.isUpdate = true
          this.tips = tips
        }
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        this.getAllClub()
      }
  
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TipsPage');
  }

  getAllClub() {
    let x = this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data4) => {
      if (data4.length > 0) {
        this.allClub = []
        this.allClub = data4;


        this.allClub.forEach(club => {
    
          this.getAllActivity(club.$key);
        })
        x.unsubscribe()
      }
    })
  }

  getAllActivity(selectedClubKey) {
    let x = this.fb.getAll("/Activity/" + this.parentClubKey + "/" + selectedClubKey + "/").subscribe((data) => {

      this.selectedActivity = "";
      if (data.length > 0) {
        data.forEach(activity => {

           
          if (activity.IsActive) {
            let obj = {
              ActivityName: activity.ActivityName,
              ActivityCode: activity.ActivityCode,
              ActivityKey: activity.$key,
              IsShowCat: false,
              IsExistActivityCategory: activity.IsExistActivityCategory,
              ActivityImageURL: activity.ActivityImageURL
            }
            let activityarr: any = this.activity
            const isalreadypresent = activityarr.some(act => act.ActivityName == obj.ActivityName)
            if (!isalreadypresent) {
              this.activity.push(obj)
            }
          }
        })
    
        this.selectedActivity = this.activity[0].ActivityKey;
        
        x.unsubscribe()
      }
    });
  }



  async save(){
    //console.log(this.tips)
    if(this.isUpdate && this.validate()){
      const url = await this.uploadImageFromSave()
      let key = this.tips['$key']
      delete this.tips['$key']
      this.fb.update(key, `ApKids/Tips/${this.parentClubKey}/${this.selectedActivity}`, this.tips)
      this.commonService.toastMessage('Updated successfully', 2000)
       this.navCtrl.pop()
    }
    if(!this.isUpdate && this.validate()){
      const url = await this.uploadImageFromSave()
      this.tips.CreateDate = new Date().toISOString()
      this.fb.saveReturningKey(`ApKids/Tips/${this.parentClubKey}/${this.selectedActivity}`, this.tips)
      this.commonService.toastMessage('Added successfully', 2000)
       this.navCtrl.pop()
    }
    // this.tips.CreateDate = new Date().toISOString()
    // this.fb.saveReturningKey(`StandardCode/ApKids/Tips/${this.selectedActivity}/`, this.tips)
    // this.commonService.toastMessage('Added successfully', 2000)
  }
  SelectProfImg() {
    const actionSheet = this.actionSheetCtrl.create({
      //header: 'Choose File',
      buttons: [{
        text: 'Camera',
        role: 'destructive',
        icon: 'ios-camera',
        handler: () => {
          console.log('clicked');
          const Url = this.CaptureImage(this.camera.PictureSourceType.CAMERA);
        }
      }, {
        text: 'Gallery',
        icon: 'ios-image',
        handler: () => {
          console.log('Share clicked');
          const Url = this.CaptureImage(this.camera.PictureSourceType.PHOTOLIBRARY);
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
  async CaptureImage(sourceType: PictureSourceType) {
    const options: CameraOptions = {
      quality: 60,
      sourceType: sourceType,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }
    try {
      this.camera.getPicture(options).then((data) => {

        this.tips.ImageUrl = "data:image/jpeg;base64," + data;
        console.log(1)
        return Promise.resolve();

      });
    } catch (e) {
      console.log(e.message);
      let message = "Uploading failed";
      this.commonService.toastMessage(message, 2000);
    }
  }

  async uploadImageFromSave(){
    return new Promise((res, rej)=>{
    
        if (this.tips.ImageUrl != undefined) {
          let imgObj = {};
          console.log(2)
          imgObj["url"] = this.tips.ImageUrl;
          imgObj["upload_type"] = 'tips';
          imgObj["ImageTitle"] = this.tips.Title;
          imgObj["club_name"] = this.parentClubKey;
  
          this.fb.uploadPhoto(imgObj).then((url:any) => {
  
            this.tips.ImageUrl = url
            console.log(2)
            res(url)
          }).catch((err) => {
  
            let message = "Error in uploading photo";
            this.commonService.toastMessage(message, 2000);
            rej(err)
          })
        }else{
          rej("fail")
        }

    })
  }

  

  validate(){
    if(!this.tips.Title)
      return false
    if(!this.tips.DisplayTitle)
      return false
    // if(!this.tips.Type)
    //   return false
    // if(!this.tips.ImageUrl)
    //   return false
    if(!this.tips.Description)
      return false
    return true
  }

}
