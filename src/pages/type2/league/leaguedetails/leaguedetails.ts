import { Component, ViewChild } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  LoadingController,
  ActionSheetController,
  ModalController,
  Platform,
  FabContainer,
  PopoverController,
} from "ionic-angular";
import * as moment from "moment";
import { Storage } from "@ionic/storage";
import { CommonService, ToastMessageType, ToastPlacement } from "../../../../services/common.service";
import { AlertController } from "ionic-angular/components/alert/alert-controller";
import { FirebaseService } from "../../../../services/firebase.service";
import { SharedServices } from "../../../services/sharedservice";
import { LeagueParticipantModel, LeaguesForParentClubModel, LeagueStandingModel } from "../models/league.model";
import gql from "graphql-tag";
import { GraphqlService } from "../../../../services/graphql.service";
import { HttpService } from "../../../../services/http.service";
import { DatePipe } from "@angular/common";
import { LeagueMatch } from "../models/location.model";
import { API } from "../../../../shared/constants/api_constants";
import { AppType } from "../../../../shared/constants/module.constants";


/**
 * Generated class for the LeaguedetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-leaguedetails",
  templateUrl: "leaguedetails.html",
  providers: [HttpService, DatePipe]
})
export class LeaguedetailsPage {
  @ViewChild('fab') fab: FabContainer;
  TeamsType: boolean = true;
  MatchesType: boolean = true;
  league: LeaguesForParentClubModel;
  parentClubKey: string;
  activeIndex: any;
  currencyDetails: any;
  match: LeagueMatch[];
  leagueStandingInput: LeagueStandingInput = {
    ParentClubKey: "",
    MemberKey: "",
    AppType: 0,
    ActionType: 0,
    DeviceType: 0,
    LeagueId: ""
  }


  removeParticipantInput: RemoveParticipantInput = {
    leagueId: "",
    participantId: "",
    user_device_metadata: new UserDeviceMetadataField
  }

  league_id: string;
  individualLeague: LeaguesForParentClubModel;
  leagueStanding: LeagueStandingModel[];
  partcipantData: LeagueParticipantModel[] = [];
  inclusionList: Array<String> = ["", " ", "-", ".", "..", "...", "A", "adhd", "fit", "good", "great", "healthy",
    "n", "n/a", "N/a", "na", "Na", "NA", "nil", "no", "No", "no e", "nobe", "non", "not applicable", "none", "nope", "None", "None ", "Non", "None\n", "None\n\n", "Nope", "nothing", "Nothing", "ok", "Ok", "okay", "no problem",
    "Best", "best", "Good", 'good', 'good '
  ];

  inclusionSet: Set<String> = new Set<String>(this.inclusionList);

  commonInput = {
    parentclubId: "",
    clubId: "",
    activityId: "",
    memberId: "",
    action_type: 0,
    device_type: 0,
    league_id: ""
  }

  isPublish: boolean = false;
  isPending: boolean = false;
  startDate: string;
  startTime: string;
  matchesLength: number;
  partcipantDataCount: number;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public platform: Platform,
    public popoverCtrl: PopoverController,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public storage: Storage,
    public fb: FirebaseService,
    public sharedservice: SharedServices,
    public actionSheetCtrl: ActionSheetController,
    public modalCtrl: ModalController,
    private graphqlService: GraphqlService,
    private httpService: HttpService,
    
  ) {
    // this.league = this.navParams.get("league");
    // console.log(this.league);
    this.commonInput.parentclubId = this.sharedservice.getPostgreParentClubId();


  }


  ionViewDidLoad() {
    console.log("ionViewDidLoad LeaguedetailsPage");
    this.activeIndex = "0";
  }

  ionViewDidEnter() {
    this.closeFab();
  }

  closeFab() {
    if (this.fab) {
      this.fab.close();
    }
  }

  async ionViewWillEnter() {
    this.league_id = this.navParams.get("league_id");
    console.log("teams are", this.league_id);
    const [userobj, currency] = await Promise.all([
      this.storage.get("userObj"),
      this.storage.get('Currency')
    ])
    this.currencyDetails = JSON.parse(currency);
    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        //for points table
        this.leagueStandingInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
        this.leagueStandingInput.MemberKey = val.$key;
        this.leagueStandingInput.LeagueId = this.league_id;
        this.removeParticipantInput.leagueId = this.league_id;

      }
      // this.getRoleForPlayers();
      this.teamStanding();
      this.getLeagueDetails();
      this.getLeagueMatches();
      // this.teamStanding();
      // this.getLeagueParticipants();
      // this.getLeaguesForParentClub();
      // this.getLeagueMatches();
    });

  }

  getLeagueDetails = () => {
    //fetching leagues
    this.commonService.showLoader("Fetching data...");
    const leaguesforparentclubQuery = gql`
      query getLeagueById($leagueId: String!) {
        getLeagueById(leagueId: $leagueId) {
          id
          created_at
          created_by
          updated_at
          is_active
          league_name
          activity {
            Id
            ActivityName
            ActivityCode
          }
          parentClub{
            FireBaseId
          }
          league_type
          league_category
          league_age_group
          league_logo_url
          league_description
          start_date
          end_date
          league_visibility

          club{
            Id
            ClubName
            FirebaseId
          }

          coach{
            Id
            first_name
            last_name
            email_id
            phone_no
          }

          location_id
          location_type
          league_type_text
          venue{
            VenueId
            PostCode
            VenueName
          
          }
        
         last_enrollment_date
         last_withdrawal_date
         early_arrival_time
         start_time
         end_time
         capacity
         capacity_left
         referee_type
         referee_name
         season
         grade
         rating_group
         contact_email
         contact_phone
        secondary_contact_email
        secondary_contact_phone
        is_paid
        member_price
        non_member_price
        is_pay_later
        league_visibility
        allow_bacs
        allow_cash
        show_participants
       
        }
      }
    `;
    this.graphqlService.query(leaguesforparentclubQuery, { leagueId: this.league_id }, 0).subscribe((res: any) => {
      this.commonService.hideLoader();
      this.individualLeague = res.data.getLeagueById;
      if (this.individualLeague.league_type != 3) {
        this.getLeagueParticipants(); // if league type is not team then fetch participants
      }
    },
      (error) => {
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
  };

  gotoLeagueMatchInfoPage(mat: LeagueMatch) {
    this.navCtrl.push("LeagueMatchInfoPage", { "match": mat, "leagueId": this.individualLeague.id, "activityCode": this.individualLeague.activity.ActivityCode, "activityId": this.individualLeague.activity.Id, "existingteam": this.leagueStanding.map(league_team => league_team.parentclubteam) });
    // this.navCtrl.push("LeagueMatchInfoPage", { "leagueId": this.individualLeague.id, "activityId": this.individualLeague.activity.Id, "existingteam": this.partcipantData });
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent,
    });
  }

  gotoMatchDetails(match: LeagueMatch) {
    // this.navCtrl.push("LeaguematchdetailsPage");
    //this.navCtrl.push("UpdateleaguematchPage", { leagueId: this.individualLeague.id });
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: "Manage Teams",
          handler: () => {
            this.gotoManageTeamsPage();
          }
        },
        {
          text: "Edit Match",
          handler: () => {
            this.gotoEditPage(match);
          }
        },
        {
          text: "Delete",
          handler: () => {
            this.removeMatch(match)
          }
        },
        {
          text: "Update Result",
          handler: () => {
            this.updateResult(match);
          }
        }
      ]
    });
    actionSheet.present();

  }

  gotoEditPage(match: LeagueMatch) {
    // this.navCtrl.push("EditmatchPage", { 
    //   leagueId: this.individualLeague.id,
    //   matchId: match.fixture_id,
    //   leagueStartDate: this.individualLeague.start_date,
    //   leagueEndDate: this.individualLeague.end_date,
    //   location_id: this.individualLeague.location_id,
    //   location_type: this.individualLeague.location_type,
    //   league_type_text: this.individualLeague.league_type_text
    // });
    this.navCtrl.push("UpdateleaguematchPage", { match });
  }

  gotoManageTeamsPage() {
    this.navCtrl.push("ManageLeagueTeamsPage");
  }


  removeMatch(mat: LeagueMatch) {
    const message = 'Are you sure you want to delete the match?'
    let confirm = this.alertCtrl.create({
      title: 'Delete match',
      message: message,
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
            // this.deleteteam(team);
            this.removeLeagueMatch(mat);
          }
        }
      ]
    });
    confirm.present();

  }

  removeLeagueMatch(mat: LeagueMatch) {
    const commonInput = {
      leagueFixtureId: ""
    }
    commonInput.leagueFixtureId = mat.fixture_id;
    this.httpService.post(API.DELETE_LEAGUE_MATCHES, commonInput).subscribe((res: any) => {
      const message = "Match deleted successfully";
      this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
      console.log("match deleted", res);
      this.getLeagueMatches();
    }, (error) => {
      this.commonService.toastMessage("Match fetch failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    }
    )
  }

  updateResult(match: LeagueMatch) {
    this.navCtrl.push("LeaguematchresultPage", { leagueMatch: match });
  }
  
  creatematchleaguePage() {
    this.navCtrl.push("CreatematchleaguePage", {
      leagueStartDate: this.individualLeague.start_date,
      leagueEndDate: this.individualLeague.end_date,
      leagueId: this.individualLeague.id, leagueName: this.individualLeague.league_name,
      location_id: this.individualLeague.location_id,
      location_type: this.individualLeague.location_type,
      league_type_text: this.individualLeague.league_type_text
    });
  }

  autoCreateMatch() {
    this.navCtrl.push("AutocreatematchPage", {
      leagueId: this.individualLeague.id,
      leagueDate: this.individualLeague.start_date,
      leagueTime: this.individualLeague.start_time,
      location_id: this.individualLeague.location_id,
      location_type: this.individualLeague.location_type,
      activityId: this.individualLeague.activity.Id,
    });
  }

  formatMatchStartDate(date) {
    return moment(+date).format("DD-MMM-YYYY");
  }

  changeType(index) {
    this.activeIndex = index;
  }



  gotoTeamsquadPage() {
    this.navCtrl.push("TeamsquadPage");
  }





  presentActionSheet() {
    let actionSheet = this.actionSheetCtrl.create({
      title: "Do you want to cancel the invite?",
      buttons: [
        {
          text: "Yes",
          role: "destructive",
          icon: "checkmark",
          handler: () => {
            // this.invite(selectedparticipant);
          },
        },
        {
          text: "No",
          role: "cancel",
          icon: "close",
          handler: () => {
            console.log("Cancel clicked");
          },
        },
      ],
    });

    actionSheet.present();
  }

  ActionSheet(participant: LeagueParticipantModel) {
    const actionType = participant.amount_pay_status === 0 ? 1 : 2;
    const actionText = participant.amount_pay_status === 0 ? 'Remove' : 'Withdraw';

    let buttons = [
      {
        text: 'Update Payment',
        handler: () => {
          this.updatePayment(participant);
        }
      },
      {
        text: 'Profile',
        handler: () => {
          this.getProfile(participant);
        }
      },
      {
        text: 'Send Email',
        handler: () => {
          this.sendEmailToMember(participant);
        }
      }
    ];

    // Conditionally add the "Withdraw" button
    if (participant.participant_status_text !== 'Withdrawn') {
      buttons.push({
        text: actionText,
        handler: () => {
          this.removeTeam(participant, actionType);
        }
      });
    }

    // Create the ActionSheet with the dynamic buttons array
    let actionSheet = this.actionSheetCtrl.create({
      buttons: buttons
    });

    // Present the ActionSheet
    actionSheet.present();
  }

  gotoTeamDetails(team) {
    this.navCtrl.push("TeamdetailsPage", {
      "team": team.parentclubteam,

    })

  }



  sendNotificationToTeam(team) { }

  sendMailToPlayer(team) { }

  chatConv(team) {
    this.navCtrl.push("TeamchatPage", { teams: team })
  }
  
  gotoEditLeague() {
    this.navCtrl.push("EditleaguePage", { "individualleague": this.individualLeague });
    console.log("editLeague");
  }

  gotoAddteamtoleaguePage() {
    if (this.individualLeague.league_type == 1 || this.individualLeague.league_type == 2) {
      this.navCtrl.push("AddingtornamentmemberPage",
        {
          league: this.individualLeague.id,
          capacity_left: this.individualLeague.capacity_left,
          league_member: this.partcipantData.map(member => member.participant_details.user_id)
        })
    } if (this.individualLeague.league_type == 3) {
      this.navCtrl.push("AddteamPage", { "leagueId": this.individualLeague.id, "activityId": this.individualLeague.activity.Id, "existingteam": this.leagueStanding.map(league_team => league_team.parentclubteam) });
    }
  }

  removeLeague() {
    let confirm = this.alertCtrl.create({
      title: 'Delete league',
      message: 'Are you sure you want to delete the league? ',
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
            this.deleteLeague();
          }
        }
      ]
    });
    confirm.present();
  }

  deleteLeague() {

    try {
      const removeLeague = gql`
      
      mutation deleteLeague($leagueInput: String!){
        deleteLeague(leagueInput:$leagueInput)
      }
      
      `;
      const deleteVariable = { leagueInput: this.league_id }

      this.graphqlService.mutate(
        removeLeague, deleteVariable, 0
      ).subscribe((response) => {
        const message = "Competition deleted successfully";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.commonService.updateCategory("leagueteamlisting");
        this.navCtrl.pop()
      },
        (error) => {
          console.error("GraphQL mutation error:", error);
          this.commonService.toastMessage("Staff deletion failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        }
      )
    } catch (err) {
      console.log("An error occurred:", err)
    }

  }


  removeTeam(team: LeagueParticipantModel | LeagueStandingModel, actionType: number) {
    let message: string;
    let part: LeagueParticipantModel | LeagueStandingModel;

    if (this.individualLeague.league_type_text != 'Team') {
      // Handle LeagueParticipantModel
      part = team as LeagueParticipantModel; // Type assertion
      message = part.amount_pay_status === 0
        ? 'Are you sure you want to remove the participant?'
        : 'Are you sure you want to withdraw the participant?';
    } else {
      // Handle LeagueStandingModel
      part = team as LeagueStandingModel; // Type assertion
      message = 'Are you sure you want to remove this team from the standings?';
    }

    let confirm = this.alertCtrl.create({
      title: 'Remove Participant',
      message: message,
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
            // this.deleteteam(team);
            this.removeMember(part, actionType);
          }
        }
      ]
    });
    confirm.present();

  }



  removeMember(data: LeagueParticipantModel | LeagueStandingModel, actionType: number) {
    // await this.WeeklyEmailCancelConfirmation(data);
    this.removeParticipantInput.participantId = data.id;
    this.removeParticipantInput.user_device_metadata.UserActionType = actionType
    this.removeParticipantInput.user_device_metadata.UserAppType = AppType.ADMIN_NEW;
    this.commonService.showLoader("Please wait...");
    try {

      const cancel_member = gql`
         mutation removeParticipantFromLeague($teamRemovalDetails: RemoveParticipantInput!) {
          removeParticipantFromLeague(teamRemovalDetails: $teamRemovalDetails) 
             
         }`;

      const cancel_member_variable = { teamRemovalDetails: this.removeParticipantInput };

      this.graphqlService.mutate(
        cancel_member,
        cancel_member_variable,
        0
      ).subscribe((response) => {
        this.commonService.hideLoader();
        const message = actionType === 1 ? "Member removed successfully" : "Member withdrawal successfully";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        // this.weeklySessionDetails();
        this.individualLeague.league_type_text != 'Team' ? this.getLeagueParticipants() : this.teamStanding();
        this.getLeagueDetails();
      }, (err) => {
        this.commonService.hideLoader();

        console.error("GraphQL mutation error:", err);
        this.commonService.toastMessage("Member deletion failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      });

    } catch (error) {
      console.error("An error occurred:", error);
    }
  }

  deleteteam(team: LeagueParticipantModel) {
    console.log("remove participant API called");
    try {

      this.removeParticipantInput.participantId = team.id;
      const delete_Team = gql`
      mutation  removeParticipantFromLeague($teamRemovalDetails: RemoveParticipantInput!){
        removeParticipantFromLeague(teamRemovalDetails:$teamRemovalDetails)
      }
      `;
      const deleteVariable = { teamRemovalDetails: this.removeParticipantInput }

      this.graphqlService.mutate(delete_Team, deleteVariable, 0).subscribe((response) => {
        const message = "Team deleted successfully";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.getLeagueParticipants();
      }, (err) => {
        console.error("GraphQL mutation error:", err);
        this.commonService.toastMessage("Team deletion failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
      )
    } catch (error) {

      console.error("An error occurred:", error);

    }

  }

  async getProfile(session_member: LeagueParticipantModel) {
    try {
      let parent_id = "";
      if (session_member.participant_details.is_child) {
        if (session_member.participant_details.parent_id && session_member.participant_details.parent_id != "" && session_member.participant_details.parent_id != "-" && session_member.participant_details.parent_id != "n/a" &&
          session_member.participant_details.parent_id !== null
        ) {
          parent_id = session_member.participant_details.parent_id;
        } else {
          this.commonService.toastMessage("parentid not available", 2500, ToastMessageType.Error);
          return false;
        }
      } else {
        parent_id = session_member.participant_details.user_id
      }

      this.navCtrl.push("MemberprofilePage", {
        member_id: parent_id,
        type: 'Member'
      })
      this.commonService.updateCategory("user_profile");
    } catch (err) {
      this.commonService.toastMessage("Something went wrong", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    }
  }



  async teamStanding() {
    const participantsStatusQuery = gql`
    query getLeagueORTournamentStanding( $leagueStandingInput: LeagueStandingInput! ) {
      getLeagueORTournamentStanding(leagueStandingInput:$leagueStandingInput) {
        id
        parentclubteam{      
               id
               teamName
               ageGroup
                teamVisibility
                teamDescription
              }
        wins
        loss
        rank
        total_points
        draw
      }
    }
  `;
    this.graphqlService.query(participantsStatusQuery, { leagueStandingInput: this.leagueStandingInput }, 0).subscribe((data) => {
      this.leagueStanding = data.data.getLeagueORTournamentStanding;
      console.log("league standing data is:", JSON.stringify(this.leagueStanding));
    },
      (error) => {
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



  tDetails(team: LeagueStandingModel) {
    this.navCtrl.push("TeamdetailsPage", {
      "team": team.parentclubteam,
      // teamName:team.parentclubteam.teamName,
      // venue:team.parentclubteam.venue.VenueName,
      // ageGroup:team.parentclubteam.ageGroup,
      // visibility:team.parentclubteam.teamVisibility,
    })
  }

  openTeamActions(team: LeagueStandingModel) {
    this.navCtrl.push("LeaguematchdetailsPage");
    //this.navCtrl.push("UpdateleaguematchPage", { leagueId: this.individualLeague.id });

    let actionSheet = this.actionSheetCtrl.create({

      buttons: [
        {
          text: "View Team",
          handler: () => {
            this.navCtrl.push("TeamdetailsPage", {
              "team": team.parentclubteam
            })
          }
        },
        {
          text: "Remove Team",
          handler: () => {
            this.removeTeam(team, 1)
          }
        }
      ]
    });
    actionSheet.present();

  }

  //Get teams for a league
  getLeagueParticipants() {
    const parentclubId = this.sharedservice.getPostgreParentClubId();
    let leagueId = this.league_id;
    const GetLeagueParticipantInput = {
      user_postgre_metadata: {
        UserParentClubId: parentclubId
      },
      leagueId: leagueId
    }
    const participantsStatusQuery = gql`
    query getLeagueParticipants($leagueParticipantInput: GetLeagueParticipantInput!) {
      getLeagueParticipants(leagueParticipantInput:$leagueParticipantInput) {
      
        id
        participant_name
        
        matches
        wins
        loss
        draw
        rank
        points
        amount_pay_status
        amount_pay_status_text
        paidby
        paidby_text
        paid_amount
        amount_due
        paid_on
        participant_status_text
        participant_details{
          user_id
        is_child
        is_enable
        parent_id
        email
        contact_email
        parent_email
        media_consent
        is_enable
        first_name
        last_name
        dob
        parent_phone_number
        medical_condition
      
        }
        
      }
    }
  `;

    this.graphqlService.query(participantsStatusQuery, { leagueParticipantInput: GetLeagueParticipantInput }, 0).subscribe((data: any) => {
      this.partcipantData = data.data.getLeagueParticipants;
      if (this.partcipantData != null) this.partcipantDataCount = this.partcipantData.length;
      console.log("participants are", JSON.stringify(this.partcipantData));
    },
      (error) => {
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

  updatePayment(participant: LeagueParticipantModel) {
    this.navCtrl.push("LeaguepaymentPage", { SelectedMember: participant, SessionDetails: this.individualLeague })
  }

  sendEmailToMember(participant: LeagueParticipantModel) {
    const member = this.prepareParticipantData(participant);
    const session = this.prepareSessionDetails();

    const email_modal = {
      module_info: session,
      email_users: [member],  // Send as an array with a single member
      type: 600
    };

    this.navCtrl.push("MailToMemberByAdminPage", { email_modal });
    // this.navCtrl.push("TournamentmailPage", { member: participant });
  }

  prepareParticipantData(participant: LeagueParticipantModel) {
    return {
      IsChild: participant.participant_details.is_child ? true : false,
      ParentId: participant.participant_details.is_child ? participant.participant_details.parent_id : "",
      MemberId: participant.id,
      MemberEmail: participant.participant_details.email != "" && participant.participant_details.email != "-" && participant.participant_details.email != "n/a" ? participant.participant_details.email : (participant.participant_details.is_child ? participant.participant_details.parent_email : ""),
      MemberName: participant.participant_details.first_name + " " + participant.participant_details.last_name
    };
  }

  prepareSessionDetails() {
    return {
      module_booking_club_id: this.individualLeague.club.Id,
      module_booking_club_name: this.individualLeague.club.ClubName,
      module_booking_coach_id: this.individualLeague.coach.Id,
      module_booking_coach_name: this.individualLeague.coach.first_name + " " + this.individualLeague.coach.last_name,
      module_id: this.individualLeague.id,
      module_booking_name: this.individualLeague.league_name,
      module_booking_start_date: this.individualLeague.start_date,
      module_booking_end_date: this.individualLeague.end_date,
      module_booking_start_time: this.individualLeague.start_time,
    };
  }

  //sending an email to 
  async sendEmail() {
    //console.log(this.sessionDetails);         
    const member_list = this.partcipantData.map((member) => this.prepareParticipantData(member));
    if (member_list.length > 0) {
      const session = this.prepareSessionDetails();
      const email_modal = {
        module_info: session,
        email_users: member_list,
        type: 600
      };
      this.navCtrl.push("MailToMemberByAdminPage", { email_modal });
    } else {
      this.commonService.toastMessage("No participant(s) found", 2500, ToastMessageType.Error);
    }
  }

  calculateAge(dob) {
    const now = new Date();
    const birthDate = new Date(dob);

    // Calculate the difference in years
    let age = now.getFullYear() - birthDate.getFullYear();
    const monthDifference = now.getMonth() - birthDate.getMonth();
    const dayDifference = now.getDate() - birthDate.getDate();

    // Adjust age if the current date is before the birth date in the current year
    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
      age--;
    }
    return age;
  }

  getLeagueMatches() {
    this.commonInput.league_id = this.league_id;
    this.httpService.post(API.GET_LEAGUE_MATCHES, this.commonInput).subscribe((res: any) => {
      // this.match = res["data"];
      // console.log("match data is:", this.match);

      // for(let i=0;i<this.match.length;i++){
      //   [this.startDate,this.startTime]=this.match[i].start_date.split(' ');
      // }
      this.match = res.data;
      // this.match = res.data.map(match => ({
      //   ...match,
      //   start_date: this.datePipe.transform(match.start_date, 'dd-MMM-yyyy,HH:mm') || 'Invalid date'
      // }));
      this.matchesLength = this.match.length;
    }, (error) => {
      this.commonService.toastMessage("match fetch failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    })
  }

  showMatchActionSheet(match: LeagueMatch) {
    if( this.individualLeague.league_type === 3) {
      this.commonService.showMatchActionSheet(match, {
          onViewDetails: () => this.gotoLeagueMatchInfoPage(match),//this.gotoLeagueMatchInfoPage(match),
          onEdit: () => this.navCtrl.push("UpdateleaguematchPage", { match }),
          // onDelete: () => this.removeMatch(match),
          // onUpdateResult: () => this.updateResult(match)
      });
    }else{
      this.gotoMatchDetails(match);
    }
  }



  showVisibilityOptions(event) {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Change League Visibility',
      buttons: [
        {
          text: 'Public',
          icon: 'ios-globe',
          handler: () => {
            if (this.individualLeague.league_visibility && this.individualLeague.league_visibility !== 0) {
              this.modifyLeagueVisibility(0);
            }
          }
        },
        {
          text: 'Private', 
          icon: 'ios-lock-outline',
          handler: () => {
            if (this.individualLeague.league_visibility && this.individualLeague.league_visibility !== 1) {
              this.modifyLeagueVisibility(1);
            }
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }

  
  modifyLeagueVisibility(visibility: number) {
    const modifyLeagueMutation = gql`
      mutation modifyLeague($leagueInput: LeagueEditInput!) {
        modifyLeague(leagueInput: $leagueInput) {
          id
          league_visibility
        }
      }
    `;

    const leagueInput = {
      id: this.league_id,
      league_visibility: visibility
    };

    this.commonService.showLoader('Updating visibility...');
    
    this.graphqlService.mutate(modifyLeagueMutation, { leagueInput }, 0)
      .subscribe((response: any) => {
        this.commonService.hideLoader();
        if (response.data.modifyLeague) {
          this.individualLeague.league_visibility = visibility;
          const visibilityText = visibility === 0 ? 'Public' : 'Private';
          this.commonService.toastMessage(`League visibility changed to ${visibilityText}`,2500,ToastMessageType.Success,ToastPlacement.Bottom);
        }
      }, (error) => {
        this.commonService.hideLoader();
        if (error.graphQLErrors) {
          error.graphQLErrors.forEach((e: any) => {
            this.commonService.toastMessage(e.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          });
        }else{
          this.commonService.toastMessage('Failed to update league visibility',2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }
      });
  }




}

export class GetLeagueParticipantInput {
  ParentClubKey: string
  MemberKey: string
  AppType: number
  ActionType: number
  DeviceType: number
  leagueId: string

}


export class LeagueStandingInput {
  ParentClubKey: string
  MemberKey: string
  AppType: number
  ActionType: number
  DeviceType: number
  LeagueId: string
}

export class RemoveParticipantInput {

  leagueId: string
  participantId: string

  user_device_metadata: UserDeviceMetadataField
}


export class UserDeviceMetadataField {
  UserAppType: number
  UserActionType: number

}


