import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController, ToastController, AlertController } from "ionic-angular";
import { SharedServices } from '../../services/sharedservice';
import { Platform } from 'ionic-angular';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import { IonicPage } from 'ionic-angular';
import { NavParams, ViewController, ActionSheetController } from 'ionic-angular';
import { CommonService } from "../../../services/common.service";
@IonicPage()
@Component({
  selector: 'holidaycampmembers-page',
  templateUrl: 'holidaycampmembers.html'
})

export class HolidayCampMembers {
  // showSession: boolean = false;
  // showMember: boolean = true;
  themeType: any;
  // parentClubKey = "";
  campDetails: any;
  // sessionList = [];
  memberList = [];
  // myIndex = -1;
  // totalDuration = 0;
  // showBlock = false;

  constructor(public actionSheetCtrl: ActionSheetController, public commonService: CommonService, public viewCtrl: ViewController, public fb: FirebaseService, private toastCtrl: ToastController, public loadingCtrl: LoadingController, public alertCtrl: AlertController, private navParams: NavParams, public navCtrl: NavController, storage: Storage, public sharedservice: SharedServices, platform: Platform, public popoverCtrl: PopoverController) {

    this.themeType = sharedservice.getThemeType();
    this.campDetails = navParams.get('CampDetails');
    if (this.campDetails.Member != undefined) {
      let member = this.commonService.convertFbObjectToArray(this.campDetails.Member);
      for (let i = 0; i < member.length; i++) {
        if (member[i].IsActive) {
         for(let j = 0; j < member[i].Session.length; j++){
            if(member[i].Session[j].IsActive){
              this.memberList.push(member[i]);
              break;
            }
         } 
          
        }
      }
      console.log(this.memberList);
      if (this.memberList && this.memberList.length > 0) {
        this.memberList = this.commonService.sortingObjects(this.memberList, "FirstName");
      }
    }
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

  showToast(m: string, dur: number) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: dur,
      position: 'bottom'
    });
    toast.present();
  }



  presentActionSheet(member) {
    let actionSheet;
    if (member.AmountPayStatus == "Due") {
      actionSheet = this.actionSheetCtrl.create({
        // title: 'Modify your album',
        buttons: [
          {
            text: 'Update Payment',
            role: 'destructive',
            handler: () => {
              this.goTopaymentUpdate(member);
            }
          }, {
            text: 'Remove Member',
            handler: () => {
              this.removeMember(member);
            }
          }, {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {

            }
          }
        ]
      });
    } else {
      actionSheet = this.actionSheetCtrl.create({

        buttons: [
          {
            text: 'Update Payment',
            handler: () => {

              this.goTopaymentUpdate(member);

            }
          }, {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          }
        ]
      });
    }
    actionSheet.present();
  }

  goTopaymentUpdate(member) {
    this.navCtrl.push("UpdateHolidayCampPaymentDetails", { SelectedMember: member, CampDetails: this.campDetails })
  }
  removeMember(member) {
    let confirm = this.alertCtrl.create({
      subTitle: 'Remove Member',
      message: 'Are you sure you want to remove the member?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.fb.update(member.Key, "HolidayCamp/" + this.campDetails.ParentClubKey + "/" + this.campDetails.$key + "/Member/", { IsActive: false });

            if (member.SignedUpType == 1) {
              this.fb.update(this.campDetails.$key, "Member/" + member.ParentClubKey + "/" + member.ClubKey + "/" + member.Key + "/HolidayCamp/", { IsActive: false });
            } else if (member.SignedUpType == 2) {
              this.fb.update(this.campDetails.$key, "SchoolMember/" + member.ParentClubKey + "/" + member.Key + "/HolidayCamp/", { IsActive: false });
            } else if (member.SignedUpType == 3) {
              this.fb.update(this.campDetails.$key, "HolidayCampMember/" + member.ParentClubKey + "/" + member.Key + "/HolidayCamp/", { IsActive: false });
            }
            
            this.navCtrl.pop();
            this.showToast("Member removed successfully.", 5000);

          }
        }
      ]
    });
    confirm.present();
  }
  // this.fb.update(this.selectedMemberList[i].Key, "HolidayCamp/" + this.holidayCamp.ParentClubKey + "/" + this.holidayCamp.Key + "/Member/", this.selectedMemberList[i]);
  // this.fb.update(this.holidayCamp.Key, "Member/" + this.selectedMemberList[i].ParentClubKey + "/" + this.selectedMemberList[i].ClubKey + "/" + this.selectedMemberList[i].Key + "/HolidayCamp/", this.holidayCamp);

}

