import { Component } from '@angular/core';
import { ActionSheetController, IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { MonthlySession, MonthlySessionDets, MonthlySessionMember } from '../model/monthly_session.model';
import { SharedServices } from '../../../../services/sharedservice';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../../services/common.service';
import { GraphqlService } from '../../../../../services/graphql.service';
import { SessionListingInput } from '../../managesession';
import gql from 'graphql-tag';
import { IClubDetails } from '../../sessions_club.model';

/**
 * Generated class for the MonthlysessionMembershipMoveConfirmationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-monthly-move-member',
  templateUrl: 'monthly_move_member.html',
})
export class MonthlyMemberMovePage {

  user_subscription: MonthlySessionMember;
  searchTerm: "";
  monthly_sessions: MonthlySession[] = [];
  filter_monthly_sessions: MonthlySession[] = [];
  session_count: number = 0;
  clubs: IClubDetails[] = [];
  selectedClub: any = "";
  monthlySession:MonthlySessionDets

  sessionListingInput: SessionListingInput = {
    ParentClubKey: "",
    PostgresFields: {
      PostgresParentclubId: "",
      PostgresClubId: "",
      PostgresCoachId: ""
    },
    ClubKey: "",
    MemberKey: "",
    AppType: 0,
    ActionType: 0,
    DeviceType: 0,
    SessionType: 0,
    GroupStatus: 0,
    ActivityKey: "",
    Start_Date: "",
    End_Date: ""
  }

  constructor(
    public sharedservice: SharedServices,
    public actionSheetCtrl: ActionSheetController,
    public navCtrl: NavController, public navParams: NavParams,
    private graphqlService: GraphqlService,
    public commonService: CommonService,
  ) {
    this.user_subscription = this.navParams.get("memberInfo");
    console.log(this.user_subscription);
    this.monthlySession = this.navParams.get("session")
    
    this.sessionListingInput.PostgresFields.PostgresParentclubId = this.sharedservice.getPostgreParentClubId();
    this.sessionListingInput.PostgresFields.PostgresClubId = ""
    this.sessionListingInput.PostgresFields.PostgresActivityId = ""
    this.sessionListingInput.SessionType = 100
    this.sessionListingInput.ActionType = 1;
    this.sessionListingInput.DeviceType = 1;
    this.sessionListingInput.GroupStatus = 1;
    // this.sessionListingInput.PostgresFields.PostgresCoachId=""
    this.getClubList();
    // this.getMonthlySessions();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MonthlysessionMembershipMoveConfirmationPage');
  }


  formatAmount(amount: any): string {
    const numAmount = Number(amount);
    if (!isNaN(numAmount)) {
      return numAmount.toFixed(2);
    }
  }

  canMoveToSession(index:number){
    const can_move_input = {
      session_id:this.filter_monthly_sessions[index].id,
      user_postgre_metadata:{
        UserMemberId:this.user_subscription.user.Id
      }
    }
    const can_move_query = gql`
    query canMemberMoveIntoSession($canmoveinput: MonthlySessionMoveInput!) {
      canMemberMoveIntoSession(moveMonthlyCheckInput: $canmoveinput)
    }` 
    const enrol_mutation_variable = { canmoveinput: can_move_input };
      this.graphqlService.mutate(
        can_move_query, 
        enrol_mutation_variable,
        0
      ).subscribe((response)=> {
        const can_move = response.data.canMemberMoveIntoSession;
        if(can_move){ 
          this.selectSession(this.filter_monthly_sessions[index].id);
        }else{
          this.commonService.toastMessage("User already existed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }
      },(err)=> {
        this.commonService.toastMessage("User already existed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
      });             
  }

  selectSession(session_id:string) {
    this.commonService.showLoader("Please wait");
    const monthly_session_query = gql`
    query getMonthlySessionDetails($input: MonthlySessionDetailsInput!) {
        getMonthlySessionDetails(monthlySessionInput: $input) {
            id
            session_name
            start_date
            end_date
            start_time
            end_time
            duration
            days
            group_size
            group_category
            group_status
            image_url
            activity_category_name
            activity_subcategory_name
            coach_names
            coach_image
            ParentClubDetails {
              Id
              FireBaseId
              ParentClubName
            }
            ActivityDetails {
              Id
              FirebaseActivityKey
              ActivityName
            }
            ClubDetails {
              Id
              FirebaseId
              ClubName
            }
            Days {
              status
              day
            }
            coaches {
              Id
              coach_firebase_id
              first_name
              last_name
              profile_image
            }
            active_payplans{
              id_member
              id_non_member
              plan_id_member
              plan_id_non_member
              plan_amount_member
              plan_amount_non_member
              days_for
              status               
            }
      }
    }
  `;
    const session_dets_input = {
        SessionId:session_id,
        DeviceType:this.sharedservice.getPlatform() == "android" ? 1:2,
        AppType:0
    }
    this.graphqlService.query(monthly_session_query, { input: session_dets_input},0).subscribe((res: any) => {
        this.commonService.hideLoader();
        this.monthlySession.days = this.monthlySession.Days.map(session_day => session_day.day).join(",")
        res.data.getMonthlySessionDetails.days = res.data.getMonthlySessionDetails.Days.map(session_day => session_day.day).join(",")
        this.navCtrl.push("ConfirmmonthlyPage",{
          new_session:res.data.getMonthlySessionDetails,
          old_session:this.monthlySession,
          existing_subscription_info:this.user_subscription
        });
    },(error) => {
          this.commonService.hideLoader();
          this.commonService.toastMessage("Failed to fetch session",2500,ToastMessageType.Error,ToastPlacement.Bottom);
          console.error("Error in fetching:", error);
          if (error.graphQLErrors) {
            console.error("GraphQL Errors:", error.graphQLErrors);
            for (const gqlError of error.graphQLErrors) {
              console.error("Error Message:", gqlError.message);
              console.error("Error Extensions:", gqlError.extensions);
            }
          }
          if (error.networkError) {
            console.error("Network Error:", error.networkError);
          }
      }
    )      
   
  }

  getClubList() {
    const clubs_input = {
      parentclub_id: this.sharedservice.getPostgreParentClubId(),
      user_postgre_metadata: {
        UserMemberId: this.sharedservice.getLoggedInId()
      },
      user_device_metadata: {
        UserAppType: 0,
        UserDeviceType: this.sharedservice.getPlatform() == "android" ? 1 : 2
      }
    }
    const clubs_query = gql`
        query getVenuesByParentClub($clubs_input: ParentClubVenuesInput!){
          getVenuesByParentClub(clubInput:$clubs_input){
                Id
                ClubName
                FirebaseId
                MapUrl
                sequence
            }
        }
        `;
    this.graphqlService.query(clubs_query, { clubs_input: clubs_input }, 0)
      .subscribe((res: any) => {
        this.clubs = res.data.getVenuesByParentClub as IClubDetails[];

        this.sessionListingInput.PostgresFields.PostgresClubId = this.clubs[0].Id
        this.selectedClub = "All";
        // this.sessionListingInput.PostgresFields.PostgresClubId = "";
        this.getMonthlySessions();
      },
      (error) => {
          console.error("Error in fetching:", error);
      })
  }

  onChangeOfClub() {
    console.log("selected club value is:", this.selectedClub);
    if (this.selectedClub === "All") {
      this.sessionListingInput.PostgresFields.PostgresClubId = "";
    } else {
      this.sessionListingInput.PostgresFields.PostgresClubId = this.selectedClub;
    }
    // Call the function to fetch monthly sessions whenever the club changes
    this.getMonthlySessions();
  }


  //getting monthly session list
  getMonthlySessions() {
    this.monthly_sessions = [];
    this.filter_monthly_sessions = [];
    this.session_count = 0;
    this.sessionListingInput.fetchForMember = false;
    //this.commonService.showLoader("Please wait");
    console.log("input giving for monthly list:", this.sessionListingInput);
    const monthly_session_query = gql`
      query getAllMonthlySessions($input: SessionListingInput!) {
        getAllMonthlySessions(monthlySessionInput: $input) {
          id
          financial_year_key
          session_name
          start_date
          end_date
          start_time
          duration
          days
          group_size
          group_status
          activity_category_name
          activity_subcategory_name
          ClubDetails{
            Id
            ClubName
          }
          ActivityDetails{
            ActivityName
          }
          session_stats{
            enrolled_member_count
            paid_count
            pendingpayment_member_count
            subscribed_member_count
          }
          coaches{
            Id
            coach_firebase_id
            first_name
            last_name
          }
          coach_names
          coach_image
          end_time
        }
      }
    `;

    this.graphqlService
      .query(
        monthly_session_query, { input: this.sessionListingInput }, 0
      )
      .subscribe((res: any) => {
        //this.commonService.hideLoader();
        if (res.data.getAllMonthlySessions.length > 0) {
          this.monthly_sessions = res.data.getAllMonthlySessions as MonthlySession[];
          this.filter_monthly_sessions = JSON.parse(JSON.stringify(this.monthly_sessions));
          this.session_count = this.filter_monthly_sessions.length;
          this.filter_monthly_sessions = this.filter_monthly_sessions.filter(session => session.id!== this.monthlySession.id);
          // const present_session_index = this.filter_monthly_sessions.findIndex((item) => item.id == this.monthlySession.id);
          // if(present_session_index!==-1){ //if session is present in monthly list then remove it as when we are moving we don't need to show present one which are already you are in
          //   this.filter_monthly_sessions.splice(present_session_index,1);
          //   this.monthly_sessions.splice(present_session_index,1);
          // }
          console.log("monthly list data :", JSON.stringify(this.monthly_sessions));
        } else {
          this.commonService.toastMessage("No session(s) found", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        }
      },
        (error) => {
          //this.commonService.hideLoader();
          this.commonService.toastMessage("Failed to fetch list", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          console.error("Error in fetching:", error);
          if (error.graphQLErrors) {
            console.error("GraphQL Errors:", error.graphQLErrors);
            for (const gqlError of error.graphQLErrors) {
              console.error("Error Message:", gqlError.message);
              console.error("Error Extensions:", gqlError.extensions);
            }
          }
          if (error.networkError) {
            console.error("Network Error:", error.networkError);
          }
        }
      )
  }

  initializeItems() {
    this.filter_monthly_sessions = this.monthly_sessions;
  }

  searchSession(ev: any) {
    this.initializeItems();

    // set val to the value of the searchbar
    const val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != "") {
      this.filter_monthly_sessions = this.monthly_sessions.filter((item) => {
        if (item.session_name != undefined) {
          if (item.session_name.toLowerCase().indexOf(val.toLowerCase()) > -1)
            return true;
        }
        if (item.coach_names != undefined) {
          if (item.coach_names.toLowerCase().indexOf(val.toLowerCase()) > -1)
            return true;
        }
        // if (item.venue.VenueName!= undefined) {
        //   if (item.venue.VenueName.toLowerCase().indexOf(val.toLowerCase()) > -1)
        //     return true;
        // }

      });
    }

  }



}
