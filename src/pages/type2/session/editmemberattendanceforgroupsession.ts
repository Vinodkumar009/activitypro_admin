import { Dashboard } from '../../dashboard/dashboard';
import { FirebaseService } from '../../../services/firebase.service';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import gql from 'graphql-tag';
import { Storage } from '@ionic/storage';
import { IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import { MonthlySessionDets } from './monthlysession/model/monthly_session.model';
import { AttendedUsers, MonthlyDayAtteandance, MonthlySessionAttendanceInput } from './monthlysession/model/monthly_attendance.model';
import { GraphqlService } from '../../../services/graphql.service';
import { GroupSession } from './sessions.model';
import { TermSesAttendanceModifyDTO, TermSessionAttendees } from './model/session_attendance.model';
@IonicPage()
@Component({
    selector: 'editmemberattendanceforgroupsession-page',
    templateUrl: 'editmemberattendanceforgroupsession.html'
})

export class Type2EditMemberAttendance {
    themeType: number;
    selectedMembersForTheSession = [];
    isSelectAll = false;
    isUnselectAll = false;

    pointDetails: any;
    isCancelled:boolean = false;
    cancelReason:string = '';
    attendanceStatus = "";
    Comments:string = "";
    postgre_sessionid:string = "";
    postgres_attendance_users:Postgre_Attendees[];
    ispostgre_available:boolean = false;
    session_type:number;
    loggedin_id:string
    term_session:GroupSession;
    sessionDetails: MonthlySessionDets;
    term_attendance_users:TermSessionAttendees[] = [];
    term_attendance_input:TermSesAttendanceModifyDTO = {
        session_postgre_fields: {
            module_id:""
        },
        user_device_metadata:{ 
            UserActionType: 1 ,
            UserAppType:0,
            UserDeviceType:this.sharedservice.getPlatform() == "android" ? 1: 2,
        },
        user_postgre_metadata:{
            UserMemberId:this.sharedservice.getLoggedInId()
        },
        date: "",
        attendance_users:[],
        cancel_reason:"",
    }
    parentclub_id:string
    choosenDate: string
    statusFrom: any;
    attendancePayload:MonthlySessionAttendanceInput = {
        session_postgre_fields: {
            monthly_session_id: ""
        },
      date: "",
      user_device_metadata:{ UserActionType: 2 }, //update attendance
      attendance_users:[]
    };
    attendance_users:MonthlyDayAtteandance[]=[];
    constructor(
        private storage: Storage, 
        private commonService:CommonService,
        public fb: FirebaseService, 
        public navParams: NavParams, public navCtrl: NavController,
        private sharedservice: SharedServices,
        public popoverCtrl: PopoverController,
        private graphqlService: GraphqlService,) {
        this.themeType = sharedservice.getThemeType();
    

    }

    ionViewWillEnter(){
        this.storage.get("userObj").then((val) => {
            val = JSON.parse(val);
            if (val.$key != "") {
                this.loggedin_id = val.$key; 
                this.parentclub_id = val.UserInfo[0].ParentClubKey;
                
                this.choosenDate = this.navParams.get('selected_date');
                this.statusFrom = this.navParams.get('attendance_status');
                this.session_type = this.navParams.get('type')
                this.isCancelled = this.statusFrom.toLowerCase() == "cancel" ? true : false;
                
                this.attendancePayload.date = this.choosenDate;
                if(this.session_type === 101){
                    this.sessionDetails = this.navParams.get('session_dets');
                    this.attendancePayload.session_postgre_fields.monthly_session_id = this.sessionDetails.id;
                    this.getMonthlyAttendanceUsers();
                }else{
                    this.term_session = this.navParams.get('session_dets');
                    this.term_attendance_input.session_postgre_fields.module_id = this.term_session.id;
                    this.term_attendance_input.date = this.choosenDate;
                   this.getTermSessionAttendees()
                }

            }
        });
    }

    getTermSessionAttendees = () => {
        //this.commonService.showLoader("fetching attendees")
        const sessionQuery = gql`
        query getTermSesionAttandanceUsers($attendance_input:AttendanceSesDatesInput!) {
            getTermSesionAttandanceUsers(sessionDatesInput:$attendance_input){
                user_id
                first_name
                last_name
                dob
                session_id
                attendance_status
                session_member_id
                attendance_id
                attendance_date
                cancel_reason
                leaderboard_points
                star_of_the_week
             }
        }`;
        this.graphqlService.query(sessionQuery,
            {attendance_input:{session_id:this.term_session.id,attendance_date:this.navParams.get("selected_date")}},
            0
        )
        .subscribe(({data}) => {
            console.log('attendance data' + data["getTermSesionAttandanceUsers"]);
            this.term_attendance_users = data["getTermSesionAttandanceUsers"] as TermSessionAttendees[];
            if(this.term_attendance_users.length > 0){
                this.term_attendance_users.forEach((user) => {
                    user["isSelect"] = user.attendance_status && user.attendance_status!=0 ? true:false; // or true, depending on your requirement
                });
                if(this.statusFrom.toLowerCase() == "cancel"){
                    this.cancelReason = this.term_attendance_users[0].cancel_reason;  
                }
                this.getPointsSetup(); 
            } 
            const is_all_checked = this.term_attendance_users.every(user => user.attendance_status === 1);
            this.isSelectAll = this.isCancelled || is_all_checked ? true : false;
            //this.commonService.hideLoader();
        },(err)=>{
            //this.commonService.hideLoader();
            console.log(JSON.stringify(err));
            this.commonService.toastMessage("attendees fetch failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        });
    }

    getMonthlyAttendanceUsers(){
        const get_months_input = {
            user_device_metadata:{
                UserAppType:0,
                UserActionType: 2, // 
                UserDeviceType:this.sharedservice.getPlatform() == "android" ? 1:2
            },
            session_postgre_fields:{
                //parentclub_id:this.sharedservice.getPostgreParentClubId(),
                monthly_session_id:this.sessionDetails.id
            },
            user_postgre_metadata:{
              UserMemberId: ""
            },
            date:this.choosenDate
        }
         
          const getMonthsQuery = gql`
          query getAllMonthlySessionUsersForAttendance($getMonthsInput:MonthlyGetAttendanceDateInput!) {
            getAllMonthlySessionUsersForAttendance(attendanceInput:$getMonthsInput){
                id
                attendance_id
                session_id
                comments
                cancel_reason
                attendance_status
                attendance_status_text
                user {
                    Id
                    FirstName
                    LastName
                    DOB
                    Age
                }
                star_of_the_week
                leaderboard_points
            }
          }
        `;
          this.graphqlService.query(getMonthsQuery,{getMonthsInput:get_months_input},0)
            .subscribe(({ data }) => {
              console.log("member data" + JSON.stringify(data["getAllMonthlySessionUsersForAttendance"]));
              this.attendance_users = data["getAllMonthlySessionUsersForAttendance"] as MonthlyDayAtteandance[];
             
              if(this.attendance_users.length > 0){
                this.attendance_users.forEach((user) => {
                    user["isSelect"] = user.attendance_status === 1? true:false; // or true, depending on your requirement
                });
              }
              const is_all_checked = this.attendance_users.every(user => user.attendance_status === 1);
              this.isSelectAll = this.isCancelled || is_all_checked ? true : false;
              this.getPointsSetup();
            }, (err) => {
              this.commonService.toastMessage("attendance dates fetch failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          }); 
    }

    // getSessionAttendeesPostgre = (selected_date:any) => {
    //     this.commonService.showLoader("fetching attendees")
    //     const sessionQuery = gql`
    //     query getSesionAttandanceUsers($session_id:String!,$attendance_date:String!) {
    //         getSesionAttandanceUsers(session_id:$session_id,attendance_date:$attendance_date){
    //             attendance_id
    //             session_id
    //             user_id
    //             FirstName
    //             LastName
    //             DOB
    //             cancel_reason
    //             comments
    //             star_of_the_week
    //             attendance_status
    //             leaderboard_points
    //          }
    //     }`;
    //     this.apollo
    //     .query({
    //         query: sessionQuery,
    //         fetchPolicy: 'no-cache',
    //         variables: {
    //             session_id:this.postgre_sessionid,
    //             attendance_date:selected_date
    //         },
    //     })
    //     .subscribe(({data}) => {
    //         console.log('session data' + data["getSesionAttandanceUsers"]);
    //         this.postgres_attendance_users = data["getSesionAttandanceUsers"] as Postgre_Attendees[];
    //         if(this.postgres_attendance_users.length  > 0){
    //             this.ispostgre_available = true;
    //             this.postgres_attendance_users.map(attendee => attendee["isSelect"] = attendee.attendance_status == 1 ? true : false)
    //             if(this.postgres_attendance_users[0].attendance_status == 2){
    //                 this.isCancelled = true;
    //                 this.cancelledObj.comments = this.postgres_attendance_users[0].comments;
    //                 this.cancelledObj.cancelReason= this.postgres_attendance_users[0].cancel_reason;
    //                 this.isSelectAll = true;
    //                 this.selectAllToggole();
    //             }
    //         }
            
    //         this.commonService.hideLoader();
    //     },(err)=>{
    //         this.commonService.hideLoader();
    //         console.log(JSON.stringify(err));
    //         this.commonService.toastMessage("attendees fetch failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
    //     });
    // }

    getPointsSetup() {
        const club_firebase_id = this.session_type == 100 ? this.term_session.ClubDetails.FirebaseId:this.sessionDetails.ClubDetails.FirebaseId;
        const club_activity_id = this.session_type == 100 ? this.term_session.ActivityDetails.FirebaseActivityKey:this.sessionDetails.ActivityDetails.FirebaseActivityKey;
        let atten_points$Obs = this.fb.getAllWithQuery(`StandardCode/Wallet/LoyaltyVirtual/${this.parentclub_id}/${club_firebase_id}/Reward/${club_activity_id}`, { orderByKey: true, equalTo: "TermGroupSession" }).subscribe((data) => {
            this.pointDetails = data[0];
            atten_points$Obs.unsubscribe();
        })
        //pointDetails["TermGroupSession"]["StandardPoint"]
    }

    findOutStarIfSession(index: number) {
        if(!this.isCancelled){
            if(this.session_type === 101){
                if (this.attendance_users[index].star_of_the_week) {
                    let points = (this.attendance_users[index].leaderboard_points) / (2);
                    this.attendance_users[index].leaderboard_points = points < 10 ? this.pointDetails ? this.pointDetails["StandardPoint"] : 10 : points;
                    this.attendance_users[index].star_of_the_week = false;
                } else {
                    this.attendance_users[index].star_of_the_week = true;
                    this.attendance_users[index].leaderboard_points = this.attendance_users[index].leaderboard_points * 2;
                } 
            }else{
                if(this.term_attendance_users.length > 0){
                    if (this.term_attendance_users[index].star_of_the_week) {
                        let points = (this.term_attendance_users[index].leaderboard_points) / (2);
                        this.term_attendance_users[index].leaderboard_points = points < 10 ? this.pointDetails ? this.pointDetails["StandardPoint"] : 10 : points;
                        this.term_attendance_users[index].star_of_the_week = false;
                    } else {
                        this.term_attendance_users[index].star_of_the_week = true;
                        this.term_attendance_users[index].leaderboard_points = this.term_attendance_users[index].leaderboard_points * 2;
                    }
                }
            }
             
        }
               
    }

    presentPopover(myEvent) {
        let popover = this.popoverCtrl.create("PopoverPage");
        popover.present({
            ev: myEvent
        });
    }

    goToDashboardMenuPage() {
        this.navCtrl.setRoot(Dashboard);
    }


    saveAttendanceDetails() {
        if(this.session_type === 101){ //monthly attendance
            this.attendancePayload.user_device_metadata.UserActionType = this.statusFrom.toLowerCase() == 'cancel' ? 3 : 1;
            for(let userInd=0; userInd < this.attendance_users.length;userInd++){
                this.attendancePayload.attendance_users.push({
                    attendance_id: "",
                    session_id:this.sessionDetails.id,
                    member_id:this.attendance_users[userInd].user.Id,
                    comments:"",
                    cancel_reason:"",
                    star_of_the_week:this.attendance_users[userInd].star_of_the_week,
                    leaderboard_points:Number(this.attendance_users[userInd].leaderboard_points),
                    attendance_status:this.attendance_users[userInd].isSelect ? 1:0,
                })
            }
            const attendance_mutation = gql`
            mutation modifyMonthlySessionAttendance($attendanceInput: MonthlyUpdateAttendanceInput!) {
                modifyMonthlySessionAttendance(attendanceInput: $attendanceInput){
                    session_id
                    attendance_status
                    user_id
                    FirstName
                }
            }` 
            
            const attendance_mutation_variable = { attendanceInput: this.attendancePayload };
              this.graphqlService.mutate(
                attendance_mutation, 
                attendance_mutation_variable,
                0
              ).subscribe((response)=>{
                const message = "Attendance updated successfully";
                this.commonService.toastMessage(message, 2500, ToastMessageType.Success,ToastPlacement.Bottom);
                this.navCtrl.pop();
                //this.navCtrl.pop();
                //this.commonService.updateCategory("sessions");
                //this.reinitializeSession();
              },(err)=>{
                this.commonService.toastMessage("Attendance updation failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
              }); 
        }else{
            this.term_attendance_input.user_device_metadata.UserActionType = this.statusFrom.toLowerCase() == 'cancel' ? 3 : 1;
            for(let userInd=0; userInd < this.term_attendance_users.length;userInd++){
                this.term_attendance_input.attendance_users.push({
                    attendance_id:this.term_attendance_users[userInd].attendance_id ? this.term_attendance_users[userInd].attendance_id : "",
                    session_id:this.term_session.id,
                    member_id:this.term_attendance_users[userInd].user_id,
                    comments:"",
                    cancel_reason:this.statusFrom.toLowerCase() == 'cancel' ? this.cancelReason : "",
                    star_of_the_week:this.term_attendance_users[userInd].star_of_the_week,
                    leaderboard_points:Number(this.term_attendance_users[userInd].leaderboard_points),
                    attendance_status:this.statusFrom.toLowerCase() == 'cancel' ? 2 : (this.term_attendance_users[userInd].isSelect ? 1:0),
                })
            }
            const attendance_mutation = gql`
            mutation modifyTermSessionAttendance($attendanceInput: TermUpdateAttendanceInput!) {
                modifyTermSessionAttendance(attendanceInput: $attendanceInput)
            }` 
            
            const attendance_mutation_variable = { attendanceInput: this.term_attendance_input };
              this.graphqlService.mutate(
                attendance_mutation, 
                attendance_mutation_variable,
                0
              ).subscribe((response)=>{
                const message = "Attendance updated successfully";
                this.commonService.toastMessage(message, 2500, ToastMessageType.Success,ToastPlacement.Bottom);
                this.navCtrl.pop();
                //this.navCtrl.pop();
                //this.reinitializeSession();
              },(err)=>{
                this.commonService.toastMessage("Attendance updation failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
              });
        }
        
    }


    

    
    

    selectAllToggole() {
        if (this.isSelectAll) {
            //this.isUnselectAll = false;
            if(this.session_type === 101){
                for (let loop = 0; loop < this.attendance_users.length; loop++) {
                    this.attendance_users[loop].isSelect = true;
                }
            }else{
                for (let loop = 0; loop < this.term_attendance_users.length; loop++) {
                    this.term_attendance_users[loop].isSelect = true;
                }
            }
        }
        else if (!this.isSelectAll) {
            if(this.session_type === 101){
                for (let loop = 0; loop < this.attendance_users.length; loop++) {
                    this.attendance_users[loop].isSelect = false;
                }
            }else{
                for (let loop = 0; loop < this.term_attendance_users.length; loop++) {
                    this.term_attendance_users[loop].isSelect = false;
                }
            }
            
            // if(this.ispostgre_available){
            //     for (let loop = 0; loop < this.postgres_attendance_users.length; loop++) {
            //         this.postgres_attendance_users[loop].isSelect = false;
            //     }
            // }
        }
    }

    selectNoneToggole() {

        if (this.isUnselectAll) {
            this.isSelectAll = false;
            for (let loop = 0; loop < this.attendance_users.length; loop++) {
                this.attendance_users[loop].isSelect = false;
            }
        }
    }
    changeMembers() {
        this.isSelectAll = false;
        this.isUnselectAll = false;
    }
    
    getAge(info){
        if(info!=''){
            let year = info.split("-")[0];
            let currentYear = new Date().getFullYear();
            return Number(currentYear) - Number(year); 
        }
        return "N/A";
      }

}


class Postgre_Attendees{
    attendance_id: string;
    session_id: string;
    user_id: string;
    FirstName: string;
    LastName: string;
    DOB: string;
    cancel_reason: string;
    comments:string;
    isSelect:boolean;
    star_of_the_week: boolean;
    attendance_status: number;
    leaderboard_points:number;
}
class Attendance_Update{
    session_id: string;
    attendance_date:string;
    users:UpdateUsers[]
}

class UpdateUsers{
    attendance_id:string
    member_id: string;
    comments:"";
    star_of_the_week: boolean;
    leaderboard_points: number;
    attendance_status: number; // cancelled or attended
}

