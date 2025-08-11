import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController, AlertController, ToastController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import { FirebaseService } from '../../../services/firebase.service';
import gql from "graphql-tag";
import { Storage } from '@ionic/storage';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import * as $ from 'jquery';
import { HttpClient } from '@angular/common/http';
import { GraphqlService } from '../../../services/graphql.service';
import { HolidayCamp } from './models/holiday_camp.model';
import moment from "moment";
/**
 * Generated class for the AttendancesheetPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-membersheet',
  templateUrl: 'membersheet.html',
})
export class MembersheetPage {
  nestUrl:string = "";
  themeType: number;
  actionSheet: any = {
    start_date: '',
    end_date: '',
    first_name: true,
    last_name: true,
    medical_condition: true,
    age: false,
    gender: false,
    email_id: false,
    payment_status: false,
    phone_no: false,
    extra_line: false,
    ExtraLineNumber: 10,
    DoPrintSessionMember: true
  };
  memberDetails: any;
  actionSheetDetails: ActionSheetDetails[];
  sessionDetails: any;
  campDetails: HolidayCamp;
  parentClubDetails: any;
  parentClubKey: string = "";
  membersheetSubject = "";
  blockShowToggle = false;
  max = "";
  min = "";
  userObj:any;
  campMemberDetailsArray = [];
  currencyDetails:any;
  sheet_type:number = 1;
  constructor(public toastCtrl: ToastController, 
    public comonService: CommonService, 
    public navCtrl: NavController, private storage: Storage, 
    public navParams: NavParams, 
    public popoverCtrl: PopoverController, 
    public sharedservice: SharedServices, 
    public fb: FirebaseService, 
    public altctrl: AlertController,
    private http:HttpClient,
    private graphqlService: GraphqlService,) {
    this.nestUrl = this.sharedservice.getnestURL();
    this.sheet_type = this.navParams.get('sheet_type');
    this.campDetails = this.navParams.get('CampDetails');
    if(Number(this.sheet_type) === 2){
      this.sessionDetails = this.navParams.get('sessionDetails');
    }else{
      this.actionSheet.start_date = moment(this.campDetails.start_date,"DD-MMM-YYYY").format("YYYY-MM-DD");
      this.actionSheet.end_date = moment(this.campDetails.end_date,"DD-MMM-YYYY").format("YYYY-MM-DD");
      this.max = moment(this.campDetails.end_date,"DD-MMM-YYYY").format("YYYY-MM-DD");;
      this.min = moment(this.campDetails.start_date,"DD-MMM-YYYY").format("YYYY-MM-DD");
    }
    // this.storage.get('userObj').then((val) => {
    //   val = JSON.parse(val);
    //   if (val.$key != "") {
    //       this.parentClubKey = val.UserInfo[0].ParentClubKey;
    //       this.userObj = val;
    //   }
    //   // this.loading.dismiss().catch(() => { });
    // })
    // const parentclub$Obs = this.fb.getAllWithQuery("/ParentClub/Type2/", { orderByKey: true, equalTo: this.campDetails.ParentClubKey}).subscribe((data) => {
    //   this.parentClubDetails = data[0];
    //   parentclub$Obs.unsubscribe();
    // });
    this.themeType = sharedservice.getThemeType();
    this.getStorageData();

    //*******************/
    // min or max date
    //---------
    
    this.membersheetSubject = this.campDetails.venue_name + " – Member Sheet";

  }


  async getStorageData(){
    //this.actionSheetDetails[i] = new ActionSheetDetails();
    const [login_obj,postgre_parentclub,currencyDetails] = await Promise.all([
      this.storage.get('userObj'),
      this.storage.get('postgre_parentclub'),
      this.storage.get('Currency'),
    ])

    if (login_obj) {
      this.userObj = JSON.parse(login_obj);
      this.parentClubKey = JSON.parse(login_obj).UserInfo[0].ParentClubKey;
    }
    if(postgre_parentclub){
      this.parentClubDetails = postgre_parentclub;
    }
    if(currencyDetails){
      this.currencyDetails = JSON.parse(currencyDetails);
    }

    if (this.sessionDetails != undefined) {
      // this.memberDetails = this.navParams.get('sessionDetails').Members;
      // this.actionSheetDetails = new Array(this.navParams.get('sessionDetails').Members.length);
    }else {
      this.actionSheet.DoPrintSessionMember = false;
      // if (this.campDetails.Member!= undefined) {
      //   if (this.campDetails.Member.length == undefined) {
      //     this.campDetails.Member = Array.isArray(this.campDetails.Member) ? this.campDetails.Member : this.comonService.convertFbObjectToArray(this.campDetails.Member);
      //   }
      //   //this.getCampMemberDetails(this.campDetails.Member);
      // }
    }
  }


  ionViewDidLoad() {
    ////////console.log('ionViewDidLoad MemberSheetPage');
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
  
  //check  exclusion list
  hasDiseases(word: string): boolean {
    ////******************* */
    ///  inclusionList values must be small letter otherwise will show error
    ///
    let inclusionList = ["", " ", "-", ".", "..", "...", "A", "adhd", "fit", "good", "great", "healthy",
      "n", "n/a","N/a", "na", "Na", "NA", "nil", "no","No", "no e", "nobe", "non", "not applicable", "none", "nope","None", "None\n\n", "Nope", "nothing", "Nothing", "ok","Ok", "okay","no problem",
      "Best", "best", "Good", 'good'
    ];
    return ((inclusionList.indexOf(word.toLowerCase()) == -1) ? true : false);
  }
  showHide() {
    this.blockShowToggle = !this.blockShowToggle;
  }

  showConfirm() {
    if (this.membersheetSubject.trim() !== "") {
    //   let alert = this.altctrl.create({
    //     subTitle: 'Add a subject?',
    //     message: 'Do you want to send this member report attachment without subject?',
    //     buttons: [
    //       {
    //         text: "Don't Send",
    //         role: 'cancel',
    //         handler: () => {

    //         }
    //       },
    //       {
    //         text: 'Send',
    //         handler: () => {
    //           if (this.actionSheet.DoPrintSessionMember) {
    //             this.sendMemberReportAttatchment();
    //           } else {
    //             //printing report from some date to another date
    //             this.sendMemberReportAttatchmentofCamp();
    //           }
    //         }
    //       }
    //     ]
    //   });
    //   alert.present();
    // } else {
      let alert = this.altctrl.create({
        title:"Print Member Sheet",
        message: 'Are you sure you want to print the member sheet?',
        buttons: [
          {
            text: "No",
            role: 'cancel',
            handler: () => {

            }
          },
          {
            text: 'Yes',
            handler: () => {
              if (this.actionSheet.DoPrintSessionMember) {
                this.sendCampReport();//this.sendMemberReportAttatchment();
              } else {
                this.sendCampReport();//this.sendMemberReportAttatchmentofCamp();
              }
            }
          }
        ]
      });
      alert.present();
    //}
    }else{
      this.comonService.toastMessage("Please add subject", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    }
  }


  sendCampReport(){
    try{
      //constructor(columns:string[],msg_body,subject,attach_name,camp_id,type,login_type){
      const msg_body = `<p> Hello ${this.parentClubDetails.ParentClubName},</p><p style="margin:1px">Please find below the link for the report.</p><p>Note: The link will be disabled after 3 days. </p>`;
      const attachment_name = `Member Session@${this.parentClubDetails.ParentClubName+ new Date().getTime()}`;
      const subject = this.membersheetSubject;
      
      //this.userObj.RoleType
      const sheet_columns = Object.keys(this.actionSheet).filter(key => this.actionSheet[key] === true);
      const report_input = new ReportModel_V2(sheet_columns,msg_body,subject,attachment_name,this.campDetails.id,this.sheet_type,this.userObj.RoleType);
      report_input.session_id = this.sheet_type == 2 ? this.sessionDetails.id : "";
      report_input.start_date = this.sheet_type == 1 ? this.actionSheet.start_date : "";
      report_input.end_date = this.sheet_type == 1 ? this.actionSheet.end_date : "";
      report_input.parentclub_id = this.parentClubDetails.Id;
      if(this.userObj.RoleType == 4 || this.userObj.RoleType == 6 || this.userObj.RoleType == 7 || this.userObj.RoleType == 8){
        report_input.loggedin_email = this.userObj.EmailID;
      }else{
        report_input.loggedin_email = this.parentClubDetails.ParentClubAdminEmailID;
      }
      console.table(report_input);
      //return false;

      const create_camp_mutation = gql`
      mutation sendCampReport($campReportInput: ReportModel_V2!) {
        sendCampReport(campReportInput: $campReportInput)
      }`
  
      const variables = { campReportInput: report_input }
  
      this.graphqlService.mutate(create_camp_mutation, variables, 0).subscribe(
        result => {
          // Handle the result
          // this.holidayCampResponse = result.data.createHolidayCamp;
          this.comonService.toastMessage("Email has been successfully sent", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
          console.log(`camp_created_res:${result}`);
          this.navCtrl.pop();
        },
        error => {
          // Handle errors
          console.error(error);
          this.comonService.toastMessage("Error in sending report", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        }
      );
    }catch(err){
      this.comonService.toastMessage("Error in sending report",2500,ToastMessageType.Error);
    }
  }


  sendMemberReportAttatchment() {

    this.actionSheetDetails.forEach(element => {

      if (element.Age == undefined) {
        element.Age = "";
      }
      if (element.Gender == undefined) {
        element.Gender = "";
      }
      if (element.PaymentStatus == undefined) {
        element.PaymentStatus = "";
      }
      if (element.PhoneNumber == undefined) {
        element.PhoneNumber = "";
      }
      if (element.EmailID == undefined) {
        element.EmailID = "";
      }
    });



    this.sessionDetails.SessionDate = this.comonService.convertDatetoDDMMYYYYBySpliting(this.sessionDetails.SessionDate);
    let holidayCampReportObject = {
      ParentClubName: this.parentClubDetails.ParentClubName,
      //HolidayCampName: this.campDetails.CampName,
      //VenueName: this.campDetails.VenueName,
      SessionDetails: this.sessionDetails.SessionName + " - " + this.sessionDetails.StartTime + " Hrs. to " + this.sessionDetails.EndTime + " Hrs. on " + this.comonService.getDateIn_DD_MMM_YYYY_Format(this.sessionDetails.SessionDate),
      ParentClubEmail: this.parentClubDetails.ParentClubAdminEmailID,
      //ParentClubEmail:"vinod.kumar@kare4u.in",
      ImagePath: this.parentClubDetails.ParentClubAppIconURL,
      IsAge: this.actionSheet.Age,
      IsGender: this.actionSheet.Gender,
      IsPaymentStatus: this.actionSheet.PaymentStatus,
      IsPhoneNumber: this.actionSheet.Phone,
      IsEmailID: this.actionSheet.EmailID,
      IsExtraline: this.actionSheet.ExtraLine,
      NumberOfExtraLine: isNaN(parseInt(this.actionSheet.ExtraLineNumber)) ? 0 : Math.floor(this.actionSheet.ExtraLineNumber),
      HeaderMessage:"Holiday camp member sheet",
      Members: [],
      Subject: this.membersheetSubject
    }

    this.actionSheetDetails.forEach(element => {
      if (element.Gender == "male") {
        element.Gender = "Male";
      } else if (element.Gender == "female") {
        element.Gender = "Female";
      }
      holidayCampReportObject.Members.push({
        FirstName: element.FirstName,
        LastName: element.LastName,
        MedicalCondition: element.MedicalCondition,
        Age: element.Age,
        Gender: element.Gender,
        PaymentStatus: element.PaymentStatus,
        PhoneNumber: element.PhoneNumber,
        EmailID: element.EmailID,
        HasDisease: element.HasDisease,
      });
    });

    holidayCampReportObject.Members = this.comonService.sortingObjects(holidayCampReportObject.Members, "FirstName");

   
    this.http.post(`${this.sharedservice.getEmailUrl()}umbraco/surface/ActivityProSurface/CreatePdfForHolidayCamp`,
      holidayCampReportObject
    ).subscribe((data) => {
      console.log(JSON.stringify(data));
    }, err => {
      console.log(JSON.stringify(err));
    })  
    let message = "Email has been successfully sent.";
    this.comonService.toastMessage(message,2500,ToastMessageType.Success,ToastPlacement.Bottom);
    this.navCtrl.pop();
  }


  sendMemberReportAttatchmentofCamp() {

    let holidayCampReportObject = {
      parentClubimagePath : this.parentClubDetails.ParentClubAppIconURL,
      parentClubName : this.parentClubDetails.ParentClubName,
      //clubName: this.campDetails.VenueName,
      toAddress:  "",
      fromAddress:  "Not Available",
      ccAddress: "Not Available",
      subject: this.membersheetSubject,
      type: 1,
      numberOfExtraLine: isNaN(parseInt(this.actionSheet.ExtraLineNumber)) ? 0 : Math.floor(this.actionSheet.ExtraLineNumber),
      replyToAddress: [],
      sessionNmemerList: [],
      msgBody: "",
      attachmentName: ""
    }

    holidayCampReportObject.msgBody = `<p> Hello ${this.parentClubDetails.ParentClubName},</p><p style="margin:1px">Please find below the link for the report.</p><p>Note: The link will be disabled after 3 days. </p>`;
    holidayCampReportObject.attachmentName = `Member Session@${this.parentClubDetails.ParentClubName+ new Date().getTime()}`;
    if(this.userObj.RoleType == 4 || this.userObj.RoleType == 6 || this.userObj.RoleType == 7 || this.userObj.RoleType == 8){
      holidayCampReportObject.toAddress = this.userObj.EmailID;
      holidayCampReportObject.ccAddress = this.parentClubDetails.ParentClubAdminEmailID;
    }else{
      holidayCampReportObject.toAddress = this.parentClubDetails.ParentClubAdminEmailID;
    }

    let campSessions = Array.isArray(this.campDetails.sessions) ? this.campDetails.sessions : this.comonService.convertFbObjectToArray(this.campDetails.sessions);
    for (let sesisonIndex = 0; sesisonIndex < campSessions.length; sesisonIndex++) {

      if (campSessions[sesisonIndex]['IsActive']) {

        let startDate = new Date(this.actionSheet.StartDate).getTime();
        let endDate = new Date(this.actionSheet.EndDate).getTime();

        let campsessiondates = (campSessions[sesisonIndex].SessionDate).split("-");
        campsessiondates[1] = campsessiondates[1].length > 1 ? campsessiondates[1] : "0" + campsessiondates[1];
        campsessiondates[2] = campsessiondates[2].length > 1 ? campsessiondates[2] : "0" + campsessiondates[2];
        campSessions[sesisonIndex].SessionDate = campsessiondates[0] + "-" + campsessiondates[1] + "-" + campsessiondates[2];

        let sessionDate = new Date(campSessions[sesisonIndex].SessionDate).getTime();

        if (sessionDate >= startDate && sessionDate <= endDate) {
          holidayCampReportObject.sessionNmemerList.push({
            SessionDetails: campSessions[sesisonIndex].SessionName + " - " + campSessions[sesisonIndex].StartTime + " Hrs. to " + campSessions[sesisonIndex].EndTime + " Hrs. on " + this.comonService.getDateIn_DD_MMM_YYYY_Format(campSessions[sesisonIndex].SessionDate) + " - " + (campSessions[sesisonIndex]["Members"].length + " Enrolled"),
            Member: [],
          });

          for (let memberIndex = 0; memberIndex < campSessions[sesisonIndex]["Members"].length; memberIndex++) {
            campSessions[sesisonIndex]["Members"] = this.comonService.sortingObjects(campSessions[sesisonIndex]["Members"], "FirstName");
            //if (campSessions[sesisonIndex]["Members"][memberIndex].IsActive){
            let memberObj = {};
            
            let index = memberIndex;
            memberObj["SNO"] = index + 1;
            memberObj["FirstName"] = campSessions[sesisonIndex]["Members"][memberIndex].FirstName;
            memberObj["LastName"] = campSessions[sesisonIndex]["Members"][memberIndex].LastName;
            memberObj["MedicalCondition"] = campSessions[sesisonIndex]["Members"][memberIndex].MedicalCondition;
            memberObj["MemberType"] = campSessions[sesisonIndex]["Members"][memberIndex].IsEnable ? "Member" : "Non-Member";
            if(this.actionSheet.Age){
              memberObj["Age"] = campSessions[sesisonIndex]["Members"][memberIndex].Age;
            }
            if(this.actionSheet.EmailID){
              memberObj["EmailID"] = "";
            }
            if(this.actionSheet.Gender){
              memberObj["Gender"] = campSessions[sesisonIndex]["Members"][memberIndex].Gender == "male" ? "Male" : "Female";
            }
            if(this.actionSheet.MedicalCondition){
              memberObj["MedicalCondition"] = campSessions[sesisonIndex]["Members"][memberIndex].MedicalCondition;
            }
            if(this.actionSheet.PaymentStatus){
              memberObj["PaymentStatus"] = campSessions[sesisonIndex]["Members"][memberIndex].AmountPayStatus;
            }
            if(this.actionSheet.Phone){
              memberObj["PhoneNumber"] = "";
            }
            


            for (let iMemberIndex = 0; iMemberIndex < this.campMemberDetailsArray.length; iMemberIndex++) {
              if (campSessions[sesisonIndex]["Members"][memberIndex].Key == this.campMemberDetailsArray[iMemberIndex].Key) {
                if(this.actionSheet.Phone){
                  memberObj["PhoneNumber"] = this.campMemberDetailsArray[iMemberIndex].PhoneNumber;
                }
                if(this.actionSheet.EmailID){
                  memberObj["EmailID"] = this.campMemberDetailsArray[iMemberIndex].EmailID;
                }
                //memberObj["HasDisease"] = this.campMemberDetailsArray[iMemberIndex].HasDisease; //removed as per shubhankar suggestion
                break;
              }

            }
            

            // holidayCampReportObject.sessionNmemerList[(holidayCampReportObject.sessionNmemerList.length - 1)].Member.push(
            //   {
            //     FirstName: memberObj.FirstName,
            //     LastName: memberObj.LastName,
            //     MedicalCondition: memberObj.MedicalCondition,
            //     Age: memberObj.Age,
            //     Gender: memberObj.Gender,
            //     PaymentStatus: memberObj.PaymentStatus,
            //     PhoneNumber: memberObj.PhoneNumber,
            //     EmailID: memberObj.EmailID,
            //     HasDisease: memberObj.HasDisease,
            //   }
            // )

              holidayCampReportObject.sessionNmemerList[(holidayCampReportObject.sessionNmemerList.length - 1)].Member.push(memberObj);
            //}
          }
          



        }
      }



    }

    
    if (holidayCampReportObject.sessionNmemerList.length != 0) {
      let url = this.sharedservice.getEmailUrl();
      
      $.ajax({
        //url: url + "umbraco/surface/ActivityProSurface/CreatePdfForHolidayCampAndSendAttachment/",
        //https://activitypro-nest-261607.appspot.com/session/printreport
        url:`${this.nestUrl}/Holidaycamp/printsessionmembereport`,
        data: holidayCampReportObject,
        type: "POST",
        success: function (response) {

        }, error: function (error, xhr) {

        }
      });
      let message = "Email has been successfully sent.";
      this.comonService.toastMessage(message,2500,ToastMessageType.Success,ToastPlacement.Bottom);
      this.navCtrl.pop();

    }else{
      this.comonService.toastMessage("Camp must have session to print.",2500,ToastMessageType.Error,ToastPlacement.Bottom);
    }

  }


  chk(checkValue): boolean {
    if (checkValue == true) {
      return false;
    } else {
      return true;
    }
  }


  cancel() {
    this.navCtrl.pop();
  }

  onChangeStartDate() {
    // let startDate = new Date(this.actionSheet.start_date).getTime();
    // let endDate = new Date(this.actionSheet.end_date).getTime();
    // if (endDate < startDate) {
    //   this.actionSheet.start_date = this.campDetails.start_date;
    //   this.actionSheet.end_date = this.campDetails.end_date;
    //   this.comonService.toastMessage("End Date must be greater than start date", 2500,ToastMessageType.Error);
    // }
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
  MemberType:string;
}

export class ReportModel_V2 { 
  parentclub_id:string;
  camp_id:string;
  type: number;
  login_type:number;
  start_date: string; 
  end_date: string;
  subject:string;
  sheet_columns:string[];
  msg_body: string;
  attachment_name: string;
  loggedin_email:string;
  session_id:string;
  constructor(columns:string[],msg_body,subject,attach_name,camp_id,type,login_type){
    this.sheet_columns = columns;
    this.subject = subject;
    this.msg_body = msg_body;
    this.camp_id = camp_id;
    this.type = type;
    this.login_type = Number(login_type);
    this.parentclub_id = "";
    this.attachment_name = attach_name;
    this.loggedin_email = "";
    this.session_id = "";
  }
}