import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController, AlertController } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { FirebaseService } from '../../../../services/firebase.service';
import { SharedServices } from '../../../services/sharedservice';
import { Storage } from '@ionic/storage';
import gql from 'graphql-tag';
import { GraphqlService } from '../../../../services/graphql.service';
import { ReportMembers, ReportModel_V1 } from '../../../../shared/model/report.model';
/**
 * Generated class for the SessionmembersheetPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-sessionmembersheet',
  templateUrl: 'sessionmembersheet.html',
})
export class SessionmembersheetPage {
  sessionInfo: any = "";
  nestUrl = "";
  actionSheet: any = {
    StartDate: '',
    EndDate: '',
    FirstName: true,
    LastName: true,
    MedicalCondition: false,
    Age: true,
    Gender: true,
    EmailID: true,
    PaymentStatus: true,
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
  parentClubKey: string = "";
  userObj:any = "";
  inclusionList: Array<String> = ["", " ", "-", ".", "..", "...", "A", "adhd", "fit", "good", "great", "healthy",
        "n", "n/a","N/a", "na", "Na", "NA", "nil", "no","No", "no e", "nobe", "non", "not applicable", "none", "nope","None", "None\n\n", "Nope", "nothing", "Nothing", "ok","Ok", "okay","no problem",
        "Best", "best", "Good", 'good'
    ];
  inclusionSet: Set<String> = new Set<String>(this.inclusionList);
  memberDetailsArr: Array<any> = new Array();
  clubInfo: any = "";
  selectOBj: SelectedItems; 
  selectedMonthKey:any;
  report_obj:ReportModel_V1 = {
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
  type:number;
  report_members:ReportMembers[] = [];
  session_info:{session_name:string,club_name:string,coach_name:string};
  constructor(public altctrl: AlertController, 
    public loadingCtrl: LoadingController, 
    public sharedservice: SharedServices, 
    public fb: FirebaseService, public navCtrl: NavController, 
    public navParams: NavParams,public storage:Storage, 
    public commonService: CommonService,
    private graphqlService:GraphqlService) {
    this.nestUrl = this.sharedservice.getnestURL();
    
    this.checkedFilterBoxes.add('FirstName');
    this.checkedFilterBoxes.add('LastName');
    this.checkedFilterBoxes.add('StartDate');
    this.checkedFilterBoxes.add('EndDate');
    this.checkedFilterBoxes.add('EmailID');
    //this.checkedFilterBoxes.add('MedicalCondition');
    this.checkedFilterBoxes.add('Age');
    this.checkedFilterBoxes.add('EmailID');
    this.checkedFilterBoxes.add('PhoneNumber');
    //this.checkedFilterBoxes.add('Gender');
    this.checkedFilterBoxes.add('PaymentStatus');    
    //this.checkedFilterBoxes.add('MemberType');

    this.selectOBj = new SelectedItems();
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
          this.parentClubKey = val.UserInfo[0].ParentClubKey;
          this.userObj = val;
          this.getparentClubdetails();
      }
      // this.loading.dismiss().catch(() => { });
  })

  }

  
  async ionViewDidLoad() {
    this.report_members = this.navParams.get('repor_members');
    this.session_info = this.navParams.get('session_info');
    this.type = this.navParams.get('type');
   // this.selectedMonthKey = this.navParams.get('selectedMonthKey');// if it's not undefined then it's monthly session
    console.log(this.report_members);
    this.report_obj.memer_list = this.report_members;
    this.report_obj.club_name = this.session_info.club_name;
    this.report_obj.subject = this.session_info.session_name + "-" + "Member Sheet";
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
  

  EmailConfirmationAlert() {
    let alert = this.altctrl.create({
      title: 'Print Member',
      message: 'Are you sure you want to print member?',
      buttons: [
        {
          text: "No",
          role: 'cancel',
          handler: () => {
            //this.navCtrl.pop();
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.getMemberDetails();
          }
        }
      ]
    });
    alert.present();
  }

  async getMemberDetails() {
    this.memberDetailsArr = [];
    let checkedArr: Array<any> = Array.from(this.checkedFilterBoxes);
    for(let i = 0; i < this.report_members.length; i++){
      if(!this.actionSheet.MedicalCondition){
        delete this.report_members[i].MedicalCondition
      }
      if(!this.actionSheet.Age){
        delete this.report_members[i].Age
      }
      if(!this.actionSheet.Gender){
        delete this.report_members[i].Gender
      }
      if(!this.actionSheet.PaymentStatus){
        delete this.report_members[i].PaymentStatus
      }
      if(!this.actionSheet.EmailID){
        delete this.report_members[i].EmailID
      }
    }

    //this.sessionInfo.Member = Array.isArray(this.sessionInfo.Member) ? this.sessionInfo.Member : this.commonService.convertFbObjectToArray(this.sessionInfo.Member);
    // for (let i = 0; i < this.sessionInfo.Member.length; i++) {
    //   if (this.sessionInfo.Member[i].IsActive) {
    //     this.sessionInfo.Member[i]["MemberType"] = this.sessionInfo.Member[i].IsEnable ? "Member" : "Non-Member";
    //     let arr = this.sessionInfo.Member[i]["DOB"].split("-");
    //     let nowYear = moment().format("YYYY");
    //     let nowMonth = moment().format("MM");
    //     var a = moment(new Date(arr[0] + "," + arr[1] + "," + 1).getTime());
    //     var b = moment(new Date(nowYear + "," + nowMonth + "," + 1).getTime());
    //     // this.sessionInfo.Member[i]['Age'] = b.diff(a, 'years');
    //     this.sessionInfo.Member[i]['Age'] = this.commonService.getAgeFromYYYY_MM(this.sessionInfo.Member[i]["DOB"]);
    //     if (isNaN(this.sessionInfo.Member[i]['Age'])) {
    //       this.sessionInfo.Member[i]['Age'] = "N/A";
    //     }

    //     if(this.sessionInfo.PaymentOption == 101 || this.sessionInfo.PaymentOption == "101"){
    //       //getting selected month payment status
    //       if(this.sessionInfo.Member[i].MonthlySession[this.selectedMonthKey] && this.sessionInfo.Member[i].MonthlySession[this.selectedMonthKey]["IsActive"]){
    //         this.sessionInfo.Member[i]['PaymentStatus'] = this.sessionInfo.Member[i].MonthlySession[this.selectedMonthKey]['AmountPayStatus'] ? this.sessionInfo.Member[i].MonthlySession[this.selectedMonthKey]['AmountPayStatus'] : "Due";
    //       }
    //     }else{
    //       this.sessionInfo.Member[i]['PaymentStatus'] = this.sessionInfo.Member[i]['AmountPayStatus'] ? this.sessionInfo.Member[i]['AmountPayStatus'] : "Due";
    //     }
        
        
    //     a.diff(b, 'days') // 1
    //     let memberObj: any = {};
    //     for (let j = 0; j < checkedArr.length; j++) {
    //       memberObj[checkedArr[j]] = this.sessionInfo.Member[i][checkedArr[j]];
    //     }
    //     this.memberDetailsArr.push(memberObj);
    //   }
    //   if(i == this.sessionInfo.Member.length - 1){
    //     this.report_obj.memer_list = this.memberDetailsArr;
    //     this.actionSheet["members"] = this.memberDetailsArr;
    //     this.actionSheet.SessionName = this.sessionInfo.SessionName;
    //     //this.actionSheet.SchoolName = this.sessionInfo.SchoolName;
    //     this.actionSheet.SessionDetails = this.sessionInfo.SessionName + "-" + this.sessionInfo.Duration + "min";
    //     this.sendMail();
    //   }
    // }
    // if (this.checkedFilterBoxes.has('MedicalCondition')) {
    //   for (let i = 0; i < this.memberDetailsArr.length; i++) {
    //     //this.memberDetailsArr[i]['HasDisease'] = !this.inclusionSet.has(this.memberDetailsArr[i]['MedicalCondition']);
    //     for (var key in this.memberDetailsArr[i]) {
    //       if (this.memberDetailsArr[i].hasOwnProperty(key)) {
    //           //console.log(key + " -> " + this.memberDetailsArr[i][key]);
    //           if (typeof this.memberDetailsArr[i][key] === 'string') {
    //             this.memberDetailsArr[i][key] = this.memberDetailsArr[i][key].toLowerCase();
    //             this.memberDetailsArr[i][key] = this.commonService.capitalizeFirstLetter(this.memberDetailsArr[i][key]);
    //           }
    //       }
    //     }
    //   }
    // }
    this.sendMail();
  }


   sendMail() {
    try{
      this.commonService.showLoader("Please wait")
      this.report_obj.msg_body = `<p> Hello ${this.report_obj.parentclub_name},</p><p style="margin:1px">Please find below the link for the report.</p><p>Note: The link will be disabled after 3 days. </p>`;
      this.report_obj.attachment_name = `Member Session@${this.report_obj.parentclub_name+ new Date().getTime()}`;
      let url = this.sharedservice.getEmailUrl();
      //this.selectOBj.toAddress="akkellivinod@gmail.com";//need to remove
      
      const report_mutation = gql`
      mutation sendSessionReport($reportInput: ReportModel_V1!) {
        sendSessionReport(sessionReportInput: $reportInput)
      }` 
      
      const report_variable = { reportInput: this.report_obj };
      this.graphqlService.mutate(report_mutation, report_variable,0).subscribe((response)=>{
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

  getparentClubdetails() {
    const parentclub$Obs = this.fb.getAllWithQuery("/ParentClub/Type2/", { orderByKey: true, equalTo: this.sharedservice.getParentclubKey() }).subscribe((data) => {
      parentclub$Obs.unsubscribe();
      this.parentClubDetails = data[0];
      this.report_obj.parentclub_image = this.parentClubDetails.ParentClubAppIconURL;
      this.report_obj.parentclub_name = this.parentClubDetails.ParentClubName;
     
      if(this.userObj.RoleType == 4 || this.userObj.RoleType == 6 || this.userObj.RoleType == 7 || this.userObj.RoleType == 8){
        this.report_obj.to_address = this.userObj.EmailID;
        this.report_obj.cc_address = this.parentClubDetails.ParentClubAdminEmailID;
      }else{
        this.report_obj.to_address = this.parentClubDetails.ParentClubAdminEmailID;
      }
    });
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
  MemberType:string;
}

class SelectedItems {
  // parentclub_image: string = "";
  // parentclub_name: string = "";
  // club_name: string = "Not Available";
  // to_address: string = "";
  // from_address: string = "Not Available";
  // cc_address: string = "Not Available";
  // subject: string = "Not Available";
  // reply_to_address: Array<string> = [];
  // memer_list: Array<ActionSheetDetails> = [];
  // msg_body:string = "";
  // attachment_name:string = "";
  isFirstName: boolean = true;
  isLastName: boolean = true;
  isMemberType:boolean = true;
  isSession: boolean = false;
  isCoach: boolean = false;
  isVanue: boolean = false;
  isDate: boolean = false;
  isMode: boolean = false;
  isDiscount: boolean = false;
  isPaid: boolean = false;
  isDue:boolean = false;
}
