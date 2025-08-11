import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ActionSheetController } from 'ionic-angular';
import { FirebaseService } from '../../../../services/firebase.service';
import * as $ from 'jquery';
import { SharedServices } from '../../../services/sharedservice';
import { ToastController } from 'ionic-angular/components/toast/toast-controller';
import { CommonService, ToastPlacement, ToastMessageType } from '../../../../services/common.service';
import { Storage } from '@ionic/storage';
/**
 * Generated class for the PaidmemberstatusPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-campprint',
  templateUrl: 'campprint.html',
})
export class CampReportPrint {
  
  memberList: Array<any> = [];
  parentClubKey: string = "";
  reportType: string = "";
  parentClubInfo: any = {};
  selectOBj: SelectedItems;   
  userObj:any = "";
  nestUrl = "";
  constructor(public sharedservice: SharedServices, public commonService: CommonService, public loadingCtrl:LoadingController, public navCtrl: NavController, public navParams: NavParams, public fb: FirebaseService,public toastCtrl:ToastController,public actionSheetCtrl:ActionSheetController,public storage:Storage) {
    this.selectOBj = new SelectedItems();
    this.nestUrl = this.sharedservice.getnestURL();
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
          this.parentClubKey = val.UserInfo[0].ParentClubKey;
          this.userObj = val;
          this.getParentClubInfo();
      }
      // this.loading.dismiss().catch(() => { });
  })
    this.parentClubKey = this.navParams.get('parentClubKey');
    this.memberList = this.navParams.get('memberList');
    this.reportType = this.navParams.get('reportType');
    console.log(this.memberList);
    
    this.preparememberObj()
  }
  getParentClubInfo() {
    let parentclubObs = this.fb.getAllWithQuery("ParentClub/Type2", { orderByKey: true, equalTo: this.parentClubKey }).subscribe((data) => {
      this.parentClubInfo = data[0];
      parentclubObs.unsubscribe();
      this.selectOBj.parentClubimagePath = this.parentClubInfo.ParentClubAppIconURL;
      this.selectOBj.parentClubName = this.parentClubInfo.ParentClubName;
      this.selectOBj.toAddress = this.parentClubInfo.ParentClubAdminEmailID;
      this.selectOBj.msgBody = `<p> Hello ${this.selectOBj.parentClubName},</p><p style="margin:1px">Please find below the link for the report.</p><p>Note: The link will be disabled after 3 days. </p>`;
      this.selectOBj.attachmentName = `CampsPayment_Report@${this.selectOBj.parentClubName+ new Date().getTime()}`;
      if(this.userObj.RoleType == 6 || this.userObj.RoleType == 7 || this.userObj.RoleType == 8){
        this.selectOBj.toAddress = this.userObj.EmailID;
      }
    })
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad PaidmemberstatusPage');
  }
  cancelsendMailToParentClub() {
    this.navCtrl.pop();
  }
  
  
  preparememberObj() {
    let selectedMemberArr = [];

    this.memberList.forEach((member) => {
      let tempMemberObj: Member = new Member();
      //tempMemberObj.coachName = member.CoachName;
      if (member.TransactionDate != undefined) {
        tempMemberObj.Date = member.TransactionDate;
      } else {
        tempMemberObj.Date = "Not Available";
      }
      if (member.DiscountAmountIncludingCharges != undefined) {
        tempMemberObj.DiscAmount = member.DiscountAmountIncludingCharges;
      } else {
        tempMemberObj.DiscAmount = "Not Available";
      }
      if (member.PaidBy != undefined) {
        tempMemberObj.Mode = member.PaidBy;
      } else {
        tempMemberObj.Mode = "Not Available";
      }
      if (member.AmountPaid != undefined) {
        tempMemberObj.PaidAmount = member.AmountPaid;
      } else {
        tempMemberObj.PaidAmount = "Not Available";
      }
      if (member.CampName != undefined) {
        tempMemberObj.CampName = member.CampName;
      } else {
        tempMemberObj.CampName = "Not Available";
      }
      if (member.ClubName != undefined) {
        tempMemberObj.VenueName = member.ClubName;
      } else {
        tempMemberObj.VenueName = "Not Available";
      }
      //if (member.AmountDue != undefined ) {
      if (member.DueAmount != undefined ) {
        tempMemberObj.DueAmount = member.AmountDue ? member.AmountDue : member.DueAmount;
      } else {
        tempMemberObj.DueAmount = "Not Available";
      }
      tempMemberObj.FirstName = member.FirstName;
      tempMemberObj.LastName = member.LastName;
      tempMemberObj.MemberType = member.IsEnable ? "Member" : "Non-Member"
      selectedMemberArr.push(tempMemberObj);
    });
    this.selectOBj.memerList = selectedMemberArr;
    console.log(this.selectOBj.memerList);
  }
  showToast(m: string, howLongShow: number) {
    let toast = this.toastCtrl.create({
        message: m,
        duration: howLongShow,
        position: 'bottom'
    });
    toast.present();
  }

  presentActionSheet() {
    const actionSheet = this.actionSheetCtrl.create({
        title: 'Send Report',
        buttons: [
            {
                text: 'PDF',
                handler: () => {
                    this.sendPDF();
                }
            }, {
                text: 'Excel',
                handler: async() => { try{ 
                    this.commonService.showLoader("Please wait");
                    let res =  await this.sendXLS();
                    this.commonService.hideLoader();
                    let message = "Email sent successfully...";
                    this.commonService.toastMessage(message,2500,ToastMessageType.Success,ToastPlacement.Bottom);
                    this.navCtrl.pop();
                }catch(err){
                  this.commonService.hideLoader();
                    this.commonService.toastMessage("Failed to send email,please try again.",2500,ToastMessageType.Error,ToastPlacement.Bottom);
                }
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

    loading:any;
   async sendPDF(){
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.loading.present();
    let pdfstatus:any = await this.sendPDfRequest();
    if(pdfstatus.status == 200){
      console.log();
      this.loading.dismiss();
      this.commonService.toastMessage(pdfstatus.message,2500,ToastMessageType.Success,ToastPlacement.Bottom);
      this.navCtrl.pop();
    }else{
      this.loading.dismiss();
      this.commonService.toastMessage(pdfstatus.message,2500,ToastMessageType.Error,ToastPlacement.Bottom);
    }
    
  }

  
  sendPDfRequest(){
    return new Promise((res,rej)=>{
      this.selectOBj.memerList.forEach((mem)=>{
        // if(!this.selectOBj.isCoach){
        //   delete mem.coachName;
        // }
        // if(!this.selectOBj.isDiscount){
        //   delete mem.discAmount;
        // }
        delete mem.DiscAmount; //as of we'r not printing discount so removing that prop
        if(!this.selectOBj.isDue){
          delete mem.DueAmount;
        }
        if(!this.selectOBj.isMode){
          delete mem.Mode;
        }
        if(!this.selectOBj.isPaid){
          delete mem.PaidAmount;
        }
        if(!this.selectOBj.isSession){
          delete mem.CampName;
        }
        if(!this.selectOBj.isVanue){
          delete mem.VenueName;
        }
      })
      this.selectOBj.ccAddress = this.parentClubInfo.ParentClubAdminEmailID;
      let url = this.sharedservice.getEmailUrl();
      this.selectOBj.subject = `Holidaycamp Report @${this.selectOBj.parentClubName}`;
      //this.selectOBj.toAddress="vinod.kumar@kare4u.in";//need to remove
      
      console.log(this.selectOBj);
       $.ajax({
        url:`${this.nestUrl}/session/printreport`,
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
    return new Promise((res,rej)=>{
      this.selectOBj.memerList.forEach((mem)=>{
        // if(!this.selectOBj.isCoach){
        //   delete mem.coachName;
        // }
        // if(!this.selectOBj.isDiscount){
        //   delete mem.discAmount;
        // }
        delete mem.DiscAmount;//as of we'r not printing discount so removing that prop
        if(!this.selectOBj.isDue){
          delete mem.DueAmount;
        }
        if(!this.selectOBj.isMode){
          delete mem.Mode;
        }
        if(!this.selectOBj.isPaid){
          delete mem.PaidAmount;
        }
        if(!this.selectOBj.isSession){
          delete mem.CampName;
        }
        if(!this.selectOBj.isVanue){
          delete mem.VenueName;
        }
      })
     console.log(this.selectOBj.memerList)
     try{
      let sentObj = {
          toAddress:this.selectOBj.toAddress,// this.selectOBj.toAddress, need to remove
          fromAddress:'activitypro17@gmail.com',
          ccAddress:this.parentClubInfo.ParentClubAdminEmailID,
          bccAddress:'',
          attachmentType:'XLS',
          attachmentName:`Payment_report@${this.selectOBj.parentClubName+ new Date().getTime()}`,
          attachmentData:this.selectOBj.memerList,
          aplicationType:'Activitypro',
          subject:`Holidaycamp Report@${this.selectOBj.parentClubName}`,
          msgBody:`<p> Hello ${this.selectOBj.parentClubName},</p><p style="margin:1px">Please find below the link for the report.</p><p>Note: The link will be disabled after 3 days. </p>`
      }
      $.ajax({
          url:`${this.nestUrl}/superadmin/attachmentemail`,
          data: sentObj,
          type: "POST",
          success: function (response) {
             res(response);
          }, error: function (error, xhr) {
              rej(error);
          }
      });
      
  }catch(err){
      rej(err)
  }
    })
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
  //isCoach: boolean = false;
  isVanue: boolean = false;
  isDate: boolean = false;
  isMode: boolean = false;
  //isDiscount: boolean = false;
  isPaid: boolean = false;
  isDue:boolean = false;
}
class Member {
  FirstName: string = "";
  LastName: string = "";
  CampName: string = "";
  //coachName: string = "";
  VenueName: string = "";
  Date: string = "";
  Mode: string = "";
  DiscAmount: string = "";
  PaidAmount: string = "";
  DueAmount:string = "";
  MemberType:string = "";
}
