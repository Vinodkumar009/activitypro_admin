// import { Dashboard } from '../../dashboard/dashboard';
import { FirebaseService } from '../../../services/firebase.service';
import { Component, } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import { AlertController } from 'ionic-angular';
import { IonicPage } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import gql from 'graphql-tag';
import { GraphqlService } from '../../../services/graphql.service';
import { AttendedUsers, MonthlyDayAtteandance, MonthlySessionAttendanceInput } from './monthlysession/model/monthly_attendance.model';
import { MonthlySessionDets } from './monthlysession/model/monthly_session.model';
import { GroupSession } from './sessions.model';
import { TermSesAttendanceModifyDTO, TermSessionAttendees } from './model/session_attendance.model';

@IonicPage()
@Component({
    selector: 'memberattendanceforgroupsession-page',
    templateUrl: 'memberattendanceforgroupsession.html'
})

export class Type2MemberAttendance {
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
    themeType: number;
    choosenDate: any;
    statusFrom: any;
    selectedMembersForTheSession = [];
    attendance_users:MonthlyDayAtteandance[]=[];
    term_session:GroupSession;
    isSelectAll = false;
    isUnselectAll = false;
    //returnKey: any;
    sessionDetails: MonthlySessionDets;
    parentclub_id:string
    comments:string = "";
    
    attendancePayload:MonthlySessionAttendanceInput = {
        session_postgre_fields: {
            monthly_session_id: ""
        },
      date: "",
      user_device_metadata:{ UserActionType: 1 },
      attendance_users:[]
    };

