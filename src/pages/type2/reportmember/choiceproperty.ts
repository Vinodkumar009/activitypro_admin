// import { Type2ReportMember } from './reportmember';
// import { Dashboard } from '../../dashboard/dashboard';
import { FirebaseService } from '../../../services/firebase.service';
import { Component } from '@angular/core';
import { ToastController, NavParams, NavController, PopoverController, LoadingController, ActionSheetController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import { Storage } from '@ionic/storage';
import * as $ from 'jquery';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import gql from 'graphql-tag';

import { IonicPage } from 'ionic-angular';
import { GraphqlService } from '../../../services/graphql.service';
@IonicPage()
@Component({
    selector: 'choiceproperty-page',
    templateUrl: 'choiceproperty.html'
})

export class Type2ChoiceProperty {
    clubName = "";
    themeType: number;
    loading: any;
    coachKey: any;
    parentClubKey: any;

    obj = {
        Message: ''
    }

    memberObj = {
        memberFirstname: true,
        memberLastname: true,
        memberEmail: true,
        memberAge: true,
        memberDOB: true,
        memberPhone: true
    }


    parentMembersArr:user_report_model[] = [];
    totalMembersArr:user_report_model[] = [];
    desireparentMembersArr = [];
    desireTotalMembersArr = [];
    allParentClubs = [];
    parentClubName = "";
    parentClubMail = "";
    parentClubImage = "";
    report_obj = {
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
    members = [];
    nonMembers = [];
    selectedType: string = "member";
    selectedArray = [];
    userObj: any = "";
    selectedTabType:any;
    postgre_parentclub_id:string;
    constructor(public toastCtrl: ToastController, 
        public loadingCtrl: LoadingController,
        public storage: Storage, public fb: FirebaseService,
        public navCtrl: NavController, 
        public sharedservice: SharedServices,
        public popoverCtrl: PopoverController,
        public navParams: NavParams, 
        public actionSheetCtrl: ActionSheetController, 
        public comonService: CommonService,
        private graphqlService:GraphqlService) {
        this.selectedTabType = 'all';
        this.obj.Message = "Paid by cash to the coach on " + new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();
        this.report_obj.msg_body = "Paid by cash to the coach on " + new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();
        this.themeType = sharedservice.getThemeType();
        // storage.get('userObj').then((val) => {
        //     val = JSON.parse(val);
        //     if (val.$key != "") {
        //         this.parentClubKey = val.UserInfo[0].ParentClubKey;
        //         this.getParentClubDetails();
        //         this.userObj = val;
        //     }
        // })
        this.setupInitialConfig();
        this.clubName = navParams.get('ClubName');
        this.parentMembersArr = navParams.get('totalMembersArr');
        this.totalMembersArr = navParams.get('totalMembersArr');
        // if (this.parentMembersArr != undefined) {
        //     for (let i = 0; i < this.parentMembersArr.length; i++) {
        //         //let age = (new Date().getFullYear() - new Date(this.parentMembersArr[i].DOB).getFullYear());
        //         let age = this.comonService.getAgeFromYYYY_MM(this.parentMembersArr[i].DOB);
        //         if (this.parentMembersArr[i].DOB =="" || this.parentMembersArr[i].DOB == undefined) {
        //             this.parentMembersArr[i].DOB = "N.A";
        //         } 
        //         if (isNaN(age)) {
        //             this.parentMembersArr[i].Age = "N.A";
        //         } else {
        //             this.parentMembersArr[i].Age = age;
        //         }
        //         if(this.parentMembersArr[i].PhoneNumber ==""){
        //             this.parentMembersArr[i].PhoneNumber = this.parentMembersArr[i].EmergencyNumber;
        //         }
        //         if ((this.parentMembersArr[i].IsChild == true && this.parentMembersArr[i].EmailID == "")) {
        //             //if (this.parentMembersArr[i].SignedUpType == 1) {
        //               this.fb.getAllWithQuery('Member/' + this.parentMembersArr[i].ParentClubKey + '/' + this.parentMembersArr[i].ClubKey + '/' , { orderByKey: true, equalTo: this.parentMembersArr[i].ParentKey }).subscribe((data) => {
        //                 if(data.length > 0){
        //                     this.parentMembersArr[i].EmailID = data[0].EmailID;
        //                     //this.parentMembersArr[i].PhoneNumber = data[0].PhoneNumber
        //                 }
        //               });
        //             //}
        //         }
        //         if (this.parentMembersArr[i].IsEnable == true) {
        //             this.members.push(this.parentMembersArr[i]);
        //         } else {
        //             this.nonMembers.push(this.parentMembersArr[i]);
        //         }

        //     }
        // }
        // else if (this.totalMembersArr != undefined) {
        //     for (let i = 0; i < this.totalMembersArr.length; i++) {
        //         //let age = (new Date().getFullYear() - new Date(this.totalMembersArr[i].DOB).getFullYear());
        //         let age = this.comonService.getAgeFromYYYY_MM(this.totalMembersArr[i].DOB);
        //         if (this.totalMembersArr[i].DOB == "" || this.totalMembersArr[i].DOB == undefined) {
        //             this.totalMembersArr[i].DOB = "N.A";
        //         }
        //         if (isNaN(age)) {
        //             this.totalMembersArr[i].Age = "N.A";
        //         } else {
        //             this.totalMembersArr[i].Age = age;
        //         }
        //         if(this.totalMembersArr[i].PhoneNumber ==""){
        //             this.totalMembersArr[i].PhoneNumber = this.totalMembersArr[i].EmergencyNumber;
        //         }
        //         if ((this.totalMembersArr[i].IsChild == true && this.totalMembersArr[i].EmailID == "")) {
        //             //if (this.parentMembersArr[i].SignedUpType == 1) {
        //               this.fb.getAllWithQuery('Member/' + this.totalMembersArr[i].ParentClubKey + '/' + this.totalMembersArr[i].ClubKey + '/' , { orderByKey: true, equalTo: this.totalMembersArr[i].ParentKey }).subscribe((data) => {
        //                   if(data.length > 0){
        //                     this.totalMembersArr[i].EmailID = data[0].EmailID;
        //                     //this.totalMembersArr[i].PhoneNumber = data[0].PhoneNumber
        //                   }
        //               });
        //             //}
        //         }
        //         if (this.totalMembersArr[i].IsEnable == true) {
        //             this.members.push(this.totalMembersArr[i]);
        //         } else {
        //             this.nonMembers.push(this.totalMembersArr[i]);
        //         }
        //     }
        // }
        this.selectedArray = this.totalMembersArr;
        console.log(this.selectedArray)
    }

    async setupInitialConfig() {
        const [login_obj,postgre_parentclub] = await Promise.all([
          this.storage.get('userObj'),
          this.storage.get('postgre_parentclub'),
        ])
        if(postgre_parentclub){
          this.postgre_parentclub_id = postgre_parentclub.Id;
          this.parentClubImage = postgre_parentclub.pa;
          this.parentClubName = postgre_parentclub.ParentClubName;
          this.parentClubMail = postgre_parentclub.ParentClubAdminEmailID;
          //this.parentClubImage = '<img src="' +this.parentClubImage+ '">';
          //this.parentClubImage = '<img src="https://www.tennislinq.com/data/user/club/140tennisclub.jpg">';
          this.report_obj.parentclub_image = postgre_parentclub.ParentClubAppIconURL;
          this.report_obj.parentclub_name = postgre_parentclub.ParentClubName;
          this.report_obj.to_address = postgre_parentclub.ParentClubAdminEmailID;
          
          if(login_obj.RoleType == 6 || login_obj.RoleType == 7 || login_obj.RoleType == 8){
            this.report_obj.to_address = this.userObj.EmailID;
          }
        }
    }

    cancel() {
        this.navCtrl.pop();
    }
    
    changeType(val) {
        this.selectedTabType = "";
        if (val == "member") {
            this.selectedArray = this.members;
            this.selectedTabType = "member";
            this.totalMembersArr = this.parentMembersArr.filter((member) => {return member.MemberType == "Member"})
        } else if (val == "nonmember") {
            this.selectedArray = this.nonMembers;
            this.selectedTabType = "nonmember";
            this.totalMembersArr = this.parentMembersArr.filter((member) => {return member.MemberType == "Non-Member"})
        } else {
            this.selectedArray = this.parentMembersArr;
            this.selectedTabType = "all";
            this.totalMembersArr = JSON.parse(JSON.stringify(this.parentMembersArr));
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

    convertFbObjectToArray(obj: Object): Array<any> {
        let data: Array<any> = [];
        for (let key in obj) {
            let objData: Object = {};
            objData = obj[key];
            objData["Key"] = key;
            data.push(objData);
        }
        return data;
    }

   

    cancelsendMailToParentClub() {
        this.navCtrl.pop();
    }

    async sendMailToParentClub() {
        let sentEmailAddresss = "";
        if (this.userObj.RoleType == 6 || this.userObj.RoleType == 7 || this.userObj.RoleType == 8) {
            sentEmailAddresss = this.userObj.EmailID;
        } else {
            sentEmailAddresss = this.parentClubMail;
        }
        let sentEmailAddress = this.userObj;
        let emailObj = {
            IsFirstName: true,
            IsLastName: true,
            IsPhone: this.memberObj.memberPhone,
            IsEmailId: this.memberObj.memberEmail,
            IsAge: this.memberObj.memberAge,
            IsDOB:true,
            ParentClubName: this.parentClubName,
            ParentClubEmail: sentEmailAddresss,
            //ParentClubEmail: "barun.mishra@kare4u.in",
            ImagePath: this.parentClubImage,
            ClubName: this.clubName,
            Members: []
        }
        this.desireparentMembersArr = [];

        if (this.memberObj.memberEmail == false && this.memberObj.memberAge == false) {
            if (this.selectedArray != undefined) {
                for (let i = 0; i < this.selectedArray.length; i++) {
                    let preparedMemberObj = { FirstName: '', LastName: '', DOB:''};
                    preparedMemberObj.FirstName = this.selectedArray[i].FirstName;
                    preparedMemberObj.LastName = this.selectedArray[i].LastName;
                    preparedMemberObj.DOB = this.selectedArray[i].DOB;
                    this.desireparentMembersArr.push(preparedMemberObj);
                }
            }
            // else if (this.totalMembersArr != undefined) {
            //     for (let i = 0; i < this.totalMembersArr.length; i++) {
            //         let preparedTMemberObj = { FirstName: '', LastName: '', Phone: '', EmailId: '', Age: '' };
            //         preparedTMemberObj.FirstName = this.totalMembersArr[i].FirstName;
            //         preparedTMemberObj.LastName = this.totalMembersArr[i].LastName;
            //         this.desireTotalMembersArr.push(preparedTMemberObj);
            //     }
            // }
        }
        else if (this.memberObj.memberEmail == true && this.memberObj.memberAge == false) {
            if (this.selectedArray != undefined) {
                for (let i = 0; i < this.selectedArray.length; i++) {
                    let preparedMemberObj = { FirstName: '', LastName: '', DOB:'', Phone: '', EmailId: ''};
                    preparedMemberObj.FirstName = this.selectedArray[i].FirstName;
                    preparedMemberObj.LastName = this.selectedArray[i].LastName;
                    preparedMemberObj.DOB = this.selectedArray[i].DOB;
                    preparedMemberObj.EmailId = this.selectedArray[i].EmailID;
                    preparedMemberObj.Phone = this.selectedArray[i].PhoneNumber;
                    this.desireparentMembersArr.push(preparedMemberObj);
                }
            }
            // else if (this.totalMembersArr != undefined) {
            //     for (let i = 0; i < this.totalMembersArr.length; i++) {
            //         let preparedTMemberObj = { FirstName: '', LastName: '', Phone: '', EmailId: '', Age: '' };
            //         preparedTMemberObj.FirstName = this.totalMembersArr[i].FirstName;
            //         preparedTMemberObj.LastName = this.totalMembersArr[i].LastName;
            //         preparedTMemberObj.EmailId = this.totalMembersArr[i].EmailID;
            //         preparedTMemberObj.Phone = this.totalMembersArr[i].PhoneNumber;
            //         this.desireTotalMembersArr.push(preparedTMemberObj);
            //     }
            // }
        }
        else if (this.memberObj.memberEmail == false && this.memberObj.memberAge == true) {
            if (this.selectedArray != undefined) {
                for (let i = 0; i < this.selectedArray.length; i++) {
                    let preparedMemberObj = { FirstName: '', LastName: '', DOB:'', Phone: '', EmailId: '', Age: '' };
                    preparedMemberObj.FirstName = this.selectedArray[i].FirstName;
                    preparedMemberObj.LastName = this.selectedArray[i].LastName;
                    preparedMemberObj.DOB = this.selectedArray[i].DOB;
                    preparedMemberObj.Age = this.selectedArray[i].Age;
                    preparedMemberObj.Phone = this.selectedArray[i].PhoneNumber;
                    this.desireparentMembersArr.push(preparedMemberObj);
                }
            }
            // else if (this.totalMembersArr != undefined) {
            //     for (let i = 0; i < this.totalMembersArr.length; i++) {
            //         let preparedTMemberObj = { FirstName: '', LastName: '', Phone: '', EmailId: '', Age: '' };
            //         preparedTMemberObj.FirstName = this.totalMembersArr[i].FirstName;
            //         preparedTMemberObj.LastName = this.totalMembersArr[i].LastName;
            //         preparedTMemberObj.Age = this.totalMembersArr[i].Age;
            //         preparedTMemberObj.Phone = this.totalMembersArr[i].PhoneNumber;
            //         this.desireTotalMembersArr.push(preparedTMemberObj);
            //     }
            // }
        }
        else if (this.memberObj.memberEmail == true && this.memberObj.memberAge == true) {
            if (this.selectedArray != undefined) {
                for (let i = 0; i < this.selectedArray.length; i++) {
                    let preparedMemberObj = { FirstName: '', LastName: '', EmailId: '', DOB:'', Age: '', Phone: '' };
                    preparedMemberObj.FirstName = this.selectedArray[i].FirstName;
                    preparedMemberObj.LastName = this.selectedArray[i].LastName;
                    preparedMemberObj.EmailId = this.selectedArray[i].EmailID;
                    preparedMemberObj.DOB = this.selectedArray[i].DOB;
                    preparedMemberObj.Age = this.selectedArray[i].Age;
                    preparedMemberObj.Phone = this.selectedArray[i].PhoneNumber;
                    this.desireparentMembersArr.push(preparedMemberObj);
                }
            }
            
        }
        
        let url = this.sharedservice.getEmailUrl();

        //console.log(emailObj);
        emailObj.Members = this.desireparentMembersArr;
        this.presentActionSheet(emailObj);
        // let url= "http://localhost:32682/";
        // if (this.desireparentMembersArr.length > 0) {
        //     emailObj.Members = this.desireparentMembersArr;


        //     console.clear();
        //     console.log(emailObj);


        //     $.ajax({
        //         url: url + "umbraco/surface/ActivityProSurface/CreatePdf/",
        //         data: emailObj,
        //         type: "POST",
        //         success: function (response) {

        //         }, error: function (error, xhr) {



        //         }
        //     });
        //     let message = "Email has been successfully sent.";
        //     this.showToast(message, 5000);
        //     this.navCtrl.push("Type2ReportMember");
        // }
        // else if (this.desireTotalMembersArr.length > 0) {
        //     emailObj.Members = this.desireTotalMembersArr;

        //     $.ajax({
        //         url: url + "umbraco/surface/ActivityProSurface/CreatePdf/",
        //         data: emailObj,
        //         //  {
        //         //     details: this.desireTotalMembersArr,
        //         //     parentclubname: this.parentClubName,
        //         //     parentclubmail: this.parentClubMail
        //         //     //parentclubimage: this.parentClubImage
        //         // },
        //         type: "POST",


        //         success: function (response) {

        //         }, error: function (error, xhr) {

        //             //alert("Email has been successfully sent.");


        //         }
        //     });
        //     let message = "Email has been successfully sent.";
        //     this.showToast(message, 5000);
        //     this.navCtrl.push("Type2ReportMember");
        // }

    }
    presentActionSheet(obj) {
        const actionSheet = this.actionSheetCtrl.create({
            title: 'Send Report',
            buttons: [
                {
                    text: 'PDF',
                    handler: () => {
                        this.sendPDF()
                    }
                }, {
                    text: 'Excel',
                    handler: async() => { 
                        try{    
                            let res = await this.sendXLS(obj);
                            let message = "Email sent successfully...";
                            this.comonService.toastMessage(message, 2500,ToastMessageType.Success);
                        }catch(err){
                            this.comonService.toastMessage('Failed to send email, please try again.', 2500,ToastMessageType.Error);
                        }
                    }
                       
                }
            ]
        });
        actionSheet.present();
    }
    // sendPDF(emailObj) {
    //     let url = this.sharedservice.getEmailUrl();
    //     $.ajax({
    //         url: url + "umbraco/surface/ActivityProSurface/CreatePdf/",
    //         data: emailObj,
    //         type: "POST",
    //         success: function (response) {
    //         }, error: function (error, xhr) {
    //         }
    //     });
    //     let message = "Email sent successfully...";
    //     this.showToast(message, 3000);
    //     //this.navCtrl.push("Type2ReportMember");
    // }
    sendPDF(){
        try{
           this.comonService.showLoader("Please wait");
            this.totalMembersArr.forEach((mem)=>{
            //   if(!this.selectOBj.isCoach){
            //     delete mem.Coach;
            //   }if(!this.selectOBj.isDiscount){
            //     delete mem.Discount;
            //   }
            //   if(!this.selectOBj.isDue){
            //     delete mem.DueAmount;
            //   }
            //   if(!this.selectOBj.isMode){
            //     delete mem.PaidBy;
            //   }
            //   if(!this.selectOBj.isPaid){
            //     delete mem.PaidAmount;
            //   }
            //   if(!this.selectOBj.isSession){
            //     delete mem.Session;
            //   }
            //   if(!this.selectOBj.isVanue){
            //     delete mem.Venue;
            //   }
            })
            
            this.report_obj.memer_list = this.totalMembersArr;
            //this.selectOBj.ccAddress = this.parentClubInfo.ParentClubAdminEmailID;
            //this.report_obj.to_address="vinodkumar1993.09@gmail.com";//need to remove
            this.report_obj.msg_body = `<p> Hello ${this.report_obj.parentclub_name},</p><p style="margin:1px">Please find below the link for the report.</p><p>Note: The link will be disabled after 3 days. </p>`;
            this.report_obj.attachment_name = `Payment_report@${this.report_obj.parentclub_name+ new Date().getTime()}`;
            console.log(this.report_obj);
            const report_mutation = gql`
              mutation sendSessionReport($reportInput: ReportModel_V1!) {
                sendSessionReport(sessionReportInput: $reportInput)
              }` 
              
              const report_variable = { reportInput: this.report_obj };
              this.graphqlService.mutate(report_mutation, report_variable,0).subscribe((response)=>{
                this.comonService.hideLoader();
                this.comonService.toastMessage("Report sent successfully",2500,ToastMessageType.Success, ToastPlacement.Bottom);
                this.navCtrl.pop();
                //this.navCtrl.remove(this.navCtrl.getActive().index - 1, 2);
              },(err)=>{
                this.comonService.hideLoader();
                if(err.error != undefined){
                  this.comonService.toastMessage(err.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
                }else{
                  this.comonService.toastMessage("Report sent failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
                }
              }); 
            // $.ajax({
            //   url:`${this.nestUrl}/session/printreport`,
            //   data: this.selectOBj,
            //   type: "POST",
            //    success: function (response) {
            //       res(response)
            //   }, error: function (error, xhr) {
            //     rej(error)
            //     //that.showToast("Please try again",2000)
            //   }
            // }); 
          }catch(err){
            this.comonService.hideLoader();
            this.comonService.toastMessage("Report sent failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
          }
    }
     sendXLS(emailObj) { 
        return new Promise(async(res,rej)=>{
            try{
                const toaddress = this.report_obj.to_address;
                let sentObj = {
                    toAddress:toaddress,
                    fromAddress:'activitypro17@gmail.com',
                    ccAddress:this.parentClubMail,
                    bccAddress:'',
                    attachmentType:'XLS',
                    attachmentName:`Member_report@${this.clubName + new Date().getTime()}`,
                    attachmentData:this.totalMembersArr,
                    aplicationType:'Activitypro',
                    subject:`Member Report of ${this.clubName}`,
                    msgBody:`<p> Hello ${this.clubName},</p><p style="margin:1px">Please find below the link for the report.</p><p>Note: The link will be disabled after 3 days. </p>`
                }
               // url:"https://topgradez.appspot.com/messege/sendattachment"
                $.ajax({
                    url:`${this.sharedservice.getnestURL()}/superadmin/attachmentemail`,
                    data: sentObj,
                    type: "POST",
                    success: function (response) {
                       res(response)
                    }, error: function (error, xhr) {
                        rej(error);
                    }
                });
                this.navCtrl.pop()
            }catch(err){
                rej(err)
            }
        })
       
       
        
       

    }
}




export class user_report_model {
    FirstName: string;
    LastName: string;
    Age:string
    EmailID:string
    PhoneNumber:string;
    MemberType:string;
}