import { Component, ViewChild} from '@angular/core';
import { LoadingController, NavController, Platform, AlertController, FabContainer } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import { FirebaseService } from '../../../services/firebase.service';
//import { LanguageService } from '../../../services/language.service';
import { Storage } from '@ionic/storage';
import { IonicPage, ActionSheetController } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import * as moment from 'moment';
import { ToastController } from 'ionic-angular/components/toast/toast-controller';
import { first } from 'rxjs/operators';
import { SchoolSessions, SchoolVenue } from './schoolsession.model';
import gql from 'graphql-tag';
import { GraphqlService } from '../../../services/graphql.service';
import { setDay } from '../../../shared/utility/utility';
@IonicPage()
@Component({
    selector: 'schoolsessionlist-page',
    templateUrl: 'schoolsessionlist.html',
})
export class Type2SchoolSessionList {
   // @ViewChild('fab')fab : FabContainer;
   LangObj:any = {};//by vinod
   navigate;
   isShowPaymentModal: boolean = false;
    session_count:number = 0;
    themeType: number;
    isAndroid: boolean = false;
    myIndex: number = -1;
    parentClubKey: any;
    loading: any;
    
    schools = [];
    selectedSchool: string = "all";
    sessionMemberDetails = [];
    pastSessionMemberDetails = [];
    sessionMemberLength = [];
    MemberListsForDeviceToken = [];
    pastSchoolSessionList = [];
    pastSessionMemberLength = [];
    selectedType:boolean = true;
    selectedSession:any = "";
    schoolVenue: SchoolVenue[];
    school_sessions: SchoolSessions[] = [];
    filter_scl_sessions: SchoolSessions[] = []
    getSchoolSessionsInput: GetSchoolSessions = {
        ParentClubKey: '',
        ClubKey: '',
        MemberKey: '',
        AppType: 0,
        ActionType: 1,
        DeviceType: 0,
        parentclub_id: '',
        school_id: '',
        club_id: '',
        coach_id: ''
    }
    loggedin_type:number = 2;
    can_coach_see_revenue:boolean = true;
    constructor(public events: Events,
        public toastCtrl:ToastController,
        private graphqlService: GraphqlService,
        public sharedServices:SharedServices,
        public alertCtrl:AlertController,public actionSheetCtrl: ActionSheetController, 
        public commonService: CommonService, public loadingCtrl: LoadingController, 
        public fb: FirebaseService, public storage: Storage, public navCtrl: NavController,
        public sharedservice: SharedServices, private platform: Platform, 
        public popoverCtrl: PopoverController, 
        //private langService:LanguageService
        ) {

        this.themeType = sharedservice.getThemeType();
        this.isAndroid = this.platform.is('android');
        
    }

    
    ionViewWillEnter(){
        this.commonService.category.pipe(first()).subscribe((data) => {
            this.loggedin_type = this.sharedservice.getLoggedInType();
            if (data == "update_scl_session_list") {
                this.storage.get('userObj').then(async(val) => {
                    val = JSON.parse(val);
                    if (val.$key != "") {
                        this.parentClubKey = val.UserInfo[0].ParentClubKey;
                        this.getSchoolSessionsInput.parentclub_id = this.sharedServices.getPostgreParentClubId(); 
                        this.loggedin_type = this.sharedservice.getLoggedInType();
                        if(this.loggedin_type === 4){
                            this.getSchoolSessionsInput.coach_id = await this.getCoachIdsByFirebaseKeys([val.UserInfo[0].CoachKey]) 
                        }
                        this.getSchools();
                        this.getAllSchoolSessionList()
                    }
                }) 
            }
        })    
    }

    ionViewDidEnter() {
       // this.fab.close();
        this.myIndex = -1;
        //this.getSchoolSessionlist();
    }
    ionViewDidLoad() {
        this.getLanguage();
        this.events.subscribe('language', (res) => {
            this.getLanguage();
        });
    }

    getLanguage() {
        this.storage.get("language").then((res) => {
            //console.log(res["data"]);
            this.LangObj = res.data;
            //this.getSchools();
        })
    }
    
