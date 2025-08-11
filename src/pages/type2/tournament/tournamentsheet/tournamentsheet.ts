import { Component, ViewChildren } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, ModalController, ToastController, AlertController, Platform, ActionSheetController } from 'ionic-angular';
// import * as moment from 'moment';
import { Storage } from '@ionic/storage';

import moment, { Moment } from 'moment';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { FirebaseService } from '../../../../services/firebase.service';
import { SharedServices } from '../../../services/sharedservice';
import * as $ from 'jquery';
// import { IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
    selector: 'page-tournamentsheet',
    templateUrl: 'tournamentsheet.html',
})
export class TournamentSheetPage {
    parentClubKey: string;
    userObj:any;
    IsActiveTournament = 'Active'
    activeTournament = [];
    members = [];
    Tournament: any;
    currencyDetails: any;
    sessionInfo: any = {};
    actionSheet: any = {
        StartDate: '',
        EndDate: '',
        FirstName: true,
        LastName: true,
        MedicalCondition: false,
        Age: false,
        Gender: false,
        EmailID: false,
        PaymentStatus: false,
        Phone: false,
        SchoolSessionName: "",
        ParentClubEmail: '',
        ParentClubName: '',
        SessionDetails: '',
        Subject: '',
        SchoolName: ''
    };
    blockShowToggle: boolean = false;
    membersheetSubject: string = "";
    checkedFilterBoxes: Set<String> = new Set();
    parentClubDetails: any = "";
    
    inclusionSet: Set<String>;
    selectOBj: SelectedItems; 
    memberDetailsArr: Array<any> = new Array();
    clubInfo: any = "";
    
