import { Component } from '@angular/core';
import { ActionSheetController, AlertController, IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
import { FirebaseService } from '../../../services/firebase.service';
import { SharedServices } from '../../services/sharedservice';
import { Storage } from '@ionic/storage';
/**
 * Generated class for the WorldsportlistPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-worldsportlist',
  templateUrl: 'worldsportlist.html',
})
export class WorldsportlistPage {
  parentClubKey: any;
  allClub: any;
  selectedActivity: string;
  activity = [];
  urlList = [];

  constructor(public alertCtrl: AlertController, public actionSheetCtrl: ActionSheetController, storage: Storage,public commonService:CommonService, public fb: FirebaseService, public navCtrl: NavController, public sharedservice: SharedServices, public popoverCtrl: PopoverController) {
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        this.getAllClub()
      }

    })
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad WorldsportlistPage');
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

  gotoedit(url){
    this.navCtrl.push("WorldsportPage", {URLdata:url, activity:this.selectedActivity})
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
        this.getdata()
        x.unsubscribe()
      }
    });
  }
  getdata() {
    this.fb.getAllWithQuery(`StandardCode/NewsNPhotosUrl/${this.parentClubKey}/`, {orderByChild:"IsActive", equalTo:true}).subscribe(data => {

      this.urlList = data.filter(urls => urls.ActivityKey == this.selectedActivity)
    })
  }

  action(data){
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Edit',
          handler: () => {
           this.gotoedit(data)
          }
        },
        {
          text: 'Delete',
          handler: () => {
            let key = data.$key
            delete data.$key
            this.fb.update(key, `StandardCode/NewsNPhotosUrl/${this.parentClubKey}/`, {IsActive:false})
            this.getAllClub()
          }
        }
      ]
    })
    actionSheet.present()
  }
  gotoworldsport(){
    this.navCtrl.push("WorldsportPage")
  }

}
