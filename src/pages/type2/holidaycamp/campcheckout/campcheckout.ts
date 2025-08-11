import { Component } from "@angular/core";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import { ActionSheetController, AlertController, IonicPage, LoadingController, NavController, NavParams, } from "ionic-angular";
import { CommonService, ToastMessageType, ToastPlacement, } from "../../../../services/common.service";
import { FirebaseService } from "../../../../services/firebase.service";
import { SharedServices } from "../../../services/sharedservice";
import { Storage } from "@ionic/storage";
import { AttendanceCheckIn_Out, AttendanceDetails, UserAttendance, UserPasscode, } from "../models/attendancecheckin.model";
import { GraphqlService } from "../../../../services/graphql.service";
import { CampUserEnrols } from "../models/holiday_camp.model";

/**
 * Generated class for the CampcheckoutPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-campcheckout",
  templateUrl: "campcheckout.html",
  //styleUrls:['../campcheckin/campcheckin.css']
})
export class CampcheckoutPage {

  isSelect: boolean = false;
  selectedSessionObj;
  selectedCampDetails;
  enrolledMembers: CampUserEnrols[] = [];
  filteredMembers: CampUserEnrols[] = [];
  membersNotCheckedOut: CampUserEnrols[] = [];
  coaches;

  is_all_checked_out:boolean = false;
  isSelectAll:boolean = false;
  isUnselectAll = false;

  holidayCampCheckOutInput: HolidayCampCheckOutInput = {
    modifiedBy: "",
    items: []
  }

  attendanceDetails: AttendanceDetails = {
    ParentClubKey: "",
    MemberKey: "",
    AppType: 0,
    ActionType: 0,
    holidayCampPostGresId: "",
    sessionPostGresId: "",
    attendance_type: 0,//0 for check-in,1 for check-out
    holidayCampFirebaseKey: "",
    sessionFirebaseKey: "",
  };
  attendance: AttendanceCheckIn_Out = {
    ParentClubKey: "",
    MemberKey: "",
    AppType: 0,
    ActionType: 1,
    members: [],
    deviceId: "",
    platform: "",
    time: new Date().toISOString(),
    comments: "",
    attendance_type: 1,
    holidayCampFirebaseKey: "",
    sessionFirebaseKey: "",
  };
  sesStat: UserAttendance[] = [];
  passcode: UserPasscode[] = [];
  coachName: string = "";
  constructor(
    public graphqlService: GraphqlService,
    public navCtrl: NavController,
    public navParams: NavParams,
    private apollo: Apollo,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public fb: FirebaseService,
    public sharedservice: SharedServices,
    public actionSheetCtrl: ActionSheetController,
    public alertCtrl: AlertController
  ) {
    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.attendance.MemberKey = val.$key;
        this.attendanceDetails.MemberKey = val.$key;
        this.holidayCampCheckOutInput.modifiedBy = val.$key;
      }
      // this.attendanceDetails.ParentClubKey = this.campDetails.ParentClubKey;
      // this.attendanceDetails.holidayCampFirebaseKey = this.campDetails.$key;
      // this.attendanceDetails.sessionFirebaseKey = this.sessionDetails.Key;
      // this.attendanceStatusForSessionCheckin();
    });
  }

  ionViewWillEnter() {
    console.log("ionViewDidLoad CampcheckinPage");
    this.selectedCampDetails = this.navParams.get("holidayCampDetails");
    this.selectedSessionObj = this.navParams.get("selectedSessionObj");
    console.log('Selected Session Object ' + JSON.stringify(this.selectedSessionObj))
    console.log('Selected Holiday Camp Details ' + JSON.stringify(this.selectedCampDetails))
    this.enrolledMembers = this.navParams.get("enrolledMembers");
    //show only checkout users
    this.filteredMembers = this.enrolledMembers.filter(user => user.attendanceDetails.checked_in === 1);
    // this.membersNotCheckedOut = this.filteredMembers.filter(user => user.attendanceDetails.checked_out === 0);

    this.filteredMembers.forEach(user => {
      if(user.attendanceDetails.checked_out === 1) {
        user.attendanceDetails.leaderboard_points = user.attendanceDetails.leaderboard_points && user.attendanceDetails.leaderboard_points!='' ? user.attendanceDetails.leaderboard_points:'10'
        user.attendanceDetails.isSelect = true
      }else{
        user.attendanceDetails.isSelect = false
        user.attendanceDetails.leaderboard_points = '10';
      }
      this.is_all_checked_out = this.filteredMembers.every(item => item.attendanceDetails.checked_out === 1 );
      this.isSelectAll = this.is_all_checked_out ? true:false;
    });

    //this.getPointsSetup();


    console.log('Filtered members' + JSON.stringify(this.filteredMembers))
    this.coaches = this.selectedCampDetails.Coach;
    console.log('Coaches' + JSON.stringify(this.coaches))
    
    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.attendance.MemberKey = val.$key;
        this.attendanceDetails.MemberKey = val.$key;
      }
    });
  }


  getPointsSetup() {
    this.filteredMembers.forEach((checkout_member)=>{
      const checkout_item:CheckOutInput = {
        attendance_id:checkout_member.id,
        check_out_comments: checkout_member.attendanceDetails.check_out_comments,
        check_out_details: checkout_member.attendanceDetails.check_in_comments,
        check_out_device_id: this.sharedservice.getDeviceId(),
        check_out_platform:this.sharedservice.getPlatform() == "android" ? '1':'2',
        check_out_by: this.sharedservice.getLoggedInId(),
        check_out_apptype: '1',
        attendance_info: checkout_member.attendanceDetails.check_out_comments,
        star_of_the_session: checkout_member.attendanceDetails.star_of_the_session,
        leaderboard_points: checkout_member.attendanceDetails.leaderboard_points,
      }
      this.holidayCampCheckOutInput.items.push(checkout_item);
    }) 
}


  
  findOutStarIfSession(e, index: number) {
    if(e.attendanceDetails.checked_out!=1){
      let leaderBoardPoints = parseInt(e.attendanceDetails.leaderboard_points);
      // Check if the member is not already checked in and if the session member exists
      if (e.attendanceDetails.isSelect) {
        // Check if the member is already marked as the star of the session
        if (e.attendanceDetails.star_of_the_session == '1') {
          // Reduce the leaderboard points by half if already marked as star
          let points = leaderBoardPoints / 2;
          // this.holidayCampCheckOutInput.items[index].leaderboard_points = points < 10 ? '10' : points.toString();
          // this.holidayCampCheckOutInput.items[index].star_of_the_session = 1;
          //ngModel
          e.attendanceDetails.star_of_the_session = '0';
          e.attendanceDetails.leaderboard_points = points < 10 ? '10' : points.toString();
        } else {
          // Double the leaderboard points if not already marked as star
          let x = leaderBoardPoints * 2;
          // this.holidayCampCheckOutInput.items[index].leaderboard_points = x.toString();
          // this.holidayCampCheckOutInput.items[index].star_of_the_session = 0;
          //ngModel
          e.attendanceDetails.star_of_the_session = '1';
          e.attendanceDetails.leaderboard_points = x.toString()
        }
      }else{
        this.commonService.toastMessage("Please select the member",2500,ToastMessageType.Error);
      }
    }
  }


  // //memberList: CampUserEnrols[] = this.filteredMembers.filter(user => user.attendanceDetails.checked_out === 0);
  // memberList: CampUserEnrols[] = this.filteredMembers
  //   .filter(user => user.attendanceDetails.checked_out === 0)
  //   .map(user => {
  //     return {
  //       ...user,
  //       attendanceDetails: {
  //         ...user.attendanceDetails,
  //         isSelect: false
  //       }
  //     };
  //   });

  selectAllToggle(e: CampUserEnrols, index) {
    //this.isSelectAll = !this.isSelectAll;
    // if (e.attendanceDetails.isSelect) {
    //   // if (e.attendanceDetails.checked_out == 1) {
    //   //this.saveUser(e);
    //   this.isSelect = true
    // } else {
    //   const matchingIndex = this.holidayCampCheckOutInput.items.findIndex(item => item.attendance_id === e.attendanceDetails.id);
    //   if (matchingIndex !== -1) {
    //     this.holidayCampCheckOutInput.items.splice(matchingIndex, 1);
    //   } this.isSelect = false
    // }
    if (!this.isSelectAll) {
      this.unselectAllMembers();
    } else {
      this.selectAllMembers();
    }
  }


  selectAllMembers() {
    this.filteredMembers.forEach(item => {
      if (!item.attendanceDetails.isSelect && item.attendanceDetails.checked_out!=1) {
        item.attendanceDetails.isSelect = true;
        //this.saveUser(item);
      }
    });
  }

  unselectAllMembers() {
    this.filteredMembers.forEach((item: CampUserEnrols) => {
      if (item.attendanceDetails.isSelect && item.attendanceDetails.checked_out!=1) {
        item.attendanceDetails.isSelect = false;
        //const matchingIndex = this.holidayCampCheckOutInput.items.findIndex(x => x.attendance_id === item.attendanceDetails.id);
        // if (matchingIndex !== -1) {
        //   this.holidayCampCheckOutInput.items.splice(matchingIndex, 1);
        // }
      }
    });
  }

  changeMembers(e: CampUserEnrols, index) {
    // // this.isSelectAll = false;
    // // this.isUnselectAll = false;
    // if (e.attendanceDetails.isSelect) {
    //   // if (e.attendanceDetails.checked_out == 1) {
    //   //this.saveUser(e);
    //   this.isSelect = true
    // } else {
    //   const matchingIndex = this.holidayCampCheckOutInput.items.findIndex(item => item.attendance_id === e.attendanceDetails.id);
    //   if (matchingIndex !== -1) {
    //     this.holidayCampCheckOutInput.items.splice(matchingIndex, 1);
    //   } this.isSelect = false
    // }
    //console.log("selectedMembers:", this.holidayCampCheckOutInput.items);
  }

  saveUser(e: CampUserEnrols) {
    this.holidayCampCheckOutInput.items.push({
      attendance_id: e.attendanceDetails.id,
      check_out_comments: e.attendanceDetails.check_out_comments,
      check_out_details: '',
      check_out_device_id: this.sharedservice.getDeviceId(),
      check_out_platform: this.sharedservice.getPlatform(),
      check_out_by: this.holidayCampCheckOutInput.modifiedBy,
      check_out_apptype: '0',
      attendance_info: "",
      star_of_the_session: e.attendanceDetails.star_of_the_session ? 1:0,
      leaderboard_points: e.attendanceDetails.leaderboard_points,
    });
  }

  saveCheckOut() {
    let prompt = this.alertCtrl.create({
      title: "Confirm Check-Out",
      message: "Are you sure you want to check-out?",

      buttons: [
        {
          text: "No",
          handler: () => {
          },
        },
        {
          text: "Yes",
          handler: () => {
            // for (var i in this.filteredMembers) {
            //   const indexMatch = this.holidayCampCheckOutInput.items.findIndex(item => item.attendance_id === this.filteredMembers[i].attendanceDetails.id);
            //   if (indexMatch) {
            //     this.holidayCampCheckOutInput.items[i].check_out_comments = this.filteredMembers[i].attendanceDetails.check_out_comments;
            //   }
            // }
            this.checkOut();
          },
        },
      ],
    });
    prompt.present();
  }
  //firstly we have to cal for checkin because we can't check-out the people without check-in
  attendanceStatusForSessionCheckin = () => {
    // this.commonService.showLoader("");
    const attendanceStatusForSessionQuery = gql`
      query getAttendanceStatusForSessionHolidayCamp(
        $attendanceInput: AttendanceDetails!
      ) {
        getAttendanceStatusForSessionHolidayCamp(attendanceInput: $attendanceInput) {
          memberKey
          attendanceStatus
          comments
          starOftheSession
          leaderBoardpoints
          overAllComments
        }
      }
    `;
    this.apollo
      .query({
        query: attendanceStatusForSessionQuery,
        fetchPolicy: "no-cache",
        variables: {
          attendanceInput: this.attendanceDetails,
        },
      })
      .subscribe(
        ({ data }) => {
          console.log(
            "getAttendanceStatusForSession data" +
            JSON.stringify(data["getAttendanceStatusForSessionHolidayCamp"])
          );
          //this.commonService.hideLoader();
          const checkedin_data = data["getAttendanceStatusForSessionHolidayCamp"];
          if (checkedin_data && checkedin_data.length > 0) {
            // for(let inmember_ind =0;inmember_ind < this.sessionDetails.Members.length;inmember_ind++){
            //   let ses_member = checkedin_data.find(member =>member.memberKey == this.sessionDetails.Members[inmember_ind].Key);
            //   if(!ses_member){
            //     this.sessionDetails.Members[inmember_ind].is_alredy_checkedin = true;
            //   }
            // }
            // matchingIndex = this.holidayCampCheckOutInput.items.findIndex(item => item.attendance_id === e.id);
            this.attendanceStatusForSessionCheckout();
          }
        },
        (err) => {
          //this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage("Failed to fetch status", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        }
      );
  };

  //firstly we have to cal for checkin because we can't check-out the people without check-in
  attendanceStatusForSessionCheckout = () => {
    // this.commonService.showLoader("");
    this.attendanceDetails.attendance_type = 1;
    const attendanceStatusForSessionQuery = gql`
      query getAttendanceStatusForSessionHolidayCamp(
        $attendanceInput: AttendanceDetails!
      ) {
        getAttendanceStatusForSessionHolidayCamp(attendanceInput: $attendanceInput) {
          memberKey
          attendanceStatus
          comments
          starOftheSession
          leaderBoardpoints
          overAllComments
        }
      }
    `;
    this.apollo
      .query({
        query: attendanceStatusForSessionQuery,
        fetchPolicy: "no-cache",
        variables: {
          attendanceInput: this.attendanceDetails,
        },
      })
      .subscribe(
        ({ data }) => {
          console.log(
            "getAttendanceStatusForSession data" +
            JSON.stringify(data["getAttendanceStatusForSessionHolidayCamp"])
          );
          //this.commonService.hideLoader();
          const checkedin_data = data["getAttendanceStatusForSessionHolidayCamp"];
          if (checkedin_data && checkedin_data.length > 0) {
            this.attendance.comments = checkedin_data[0].overAllComments;
            for (let inmember_ind = 0; inmember_ind < checkedin_data.length; inmember_ind++) {
              // for(let ses_member_ind =0;ses_member_ind < this.sessionDetails.Members.length;ses_member_ind++){
              //   if(this.sessionDetails.Members[ses_member_ind].Key == checkedin_data[inmember_ind].memberKey){
              //     this.sessionDetails.Members[ses_member_ind].isSelect = checkedin_data[inmember_ind].attendanceStatus == 1? true:false;
              //     this.sessionDetails.Members[ses_member_ind].is_alredy_checkedin = checkedin_data[inmember_ind].attendanceStatus == 1? true:false
              //     this.sessionDetails.Members[ses_member_ind].is_star_ofthe_session = checkedin_data[inmember_ind].starOftheSession == 1 ?true:false;
              //     this.sessionDetails.Members[ses_member_ind].leaderboard_Points = Number(checkedin_data[inmember_ind].leaderBoardpoints);
              //     this.sessionDetails.Members[ses_member_ind].comments = checkedin_data[inmember_ind].comments;
              //   }
              // }
            }
          }
        },
        (err) => {
          //this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage("Failed to fetch status", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        }
      );
  };

  checkOut() {
    try{
      this.filteredMembers.forEach((e)=>{
        if(e.attendanceDetails.isSelect){
          this.holidayCampCheckOutInput.items.push({
            attendance_id: e.attendanceDetails.id,
            check_out_comments: e.attendanceDetails.check_out_comments,
            check_out_details: '',
            check_out_device_id: this.sharedservice.getDeviceId(),
            check_out_platform: this.sharedservice.getPlatform(),
            check_out_by: this.holidayCampCheckOutInput.modifiedBy,
            check_out_apptype: '0',
            attendance_info: "",
            star_of_the_session: Number(e.attendanceDetails.star_of_the_session),
            leaderboard_points: e.attendanceDetails.leaderboard_points ? e.attendanceDetails.leaderboard_points:'0',
          });
        }
      })
  
      const checkin_mutation = gql`
      mutation checkoutUsersFromHolidayCamp($input: HolidayCampCheckOutInput!) {
        checkoutUsersFromHolidayCamp(input: $input){
          canCheckin
          isPresent
          checkInStatus
        }
      }`
  
      const variables = { input: this.holidayCampCheckOutInput }
  
      this.graphqlService.mutate(checkin_mutation, variables, 0).subscribe(
        result => {
          // Handle the result
          this.commonService.toastMessage("Checked-Out successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
          console.log(`checkoutUsersFromHolidayCamp res:${result}`);
          this.navCtrl.pop();
        },
        error => {
          this.commonService.toastMessage("Checked-Out failed", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
          console.error(error);
        }
      );      
    }catch(error){
      console.error(error);
      this.commonService.toastMessage("Checked-Out failed", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
    }
  }
}


export class UserAttendanceInput {
  memberKey: string;
  comments: string;
  attendance_status: number;
  leaderboardpoints: number;
  star_of_the_session: number;
}
export class HolidayCampCheckOutInput {
  modifiedBy: string
  items: CheckOutInput[]
}
export class CheckOutInput {
  attendance_id: string
  check_out_comments: string
  check_out_details: string
  check_out_device_id: string
  check_out_platform: string
  check_out_by: string
  check_out_apptype: string
  attendance_info: string
  star_of_the_session: number
  leaderboard_points: string
}

