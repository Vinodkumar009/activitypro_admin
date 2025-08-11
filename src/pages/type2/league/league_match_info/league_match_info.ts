import { Component, Renderer2, ViewChild } from "@angular/core";
import { ActionSheetController, IonicPage, LoadingController, NavController, NavParams, AlertController, ModalController, FabContainer } from "ionic-angular";
import { Storage } from "@ionic/storage";
import { SharedServices } from "../../../services/sharedservice";
import { CommonService, ToastMessageType, ToastPlacement } from "../../../../services/common.service";
import { Apollo } from "apollo-angular";
import { LeagueMatchParticipantModel, LeagueParticipantModel, LeagueParticipationForMatchModel, Match } from "../models/league.model";
import { TeamsForParentClubModel } from "../models/team.model";
import { HttpService } from "../../../../services/http.service";
import { API } from "../../../../shared/constants/api_constants";
import { AppType } from "../../../../shared/constants/module.constants";
import { LeagueMatch } from "../models/location.model";
import { LeagueParticipationStatus, LeagueTeamPlayerStatusType } from "../../../../shared/utility/enums";
import { GetPlayerModel } from "../../team/models/team.model";
import { GraphqlService } from "../../../../services/graphql.service";
import gql from "graphql-tag";
import { Role } from "../../team/team.model";
import { error } from "console";
/**
 * Generated class for the LeagueMatchInfoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-league_match_info",
  templateUrl: "league_match_info.html",
  providers: [HttpService]
})
export class LeagueMatchInfoPage {
  @ViewChild('fab') fab: FabContainer;
  currencyDetails: any;
  activeType: boolean = true;
  selectedHomeTeamText: string;
  selectedAwayTeamText: string;

  matchObj: LeagueMatch;
  leagueId: string; //league id from prev page
  activityId: string; //activity id from prev page
  activityCode: string; // activity code from prev page
  existingteam: TeamsForParentClubModel[];// existing team from prev page  
  selectedTeam: LeagueParticipationForMatchModel

  leagueParticipantForMatchRes: LeagueParticipationForMatchModel[] = [];//league participant for match response

  leagueMatchParticipantRes: LeagueMatchParticipantModel[] = [];
  roles: Role[];

  leagueParticipantForMatchInput: LeagueParticipantForMatchInput = {
    parentclubId: "",
    clubId: "",
    activityId: "",
    memberId: "",
    action_type: 0,
    device_type: 0,
    app_type: 0,
    device_id: "",
    updated_by: "",
    LeagueId: ""
  } //league participant for match input  

  //fetch api for teams and corresponding player details
  leagueMatchParticipantInput: LeagueMatchParticipantInput = {
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
    TeamId2: "",
    leagueTeamPlayerStatusType: 0
  }

  UpdateLeagueFixtureInput: UpdateLeagueFixtureInput = {
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
    HomeParentclubTeamId: '',
    AwayParentclubTeamId: '',
  }
  updateLeagueMatchParticipantipationRoleInput: UpdateLeagueMatchParticipantipationRoleInput = {
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

  updateLeagueMatchParticipationStatusInput: UpdateLeagueMatchParticipationStatusInput = {
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


  sections: { title: string; items: LeagueMatchParticipantModel[] }[] = [
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
  parentClubKey: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private apollo: Apollo,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public storage: Storage,
    public sharedservice: SharedServices,
    public actionSheetCtrl: ActionSheetController,
    public modalCtrl: ModalController,
    private httpService: HttpService,
    private renderer: Renderer2,// Inject Renderer2
    private graphqlService: GraphqlService,
  ) {
    this.matchObj = this.navParams.get("match");
    this.leagueId = this.navParams.get("leagueId");
    this.activityId = this.navParams.get("activityId");
    this.activityCode = this.navParams.get("activityCode");
    console.log("activityCode:", this.activityCode);
    this.existingteam = this.navParams.get("existingteam");
    this.selectedHomeTeamText = this.matchObj.homeusername != null ? this.matchObj.homeusername : 'Home Team';
    this.selectedAwayTeamText = this.matchObj.awayusername != null ? this.matchObj.awayusername : 'Away Team';
    console.log(
      `${this.navParams.get("selectedmatchId")}:${this.navParams.get(
        "selectedmemberkey"
      )}`
    );
    this.storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);
    });


    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey =
          val.UserInfo[0].ParentClubKey;
        this.teamRolesInput.ParentClubKey =
          val.UserInfo[0].ParentClubKey;
        this.teamRolesInput.MemberKey = val.$key;
        this.teamRolesInput.activityCode =
          parseInt(this.activityCode);

        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        this.leagueParticipantForMatchInput.parentclubId = this.sharedservice.getPostgreParentClubId();
        this.leagueParticipantForMatchInput.memberId = this.sharedservice.getLoggedInId();
        this.leagueParticipantForMatchInput.action_type = 0;
        this.leagueParticipantForMatchInput.app_type = AppType.ADMIN_NEW;
        this.leagueParticipantForMatchInput.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;
        this.leagueParticipantForMatchInput.LeagueId = this.leagueId;
        this.leagueParticipantForMatchInput.activityId = this.activityId; //not mandatory field, just added for sanity

        this.leagueMatchParticipantInput.parentclubId = this.sharedservice.getPostgreParentClubId();
        this.leagueMatchParticipantInput.memberId = this.sharedservice.getLoggedInId();
        this.leagueMatchParticipantInput.action_type = 0;
        this.leagueMatchParticipantInput.app_type = AppType.ADMIN_NEW;
        this.leagueMatchParticipantInput.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;
        this.leagueMatchParticipantInput.LeagueId = this.leagueId;

        this.UpdateLeagueFixtureInput.parentclubId = this.sharedservice.getPostgreParentClubId();
        this.UpdateLeagueFixtureInput.memberId = this.sharedservice.getLoggedInId();
        this.UpdateLeagueFixtureInput.action_type = 0;
        this.UpdateLeagueFixtureInput.app_type = AppType.ADMIN_NEW;
        this.UpdateLeagueFixtureInput.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;
        this.UpdateLeagueFixtureInput.LeagueId = this.leagueId
        this.UpdateLeagueFixtureInput.MatchId = this.matchObj.match_id;

        this.updateLeagueMatchParticipantipationRoleInput.parentclubId = this.sharedservice.getPostgreParentClubId();
        this.updateLeagueMatchParticipantipationRoleInput.memberId = this.sharedservice.getLoggedInId();
        this.updateLeagueMatchParticipantipationRoleInput.action_type = 0;
        this.updateLeagueMatchParticipantipationRoleInput.app_type = AppType.ADMIN_NEW;
        this.updateLeagueMatchParticipantipationRoleInput.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;
        this.updateLeagueMatchParticipantipationRoleInput.activityId = this.activityId;

        this.updateLeagueMatchParticipationStatusInput.parentclubId = this.sharedservice.getPostgreParentClubId();
        this.updateLeagueMatchParticipationStatusInput.memberId = this.sharedservice.getLoggedInId();
        this.updateLeagueMatchParticipationStatusInput.action_type = 0;
        this.updateLeagueMatchParticipationStatusInput.app_type = AppType.ADMIN_NEW;
        this.updateLeagueMatchParticipationStatusInput.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;
        this.updateLeagueMatchParticipationStatusInput.LeagueId = this.leagueId
        this.updateLeagueMatchParticipationStatusInput.MatchId = this.matchObj.match_id;

        this.getLeagueParticipantForMatch();
        this.getRoleForPlayers();
        if (this.activeType && this.matchObj.home_team_id !== null) {
          this.getLeagueMatchParticipant(1);
        }

      }
    });
  }

  closeFab() {
    if (this.fab) {
      this.fab.close();
    }
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad LeagueMatchInfoPage");
  }

  getFilteredSections(): { title: string; items: LeagueMatchParticipantModel[] }[] {
    if (this.leagueMatchParticipantInput.leagueTeamPlayerStatusType === LeagueTeamPlayerStatusType.All) {
      // Show all sections
      return this.sections;
    } else if (this.leagueMatchParticipantInput.leagueTeamPlayerStatusType === LeagueTeamPlayerStatusType.PLAYING) {
      // Only show the "Playing Squad" section
      return this.sections.filter(section => section.title === 'Playing Squad');
    } else if (this.leagueMatchParticipantInput.leagueTeamPlayerStatusType === LeagueTeamPlayerStatusType.BENCH) {
      // Only show the "Bench" section
      return this.sections.filter(section => section.title === 'Bench');
    }
    // Default: show all
    return this.sections;
  }

  gotoSummary() {
    this.closeFab();
    const homeTeam = this.leagueParticipantForMatchRes.find(team => team.parentclubteam.teamName === this.selectedHomeTeamText);
    const awayTeam = this.leagueParticipantForMatchRes.find(team => team.parentclubteam.teamName === this.selectedAwayTeamText);
    console.log("Selected Home Team:", homeTeam);
    console.log(this.selectedHomeTeamText);
    console.log(this.selectedAwayTeamText);
    this.selectedHomeTeamText != 'Home Team' ||
      this.selectedAwayTeamText != 'Away Team' ?
      this.navCtrl.push("SummaryFootballPage", {
        "match": this.matchObj, "leagueId": this.leagueId, "activityId": this.activityId, "homeTeam": homeTeam,
        "awayTeam": awayTeam, "activityCode": this.activityCode,
      }) :
      this.commonService.toastMessage('Select Home and Away Teams', 3000, ToastMessageType.Info,);
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
    if (this.leagueMatchParticipantInput.leagueTeamPlayerStatusType === LeagueTeamPlayerStatusType.All) {
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

      this.updateLeagueMatchParticipationStatus(item.participant_status, newParticipantStatus, { participationId: item.id });

    }
    this.onDragLeaveSection(sectionIndex);
  }

  //ActionSheet Controller
  presentActionSheet(member: LeagueMatchParticipantModel) {
    let actionSheet = this.actionSheetCtrl.create({
      title: `${member.user.FirstName} ${member.user.LastName}`,
      buttons: [
        {
          text: 'Update Role',
          icon: 'female',
          handler: () => {
            //for updating roles
            // console.log("selected Member log", member);
            if (this.leagueMatchParticipantInput.leagueTeamPlayerStatusType === LeagueTeamPlayerStatusType.All) {
              this.showRoles(member);
            } else {
              this.commonService.toastMessage('Please select "All" filter to update role', 3000, ToastMessageType.Info);
              event.preventDefault(); // Prevent the drag from starting
            }
          }
        },
      ]
    });
    actionSheet.present();
  }
  showRoles(member: LeagueMatchParticipantModel): void {
    this.closeFab();
    if (this.roles.length > 0) {
      // console.log(this.roles);
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
            this.commonService.toastMessage("Please select a team", 3000, ToastMessageType.Info);
            return false; // prevent alert from dismissing          
          }
          else {
            // Update the member's teamrole before calling updatePlayerRole
            const selectedRole = this.roles.find(r => r.id === selectedVal);
            // console.log("selectedRole", selectedRole);
            this.updateLeagueMatchParticipantipationRoleInput.role_id = selectedRole.id;
            this.updateLeagueMatchParticipantipationRoleInput.role_type = parseInt(selectedRole.role_type);
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
    // this.commonService.showLoader("Fetching Role...")
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
      // this.commonService.hideLoader();
      this.roles = data.data.getTeamRoles.teamRoles;
      console.log("Roles getting for player:", JSON.stringify(this.roles));
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
    this.apollo
      .query({
        query: playernstaffrole,
        fetchPolicy: "network-only",
        variables: {
          activityDetails: this.teamRolesInput,
        },
      })
      .subscribe(
        ({ data }) => {
          this.roles = data["getTeamRoles"]["teamRoles"];
          console.log("Getting Player Roles", this.roles);
          // this.commonService.hideLoader();
        },
        (err) => {
          console.log(JSON.stringify(err));
          this.commonService.toastMessage("failed to fetch role", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        })
  }

  updatePlayerRole(member: LeagueMatchParticipantModel) {
    this.commonService.showLoader("Updating Role...");
    this.updateLeagueMatchParticipantipationRoleInput.match_participation_id = member.id;
    // this.updateLeagueMatchParticipantipationRoleInput.role_id = member.teamrole.id;
    // this.updateLeagueMatchParticipantipationRoleInput.role_type = 1; // 1 for player, 2 for coach
    // this.updateLeagueMatchParticipationStatusInput.ParticipationId = member.id;
    // this.updateLeagueMatchParticipationStatusInput.ParticipationStatus = member.participant_status;
    this.httpService.post(`${API.Update_League_Match_Participantipation_Role}`, this.updateLeagueMatchParticipantipationRoleInput).subscribe((res: any) => {
      if (res) {
        this.commonService.hideLoader();
        var res = res.message;
        console.log("Update_League_Match_Participantipation_Role RESPONSE", JSON.stringify(res));
        this.commonService.toastMessage(res, 3000, ToastMessageType.Success);
        // this.sections.forEach(section => section.items = []); // Clear the sections array
        this.getLeagueMatchParticipant(0);
      } else {
        console.log("error in Update_League_Fixture",)
      }
    },
      (err) => {
        this.commonService.hideLoader();
        this.commonService.toastMessage(err.error.message, 3000, ToastMessageType.Error,);
      });
  }





  showAvailableTeams(isHomeTeam: boolean): void {
    this.closeFab();
    if (this.leagueParticipantForMatchRes.length > 0) {
      // console.log(this.leagueParticipantForMatchRes);
      let alert = this.alertCtrl.create();
      alert.setTitle(`Select Team`);

      for (let userIndex = 0; userIndex < this.leagueParticipantForMatchRes.length; userIndex++) {
        alert.addInput({
          type: 'radio',
          label: this.leagueParticipantForMatchRes[userIndex].parentclubteam.teamName,
          value: this.leagueParticipantForMatchRes[userIndex].id,
          checked: isHomeTeam ? this.leagueParticipantForMatchRes[userIndex].parentclubteam.teamName == this.selectedHomeTeamText : this.leagueParticipantForMatchRes[userIndex].parentclubteam.teamName == this.selectedAwayTeamText
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
          this.selectedTeam = this.leagueParticipantForMatchRes.find(team => team.id === selectedVal);
          if (isHomeTeam) {
            if (selectedVal === this.selectedAwayTeamText) {
              this.commonService.toastMessage("Home and away teams can't be same", 3000, ToastMessageType.Info);
            } else {
              this.selectedHomeTeamText = this.selectedTeam.parentclubteam.teamName;
              this.UpdateLeagueFixtureInput.HomeParticipantId = selectedVal;
              this.UpdateLeagueFixtureInput.AwayParticipantId = ""; //setting the deafult val to ""
            }
          } else {
            if (selectedVal === this.selectedHomeTeamText) {
              this.commonService.toastMessage("Home and away teams can't be same", 3000, ToastMessageType.Info);
            } else {
              this.selectedAwayTeamText = this.selectedTeam.parentclubteam.teamName;
              this.UpdateLeagueFixtureInput.AwayParticipantId = selectedVal;
              this.UpdateLeagueFixtureInput.HomeParticipantId = ""; //setting the deafult val to ""
            }
          }
          this.updateLeagueFixture();
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
    this.getLeagueParticipantForMatch();

    if (this.activeType && this.matchObj.home_team_id !== null) {
      this.getLeagueMatchParticipant(1);
    } else if (!this.activeType && this.matchObj.away_team_id !== null) {
      this.getLeagueMatchParticipant(1);
    }
    this.getFilteredSections();
    console.log('leagueTeamPlayerStatusType:', this.leagueMatchParticipantInput.leagueTeamPlayerStatusType);
  }

  //to fetch list of avilable teams
  getLeagueParticipantForMatch() {
    // this.commonService.showLoader("Fetching teams...");
    this.httpService.post(`${API.Get_League_Participant_For_Match}`, this.leagueParticipantForMatchInput).subscribe((res: any) => {
      if (res) {
        // this.commonService.hideLoader();
        this.leagueParticipantForMatchRes = res.data;
        console.log("Get_League_Participant_For_Match RESPONSE", JSON.stringify(res.data));
      } else {
        // this.commonService.hideLoader();
        console.log("error in fetching",)
      }
    }, error => {
      this.commonService.hideLoader();
      this.commonService.toastMessage(error.error.message, 3000, ToastMessageType.Error,);
    });
  }

  updateLeagueFixture() {
    this.commonService.showLoader("Updating...");
    this.httpService.post(`${API.Update_League_Fixture}`, this.UpdateLeagueFixtureInput).subscribe((res: any) => {
      if (res) {
        this.commonService.hideLoader();
        var res = res.message;
        console.log("Update_League_Fixture RESPONSE", JSON.stringify(res));
        this.commonService.toastMessage(res, 3000, ToastMessageType.Success);
        // this.sections.forEach(section => section.items = []); // Clear the sections array
        this.getLeagueMatchParticipant(1);
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

  //fetch api for teams and corresponding player details
  getLeagueMatchParticipant(par: LeagueTeamPlayerStatusType) {
    this.commonService.showLoader("Fetching info ...");
    let teamId: string | null = null;
    if (this.selectedTeam) {
      teamId = this.selectedTeam.parentclubteam.id;
    } else
      if (this.activeType && this.matchObj.home_team_id !== null) {
        teamId = this.matchObj.home_team_id;
      } else if (!this.activeType && this.matchObj.away_team_id !== null) {
        teamId = this.matchObj.away_team_id;
      }
    this.leagueMatchParticipantInput.TeamId = teamId
    this.leagueMatchParticipantInput.leagueTeamPlayerStatusType = par
    this.leagueMatchParticipantInput.MatchId = this.matchObj.match_id;
    this.httpService.post(`${API.Get_League_Match_Participant}`, this.leagueMatchParticipantInput).subscribe((res: any) => {
      if (res) {
        this.commonService.hideLoader();
        this.leagueMatchParticipantRes = res.data || [];
        console.log("Get_League_Match_Participant RESPONSE", JSON.stringify(res.data));
        this.sections.forEach(section => section.items = []);// Clear the sections array
        this.populateSections(); // Call populateSections after data is fetched
      }
    }, error => {
      this.commonService.hideLoader();
      if (error.error && error.error.message) {
        this.commonService.toastMessage(error.error.message, 3000, ToastMessageType.Error,);
      } else {
        this.commonService.toastMessage("Failed to fetch participants details", 3000, ToastMessageType.Error,);
      }
    });
  }

  isMatchPaid(matchItem: Match, amount: string): boolean {
    //1 paid, 0  free
    return matchItem.PaymentType == 1 && amount != "0.00" ?
      true : false;
  }


  populateSections() {
    this.leagueMatchParticipantRes.forEach(participant => {
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

  //called when we use drag and drop to change the status of the player
  updateLeagueMatchParticipationStatus(participantStatus, newParticipantStatus: LeagueParticipationStatus, { participationId }: { participationId: string }) {
    this.commonService.showLoader("Adding...");
    // this.updateLeagueMatchParticipantipationRoleInput.match_participation_id = participationId;
    // this.updateLeagueMatchParticipantipationRoleInput.role_id = roleId;
    // this.updateLeagueMatchParticipantipationRoleInput.role_type = 1; // 1 for player, 2 for coach
    this.updateLeagueMatchParticipationStatusInput.ParticipationId = participationId;
    this.updateLeagueMatchParticipationStatusInput.ParticipationStatus = newParticipantStatus;
    // this.httpService.post(`${API.Update_League_Match_Participantipation_Role}`, this.updateLeagueMatchParticipantipationRoleInput).subscribe((res: any) => {
    this.httpService.post(`${API.Update_League_Match_Participantipation_Status}`, this.updateLeagueMatchParticipationStatusInput).subscribe((res: any) => {
      if (res) {
        this.commonService.hideLoader();
        var res = res.message;
        console.log("Update_League_Match_Participation_Status RESPONSE", JSON.stringify(res));
        this.commonService.toastMessage(res, 3000, ToastMessageType.Success);
        // this.sections.forEach(section => section.items = []); // Clear the sections array
        this.getLeagueMatchParticipant(0);
      } else {
        console.log("error in Update_League_Fixture",)
      }
    },
      (err) => {
        this.commonService.hideLoader();
        this.commonService.toastMessage(err.error.message, 3000, ToastMessageType.Error,);
      });
  }


  deleteConfirm() {
    let match_delete_alert = this.alertCtrl.create({
      title: "Do you want to delete the match?",
      buttons: [
        {
          text: "Delete",
          // icon: "checkmark",
          handler: () => {
            this.removeLeagueMatch();
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



  removeLeagueMatch() {
    const commonInput = {
      leagueFixtureId: ""
    }
    commonInput.leagueFixtureId = this.matchObj.fixture_id;
    this.httpService.post(API.DELETE_LEAGUE_MATCHES, commonInput).subscribe((res: any) => {
      const message = "Match deleted successfully";
      this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
      this.navCtrl.pop();
      // this.getMatchList();
    }, (error) => {
      this.commonService.toastMessage("Match fetch failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    }
    )
  }

}
export class UserInvitationStatus {
  MatchId: string;
  MemberKey: string;
}

export class LeagueParticipantForMatchInput {
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
}


//fetch api for teams and corresponding player details
export class LeagueMatchParticipantInput {
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
  MatchId?: string;
  TeamId?: string;
  TeamId2?: string;
  leagueTeamPlayerStatusType?: number;
}

export class UpdateLeagueFixtureInput {
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

export class UpdateLeagueMatchParticipantipationRoleInput {
  parentclubId: string;
  clubId: string;
  activityId: string;
  memberId: string;
  action_type: number;
  device_type: number;
  app_type: number;
  device_id: string;
  updated_by: string;
  match_participation_id: string;
  role_id: string;
  role_type: number;
}

export class UpdateLeagueMatchParticipationStatusInput {
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
  ParticipationId: string;
  ParticipationStatus: number;
}

export class TeamRolesInput {
  ParentClubKey: String
  MemberKey: String
  AppType: number
  ActionType: number
  activityCode: number
}