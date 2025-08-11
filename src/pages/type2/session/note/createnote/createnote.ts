import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { FirebaseService } from '../../../../../services/firebase.service';
import * as $ from 'jquery';
import { SharedServices } from '../../../../services/sharedservice';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { CommonService } from '../../../../../services/common.service';
/**
 * Generated class for the CreatenotePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-createnote',
  templateUrl: 'createnote.html',
})
export class CreatenotePage {
  memberInfo:any = "";
  sessionDetails:any = "";
  noteObj:NoteDetails = new NoteDetails();
  memberName:any = "";
  parentClubInfo:any = "";
  loading:any = "";
  constructor(public toastCtrl:ToastController,public loadingCtrl:LoadingController,private localNotifications: LocalNotifications,public sharedService:SharedServices,public navCtrl: NavController, public navParams: NavParams,public fb: FirebaseService,public commonService:CommonService) {
  }
  ionViewDidLoad() {
    this.memberInfo = this.navParams.get('memberInfo');
    this.sessionDetails = this.navParams.get('sessionDetails');
    this.memberName = this.memberInfo.FirstName +" "+this.memberInfo.LastName;
    this. getParentClub();
    this.getDeviceToken();
  }
  saveNote(){
    this.getOtherNoteInfo();
  }
  getOtherNoteInfo(){
    this.noteObj.ActivityKey = this.sessionDetails.ActivityKey;
    this.noteObj.ClubKey = this.memberInfo.ClubKey;
    this.noteObj.MemberParentKey = this.memberInfo.ParentKey;
    this.noteObj.CreatedBy = this.noteObj.NotesAddedBy;
    this.noteObj.MemberKey = this.memberInfo.Key;
    this.noteObj.NotesCreatedOn = new Date().getTime();
    this.noteObj.ParentClubKey = this.memberInfo.ParentClubKey;
    this.noteObj.SessionKey = this.sessionDetails.$key;
    this.noteObj.UpdatedBy = this.noteObj.NotesAddedBy;
    this.noteObj.SessionName =  this.sessionDetails.SessionName;
    this.noteObj.MemberName  = this.memberInfo.FirstName +" "+this.memberInfo.LastName;
    this.noteObj.MemberEmail = this.memberInfo.EmailID;
    this.fb.save(this.noteObj,"Note/"+this.noteObj.ParentClubKey+"/"+this.noteObj.ClubKey);
    this.sendEmail();
    this.getParentClubNotification();
    this.navCtrl.pop();
  }
  dismiss(){
    this.navCtrl.pop();
  }
  goToHistoryNote(){
    this.navCtrl.push('NotePage',{
      memberInfo:this.memberInfo,
      sessionDetails:this.sessionDetails
    });
  }
  getParentClub() {
    this.fb.getAllWithQuery("/ParentClub/Type2" ,{orderByKey:true,equalTo:this.memberInfo.ParentClubKey}).subscribe((data) => {
      this.parentClubInfo = data[0];
    });
  }

  sendEmail(){
    let members = [
      {
        MemberEmail:this.noteObj.MemberEmail,
        MemberName:  this.noteObj.MemberName
      }
    ]
    let emailObj = {
      CCEmail: this.parentClubInfo.ParentClubName,
      CCName: this.parentClubInfo.ParentClubAdminEmailID,
      FromEmail: "activitypro17@gmail.com",
      FromName: this.parentClubInfo.ParentClubName,
      ImagePath:  this.parentClubInfo.ParentClubAppIconURL,
      Members:members,
      Message: this.noteObj.Notes,
      Subject:'Notes for '+this.memberInfo.FirstName+" by Admin",
      ToEmail:this.noteObj.MemberEmail,
      ToName:this.noteObj.MemberName
    }
    //this.noteObj.MemberEmail
    let url = this.sharedService.getEmailUrl();
   
    $.ajax({
      url: url + "umbraco/surface/ActivityProSurface/SendEmailNotification/",
      data: emailObj,
      type: "POST",
      success: function (respnse) {
      },
      error: function (xhr, status) {
      }
    });
  }
















  parentClubNotificationSetup:any = [];
  sendTo = {
    Admin: {
      Key: "",
      Tokens: [],
      Messages: []
    },
    Coaches: []
  };
  deviceTokens:any = [];
  getParentClubNotification() {
    this.fb.getAllWithQuery("/NotificationCenterSetup/ParentClub/" +this.memberInfo.ParentClubKey, { orderByKey: true }).subscribe((data) => {
      this.parentClubNotificationSetup = data;
      if (data.length > 0) {
        this.localNotofication();
        this.getDeviceTokenOfCoachAndAdmin();
      } 
    });
  }

  getDeviceTokenOfCoachAndAdmin() {
    let entryObj:any = "";
    for (let loop = 0; loop < this.parentClubNotificationSetup.length; loop++) {
      this.fb.getAllWithQuery("/DeviceToken/ParentClub/" +this.memberInfo.ParentClubKey, { orderByKey: true }).subscribe((AdminTokenResponse) => {
        this.sendTo.Admin.Key = this.memberInfo.ParentClubKey;
        for (let tokenIndex = 0; tokenIndex < AdminTokenResponse.length; tokenIndex++) {
          //this.sendTo.Admin.Tokens.push(AdminTokenResponse[tokenIndex].DeviceToken);
          this.deviceTokens.push({ MobileDeviceId: AdminTokenResponse[tokenIndex].DeviceToken, ConsumerID: "", PlatformArn: "" });
        }
        this.sendNoficationAfterConfirm();
      });
      this.sendTo.Admin.Messages.push(
        "Note: "+this.noteObj.Notes
      );
      break;
    }
   
  }
  localNotofication(){

      this.localNotifications.schedule({
        id: 106,
        text:'Notes for '+this.noteObj.SessionName+" by Admin",
      });
      this.fb.saveReturningKey("Notification/Member/" +this.memberInfo.ParentClubKey + "/" + this.memberInfo.ClubKey + "/" + this.noteObj.MemberKey + "/Session/Notification/", {
        ComposeOn: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate(),
        CreatedTime: new Date().getTime(),
        Message:'Notes for '+this.memberInfo.FirstName +" :"+this.noteObj.Notes,
        Purpose: "Notes Creation",
        SendBy: "Admin",
        SendTo:  this.noteObj.MemberKey,
        Status: "Unread",
        sendByRole: "Admin"
      });

  }
  
  sendNoficationAfterConfirm() {
  
    let pc = { CreatedTime: "", Message: '', SendBy: '', ComposeOn: '', Purpose: '', sendByRole: "", Status: "Unread" };
    pc.SendBy = "Admin";
    pc.sendByRole = "Admin";
    pc.Purpose = "Note"
    pc.CreatedTime = new Date().toString();
    pc.ComposeOn = new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();
    for (let innerIndex = 0; innerIndex < this.sendTo.Admin.Messages.length; innerIndex++) {
      pc.Message = pc.Message + this.sendTo.Admin.Messages[innerIndex] + "\n\n";
    }
    if (this.sendTo.Admin.Key != "") {
      this.fb.saveReturningKey("Notification/ParentClub/" + this.sendTo.Admin.Key + "/Session/ComposeNotification/", pc);
      let url = this.sharedService.getEmailUrl();
      let pKey = this.sharedService.getParentclubKey();
      let message = pc.Message;
      this.fb.CallToApiForNotification({ URL: url, DeviceTokens: this.deviceTokens, Message: message, Subject: "Notification", ParentclubKey: "Admin" });
  
     
    }
    this.notify();
  }
  memDeviceToken = [];
  selectedClub:any = "";
  parentClubKey:any = "";
  notificationObj = {
    CreatedTime: "",
    Message: '',
    SendBy: '',
    ComposeOn: '',
    Purpose: '', 
    sendByRole: "",
    Status: "Unread",
    Member: [],
  };
   getDeviceToken() {
    if (this.memberInfo != undefined) {
      if(this.memberInfo.SignedUpType != undefined && this.memberInfo.SignedUpType!= 1){
        this.selectedClub ="";
      }else{
      this.selectedClub = "";
      }  
      this.parentClubKey = this.memberInfo.ParentClubKey;
      this.notificationObj.Purpose = "NotifyToMember";
      this.notificationObj.sendByRole = "Admin";
      this.notificationObj.SendBy = "Admin";
      this.notificationObj.Message = "Note:";
      this.notificationObj.Member.push({
        Name: this.memberInfo.FirstName + " " + this.memberInfo.LastName,
        Key: this.memberInfo.Key,
        ClubKey: this.memberInfo.ClubKey == undefined ? "" : this.memberInfo.ClubKey,
        SignedUpType: this.commonService.getMemberSignedUpType(this.memberInfo)
      });
    }
    if (this.commonService.getMemberSignedUpType(this.memberInfo) == 1) {
      this.fb.getAllWithQuery("/DeviceToken/Member/" + this.memberInfo.ParentClubKey + "/" + this.memberInfo.ClubKey + "/" + this.memberInfo.Key + "/Token", { orderByKey: true }).subscribe((response) => {
        this.memDeviceToken=[];
        //        this.iOSDeviceTokens = [];
        for (let i = 0; i < response.length; i++) { 
          this.memDeviceToken.push({ MobileDeviceId: response[i].DeviceToken, ConsumerID: "", PlatformArn: "" });
        }
      });
    }
    else {
      this.fb.getAllWithQuery("/DeviceToken/Member/" + this.memberInfo.ParentClubKey + "/" + this.memberInfo.$key + "/Token", { orderByKey: true }).subscribe((response) => {
        this.memDeviceToken = [];
        for (let i = 0; i < response.length; i++) {
          this.memDeviceToken.push({ MobileDeviceId: response[i].DeviceToken, ConsumerID: "", PlatformArn: "" });
        }
      });
    }




  }





   notify() {

    let notificationDetailsObj = this.notificationObj;

    this.notificationObj.CreatedTime = new Date().toString();
    this.notificationObj.ComposeOn = new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();
    let undefinedProps = this.commonService.findUndefinedProp(notificationDetailsObj);
    if (undefinedProps != "") {
      return;
    }

    let memberObject = {
      CreatedTime: "",
      Message: '',
      SendBy: '',
      ComposeOn: '',
      Purpose: 'Note',
      sendByRole: "",
      Status: "Unread",
      Admin: [],
      SignedUpType: 1
    };
    memberObject.SignedUpType = this.commonService.getMemberSignedUpType(this.memberInfo);
    memberObject.ComposeOn = this.notificationObj.ComposeOn;
    memberObject.CreatedTime = this.notificationObj.CreatedTime;
    memberObject.Message = "";
    memberObject.SendBy = "Admin";
    memberObject.Status = "Unread";
    memberObject.sendByRole = "Admin";
    memberObject.SignedUpType = this.commonService.getMemberSignedUpType(this.memberInfo);
    memberObject.Admin.push({
      Key: this.parentClubKey,
    });

    // this.fb.saveReturningKey("Notification/ParentClub/" + this.parentClubKey + "/Session/ComposeNotification/", this.notificationObj);
    // if (this.commonService.getMemberSignedUpType(this.memberInfo) == 1) {
    //   this.fb.saveReturningKey("Notification/Member/" + this.parentClubKey + "/" + this.memberInfo.ClubKey + "/" + this.memberInfo.Key + "/Session/Notification/", memberObject);
    // } else {
    //   this.fb.saveReturningKey("Notification/Member/" + this.parentClubKey + "/" + this.memberInfo.Key + "/Session/Notification/", memberObject);
    // }

    let url = this.sharedService.getEmailUrl();
    let pKey = this.sharedService.getParentclubKey();
    let message = notificationDetailsObj.Message;
    this.fb.CallToApiForNotification({ URL: url, DeviceTokens: this.deviceTokens, Message: message, Subject: "Notification", ParentclubKey: pKey });
    this.navCtrl.pop();
    let m = "Note successfully added";
    this.showToast(m, 5000);

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
class NoteDetails{
  Notes:String = "";
  ClubKey:String = "";
  NotesAddedBy:String = "Admin";
  NotesCreatedOn:any = "";
  MemberKey:String = "";
  MemberParentKey:String = "";
  SessionKey:String = "";
  ParentClubKey:String = "";
  VenueKey:String = "";
  ActivityKey:String = "";
  IsActive:boolean = true;
  IsEnable:boolean =true;
  UpdatedBy:String = "";
  CreatedBy:String = "";
  MemberName:String = "";
  SessionName:string = "";
  MemberEmail:string = "";
}



  // sendmail(){
  
  //  let url = "http://localhost:32683/";
  //   $.ajax({
  //   url: url + "umbraco/surface/ActivityProSurface/NoteMail",
  //   data: {
  //     fromName:'Barun Mishra',
  //     fromEmail:'activitypro17@gmail.com',
  //     toName:this.noteObj.MemberName,
  //     //toEmail: this.noteObj.MemberEmail,
  //     toEmail:'barun.mishra@kare4u.in',
  //     typeName:'Notes by admin',
  //     type:'Session Notes',
  //     sendBy:'Admin',
  //     noteContent:this.noteObj.Notes,
  //     sessionName: this.noteObj.SessionName,
  //     subject:'Notes from '+this.noteObj.SessionName+" by Admin" ,
  //     //imagePath:
  //   },
  //   type: "POST",
  //   success: function (respnse) {

  //   },
  //   error: function (xhr) {

  //   }
  //   });
  // }