import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../services/firebase.service';
import gql from "graphql-tag";
import { IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import { GraphqlService } from '../../../services/graphql.service';
import { IClubCoaches, IClubDetails } from '../../../shared/model/club.model';
import { FinancialYearTerms } from '../../../shared/model/financial_terms.model';
import { GroupSession } from './sessions.model';
@IonicPage()
@Component({
  selector: 'copysession-page',
  templateUrl: 'copysession.html'
})

export class CopySession {
  parentClubKey: string;
  themeType: number;
  selectedClub: any;
  types = [];
  selectedActivityType: string = "";
  clubs: IClubDetails[] = [];
  terms:FinancialYearTerms[] = [];
  coachs:IClubCoaches[] = [];
  sessionList:GroupSession[] = [];
  financialYears: any;
  currentFinancialYear: any;
  selectedTerm: string = "";
  acType: any;
  termForSession = { TermComments: '', TermEndDate: '', TermName: '', TermNoOfWeeks: '', TermPayByDate: '', IsActive: true, TermStartDate: '', isForAllActivity: false };
  isSelectAll: boolean = false;
  isUnselectAll: boolean = false;
  sessionArrList = [];
  sessionListBeforeFilter = [];
  
  selectedCoach: string = "";
  listOfTerms = [];
  constructor(public commonService: CommonService, 
    public loadingCtrl: LoadingController, 
    public alertCtrl: AlertController, 
    public navParams: NavParams, storage: Storage, public fb: FirebaseService, 
    public navCtrl: NavController, public sharedservice: SharedServices, 
    public popoverCtrl: PopoverController,
    private graphqlService: GraphqlService,) {
    this.themeType = sharedservice.getThemeType();
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        this.getClubList();
      }
    })
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
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
      message: 'Are you sure, You want to cancel the session creation? ',
      buttons: [
        {
          text: 'No',
          handler: () => {
            //console.log('Disagree clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.navCtrl.pop();
            //console.log('Agree clicked');
          }
        }
      ]
    });
    confirm.present();
  }


  ///1st

  getClubList() {
    // const club$Obs = this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
    //   this.clubs = data;
    //   club$Obs.unsubscribe();
    //   if (this.clubs.length != 0) {
    //     this.selectedClub = this.clubs[0].$key;
    //     this.getTermList();
    //     this.getCoachListForGroup();
    //   }
    // });
    const clubs_query = gql`
    query getParentClubVenues($firebase_parentclubId: String!){
      getParentClubVenues(firebase_parentclubId:$firebase_parentclubId){
          Id
          ClubName
          FirebaseId
          MapUrl
          sequence
      }
    }
    `;
    this.graphqlService.query(clubs_query,{firebase_parentclubId: this.parentClubKey},0)
      .subscribe((res: any) => {
        this.clubs = res.data.getParentClubVenues as IClubDetails[];
        
        if(this.clubs.length > 0){
          this.selectedClub = this.clubs[0].FirebaseId;
          console.log("clubs lists:", JSON.stringify(this.clubs));
          this.getTermList();
          this.getCoachListForGroup();
        }else{
          this.commonService.toastMessage("clubs not found",2500,ToastMessageType.Error)
        }
      },
     (error) => {
          //this.commonService.hideLoader();
          console.error("Error in fetching:", error);
         // Handle the error here, you can display an error message or take appropriate action.
     }) 
  }

  onChangeOfClub() {
    this.sessionList = [];
    this.coachs = [];
    this.selectedCoach = "";
    this.sessionListBeforeFilter = [];
    this.isSelectAll = false;
    this.isUnselectAll = false;
    this.getTermList();
    this.getCoachListForGroup();
  }

  
  getTermList() {
    // const terms$Obs = this.fb.getAll("/Term/Type2/" + this.parentClubKey + "/" + this.selectedClub + "/").subscribe((data) => {
    //   terms$Obs.unsubscribe();
    //   this.selectedCoach = "";
    //   this.terms = [];
    //   this.listOfTerms = [];

    //   let financialYearList = data;
    //   let term = [];
    //   if (financialYearList.length > 0) {
    //     for (let i = 0; i < financialYearList.length; i++) {
    //       financialYearList[i] = this.commonService.convertFbObjectToArray(financialYearList[i]);
    //     }
    //   }

    //   for (let i = 0; i < financialYearList.length; i++) {
    //     for (let j = 0; j < financialYearList[i].length; j++) {
    //       financialYearList[i][j]["EndTime"] = new Date(financialYearList[i][j].TermEndDate).getTime();
    //       this.listOfTerms.push(financialYearList[i][j]);
    //     }
    //   }
    //   this.listOfTerms = this.commonService.sortingObjects(this.listOfTerms, "EndTime");
     
    //   const last_year = new Date().getFullYear() - 1;

    //   this.terms = this.listOfTerms.filter((term)=> new Date(term.TermEndDate).getFullYear() >= last_year);
	 
    //   if (this.terms.length > 0) {
    //     console.log(this.listOfTerms);
    //     this.selectedTerm = this.terms[0].Key;
    //     this.getSessionlist();
    //   }
    // });


    const termsInput = {
      firebase_fields:{
          parentclub_id:this.parentClubKey,
          club_id:this.selectedClub,
      },
      ActionType:1, //to get terms >= last year
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
  onChangeOfTerm() {
    this.sessionList = [];
    this.selectedCoach = "";
    this.isSelectAll = false;
    this.isUnselectAll = false;
    this.getSessionlist();
  }
  getCoachListForGroup() {
    // const club_coach$Obs = this.fb.getAll("Club/Type2/" + this.parentClubKey + "/" + this.selectedClub + "/Coach").subscribe((data) => {
    //   club_coach$Obs.unsubscribe();
    //   this.coachs = data;
    // });
    const coachInput = {
      parentclub:this.parentClubKey,
      club:this.selectedClub,
      fetch_from:0
    }
    const coaches_query = gql`
    query getClubCoaches($coachInput: CoachFetchInput!){
      getClubCoaches(coachInput:$coachInput){
          coach_firebase_id
          first_name
          last_name
          gender
          email_id 
        }
    }
    `;
      this.graphqlService.query(coaches_query,{coachInput},0)
        .subscribe((res: any) => {
          this.coachs = res.data.getClubCoaches as IClubCoaches[];
          console.log("clubs lists:", JSON.stringify(this.coachs));
        },
       (error) => {
            console.error("Error in fetching:", error);
           // Handle the error here, you can display an error message or take appropriate action.
       }) 
  }
    onChangeCoach() {
      this.sessionArrList = [];
      this.sessionList = [];
      this.isSelectAll = false;
      this.isUnselectAll = false;
      // if (this.selectedCoach != "") {
      //   this.sessionListBeforeFilter.forEach(element => {
      //     if (element.CoachKey == this.selectedCoach) {
      //       this.sessionList.push(element);
      //     }
      //   });
      // }
      // else if (this.selectedCoach == "") {
      //   this.sessionList = this.sessionListBeforeFilter;
      // }

      this.getSessionlist();
    }

    getSessionlist() {
      // const club_sesions$Obs = this.fb.getAll("/Session/" + this.parentClubKey + "/" + this.selectedClub).subscribe((data) => {
      //   club_sesions$Obs.unsubscribe();
      //   this.sessionList = [];
      //   this.sessionListBeforeFilter = [];
      //   for (let i = 0; i < data.length; i++) {
      //     let x = this.commonService.convertFbObjectToArray(data[i].Group);
      //     for (let j = 0; j < x.length; j++) {
      //       if ((x[j].IsActive) && (x[j].IsEnable == undefined || x[j].IsEnable) && (x[j].TermKey == this.selectedTerm)) {
      //         x[j].IsSelect = false;
      //         x[j].IsSelectMembers = true;
      //         this.sessionList.push(x[j]);
      //         this.sessionListBeforeFilter.push(x[j]);
      //       }
      //     }
      //   }
      // });


    this.commonService.showLoader("Please wait");
    console.log("Get Session List Api Called");
    
    const sessionListingInput = {
      ParentClubKey:this.parentClubKey,
      // PostgresFields:{
      //   PostgresParentclubId:"",
      //   PostgresClubId:"",
      // },
      CoachKey:this.selectedCoach!="" ? this.selectedCoach : null,
      ClubKey:this.selectedClub,
      TermKey:this.selectedTerm
    }
    const sessionList = gql`
      query getSessionList($sessionDetailsInput: SessionListingInput!) {
        getSessionList(sessionDetailsInput: $sessionDetailsInput) {
          id
          term_key
          session_name
          firebase_sessionkey
          firebase_clubkey
          group_status
          firebase_activitykey
          activity_category_name
          activity_subcategory_name
          duration
          days
          no_of_weeks
          start_time
          end_time
          start_date
          end_date
          group_size
          session_fee
          session_fee_for_nonmember
        }
      }
    `;
    
    this.graphqlService
      .query(
        sessionList, { sessionDetailsInput: sessionListingInput }, 0
      )
      .subscribe(({ data }) => {
        this.commonService.hideLoader();
        console.log("sessionlist data" + JSON.stringify(data["getSessionList"]));
        this.sessionList = data["getSessionList"] as GroupSession[];
        if(data["getSessionList"].length > 0){
          this.sessionList = data["getSessionList"].map((session:GroupSession)=>{
            return {
              IsSelect:false,
              IsSelectMembers:false,
              ...session
            }
          })
        }
      });
    (err) => {
      this.commonService.hideLoader();
      console.log(JSON.stringify(err));
      this.commonService.toastMessage("Failed to fetch session list",2500,ToastMessageType.Error,ToastPlacement.Bottom);
    };


  }

  selectAllToggole() {
    this.sessionArrList = [];
    if (this.isSelectAll) {
      this.isUnselectAll = false;
      this.sessionList.forEach(element => {
        element["IsSelect"] = true;
        this.sessionArrList.push(element);
      });
    }
    else {
      this.sessionList.forEach(element => {
        element["IsSelect"] = false;
      });
    }
  }
  selectNoneToggole() {
    this.sessionArrList = [];
    if (this.isUnselectAll) {
      this.isSelectAll = false;
      this.sessionList.forEach(element => {
        element["IsSelect"] = false;
      });
    }
  }
  selectSession(session:GroupSession) {
    this.isSelectAll = false;
    this.isUnselectAll = false;
    let isExistElement = false;
    for (let i = 0; i < this.sessionArrList.length; i++) {
      if (session.id == this.sessionArrList[i].id) {
        this.sessionArrList.splice(i, 1);
        isExistElement = true;
        break;
      }
    }
    if (!isExistElement) {
      this.sessionArrList.push(session);
    }
  }

  cancel() {
    this.navCtrl.pop();
  }

  continue() {
    if(this.sessionArrList.length == 0){
      this.commonService.toastMessage("Please select session(s)",2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    this.navCtrl.push("CreateCopySession", {
    "parentclub_id": this.parentClubKey,
    "club_id": this.selectedClub, 
    "session_list": this.sessionArrList });
    
  }


}
