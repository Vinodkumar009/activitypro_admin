import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../services/firebase.service';
import { ToastController } from 'ionic-angular';
import { IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import { CopySessionInput, SessionCopyModel } from './model/session.model';
import gql from "graphql-tag";
import { GraphqlService } from '../../../services/graphql.service';
import { FinancialYearTerms } from '../../../shared/model/financial_terms.model';
@IonicPage()
@Component({
  selector: 'createcopysession-page',
  templateUrl: 'createcopysession.html'
})

export class CreateCopySession {
  copy_session_input:CopySessionInput = {
    user_device_metadata:{
      UserAppType:0,
      UserDeviceType:1,
    },
    user_postgre_metadata:{
      UserMemberId:""
    },
    term_id:"",
    term_name:"",
    term_start_date:"",
    term_end_date:"",
    pay_by_date:"",
    financial_year_id:"",
    session_dets:[]
  };
  Status:{StatusCode:number,StatusText:string}[]=[
    {StatusCode:1,StatusText:"Public"},
    {StatusCode:0,StatusText:"Hide"}
  ];
  parentClubKey: any;
  themeType: number;
  attendanceObj = {
    StartDate: '',
    EndDate: '',
    AttendanceStatus: '',
    CanceledReason: '',
    AttendanceOn: new Date().getTime(),
    Comments: ""
  }
  days = [];
  financialYears = [];
  // currentFinancialYear: string = "";
  // currentFinancialYearKey: string;
  selectedClub: string = "";
  terms:FinancialYearTerms[] = [];
  selectedTerm: string = "";
  sessionList = [];
  

  sessionArrOfObj = [];
  termForSession = {
    TermComments: '',
    TermEndDate: '',
    TermName: '',
    TermNoOfWeeks: '',
    TermPayByDate: '',
    IsActive: true,
    TermStartDate: '',
    HalfTermStartDate: '',
    HalfTermEndDate: '',
    isForAllActivity: false,
    // FinancialYearKey:''
  };
  memberList = [];
  
  returnedKey: any;
  currencyDetails = "";
  constructor(public commonService: CommonService, 
    public loadingCtrl: LoadingController, 
    private toastCtrl: ToastController, 
    public alertCtrl: AlertController, 
    public navParams: NavParams,
     storage: Storage, public fb: FirebaseService, 
     public navCtrl: NavController, 
    public sharedservice: SharedServices, 
    public popoverCtrl: PopoverController,
    private graphqlService: GraphqlService,) {
    this.themeType = sharedservice.getThemeType();

    //let termList = navParams.get('Terms');
    this.sessionList = navParams.get('session_list');
    console.log(this.sessionList);
    this.selectedClub = navParams.get('club_id');

    // if (termList != undefined) {
    //   for (let i = 0; i < termList.length; i++) {
    //     if ((new Date(termList[i].TermEndDate)).getTime() - (new Date().getTime()) >= 0) {
    //       this.terms.push(termList[i]);
    //     }
    //   }
    // }

    //if (this.terms != undefined) {
      storage.get('userObj').then((val) => {
        val = JSON.parse(val);
        if (val.$key != "") {
          this.parentClubKey = val.UserInfo[0].ParentClubKey;
          this.copy_session_input.user_postgre_metadata.UserMemberId = this.sharedservice.getLoggedInId();
          this.copy_session_input.user_device_metadata.UserAppType = this.sharedservice.getPlatform() == "android" ? 1 : 2;
          // this.getFinancialYearList();
          this.getTermList();
          if (this.sessionList != undefined) {
            this.sessionList.forEach(element => {
              element.session_fee = parseFloat(element.session_fee).toFixed(2)
              element.session_fee_for_nonmember = parseFloat(element.session_fee_for_nonmember).toFixed(2)
              element.IsShowFee = false;
            });
          }
        }
      });
    //}
  
    storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);
    }).catch(error => {
    });
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }

  getTermList() {
    const termsInput = {
      firebase_fields:{
          parentclub_id:this.parentClubKey,
          club_id:this.selectedClub,
      },
      //ActionType:1, //to get terms >= last year
      AppType:0, //0-Admin
      DeviceType:this.sharedservice.getPlatform() == "android" ? 1 : 2 //1-android,2-IOS
    }
    const financial_terms_query = gql`
    query getParentClubFianancialTerms($termsInput: FinancialTermsInput!){
        getParentClubFianancialTerms(financialTermsInput:$termsInput){
            term_id
            financial_year_id
            is_for_all_activity
            term_name
            term_start_date
            term_end_date
            term_payby_date
            halfterm_start_date
            halfterm_end_date
            activities
        }
    }
    `;
    this.graphqlService.query(financial_terms_query,{termsInput: termsInput},0)
      .subscribe((res: any) => {
          this.terms = res.data.getParentClubFianancialTerms as FinancialYearTerms[];
          console.log("terms lists:", JSON.stringify(this.terms));
          if(this.terms.length >0){
              this.selectedTerm = this.terms[0].term_id;
              this.copy_session_input.term_name = this.terms[0].term_name;
              this.copy_session_input.term_start_date = this.terms[0].term_start_date;
              this.copy_session_input.term_end_date = this.terms[0].term_end_date;
              this.copy_session_input.financial_year_id = this.terms[0].financial_year_id;
              this.copy_session_input.pay_by_date = this.terms[0].term_payby_date;
          }else{
            this.commonService.toastMessage("No terms found for the selected club",2500,ToastMessageType.Error);
          }  
      },
     (error) => {
          // this.commonService.hideLoader();
          console.error("Error in fetching:", error);
         //Handle the error here, you can display an error message or take appropriate action.
     })

  }



  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }

  

  cancelSessionCreation() {
    let confirm = this.alertCtrl.create({
      //title: 'Use this lightsaber?',
      message: 'Are you sure you want to cancel the session creation? ',
      buttons: [
        {
          text: 'No',
          role:'cancel',
          handler: () => {

          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.navCtrl.pop();

          }
        }
      ]
    });
    confirm.present();
  }


  // getFinancialYearList() {
  //   this.fb.getAll("/FinancialYear/Type2/" + this.parentClubKey).subscribe((data) => {

  //     let financialYears = data;
  //     if (financialYears.length != 0) {
  //       let monthArray = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  //       let currentYear = new Date().getFullYear();
  //       let currentMonth = new Date().getMonth();
  //       let isDone = false;
  //       for (let i = 0; i < financialYears.length; i++) {
  //         if ((financialYears[i].StartYear == financialYears[i].EndYear) && (parseInt(financialYears[i].EndYear) == currentYear) && (currentMonth <= monthArray.indexOf(financialYears[i].EndMonth))) {
  //           isDone = true;
  //           this.currentFinancialYear = financialYears[i].$key;
  //           break;
  //         }
  //       }
  //       if (!isDone) {
  //         for (let financialYearIndex = 0; financialYearIndex < financialYears.length; financialYearIndex++) {
  //           let currentYear = new Date().getFullYear();
  //           let monthArray = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  //           let endMonthIndex = monthArray.indexOf(financialYears[financialYearIndex].EndMonth);
  //           let startMonthIndex = monthArray.indexOf(financialYears[financialYearIndex].StartMonth);
  //           let condition1 = (parseInt(financialYears[financialYearIndex].StartYear) <= currentYear);
  //           let condition2 = (parseInt(financialYears[financialYearIndex].EndYear) >= currentYear);
  //           let condition3 = false;
  //           if (parseInt(financialYears[financialYearIndex].StartYear) == currentYear) {
  //             condition3 = (startMonthIndex <= new Date().getMonth());
  //           } else {
  //             condition3 = (endMonthIndex >= new Date().getMonth());
  //           }
  //           if (condition1 && condition2 && condition3) {
  //             this.currentFinancialYear = financialYears[financialYearIndex].$key;
  //             break;
  //           }
  //         }
  //       }
  //       if (this.currentFinancialYear != "" && this.currentFinancialYear != undefined) {
  //         this.getTermList();
  //       }
  //     }
  //   });
  // }

  //done
  




  onChangeOfTerm() {
    let currentFinancialYearKey = "";
    this.copy_session_input.term_id = this.selectedTerm;
    const term = this.terms.find(x => x.term_id == this.selectedTerm);
    this.copy_session_input.term_name = term.term_name;
    this.copy_session_input.term_start_date = term.term_start_date;
    this.copy_session_input.term_end_date = term.term_end_date;
    this.copy_session_input.financial_year_id = term.financial_year_id;
    this.copy_session_input.pay_by_date = term.term_payby_date;
    // this.termForSession = {
    //   TermComments: '',
    //   TermEndDate: '',
    //   TermName: '',
    //   TermNoOfWeeks: '',
    //   TermPayByDate: '',
    //   IsActive: true,
    //   TermStartDate: '',
    //   HalfTermStartDate: '',
    //   HalfTermEndDate: '',
    //   isForAllActivity: false,
    // };

    // this.terms.forEach(element => {
    //   if (element.Key == this.selectedTerm) {
    //     this.termForSession.IsActive = true;
    //     this.termForSession.isForAllActivity = element.isForAllActivity;
    //     this.termForSession.TermComments = element.TermComments;
    //     this.termForSession.TermEndDate = element.TermEndDate;
    //     this.termForSession.TermName = element.TermName;
    //     this.termForSession.TermNoOfWeeks = element.TermNoOfWeeks;
    //     this.termForSession.TermPayByDate = element.TermPayByDate;
    //     this.termForSession.TermStartDate = element.TermStartDate;
    //     this.termForSession.HalfTermStartDate = element.HalfTermStartDate ? element.HalfTermStartDate : '';
    //     this.termForSession.HalfTermEndDate = element.HalfTermEndDate ? element.HalfTermEndDate : '';
    //     currentFinancialYearKey = element.FinancialYearKey;

    //   }
    // });

    // this.sessionArrOfObj.forEach(element => {
    //   element.StartDate = this.termForSession.TermStartDate;
    //   element.EndDate = this.termForSession.TermEndDate;
    //   element.PayByDate = this.termForSession.TermPayByDate;
    //   element.TermKey = this.selectedTerm;
    //   element.Term = {};
    //   element.Term[this.selectedTerm] = this.termForSession;
    //   element.FinancialYearKey = currentFinancialYearKey;
    // });
    // console.log(this.sessionArrOfObj);
  }


  cancel() {
    this.navCtrl.pop();
  }
  
  validateInput() {
    if (this.selectedTerm == "") {
      this.commonService.toastMessage("Select the target term for the session(s).",2500,ToastMessageType.Error);
      return false;
    }
    else {
      return true;
    }
  }

  save() {
    if (this.validateInput()) {
      let confirm = this.alertCtrl.create({
        title: "Copy Session",
        message: 'Are you sure you want to copy session(s)? ',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            handler: () => {

            }
          },
          {
            text: 'Read and Confirm',
            handler: () => {
              this.copySessions();
            }
          }
        ]
      });
      confirm.present();

    }
  }

  copySessions(){
    try{
      this.commonService.showLoader("Please wait");
      this.sessionList.forEach((session)=>{
        this.copy_session_input.session_dets.push({
          session_id:session.id,
          enrol_members:session.IsSelectMembers,
          member_fee:session.session_fee,
          non_member_fee:session.session_fee_for_nonmember,
          group_status:session.group_status
        })
      })
      console.log(this.copy_session_input);
      const term_ses_mutation = gql`
        mutation copySessions($sessionInput: CopySessionInput!) {
          copySessions(sessionInput: $sessionInput)
        }` 
        
        const term_ses_mutation_variable = { sessionInput: this.copy_session_input };
        this.graphqlService.mutate(
          term_ses_mutation, 
          term_ses_mutation_variable,
          0
        ).subscribe((response)=>{
          this.commonService.hideLoader();
          this.commonService.toastMessage("Session(s) copied successfully.",2500,ToastMessageType.Success,ToastPlacement.Bottom);
          this.commonService.updateCategory("update_session_list");
          this.navCtrl.remove(this.navCtrl.getActive().index - 1, 2);
          //this.reinitializeSession();
        },(err)=>{
          this.commonService.hideLoader();
          this.commonService.toastMessage("Session(s) copy failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        });   
    }catch(err){
      console.log(`${JSON.stringify(err)}`);
      this.commonService.toastMessage("Session(s) copy failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
      this.commonService.hideLoader();
    }
    
  }

  

  showFee(i) {
    this.sessionList[i].IsShowFee = !this.sessionList[i].IsShowFee
  }

}
