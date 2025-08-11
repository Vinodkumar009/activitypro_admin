import { Storage } from '@ionic/storage';
// import { Platform, NavParams, ViewController } from "ionic-angular";
import { IonicPage, ToastController, AlertController, NavController } from 'ionic-angular';
import { Component } from '@angular/core';
import { ViewController, Platform, NavParams } from 'ionic-angular';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import gql from 'graphql-tag';
import { ParentClub } from '../../../shared/model/club.model';
import { GraphqlService } from '../../../services/graphql.service';
@IonicPage()
@Component({
  selector: 'mailtomemberbyadmin-page',
  templateUrl: 'mailtomemberbyadmin.html',
  providers: [FirebaseService, CommonService]
})
export class MailToMemberByAdminPage {

  memberList = [];
  parentClubKey = "";
  sessionDetails: any;
  selectedClub = "";
  clubDetails: any;
  parentClubDetails: ParentClub;
  emailObj = {
    Message: "",
    Subject: ""
  }
  to_email: string = "";
  cc_email: string = "";
  numberOfPeople = "0 People";
  navigateFrom = "";
  campDetails: any;
  module_obj:EmailModalForModule;
  constructor(public navCtrl: NavController, 
    public alertCtrl: AlertController, 
    //private sharedservice: SharedServices, 
    public storage: Storage, private commonService: CommonService,
    //private fb: FirebaseService, 
    public platform: Platform, 
    private params: NavParams, public viewCtrl: ViewController,
    private graphqlService:GraphqlService) {

    this.module_obj = this.params.get("email_modal");
    //console.log(this.sessionDetails);
    if (this.module_obj.type == ModuleTypeForEmail.TERMSESSION || this.module_obj.type == ModuleTypeForEmail.MONTHLYSESSION) {
      this.emailObj.Message = "Dear All,";
      if (this.module_obj.email_users.length > 0) {
        this.numberOfPeople = this.module_obj.email_users.length + " recipients";
      }
    }else if (this.module_obj.type == ModuleTypeForEmail.WEEKLYSESSION) {
      if (this.module_obj.email_users.length > 0) {
        this.numberOfPeople = this.module_obj.email_users.length + " recipients"
        //this.emailObj.Message = `Dear ${this.memberList[0].FirstName},`;
      } 
    }
    else if (this.module_obj.type == ModuleTypeForEmail.MEMBER) {
      if (this.module_obj.email_users.length > 0) {
        this.numberOfPeople = this.module_obj.email_users.length + " recipients"
        this.emailObj.Message = `Dear ${this.module_obj.email_users[0].MemberName},`;
      }

    }else if (this.module_obj.type == ModuleTypeForEmail.EVENTS) {
      this.emailObj.Message = "Dear All,";
      if (this.module_obj.email_users.length > 0) {
        this.numberOfPeople = this.module_obj.email_users.length + " recipients"
      }
    }else if (this.module_obj.type == ModuleTypeForEmail.ATTENDANCE) {
      //this.emailObj.Subject == "Attendance"?"Session Cancellation Email":"";
      //this.emailObj.Message = `Dear All,\n\nYour Session ${this.module_obj.module_info.module_booking_name} on ${this.module_obj.CancelledSession} ${this.module_obj.module_info.module_booking_start_time} at ${this.module_obj.module_info.module_booking_club_name} is cancelled. Please speak to your instructor for more details.`;
      if (this.module_obj.email_users.length > 0) {
        this.numberOfPeople = this.module_obj.email_users.length + " recipients";
      }
    }
     else if(this.module_obj.type == ModuleTypeForEmail.HOLIDAYCAMP) {
      this.campDetails = this.params.get("CampDetails");
      this.emailObj.Message = "Dear All,";     
      if (this.module_obj.email_users.length > 0) {
        this.numberOfPeople = this.module_obj.email_users.length + " recipients";
      }
    } else if (this.module_obj.type == ModuleTypeForEmail.SCHOOLSESSION) {
      this.emailObj.Message = "Dear All,";
      if (this.module_obj.email_users.length > 0) {
        this.numberOfPeople = this.module_obj.email_users.length + " recipients";
      }
    }else if (this.module_obj.type == ModuleTypeForEmail.LEAGUE) {
      this.emailObj.Message = "Dear All,";
      if (this.module_obj.email_users.length > 0) {
        this.numberOfPeople = this.module_obj.email_users.length + " recipients";
      }
    }

    //this.getEmailsForChilds();
    this.getParentclubDetails();
  }

