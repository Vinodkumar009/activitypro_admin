import { Component } from '@angular/core';

import { AlertController, IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';
import { FirebaseService } from '../../../../services/firebase.service';
import { SharedServices } from '../../../services/sharedservice';
import { Storage } from '@ionic/storage';
import { CommonService } from '../../../../services/common.service';
/**
 * Generated class for the WorldsportPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-worldsport',
  templateUrl: 'worldsport.html',
})
export class WorldsportPage {

  worldsport = {
    Name: '',
    DisplayName: '',
    URL: '',
    CreateDate: '',
    Description: '',
    RSSURL:'',
    BackgroundImage: '',
    ActivityKey: '',
    IsActive: true
  }
  parentClubKey: any;
  allClub: any[];
  selectedActivity = "";
  activity = [];
  activityKey: any;
  constructor(public alertCtrl: AlertController, storage: Storage,public commonService:CommonService, public navParam: NavParams, public fb: FirebaseService, public navCtrl: NavController, public sharedservice: SharedServices, public popoverCtrl: PopoverController) {
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        let URLdata = this.navParam.get('URLdata')
        this.activityKey = this.navParam.get('activity')
        this.selectedActivity = this.activityKey
        if (URLdata) {
          this.worldsport = URLdata
        }
        this.getAllClub()
      }

    })
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

        if (!this.activityKey) {
          this.selectedActivity = this.activity[0].ActivityKey;
        }


        x.unsubscribe()
      }
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad WorldsportPage');
  }

  save() {
    if (this.validate() && !this.activityKey) {
      this.worldsport.CreateDate = new Date().toISOString()
      this.worldsport.ActivityKey = this.selectedActivity
      this.fb.saveReturningKey(`StandardCode/NewsNPhotosUrl/${this.parentClubKey}/`, this.worldsport)
      this.commonService.toastMessage('Added successfully', 2000)
      this.navCtrl.pop()
    } else if (this.validate() && this.activityKey) {
      let key = this.worldsport['$key']
      delete this.worldsport['$key']
      this.worldsport.ActivityKey = this.selectedActivity
      this.fb.update(key, `StandardCode/NewsNPhotosUrl/${this.parentClubKey}/`, this.worldsport)
      this.commonService.toastMessage('Updated successfully', 2000)
      this.navCtrl.pop()
    }
  }
  validate() {
    if (!this.worldsport.Name) {
      return false
    }
    if (!this.worldsport.URL) {
      return false
    }

    return true
  }

}
