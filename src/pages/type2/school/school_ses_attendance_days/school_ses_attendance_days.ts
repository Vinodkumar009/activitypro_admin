import { Component } from '@angular/core';
import { ActionSheetController, IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../../services/firebase.service';
import { CommonService, ToastMessageType } from '../../../../services/common.service';
import { SchoolDetails } from '../schoolsession.model';
import { GraphqlService } from '../../../../services/graphql.service';
import { SharedServices } from '../../../services/sharedservice';
import gql from 'graphql-tag';
import * as moment from 'moment';
import { AttendanceDatesInfo, SessionAttendanceDates } from '../../../../shared/model/attendance.model';
import { first } from "rxjs/operators";
/**
 * Generated class for the SchoolesessiondetailsforattendancePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()


@Component({
  selector: 'page-school_ses_attendance_days',
  templateUrl: 'school_ses_attendance_days.html',
  providers:[GraphqlService]
})
export class SchooSesAttendanceDaysPage {
  sessionInfo:SchoolDetails;
  //days:Array<Day> = [];
  LangObj: any = {};//by vinod
  attendance_info:SessionAttendanceDates = {
    active_member_count: 0,
    attendance_dates: []
  };
  action_type:number = 1;
  attendance_status:number = 0;
  
  constructor(public navCtrl: NavController,
     public navParams: NavParams,
     public actionSheetCtrl: ActionSheetController,
     public fb:FirebaseService,
     public storage: Storage,
     public commonService:CommonService,
     private sharedservice: SharedServices, 
     private graphqlService: GraphqlService
    ) {

    // console.log('ionViewDidLoad SchoolesessiondetailsforattendancePage');
    // this.commonService.category.pipe(first()).subscribe((data) => {
    //   if (data == "attendance_dates") {
    //     //this.memberInfo = this.navParams.get("member_id");
    //     this.sessionInfo = <SchoolDetails>this.navParams.get('session_info');
    //     this.getAttendanceDates();
    //   }
    // })
    
  }

  ionViewWillEnter(){
    this.action_type = 1;
    this.getLanguage();
    this.sessionInfo = <SchoolDetails>this.navParams.get('session_info');
    this.getAttendanceDates();
  }

  ionViewDidLoad() {
    
  }

  getLanguage() {
    this.storage.get("language").then((res) => {
        console.log(res["data"]);
        this.LangObj = res.data;
    })
  }

  getAttendanceDates() {
    this.commonService.showLoader("Please wait");
    const attendance_dates_query = gql`
    query getSchoolSessionAttendanceDates($attendance_input: SessionDatesInput!){
      getSchoolSessionAttendanceDates(sessionDatesInput:$attendance_input){
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
        session_id: this.sessionInfo.id,
      }
      this.graphqlService.query(attendance_dates_query,{attendance_input: input_variable},0)
        .subscribe((res: any) => {
            this.commonService.hideLoader();
            this.attendance_info = res.data.getSchoolSessionAttendanceDates as SessionAttendanceDates;
            //this.selectedSchool = this.school_session.ParentClubSchool.school.id;
        },
       (error) => {
            this.commonService.hideLoader();
            console.error("Error in fetching:", error);
           // Handle the error here, you can display an error message or take appropriate action.
       })
  }

  
   //attendance not yet done
  showActionSheet(attendance_day:AttendanceDatesInfo) {
    let action_sheet_options:{title:string,buttons:any[]} = {
      title: '',
      buttons: []
    };
    // if (moment(attendance_day.attendance_date, 'YYYY-MM-DD').isAfter(moment(), 'day')){
    //   this.commonService.toastMessage("Check-In can be done on the session date",2500,ToastMessageType.Error);
    //   return false;
    // }
    if(attendance_day.present_count > 0 || attendance_day.pending_count > 0 || attendance_day.cancelled_count > 0){
      //already attendance done partial/completely
      this.action_type = 1;//trying to mark attendance 
      
      if(attendance_day.cancelled_count > 0){//says already cancelled
        this.attendance_status = 2;  
      } else { //attendance_day.pending_count > 0 || attendance_day.present_count > 0){
        //says attendance partially or fully done
        this.attendance_status = 1;
      }

      this.goToSchooleAttendancePage(attendance_day);
    }else{
      if(moment(attendance_day.attendance_date,"YYYY-MM-DD").isSameOrBefore(moment())){
        action_sheet_options.buttons.push(
          {
              text: "Mark Attendance",
              icon:"ios-checkmark-circle-outline",
              handler: () => {
                this.attendance_status = 0;
                this.action_type = 0;//trying to mark attendance                  
                this.goToSchooleAttendancePage(attendance_day);
              }
          },
          {
              text: "Cancel Session",
              icon:"ios-close-circle-outline",
              handler: () => {
                //this.attendance_status = 2;
                this.action_type = 2;//trying to cancel the session
                this.goToSchooleAttendancePage(attendance_day);
              }
          });   
          const actionSheet = this.actionSheetCtrl.create(action_sheet_options);
          actionSheet.present();
      }else{
        action_sheet_options.buttons.push(
          {
              text: "Cancel Session",
              icon:"ios-close-circle-outline",
              handler: () => {
                //this.attendance_status = 2;
                this.action_type = 2;//trying to cancel the session
                this.goToSchooleAttendancePage(attendance_day);
              }
          });
          const actionSheet = this.actionSheetCtrl.create(action_sheet_options);
          actionSheet.present();
      }
    }

      
    
   
  }
  
  goToSchooleAttendancePage(attendance_day:AttendanceDatesInfo){
    this.navCtrl.push('SchoolattendencePage',{
      session_info:this.sessionInfo,
      attendance_status:this.attendance_status,
      attendance_date:attendance_day.attendance_date,
      action_type:this.action_type
    });
  }

  


getAge(info){
    let year = info.split("-")[0];
    let currentYear = new Date().getFullYear();
    return Number(currentYear) - Number(year);
}





}




