// import { Dashboard } from '../../dashboard/dashboard';
import { FirebaseService } from '../../../services/firebase.service';
import { Component } from '@angular/core';
import {NavParams, NavController,  PopoverController,  LoadingController} from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { Storage } from '@ionic/storage';
// import { Type2ChoiceProperty } from './choiceproperty';


import {IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'memberlistshow-page',
  templateUrl: 'memberlistshow.html'
})

export class Type2MemberlistShow {
  clubName="";
  themeType: number;
  loading: any;
  coachKey: any;
  parentClubKey: any;

  obj = {
    Message: ''
  }
  parentMembersArr = [];
  totalMembersArr = [];
  constructor(public loadingCtrl: LoadingController, storage: Storage, public fb: FirebaseService, public navCtrl: NavController, public sharedservice: SharedServices, public popoverCtrl: PopoverController,public navParams: NavParams) {
    this.obj.Message = "Paid by cash to the coach on " + new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    // this.loading.present();
    this.themeType = sharedservice.getThemeType();
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        
      }
      // this.loading.dismiss().catch(() => { });
    })
this.clubName = navParams.get('ClubName');
    this.parentMembersArr = navParams.get('parentMembers');
    this.totalMembersArr = navParams.get('totalMembers');
  }
  cancel() {
    this.navCtrl.pop();
  }
  pay() {

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

  convertFbObjectToArray(obj: Object): Array<any> {
    let data: Array<any> = [];
    for (let key in obj) {
      let objData: Object = {};
      objData = obj[key];
      objData["Key"] = key;
      data.push(objData);
    }
    return data;
  }

  goToSendEmailpage(){
      if(this.parentMembersArr != undefined){
          this.navCtrl.push("Type2ChoiceProperty",{parentMembersArr:this.parentMembersArr,ClubName:this.clubName});
      }
      else if(this.totalMembersArr != undefined){
          this.navCtrl.push("Type2ChoiceProperty",{totalMembersArr:this.totalMembersArr,ClubName:this.clubName});
      }
      
  }



}




