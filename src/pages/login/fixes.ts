import { MenuController } from 'ionic-angular';
// import { Type2Member } from '../type2/member/member';
import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NavController, Events, IonicPage } from 'ionic-angular';
import { SharedServices } from '../services/sharedservice';
// import { Dashboard } from '../dashboard/dashboard';
import { FirebaseService } from '../../services/firebase.service';
import { LoadingController, ToastController } from 'ionic-angular';
import { CommonService } from '../../services/common.service';

@IonicPage()
@Component({
  selector: 'fixes-page',
  templateUrl: 'fixes.html'
})

export class Fixpage {
  memberlist = [];
  constructor(public commonService: CommonService, public loadingCtrl: LoadingController, public menuCtrl: MenuController, public toastCtrl: ToastController, public events: Events, public navCtrl: NavController, public fb: FirebaseService, public sharedservice: SharedServices, public storage: Storage) {

  }



  //fix1 
  //  show member list and add email id in family member
  getFix1Result() {
    let path = "";
    let clubKey = "";
    let ParentClubKey = "";
    path = "-Kd2fSCGOw6K3mvzu-yH/-Kd6tPkQY-q2dapvx8T7/";
    this.fb.getAllWithQuery("Member/" + path, { orderByChild: 'EmailID', equalTo: "" }).subscribe((response) => {
      this.memberlist = response;
      for (let i = 0; i < this.memberlist.length; i++) {
        if (this.memberlist[i].IsChild) {
          this.fb.getAllWithQuery("Member/" + path, { orderByKey: true, equalTo: this.memberlist[i].ParentKey }).subscribe((response2) => {
            console.log("response2");
            console.log(response2);
            if (response2.length > 0) {
              // this.fb.update(this.memberlist[i].$key, "Member/" + path, { EmailID: response2[0].EmailID });
            }
          });
        }
      }
    });
  }


  getFix2Result() {
    let path = "";
    let clubKey = "";
    let ParentClubKey = "";
  
    
    let memberKey = "-L25SXr6N1hZQp9Xooy3";
    let schoolSessionKey = "-L25eYo9jxv4v2O8cjUA";
    path = "Member/-Kr0osnOAVF562sLTI14/" + memberKey + "/SchoolSession";
    let isAllow = false;
    this.fb.getAllWithQuery(path, { orderByKey: 'true', equalTo: schoolSessionKey }).subscribe((response) => {
      console.log(response);
      if (isAllow) {
        if (response.length > 0) {
          this.fb.update(schoolSessionKey, "SchoolMember/-Kr0osnOAVF562sLTI14/" + memberKey + "/SchoolSession/", {
            AmountDue: response[0].AmountDue,
            AmountPaid: response[0].AmountPaid,
            AmountPayStatus: response[0].AmountPayStatus,
            PaidBy: response[0].PaidBy,
            TransactionDate: response[0].TransactionDate,
            TransactionNo: response[0].TransactionNo
          });
        }
      }
    });
  }
}

