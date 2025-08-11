import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FirebaseService } from '../../../../services/firebase.service';
import { SharedServices } from '../../../services/sharedservice';
import { Storage } from '@ionic/storage';
import { CommonService, ToastPlacement, ToastMessageType } from '../../../../services/common.service';
import gql from 'graphql-tag';
import { GraphqlService } from '../../../../services/graphql.service';
import { ParentClub } from '../../../../shared/model/club.model';
import { EmailModalForModule, ModuleReportTypeForEmail, ModuleTypeForEmail } from '../../mailtomemberbyadmin/mailtomemberbyadmin';
/**
 * Generated class for the PaymentstatusemailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-paymentstatusemail',
  templateUrl: 'paymentstatusemail.html',
})
export class PaymentstatusemailPage {
  parentClubDetails: ParentClub;
  memberList: Array<any> = [];
  TempmemberList: Array<any> = [];
  sessionTypes: Array<any> = [
    {Type:"All", ID:0},
    {Type:"Term", ID:1},
    {Type:"Weekly", ID:2},
    {Type:"Monthly", ID:3}
  ];
  selectedType:number = 0;
  selectedMembersType: string = "";
  emailObj = {
    Message: "",
    Subject: ""
  }
  numberOfPeople = "0 People";
  
  parentClubKey: string = "";
  memberToBeSendAddress = [];
  module_obj:EmailModalForModule;
  constructor(public navCtrl: NavController, public navParams: NavParams,
       private fb: FirebaseService, 
       public sharedservice: SharedServices,
       private commonService: CommonService, 
       private graphqlService:GraphqlService,
       public storage: Storage) {
    // this.TempmemberList = JSON.parse(JSON.stringify(this.navParams.get('memberList'))),
    // this.memberList = this.TempmemberList;
    // this.selectedMembersType = this.navParams.get('type');
    // this.parentClubKey = this.navParams.get("parentclubKey")
    // this.removeDuplicates();
    // console.log(this.memberList);
    // console.log(this.selectedMembersType);
    this.module_obj = this.navParams.get("email_modal");
    //console.log(this.sessionDetails);
    if (this.module_obj.type == ModuleReportTypeForEmail.TERMSESSION_REPORT) {
      this.emailObj.Message = "Dear All,";
      if (this.module_obj.email_users.length > 0) {
        this.numberOfPeople = this.module_obj.email_users.length + " recipients";
      }
    }
    
    this.emailObj.Message = "Dear All,";
    this.emailObj.Subject = "Payment Reminder";
    //this.prepareObject();
    this.getParentclubDetails();
  }

  getParentclubDetails() {
    // this.fb.getAllWithQuery("ParentClub/Type2/", { orderByKey: true, equalTo: this.parentClubKey }).subscribe((data) => {

    //   if (data.length > 0) {
    //     this.parentClubDetails = data[0];
    //     //console.log(this.parentClubDetails);
    //     this.emailObj.Message += "\n\n\n\nKind Regards,\n" + this.parentClubDetails.ParentClubName + "\n" + "Ph:" + this.parentClubDetails.ContactPhone;

    //     //this.emailObj.Subject = "";
    //   }
    // });
    this.storage.get("postgre_parentclub").then((parentclub:ParentClub) => {  
      if (parentclub != null) {
          this.parentClubDetails = parentclub;
          //this.emailObj.Message += "\n\n\n\nKind Regards,\n" + this.parentClubDetails.ParentClubName + "\n" + "Ph:" + this.parentClubDetails.ContactPhone;
          this.emailObj.Message += "\n\n\n\nKind Regards,\n" + this.parentClubDetails.ParentClubName + "\n";
      }
    })
  }
  
  prepareObject() {
    this.memberToBeSendAddress = [];
    this.memberList.forEach((eachMember) => {
      if ((eachMember.EmailID != "" && eachMember.EmailID != undefined)) {
      //if (eachMember.IsActive && (eachMember.EmailID != "" && eachMember.EmailID != undefined)) {
        this.memberToBeSendAddress.push({  
          MemberEmail: eachMember.EmailID
        })
      }
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PaymentstatusemailPage');
  }

  onChangeOfType(){

  }
  
  async sendEmailToMembers(){
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
        } 
      
        emailFormembers.Members = this.module_obj.email_users;
        
        const email_mutation = gql`
        mutation sendNotificationEmail($emailInput: EmailNotification!) {
          sendNotificationEmail(emailInput: $emailInput)
        }` 
        
        const email_variable = { emailInput: emailFormembers };
        this.graphqlService.mutate(email_mutation, email_variable,0).subscribe((response)=>{
          this.commonService.toastMessage("Mail sent successfully",2500,ToastMessageType.Success, ToastPlacement.Bottom);
          this.emailObj.Message = "Dear All,\n\n\n\nSincerely Yours,\n" + this.parentClubDetails.ParentClubName + "\n" + this.parentClubDetails.ParentClubAdminEmailID;
          this.commonService.toastMessage("Mail sent successfully", 2500,ToastMessageType.Success,ToastPlacement.Bottom);
          this.emailObj.Subject = "";
          this.navCtrl.pop();
          //this.navCtrl.remove(this.navCtrl.getActive().index - 1, 2);
        },(err)=>{
          if(err.error & err.error.message){
            this.commonService.toastMessage(err.error.message,2500,ToastMessageType.Error,ToastPlacement.Bottom);
          }else{
            this.commonService.toastMessage("Email sent failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
          }
        });        
      } catch (ex) {
        console.log(JSON.stringify(ex));
        if(ex.error & ex.error.message){
          this.commonService.toastMessage(ex.error.message,2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }else{
          this.commonService.toastMessage("Error in sending email", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        }
      }
    
  }

  

}
