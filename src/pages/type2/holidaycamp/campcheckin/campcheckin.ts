import { Component } from "@angular/core";
import gql from "graphql-tag";
import { ActionSheetController, AlertController, IonicPage, LoadingController, NavController, NavParams } from "ionic-angular";
import { CommonService, ToastMessageType, ToastPlacement, } from "../../../../services/common.service";
import { FirebaseService } from "../../../../services/firebase.service";
import { SharedServices } from "../../../services/sharedservice";
import { Storage } from "@ionic/storage";
import moment from "moment";
import { UserAttendance, UserPasscode, AttendanceCheckIn_Out } from "../models/attendancecheckin.model";
import { GraphqlService } from "../../../../services/graphql.service";
import { convertMinutesToHoursAndMinutes } from "../../../../shared/utility/utility";
import { CampUserEnrols } from "../models/holiday_camp.model";

/**
 * Generated class for the CampcheckinPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-campcheckin",
  templateUrl: "campcheckin.html",
})
export class CampcheckinPage {

  selectedSessionObj;
  selectedCampDetails;
  enrolledMembers:CampUserEnrols[] = [];
  coaches;

  holidayCampCheckInInput: HolidayCampCheckInInput = {
    modifiedBy: "",
    items: []
  }


  checkin_enrols = [];

  isSelectAll = false;
  isUnselectAll = false;
  campDetails: any;
  sessionDetails: any;
  memberLists: any;
  sessionList: any;
  SessionDate: any;

  // attendanceDetails: AttendanceDetails = {
  //   ParentClubKey: "",
  //   MemberKey: "",
  //   AppType: 0,
  //   ActionType: 0,
  //   holidayCampPostGresId: "",
  //   sessionPostGresId: "",
  //   attendance_type: 0,
  //   holidayCampFirebaseKey: "",
  //   sessionFirebaseKey: "",
  // };
  attendance: AttendanceCheckIn_Out = {
    ParentClubKey: "",
    MemberKey: "",
    AppType: 0,
    ActionType: 0,
    members: [],
    deviceId: "",
    platform: "",
    time: new Date().toISOString(),
    comments: "",
    attendance_type: 0,
    holidayCampFirebaseKey: "",
    sessionFirebaseKey: "",
  };
  coachName: string = "";
  sesStat: UserAttendance[] = [];
  passcode: UserPasscode[] = [];
  is_all_checked:boolean = false;
  constructor(
    public graphqlService: GraphqlService,
    public navCtrl: NavController,
    public navParams: NavParams,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public fb: FirebaseService,
    public sharedservice: SharedServices,
    public actionSheetCtrl: ActionSheetController,
    public alertCtrl: AlertController
  ) {
    // this.storage.get("userObj").then((val) => {
    //   val = JSON.parse(val);
    //   if (val.$key != "") {
    //     this.attendance.MemberKey = val.$key;
    //     this.attendanceDetails.MemberKey = val.$key;
    //     this.holidayCampCheckInInput.modifiedBy = val.$key;
    //     console.log('STORAGE ' + val.$key);
    //   }
    //   // this.attendanceStatusForSession();
    // }).catch((e) => {
    //   console.log('Selected Holiday Camp Details ' + JSON.stringify(e))
    // })
    this.holidayCampCheckInInput.modifiedBy = this.sharedservice.getLoggedInId();
  }

  ionViewDidLoad() { }
  ionViewWillEnter() {
    console.log("ionViewDidLoad CampcheckinPage");
    this.selectedCampDetails = this.navParams.get("holidayCampDetails");
    this.selectedSessionObj = this.navParams.get("selectedSessionObj");
    //this.selectedSessionObj.duration = convertMinutesToHoursAndMinutes(Number(this.selectedSessionObj.duration));
    console.log('Selected Session Object ' + JSON.stringify(this.selectedSessionObj))
    console.log('Selected Holiday Camp Details ' + JSON.stringify(this.selectedCampDetails))
    this.enrolledMembers = this.navParams.get("enrolledMembers");
    console.log('Enrolled members' + JSON.stringify(this.enrolledMembers))
    this.coaches = this.selectedCampDetails.Coach;
    console.log('Coaches' + JSON.stringify(this.coaches))

    

    // this.enrolledMembers.forEach((member) => {
    //   member["isSelect"] = false;
    // });

    // this.storage.get("userObj").then((val) => {
    //   val = JSON.parse(val);
    //   if (val.$key != "") {
    //     this.attendance.MemberKey = val.$key;
    //     this.attendanceDetails.MemberKey = val.$key;
    //     this.holidayCampCheckInInput.modifiedBy = val.$key;
    //     console.log('STORAGE ' + val.$key);
    //   }
    // });
    this.holidayCampCheckInInput.modifiedBy = this.sharedservice.getLoggedInId();
    this.checkForExistingAttendance();
  }


  checkForExistingAttendance(){
    this.enrolledMembers.forEach((member) => {
      member['isSelect'] = member.attendanceDetails.checked_in == 1 ? true:false;
    })
    this.is_all_checked = this.enrolledMembers.every(member => member.attendanceDetails.checked_in == 1);
    this.isSelectAll = this.is_all_checked;
  }

  

  getHours(duration){
    return convertMinutesToHoursAndMinutes(Number(duration));
  }

  selectAllToggole() {
    //this.enroll
    //enrolledMembers.fill(this.isSelectAll, 0, this.enrolledMembers.length);
    if (this.isSelectAll) {
      for (let loop = 0; loop < this.enrolledMembers.length; loop++) {
        if(this.enrolledMembers[loop].attendanceDetails.checked_in!==1){
          this.enrolledMembers[loop].isSelect = true;
          this.saveUser(this.enrolledMembers[loop])
        }
      }
    } else if (!this.isSelectAll) {
      for (let loop = 0; loop < this.enrolledMembers.length; loop++) {
        if(this.enrolledMembers[loop].attendanceDetails.checked_in!==1){
          this.enrolledMembers[loop].isSelect = false;
        }
      }
      this.holidayCampCheckInInput.items = [];
    }
  }

  changeMembers(enrol, index) {
    this.isSelectAll = false;
    this.isUnselectAll = false;
    if (enrol.isSelect) {
      this.saveUser(enrol);
    } else {
      const matchingIndex = this.holidayCampCheckInInput.items.findIndex(item => item.attendance_id === enrol.id);
      if (matchingIndex !== -1) {
        this.holidayCampCheckInInput.items.splice(matchingIndex, 1);
      }
    }
    console.log("selectedMembers:", this.holidayCampCheckInInput.items);
  }

  saveUser(enrol:CampUserEnrols) {
    this.holidayCampCheckInInput.items.push({
      attendance_id: enrol.attendanceDetails.id,
      check_in_comments: enrol.attendanceDetails.check_in_comments,
      check_in_details: '',
      check_in_device_id: this.sharedservice.getDeviceId(),
      check_in_platform: this.sharedservice.getPlatform(),
      check_in_by: this.holidayCampCheckInInput.modifiedBy,
      check_in_apptype: '0',
    });
  }
  saveCheckIn() {
    let prompt = this.alertCtrl.create({
      title: "Confirm Check-In",
      message: "Are you sure you want to save the check-in(s)?",
      buttons: [
        {
          text: "No",
          handler: () => {},
          role:'cancel'
        },
        {
          text: "Yes",
          handler: () => {
            this.checkIn();
          },
        },
      ],
    });
    prompt.present();
  }
  // attendanceStatusForSession = () => {
  //   // this.commonService.showLoader("Fetching feeds...");
  //   this.attendanceDetails.ParentClubKey = this.campDetails.ParentClubKey;
  //   this.attendanceDetails.holidayCampFirebaseKey = this.campDetails.$key;
  //   this.attendanceDetails.sessionFirebaseKey = this.sessionDetails.Key;
  //   const attendanceStatusForSessionQuery = gql`
  //     query getAttendanceStatusForSessionHolidayCamp(
  //       $attendanceInput: AttendanceDetails!
  //     ) {
  //       getAttendanceStatusForSessionHolidayCamp(attendanceInput: $attendanceInput) {
  //         memberKey
  //         attendanceStatus
  //         comments
  //         overAllComments
  //       }
  //     }
  //   `;
  //   this.apollo
  //     .query({
  //       query: attendanceStatusForSessionQuery,
  //       fetchPolicy: "no-cache",
  //       variables: {
  //         attendanceInput: this.attendanceDetails,
  //       },
  //     })
  //     .subscribe(
  //       ({ data }) => {
  //         console.log(
  //           "getAttendanceStatusForSession data" +
  //           JSON.stringify(data["getAttendanceStatusForSessionHolidayCamp"])
  //         );
  //         this.commonService.hideLoader();
  //         const checkedin_data = data["getAttendanceStatusForSessionHolidayCamp"];
  //         if (checkedin_data && checkedin_data.length > 0) {
  //           this.attendance.comments = checkedin_data[0].overAllComments;
  //           for (let inmember_ind = 0; inmember_ind < checkedin_data.length; inmember_ind++) {
  //             for (let ses_member_ind = 0; ses_member_ind < this.sessionDetails.Members.length; ses_member_ind++) {
  //               if (this.sessionDetails.Members[ses_member_ind].Key == checkedin_data[inmember_ind].memberKey) {
  //                 this.sessionDetails.Members[ses_member_ind].isSelect = checkedin_data[inmember_ind].attendanceStatus == 1 ? true : false;
  //                 this.sessionDetails.Members[ses_member_ind].is_alredy_checkedin = checkedin_data[inmember_ind].attendanceStatus == 1 ? true : false
  //                 this.sessionDetails.Members[ses_member_ind].comments = checkedin_data[inmember_ind].comments;
  //               }
  //             }
  //           }
  //         }
  //       },
  //       (err) => {
  //         this.commonService.hideLoader();
  //         console.log(JSON.stringify(err));
  //         //this.commonService.toastMessage("Failed to fetch status",2500,ToastMessageType.Error,ToastPlacement.Bottom);
  //       }
  //     );
  // };

  checkIn() {
    for(const enrol of this.holidayCampCheckInInput.items){
      const enrol_user = this.enrolledMembers.find(attendance => attendance.attendanceDetails.id == enrol.attendance_id);
      enrol.check_in_comments = enrol_user ? enrol_user.attendanceDetails.check_in_comments:"";
    }
    const checkin_mutation = gql`
    mutation checkInUsersToHolidayCamp($input: HolidayCampCheckInInput!) {
      checkInUsersToHolidayCamp(input: $input){
        canCheckin
        isPresent
        checkInStatus
      }
    }`

    const variables = { input: this.holidayCampCheckInInput }

    this.graphqlService.mutate(checkin_mutation, variables, 0).subscribe(
      result => {
        // Handle the result
        this.commonService.toastMessage("Checked-In successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        console.log(`checkInUsersToHolidayCamp res:${result}`);
        this.navCtrl.pop();
      },
      error => {
        // Handle errors
        console.error(error);
      }
    );
    
  }
}



// export class AttendanceDetails {
//   ParentClubKey: string;
//   MemberKey: string;
//   AppType: 0;
//   ActionType: 0;
//   holidayCampPostGresId: string;
//   sessionPostGresId: string;
//   attendance_type: 0;
//   holidayCampFirebaseKey: string;
//   sessionFirebaseKey: string;
// }

export class HolidayCampCheckInInput {
  modifiedBy: string
  items: CheckInInput[]
}

export class CheckInInput {
  attendance_id: string
  check_in_comments: string
  check_in_details: string
  check_in_device_id: string
  check_in_platform: string
  check_in_by: string
  check_in_apptype: string
}