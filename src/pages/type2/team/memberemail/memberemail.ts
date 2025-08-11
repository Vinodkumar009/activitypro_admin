// import { Component } from '@angular/core';
// import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
// import { Platform, NavParams, ViewController } from "ionic-angular";
import { IonicPage, ToastController, AlertController, NavController } from 'ionic-angular';
import { Component } from '@angular/core';
import { ModalController, ViewController, Platform, NavParams } from 'ionic-angular';
import * as $ from 'jquery';
import { FirebaseService } from '../../../../services/firebase.service';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { SharedServices } from '../../../services/sharedservice';
import { GetStaffModel } from '../models/team.model';
import gql from "graphql-tag";
import { Apollo } from 'apollo-angular';

/**
 * Generated class for the MemberemailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-memberemail',
  templateUrl: 'memberemail.html',
  providers: [FirebaseService, CommonService]
})
export class MemberemailPage {

  
  memberList = [];
  parentClubKey = "";
  // sessionDetails: any;
  selectedClub = "";
  // clubDetails: any;
  parentClubDetails: any;
  emailObj = {
    Message: "",
    Subject: ""
  }
  numberOfPeople = "0 People";
  navigateFrom = "";
  // teamId:any;
  parentClubName:any;
  // MemberSpecific:GetStaffModel;
  members = [];
  staff:GetStaffModel[];

  constructor(
    public navCtrl: NavController, public alertCtrl: AlertController,
    private toastCtrl: ToastController, public sharedservice: SharedServices,
    public storage: Storage, public commonService: CommonService,
    public fb: FirebaseService, public platform: Platform, public params: NavParams,
    public viewCtrl: ViewController, public navParams: NavParams,private apollo: Apollo,
  ) {
 this.staff=this.navParams.get("staff");
//  console.table(this.staff);
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      this.parentClubName = val.Name;
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        this.getParentclubDetails();
      }
      this.getMember();
    })
   
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MemberemailPage');
  }

  // getParentclubDetails() {
  //   this.fb.getAllWithQuery("ParentClub/Type2/", { orderByKey: true, equalTo: this.parentClubKey }).subscribe((data) => {
  //     if (data.length > 0) {
  //       this.parentClubDetails = data[0];
  //     }
  //   });
  // }

  getParentclubDetails(){
    this.fb.getAllWithQuery("ParentClub/Type2/", { orderByKey: true, equalTo: this.parentClubKey }).subscribe((data)=>{
      if (data.length > 0) {
        this.parentClubDetails = data[0];
        // this.emailObj.Message += "\n\n\n\nKind Regards,\n" + this.parentClubDetails.ParentClubName + "\n" + "Ph:" + this.parentClubDetails.ContactPhone;
        this.emailObj.Message = "Dear All,\n\n\n\n\nKind Regards,\n" + this.parentClubDetails.ParentClubName + "\n" + "Ph:" + this.parentClubDetails.ContactPhone;
        this.emailObj.Subject = "";
      }
    })
  }

  getMember(){
    for(let i=0;i<this.staff.length;i++){
      this.members.push({
        MemberEmail:this.staff[i].StaffDetail.email,
        MemberName: this.staff[i].StaffDetail.name
      })
      this.numberOfPeople = this.members.length + " Recipients"
    }

    
  }

 
  dismiss() {
    this.viewCtrl.dismiss();
  }

  sendEmailToMembers() {
    if (this.validateEmail()) {
      let alert = this.alertCtrl.create({
        subTitle: 'Send email',
        message: 'Are you sure want to send email ?',
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
    } 
  }

 

 


  sendEmails(){
    let emailObj = {
      CCEmail: this.parentClubDetails.ParentClubAdminEmailID,
      CCName: this.parentClubDetails.ParentClubName,
      FromEmail: "activitypro17@gmail.com",
      FromName: this.parentClubDetails.ParentClubName,
      ImagePath: this.parentClubDetails.ParentClubAppIconURL,
      Members: this.members,
      Message: this.emailObj.Message,
      Subject: this.emailObj.Subject,
      ToEmail: this.parentClubDetails.ParentClubAdminEmailID,
      ToName:this.parentClubDetails.ParentClubName
    }


    let url = this.sharedservice.getEmailUrl();
    $.ajax({
      url: `${this.sharedservice.getnestURL()}/messeging/notificationemail`,
      data: emailObj,

      type: "POST",
      success: function (respnse) {
      },
      error: function (xhr, status) {
        console.log(xhr, status)
      }
    });
    this.showToast("Mail sent successfully", 5000);
    this.navCtrl.pop();
  }

 

  validateEmail(){
    if (this.emailObj.Subject.trim() == "") {
      this.commonService.toastMessage("Please enter subject",3000,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    return true;
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


