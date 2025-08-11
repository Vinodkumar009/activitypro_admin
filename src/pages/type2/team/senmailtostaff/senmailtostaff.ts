import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController, NavParams, PopoverController, ToastController } from 'ionic-angular';
import { FirebaseService } from '../../../../services/firebase.service';
import { SharedServices } from '../../../services/sharedservice';
import { Storage } from '@ionic/storage';
import * as $ from 'jquery';
import { GetStaffModel } from '../models/team.model';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';

/**
 * Generated class for the SenmailtostaffPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-senmailtostaff',
  templateUrl: 'senmailtostaff.html',
  providers: [FirebaseService, CommonService]
})
export class SenmailtostaffPage {

  // selectedParentClubKey: string = "";
  // memberList :any;
  // memberDetails:GetStaffModel;
  // emailObj = {
  //   Message: "",
  //   Subject: ""
  // }
  // numberOfPeople = "0 recipients";
  // parentClubDetails: any;
  // memberType = "";

  memberList = [];
  parentClubKey = "";

  selectedClub = "";
 
  parentClubDetails: any;
  emailObj = {
    Message: "",
    Subject: ""
  }

  numberOfPeople = "0 People";
  navigateFrom = "";
  members = [];
  teamId:any;
  parentClubName:any;
  MemberSpecific:GetStaffModel;
  staff:GetStaffModel;
  multiStaffs

  constructor(public navCtrl: NavController,
     public navParams: NavParams,
     private storage: Storage,
     public fb: FirebaseService,
     public popoverCtrl: PopoverController,
     public alertCtrl: AlertController,
     private toastCtrl: ToastController,
     public commonService: CommonService,
     public sharedservice: SharedServices,) {
      this.staff=this.navParams.get("staff");
      console.log("staffs are:",this.staff);
      
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
    // this.emailObj.Message = "Dear All,";
    // console.log('ionViewDidLoad SenmailtostaffPage');
    // this.storage.get('userObj').then((val) => {
    //   val = JSON.parse(val);
    //   for (let user of val.UserInfo) {
    //     if (val.$key != "") {
    //       this.selectedParentClubKey = user.ParentClubKey;
    //       this.getMemberList();
    //       this.getParentclubDetails();
    //     }
    //   }
    // }).catch(error => {

    // });
  }

  getParentclubDetails(){
    this.fb.getAllWithQuery("ParentClub/Type2/", { orderByKey: true, equalTo: this.parentClubKey }).subscribe((data)=>{
      if (data.length > 0) {
        this.parentClubDetails = data[0];

        this.emailObj.Message = "Dear "+this.staff.StaffDetail.name+", \n\n\n\n\nKind Regards,\n" + this.parentClubDetails.ParentClubName + "\n" + "Ph:" + this.parentClubDetails.ContactPhone;
        this.emailObj.Subject = "";
      
        
      }
    })
  }


  dismiss() {
    this.navCtrl.pop();
  }

  getMember(){
    // this.members.push({
    //   MemberEmail:this.staff.StaffDetail.email,
    //   MemberName: this.staff.StaffDetail.name
    // })
    // this.numberOfPeople=this.members.length+ " Recipients";
    // for(let i=0;i<this.staff.length;i++){
      this.members.push([{
        MemberEmail:this.staff.StaffDetail.email,
        MemberName: this.staff.StaffDetail.name
  }])
      this.numberOfPeople = this.members.length + " Recipients"
    }
  

  // getStaffMember(teamId){
  //   this.memberList.push({
  //     "FirebaseKey":this.MemberSpecific.StaffDetail.firebaseKey,
  //     "Name":this.MemberSpecific.StaffDetail.name,
  //     "EmailID":this.MemberSpecific.StaffDetail.email,

  //   })

  //   this.numberOfPeople = this.memberList.length+ " recipients";
  // }

  validateEmail(){
    if (this.emailObj.Subject.trim() == "") {
      this.commonService.toastMessage("Please enter subject",3000,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    return true;
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

  
  showToast(m: string, d: number) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: d,
      position: 'bottom'
    });
    toast.present();
  }
  // getMemberList() {
  //   this.memberList.push( {
  //     "FirebaseKey":"-Ms9ilYgPklFux7AYR-a",
  //     "FirstName": "",
  //     "LastName": "",
  //     "DOB": "n/a",
  //     "EmailID": "Sarbajit.sharma@gmail.com"
      
  //   })
  //   this.numberOfPeople = this.memberList.length+ " recipients";
  
  // }

  // getParentclubDetails() {
  //   this.fb.getAllWithQuery("ParentClub/Type2/", { orderByKey: true, equalTo: this.selectedParentClubKey }).subscribe((data) => {
  //     if (data.length > 0) {
  //       this.parentClubDetails = data[0];
  //       this.emailObj.Message += "\n\n\n\nKind Regards,\n" + this.parentClubDetails.ParentClubName + "\n" + "Ph:" + this.parentClubDetails.ContactPhone;
  //       this.emailObj.Subject = "";
  //     }
  //   });
  // }

  // sendEmailToMembers() {
  //   if (this.emailObj.Subject.trim() == "") {
  //     let alert = this.alertCtrl.create({
  //       subTitle: 'Add a subject?',
  //       message: 'Do you want to send this message without subject?',
  //       buttons: [
  //         {
  //           text: "Don't send",
  //           role: 'cancel',
  //           handler: () => {

  //           }
  //         },
  //         {
  //           text: 'Send',
  //           handler: () => {
  //             this.sendEmails();
  //           }
  //         }
  //       ]
  //     });
  //     alert.present();


  //   } else {
  //     this.sendEmails();
  //   }
  // }

  // sendEmails() {
  //   try {
  //     let notificationDetailsObjForMember = {
  //       ParentClubKey: this.selectedParentClubKey,
  //       Message: this.emailObj.Message,
  //       Subject: this.emailObj.Subject,
  //       SendBy: "ClubAdmin",
  //       ComposeOn: new Date().getTime(),
  //       Purpose: "Member Email",
  //       MemberKey: "",
  //       MemberName: "",
  //       MemberEmailId: "",
  //       Status: "Unread",
  //       Type: ""
  //     };
  //     let notificationDetailsObjForAdmin = {
  //       ParentClubKey: this.selectedParentClubKey,
  //       Message: this.emailObj.Message,
  //       Subject: this.emailObj.Subject,
  //       SendBy: "ClubAdmin",
  //       Type: "",
  //       ComposeOn: new Date().getTime(),
  //       Purpose: "Session Email",
  //       Member: []
  //     };
  //     let notificationDetailsObjForMemberInner = {
  //       MemberKey: "",
  //       MemberName: "",
  //       MemberEmailId: "",
  //       Status: "Unread"
  //     }
  //     let emailFormembers = {
  //       Members: [],
  //       ImagePath: this.parentClubDetails.ParentClubAppIconURL,
  //       FromEmail: "activitypro17@gmail.com",
  //       FromName: this.parentClubDetails.ParentClubName,
  //       ToEmail: this.parentClubDetails.ParentClubAdminEmailID,
  //       ToName: this.parentClubDetails.ParentClubName,
  //       CCName: this.parentClubDetails.ParentClubName,
  //       CCEmail: this.parentClubDetails.ParentClubAdminEmailID,
  //       Subject: this.emailObj.Subject,
  //       Message: this.emailObj.Message,
  //     }



  //     for (let memberIndex = 0; memberIndex < this.memberList.length; memberIndex++) {
  //       if (this.memberList[memberIndex].EmailID.trim() != "") {
  //         let mKey = this.memberList[memberIndex].Key == undefined ? this.memberList[memberIndex].$key : this.memberList[memberIndex].Key;
  //         if (this.memberList[memberIndex].EmailID != "" && this.memberList[memberIndex].EmailID != undefined) {
  //           emailFormembers.Members.push({ MemberEmail: this.memberList[memberIndex].EmailID, MemberName: this.memberList[memberIndex].FirstName + " " + this.memberList[memberIndex].LastName });
  //           notificationDetailsObjForAdmin.Member[mKey] = {
  //             MemberKey: mKey,
  //             MemberName: this.memberList[memberIndex].FirstName + " " + this.memberList[memberIndex].LastName,
  //             MemberEmail: this.memberList[memberIndex].EmailID
  //           }
  //         }
  //       }

  //     }


  //     let firebs = this.fb;
  //     let members = [];
  //     members = this.memberList;
  //     let pc = this.selectedParentClubKey;
  //     let url = this.sharedservice.getEmailUrl();
  //     $.ajax({
  //       url:"https://activitypro-nest-261607.appspot.com/messeging/notificationemail",
  //       data: emailFormembers,
  //       type: "POST",
  //       success: function (respnse) {

  //       },
  //       error: function (xhr, status) {
  //         try {
           
            
  //         } catch (ex) {

  //         }

  //       }
  //     });
  //     this.showToast("Mail sent successfully", 5000);
  //     this.emailObj.Message = "Dear All,\n\n\n\nSincerely Yours,\n" + this.parentClubDetails.ParentClubName + "\n" + "Ph:" + this.parentClubDetails.ContactPhone + "\n" + this.parentClubDetails.ParentClubAdminEmailID;
  //     this.emailObj.Subject = "";
  //     this.navCtrl.pop();
  //   } catch (ex) {
  //   }

  // }

  
}
