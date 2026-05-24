import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonService, ToastMessageType } from '../../../services/common.service';
import { Storage } from '@ionic/storage';
import { ActionSheetController } from 'ionic-angular'
import moment from 'moment';
import { validateLocaleAndSetLanguage } from 'typescript';
import { m } from '@angular/core/src/render3';
/**
 * Generated class for the BookingsetupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-floodlightlist',
  templateUrl: 'floodlightlist.html',
})
export class FloodLightListPage {
 
  CourtType = "Outdoor";
  floodlight = {
    Title: '',
    CourtType:'',
    IsActive: true,
    IsEnable: true,
    CreationDate: 0,
    StartDate:'',
    EndDate:'',
    MornStartTime: '',
    MornEndTime: '',
    EvenStartTime: '',
    EvenEndTime: '',
    FirstSixtyMemberFloodLightFess:12,
    FirstSixtyNonMemberFloodLightFess:15,
    AfterSixtyMemberFloodLightFess:8,
    AfterSixtyNonMemberFloodLightFess:10,
  }
  floodLightList = []
  parentClubKey: any;

  selectedActivity: string;
  allClub: any[];
  selectedClubKey: any;
  allActivityArr: any[];
  outdoorList = []
  indorrList = []
  constructor(public actionSheetCtrl: ActionSheetController,public toastCtrl: ToastController,public navCtrl: NavController, public navParams: NavParams, public fb: FirebaseService, public commonService: CommonService, public storage: Storage) {
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      for (let club of val.UserInfo)
        if (val.$key != "") {
          this.parentClubKey = club.ParentClubKey;
          //this.floodLightList.push(this.floodlight)   
          this.getAllClub();
        }
    })

    
  }

  ionViewWillEnter(){

  }

  
getAllClub() {
  this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data4) => {
    this.allClub = []
    if (data4.length > 0) {
      this.allClub = data4;
      this.selectedClubKey = this.allClub[0].$key;
      this.getAllActivity();
    }
  })
  }
  
  getAllActivity() {
    this.fb.getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClubKey + "/").subscribe((data) => {
        this.allActivityArr = [];
        if (data.length > 0) {
            this.allActivityArr = data;
            this.selectedActivity = data[0].$key;
            this.getFloodLight()
        }
    })
}


  getFloodLight(){
    this.fb.getAllWithQuery("StandardCode/FloodLight/"+this.parentClubKey+"/"+this.selectedClubKey+"/"+this.selectedActivity,  { orderByChild: "IsActive", equalTo: true }).subscribe(data =>{
      this.floodLightList = []
      if(data.length > 0){

        this.floodLightList = data
  
      }
    })
  }

  gotopage(){
    this.navCtrl.push('FloodLightPage')
  }
  gotoEditPage(flood){
    this.navCtrl.push('FloodLightPage', {floodLight:flood, clubkey:this.selectedClubKey, activity: this.selectedActivity})
  }

}
