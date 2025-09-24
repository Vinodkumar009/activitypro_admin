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
import { AllMatchData, GetIndividualMatchParticipantModel, } from "../../../../shared/model/match.model";
import { LeagueMatchActionType, MatchType, LeagueParticipationStatus, LeagueTeamPlayerStatusType, LeaguePlayerInviteStatus, ActivityTypeEnum } from "../../../../shared/utility/enums";
import { API } from "../../../../shared/constants/api_constants";
import { HttpService } from "../../../../services/http.service";
import { AppType } from "../../../../shared/constants/module.constants";
import { TeamsForParentClubModel } from "../../league/models/team.model";
import { Role } from "../../team/team.model";
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
  allParticipants: GetIndividualMatchParticipantModel[] = []; // 📊 Store all participants for counting
  match: AllMatchData;
  // homeTeamPlayers: TeamMemberData[] = [];
  // awayTeamPlayers: TeamMemberData[] = [];
  parentClubKey: string;
  activitySpecificTeamsRes: TeamsForParentClubModel[] = [];
  selectedTeam: TeamsForParentClubModel;
  roles: Role[];
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

  updateMatchParticipantRoleInput: UpdateMatchParticipantRoleInput = {
    parentclubId: "",
    clubId: "",
    activityId: "",
    memberId: "",
    action_type: 0,
    device_type: 0,
    app_type: 0,
    device_id: "",
    updated_by: "",
    match_participation_id: "",
    role_id: "",
    role_type: 0
  }

  updateMatchParticipationStatusInput: UpdateMatchParticipationStatusInput = {
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
    ParticipationId: "",
    ParticipationStatus: 0
  }

  teamRolesInput: TeamRolesInput = {
    ParentClubKey: '',
    MemberKey: '',
    AppType: 0,
    ActionType: 0,
    activityCode: 0,
  }

  updateLeagueMatchInviteStatusInput: UpdateLeagueMatchInviteStatusInput = {
    parentclubId: "",
    clubId: "",
    activityId: "",
    memberId: "",
    action_type: 0,
    device_type: 0,
    app_type: 0,
    device_id: "",
    updated_by: "",
    created_by: "",
    MatchId: "",
    ParticipationId: "",
    InviteStatus: 0
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
    this.selectedHomeTeamText = this.match.homeUserName != null ? this.match.homeUserName : 'Home Team';
    this.selectedAwayTeamText = this.match.awayUserName != null ? this.match.awayUserName : 'Away Team';
    this.storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);
    });
    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;

        // Initialize teamRolesInput
        this.teamRolesInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
        this.teamRolesInput.MemberKey = val.$key;
        this.teamRolesInput.AppType = AppType.ADMIN_NEW;
        this.teamRolesInput.ActionType = 0;

        this.getActivitySpecificTeamInput.parentclubId = this.sharedservice.getPostgreParentClubId();
        this.getActivitySpecificTeamInput.memberId = this.sharedservice.getLoggedInId();
        this.getActivitySpecificTeamInput.action_type = LeagueMatchActionType.MATCH;
        this.getActivitySpecificTeamInput.app_type = AppType.ADMIN_NEW;
        this.getActivitySpecificTeamInput.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;
        // Defensive check for required match properties
        if (!this.match.activityId) {
          this.commonService.toastMessage('Match activity data is missing', 3000, ToastMessageType.Error);
          this.navCtrl.pop();
          return;
        }

        this.getActivitySpecificTeamInput.activityId = this.match.activityId;

        // Set activityCode for teamRolesInput - extract from activityId if needed
        // Assuming activityId contains the activity code or can be parsed
        this.teamRolesInput.activityCode = parseInt(this.match.ActivityCode) || 0;

        this.getIndividualMatchParticipantInput.parentclubId = this.sharedservice.getPostgreParentClubId();
        this.getIndividualMatchParticipantInput.memberId = this.sharedservice.getLoggedInId();
        this.getIndividualMatchParticipantInput.action_type = LeagueMatchActionType.MATCH;
        this.getIndividualMatchParticipantInput.app_type = AppType.ADMIN_NEW;
        this.getIndividualMatchParticipantInput.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;
        this.getIndividualMatchParticipantInput.activityId = this.match.activityId;
        this.getIndividualMatchParticipantInput.MatchId = this.match.MatchId;
        this.getIndividualMatchParticipantInput.TeamId = this.match.homeUserId; // Default to Home Team
        this.getIndividualMatchParticipantInput.leagueTeamPlayerStatusType = LeagueTeamPlayerStatusType.PLAYING; // Default to Playing


        this.updateTeamInput.parentclubId = this.sharedservice.getPostgreParentClubId();
        this.updateTeamInput.memberId = this.sharedservice.getLoggedInId();
        this.updateTeamInput.action_type = LeagueMatchActionType.MATCH;;
        this.updateTeamInput.app_type = AppType.ADMIN_NEW;
        this.updateTeamInput.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;
        this.updateTeamInput.LeagueId = ''
        this.updateTeamInput.MatchId = this.match.MatchId;

        // Initialize updateMatchParticipantRoleInput
        this.updateMatchParticipantRoleInput.parentclubId = this.sharedservice.getPostgreParentClubId();
        this.updateMatchParticipantRoleInput.memberId = this.sharedservice.getLoggedInId();
        this.updateMatchParticipantRoleInput.action_type = LeagueMatchActionType.MATCH;
        this.updateMatchParticipantRoleInput.app_type = AppType.ADMIN_NEW;
        this.updateMatchParticipantRoleInput.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;
        this.updateMatchParticipantRoleInput.activityId = this.match.activityId;

        // Initialize updateMatchParticipationStatusInput
        this.updateMatchParticipationStatusInput.parentclubId = this.sharedservice.getPostgreParentClubId();
        this.updateMatchParticipationStatusInput.memberId = this.sharedservice.getLoggedInId();
        this.updateMatchParticipationStatusInput.action_type = LeagueMatchActionType.MATCH;
        this.updateMatchParticipationStatusInput.app_type = AppType.ADMIN_NEW;
        this.updateMatchParticipationStatusInput.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;
        this.updateMatchParticipationStatusInput.LeagueId = ""; // Set to empty string as required
        this.updateMatchParticipationStatusInput.MatchId = this.match.MatchId;

        // Initialize updateLeagueMatchInviteStatusInput
        this.updateLeagueMatchInviteStatusInput.parentclubId = this.sharedservice.getPostgreParentClubId();
        this.updateLeagueMatchInviteStatusInput.memberId = this.sharedservice.getLoggedInId();
        this.updateLeagueMatchInviteStatusInput.action_type = LeagueMatchActionType.MATCH;
        this.updateLeagueMatchInviteStatusInput.app_type = AppType.ADMIN_NEW;
        this.updateLeagueMatchInviteStatusInput.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;
        this.updateLeagueMatchInviteStatusInput.MatchId = this.match.MatchId;

        this.getActivitySpecificTeam();
        // 📊 Load all participants first for accurate counts
        this.loadAllParticipantsForCounts().then(() => {
          this.getIndividualMatchParticipant(LeagueTeamPlayerStatusType.PLAYING);
        });
        this.getRoleForPlayers();
      }
    });
  }

  publish() {
    this.closeFab();

    // Debug: Check available team properties
    console.log("Available teams:", this.activitySpecificTeamsRes);
    console.log("Looking for home team:", this.selectedHomeTeamText);
    console.log("Looking for away team:", this.selectedAwayTeamText);

    const homeTeam = this.activitySpecificTeamsRes.find(team => team.teamName === this.selectedHomeTeamText);
    const awayTeam = this.activitySpecificTeamsRes.find(team => team.teamName === this.selectedAwayTeamText);
    console.log("Selected Home Team:", homeTeam);
    console.log("Selected Away Team:", awayTeam);

    if (this.selectedHomeTeamText != 'Home Team' && this.selectedAwayTeamText != 'Away Team') {
      const params = {
        "match": this.match,
        "leagueId": '',
        "activityId": this.match.activityId,
        "homeTeam": homeTeam,
        "awayTeam": awayTeam,
        "activityCode": parseInt(this.match.ActivityCode),
        "isLeague": false
      };

      if (parseInt(this.match.ActivityCode) === ActivityTypeEnum.TENNIS) {
        this.navCtrl.push("TennisSummaryTennisPage", params);
      } else if (parseInt(this.match.ActivityCode) === ActivityTypeEnum.FOOTBALL) {
        this.navCtrl.push("SummaryFootballPage", params);
      } else if (parseInt(this.match.ActivityCode) === ActivityTypeEnum.CRICKET) {
        this.navCtrl.push("CricketSummaryPage", params);
      }
    } else {
      this.commonService.toastMessage('Select Home and Away Teams', 3000, ToastMessageType.Info);
    }
  }

  closeFab() {
    if (this.fab) {
      this.fab.close();
    }
  }
  ionViewDidLoad() {
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
    if (this.getIndividualMatchParticipantInput.leagueTeamPlayerStatusType === LeagueTeamPlayerStatusType.All) {
      event.dataTransfer.setData('text/plain', JSON.stringify({ item, sectionIndex }));
      event.dataTransfer.effectAllowed = 'move'; // Ensure the effect is allowed
    } else {
      this.commonService.toastMessage('Please select "All" filter to drag and drop', 3000, ToastMessageType.Info);
      event.preventDefault(); // Prevent the drag from starting
    }
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

      let newParticipantStatus: LeagueParticipationStatus;

      if (sectionIndex === 0) {
        newParticipantStatus = LeagueParticipationStatus.PARTICIPANT;
      } else if (sectionIndex === 1) {
        newParticipantStatus = LeagueParticipationStatus.NON_PARTICIPANT;
      } else {
        newParticipantStatus = LeagueParticipationStatus.PENDING;
      }

      this.updateMatchParticipationStatus(item.participant_status, newParticipantStatus, { participationId: item.id });

    }
    this.onDragLeaveSection(sectionIndex);
  }

  //ActionSheet Controller
  presentActionSheet(member: GetIndividualMatchParticipantModel) {
    // if (this.getIndividualMatchParticipantInput.leagueTeamPlayerStatusType !== LeagueTeamPlayerStatusType.All) {
    //   this.commonService.toastMessage('Please select "All" filter to perform actions', 3000, ToastMessageType.Info);
    //   return;
    // }
    let actionSheet = this.actionSheetCtrl.create({
      title: `${member.user.FirstName} ${member.user.LastName}`,
      buttons: [
        {
          text: 'Confirmed',
          icon: 'checkmark-circle',
          cssClass: 'action-sheet-confirmed',
          handler: () => {
            this.updateLeagueMatchInviteStatus(member, LeaguePlayerInviteStatus.AdminAccepted);
          }
        },
        {
          text: 'Maybe',
          icon: 'help-circle',
          cssClass: 'action-sheet-maybe',
          handler: () => {
            this.updateLeagueMatchInviteStatus(member, LeaguePlayerInviteStatus.AdminMaybe);
          }
        },
        {
          text: 'Declined',
          icon: 'close-circle',
          cssClass: 'action-sheet-declined',
          handler: () => {
            this.updateLeagueMatchInviteStatus(member, LeaguePlayerInviteStatus.AdminDeclined);
            // Handle declined status
          }
        },
        {
          text: 'Update Role',
          icon: 'people',
          handler: () => {
            //for updating roles
            this.showRoles(member);
            if (this.getIndividualMatchParticipantInput.leagueTeamPlayerStatusType === LeagueTeamPlayerStatusType.All) {
              //   this.showRoles(member);
              // } else {
              //   this.commonService.toastMessage('Please select "All" filter to update role', 3000, ToastMessageType.Info);
              //   // event.preventDefault(); // Prevent the action from starting 
            }
          }
        },
      ]
    });
    actionSheet.present();
  }

  showRoles(member: GetIndividualMatchParticipantModel): void {
    this.closeFab();
    if (this.roles && this.roles.length > 0) {
      let alert = this.alertCtrl.create();
      alert.setTitle(`Select Role`);

      for (let userIndex = 0; userIndex < this.roles.length; userIndex++) {
        alert.addInput({
          type: 'radio',
          label: this.roles[userIndex].role_name,
          value: this.roles[userIndex].id,
          checked: member.teamrole && member.teamrole.id === this.roles[userIndex].id
        });
      }

      alert.addButton('Cancel');
      alert.addButton({
        text: 'OK',
        handler: (selectedVal) => {
          if (!selectedVal) {
            this.commonService.toastMessage("Please select a role", 3000, ToastMessageType.Info);
            return false; // prevent alert from dismissing          
          }
          else {
            // Update the member's role before calling updatePlayerRole
            const selectedRole = this.roles.find(r => r.id === selectedVal);
            this.updateMatchParticipantRoleInput.role_id = selectedRole.id;
            this.updateMatchParticipantRoleInput.role_type = parseInt(selectedRole.role_type);
            this.updatePlayerRole(member);
          }
        }
      });

      alert.present();

    } else {
      this.commonService.toastMessage("No roles available", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
    }
  }

  getRoleForPlayers() {
    const playernstaffrole = gql`
        query getTeamRoles($activityDetails:TeamRolesInput!) { 
         getTeamRoles(activityDetails:$activityDetails){
          teamRoles {
            id
            role_type
            role_name
          }
  
           }
         }
       `;
    this.graphqlService.query(playernstaffrole, { activityDetails: this.teamRolesInput }, 0).subscribe((data: any) => {
      this.roles = data.data.getTeamRoles.teamRoles;
    },
      (error) => {
        this.commonService.toastMessage("Failed to fetch roles", 3000, ToastMessageType.Error);
      }
    );
  }

  updatePlayerRole(member: GetIndividualMatchParticipantModel) {
    this.commonService.showLoader("Updating Role...");
    this.updateMatchParticipantRoleInput.match_participation_id = member.id;

    this.httpService.post(`${API.Update_League_Match_Participantipation_Role}`, this.updateMatchParticipantRoleInput).subscribe((res: any) => {
      if (res) {
        this.commonService.hideLoader();
        var response = res.message;
        this.commonService.toastMessage(response, 3000, ToastMessageType.Success);
        // Refresh the participant data
        this.loadAllParticipantsForCounts().then(() => {
          this.getIndividualMatchParticipant(LeagueTeamPlayerStatusType.All);
        });
      } else {
        this.commonService.hideLoader();
        this.commonService.toastMessage("Failed to update role", 3000, ToastMessageType.Error);
      }
    },
      (err) => {
        this.commonService.hideLoader();
        this.commonService.toastMessage(err.error.message, 3000, ToastMessageType.Error);
      });
  }

  updateLeagueMatchInviteStatus(member: GetIndividualMatchParticipantModel, inviteStatus: LeaguePlayerInviteStatus) {
    this.commonService.showLoader("Please wait...");
    this.updateLeagueMatchInviteStatusInput.ParticipationId = member.id;
    this.updateLeagueMatchInviteStatusInput.InviteStatus = inviteStatus;

    this.httpService.post(`${API.UpdateLeagueMatchInviteStatus}`, this.updateLeagueMatchInviteStatusInput).subscribe((res: any) => {
      if (res) {
        this.commonService.hideLoader();
        var response = res.message;
        this.commonService.toastMessage(response, 3000, ToastMessageType.Success);
        // Refresh the participant data
        this.loadAllParticipantsForCounts().then(() => {
          this.getIndividualMatchParticipant(LeagueTeamPlayerStatusType.All);
        });
      } else {
        this.commonService.hideLoader();
        this.commonService.toastMessage("Failed to update Invitation status", 3000, ToastMessageType.Error);
      }
    },
      (err) => {
        this.commonService.hideLoader();
        this.commonService.toastMessage(err.error.message, 3000, ToastMessageType.Error);
      });
  }

  //called when we use drag and drop to change the status of the player
  updateMatchParticipationStatus(participantStatus, newParticipantStatus: LeagueParticipationStatus, { participationId }: { participationId: string }) {
    this.commonService.showLoader("Adding...");
    this.updateMatchParticipationStatusInput.ParticipationId = participationId;
    this.updateMatchParticipationStatusInput.ParticipationStatus = newParticipantStatus;

    this.httpService.post(`${API.Update_League_Match_Participation_Status}`, this.updateMatchParticipationStatusInput).subscribe((res: any) => {
      if (res) {
        this.commonService.hideLoader();
        var response = res.message;
        this.commonService.toastMessage(response, 3000, ToastMessageType.Success);
        // Refresh the participant data
        this.loadAllParticipantsForCounts().then(() => {
          this.getIndividualMatchParticipant(LeagueTeamPlayerStatusType.All);
        });
      } else {
        this.commonService.hideLoader();
        this.commonService.toastMessage("Failed to update participation status", 3000, ToastMessageType.Error);
      }
    },
      (err) => {
        this.commonService.hideLoader();
        this.commonService.toastMessage(err.error.message, 3000, ToastMessageType.Error);
      });
  }

  getFilteredSections(): { title: string; items: GetIndividualMatchParticipantModel[] }[] {
    if (this.getIndividualMatchParticipantInput.leagueTeamPlayerStatusType === LeagueTeamPlayerStatusType.All) {
      // Show all sections
      return this.sections;
    } else if (this.getIndividualMatchParticipantInput.leagueTeamPlayerStatusType === LeagueTeamPlayerStatusType.PLAYING) {
      // Only show the "Playing Squad" section
      return this.sections.filter(section => section.title === 'Playing Squad');
    } else if (this.getIndividualMatchParticipantInput.leagueTeamPlayerStatusType === LeagueTeamPlayerStatusType.BENCH) {
      // Only show the "Bench" section
      return this.sections.filter(section => section.title === 'Bench');
    }
    // Default: show all
    return this.sections;
  }

  getPlayingCount(): number {
    return this.allParticipants.filter(p => p.participant_status === LeagueParticipationStatus.PARTICIPANT).length;
  }

  getBenchCount(): number {
    return this.allParticipants.filter(p => p.participant_status === LeagueParticipationStatus.NON_PARTICIPANT).length;
  }

  getAllCount(): number {
    return this.allParticipants.length;
  }

  getAcceptedCount(sectionItems: GetIndividualMatchParticipantModel[]): number {
    return sectionItems.filter(item =>
      item.invite_status === LeaguePlayerInviteStatus.Accepted ||
      item.invite_status === LeaguePlayerInviteStatus.AdminAccepted
    ).length;
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
          if (!selectedVal) {
            this.commonService.toastMessage("Please select a team", 3000, ToastMessageType.Info);
            return false; // prevent alert from dismissing          
          }
          this.selectedTeam = this.activitySpecificTeamsRes.find(team => team.id === selectedVal);

          if (isHomeTeam) {
            if (this.selectedTeam.teamName === this.selectedAwayTeamText) {
              this.commonService.toastMessage("Home and away teams can't be same", 3000, ToastMessageType.Info);
            } else {
              this.updateTeamInput.HomeParentclubTeamId = selectedVal;
              this.updateTeamInput.AwayParentclubTeamId = ""; //setting the deafult val to ""
              this.updateTeam(isHomeTeam, this.selectedTeam.teamName);
            }
          } else {
            if (this.selectedTeam.teamName === this.selectedHomeTeamText) {
              this.commonService.toastMessage("Home and away teams can't be same", 3000, ToastMessageType.Info);
            } else {
              this.updateTeamInput.AwayParentclubTeamId = selectedVal;
              this.updateTeamInput.HomeParentclubTeamId = ""; //setting the deafult val to ""
              this.updateTeam(isHomeTeam, this.selectedTeam.teamName);
            }
          }
        }
      });

      alert.present();

    } else {
      this.commonService.toastMessage("No teams available", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
    }
  }

  //tab change
  changeType(val: boolean) {
    this.sections.forEach(section => section.items = []); // Clear the sections array
    this.activeType = val !== undefined ? val : !this.activeType;
    this.getActivitySpecificTeam();

    // Load participants for the selected tab
    const teamId = this.activeType ? this.match.homeUserId : this.match.awayUserId;
    if (teamId !== null) {
      this.loadAllParticipantsForCounts().then(() => {
        this.getIndividualMatchParticipant(LeagueTeamPlayerStatusType.PLAYING);
      });
    }
    this.getFilteredSections();
  }

  // 📊 Load all participants for accurate counting
  loadAllParticipantsForCounts(): Promise<void> {
    return new Promise((resolve) => {
      const teamId = this.activeType ? this.match.homeUserId : this.match.awayUserId;

      if (!teamId) {
        this.allParticipants = [];
        resolve();
        return;
      }

      const input = { ...this.getIndividualMatchParticipantInput };
      input.TeamId = teamId;
      input.leagueTeamPlayerStatusType = LeagueTeamPlayerStatusType.All;

      this.httpService.post(`${API.GetIndividualMatchParticipant}`, input).subscribe((res: any) => {
        if (res) {
          this.allParticipants = res.data || [];
        }
        resolve();
      }, () => {
        resolve();
      });
    });
  }

  //to fetch list of avilable players of both home & away teams
  getIndividualMatchParticipant(par?: LeagueTeamPlayerStatusType) {
    this.commonService.showLoader("Fetching info ...");
    const teamId = this.activeType ? this.match.homeUserId : this.match.awayUserId;

    if (!teamId) {
      this.commonService.hideLoader();
      this.getIndividualMatchParticipantRes = [];
      this.sections.forEach(section => section.items = []);
      return;
    }

    this.getIndividualMatchParticipantInput.TeamId = teamId;
    this.getIndividualMatchParticipantInput.leagueTeamPlayerStatusType = par !== undefined ? par : LeagueTeamPlayerStatusType.All;

    this.httpService.post(`${API.GetIndividualMatchParticipant}`, this.getIndividualMatchParticipantInput).subscribe((res: any) => {
      if (res) {
        this.commonService.hideLoader();
        this.getIndividualMatchParticipantRes = res.data || [];

        // 📊 Update allParticipants only when fetching all data
        if (this.getIndividualMatchParticipantInput.leagueTeamPlayerStatusType === LeagueTeamPlayerStatusType.All) {
          this.allParticipants = res.data || [];
        }

        this.sections.forEach(section => section.items = []); // Clear the sections array
        this.populateSections(); // Call populateSections after data is fetched
      }
    }, error => {
      this.commonService.hideLoader();
      if (error.error && error.error.message) {
        this.commonService.toastMessage(error.error.message, 3000, ToastMessageType.Error);
      } else {
        this.commonService.toastMessage("Failed to fetch participants details", 3000, ToastMessageType.Error);
      }
    });
  }

  populateSections() {
    this.getIndividualMatchParticipantRes.forEach(participant => {
      switch (participant.participant_status) {
        case LeagueParticipationStatus.PARTICIPANT: // Playing Squad 1
          this.sections[0].items.push(participant);
          break;
        case LeagueParticipationStatus.NON_PARTICIPANT: // Bench 2
          this.sections[1].items.push(participant);
          break;
        case LeagueParticipationStatus.PENDING: // Remaining Players 0
        default:
          this.sections[2].items.push(participant);
          break;
      }
    });
  }

  //to fetch list of avilable teams
  getActivitySpecificTeam() {
    this.httpService.post(`${API.GET_ACTIVIY_SPECIFIC_TEAM}`, this.getActivitySpecificTeamInput).subscribe((res: any) => {
      if (res) {
        this.activitySpecificTeamsRes = res.data;
      }
    }, error => {
      this.commonService.toastMessage(error.error.message, 3000, ToastMessageType.Error,);
    });
  }

  updateTeam(isHomeTeam?: boolean, teamName?: string) {
    this.commonService.showLoader("Updating...");
    this.httpService.post(`${API.Update_League_Fixture}`, this.updateTeamInput).subscribe((res: any) => {
      if (res) {
        this.commonService.hideLoader();
        var res = res.message;

        // Update frontend variables and match data on successful API call
        if (isHomeTeam !== undefined && teamName) {
          if (isHomeTeam) {
            this.selectedHomeTeamText = teamName;
            this.match.homeUserId = this.selectedTeam.id; // Update match data
          } else {
            this.selectedAwayTeamText = teamName;
            this.match.awayUserId = this.selectedTeam.id; // Update match data
          }
        }

        this.commonService.toastMessage(res, 3000, ToastMessageType.Success);

        // Only refresh data if we're on the tab that was just updated
        const shouldRefresh = (isHomeTeam && this.activeType) || (!isHomeTeam && !this.activeType);
        if (shouldRefresh) {
          this.loadAllParticipantsForCounts().then(() => {
            this.getIndividualMatchParticipant(LeagueTeamPlayerStatusType.PLAYING);
          });
        }
      } else {
        this.commonService.hideLoader();
        this.commonService.toastMessage("Failed to update fixture", 3000, ToastMessageType.Error);
      }
    },
      (err) => {
        this.commonService.hideLoader();
        if (err.error && err.error.message) {
          this.commonService.toastMessage(err.error.message, 3000, ToastMessageType.Error,);
        } else {
          this.commonService.toastMessage("Failed to update fixture", 3000, ToastMessageType.Error,);
        }
        // Frontend variables are NOT updated on API failure
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
        this.commonService.toastMessage("match deletion failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
      )
    } catch (error) {
      this.commonService.hideLoader();
      this.commonService.toastMessage("match deletion failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    }
  }

  // 🎯 Get display text and CSS class for invite status
  getInviteStatusDisplay(inviteStatus: number, inviteStatusText?: string): { text: string; cssClass: string } {
    // Handle null/undefined cases
    if (inviteStatus === null || inviteStatus === undefined) {
      return { text: inviteStatusText || 'Accepted', cssClass: 'status-other' };
    }

    // Playing status (green) - for Accepted (1) and AdminAccepted (4)
    if (inviteStatus === LeaguePlayerInviteStatus.Accepted) {
      return { text: 'Playing', cssClass: 'status-playing' };
    }
    if (inviteStatus === LeaguePlayerInviteStatus.AdminAccepted) {
      return { text: 'Coach Accepted', cssClass: 'status-playing' };
    }

    // Not Playing status (red) - for Rejected (2) and AdminRejected (5)
    if (inviteStatus === LeaguePlayerInviteStatus.Declined) {
      return { text: 'Declined', cssClass: 'status-not-playing' };
    }
    if (inviteStatus === LeaguePlayerInviteStatus.AdminDeclined) {
      return { text: 'Coach Declined', cssClass: 'status-not-playing' };
    }

    // Maybe status
    if (inviteStatus === LeaguePlayerInviteStatus.Maybe) {
      return { text: 'Maybe', cssClass: 'status-maybe' };
    }
    if (inviteStatus === LeaguePlayerInviteStatus.AdminMaybe) {
      return { text: 'Coach Maybe', cssClass: 'status-maybe' };
    }

    // All other statuses (orange) - Pending (0), Cancelled (3), etc.
    const statusLabels = {
      [LeaguePlayerInviteStatus.Pending]: 'Pending',
      [LeaguePlayerInviteStatus.Cancelled]: 'Cancelled',
      [LeaguePlayerInviteStatus.AdminCancelled]: 'Coach Cancelled',
      [LeaguePlayerInviteStatus.AdminDeleted]: 'Coach Deleted'
    };

    const displayText = inviteStatusText || statusLabels[inviteStatus] || 'Unknown';
    return { text: displayText, cssClass: 'status-other' };
  }

  // 🎯 Get icon name based on invite status
  getInviteStatusIcon(inviteStatus: number): string {
    // Handle null/undefined cases
    if (inviteStatus === null || inviteStatus === undefined) {
      return 'checkmark-circle';
    }

    // Confirmed status - for Accepted (1) and AdminAccepted (4)
    if (inviteStatus === LeaguePlayerInviteStatus.Accepted || inviteStatus === LeaguePlayerInviteStatus.AdminAccepted) {
      return 'checkmark-circle';
    }

    // Declined status - for Rejected (2) and AdminRejected (5)
    if (inviteStatus === LeaguePlayerInviteStatus.Declined || inviteStatus === LeaguePlayerInviteStatus.AdminDeclined) {
      return 'close-circle';
    }

    // Maybe status - for Maybe and AdminMaybe
    if (inviteStatus === LeaguePlayerInviteStatus.Maybe || inviteStatus === LeaguePlayerInviteStatus.AdminMaybe) {
      return 'help-circle';
    }

    // Default for all other statuses
    return 'warning';
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

export class UpdateMatchParticipantRoleInput {
  parentclubId: string; // 🏢 Parent club ID
  clubId: string; // 🏟️ Club ID
  activityId: string; // ⚽ Activity ID
  memberId: string; // 👤 Member ID
  action_type: number; // ⚙️ Action type
  device_type: number; // 📱 Device type (1=Android, 2=iOS)
  app_type: number; // 📱 App type
  device_id: string; // 🆔 Device ID
  updated_by: string; // ✍️ User who updated
  match_participation_id: string; // 🏟️ Match participation ID
  role_id: string; // 👥 Role ID
  role_type: number; // 📊 Role type (1=player, 2=coach)
}

export class TeamRolesInput {
  ParentClubKey: string; // 🏢 Parent club key
  MemberKey: string; // 👤 Member key
  AppType: number; // 📱 App type
  ActionType: number; // ⚙️ Action type
  activityCode: number; // ⚽ Activity code
}

export class UpdateMatchParticipationStatusInput {
  parentclubId: string; // 🏢 Parent club ID
  clubId: string; // 🏟️ Club ID
  activityId: string; // ⚽ Activity ID
  memberId: string; // 👤 Member ID
  action_type: number; // ⚙️ Action type
  device_type: number; // 📱 Device type (1=Android, 2=iOS)
  app_type: number; // 📱 App type
  device_id: string; // 🆔 Device ID
  updated_by: string; // ✍️ User who updated
  LeagueId: string; // 🏆 League ID (set to empty string for matches)
  MatchId: string; // 🏟️ Match ID
  ParticipationId: string; // 👥 Participation ID
  ParticipationStatus: number; // 📊 Participation status
}

export class UpdateLeagueMatchInviteStatusInput {
  parentclubId: string;
  clubId: string;
  activityId: string;
  memberId: string;
  action_type: number;
  device_type: number;
  app_type: number;
  device_id: string;
  updated_by: string;
  created_by: string;
  MatchId: string;
  ParticipationId: string;
  InviteStatus: number;
}

