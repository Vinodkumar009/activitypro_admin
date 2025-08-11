import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController } from 'ionic-angular';
import { CommonService } from '../../../../services/common.service';
import { FirebaseService } from '../../../../services/firebase.service';
import * as $ from 'jquery';
import { SharedServices } from '../../../services/sharedservice';
import * as moment from 'moment';
import { Storage } from '@ionic/storage';
/**
 * Generated class for the SchoolmembersheetPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-schoolmembersheet',
  templateUrl: 'schoolmembersheet.html',
})
export class SchoolmembersheetPage {
  nestUrl = "";
  selectOBj: SelectedItems;
  sessionInfo: any = "";
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
  inclusionList: Array<String> = ["", " ", "-", ".", "..", "...", "A", "adhd", "fit", "good", "great", "healthy",
        "n", "n/a","N/a", "na", "Na", "NA", "nil", "no","No", "no e", "nobe", "non", "not applicable", "none", "nope","None", "None\n\n", "Nope", "nothing", "Nothing", "ok","Ok", "okay","no problem",
        "Best", "best", "Good", 'good'
  ];
  inclusionSet: Set<String> = new Set<String>(this.inclusionList);
  memberDetailsArr: Array<any> = new Array();
  clubInfo: any = "";
  userObj:any = "";
  constructor(public altctrl: AlertController, public toastCtrl: ToastController, public sharedservice: SharedServices, public fb: FirebaseService, public navCtrl: NavController, public navParams: NavParams, public storage:Storage, public commonService: CommonService) {
    this.nestUrl = this.sharedservice.getnestURL();
    this.checkedFilterBoxes.add('FirstName');
    this.checkedFilterBoxes.add('LastName');
    this.checkedFilterBoxes.add('MemberType');
    this.selectOBj = new SelectedItems();
    
    this.sessionInfo = this.navParams.get('sessionOInfo');
    if (this.sessionInfo.Member != undefined) {
        this.sessionInfo.Member = this.commonService.convertFbObjectToArray(this.sessionInfo.Member);
        // for(let i=0;i < this.sessionInfo.Member.length;i++){
        //   if(this.sessionInfo.Member[i].EmailID == "" && this.sessionInfo.Member[i].IsChild){
        //     this.fb.getAllWithQuery("SchoolMember/" + this.sessionInfo.Member[i].ParentClubKey + "/" , { orderByKey: true, equalTo: this.sessionInfo.Member[i].ParentKey }).subscribe((data) => {// if he's a school member
        //       if(data.length > 0){
        //         this.sessionInfo.Member[i].EmailID = data[0].EmailID || "N.A"; 
        //       }else{ // if he's not a school member
        //         this.fb.getAllWithQuery("Member/" + this.sessionInfo.Member[i].ParentClubKey + "/" + this.sessionInfo.Member[i].ClubKey + "/", { orderByKey: true, equalTo: this.sessionInfo.Member[i].ParentKey }).subscribe((data) => {
        //           if(data.length > 0){
        //             this.sessionInfo.Member[i].EmailID = data[0].EmailID || "N.A";
        //           }
        //         })
        //       }
        //     }); 
        //   }
        //   if(this.sessionInfo.Member[i].PhoneNumber ==""){
        //     this.sessionInfo.Member[i].PhoneNumber = this.sessionInfo.Member[i].EmergencyNumber;
        //   }
        // }
        this.sessionInfo.Member.forEach(async(member:any)=>{
          if(member.IsChild){
            if(member.IsSchoolMember){
              let firebase_parentkey = await this.sendFirebaseResp(`/SchoolMember/${member.ParentClubKey}/${member.Key}/ParentKey`);
              member.EmailID = await this.sendFirebaseResp(`/SchoolMember/${member.ParentClubKey}/${firebase_parentkey}/EmailID`);
              member.PhoneNumber = await this.sendFirebaseResp(`/SchoolMember/${member.ParentClubKey}/${firebase_parentkey}/PhoneNumber`);
              console.log(`${member.EmailID}:${member.PhoneNumber}`);
            }else{
              let firebase_parentkey = await this.sendFirebaseResp(`/Member/${member.ParentClubKey}/${member.ClubKey}/${member.Key}/ParentKey`);
              member.EmailID = await this.sendFirebaseResp(`/Member/${member.ParentClubKey}/${member.ClubKey}/${firebase_parentkey}/EmailID`);
              member.PhoneNumber = await this.sendFirebaseResp(`/Member/${member.ParentClubKey}/${member.ClubKey}/${firebase_parentkey}/PhoneNumber`);
              console.log(`${member.EmailID}:${member.PhoneNumber}`);
            }
          }
        })
    }
    this.storage.get('userObj').then((val) => {
      if (val.$key != "") {
        this.userObj = JSON.parse(val);;
        //this.membersheetSubject = this.sessionInfo.SchoolName + "-" + "Member Sheet";
        this.selectOBj.subject = this.sessionInfo.SchoolName + "-" + "Member Sheet";
        this.getparentClubdetails();
      }
    });
    


  }

  sendFirebaseResp(firebasereq:any){
    return this.fb.getPropValue(firebasereq);
  }

  ionViewDidLoad() {
    
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
  getMemberDetails() {
    this.memberDetailsArr = [];
    let checkedArr: Array<any> = Array.from(this.checkedFilterBoxes);
    for (let i = 0; i < this.sessionInfo.Member.length; i++) {
      if (this.sessionInfo.Member[i].IsActive) {
        this.sessionInfo.Member[i]["MemberType"] = this.sessionInfo.Member[i].IsEnable ? "Member" : "Non-Member";
        // let arr = this.sessionInfo.Member[i]["DOB"].split("-");
        // let nowYear = moment().format("YYYY");
        // let nowMonth = moment().format("MM");
        // var a = moment(new Date(arr[0] + "," + arr[1] + "," + 1).getTime());
        // var b = moment(new Date(nowYear + "," + nowMonth + "," + 1).getTime());
        // this.sessionInfo.Member[i]['Age'] = b.diff(a, 'years');
        // if (isNaN(this.sessionInfo.Member[i]['Age'])) {
        //   this.sessionInfo.Member[i]['Age'] = "N/A";
        // }
        this.sessionInfo.Member[i]['PaymentStatus'] = this.sessionInfo.Member[i]['AmountPayStatus']
        //a.diff(b, 'days') // 1
        let memberObj: any = {};
        for (let j = 0; j < checkedArr.length; j++) {
          memberObj[checkedArr[j]] = this.sessionInfo.Member[i][checkedArr[j]];
        }
        this.memberDetailsArr.push(memberObj);
        // if (i == this.sessionInfo.Member.length - 1) {
        //   this.selectOBj.memerList = this.memberDetailsArr;
        //   this.actionSheet["members"] = this.memberDetailsArr;
        //   this.actionSheet.SchoolSessionName = this.sessionInfo.SessionName;
        //   this.actionSheet.SchoolName = this.sessionInfo.SchoolName;
        //   this.actionSheet.SchoolName = this.sessionInfo.SchoolName;
        //   this.actionSheet.SessionDetails = this.sessionInfo.SessionName + "-" + this.sessionInfo.Duration + "min";
        //   this.showConfirmation();
        // }
      }
    }
    if (this.checkedFilterBoxes.has('MedicalCondition')) { //commented as per shubhankar sir instruction
      for (let i = 0; i < this.memberDetailsArr.length; i++) {
        //this.memberDetailsArr[i]['HasDisease'] = !this.inclusionSet.has(this.memberDetailsArr[i]['MedicalCondition']);
        for (var key in this.memberDetailsArr[i]) {
          if (this.memberDetailsArr[i].hasOwnProperty(key)) {
              //console.log(key + " -> " + this.memberDetailsArr[i][key]);
              if (typeof this.memberDetailsArr[i][key] === 'string') {
                this.memberDetailsArr[i][key] = this.memberDetailsArr[i][key].toLowerCase();
                this.memberDetailsArr[i][key] = this.capitalizeFirstLetter(this.memberDetailsArr[i][key]);
              }
          }
        }
        
      }
    }
    this.selectOBj.memerList = this.memberDetailsArr;
    this.actionSheet["members"] = this.memberDetailsArr;
    this.actionSheet.SchoolSessionName = this.sessionInfo.SessionName;
    this.actionSheet.SchoolName = this.sessionInfo.SchoolName;
    this.actionSheet.SchoolName = this.sessionInfo.SchoolName;
    this.actionSheet.SessionDetails = this.sessionInfo.SessionName + "-" + this.sessionInfo.Duration + "min";
    console.log(this.selectOBj.memerList);
    this.showConfirmation();
  }
  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  proceed() {
    this.getMemberDetails()
  }

  showConfirmation() {
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
            this.sendMail();
          }
        }
      ]
    });
    alert.present();
  }
  cancel() {
    this.navCtrl.pop();
  }

  async sendMail() {
    this.commonService.showLoader("Please wait");
    let pdfstatus: any = await this.getObj();
    if (pdfstatus.status == 200) {
      this.commonService.hideLoader();
      this.commonService.toastMessage(pdfstatus.message, 2000);
      this.navCtrl.pop();
    } else {
      this.commonService.hideLoader();
      this.commonService.toastMessage(pdfstatus.message, 2000);
    }
  }

  getObj() {
    return new Promise((res, rej) => {
      // let holidayCampReportObject = {
      //   ParentClubName: this.parentClubDetails.ParentClubName,
      //   HolidayCampName:this.sessionInfo.SessionName,
      //   VenueName:  this.clubInfo.ClubName,
      //   SessionDetails:this.actionSheet.SessionDetails,
      //   ParentClubEmail: this.parentClubDetails.ParentClubAdminEmailID,
      //  // ParentClubEmail:'barun.mishra@kare4u.in',
      //   ImagePath: this.parentClubDetails.ParentClubAppIconURL,
      //   IsAge: this.actionSheet.Age,
      //   IsGender: this.actionSheet.Gender,
      //   IsPaymentStatus: this.actionSheet.PaymentStatus,
      //   IsPhoneNumber: this.actionSheet.Phone,
      //   IsEmailID: this.actionSheet.EmailID,
      //   IsExtraline:false,
      //   NumberOfExtraLine: isNaN(parseInt(this.actionSheet.ExtraLineNumber)) ? 0 : Math.floor(this.actionSheet.ExtraLineNumber),
      //   HeaderMessage:'School Member Sheet',
      //   Members:this.memberDetailsArr,
      //   Subject: this.membersheetSubject,

      // }
      this.selectOBj.msgBody = `<p> Hello ${this.selectOBj.parentClubName},</p><p style="margin:1px">Please find below the link for the report.</p><p>Note: The link will be disabled after 3 days. </p>`;
      this.selectOBj.attachmentName = `School Session@${this.selectOBj.parentClubName + new Date().getTime()}`;
      //console.log(holidayCampReportObject);
      let url = this.sharedservice.getEmailUrl();
      //let http://localhost:32683/
      // url = "http://localhost:32683/";
      //https://activitypro-nest-261607.appspot.com/session/printreport
      $.ajax({
        url: `${this.nestUrl}/session/printreport`,
        data: this.selectOBj,
        type: "POST",
        success: function (response) {
          res(response);
        }, error: function (error, xhr) {
          rej(error);
        }
      });
    })

  }
  getparentClubdetails() {
    const pareclub$Obs = this.fb.getAllWithQuery("/ParentClub/Type2/", { orderByKey: true, equalTo: this.sessionInfo.ParentClubKey }).subscribe((data) => {
      pareclub$Obs.unsubscribe();
      this.parentClubDetails = data[0];
      this.selectOBj.parentClubimagePath = this.parentClubDetails.ParentClubAppIconURL;
      this.selectOBj.parentClubName = this.parentClubDetails.ParentClubName;
      //this.selectOBj.toAddress = this.parentClubDetails.ParentClubAdminEmailID;
      
      if(this.userObj.RoleType == 4 || this.userObj.RoleType == 6 || this.userObj.RoleType == 7 || this.userObj.RoleType == 8){
        this.selectOBj.toAddress = this.userObj.EmailID;
        this.selectOBj.ccAddress = this.parentClubDetails.ParentClubAdminEmailID;
      }else{
        this.selectOBj.toAddress = this.parentClubDetails.ParentClubAdminEmailID;
      }
    });
    const clubs$Obs = this.fb.getAllWithQuery("/Club/Type2/" + this.sessionInfo.ParentClubKey + "/", { orderByKey: true, equalTo: this.sessionInfo.ClubKey }).subscribe((data) => {
      clubs$Obs.unsubscribe();
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
  MemberType:string;
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
  msgBody: string = "";
  attachmentName: string = "";
  isFirstName: boolean = true;
  isLastName: boolean = true;
  isSession: boolean = false;
  isCoach: boolean = false;
  isVanue: boolean = false;
  isDate: boolean = false;
  isMode: boolean = false;
  isDiscount: boolean = false;
  isPaid: boolean = false;
  isDue: boolean = false;
}