  //get parentclub setup
  getParentclubDetails() {
    this.storage.get("postgre_parentclub").then((parentclub:ParentClub) => {  
      if (parentclub != null) {
          this.parentClubDetails = parentclub;
          //this.emailObj.Message += "\n\n\n\nKind Regards,\n" + this.parentClubDetails.ParentClubName + "\n" + "Ph:" + this.parentClubDetails.ContactPhone;
          this.emailObj.Message += "\n\n\n\nKind Regards,\n" + this.parentClubDetails.ParentClubName + "\n";
          this.to_email = this.parentClubDetails.ParentClubAdminEmailID;
          this.cc_email = this.parentClubDetails.ParentClubAdminEmailID;
      }
      this.storage.get("userObj").then(async(val) => {
        const user = JSON.parse(val);
        if (user.RoleType == "4" || user.RoleType == "6" || user.RoleType == "8") {     
          this.to_email = user.EmailID;
          this.cc_email = this.parentClubDetails.ParentClubAdminEmailID;
        }
      }).catch((err)=>{});
    })
  }

  
  sendEmails() {
    try {
      const emailFormembers = {
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
        Purpose:"Term Session"
      } 
    
      emailFormembers.Members = this.module_obj.email_users;
      
      const email_mutation = gql`
      mutation sendNotificationEmail($emailInput: EmailNotification!) {
        sendNotificationEmail(emailInput: $emailInput)
      }` 
      
      const email_variable = { emailInput: emailFormembers };
      this.graphqlService.mutate(email_mutation, email_variable,0).subscribe((response)=>{
        this.commonService.toastMessage("Mail sent successfully",2500,ToastMessageType.Success, ToastPlacement.Bottom);
        //this.emailObj.Message = "Dear All,\n\n\n\nSincerely Yours,\n" + this.parentClubDetails.ParentClubName + "\n" + "Ph:" + this.parentClubDetails.ContactPhone + "\n" + this.parentClubDetails.ParentClubAdminEmailID;
        this.emailObj.Message = "Dear All,\n\n\n\nSincerely Yours,\n" + this.parentClubDetails.ParentClubName + "\n" + this.parentClubDetails.ParentClubAdminEmailID;
        this.emailObj.Subject = "";
        this.navCtrl.pop();
        //this.navCtrl.remove(this.navCtrl.getActive().index - 1, 2);
      },(err)=>{
        //this.commonService.hideLoader();
        this.commonService.toastMessage("Email sent failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
      });        
      
    } catch (ex) {
      console.log(JSON.stringify(ex));
      this.commonService.toastMessage("Error in sending email", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    }

  }

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


  dismiss() {
    this.viewCtrl.dismiss();
  }



}





















export class EmailModalForModule{
  module_info?:{
    module_id:string;
    module_booking_club_id:string
    module_booking_club_name:string;
    module_booking_coach_id:string;
    module_booking_coach_name:string;
    module_booking_name:string;
    module_booking_start_date:string;
    module_booking_end_date:string;
    module_booking_start_time:string;  
  }
  email_users:EmailUsers[];
  type:number;                           
}

export class EmailUsers{
  IsChild:boolean
  ParentId:string
  MemberId:string
  MemberEmail:string
  MemberName:string                  
}

export enum ModuleTypeForEmail {
  TERMSESSION = 100, //for firebase it's termsession 100,monthly 101,weekly 102
  MONTHLYSESSION = 101,
  WEEKLYSESSION = 102,
  SCHOOLSESSION = 103,
  COURTBOOKING = 105,
  EVENTS = 800,
  ATTENDANCE = 107,
  MEMBER = 110,
  HOLIDAYCAMP = 500,
  LEAGUE = 600
}

export enum ModuleReportTypeForEmail {
  TERMSESSION_REPORT = 100, //for firebase it's termsession 100,monthly 101,weekly 102
  MONTHLYSESSION_REPORT = 101,
  WEEKLYSESSION_REPORT = 102,
  SCHOOLSESSION_REPORT = 103,
  COURTBOOKING_REPORT = 105,
}