    constructor(public altctrl: AlertController, public toastCtrl: ToastController,
        public sharedservice: SharedServices, public fb: FirebaseService,
        public navCtrl: NavController, public navParams: NavParams,
        public commonService: CommonService, public storage:Storage,) {
        this.checkedFilterBoxes.add('FirstName');
        this.checkedFilterBoxes.add('LastName');
        this.Tournament = this.navParams.get('Tournament');
        this.members = this.navParams.get('memberArr');
        if (this.members != undefined && this.members.length > 0) {
            this.sessionInfo.Member = this.members;
            this.checkForEmailsNPhoneNos();
        }
        console.log(this.Tournament, this.members);
        this.inclusionSet = new Set<String>(this.sharedservice.getMedicalInclusionList());
        this.selectOBj = new SelectedItems();
        
        // this.sessionInfo = this.navParams.get('sessionOInfo');
        // if (this.sessionInfo.Member != undefined) {
        //     if (this.sessionInfo.Member.length == undefined) {
        //         this.sessionInfo.Member = this.commonService.convertFbObjectToArray(this.sessionInfo.Member);
        //     }
        // }
        this.storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            if (val.$key != "") {
                this.parentClubKey = val.UserInfo[0].ParentClubKey;
                this.userObj = val;
                this.getparentClubdetails();
            }
        });

        this.selectOBj.subject = this.Tournament.TournamentName + "-" + "Tournament Member Sheet";
        
    }


    ionViewDidLoad() {
    }

    async checkForEmailsNPhoneNos(){
        for (let i = 0; i < this.sessionInfo.Member.length; i++) {

            if (this.sessionInfo.Member[i].IsActive) {
                if(this.sessionInfo.Member[i]["DOB"]){
                    let arr = this.sessionInfo.Member[i]["DOB"].split("-");
                    let nowYear = moment().format("YYYY");
                    let nowMonth = moment().format("MM");
                    var a = moment(new Date(arr[0] + "," + arr[1] + "," + 1).getTime());
                    var b = moment(new Date(nowYear + "," + nowMonth + "," + 1).getTime());
                    this.sessionInfo.Member[i]['Age'] = b.diff(a, 'years');
                }else{
                    this.sessionInfo.Member[i]['Age'] = "N.A"
                }

                this.sessionInfo.Member[i].MedicalCondition = await this.fb.getPropValue("/Member/" + this.Tournament.ParentClubKey + "/" + this.Tournament.ClubKey + "/" + this.sessionInfo.Member[i].Key + "/MedicalCondition")
                this.sessionInfo.Member[i].Gender = await this.fb.getPropValue("/Member/" + this.Tournament.ParentClubKey + "/" + this.Tournament.ClubKey + "/" + this.sessionInfo.Member[i].Key + "/Gender")
                    
                    if(!this.sessionInfo.Member[i].PhoneNumber ||  this.sessionInfo.Member[i].PhoneNumber == ""){
                        this.sessionInfo.Member[i].PhoneNumber = this.sessionInfo.Member[i].PhoneNumber !='' && this.sessionInfo.Member[i].PhoneNumber ? this.sessionInfo.Member[i].PhoneNumber : this.sessionInfo.Member[i].EmergencyNumber;
                    }
                    this.sessionInfo.Member[i].EmailID = this.sessionInfo.Member[i].EmailID;
                    if (this.sessionInfo.Member[i].IsChild) {
                        let parentkey = await this.fb.getPropValue("/Member/" + this.Tournament.ParentClubKey + "/" + this.Tournament.ClubKey + "/" + this.sessionInfo.Member[i].Key + "/ParentKey");
                        this.sessionInfo.Member.EmailID = await this.fb.getPropValue("/Member/" + this.Tournament.ParentClubKey + "/" + this.Tournament.ClubKey + "/" + parentkey + "/EmailID");
                        this.sessionInfo.Member.PhoneNumber = await this.fb.getPropValue("/Member/" + this.Tournament.ParentClubKey + "/" + this.Tournament.ClubKey + "/" + parentkey + "/PhoneNumber");  
                    }
            }
        }
    }

    showHide() {
        this.blockShowToggle = !this.blockShowToggle;
    }
    add(itemName: String) {

        if (this.checkedFilterBoxes.has(itemName)) {
            this.checkedFilterBoxes.delete(itemName);
        } else {
            this.checkedFilterBoxes.add(itemName);
        }
    }
    async getMemberDetails() {
        this.memberDetailsArr = [];
        let checkedArr: Array<any> = Array.from(this.checkedFilterBoxes);
        for (let i = 0; i < this.sessionInfo.Member.length; i++) {

            if (this.sessionInfo.Member[i].IsActive) {
                // if(this.sessionInfo.Member[i]["DOB"]){
                //     let arr = this.sessionInfo.Member[i]["DOB"].split("-");
                //     let nowYear = moment().format("YYYY");
                //     let nowMonth = moment().format("MM");
                //     var a = moment(new Date(arr[0] + "," + arr[1] + "," + 1).getTime());
                //     var b = moment(new Date(nowYear + "," + nowMonth + "," + 1).getTime());
                //     this.sessionInfo.Member[i]['Age'] = b.diff(a, 'years');
                // }else{
                //     this.sessionInfo.Member[i]['Age'] = "N.A"
                // }
                
                this.sessionInfo.Member[i]['PaymentStatus'] = this.sessionInfo.Member[i]['AmountPayStatus']
                //a.diff(b, 'days') // 1
                let memberObj: any = {};
                for (let j = 0; j < checkedArr.length; j++) {
                    memberObj[checkedArr[j]] = this.sessionInfo.Member[i][checkedArr[j]];
                }
                // memberObj.MedicalCondition = await this.fb.getPropValue("/Member/" + this.Tournament.ParentClubKey + "/" + this.Tournament.ClubKey + "/" + this.sessionInfo.Member[i].Key + "/MedicalCondition")
                // memberObj.Gender = await this.fb.getPropValue("/Member/" + this.Tournament.ParentClubKey + "/" + this.Tournament.ClubKey + "/" + this.sessionInfo.Member[i].Key + "/Gender")
                    
                //     if(!memberObj.PhoneNumber ||  memberObj.PhoneNumber == ""){
                //         memberObj.PhoneNumber = memberObj.PhoneNumber !='' && memberObj.PhoneNumber ? memberObj.PhoneNumber : memberObj.EmergencyNumber;
                //     }
                //     memberObj.EmailID = memberObj.EmailID;
                //     if (this.sessionInfo.Member[i].IsChild) {
                //         let parentkey = await this.fb.getPropValue("/Member/" + this.Tournament.ParentClubKey + "/" + this.Tournament.ClubKey + "/" + this.sessionInfo.Member[i].Key + "/ParentKey");
                //         memberObj.EmailID = await this.fb.getPropValue("/Member/" + this.Tournament.ParentClubKey + "/" + this.Tournament.ClubKey + "/" + parentkey + "/EmailID");
                //         memberObj.PhoneNumber = await this.fb.getPropValue("/Member/" + this.Tournament.ParentClubKey + "/" + this.Tournament.ClubKey + "/" + parentkey + "/PhoneNumber");
                //     }
                    this.memberDetailsArr.push(memberObj);
            }
            
        }
        // if (this.checkedFilterBoxes.has('MedicalCondition')) {
        //     for (let i = 0; i < this.memberDetailsArr.length; i++) {
        //         this.memberDetailsArr[i]['HasDisease'] = !this.inclusionSet.has(this.memberDetailsArr[i]['MedicalCondition']);
        //     }
        // }
        this.selectOBj.memerList = this.memberDetailsArr;
        this.actionSheet["members"] = this.memberDetailsArr;
        this.actionSheet.SchoolSessionName = this.Tournament.TournamentName;
        this.actionSheet.SchoolName = this.Tournament.ClubName;
        // this.actionSheet.SchoolName = this.sessionInfo.SchoolName;
        this.actionSheet.SessionDetails = this.Tournament.TournamentName + "-" + this.Tournament.StartTime + "hrs";
        this.present();
        if (this.checkedFilterBoxes.has('MedicalCondition')) {
            for (let i = 0; i < this.memberDetailsArr.length; i++) {
                let hasMedicalCondition:boolean = this.inclusionSet.has(this.memberDetailsArr[i]['MedicalCondition']);
                this.memberDetailsArr[i]['MedicalCondition'] = hasMedicalCondition ? this.memberDetailsArr[i]['MedicalCondition'] : "No";
                for (var key in this.memberDetailsArr[i]) {
                    if (this.memberDetailsArr[i].hasOwnProperty(key)) {
                        //console.log(key + " -> " + this.memberDetailsArr[i][key]);
                        if (typeof this.memberDetailsArr[i][key] === 'string') {
                            this.memberDetailsArr[i][key] = this.memberDetailsArr[i][key].toLowerCase();
                            this.memberDetailsArr[i][key] = this.commonService.capitalizeFirstLetter(this.memberDetailsArr[i][key]);
                        }
                    }
                }
            }
        }
        
        
    }
    proceed() {
        this.getMemberDetails()
    }

    async getObj() {
        this.commonService.showLoader("Please wait")
        let pdfstatus: any = await this.sendMail();
        if (pdfstatus.status == 200) {
            this.commonService.hideLoader();
            this.commonService.toastMessage(pdfstatus.message,2000,ToastMessageType.Success,ToastPlacement.Bottom);
            this.navCtrl.pop();
        } else {
            this.commonService.hideLoader();
            this.commonService.toastMessage(pdfstatus.message,2000,ToastMessageType.Success,ToastPlacement.Bottom);
        }
    }

    sendMail() {
        // let adminCampReportObject = {
        //     ParentClubName: this.parentClubDetails.ParentClubName,
        //     HolidayCampName: this.Tournament.TournamentName,
        //     VenueName: this.Tournament.Location.LocationName,
        //     SessionDetails: this.Tournament.Season,
        //     ParentClubEmail: this.parentClubDetails.ParentClubAdminEmailID,
        //     ImagePath: this.parentClubDetails.ParentClubAppIconURL,
        //     IsAge: this.actionSheet.Age,
        //     IsGender: this.actionSheet.Gender,
        //     IsPaymentStatus: this.actionSheet.PaymentStatus,
        //     IsPhoneNumber: this.actionSheet.Phone,
        //     IsEmailID: this.actionSheet.EmailID,
        //     IsExtraline: false,
        //     NumberOfExtraLine: isNaN(parseInt(this.actionSheet.ExtraLineNumber)) ? 0 : Math.floor(this.actionSheet.ExtraLineNumber),
        //     HeaderMessage: 'Tournament Member Sheet',
        //     Members: this.memberDetailsArr,
        //     Subject: this.membersheetSubject,

        // }
        // let primaryContactCampReportObject: any = {};

        // console.log(adminCampReportObject);
        // let url = this.sharedservice.getEmailUrl();
        // $.ajax({
        //     url: url + "umbraco/surface/ActivityProSurface/CreatePdfForHolidayCamp/",
        //     data: adminCampReportObject,
        //     type: "POST",
        //     success: function (response) {

        //     }, error: function (error, xhr) {

        //     }
        // });
        // if (this.parentClubDetails.ParentClubAdminEmailID != this.Tournament.PrimaryEmail) {
        //     primaryContactCampReportObject = adminCampReportObject;
        //     primaryContactCampReportObject.ParentClubEmail = this.Tournament.PrimaryEmail;
        //     $.ajax({
        //         url: url + "umbraco/surface/ActivityProSurface/CreatePdfForHolidayCamp/",
        //         data: primaryContactCampReportObject,
        //         type: "POST",
        //         success: function (response) {

        //         }, error: function (error, xhr) {

        //         }
        //     });
        // }
        return new Promise((res, rej) => {
            //this.selectOBj.toAddress = "akkellivinod@gmail.com";
            this.selectOBj.msgBody = `<p> Hello ${this.selectOBj.parentClubName},</p><p style="margin:1px">Please find below the link for the report.</p><p>Note: The link will be disabled after 3 days. </p>`;
            this.selectOBj.attachmentName = `Tournament Member Sheet@${this.selectOBj.parentClubName+ new Date().getTime()}`;
            $.ajax({
                //url: url + "umbraco/surface/ActivityProSurface/CreatePdfForHolidayCamp/",
                //https://activitypro-nest-261607.appspot.com/session/printreport
                url:`${this.sharedservice.getnestURL()}/session/printreport`,
                data: this.selectOBj,
                type: "POST",
                success: function (response) {
                  console.log("success");
                   res(response);
                }, error: function (error, xhr) {
                  console.log("err");
                  rej(error);
                }
              });
        });
    }

    getparentClubdetails() {
        this.fb.getAllWithQuery("/ParentClub/Type2/", { orderByKey: true, equalTo: this.Tournament.ParentClubKey }).subscribe((data) => {
            this.parentClubDetails = data[0];
            this.selectOBj.parentClubimagePath = this.parentClubDetails.ParentClubAppIconURL;
            this.selectOBj.parentClubName = this.parentClubDetails.ParentClubName;
            // this.selectOBj.toAddress = this.parentClubDetails.ParentClubAdminEmailID;
            if(this.userObj.RoleType == 4 || this.userObj.RoleType == 6 || this.userObj.RoleType == 7 || this.userObj.RoleType == 8){
                this.selectOBj.toAddress = this.userObj.EmailID;
                this.selectOBj.ccAddress = this.parentClubDetails.ParentClubAdminEmailID;
            }else{
                this.selectOBj.toAddress = this.parentClubDetails.ParentClubAdminEmailID;
            }
        });
        this.fb.getAllWithQuery("/Club/Type2/" + this.Tournament.ParentClubKey + "/", { orderByKey: true, equalTo: this.Tournament.ClubKey }).subscribe((data) => {
            this.clubInfo = data[0];
        });
    }
    showToast(m: string, dur: number) {
        let toast = this.toastCtrl.create({
            message: m,
            duration: dur,
            position: 'bottom'
        });
        toast.present();
    }
    present() {
        let alert = this.altctrl.create({
            title: 'Print Member',
            message: 'Are you sure you want to print member?',
            buttons: [
                {
                    text: "No",
                    role: 'cancel',
                    handler: () => {
                        this.navCtrl.pop();
                    }
                },
                {
                    text: 'Yes',
                    handler: () => {
                        this.getObj();
                    }
                }
            ]
        });
        alert.present();
    }
    cancel() {
        this.navCtrl.pop();
    }
}
class ActionSheetDetails {
    StartDate: string;
    EndDate: string;
    FirstName: string;
    LastName: string;
    MedicalCondition: string;
    Age: string;
    Gender: string;
    PaymentStatus: string;
    PhoneNumber: string;
    EmailID: string;
    HasDisease: boolean = false;
    ExtraLine: boolean = false;
    ExtraLineNumber: Number = 10;
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
    memerList: Array<ActionSheetDetails> = [];
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
  