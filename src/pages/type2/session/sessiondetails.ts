
import { Component } from '@angular/core';
import { NavController, ActionSheetController } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
//import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../services/firebase.service';
import { Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { NavParams } from 'ionic-angular';
import * as moment from 'moment';
import gql from 'graphql-tag';
// import { Type2AddMembershipSession } from './addmembershipsession';
// import { Type2EditMemberAttendance } from './editmemberattendanceforgroupsession';
import { IonicPage } from 'ionic-angular';
import { MonthlySessionDets } from './monthlysession/model/monthly_session.model';
import { GraphqlService } from '../../../services/graphql.service';
import { MonthlyAtteandanceDates } from './monthlysession/model/monthly_attendance.model';
import { GroupSession } from './sessions.model';
import { AttendanceDatesInfo, SessionAttendanceDates } from '../../../shared/model/attendance.model';

@IonicPage()
@Component({
    selector: 'sessiondetails-page',
    templateUrl: 'sessiondetails.html'
})

export class Type2SessionDetails {
    action_type:number = 1;
    monthly_ses_dets:MonthlySessionDets;
    term_session:GroupSession;
    attendance_info:SessionAttendanceDates = {
        active_member_count: 0,
        attendance_dates: []
    };
    session_type:number;
    attendance_dates:MonthlyAtteandanceDates[] = [];
    // 
    LangObj: any = {};//by vinod
    themeType: number;
    
    parentClubKey: any;
    clubName: any;
    postgre_sessionid:string = "";
    sessionActivityCategoryName1: any;
    SessionActivitySubcategoryName1: any;
    TotMembers: number = 0;
    canshowDates:boolean = false;
    startDate:any;
    maxDate:any
    minDate:any;
    selectedMonth:any; //for monthly session
    constructor(public events: Events, public commonService: CommonService,
         public storage: Storage, public actionSheetCtrl: ActionSheetController, 
         public navParams: NavParams, 
         public fb: FirebaseService, public navCtrl: NavController, 
         public sharedservice: SharedServices, 
         public popoverCtrl: PopoverController,
         private graphqlService: GraphqlService,) {
        this.themeType = sharedservice.getThemeType();
        
       
        
    }

    ionViewWillEnter(){
        this.session_type = this.navParams.get('type');
        if(this.session_type === 101){
            this.monthly_ses_dets = this.navParams.get('session');
            //this.getMonthsAndDates();
            this.startDate = moment(new Date()).format("YYYY-MM-DD");
            this.minDate = moment(new Date(this.monthly_ses_dets.start_date),"DD-MMM-YYYY").format("YYYY-MM-DD");
            this.maxDate = moment(new Date(this.monthly_ses_dets.end_date),"DD-MMM-YYYY").format("YYYY-MM-DD");  
            this.getMonthlySessionDates();
        }else{
            this.term_session =  this.navParams.get('session');
            this.getAttendanceDates();
        }
    }

    getAttendanceDates() {
        this.commonService.showLoader("Please wait");
        const attendance_dates_query = gql`
        query getTermSessionAttendanceDates($attendance_input: AttendanceSesDatesInput!){
            getTermSessionAttendanceDates(sessionDatesInput:$attendance_input){
            active_member_count
            attendance_dates{
              attendance_date
              pending_count
              present_count
              cancelled_count
              is_future_day
            }
          }
        }
        `;
    
          const input_variable = {
            session_id: this.term_session.id,
          }
          this.graphqlService.query(attendance_dates_query,{attendance_input: input_variable},0)
            .subscribe((res: any) => {
                this.commonService.hideLoader();
                this.attendance_info = res.data.getTermSessionAttendanceDates as SessionAttendanceDates;
                //this.selectedSchool = this.school_session.ParentClubSchool.school.id;
            },
           (error) => {
                this.commonService.hideLoader();
                console.error("Error in fetching:", error);
               // Handle the error here, you can display an error message or take appropriate action.
           })
      }
    
    //showing attendance dates according to the selected dates
    


    getMonthlySessionDates(){
        this.attendance_dates = [];
        const get_months_input = {
            user_device_metadata:{
                UserAppType:0,
                UserActionType: 2, // 
                UserDeviceType:this.sharedservice.getPlatform() == "android" ? 1:2
            },
            session_postgre_fields:{
                //parentclub_id:this.sharedservice.getPostgreParentClubId(),
                monthly_session_id:this.monthly_ses_dets.id
            },
            user_postgre_metadata:{
              UserMemberId:this.sharedservice.getPostgreParentClubId()
            },
            date:moment(this.startDate).format("DD-MMM-YYYY") 
        }
         
          const getMonthsQuery = gql`
          query getAllMonthlySessionDates($getMonthsInput:MonthlyGetAttendanceDateInput!) {
            getAllMonthlySessionDates(attendanceInput:$getMonthsInput){
                days {
                    day{
                      day
                      status
                    }
                    pending_count
                    total_count
                    attendance_status
                    attendance_status_text
                    is_future_day
                    present_count
                    cancelled_count
                }
            }
          }
        `;
          this.graphqlService.query(getMonthsQuery,{getMonthsInput:get_months_input},0)
            .subscribe(({ data }) => {
              console.log("member data" + JSON.stringify(data["getAllMonthlySessionDates"]));
              this.attendance_dates = data["getAllMonthlySessionDates"]["days"];
            }, (err) => {
              this.commonService.toastMessage("attendance dates fetch failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          });  
    }

    getFormattedDate(session_date){
        return moment(new Date(session_date),"DD-MMM-YYY").format('DD-MMM');
    }
    
   
    //term session
    // getSessionAttendanceFromPostgre = (session_id:string) => {
    //     this.commonService.showLoader("fetching attendances...")
    //     const attendanceQuery = gql`
    //     query getSessionAttendanceCountByDate($sessionId:String!) {
    //         getSessionAttendanceCountByDate(session_id:$sessionId){
    //             session_id
    //             firebasekey
    //             attendance_date
    //             total_count
    //             present_count
    //             abscent_count
    //             cancelled_count
    //             cancel_reason
    //          }
    //     }`;
    //     this.apollo
    //     .query({
    //         query: attendanceQuery,
    //         fetchPolicy: 'no-cache', //network-only
    //         variables: {
    //             sessionId:session_id,
    //         },
    //     })
    //     .subscribe(({data}) => {
    //         console.log('attendance data' + data["getSessionAttendanceCountByDate"]);
    //         this.commonService.hideLoader();
    //         // this.isNoCatgs = data["getAgeCategories"].length > 0 ? false : true;
    //         this.attendance_postgre = data["getSessionAttendanceCountByDate"] as PostgreAttendance[];
    //         if(this.attendance_postgre.length > 0){
    //             for (let i = 0; i < this.attendance_postgre.length; i++) {
    //                 let year = new Date(+this.attendance_postgre[i].attendance_date).getFullYear();
    //                 let month = new Date(+this.attendance_postgre[i].attendance_date).getMonth() + 1;
    //                 let date = new Date(+this.attendance_postgre[i].attendance_date).getDate();
    //                 let today = moment(new Date()).format("YYYY-MM-DD");
    //                 let sessiondate = moment(year + "-" + month + "-" + date, "YYYY-MM-DD");
    //                 this.attendance_postgre[i].attendance_date = moment(new Date(+this.attendance_postgre[i].attendance_date)).format("YYYY-MM-DD");
    //                 let date_index = this.sessionOnDates.findIndex(attendance => moment(this.attendance_postgre[i].attendance_date).isSame(moment(new Date(attendance.SessionOn)).format("YYYY-MM-DD"),"day"));
    //                 if (date_index!= -1) {
                       
    //                     this.sessionOnDates[date_index].Status = Number(this.attendance_postgre[i].present_count) > 0 || Number(this.attendance_postgre[i].abscent_count) > 0 ? "Done" : "Canceled";
    //                     this.sessionOnDates[date_index].Count = this.attendance_postgre[i].present_count;
    //                     if (moment(this.attendance_postgre[i].attendance_date).isSameOrBefore(today, 'day')) {
    //                         if (this.sessionOnDates[date_index].Status == "Done") {
    //                             console.log(`${this.attendance_postgre[i].attendance_date}:${this.attendance_postgre[i].present_count}`);
    //                             //this.sessionOnDates[date_index].Count = this.attendance_postgre[i].present_count;
    //                             console.log(this.sessionOnDates[date_index]);
    //                         }
    //                     }
        
    //                     if (this.sessionOnDates[date_index].Status == "Canceled") {
    //                         this.sessionOnDates[date_index].Count = this.attendance_postgre[i].abscent_count;
    //                         this.sessionOnDates[date_index]["CanceledReason"] = this.attendance_postgre[i].cancel_reason;
    //                     }
        
    //                 } else {
    //                     if (sessiondate.isSameOrBefore(today, 'day')) {
    //                         if (this.sessionOnDates[date_index].Status != "Canceled") {
    //                             this.sessionOnDates[date_index].Status = "Pending";
    //                         }
    //                     }
    //                 }
    //             }
    //             this.sortSessionDates();
    //         }else{
    //             this.canshowDates = true;
    //         }
            
    //     },(err)=>{
    //         console.log(JSON.stringify(err));
    //         this.commonService.hideLoader();
    //         this.commonService.toastMessage("attendance fetch failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
    //     });
    // }

    

    goToDashboardMenuPage() {
        this.navCtrl.setRoot("Dashboard");
    }

    presentPopover(myEvent) {
        let popover = this.popoverCtrl.create("PopoverPage");
        popover.present({
            ev: myEvent
        });
    }
    

    

    //added by vinod
    ionViewDidLoad() {
        this.getLanguage();
        this.events.subscribe('language', (res) => {
            this.getLanguage();
        });
    }
    getLanguage() {
        this.storage.get("language").then((res) => {
            console.log(res["data"]);
            this.LangObj = res.data;
        })
    }

    //added by vinod ends here

    StatusFrom = "";
    showActionSheet(date) {
        if(this.canDoMonthlyAttendance(date.day.day)){
            if (date.attendance_status === 1 || date.attendance_status === 2){
                this.navCtrl.push("Type2EditMemberAttendance", { selected_date: date.day.day, session_dets: this.monthly_ses_dets, attendance_status: this.StatusFrom,type:101});
            }else{
                let actionSheet: any;
                actionSheet = this.actionSheetCtrl.create({
                    title: `Modify session attendance for ${this.getFormattedDate(date.day.day)}`,
                    buttons: [
                        {
                            text: 'Mark Attendance',
                            icon:"ios-checkmark-circle-outline",
                            handler: () => {
                                this.StatusFrom = "attendance";
                                this.goToAttendance(date.day.day);
                            }
                        },
                        {
                            text: 'Cancel Session',
                            icon:"ios-close-circle-outline",
                            handler: () => {
                                this.StatusFrom = "cancel";
                                this.goToAttendance(date.day.day);
                            }
                        },  
                        // {
                        //     text: 'Close',
                        //     role: 'cancel',
                        //     handler: () => {
        
                        //     }
                        // }
                    ]
                });
                actionSheet.present();
            }
        }else{
            this.commonService.toastMessage("Attendance can be done on the same date", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        }
    }


    //term session action sheet
    showTermActionSheet(attendance_day:AttendanceDatesInfo) {
        //if(this.canDoAttendance(attendance_day.attendance_date)){
            // Example usage
            let alert_options:{title:string,message:string,buttons:any[]} = {
                title: '',
                message:'',
                buttons: []
            };
            alert_options.title = `Modify Check-In for ${attendance_day.attendance_date}`
            if(moment(attendance_day.attendance_date,"YYYY-MM-DD").isSameOrBefore(moment())){
                if (attendance_day.pending_count > 0 || attendance_day.present_count > 0 || attendance_day.cancelled_count > 0){ //already attended
                    this.StatusFrom = attendance_day.cancelled_count > 0 ? "cancel": "attendance";
                    this.navCtrl.push("Type2EditMemberAttendance", { selected_date: attendance_day.attendance_date, session_dets:this.term_session, attendance_status: this.StatusFrom,type:100 });
                }else{                    
                    alert_options.buttons.push(
                        {
                            text: "Mark Attendance",
                            icon:"ios-checkmark-circle-outline",
                            handler: () => {
                                this.StatusFrom = "attendance";
                                this.goToAttendance(attendance_day.attendance_date)
                            }
                        },
                        {
                            text: "Cancel Session",
                            icon:"ios-close-circle-outline",
                            handler: () => {
                                this.StatusFrom = "cancel";
                                this.action_type = 2;//trying to cancel the session
                                this.goToAttendance(attendance_day.attendance_date)
                            }
                        },
                        // {
                        //     text: "Close",
                        //     role: 'cancel',
                        //     handler: () => {}
                        // }
                    );   
                    const actionSheet = this.actionSheetCtrl.create(alert_options);
                    actionSheet.present();   
                }
            }else if(attendance_day.cancelled_count == 0){
                alert_options.buttons.push(
                {
                    text: "Cancel Session",
                    icon:"ios-close-circle-outline",
                    handler: () => {
                        this.StatusFrom = "cancel";
                        this.action_type = 2;//trying to cancel the session
                        this.goToAttendance(attendance_day.attendance_date)
                    }
                },
                // {
                //     text: "Close",
                //     role: 'cancel',
                //     handler: () => {}
                // }
                ) 
                const actionSheet = this.actionSheetCtrl.create(alert_options);
                actionSheet.present();  
            }

        // }else{
        //     this.commonService.toastMessage("Attendance can be done on the same date", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        // }        
      }
      
     

    //attendance can be done on the same date
    canDoAttendance(attendance_date:string):boolean{
        if(moment(attendance_date,"YYYY-MM-DD").isSameOrBefore(moment())){
            return true;
        }else{
            return false;
        } 
    }

    //attendance can be done on the same date
    canDoMonthlyAttendance(attendance_date:string):boolean{
        if(moment(attendance_date,"DD-MMM-YYYY").isSameOrBefore(moment())){
            return true;
        }else{
            return false;
        } 
    }

    goToAttendance(date) {   
        if(this.session_type === 101){ //monthly session attendance otherwise term session
            this.navCtrl.push("Type2MemberAttendance", { 
            selected_date: date, 
            type:101,
            session_dets: this.monthly_ses_dets, 
            attendance_status: this.StatusFrom,
           });
        }else{
            this.navCtrl.push("Type2MemberAttendance", { 
                selected_date: date, 
                type:100,
                session_dets: this.term_session, 
                attendance_status: this.StatusFrom,
            });            
        }      
    }

}