    swithActivePast(){
        //this.selectedType = val;
        this.getSchoolSessionsInput.ActionType = this.getSchoolSessionsInput.ActionType == 1 ? 0 : 1; //if true active otherwise get past data
        this.getAllSchoolSessionList();
    }
    goToDashBoard() {
        this.navCtrl.setRoot("Dashboard");
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

    gotoCreateSchoolSession() {
        this.isShowPaymentModal = false;
        this.navCtrl.push("Type2CreateSchoolSession");
    }

    getCoachIdsByFirebaseKeys(coach_ids): Promise<any> {
        return new Promise((res, rej) => {
          const coach_query = gql`
        query getCoachesByFirebaseIds($coachIds: [String!]) {
          getCoachesByFirebaseIds(coachIds: $coachIds){
            Id
            first_name
            last_name
            coach_firebase_id
           }
        }`
          const coach_query_variables = { coachIds: coach_ids };
          this.graphqlService.query(
            coach_query,
            coach_query_variables,
            0
          ).subscribe((response) => {
            res(response.data["getCoachesByFirebaseIds"][0]["Id"]);
          }, (err) => {
            rej(err);
          });
        })
    
    }

    clubs: Array<any> = [];
  //------------------- get data for clubs , activity ------------------------------------
  
    //payment activity details
    checkPaymentSetup() {
        const activity$Obs = this.fb.getAll(`Activity/${this.parentClubKey}`).subscribe((res) => {
        activity$Obs.unsubscribe()
        console.log(res);
        let showmodal:boolean = true;
        for (let i = 0; i < this.clubs.length; i++) {
            for (let j = 0; j < res.length; j++) {
            if (this.clubs[i].$key === res[j].$key) {
                for (let key in res[j]) {
                if (key != "$key") {
                    res[j][key].PaymentSetup = Array.isArray(res[j][key].PaymentSetup) ? res[j][key].PaymentSetup: this.commonService.convertFbObjectToArray(res[j][key].PaymentSetup);
                    console.log(res[j][key].PaymentSetup);
                    for (let l = 0; l < res[j][key].PaymentSetup.length; l++) {
                        if (res[j][key].PaymentSetup[l].IsActive) {
                            if ((res[j][key].PaymentSetup[l].PaymentGatewayName == "RealEx" || res[j][key].PaymentSetup[l].PaymentGatewayName == "StripeConnect" || res[j][key].PaymentSetup[l].PaymentGatewayName == "paytm" || res[j][key].PaymentSetup[l].PaymentGatewayName == "Stripe") && (res[j][key].PaymentSetup[l].SetupType == "Session Management")) {
                                // console.log("matched");
                                // console.log(`${res[j][key].PaymentSetup[l].IsActive}:${res[j][key].PaymentSetup[l].PaymentGatewayName}:${res[j][key].PaymentSetup[l].SetupType}`);
                                showmodal = false;
                                this.isShowPaymentModal = false;
                            }
                        }
                    }
                }
                }
            }
            }
        }
        this.isShowPaymentModal = showmodal;
        
        }, (err) => {
        console.log(err);
        })
    }


    //custom component for payment setup redirect
    GotoPaymentSetup() {
        this.isShowPaymentModal = false;
        let setup = {
            SetupName: 'Session Management',
            DisplayName: 'Group Session',
            VenueList: true,
            ImageUrl: "https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815/o/ActivityPro%2FActivityIcons%2Fgroupsession.svg?alt=media&token=1f19b4aa-5051-4131-918d-4fa17091a7f9"
        }
        this.navCtrl.push("StripeconnectsetuplistPage", { setupDetails: setup });
    }

    skip() {
        this.isShowPaymentModal = false;
    }

    getSchools() {
        // const schools$Obs = this.fb.getAll("/School/Type2/" + this.parentClubKey + "/").subscribe((data) => {
        //     this.schools = [];
        //     data.forEach(element => {
        //         if (element.IsActive) {
        //             this.schools.push(element);
        //             //this.selectedSchool = this.schools[0].$key;
        //         }
        //     });
        //     schools$Obs.unsubscribe();
        //     this.getSchoolSessionlist();
        // });

        const schools_query = gql`
        query getParentClubSchoolsById($parentclubId: String!){
            getParentClubSchoolsById(parentclubId:$parentclubId){
               id
               school_name
               firebasekey
               firstline_address
               secondline_address
               email_id
               contact_no
               postcode
            }
        }
        `;
          this.graphqlService.query(schools_query,{parentclubId: this.sharedServices.getPostgreParentClubId()},0)
            .subscribe((res: any) => {
                //this.commonService.hideLoader();
                this.schools = res.data.getParentClubSchoolsById as SchoolVenue[];
                this.schoolVenue = res.data.getParentClubSchoolsById;
                
                console.log("Venue List Data Is:", JSON.stringify(this.schoolVenue));
            },
           (error) => {
                // this.commonService.hideLoader();
                   console.error("Error in fetching:", error);
               // Handle the error here, you can display an error message or take appropriate action.
           })
    }

    onChangeOfSchool() {
        this.getSchoolSessionsInput.school_id = this.selectedSchool === 'all' ? "" :this.selectedSchool;
        this.getAllSchoolSessionList();
    }


    getAllSchoolSessionList(){
        this.commonService.showLoader("Please wait")
        this.school_sessions = [];
        this.pastSchoolSessionList = [];
       
        const schoolSessionQuery = gql`
          query getAllSchoolSessionByParentclubSchool($sessionInput: GetSchoolSessions!){
              getAllSchoolSessionByParentclubSchool(sessionInput:$sessionInput){
                  id
                  school_session_name
                  start_date
                  end_date
                  start_time
                  end_time
                  duration
                  days
                  group_size
                  member_fee
                  non_member_fee
                  capacity_left
                  comments
                  activity_category_name
                  activity_subcategory_name
                  coach_names
                  enrolled_count
                  ClubDetails{
                    Id
                    FirebaseId
                    ClubName
                 }
                 Images{
                     id
                    image_url
                 }
                 CoachDetails{
                   Id
                   first_name
                   last_name
                   profile_image
                 }
                ParentClubSchool{
                  parentclub{
                    Id
                  }
                  school{
                    id
                    school_name
                  }
                }
              }
            }
          `;
            this.graphqlService.query(schoolSessionQuery,{sessionInput: this.getSchoolSessionsInput},0)
              .subscribe((res: any) => {
                  this.commonService.hideLoader();
                  this.school_sessions = res.data.getAllSchoolSessionByParentclubSchool as SchoolSessions[];
                  this.filter_scl_sessions = JSON.parse(JSON.stringify(this.school_sessions));
                  this.session_count = this.filter_scl_sessions.length
                  console.log("School List Data Is:", JSON.stringify(this.school_sessions));
              },
             (error) => {
                this.commonService.hideLoader();
                console.error("Error in fetching:", error);   
                this.commonService.toastMessage("Please try again",2500,ToastMessageType.Error);
            })
    }



    //search functionality
    getFilterItems(ev: any) {
        let val = ev.target.value;
        if (val && val.trim()!= "") {
            this.filter_scl_sessions = this.school_sessions.filter((item) => {
                if (item.school_session_name != undefined) {
                  if (item.school_session_name.toLowerCase().indexOf(val.toLowerCase()) > -1) {
                    return true;
                  }
                }
                if (item.CoachDetails!= undefined && item.CoachDetails.length > 0) {
                    item.CoachDetails.some(coach => {
                        if (coach.first_name != undefined) {
                            if (coach.first_name.toLowerCase().indexOf(val.toLowerCase()) > -1) {
                                return true;
                            }
                        }
                    })
                }
                if (setDay(item.days) != undefined) {
                  if (setDay(item.days).toLowerCase().indexOf(val.toLowerCase()) > -1) {
                    return true;
                  }
                }
                // if (item.ActivityDetails != undefined) {
                //   if (item.ActivityDetails.ActivityName.toLowerCase().indexOf(val.toLowerCase()) > -1) {
                //     return true;
                //   }
                // }
                if (item.start_time != undefined) {
                  if (item.start_time.toLowerCase().indexOf(val.toLowerCase()) > -1) {
                    return true;
                  }
                }
                if (item.duration != undefined) {
                  if (item.duration.toLowerCase().indexOf(val.toLowerCase()) > -1) {
                    return true;
                  }
                }
                this.session_count = this.filter_scl_sessions.length;
            });             
        }else{
            this.filter_scl_sessions = JSON.parse(JSON.stringify(this.school_sessions));
            this.session_count = this.filter_scl_sessions.length;
        }
    }

    // getSchoolSessionlist() {
    //    if(this.selectedSchool == 'all'){
    //     this.schoolSessions = [];
    //     this.pastSchoolSessionList = [];
    //     this.getAllSchoolSessionList();
    //    }else{
    //     const school$Obs = this.fb.getAllWithQuery("SchoolSession/" + this.parentClubKey + "/", { orderByChild: 'SchoolKey', equalTo: this.selectedSchool}).subscribe((data) => {
    //         school$Obs.unsubscribe();
    //         this.schoolSessions = [];
    //         this.pastSchoolSessionList = [];
    //         for (let i = 0; i < data.length; i++) {
    //             if ((new Date(data[i].EndDate).getTime()) >= (new Date(this.commonService.getTodaysDate()).getTime())) {
    //                 this.schoolSessions.push(data[i]);
    //             }else{
    //                 this.pastSchoolSessionList.push(data[i]);
    //             }
    //         }
    //         this.sessionMemberLength = [];
    //         this.pastSessionMemberLength = [];
    //         for (let i = 0; i < this.schoolSessions.length; i++) {
    //             if (this.schoolSessions[i].Member != undefined) {
    //                 let j = 0;
    //                 let activeMemberLength = 0;
    //                 let members = [];
    //                 members = Array.isArray(this.schoolSessions[i].Member) ? this.schoolSessions[i].Member : this.commonService.convertFbObjectToArray(this.schoolSessions[i].Member);
    //                 for (j = 0; j < members.length; j++) {
    //                     if (members[j].IsActive) {
    //                         activeMemberLength++;
    //                     }
    //                 }
    //                 this.sessionMemberLength.push(activeMemberLength);
    //             } else {
    //                 this.sessionMemberLength.push(0);
    //             }
    //         }
    //         for (let i = 0; i < this.pastSchoolSessionList.length; i++) {
    //             if (this.pastSchoolSessionList[i].Member != undefined) {
    //                 let j = 0;
    //                 let pastActiveMemberLength = 0;
    //                 let pastMembers = [];
    //                 pastMembers = Array.isArray(this.pastSchoolSessionList[i].Member) ? this.pastSchoolSessionList[i].Member : this.commonService.convertFbObjectToArray(this.pastSchoolSessionList[i].Member);
    //                 for (j = 0; j < pastMembers.length; j++) {
    //                     if (pastMembers[j].IsActive) {
    //                         pastActiveMemberLength++;
    //                     }
    //                 }
    //                 this.pastSessionMemberLength.push(pastActiveMemberLength);
    //             } else {
    //                 this.pastSessionMemberLength.push(0);
    //             }
    //         }
    //     });
    //    }
       
    // }
    //navigation to session details page 
    gotoEachSessionDetails(session:SchoolSessions){
       // this.navCtrl.push("EachSessionDetailsPage",{sessionObj:session})
       this.navCtrl.push("EachSessionDetailsPage", { sessionObj: session })
    }

   

    addMemberToSession(session) {
        this.navCtrl.push('Type2AddMemberSchoolSession', { SchoolSession: session });
    }
  
    

    presentActionSheet(session) {
        this.myIndex = -1;
        let actionSheet
        if (this.platform.is('android')) {
            actionSheet = this.actionSheetCtrl.create({
                //title: 'Modify your album',
                buttons: [
                    {
                        text: 'Add Member',
                        icon: 'people',
                        handler: () => {
                            this.addMemberToSession(session)
                        }
                    },
                    {
                        text: 'Edit',
                        icon: 'create',
                        handler: () => {
                            this.editSession(session)
                        }
                    },
                    {
                        text: 'Notify',
                        icon: 'md-notifications',
                        handler: () => {
                            this.notifyMeber(session)
                        }
                    }
                    ,
                    {
                        text: 'Email',
                        icon: 'mail',
                        handler: () => {
                            this.sendEmail(session)
                        }
                    },
                    {
                        text: 'Print Member',
                        icon: 'ios-clipboard',
                        handler: () => {
                            this.navCtrl.push('SchoolmembersheetPage',{
                                sessionOInfo:session
                            });
                        }
                    },
                    {
                        text: 'Copy',
                        icon: 'ios-albums-outline',
                        handler: () => {
                            this.presentConfirm(session)
                        }
                    },
                    {
                        text: 'Attendance',
                        icon: 'ios-clipboard',
                        handler: () => {
                            this.navCtrl.push('SchoolesessiondetailsforattendancePage',{
                                sessionOInfo:session
                            });
                        }
                    },
                    {
                        text: 'Cancel',
                        icon: 'close',
                        role: 'cancel',
                        handler: () => {

                        }
                    }
                ]
            });

            actionSheet.present();
        } else {
            actionSheet = this.actionSheetCtrl.create({
                //title: 'Modify your album',
                buttons: [
                    {
                        text: 'Add Member',
                        handler: () => {
                            this.addMemberToSession(session)
                        }
                    },
                    {
                        text: 'Edit',
                        handler: () => {
                            this.editSession(session)
                        }
                    },
                    {
                        text: 'Notify',
                        handler: () => {
                            this.notifyMeber(session)
                        }
                    }
                    ,
                    {
                        text: 'Email',
                        handler: () => {
                            this.sendEmail(session)

                        }
                    },
                    {
                        text: 'Print Member',
                        handler: () => {
                            this.navCtrl.push('SchoolmembersheetPage',{
                                sessionOInfo:session
                            });
                         
                        }
                    },
                    {
                        text: 'Copy',
                     
                        handler: () => {
                            this.presentConfirm(session)
                            
                         
                        }
                    },
                    {
                        text: 'Attendance',
                        handler: () => {
                            this.navCtrl.push('SchoolesessiondetailsforattendancePage',{
                                sessionOInfo:session
                            });
                        }
                    },
                    {
                        text: 'Cancel',
                        // icon: 'close',
                        role: 'cancel',
                        handler: () => {

                        }
                    }
                ]
            });

            actionSheet.present();
        }



    }
    presentConfirm(session) {
        let alert = this.alertCtrl.create({
          title: 'Copy School Session',
          message: 'Do you want to copy?',
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              handler: () => {
                console.log('Cancel clicked');
              }
            },
            {
              text: 'Copy',
              handler: () => {
                this.navCtrl.push('CopyschoolsessionPage',{
                    SchoolSession: session 
                });
              }
            }
          ]
        });
        alert.present();
    }
    notifyMeber(session) {
        let isPresent = false;
        let sendTo = [];
        if (session.Member != undefined) {
            if (session.Member.length != 0) {
                let a = [];
                let mlist = [];
                a = Array.isArray(session.Member) ? session.Member : this.commonService.convertFbObjectToArray(session.Member);
                for (let i = 0; i < a.length; i++) {
                    if (a[i].IsActive) {
                        if (a[i].ParentKey != "") {
                            isPresent = false;
                            for (let j = 0; j < mlist.length; j++) {
                                if (mlist[j].Key == a[i].ParentKey) {
                                    isPresent = true;
                                    break;
                                }
                            }
                            if (!isPresent) {
                                mlist.push({ Key: a[i].ParentKey, ClubKey: a[i].ClubKey });
                            }
                        } else {
                            mlist.push(a[i]);
                        }


                    }
                }
                for (let tokenIndex = 0; tokenIndex < this.MemberListsForDeviceToken.length; tokenIndex++) {
                    for (let memberindex = 0; memberindex < mlist.length; memberindex++) {
                        if (this.MemberListsForDeviceToken[tokenIndex].$key == mlist[memberindex].Key) {
                            sendTo.push(this.MemberListsForDeviceToken[tokenIndex]);
                        }
                    }
                }
                this.navCtrl.push("Type2SchoolSessionNotifications", { UsersDeviceToken: sendTo, SessionDetails: session, MemberList: mlist });
            }
        }

    }

    editSession(session) {
        // console.log(session);
        this.navCtrl.push('Type2EditSchoolSessionDetails', { SchoolSession: session });
    }
    sendEmail(session) {
        let isPresent = false;
        let sendTo = [];
        if (session.Member != undefined) {
            if (session.Member.length != 0) {
                let a = [];
                let mlist = [];
                a = Array.isArray(session.Member) ? session.Member : this.commonService.convertFbObjectToArray(session.Member);
                for (let i = 0; i < a.length; i++) {
                    if (a[i].IsActive) {
                        a[i].SignedUpType = a[i].ClubKey == "" ? 2 : 1;
                        if (a[i].ParentKey != "") {
                            isPresent = false;
                            for (let j = 0; j < mlist.length; j++) {
                                if (mlist[j].Key == a[i].ParentKey) {
                                    isPresent = true;
                                    break;
                                }
                            }
                            if (!isPresent) {
                                mlist.push({
                                    Key: a[i].ParentKey,
                                    ClubKey: a[i].ClubKey,
                                    IsChild: a[i].IsChild,
                                    SignedUpType: a[i].SignedUpType,
                                    FirstName: a[i].FirstName,
                                    LastName: a[i].LastName,
                                    EmailID: a[i].EmailID,
                                    ParentClubKey: a[i].ParentClubKey,
                                    ParentKey: a[i].ParentKey
                                });
                            }
                        } else {
                            mlist.push(a[i]);
                        }


                    }
                }


                // this.navCtrl.push("Type2SchoolSessionNotification", { UsersDeviceToken: sendTo, SessionDetails: session, MemberList: mlist });
                this.navCtrl.push("MailToMemberByAdminPage", { MemberList: mlist, SessionDetails: session, NavigateFrom: "SchoolSession" });
            }
        }
        // this.navCtrl.push("MailToMemberByAdminPage", { MemberList:  this.memberList, SessionDetails: this.campDetails, CampDetails: this.campDetails, NavigateFrom: "Holidaycamp" });
        console.clear();
        console.log(session);
    }
    getFormatedDays(dateObj){
        return moment(dateObj).format("DD-MMM-YYYY");
    }

    remove(member) {
        if (member.AmountPayStatus == "Paid") {
          let message = "You cann't remove the member "
          this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
        }else{
            let confirm = this.alertCtrl.create({
                title: 'Remove Member',
                message: 'Are you sure you want to remove the member?',
                buttons: [
                  {
                    text: 'No',
                    handler: () => {
                     
                      console.log('Disagree clicked');
                    }
                  },
                  {
                    text: 'Yes',
                    handler: () => {
          
          
                      for (let name in member) {
                        if (member[name] == undefined) {
                          this.commonService.toastMessage("Unable to remove member from the school session, Pls. contact support", 2500,ToastMessageType.Error);
                          return;
                        }
                      }
                      for (let name in this.selectedSession) {
                        if (this.selectedSession[name] == undefined) {
                          this.selectedSession("Unable to remove member from the school session, Pls. contact support", 2500);
                          return;
                        }
                      }
          
          
                      this.fb.update(member.Key, "/SchoolSession/" + this.selectedSession.ParentClubKey + "/" + this.selectedSession.$key + "/Member/", { IsActive: false });
                      //initialize all member IsActive false initially in coach folder
                      this.fb.update(member.Key, "/Coach/Type2/" + this.selectedSession.ParentClubKey + "/" + this.selectedSession.CoachKey + "/SchoolSession/" + this.selectedSession.$key + "/Member/", { IsActive: false });
                      //initialize all member IsActive false initially in member folder
                      if (!member.IsSchoolMember) {
                        this.fb.update(this.selectedSession.$key, "/Member/" + this.selectedSession.ParentClubKey + "/" + member.ClubKey + "/" + member.Key + "/SchoolSession/", { IsActive: false });
                      } else {
                        this.fb.update(this.selectedSession.$key, "SchoolMember/" + this.selectedSession.ParentClubKey + "/" + member.Key + "/SchoolSession/",{ IsActive: false });
                      }
                      let message = "selected member removed successfully.";
                      this.commonService.toastMessage(message,2500,ToastMessageType.Success,ToastPlacement.Bottom);
                      this.navCtrl.pop();
                    }
                  }
                ]
              });
              confirm.present();
        }
    
      
    }
    
    removeActionSheet(member){
        let actionSheet = this.actionSheetCtrl.create({
            //title: 'Modify your album',
            buttons: [
                {
                    text: 'Remove',
                    handler: () => {
                        this.remove(member);
                    }
                }
            ]
        });

        actionSheet.present();
    }

 
    //update the subject with empty to avoid any subacriptions gets called
    ionViewWillLeave(){
        this.commonService.updateCategory("");
    }

     
  
}

export class GetSchoolSessions {
    ParentClubKey: string
    ClubKey: string
    MemberKey: string
    AppType: number
    ActionType: number
    DeviceType: number
    parentclub_id: string
    school_id: string
    club_id: string
    coach_id: string
}