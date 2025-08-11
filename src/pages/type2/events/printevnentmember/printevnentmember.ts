import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ActionSheetController } from 'ionic-angular';
import { FirebaseService } from '../../../../services/firebase.service';
import * as $ from 'jquery';
import { SharedServices } from '../../../services/sharedservice';
import { ToastController } from 'ionic-angular/components/toast/toast-controller';
import { Storage } from '@ionic/storage';
import { PrintBookingReport, ReportModel } from '../model/event.model';
import { ParentClub } from '../../../../shared/model/club.model';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';

import { HttpService } from '../../../../services/http.service';
import { API } from '../../../../shared/constants/api_constants';
import { AppType } from '../../../../shared/constants/module.constants';
/**
 * Generated class for the PrintevnentmemberPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-printevnentmember',
  templateUrl: 'printevnentmember.html',
  providers: [HttpService]
})
export class PrintevnentmemberPage {
  postgre_parentclub_id:string = ""
  showType: any = "";
  memberList: PrintBookingReport[] = [];
  parentClubKey: string = "";
  termKey: string = "";
  reportType: string = "";
  parentClubInfo: any = {};
  selectOBj: SelectedItems;   
  userObj:any = "";
  report_obj:ReportModel = {
    parentclub_image: "",
    parentclub_name: "",
    club_name:"Not Available",
    to_address:"",
    from_address:"Not Available",
    cc_address:"Not Available",
    subject:"Not Available",
    reply_to_address:"",
    memer_list:[],
    msg_body:"",
    attachment_name:""
  }
  constructor(public sharedservice: SharedServices, 
    public loadingCtrl:LoadingController, public navCtrl: NavController, 
    public navParams: NavParams, public fb: FirebaseService,
    public toastCtrl:ToastController,
    private commonService: CommonService,
    public actionSheetCtrl:ActionSheetController,
    public storage:Storage,
    private httpService: HttpService,) {
    this.selectOBj = new SelectedItems();
    this.showType = this.navParams.get('showType');
    this.selectOBj.subject = "Event Payment Report";
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
          this.parentClubKey = val.UserInfo[0].ParentClubKey;
          this.userObj = val;
          this.getParentClubInfo();
      }
      // this.loading.dismiss().catch(() => { });
    })
    this.storage.get('postgre_parentclub').then((postgre_parentclub)=>{
      this.postgre_parentclub_id = postgre_parentclub.Id;
    })
    this.parentClubKey = this.navParams.get('parentClubKey');
    this.memberList = this.navParams.get('repor_members');
    // this.termKey = this.navParams.get('termKey');
    // this.reportType = this.navParams.get('reportType');
    console.log(this.memberList);
    this.preparememberObj()
  }

  async ionViewDidLoad() {
    // this.report_members = this.navParams.get('repor_members');
    // this.session_info = this.navParams.get('session_info');
    // this.type = this.navParams.get('type');
   // this.selectedMonthKey = this.navParams.get('selectedMonthKey');// if it's not undefined then it's monthly session
    console.log(this.navParams.get('repor_members'));
    this.report_obj.memer_list = this.navParams.get('repor_members');
    this.report_obj.club_name = this.navParams.get('session_info').club_name;
    this.report_obj.subject = this.navParams.get('session_info').session_name + "-" + "Member Sheet";
  }


  getParentClubInfo() {
    this.storage.get("postgre_parentclub").then((parentclub:ParentClub) => {  
      if (parentclub != null) {
          this.parentClubInfo = parentclub;
          this.selectOBj.parentClubimagePath = this.parentClubInfo.ParentClubAppIconURL;
          this.selectOBj.parentClubName = this.parentClubInfo.ParentClubName;
          this.selectOBj.toAddress = this.parentClubInfo.ParentClubAdminEmailID;
          if(this.userObj.RoleType == 6 || this.userObj.RoleType == 7 || this.userObj.RoleType == 8){
            this.selectOBj.toAddress = this.userObj.EmailID;
          }

          this.report_obj.parentclub_image = this.parentClubInfo.ParentClubAppIconURL;
          this.report_obj.parentclub_name = this.parentClubInfo.ParentClubName;
         
          if(this.userObj.RoleType == 4 || this.userObj.RoleType == 6 || this.userObj.RoleType == 7 || this.userObj.RoleType == 8){
            this.report_obj.to_address = this.userObj.EmailID;
            this.report_obj.cc_address = this.parentClubInfo.ParentClubAdminEmailID;
          }else{
            this.report_obj.to_address = this.parentClubInfo.ParentClubAdminEmailID;
          }          
      }
    })
  }

  
  cancelsendMailToParentClub() {
    this.navCtrl.pop();
  }
  
  
  preparememberObj() {
    let selectedMemberArr = [];

    this.memberList.forEach((member) => {
      let tempMemberObj: Member = new Member();
      
      if (member.PaymentDate != undefined) {
        tempMemberObj.date = member.PaymentDate;
      } else {
        tempMemberObj.date = "Not Available";
      }
      if (member.DiscountAmount != undefined) {
        tempMemberObj.discAmount = member.DiscountAmount;
      } else {
        tempMemberObj.discAmount = "Not Available";
      }
      // if (member.PaidBy != undefined) {
      //   tempMemberObj.mode = member.PaidBy;
      // } else {
      //   tempMemberObj.mode = "Not Available";
      // }
      if (member.PaidAmount != undefined) {
        tempMemberObj.paidAmount = member.PaidAmount;
      } else {
        tempMemberObj.paidAmount = "Not Available";
      }
      if (member.EventName != undefined) {
        tempMemberObj.EventName = member.EventName;
      } else {
        tempMemberObj.EventName = "Not Available";
      }
      if (member.VenueName != undefined) {
        tempMemberObj.venueName = member.VenueName;
      } else {
        tempMemberObj.venueName = "Not Available";
      }
      // if (member.AmountDue != undefined ) {
      //   tempMemberObj.dueAmount = member.AmountDue;
      // } else {
      //   tempMemberObj.dueAmount = "Not Available";
      // }
      tempMemberObj.TotalTickets = member.NoOfTickets;
      tempMemberObj.firstName = member.FirstName;
      tempMemberObj.lastName = member.LastName;
      selectedMemberArr.push(tempMemberObj);
    });
    this.selectOBj.memerList = selectedMemberArr;

  }
  

  presentActionSheet() {
    const actionSheet = this.actionSheetCtrl.create({
        title: 'Send Report',
        buttons: [
            {
                text: 'PDF',
                handler: () => {
                    this.sendMail();
                }
            }, {
                text: 'Excel',
                handler: () => {    
                    this.sendXLS();
                }
            },{
                text: 'Cancel',
                role: 'cancel',
                handler: () => {
                }
            }
        ]
    });
    actionSheet.present();
}



  sendMail() {
    try{
      this.commonService.showLoader("Please wait")
      this.report_obj.memer_list.forEach((mem)=>{
        if(!this.selectOBj.isTickets){
          delete mem.NoOfTickets;
        }if(!this.selectOBj.isDiscount){
          delete mem.DiscountAmount;
        }if(!this.selectOBj.isPaid){
          delete mem.PaidAmount;
        }if(!this.selectOBj.isVanue){
          delete mem.VenueName;
        }if(!this.selectOBj.isDate){
          delete mem.PaymentDate;
        }
      })
      this.report_obj.msg_body = `<p> Hello ${this.report_obj.parentclub_name},</p><p style="margin:1px">Please find below the link for the report.</p><p>Note: The link will be disabled after 3 days. </p>`;
      this.report_obj.attachment_name = `Member Session@${this.report_obj.parentclub_name+ new Date().getTime()}`;
      let url = this.sharedservice.getEmailUrl();
      //this.selectOBj.toAddress="akkellivinod@gmail.com";//need to remove
          
      Object.assign(this.report_obj, {
        parentclubId:this.postgre_parentclub_id,
        device_type:this.sharedservice.getPlatform() == "android" ? 1:2,
        updated_by:this.sharedservice.getLoggedInId(),
        device_id:this.sharedservice.getDeviceId() || "",
        app_type:AppType.ADMIN_NEW
      })
      const eventDetsDTO = new ReportModel(this.report_obj);
      eventDetsDTO.memer_list = this.report_obj.memer_list;
      this.httpService.post(`${API.EVENT_PRINT_REPORT}`, eventDetsDTO).subscribe((res: any) => {
        this.commonService.hideLoader();
        this.commonService.toastMessage("Report sent successfully",2500,ToastMessageType.Success, ToastPlacement.Bottom);
        this.navCtrl.pop();
        //this.navCtrl.remove(this.navCtrl.getActive().index - 1, 2);
      },(err)=>{
        this.commonService.hideLoader();
        this.commonService.toastMessage("Report sent failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
      });  
    }catch(err){
      this.commonService.hideLoader();
      this.commonService.toastMessage("Report sent failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
    }
  }

  sendPDfRequest(){
    return new Promise((res,rej) => {
      this.selectOBj.memerList.forEach((mem)=> {
        if(!this.selectOBj.isTickets){
          delete mem.TotalTickets;
        }if(!this.selectOBj.isDiscount){
          delete mem.discAmount;
        }if(!this.selectOBj.isPaid){
          delete mem.paidAmount;
        }if(!this.selectOBj.isVanue){
          delete mem.venueName;
        }if(!this.selectOBj.isDate){
          delete mem.date;
        }
      })
      let url = this.sharedservice.getEmailUrl();
      //this.selectOBj.toAddress="akkellivinod@gmail.com";//need to remove
      this.selectOBj.msgBody = `<p> Hello ${this.selectOBj.parentClubName},</p><p style="margin:1px">Please find below the link for the report.</p><p>Note: The link will be disabled after 3 days. </p>`;
      this.selectOBj.attachmentName = `Payment_report@${this.selectOBj.parentClubName+ new Date().getTime()}`;
      console.log(this.selectOBj);
       $.ajax({
        url:`${this.sharedservice.getnestURL()}/session/printreport`,
        data: this.selectOBj,
        type: "POST",
         success: function (response) {
            res(response)
        }, error: function (error, xhr) {
          rej(error)
          //that.showToast("Please try again",2000)
        }
      });  
    })
  } 


  sendXLS(){
      this.selectOBj.memerList.forEach((mem)=>{
        if(!this.selectOBj.isTickets){
          delete mem.TotalTickets;
        }if(!this.selectOBj.isDiscount){
          delete mem.discAmount;
        }if(!this.selectOBj.isPaid){
          delete mem.paidAmount;
        }if(!this.selectOBj.isVanue){
          delete mem.venueName;
        }if(!this.selectOBj.isDate){
          delete mem.date;
        }
      });
     console.log(this.selectOBj.memerList)
     try{
      let sentObj = {
          toAddress: this.selectOBj.toAddress,
          //toAddress:'akkellivinod@gmail.com',//need to remove
          fromAddress:'activitypro17@gmail.com',
          ccAddress:'',
          bccAddress:'',
          attachmentType:'XLS',
          attachmentName:`Payment_report@${this.selectOBj.parentClubName+ new Date().getTime()}`,
          attachmentData:this.selectOBj.memerList,
          aplicationType:'Activitypro',
          subject:`${this.selectOBj.subject}@${this.selectOBj.parentClubName}`,
          msgBody:`<p> Hello ${this.selectOBj.parentClubName},</p><p style="margin:1px">Please find below the link for the report.</p><p>Note: The link will be disabled after 3 days. </p>`
      }
      const that = this;
      $.ajax({
          url:`${this.sharedservice.getnestURL()}/superadmin/attachmentemail`,
          data: sentObj,
          type: "POST",
          success: function (response) {
            that.commonService.toastMessage("Report sent successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
          }, error: function (error, xhr) {
            that.commonService.toastMessage("Report sent failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          }
      })
    }catch(err){
        
    }
  
  }


}
class SelectedItems {
  parentClubimagePath: string = "";
  parentClubName: string = "";
  clubName: string = "Not Available";
  toAddress: string = "";
  fromAddress: string = "Not Available";
  ccAddress: string = "Not Available";
  subject: string = "Not Available";
  replyToAddress: Array<string> = [];
  memerList: Array<Member> = [];
  msgBody:string = "";
  attachmentName:string = "";
  isFirstName: boolean = true;
  isLastName: boolean = true;
  isSession: boolean = false;
  isCoach: boolean = false;
  isVanue: boolean = false;
  isDate: boolean = false;
  isMode: boolean = false;
  isDiscount: boolean = false;
  isPaid: boolean = false;
  isTickets:boolean = false;
  isDue:boolean = false;
}
class Member {
  firstName: string = "";
  lastName: string = "";
  EventName: string = "";
  venueName: string = "";
  date: string = "";
  discAmount: string = "";
  paidAmount: string = "";
  TotalTickets:number=0;
}