    pointDetails: any;
    loggedin_id:string
    isDisabled = false;
    cancelReason = '';
    postgre_sessionid:string;
    session_type:number;
    constructor(public commonService: CommonService,
        public alertCtrl: AlertController,
        private storage: Storage, 
        public fb: FirebaseService, public navParams: NavParams, 
        public navCtrl: NavController, public sharedservice: SharedServices, 
        public popoverCtrl: PopoverController,
        private graphqlService: GraphqlService,) {
        this.themeType = sharedservice.getThemeType();
        
        
       
        // this.attendancePayload.session_id = this.sessionDetails.$key;
        // this.attendancePayload.parentclub_id = this.sessionDetails.ParentClubKey;
        // this.attendancePayload.club_id = this.sessionDetails.ClubKey;
        // this.attendancePayload.coach_id = this.sessionDetails.CoachKey;
        // this.attendancePayload.session_type = Number(this.sessionDetails.PaymentOption);
        
        
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
                if(this.session_type == 100){
                    this.term_session =  this.navParams.get('session_dets');
                    this.term_attendance_input.session_postgre_fields.module_id = this.term_session.id;
                    this.term_attendance_input.date = this.choosenDate;
                    this.isSelectAll = this.statusFrom == 'cancel' ? true:false;
                    this.getSessionAttendeesPostgre();
                }else{
                    this.sessionDetails = this.navParams.get('session_dets');
                    this.attendancePayload.session_postgre_fields.monthly_session_id = this.sessionDetails.id;
                    this.attendancePayload.date = this.choosenDate;
                    this.isSelectAll = this.statusFrom == 'cancel' ? true:false;
                    this.getMonthlyAttendanceUsers();
                }
                
                
            }
        });
    }

    getSessionAttendeesPostgre = () => {
        //this.commonService.showLoader("fetching attendees")
        const sessionQuery = gql`
        query getTermSesionAttandanceUsers($attendance_input:AttendanceSesDatesInput!) {
            getTermSesionAttandanceUsers(sessionDatesInput:$attendance_input){
                user_id
                first_name
                last_name
                dob
                session_id
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
            //console.log('attendance data' + data["getSchoolSesionAttandanceUsers"]);
            this.term_attendance_users = data["getTermSesionAttandanceUsers"] as TermSessionAttendees[];
            if(this.term_attendance_users.length > 0){
                this.term_attendance_users.forEach((user) => {
                    user["isSelect"] = false; // or true, depending on your requirement
                });
                this.getPointsSetup();
            } 
            //this.commonService.hideLoader();
        },(err)=>{
            //this.commonService.hideLoader();
            console.log(JSON.stringify(err));
            this.commonService.toastMessage("attendees fetch failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        });
    }

    //get monthly_session attendance users
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
                    user["isSelect"] = false; // or true, depending on your requirement
                });
              }
              this.getPointsSetup();
            }, (err) => {
              this.commonService.toastMessage("attendance dates fetch failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          }); 
    }

    getPointsSetup() {
        const club_firebase_id = this.session_type == 100 ? this.term_session.ClubDetails.FirebaseId:this.sessionDetails.ClubDetails.FirebaseId;
        const club_activity_id = this.session_type == 100 ? this.term_session.ActivityDetails.FirebaseActivityKey:this.sessionDetails.ActivityDetails.FirebaseActivityKey;
        let atten_points$Obs = this.fb.getAllWithQuery(`StandardCode/Wallet/LoyaltyVirtual/${this.parentclub_id}/${club_firebase_id}/Reward/${club_activity_id}`, { orderByKey: true, equalTo: "TermGroupSession" }).subscribe((data) => {
            this.pointDetails = data[0];
            atten_points$Obs.unsubscribe();
            if(this.session_type === 101){
                for (let loop = 0; loop < this.attendance_users.length; loop++) {
                    this.attendance_users[loop].isSelect = this.statusFrom == 'cancel' ? true : false;
                    this.attendance_users[loop].star_of_the_week = false;
                    this.attendance_users[loop].leaderboard_points = this.pointDetails ? this.pointDetails["StandardPoint"] : 10;
                }
            }else{
                for (let loop = 0; loop < this.term_attendance_users.length; loop++) {
                    this.term_attendance_users[loop].isSelect = this.statusFrom == 'cancel' ? true : false;
                    this.term_attendance_users[loop].star_of_the_week = false;
                    this.term_attendance_users[loop].leaderboard_points = this.pointDetails ? this.pointDetails["StandardPoint"] : 10;
                }
            } 
        })
        //pointDetails["TermGroupSession"]["StandardPoint"]
    }

    //star of the session for term
    findOutStarIfSessionForTerm(index: number) {
        if(this.term_attendance_users[index].isSelect){
            if(this.statusFrom!="cancel"){
                let tapcount = 0;
                if (this.term_attendance_users[index].star_of_the_week) {
                    let points = (this.term_attendance_users[index].leaderboard_points) / (2);
                    this.term_attendance_users[index].leaderboard_points = points < 10 ? this.pointDetails ? this.pointDetails["StandardPoint"] : 10 : points;
                    this.term_attendance_users[index].star_of_the_week = false;
                } else {
                    this.term_attendance_users[index].star_of_the_week = true;
                    this.term_attendance_users[index].leaderboard_points = this.term_attendance_users[index].leaderboard_points * 2;
                }
            }
        }else{
            this.commonService.toastMessage("Please mark the attendance to make star of the session",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }
        
    }

    //star of the session for monthly
    findOutStarIfSession(index: number) {
        if(this.attendance_users[index].isSelect){
            if(this.statusFrom!="cancel"){
                let tapcount = 0;
                if (this.attendance_users[index].star_of_the_week) {
                    let points = (this.attendance_users[index].leaderboard_points) / (2);
                    this.attendance_users[index].leaderboard_points = points < 10 ? this.pointDetails ? this.pointDetails["StandardPoint"] : 10 : points;
                    this.attendance_users[index].star_of_the_week = false;
                } else {
                    this.attendance_users[index].star_of_the_week = true;
                    this.attendance_users[index].leaderboard_points = this.attendance_users[index].leaderboard_points * 2;
                }
            }
        }else{
            this.commonService.toastMessage("Please mark the attendance to make star of the session",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }
    }

    convertDateForIos(date) {
        var arr = date.split(/[- :]/);
        date = new Date(parseInt(arr[0]), parseInt(arr[1]) - 1, parseInt(arr[2]), parseInt(arr[3]), parseInt(arr[4]), parseInt(arr[5]));
        return date;
    }

    CancelSession() {
        if (this.cancelReason!= "") {
            let prompt = this.alertCtrl.create({
                title: 'Cancel Session',
                message: "Are you sure you want to cancel the session?",
                buttons: [
                    {
                        text: 'No',
                        handler: data => {
                            this.cancelReason = "";
                        }
                    },
                    {
                        text: 'Yes:Cancel',
                        handler: data => {
                            if(this.session_type === 101){
                                this.updateAttendanceForMonthly();
                            }else{
                                this.updateAttendanceForTerm();
                            } 
                        }
                    }
                ]
            });
            prompt.present();
        } else {
            let message = "Please select the reason for cancellation";
            this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
            return;
        }
    }



    cancelSession() {
    }

    //session cancellation email confirmation
    EmailCancelConfirmation() {
        let prompt = this.alertCtrl.create({
            title: 'Cancellation Email',
            message: "Do you want to send the cancellation email to the members?",

            buttons: [
                {
                    text: 'No',
                    role: 'cancel',
                    handler: data => {
                        //this.commonService.updateCategory("sessions");
                        //this.navCtrl.pop();
                        this.navCtrl.pop();
                        this.navCtrl.pop();
                    }
                },
                {
                    text: 'Yes:Email',
                    handler: data => {
                        this.sendEmailsAfterCancellation();
                    }
                }
            ]
        });
        prompt.present();
    }

    //sending a mail
    sendEmailsAfterCancellation() {
        // this.memberList = [];
        // this.memberList.push(item);
        this.sessionDetails["CancelledSession"] = `${new Date(this.choosenDate.SessionOn).getDate()}-${this.choosenDate.SessionMonth}`;
        //this.sessionDetails["CancelComment"] = this.attendanceObj.Comments;
        this.navCtrl.push("MailToMemberByAdminPage", { MemberList: this.selectedMembersForTheSession, SessionDetails: this.sessionDetails, NavigateFrom: "Attendance" });
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

    saveAttendanceConfirmation() {
        let prompt = this.alertCtrl.create({
            title: 'Confirm Attendance',
            message: "Are you sure you want to save the attendance?",
            buttons: [
                {
                    text: 'No',
                    role:"cancel",
                    handler: data => {

                    }
                },
                {
                    text: 'Yes',
                    handler: data => {
                        if(this.session_type == 101){
                            this.updateAttendanceForMonthly();
                        }else{
                            this.updateAttendanceForTerm();   
                        }
                    }
                }
            ]
        });
        prompt.present();
    }

    updateAttendanceForMonthly() {
        this.attendancePayload.user_device_metadata.UserActionType = this.statusFrom.toLowerCase() == 'cancel' ? 3 : 1;
        for(let userInd=0; userInd < this.attendance_users.length;userInd++){
            this.attendancePayload.attendance_users.push({
                attendance_id: "",
                session_id:this.sessionDetails.id,
                member_id:this.attendance_users[userInd].user.Id,
                comments:this.comments,
                cancel_reason:this.statusFrom.toLowerCase() == 'cancel' ? this.cancelReason : "",
                star_of_the_week:this.attendance_users[userInd].star_of_the_week,
                leaderboard_points:this.attendance_users[userInd].leaderboard_points,
                attendance_status:this.statusFrom.toLowerCase() == 'cancel' ? 2 : (this.attendance_users[userInd].isSelect ? 1:0),
            })
        }
        const attendance_mutation = gql`
        mutation modifyMonthlySessionAttendance($attendanceInput: MonthlyUpdateAttendanceInput!) {
            modifyMonthlySessionAttendance(attendanceInput: $attendanceInput){
                session_id
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
            //this.reinitializeSession();
          },(err)=>{
            this.commonService.toastMessage("Attendance updation failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
          });              
    
    }

    checkCancelValidation(){
        if(this.statusFrom.toLowerCase() == 'cancel' && this.cancelReason!= ""){
            
        }
    }

    updateAttendanceForTerm() {
        this.term_attendance_input.cancel_reason = this.cancelReason;
        if(this.statusFrom.toLowerCase() == 'cancel' && this.term_attendance_input.cancel_reason == ""){
            this.commonService.toastMessage("Please select the reason for cancellation", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
            return false;
        }
        
        this.term_attendance_input.user_device_metadata.UserActionType = this.statusFrom.toLowerCase() == 'cancel' ? 3 : 1;
        for(let userInd=0; userInd < this.term_attendance_users.length;userInd++){
            this.term_attendance_input.attendance_users.push({
                attendance_id: "",
                session_id:this.term_session.id,
                member_id:this.term_attendance_users[userInd].user_id,
                comments:this.comments,
                cancel_reason:this.statusFrom.toLowerCase() == 'cancel' ? this.cancelReason : "",
                star_of_the_week:this.term_attendance_users[userInd].star_of_the_week,
                leaderboard_points:this.term_attendance_users[userInd].leaderboard_points,
                attendance_status:this.statusFrom.toLowerCase() == 'cancel' ? 2 : (this.term_attendance_users[userInd].isSelect ? 1:0),
            })
        }
        const attendance_mutation = gql`
        mutation saveTermSessionAttendance($attendanceInput: TermUpdateAttendanceInput!) {
            saveTermSessionAttendance(attendanceInput: $attendanceInput)
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

    
    selectAllToggole() {
        if (this.isSelectAll) {
            if(this.session_type == 101){
                this.isUnselectAll = false;
                for (let loop = 0; loop < this.attendance_users.length; loop++) {
                    this.attendance_users[loop].isSelect = true;
                }
            }else{
                this.isUnselectAll = false;
                for (let loop = 0; loop < this.term_attendance_users.length; loop++) {
                    this.term_attendance_users[loop].isSelect = true;
                }
            }
        }
        else if (!this.isSelectAll) {
            if(this.session_type == 101){
                for (let loop = 0; loop < this.attendance_users.length; loop++) {
                    this.attendance_users[loop].isSelect = false;
                }
            }else{
                for (let loop = 0; loop < this.term_attendance_users.length; loop++) {
                    this.term_attendance_users[loop].isSelect = false;
                }
            }
        }
    }
    selectNoneToggole() {
        this.isSelectAll = false;
        if (this.isUnselectAll) {
            if(this.session_type === 101){
                for (let loop = 0; loop < this.attendance_users.length; loop++) {
                    this.attendance_users[loop].isSelect = false;
                }
            }else{
                for (let loop = 0; loop < this.term_attendance_users.length; loop++) {
                    this.term_attendance_users[loop].isSelect = false;
                }
            } 
        }
    }

    changeMembers() {
        this.isSelectAll = false;
        this.isUnselectAll = false;
    }


    getAge(info) {
        let year = info.split("-")[0];
        let currentYear = new Date().getFullYear();
        return Number(currentYear) - Number(year);
    }

}



  


  
 