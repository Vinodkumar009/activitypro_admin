import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ActionSheetController } from 'ionic-angular';
import { FirebaseService } from '../../../../services/firebase.service';
import * as $ from 'jquery';
import { SharedServices } from '../../../services/sharedservice';
import { ToastController } from 'ionic-angular/components/toast/toast-controller';
import { Storage } from '@ionic/storage';


/**
 * Generated class for the PrintmembershipPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-printmembership',
  templateUrl: 'printmembership.html',
})
export class PrintmembershipPage {
  showType: any = "";
  memberList: Array<any> = [];
  parentClubKey: string = "";
  termKey: string = "";
  reportType: string = "";
  parentClubInfo: any = {};
  selectOBj: SelectedItems;   
  userObj:any = "";
  constructor(public sharedservice: SharedServices, public loadingCtrl:LoadingController, public navCtrl: NavController, public navParams: NavParams, public fb: FirebaseService,public toastCtrl:ToastController,public actionSheetCtrl:ActionSheetController,public storage:Storage) {
    this.selectOBj = new SelectedItems();
    this.showType = this.navParams.get('showType');
    if(this.showType == 'due'){
      this.selectOBj.isDue = true;
      this.selectOBj.subject = "Payment Report: Due Members"
    }else if(this.showType == 'paid'){
      this.selectOBj.subject = "Payment Report: Paid Members"
    }
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
    this.fb.getAllWithQuery("ParentClub/Type2", { orderByKey: true, equalTo: this.parentClubKey }).subscribe((data) => {
      this.parentClubInfo = data[0];
      this.selectOBj.parentClubimagePath = this.parentClubInfo.ParentClubAppIconURL;
      this.selectOBj.parentClubName = this.parentClubInfo.ParentClubName;
      this.selectOBj.toAddress = this.parentClubInfo.ParentClubAdminEmailID;
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
  sendMailToParentClub() {
    let url = this.sharedservice.getEmailUrl();
    console.log(this.selectOBj);
   // let url = "http://localhost:32682/"
    // $.ajax({
     
    //   url: url+"umbraco/surface/ActivityProSurface/CreatePDFforSessionPaidMember/",
    //   data: this.selectOBj,
    //   type: "POST",
    //   success: function (response) {
    //     console.log(response)
    //    // this.showToast("Report has been sent",2000)
    //   }, error: function (error, xhr) {
    //     this.showToast("Please try again",2000)
    //   }
    // });
    this.showToast("Report sent successfully to your email",2000)
   // this.navCtrl.pop();
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
      // if (member.DiscountAmountIncludingCharges != undefined) {
      //   tempMemberObj.discAmount = member.DiscountAmountIncludingCharges;
      // } else {
      //   tempMemberObj.discAmount = "Not Available";
      // }
      if (member.PaymentOptions != undefined) {
        tempMemberObj.PaymentType = member.PaymentOptions;
      } else {
        tempMemberObj.PaymentType = "Not Available";
      }
      if (member.Amount != undefined) {
        tempMemberObj.PaidAmount = member.Amount;
      } else {
        tempMemberObj.PaidAmount = "Not Available";
      }
      if (member.MembershipName != undefined) {
        tempMemberObj.Membership = member.MembershipName;
      } else {
        tempMemberObj.Membership = "Not Available";
      }
      // if (member.ClubName != undefined) {
      //   tempMemberObj.venueName = member.ClubName;
      // } else {
      //   tempMemberObj.venueName = "Not Available";
      // }
      if (member.Amount != undefined ) {
        tempMemberObj.DueAmount = member.Amount;
      } else {
        tempMemberObj.DueAmount = "Not Available";
      }
      tempMemberObj.Member = member.MemberName;
      
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
                    let res =  await this.sendXLS();
                    let message = "Email sent successfully...";
                    this.showToast(message, 5000);
                    this.navCtrl.pop();
                }catch(err){
                    this.showToast('Failed to send email,please try again.', 3000);
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
      this.navCtrl.pop();
      this.showToast(pdfstatus.message,2000);
    }else{
      this.loading.dismiss();
      this.showToast(pdfstatus.message,2000);
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
        if(!this.selectOBj.isDue){
          delete mem.DueAmount;
        }
        if(!this.selectOBj.isMode){
          delete mem.PaymentType;
        }
        if(!this.selectOBj.isPaid){
          delete mem.PaidAmount;
        }
        if(!this.selectOBj.isSession){
          delete mem.Membership;
        }
        // if(!this.selectOBj.isVanue){
        //   delete mem.venueName;
        // }
      })
      let url = this.sharedservice.getEmailUrl();
      this.selectOBj.ccAddress = this.parentClubInfo.ParentClubAdminEmailID;
      //this.selectOBj.toAddress="vinod.kumar@kare4u.in";//need to remove
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
    return new Promise((res,rej)=>{
      this.selectOBj.memerList.forEach((mem)=>{
        // if(!this.selectOBj.isCoach){
        //   delete mem.coachName;
        // }
        // if(!this.selectOBj.isDiscount){
        //   delete mem.discAmount;
        // }
        if(!this.selectOBj.isDue){
          delete mem.DueAmount;
        }
        if(!this.selectOBj.isMode){
          delete mem.PaymentType;
        }
        if(!this.selectOBj.isPaid){
          delete mem.PaidAmount;
        }
        if(!this.selectOBj.isSession){
          delete mem.Membership;
        }
        
      })
     console.log(this.selectOBj.memerList)
     try{
      let sentObj = {
          toAddress: this.selectOBj.toAddress,
          //toAddress:'akkellivinod@gmail.com',//need to remove
          fromAddress:'activitypro17@gmail.com',
          ccAddress:this.parentClubInfo.ParentClubAdminEmailID,
          bccAddress:'',
          attachmentType:'XLS',
          attachmentName:`Payment_report@${this.selectOBj.parentClubName+ new Date().getTime()}`,
          attachmentData:this.selectOBj.memerList,
          aplicationType:'Activitypro',
          subject:`${this.selectOBj.subject}@${this.selectOBj.parentClubName}`,
          msgBody:`<p> Hello ${this.selectOBj.parentClubName},</p><p style="margin:1px">Please find below the link for the report.</p><p>Note: The link will be disabled after 3 days. </p>`
      }
      $.ajax({
          url:`${this.sharedservice.getnestURL()}/superadmin/attachmentemail`,
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
  isCoach: boolean = false;
  isVanue: boolean = false;
  isDate: boolean = false;
  isMode: boolean = false;
  isDiscount: boolean = false;
  isPaid: boolean = false;
  isDue:boolean = false;
}
class Member {
  Member: string = "";
  // lastName: string = "";
  // sessionName: string = "";
  Membership:string = "";
  //coachName: string = "";
  //venueName: string = "";
  Date: string = "";
  PaymentType: string = "";
  //discAmount: string = "";
  PaidAmount: string = "";
  DueAmount:string = "";
}