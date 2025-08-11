import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, PopoverController } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { FirebaseService } from '../../../../services/firebase.service';
import { AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { GraphqlService } from '../../../../services/graphql.service';
import { SharedServices } from '../../../services/sharedservice';
import gql from 'graphql-tag';
import { SchoolDetails } from '../schoolsession.model';
import { AttendanceUpdate, SchoolSessionAttendees, SchoolUpdateAttendanceInput } from '../dto/school_ses_attendance.dto';
import * as moment from 'moment';

/**
 * Generated class for the SchoolattendencePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-schoolattendence',
  templateUrl: 'schoolattendence.html',
  providers:[GraphqlService]
})
export class SchoolattendencePage {
  dateInfo:any = {};
  sessionInfo:SchoolDetails;
  themeType: number;
    sessionDetails: any;
    choosenDate: any;
    selectedMembersForTheSession = [];
    isSelectAll = false;
    isUnselectAll = false;
    cancelledObj = {
        comments:"",
        cancelReason:""
    }

    attendanceInput:AttendanceUpdate = {
        session_id:"",
        check_in_details:"",
        attedance_date:"",
        attendees:[],
        ActionType:0, // 0 for insert, 1 for update, 2 for cancel
        cancel_reason: "",
    }

    attendance_update:SchoolUpdateAttendanceInput ={
      session_postgre_fields: {
        module_id:""
      },
      attendance_users: [],
      attendance_date: "",
      cancel_reason: ""
    }
   
    pointDetails: any;
    isCancelled:boolean = false;
    cancelReason = '';
    attendanceStatus = "";
    Comments:string = "";
    postgre_sessionid:string = "";
    attendance_users:SchoolSessionAttendees[] = [];
    ispostgre_available:boolean = false;
    attendance_status:number;
    firebase_parentclub_id:string;
    loggedin_id:string;
    action_type:number;// this is to know the reuquest is for attedance modification or cancellation
  constructor(public storage:Storage,
      public loadingCtrl:LoadingController,
      public alertCtrl: AlertController,
      public navCtrl: NavController, 
      public popoverCtrl: PopoverController,
      public navParams: NavParams,
      private sharedservice:SharedServices,
      public commonService:CommonService,
      public fb:FirebaseService,
      private graphqlService: GraphqlService
    ) {
    console.log('ionViewDidLoad SchoolattendencePage');

    this.dateInfo = this.navParams.get('session_dates');
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.loggedin_id = val.$key;
        this.firebase_parentclub_id = val.UserInfo[0].ParentClubKey;
      }
    })
    this.sessionInfo = <SchoolDetails>this.navParams.get('session_info');
    this.attendanceInput.session_id = this.sessionInfo.id;
    this.attendance_update.session_postgre_fields.module_id = this.sessionInfo.id;
    this.attendance_status = this.navParams.get("attendance_status");
    this.attendanceInput.attedance_date = this.navParams.get("attendance_date");
    this.attendance_update.attendance_date = this.navParams.get("attendance_date");
    //attendance_staus:0 for no attedance,1 for attended
    this.action_type = this.navParams.get("action_type");
    this.getSessionAttendeesPostgre();
  }

  ionViewDidLoad() {
    
  }

  ///getAge

  getSessionAttendeesPostgre = () => {
    this.commonService.showLoader("Fetching attendees")
    const sessionQuery = gql`
    query getSchoolSesionAttandanceUsers($attendance_input:,SessionDatesInput!) {
        getSchoolSesionAttandanceUsers(sessionDatesInput:$attendance_input){
            user_id
            first_name
            last_name
            dob
            session_id
            session_member_id
            attendance_id
            attendance_date_for
            check_in_comments
            check_out_comments
            checked_in
            check_in_time
            cancel_reason
            leaderboard_points
            star_of_the_week
         }
    }`;
    this.graphqlService.query(sessionQuery,
        {attendance_input:{session_id:this.sessionInfo.id,attendance_date:this.navParams.get("attendance_date")}},
        0
    )
    .subscribe(({data}) => {
        //console.log('attendance data' + data["getSchoolSesionAttandanceUsers"]);
        this.attendance_users = data["getSchoolSesionAttandanceUsers"] as SchoolSessionAttendees[];
        if(this.attendance_users.length > 0){
          if(this.attendance_status == 2){
            this.cancelReason = this.attendance_users[0].cancel_reason;
          }
            this.checkUserAttendance();
            this.getPointsSetup();
        } 
        this.commonService.hideLoader();
    },(err)=>{
        this.commonService.hideLoader();
        console.log(JSON.stringify(err));
        this.commonService.toastMessage("attendees fetch failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
    });
  }

  selectAllToggole() {
    if (this.isSelectAll) {
        this.isUnselectAll = false;
        this.attendance_users.forEach(member => member.isSelected = true)
    } else {
        this.attendance_users.forEach(member => member.isSelected = false);
    }
  }

  checkUserAttendance(){
    //this.isSelectAll = false;
    if(this.attendance_status === 0){  // attendance not done yet
        this.attendance_users = this.attendance_users.map((user)=>{
            return {
                ...user,
                isSelected:false,
                isCancelled:false,
            }
        })
    }
    if(this.attendance_status === 1){  //already attendance done partial/completely
      this.attendance_users = this.attendance_users.map((user)=>{
          return {
              ...user,
              isSelected:user.checked_in && user.checked_in!= 0?true:false,
              isCancelled:user.checked_in && user.checked_in == 2?true:false,
          }
      })
    }
    if(this.attendance_status == 2 || this.action_type == 2){ // wanted to cancel the all attendance
      this.isSelectAll = true;
      this.attendance_users = this.attendance_users.map((user)=>{
        return {
            ...user,
            isSelected:true,
            isCancelled:true, //
        }
      })
    }
    
  }

  getPointsSetup() {
      const atten_points$Obs = this.fb.getAllWithQuery(`StandardCode/Wallet/LoyaltyVirtual/${this.firebase_parentclub_id}/${this.sessionInfo.ClubDetails.FirebaseId}/Reward/${this.sessionInfo.ActivityDetails.FirebaseActivityKey}`, { orderByKey: true, equalTo: "TermGroupSession" }).subscribe((data) => {
          this.pointDetails = data[0];
          if(Object.keys(this.pointDetails).length > 0){
            this.attendance_users.forEach(user => {
                if(user.checked_in === 1){ //means already attended
                    user.leaderboard_points  = user.leaderboard_points;
                }else if(this.action_type == 2){
                  user.leaderboard_points = 0;
                }else{
                  user.leaderboard_points = this.pointDetails["StandardPoint"] ?  this.pointDetails["StandardPoint"] : 0;
                }  
            });
          }
          atten_points$Obs.unsubscribe();
      })
      //pointDetails["TermGroupSession"]["StandardPoint"]
  }

  findOutStarIfSession(index: number) {
    if (this.attendance_users[index].star_of_the_week) {
        let points = (this.attendance_users[index].leaderboard_points) / (2);
        this.attendance_users[index].leaderboard_points = points < 10 ? this.pointDetails ? this.pointDetails["StandardPoint"] : 10 : points;
        this.attendance_users[index].star_of_the_week = false;
    } else {
      if(this.attendance_users[index].isSelected){
        this.attendance_users[index].star_of_the_week = true;
        this.attendance_users[index].leaderboard_points = this.attendance_users[index].leaderboard_points * 2;
      }else{
        this.commonService.toastMessage("Please select the user to make it star of the week", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
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
      //this.navCtrl.setRoot(Dashboard);
  }


  
  validateAttendance(){
    if(this.attendance_status == 2){
      if(this.cancelReason == ""){
        this.commonService.toastMessage("Please select the cancel reason",2500,ToastMessageType.Error);
        return false;
      }else{
        return true;
      }
    }else{
      return true;
    }
  }

  saveAttendanceDetails() {
      if(this.validateAttendance()){
        this.commonService.showLoader("Updating attendance");
        const attendance_users = this.attendance_users.map(attendance => {
            return {
              session_member_id: attendance.session_member_id,
              checked_in: this.action_type == 2 ? 2 : (attendance.isSelected ? 1 : 0),
              check_in_comments:"",
              check_in_time: moment().format('HH:mm:ss'),
              check_in_details:"",
              check_in_device_id: this.sharedservice.getDeviceId(),//this.sharedservice.getDeviceId(),
              check_in_by:this.loggedin_id,
              check_in_apptype: this.sharedservice.getPlatform() == "android" ? 1:2,
              check_in_location:"",
              check_in_platform:this.sharedservice.getPlatform(),
              leaderboard_points: attendance.isSelected ? attendance.leaderboard_points : 0,
              star_of_the_week:attendance.star_of_the_week,
              cancel_reason:this.cancelReason,
            }
        });
        this.attendanceInput.ActionType = this.action_type;
        this.attendanceInput.cancel_reason = this.cancelReason;
        let attendance_update_query;
        if(this.action_type == 0 || this.action_type == 2){ //create or cancel
          this.attendanceInput.attendees = attendance_users;
           attendance_update_query = gql`
            mutation saveSchoolAttendance($attendance_input: AttendanceInput!){
                saveSchoolAttendance(attendanceInput:$attendance_input)
            }
            `;
        }else{ //update
          this.attendance_update.attendance_users = attendance_users;
           attendance_update_query = gql`
            mutation modifySclSessionAttendance($attendance_input: SchoolUpdateAttendanceInput!){
                modifySclSessionAttendance(attendanceInput:$attendance_input)
            }
          `;
        }
        
        this.graphqlService.mutate(attendance_update_query,{attendance_input: this.action_type == 1 ? this.attendance_update:this.attendanceInput},0)
          .subscribe((res: any) => {
              this.commonService.hideLoader();
              //this.attendance_info = res.data.getSchoolSessionAttendanceDates as SessionAttendanceDates;
              //this.selectedSchool = this.school_session.ParentClubSchool.school.id;
              this.navCtrl.pop()
              this.commonService.toastMessage("Attendance updated successfully",2500,ToastMessageType.Success);
          },
         (error) => {
              this.commonService.hideLoader();
              console.error("Error in updating:", error);
              this.commonService.toastMessage("Attendance updation failed",2500,ToastMessageType.Error);
         })
      }
  }


 

  


  

  
  changeMembers() {
      this.isSelectAll = false;
      this.isUnselectAll = false;
  }

  editMode(){
    // if(this.attendenceInfo != undefined){
    //   this.isEdit = !this.isEdit;
  }
    


}









// enum AttendanceAction{
//   INSERT = 0, //insert attendance first time
//   UPDATE = 1, //update attendance 
//   CANCEL = 2, //cancel attendance 
// }

// enum AttendanceStatus{
//   NOTYET = 0,
//   DONE_PARTIAL = 1,
//   CANCELLED = 2,
// }