import { Component, Renderer2, ViewChild } from "@angular/core";
import { ActionSheetController, IonicPage, LoadingController, NavController, NavParams, AlertController, ModalController, FabContainer } from "ionic-angular";
import { Storage } from "@ionic/storage";
import { SharedServices } from "../../../services/sharedservice";
import { FirebaseService } from "../../../../services/firebase.service";
import { CommonService, ToastMessageType, ToastPlacement } from "../../../../services/common.service";
import { Apollo } from "apollo-angular";
import moment from "moment";
import gql from "graphql-tag";
import { first } from "rxjs/operators";
import { GraphqlService } from "../../../../services/graphql.service";
import { error } from "console";
import { AllMatchData, GetIndividualMatchParticipantModel, MatchModelV2, } from "../../../../shared/model/match.model";
import { LeagueMatchActionType, MatchType } from "../../../../shared/utility/enums";
import { API } from "../../../../shared/constants/api_constants";
import { HttpService } from "../../../../services/http.service";
import { AppType } from "../../../../shared/constants/module.constants";
import { TeamsForParentClubModel } from "../../league/models/team.model";
/**
 * Generated class for the MatchTeamDetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-match_team_details",
  templateUrl: "match_team_details.html",
  providers: [HttpService]

})
export class MatchTeamDetailsPage {
  @ViewChild('fab') fab: FabContainer;
  currencyDetails: any;
  activeType: boolean = true;
  selectedHomeTeamText: string;
  selectedAwayTeamText: string;

  getIndividualMatchParticipantRes: GetIndividualMatchParticipantModel[] = [];
  match: AllMatchData;
  // homeTeamPlayers: TeamMemberData[] = [];
  // awayTeamPlayers: TeamMemberData[] = [];
  parentClubKey: string;
  activitySpecificTeamsRes: TeamsForParentClubModel[] = [];
  selectedTeam: TeamsForParentClubModel;
  getIndividualMatchParticipantInput: GetIndividualMatchParticipantInput = {
    parentclubId: "",
    clubId: "",
    activityId: "",
    memberId: "",
    action_type: 0,
    device_type: 0,
    app_type: 0,
    device_id: "",
    updated_by: "",
    MatchId: "",
    TeamId: "",
    leagueTeamPlayerStatusType: 0
  }
  getActivitySpecificTeamInput: GetActivitySpecificTeamInput = {
    parentclubId: "",
    clubId: "",
    activityId: "",
    memberId: "",
    action_type: 0,
    device_type: 0,
    app_type: 0,
    device_id: "",
    updated_by: ""
  }
  updateTeamInput: UpdateTeamInput = {
    parentclubId: "",
    clubId: "",
    activityId: "",
    memberId: "",
    action_type: 0,
    device_type: 0,
    app_type: 0,
    device_id: "",
    updated_by: "",
    LeagueId: "",
    MatchId: "",
    HomeParticipantId: "",
    AwayParticipantId: "",
    HomeParentclubTeamId: "",
    AwayParentclubTeamId: ""
  }
  // sections: { title: string; items: any[] }[] = [
  sections: { title: string; items: GetIndividualMatchParticipantModel[] }[] = [
    {
      title: 'Playing Squad',
      items: []
    },
    {
      title: 'Bench',
      items: []
    },
    {
      title: 'Remaining Players',
      items: []
    }
  ];


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public storage: Storage,
    public fb: FirebaseService,
    public sharedservice: SharedServices,
    public actionSheetCtrl: ActionSheetController,
    private graphqlService: GraphqlService,
    private httpService: HttpService,
    private renderer: Renderer2,// Inject Renderer2


  ) {
    this.match = JSON.parse(this.navParams.get("match"));
    console.log('MATCH OBJ', this.match);
    console.log('MATCH OBJ', this.match.activityId);
    this.selectedHomeTeamText = this.match.homeUserName != null ? this.match.homeUserName : 'Home Team';
    this.selectedAwayTeamText = this.match.awayUserName != null ? this.match.awayUserName : 'Away Team';
    this.storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);
    });
    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey
        this.getActivitySpecificTeamInput.parentclubId = this.sharedservice.getPostgreParentClubId();
        this.getActivitySpecificTeamInput.memberId = this.sharedservice.getLoggedInId();
        this.getActivitySpecificTeamInput.action_type = LeagueMatchActionType.MATCH;
        this.getActivitySpecificTeamInput.app_type = AppType.ADMIN_NEW;
        this.getActivitySpecificTeamInput.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;
        // Defensive check for required match properties
        if (!this.match.activityId) {
          console.error('Match activityId is missing:', this.match);
          this.commonService.toastMessage('Match activity data is missing', 3000, ToastMessageType.Error);
          this.navCtrl.pop();
          return;
        }

        this.getActivitySpecificTeamInput.activityId = this.match.activityId;

        this.getIndividualMatchParticipantInput.parentclubId = this.sharedservice.getPostgreParentClubId();
        this.getIndividualMatchParticipantInput.memberId = this.sharedservice.getLoggedInId();
        this.getIndividualMatchParticipantInput.action_type = LeagueMatchActionType.MATCH;
        this.getIndividualMatchParticipantInput.app_type = AppType.ADMIN_NEW;
        this.getIndividualMatchParticipantInput.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;
        this.getIndividualMatchParticipantInput.activityId = this.match.activityId;
        this.getIndividualMatchParticipantInput.MatchId = this.match.MatchId;
        this.getIndividualMatchParticipantInput.TeamId = this.match.homeUserId; // Default to Home Team
        this.getIndividualMatchParticipantInput.leagueTeamPlayerStatusType = 0; // Default to All


        this.updateTeamInput.parentclubId = this.sharedservice.getPostgreParentClubId();
        this.updateTeamInput.memberId = this.sharedservice.getLoggedInId();
        this.updateTeamInput.action_type = LeagueMatchActionType.MATCH;;
        this.updateTeamInput.app_type = AppType.ADMIN_NEW;
        this.updateTeamInput.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;
        this.updateTeamInput.LeagueId = ''
        this.updateTeamInput.MatchId = this.match.MatchId;
        this.getActivitySpecificTeam();
        this.getIndividualMatchParticipant();
      }
    });
  }
  publish() {
    this.closeFab();
    const homeTeam = this.getIndividualMatchParticipantRes.find(team => team.Team.teamName === this.selectedHomeTeamText);
    const awayTeam = this.getIndividualMatchParticipantRes.find(team => team.Team.teamName === this.selectedAwayTeamText);
    console.log("Selected Home Team:", homeTeam);
    console.log(this.selectedHomeTeamText);
    console.log(this.selectedAwayTeamText);
    this.selectedHomeTeamText != 'Home Team' ||
      this.selectedAwayTeamText != 'Away Team' ?
      this.navCtrl.push("PublishFootballPage", {
        "match": this.match, "homeTeam": homeTeam,
        "awayTeam": awayTeam,
      }) :
      this.commonService.toastMessage('Select Home and Away Teams', 3000, ToastMessageType.Info,);
  }

  closeFab() {
    if (this.fab) {
      this.fab.close();
    }
  }
  ionViewDidLoad() {
    console.log("ionViewDidLoad MatchTeamDetailsPage");
  }
  formatMatchStartDate(date) {
    return moment(date, "YYYY-MM-DD HH:mm").local().format("DD-MMM-YYYY hh:mm A");
  }

  onEnterSection(sectionIndex: number) {
    const dropZone = document.querySelectorAll('.drop-zone')[sectionIndex];
    if (dropZone) {
      this.renderer.addClass(dropZone, 'drag-over'); // Use Renderer2 to add class
    }
  }

  onDragLeaveSection(sectionIndex: number) {
    const dropZone = document.querySelectorAll('.drop-zone')[sectionIndex];
    if (dropZone) {
      this.renderer.removeClass(dropZone, 'drag-over'); // Use Renderer2 to remove class
    }
  }

  onDragStart(event: any, item: any, sectionIndex: number) {
    // if (this.leagueMatchParticipantInput.leagueTeamPlayerStatusType === LeagueTeamPlayerStatusType.All) {
    event.dataTransfer.setData('text/plain', JSON.stringify({ item, sectionIndex }));
    event.dataTransfer.effectAllowed = 'move'; // Ensure the effect is allowed
    // } else {
    //   this.commonService.toastMessage('Please select "All" filter to drag and drop', 3000, ToastMessageType.Info);
    //   event.preventDefault(); // Prevent the drag from starting
    // }
  }

  onDragEnd(event: any) {
    const dropZones = document.querySelectorAll('.drop-zone');
    dropZones.forEach(dropZone => this.renderer.removeClass(dropZone, 'drag-over')); // Use Renderer2 to remove class
  }

  onDrop(event: any, sectionIndex: number) {
    event.preventDefault();
    const data = JSON.parse(event.dataTransfer.getData('text/plain')); // Ensure correct data type
    const item = data.item;
    const fromSectionIndex = data.sectionIndex;

    if (fromSectionIndex !== sectionIndex) {
      this.sections[fromSectionIndex].items = this.sections[fromSectionIndex].items.filter(i => i.id !== item.id);
      this.sections[sectionIndex].items.push(item);

      // let newParticipantStatus: LeagueParticipationStatus;

      // if (sectionIndex === 0) {
      //   newParticipantStatus = LeagueParticipationStatus.PARTICIPANT;
      // } else if (sectionIndex === 1) {
      //   newParticipantStatus = LeagueParticipationStatus.NON_PARTICIPANT;
      // } else {
      //   newParticipantStatus = LeagueParticipationStatus.PENDING;
      // }

      // this.updateLeagueMatchParticipationStatus(item.participant_status, newParticipantStatus, { participationId: item.id });

    }
    this.onDragLeaveSection(sectionIndex);
  }

  getFilteredSections(): { title: string; items: any[] }[] {
    // getFilteredSections(): { title: string; items: LeagueMatchParticipantModel[] }[] {
    // if (this.leagueMatchParticipantInput.leagueTeamPlayerStatusType === LeagueTeamPlayerStatusType.All) {
    //   // Show all sections
    //   return this.sections;
    // } else if (this.leagueMatchParticipantInput.leagueTeamPlayerStatusType === LeagueTeamPlayerStatusType.PLAYING) {
    //   // Only show the "Playing Squad" section
    //   return this.sections.filter(section => section.title === 'Playing Squad');
    // } else if (this.leagueMatchParticipantInput.leagueTeamPlayerStatusType === LeagueTeamPlayerStatusType.BENCH) {
    //   // Only show the "Bench" section
    //   return this.sections.filter(section => section.title === 'Bench');
    // }
    // Default: show all
    return this.sections;
  }

  showAvailableTeams(isHomeTeam: boolean): void {
    this.closeFab();
    if (this.activitySpecificTeamsRes.length > 0) {
      // console.log(this.leagueParticipantForMatchRes);
      let alert = this.alertCtrl.create();
      alert.setTitle(`Select Team`);

      for (let userIndex = 0; userIndex < this.activitySpecificTeamsRes.length; userIndex++) {
        alert.addInput({
          type: 'radio',
          label: this.activitySpecificTeamsRes[userIndex].teamName,
          value: this.activitySpecificTeamsRes[userIndex].id,
          checked: isHomeTeam ? this.activitySpecificTeamsRes[userIndex].teamName == this.selectedHomeTeamText : this.activitySpecificTeamsRes[userIndex].teamName == this.selectedAwayTeamText
        });
      }

      alert.addButton('Cancel');
      alert.addButton({
        text: 'OK',
        handler: (selectedVal) => {
          console.log('Selected Value:', selectedVal);
          if (!selectedVal) {
            this.commonService.toastMessage("Please select a team", 3000, ToastMessageType.Info);
            return false; // prevent alert from dismissing          
          }
          this.selectedTeam = this.activitySpecificTeamsRes.find(team => team.id === selectedVal);



          if (isHomeTeam) {
            if (this.selectedTeam.teamName === this.selectedAwayTeamText) {
              this.commonService.toastMessage("Home and away teams can't be same", 3000, ToastMessageType.Info);
            } else {
              this.selectedHomeTeamText = this.selectedTeam.teamName;
              this.updateTeamInput.HomeParentclubTeamId = selectedVal;
              this.updateTeamInput.AwayParentclubTeamId = ""; //setting the deafult val to ""
            }
          } else {
            if (this.selectedTeam.teamName === this.selectedHomeTeamText) {
              this.commonService.toastMessage("Home and away teams can't be same", 3000, ToastMessageType.Info);
            } else {
              this.selectedAwayTeamText = this.selectedTeam.teamName;
              this.updateTeamInput.AwayParentclubTeamId = selectedVal;
              this.updateTeamInput.HomeParentclubTeamId = ""; //setting the deafult val to ""
            }
          }
          this.updateTeam();
        }
      });

      alert.present();

    } else {
      this.commonService.toastMessage("No teams available", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
    }
  }

  //tab change
  changeType(val: boolean) {
    // this.sections.forEach(section => section.items = []); // Clear the sections array
    this.activeType = val !== undefined ? val : !this.activeType;
    this.getActivitySpecificTeam();
    this.getIndividualMatchParticipant();

    // if (this.activeType && this.matchObj.home_team_id !== null) {
    //   this.getLeagueMatchParticipant(1);
    // } else if (!this.activeType && this.matchObj.away_team_id !== null) {
    //   this.getLeagueMatchParticipant(1);
    // }
    // this.getFilteredSections();
    // console.log('leagueTeamPlayerStatusType:', this.leagueMatchParticipantInput.leagueTeamPlayerStatusType);
  }

  //to fetch list of avilable players of both home & away teams
  getIndividualMatchParticipant() {
    this.httpService.post(`${API.GetIndividualMatchParticipant}`, this.getIndividualMatchParticipantInput).subscribe((res: any) => {
      if (res) {
        this.getIndividualMatchParticipantRes = res.data;
        // this.homeTeamPlayers = this.getTeamsByMatchRes.HomeTeam;
        // this.awayTeamPlayers = this.getTeamsByMatchRes.AwayTeam;
        console.log("GetTeamsByMatch RESPONSE", JSON.stringify(res.data));
        this.populateSections();
      } else {
        console.log("error in fetching",)
      }
    }, error => {
      this.commonService.toastMessage(error.error.message, 3000, ToastMessageType.Error,);
    });
  }

  populateSections() {
    this.getIndividualMatchParticipantRes.forEach(participant => {
      // switch (participant.participant_status) {
      //   case LeagueParticipationStatus.PARTICIPANT: // Playing Squad 1
      //     this.sections[0].items.push(participant);
      //     break;
      //   case LeagueParticipationStatus.NON_PARTICIPANT: // Bench 2
      //     this.sections[1].items.push(participant);
      //     break;
      //   case LeagueParticipationStatus.PENDING: // Remaining Players 0
      // default:
      this.sections[2].items.push(participant);
      // break;
      // }
    });
  }

  //to fetch list of avilable teams
  getActivitySpecificTeam() {
    this.httpService.post(`${API.GET_ACTIVIY_SPECIFIC_TEAM}`, this.getActivitySpecificTeamInput).subscribe((res: any) => {
      if (res) {
        this.activitySpecificTeamsRes = res.data;
        console.log("GET_ACTIVIY_SPECIFIC_TEAM RESPONSE", JSON.stringify(res.data));
      } else {
        console.log("error in fetching",)
      }
    }, error => {
      this.commonService.toastMessage(error.error.message, 3000, ToastMessageType.Error,);
    });
  }

  updateTeam() {
    this.commonService.showLoader("Updating...");
    this.httpService.post(`${API.Update_League_Fixture}`, this.updateTeamInput).subscribe((res: any) => {
      if (res) {
        this.commonService.hideLoader();
        var res = res.message;
        console.log("Update_League_Fixture RESPONSE", JSON.stringify(res));
        this.commonService.toastMessage(res, 3000, ToastMessageType.Success);
        // this.getLeagueMatchParticipant(1);
      } else {
        console.log("error in Update_League_Fixture",)
      }
    },
      (err) => {
        this.commonService.hideLoader();
        if (err.error && err.error.message) {
          this.commonService.toastMessage(err.error.message, 3000, ToastMessageType.Error,);
        } else {
          this.commonService.toastMessage("Failed to update fixture", 3000, ToastMessageType.Error,);
        }
      }
    );
  }




  deleteConfirm() {
    let match_delete_alert = this.alertCtrl.create({
      title: "Do you want to delete the match?",
      buttons: [
        {
          text: "Delete",
          // icon: "checkmark",
          handler: () => {
            this.delete();
          },
        },
        {
          text: "No",
          role: "cancel",
          // icon: "close",
          handler: () => {
            console.log("Cancel clicked");
          },
        },
      ],
    });

    match_delete_alert.present();
  }



  delete() {

    this.commonService.showLoader("Please wait...");
    try {


      const delete_Match = gql`
       mutation deleteMatch($deleteMatchInput: DeleteMatchInput!) {
        deleteMatch(deleteMatchInput: $deleteMatchInput)
      }`
        ;
      const deleteVariable = { deleteMatchInput: { ParentClubKey: this.parentClubKey, MatchId: this.match.MatchId } }

      this.graphqlService.mutate(delete_Match, deleteVariable, 1).subscribe((response) => {
        this.commonService.hideLoader();
        const message = "match deleted successfully";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.commonService.updateCategory("matchlist");
        this.navCtrl.pop().then(() => this.navCtrl.pop().then());

      }, (err) => {
        this.commonService.hideLoader();
        console.error("GraphQL mutation error:", err);
        this.commonService.toastMessage("match deletion failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
      )
    } catch (error) {

      console.error("An error occurred:", error);

    }
  }
}

export class GetIndividualMatchParticipantInput {
  parentclubId: string; // 🏢 Parent club ID
  clubId: string; // 🏟️ Club ID
  activityId: string; // ⚽ Activity ID
  memberId: string; // 👤 Member ID
  action_type: number; // ⚙️ Action type (e.g., LeagueMatchActionType)
  device_type: number; // 📱 Device type (e.g., 1 for Android, 2 for iOS)
  app_type: number; // 📱 App type (e.g., AppType.ADMIN_NEW)
  device_id: string; // 🆔 Device ID
  updated_by: string; // ✍️ User who updated
  MatchId: string; // 🏟️ Match ID
  TeamId: string; // 🏈 Team ID
  leagueTeamPlayerStatusType: number; // 📊 Player status type (e.g., LeagueTeamPlayerStatusType)
}


export class GetActivitySpecificTeamInput {
  parentclubId: string;
  clubId: string;
  activityId: string;
  memberId: string;
  action_type: number;
  device_type: number;
  app_type: number;
  device_id: string;
  updated_by: string;
}

export class UpdateTeamInput {
  parentclubId: string;
  clubId: string;
  activityId: string;
  memberId: string;
  action_type: number;
  device_type: number;
  app_type: number;
  device_id: string;
  updated_by: string;
  LeagueId: string;
  MatchId: string;
  HomeParticipantId: string;
  AwayParticipantId: string;
  HomeParentclubTeamId: string;
  AwayParentclubTeamId: string;
}


