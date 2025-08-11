import { SharedServices } from './../../services/sharedservice';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController, AlertController, ToastController } from 'ionic-angular';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import * as $ from 'jquery';

/**
 * Generated class for the EmailforholidaycampandschoolsessionmemberPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-emailforholidaycampandschoolsessionmember',
  templateUrl: 'emailforholidaycampandschoolsessionmember.html',
})
export class EmailforholidaycampandschoolsessionmemberPage {

  selectedParentClubKey: string = "";
  memberList = [];
  emailObj = {
    Message: "",
    Subject: ""
  }
  numberOfPeople = "0 recipients";
  parentClubDetails: any;
  memberType = "";
  constructor(public navCtrl: NavController, public navParams: NavParams, private storage: Storage, public fb: FirebaseService, public popoverCtrl: PopoverController, public alertCtrl: AlertController, private toastCtrl: ToastController, public sharedservice: SharedServices, ) {
    this.memberType = this.navParams.get("MemberType");
    if (this.memberType == "Holidaycampmember") {
      this.memberType = "HolidayCampMember"
    } else {
      this.memberType = "SchoolMember";
    }


  }

  ionViewDidLoad() {
    this.emailObj.Message = "Dear All,";
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      for (let user of val.UserInfo) {
        if (val.$key != "") {
          this.selectedParentClubKey = user.ParentClubKey;

          //get holiday camp member
          this.getMemberList();
          //get parentclub details
          this.getParentclubDetails();
        }
      }
    }).catch(error => {

    });
  }






  dismiss() {
    this.navCtrl.pop();
  }
  //*********************************** */
  //get all the holiday camp member
  //*--------------------
  getMemberList() {
    this.fb.getAllWithQuery("/" + this.memberType + "/" + this.selectedParentClubKey, { orderByChild: 'IsChild', equalTo: false }).subscribe((data) => {
      this.memberList = [];
      for (let i = 0; i < data.length; i++) {
        if (data[i].IsActive && data[i].IsEnable) {
          this.memberList.push(data[i]);
        }
      }
      this.numberOfPeople = this.memberList.length + " recipients";
    });
  }

  getParentclubDetails() {
    this.fb.getAllWithQuery("ParentClub/Type2/", { orderByKey: true, equalTo: this.selectedParentClubKey }).subscribe((data) => {

      if (data.length > 0) {
        this.parentClubDetails = data[0];
        this.emailObj.Message += "\n\n\n\nKind Regards,\n" + this.parentClubDetails.ParentClubName + "\n" + "Ph:" + this.parentClubDetails.ContactPhone;
        this.emailObj.Subject = "";
      }
    });
  }




  sendEmails() {
    try {
      let notificationDetailsObjForMember = {
        ParentClubKey: this.selectedParentClubKey,
        Message: this.emailObj.Message,
        Subject: this.emailObj.Subject,
        SendBy: "ClubAdmin",
        ComposeOn: new Date().getTime(),
        Purpose: "Member Email",
        MemberKey: "",
        MemberName: "",
        MemberEmailId: "",
        Status: "Unread",
        Type: ""
      };
      let notificationDetailsObjForAdmin = {
        ParentClubKey: this.selectedParentClubKey,
        Message: this.emailObj.Message,
        Subject: this.emailObj.Subject,
        SendBy: "ClubAdmin",
        Type: "",
        ComposeOn: new Date().getTime(),
        Purpose: "Session Email",
        Member: []
      };
      let notificationDetailsObjForMemberInner = {
        MemberKey: "",
        MemberName: "",
        MemberEmailId: "",
        Status: "Unread"
      }
      let emailFormembers = {
        Members: [],
        ImagePath: this.parentClubDetails.ParentClubAppIconURL,
        FromEmail: "activitypro17@gmail.com",
        FromName: this.parentClubDetails.ParentClubName,
        ToEmail: this.parentClubDetails.ParentClubAdminEmailID,
        ToName: this.parentClubDetails.ParentClubName,
        CCName: this.parentClubDetails.ParentClubName,
        CCEmail: this.parentClubDetails.ParentClubAdminEmailID,
        Subject: this.emailObj.Subject,
        Message: this.emailObj.Message,
      }



      for (let memberIndex = 0; memberIndex < this.memberList.length; memberIndex++) {
        if (this.memberList[memberIndex].EmailID.trim() != "") {
          let mKey = this.memberList[memberIndex].Key == undefined ? this.memberList[memberIndex].$key : this.memberList[memberIndex].Key;
          if (this.memberList[memberIndex].EmailID != "" && this.memberList[memberIndex].EmailID != undefined) {
            emailFormembers.Members.push({ MemberEmail: this.memberList[memberIndex].EmailID, MemberName: this.memberList[memberIndex].FirstName + " " + this.memberList[memberIndex].LastName });
            notificationDetailsObjForAdmin.Member[mKey] = {
              MemberKey: mKey,
              MemberName: this.memberList[memberIndex].FirstName + " " + this.memberList[memberIndex].LastName,
              MemberEmail: this.memberList[memberIndex].EmailID
            }
          }
        }

      }


      let firebs = this.fb;
      let members = [];
      members = this.memberList;
      let pc = this.selectedParentClubKey;
      let url = this.sharedservice.getEmailUrl();
      $.ajax({
        url:"https://activitypro-nest-261607.appspot.com/messeging/notificationemail",
        data: emailFormembers,
        type: "POST",
        success: function (respnse) {

        },
        error: function (xhr, status) {
          try {
            let key = firebs.saveReturningKey("/EmailNotification/ParentClub/" + pc, notificationDetailsObjForAdmin);
            for (let memberIndex = 0; memberIndex < members.length; memberIndex++) {
              notificationDetailsObjForMember.MemberKey = members[memberIndex].Key;
              notificationDetailsObjForMember.MemberName = members[memberIndex].FirstName + " " + members[memberIndex].LastName;
              notificationDetailsObjForMember.MemberEmailId = members[memberIndex].EmailID;
              firebs.update(key.toString(), "/EmailNotification/Member/" + pc + "/" + members[memberIndex].Key + "/", notificationDetailsObjForMember);
            }
          } catch (ex) {

          }

        }
      });
      this.showToast("Mail sent successfully", 5000);
      this.emailObj.Message = "Dear All,\n\n\n\nSincerely Yours,\n" + this.parentClubDetails.ParentClubName + "\n" + "Ph:" + this.parentClubDetails.ContactPhone + "\n" + this.parentClubDetails.ParentClubAdminEmailID;
      this.emailObj.Subject = "";
      this.navCtrl.pop();
    } catch (ex) {
    }

  }


  sendEmailToMembers() {
    if (this.emailObj.Subject.trim() == "") {
      let alert = this.alertCtrl.create({
        subTitle: 'Add a subject?',
        message: 'Do you want to send this message without subject?',
        buttons: [
          {
            text: "Don't send",
            role: 'cancel',
            handler: () => {

            }
          },
          {
            text: 'Send',
            handler: () => {
              this.sendEmails();
            }
          }
        ]
      });
      alert.present();


    } else {
      this.sendEmails();
    }
  }

  showToast(m: string, d: number) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: d,
      position: 'bottom'
    });
    toast.present();
  }








}
