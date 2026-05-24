import { Component, Renderer2, ViewChild } from "@angular/core";
import { ActionSheetController, IonicPage, LoadingController, NavController, NavParams, AlertController, ModalController, Events, FabContainer } from "ionic-angular";
import { ThemeService } from "../../../../services/theme.service";
import { Storage } from "@ionic/storage";
import { SharedServices } from "../../../services/sharedservice";
import { FirebaseService } from "../../../../services/firebase.service";
import { CommonService, ToastMessageType, ToastPlacement } from "../../../../services/common.service";
import { Apollo } from "apollo-angular";
import moment from "moment";
import gql from "graphql-tag";
import { GraphqlService } from "../../../../services/graphql.service";
import { HttpService } from "../../../../services/http.service";
import { API } from "../../../../shared/constants/api_constants";
import { AppType } from "../../../../shared/constants/module.constants";
import { AllMatchData } from "../../../../shared/model/match.model";
import { DetailHeaderRow } from "../../../../shared/components/detail-header/detail-header.component";
import { ModuleTypeForEmail } from "../../mailtomemberbyadmin/mailtomemberbyadmin";
import { ModuleTypes } from "../../../../shared/constants/module.constants";
/**
 * Generated class for the MatchdetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-matchdetails",
  templateUrl: "matchdetails.html",
  providers: [HttpService]
})
export class MatchdetailsPage {
  @ViewChild('fab') fab: FabContainer;
  isDarkTheme: boolean = false;
  activeType: boolean = true;
  invitedType: boolean = true;
  UserInvitationStatus = {
    MatchId: "",
    MemberId: "",
  };
  participants: ParticipantModel[] = [];
  teams: TeamsModal[];
  winner_team = {
    index: 0,
    comments: "",
    comments_date: ""
  }

  match: AllMatchData;
  history: any;

  InvitationResponseInput = {
    MatchId: "",
    MemberKey: "",
    ParticipationStatus: 0,
    InviteStatus: 3,
  };
  parentClubKey: string;
  isCanEditTeams: boolean = false;
  isTeamParticipantsAvail: boolean = true;
  isHistory = false;

  // Match Players (REST-based)
  homePlayers: any[] = [];
  awayPlayers: any[] = [];
  showAddPlayerDialog: boolean = false;
  addPlayerSide: string = 'home';
  searchResults: any[] = [];
  playerSearchTerm: string = '';
  get confirmedCount(): number { return [...this.homePlayers, ...this.awayPlayers].filter(p => p.ParticipationStatus === 1).length; }
  get maxConfirmed(): number { return this.match && this.match.MatchType === 2 ? 4 : 2; }

  // Publish Result Dialog
  showResultDialog: boolean = false;
  resultType: string = 'normal';
  retiredPlayer: string = '';
  matchFormat: string = '3';
  sets: { home: string; away: string; tbHome: string; tbAway: string }[] = [
    { home: '', away: '', tbHome: '', tbAway: '' },
    { home: '', away: '', tbHome: '', tbAway: '' }
  ];
  publishing: boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private apollo: Apollo,
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
    private themeService: ThemeService,
    private events: Events,
    private renderer: Renderer2
  ) {
    console.log(
      `${this.navParams.get("selectedmatchId")}:${this.navParams.get(
        "selectedmemberkey"
      )}`
    );


    this.match = this.navParams.get("match");
    this.isHistory = this.navParams.get('isHistory')
    if (!this.isHistory) {
      this.isHistory = false
    }
    // Note: AllMatchData doesn't have Result property, so commenting out these lines
    // this.winner_team.comments = this.match.Result && this.match.Result.resultDescription ? this.match.Result.resultDescription : "";
    // this.winner_team.comments_date = this.match.Result && this.match.Result.CreatedAt ? this.match.Result.CreatedAt : "";
    console.log(this.match);
    this.UserInvitationStatus.MatchId = this.match.MatchId;
    this.InvitationResponseInput.MatchId = this.match.MatchId;
    // this.UserInvitationStatus.MemberKey = this.navParams.get("selectedmemberkey");
    console.log(this.UserInvitationStatus);
    this.getActiveTeams();
    this.getInvitedPlayers();
    this.loadMatchParticipants();
    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey
        this.UserInvitationStatus.MemberId = this.sharedservice.getLoggedInUserId();
        this.isCanEditTeams = true;
      }
    });
  }

  async ionViewDidLoad() {
    this.loadTheme();
  }

  ionViewWillEnter() {
    this.loadTheme();
    this.themeService.isDarkTheme$.subscribe(isDark => { this.applyTheme(isDark); });
    this.events.subscribe('theme:changed', (isDark) => { this.applyTheme(isDark); });
  }

  ionViewWillLeave() {
    this.events.unsubscribe('theme:changed');
  }

  private loadTheme(): void {
    this.storage.get('dashboardTheme').then((isDarkTheme) => {
      const isDark = isDarkTheme !== null && isDarkTheme !== undefined ? isDarkTheme : true;
      this.applyTheme(isDark);
    }).catch(() => { this.applyTheme(true); });
  }

  private applyTheme(isDark: boolean): void {
    this.isDarkTheme = isDark;
    const el = document.querySelector('page-matchdetails');
    if (el) {
      isDark ? this.renderer.removeClass(el, 'light-theme') : this.renderer.addClass(el, 'light-theme');
    } else {
      setTimeout(() => {
        const el2 = document.querySelector('page-matchdetails');
        if (el2) { isDark ? this.renderer.removeClass(el2, 'light-theme') : this.renderer.addClass(el2, 'light-theme'); }
      }, 100);
    }
  }

  get activeTabIndex(): number { return this.activeType ? 0 : 1; }
  onTabChange(index: number) { this.changeType(index === 0); }

  getFormattedDate(date: any) {
    return moment(+date).format("DD MMM YYYY, hh:mm A");
  }

  gotoMatchInvitePlayers() {
    let profileModal = this.modalCtrl.create("MatchinviteplayersPage", {
      selectedmatchId: this.UserInvitationStatus.MatchId,
      selectedmemberId: this.UserInvitationStatus.MemberId,
      existed_members: this.participants
    });
    profileModal.onDidDismiss(data => {
      console.log(data);
      if (data && data.canRefreshData) {
        this.getInvitedPlayers();
        this.loadMatchParticipants();
      }
    });
    profileModal.present();

  }

  formatMatchStartDate(date) {
    return moment(date, "YYYY-MM-DD HH:mm").local().format("DD-MMM-YYYY hh:mm A");
  }

  get headerAccentColor(): string {
    return this.commonService.getTypeAccentColor(this.match ? this.match.MatchType : undefined);
  }

  get headerDetailRows(): DetailHeaderRow[] {
    const rows: DetailHeaderRow[] = [];
    if (this.match && this.match.MatchStartDate) rows.push({ icon: 'calendar', text: this.formatMatchStartDate(this.match.MatchStartDate) });
    if (this.match && this.match.VenueName) rows.push({ icon: 'pin', text: (this.match as any).location && (this.match as any).location !== '' ? (this.match as any).location : this.match.VenueName });
    return rows;
  }

  getColor(index: number) {
    switch (index) {
      case 0:
        return 'green';
      case 1:
        return 'red';
    }
  }

  manipulateUser(user: User, teamIndex: number, userIndex: number) {
    if (user.isUserAvailable) {
      // User is already added, so we remove them
      user.isUserAvailable = !user.isUserAvailable;
      this.teams[teamIndex].Participants[userIndex].User.FirebaseKey = "";
      this.teams[teamIndex].Participants[userIndex].User.FirstName = "";
      this.teams[teamIndex].Participants[userIndex].User.LastName = "";
      this.teams[teamIndex].Participants[userIndex].User.isUserAvailable = false;

      // Check if all participants are valid after the removal
      this.checkIsTeamValid();
      // Update team data after modification
      this.teamsUpdateConfirmation(teamIndex, userIndex);
    } else {
      // User is not added, so we add them by showing available members to choose from
      this.showAvailableMembers(user, teamIndex, userIndex);
    }

  }

  getAvailableUsers() {
    let availbleUsers: UserModel[] = [];
    let team_participants: User[] = [];
    for (let i = 0; i < this.teams.length; i++) {
      if (this.teams[i].Participants.length > 0) {
        for (let j = 0; j < this.teams[i].Participants.length; j++) {
          team_participants.push(this.teams[i].Participants[j].User);
        }
      }
    }
    console.log(`parts::${JSON.parse(JSON.stringify(team_participants))}`);
    for (let i = 0; i < this.participants.length; i++) {
      let user = team_participants.find(participant => participant.Id == this.participants[i].User.Id);

      if (user) { //check if user there
        if ((user.isUserAvailable) && (this.participants[i].InviteStatus == 0 || this.participants[i].InviteStatus == 1)) {
          availbleUsers.push(this.participants[i].User);
        }
      } else {
        if (this.participants[i].InviteStatus == 0 || this.participants[i].InviteStatus == 1) availbleUsers.push(this.participants[i].User);
      }

      // if((!user) && (this.participants[i].InviteStatus == 0 || this.participants[i].InviteStatus == 1)){
      //   availbleUsers.push(this.participants[i].User);
      // }else{
      //   if(user.isUserAvailable)availbleUsers.push(this.participants[i].User);
      // }
    }

    return availbleUsers;
  }

  showAvailableMembers(member: User, teamIndex: number, userIndex: number) {
    let availableUsers = this.getAvailableUsers();

    // Filter out users who are already in the team
    // const selectedUserIds = this.teams[teamIndex].Participants.map(participant => participant.User.Id);
    // availableUsers = availableUsers.filter(user => !selectedUserIds.includes(user.Id));

    if (availableUsers.length > 0) {
      console.log(availableUsers)
      let alert = this.alertCtrl.create();
      alert.setTitle(`Add member to the ${this.teams[teamIndex].TeamName}`);

      for (let userIndex = 0; userIndex < availableUsers.length; userIndex++) {
        alert.addInput({
          type: 'radio',
          label: `${availableUsers[userIndex].FirstName} ${availableUsers[userIndex].LastName}`,
          value: availableUsers[userIndex].Id,
          checked: false
        });
      }

      alert.addButton('Cancel');
      alert.addButton({
        text: 'OK',
        handler: userpostgresId => {
          console.log(userpostgresId);
          const participant = this.participants.find(participant => participant.User.Id === userpostgresId);
          this.teams[teamIndex].Participants[userIndex].User.Id = participant.User.Id;
          this.teams[teamIndex].Participants[userIndex].User.FirstName = participant.User.FirstName;
          this.teams[teamIndex].Participants[userIndex].User.LastName = participant.User.LastName;
          this.teams[teamIndex].Participants[userIndex].User.isUserAvailable = true;
          this.teamsUpdateConfirmation(teamIndex, userIndex);
        }
      });

      alert.present();

    } else {
      this.commonService.toastMessage("No users", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
    }

  }

  changeType(val) {
    this.activeType = val;
    this.invitedType = !val;
    this.activeType ? this.getActiveTeams() : this.getInvitedPlayers();
  }



  getInvitedPlayers() {
    //this.commonService.showLoader("Fetching invited players...");
    const participantsStatusQuery = gql`
      query checkAllParticipantsStatus($UserInput: UserInvitationStatus!) {
        checkAllParticipantsStatus(UserInput: $UserInput) {
          Id
          User {
            Id
            FirstName
            LastName
            Gender
            DOB
            FirebaseKey
          }
          ParticipationStatus
          InviteStatus
          InviteType
          TotalPoints
        }
      }
    `;
    this.graphqlService.query(participantsStatusQuery, { UserInput: this.UserInvitationStatus }, 0).subscribe((res: any) => {
      // this.commonService.hideLoader()
      this.participants = res.data.checkAllParticipantsStatus;
      this.canEditTeams();
    }, (error) => {
      this.commonService.hideLoader();
      this.commonService.toastMessage("Failed to fetch invited players list", 2500, ToastMessageType.Error);
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
    })
  };

  canEditTeams() {

    const isUserInParticipants = this.participants.some(participant => participant.User && participant.User.Id === this.UserInvitationStatus.MemberId);
    if (isUserInParticipants) {
      this.isCanEditTeams = true;
      return;
    }


    // Note: AllMatchData doesn't have Hosts property, so commenting out host check
    // const isUserHostOfMatch = this.match.Hosts.some(host => host.User
    //   && host.User.Id === this.UserInvitationStatus.MemberId);
    // if (isUserHostOfMatch) {
    //   this.isCanEditTeams = true;
    //   return;
    // }

    this.isCanEditTeams = false;
  }

  // canEditTeams() {
  //   if (this.participants.length > 0) { // check the logged in user is in invite list
  //     const user = this.participants.find(participant => participant.User.Id === this.UserInvitationStatus.MemberId);
  //     if (user) this.isCanEditTeams = true;
  //   }
  //   else if (this.match.length > 0) { // check the logged in user is the host of match
  //     const user = this.match.Hosts(host => host.User.Id === this.UserInvitationStatus.MemberId);
  //     if (user) this.isCanEditTeams = true;
  //   }

  // }

  getActiveTeams() {
    //this.commonService.showLoader("Fetching teams...");
    this.teams = [];
    const getTeamsQuery = gql`
      query getTeamsByMatch($matchDetailsInput: FetchTeamsInput!) {
        getTeamsByMatch(matchDetailsInput: $matchDetailsInput) {
          Id
          TeamName
          TeamPoint
          ResultStatus
          Participants{
          PaymentStatus
          InviteStatus
          InviteType
          ParticipationStatus
            User{
              Id
              FirstName
              LastName
              FirebaseKey
            }
          }
      }
    }`;
    this.graphqlService.query(getTeamsQuery, { matchDetailsInput: { MatchId: this.UserInvitationStatus.MatchId } }, 0).subscribe((res: any) => {

      this.teams = res.data.getTeamsByMatch;
      console.log(this.teams.length);
      const participants_length = this.match.MatchType == 1 ? 1 : 2;
      this.teams = this.sortByTeamName(this.teams);

      if (this.teams.length > 0) {
        for (let i = 0; i < this.teams.length; i++) {
          this.teams[i]["IsWinner"] = false;
          this.teams[i]['Sets_Points'] = [];
          // Note: AllMatchData doesn't have Result property, so commenting out result-related logic
          // if (this.match.Result && this.match.Result.ResultStatus == 1) {
          //   this.teams[i]["IsWinner"] = this.match.Result.Winner.Id === this.teams[i].Id ? true : false;
          //   this.teams[i]["Sets_Points"] = this.match.Result && this.match.Result.ResultDetails ? JSON.parse(this.match.Result.ResultDetails.split(":")[i]) : [];
          // }

          for (let j = 0; j < participants_length; j++) {
            console.log(`${j}:${this.teams[i].Participants[j]}`);
            if (this.teams[i].Participants[j] && this.teams[i].Participants[j].User && this.teams[i].Participants[j].User.FirebaseKey != '') {
              this.teams[i].Participants[j].User["isUserAvailable"] = true;
            }
            else {
              let participant_obj = {
                InviteStatus: 0,
                InviteType: 0,
                ParticipationStatus: 0,
                PaymentStatus: 0,
                User: {
                  Id: '',
                  FirstName: '',
                  LastName: '',
                  FirebaseKey: '',
                  isUserAvailable: false
                }
              }
              this.teams[i].Participants[j] = participant_obj;
              console.log(this.teams[i].Participants[j]["User"]);
            }
          }
        }
        console.log("teams data" + JSON.stringify(this.teams));
        this.checkIsTeamValid();
        //console.log(this.isTeamParticipantsAvail);
      }
    }, (error) => {
      this.commonService.toastMessage("Failed to fetch teams", 2500, ToastMessageType.Error);
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

  //sorting teams by teamname
  sortByTeamName(teams: any) {
    return teams.sort((a, b) => (a.TeamName > b.TeamName) ? 1 : ((b.TeamName > a.TeamName) ? -1 : 0))
  }

  presentActionSheet(selectedparticipant: ParticipantModel) {
    if (!this.isHistory && selectedparticipant.InviteStatus < 2) {
      let actionSheet = this.actionSheetCtrl.create({
        title: "Do you want to cancel the invite?",
        buttons: [
          {
            text: "Yes",
            role: "destructive",
            icon: "checkmark",
            handler: () => {
              this.invite(selectedparticipant);
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
  }

  invite(selectedparticipant) {

    // this.apollo
    //   .mutate({
    //     mutation: gql`
    //       mutation inviteResponse(
    //         $InvitationResponseInput: UserInviteResponseInput!
    //       ) {
    //         inviteResponse(InvitationResponseInput: $InvitationResponseInput)
    //       }
    //     `,
    //     variables: { InvitationResponseInput: this.InvitationResponseInput },
    //   })
    //   .subscribe(
    //     ({ data }) => {
    //       this.commonService.hideLoader();
    //       console.log("invite data" + data["inviteResponse"]);
    //       this.commonService.toastMessage("Invite cancelled successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
    //       this.getInvitedPlayers();
    //     },
    //     (err) => {
    //       this.commonService.hideLoader();
    //       console.log(JSON.stringify(err));
    //       this.commonService.toastMessage("Invite cancellation failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    //     }
    //   );

    try {

      this.InvitationResponseInput.MemberKey =
        selectedparticipant.User.FirebaseKey;
      const invite_User = gql`
        mutation  inviteResponse( $InvitationResponseInput: UserInviteResponseInput!){
          inviteResponse(InvitationResponseInput: $InvitationResponseInput)
        }
        `;
      const deleteVariable = { InvitationResponseInput: this.InvitationResponseInput }

      this.graphqlService.mutate(invite_User, deleteVariable, 1).subscribe((response) => {
        const message = "Invite cancelled successfully";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.getInvitedPlayers();
      }, (err) => {
        console.error("GraphQL mutation error:", err);
        this.commonService.toastMessage("Invite cancellation failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
      )
    } catch (error) {

      console.error("An error occurred:", error);

    }

  }

  checkIsTeamValid() {
    let isAllUserAvailStatus: boolean = true;
    for (let i = 0; i < this.teams.length; i++) {
      if (this.teams[i].Participants.length > 0) {
        for (let j = 0; j < this.teams[i].Participants.length; j++) {
          let participant = this.teams[i].Participants[j];
          if (!participant.User || !participant.User.isUserAvailable) {
            isAllUserAvailStatus = false;
            console.log(`about to break in if`);
            break;
          }
        }
        if (!isAllUserAvailStatus) break;
      }
    }
    this.isTeamParticipantsAvail = isAllUserAvailStatus;
  }

  teamsUpdateConfirmation(teamIndex: number, userIndex: number) {
    let team_updateInput = {
      TeamId: this.teams[teamIndex].Id,
      MatchId: this.match.MatchId,
      Players: []
    }

    this.teams[teamIndex].Participants.filter(participant => participant.User.isUserAvailable).map((participant) => {
      team_updateInput.Players.push(participant.User.Id);
    });

    this.updateTeams(team_updateInput);
  }

  updateTeams(update_team_input) {
    try {


      const update_Team = gql`
      mutation  updateTeam($ModifyTeamDetailsInput: TeamInput!){
        updateTeam(ModifyTeamDetailsInput: $ModifyTeamDetailsInput){
         TeamName
          Description
          ResultStatus
        }
      }
      `;
      const deleteVariable = { ModifyTeamDetailsInput: update_team_input }

      this.graphqlService.mutate(update_Team, deleteVariable, 0).subscribe((response) => {
        const message = "teams updated successfully";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.checkIsTeamValid();
        this.getInvitedPlayers();

      }, (err) => {
        console.error("GraphQL mutation error:", err);
        this.commonService.toastMessage("teams updation failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
      )
    } catch (error) {

      console.error("An error occurred:", error);

    }
    // this.apollo
    //   .mutate({
    //     mutation: gql`
    //     mutation updateTeam($ModifyTeamDetailsInput: TeamInput!) {
    //       updateTeam(ModifyTeamDetailsInput: $ModifyTeamDetailsInput){
    //         TeamName
    //         Description
    //         ResultStatus
    //       }
    //     }
    //   `,
    //     variables: { ModifyTeamDetailsInput: update_team_input },
    //   })
    //   .subscribe(
    //     ({ data }) => {
    //       console.log("invite data" + data["updateTeam"]);
    //       this.commonService.toastMessage("teams updated successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
    //       this.checkIsTeamValid();
    //       this.getInvitedPlayers(); //to refresh the available invite players
    //     },
    //     (err) => {
    //       console.log(JSON.stringify(err));
    //       this.commonService.toastMessage("teams updation failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    //     }
    //   );
  }


  goto_publishresult() {
    this.resultType = 'normal';
    this.retiredPlayer = '';
    this.matchFormat = '3';
    this.sets = [
      { home: '', away: '', tbHome: '', tbAway: '' },
      { home: '', away: '', tbHome: '', tbAway: '' }
    ];
    this.showResultDialog = true;
  }

  onResultTypeChange() {
    if (this.resultType === 'walkover') {
      this.sets = [{ home: '', away: '', tbHome: '', tbAway: '' }];
    }
  }

  onFormatChange() {
    var max = parseInt(this.matchFormat);
    this.sets = max === 1
      ? [{ home: '', away: '', tbHome: '', tbAway: '' }]
      : [{ home: '', away: '', tbHome: '', tbAway: '' }, { home: '', away: '', tbHome: '', tbAway: '' }];
  }

  addSet() {
    if (this.sets.length < parseInt(this.matchFormat)) {
      this.sets.push({ home: '', away: '', tbHome: '', tbAway: '' });
    }
  }

  removeSet(i: number) {
    if (this.sets.length > 1) this.sets.splice(i, 1);
  }

  onScoreInput(i: number, field: string, val: string) {
    this.sets[i][field] = val;
    var v = parseInt(val);
    if (isNaN(v)) return;
    var other = field === 'home' ? 'away' : 'home';
    if (!this.sets[i][other]) {
      if (v >= 0 && v <= 4) this.sets[i][other] = '6';
      else if (v === 5) this.sets[i][other] = '7';
    }
    if (this.sets[i].home && this.sets[i].away && !this.isMatchDecided() && i === this.sets.length - 1 && this.sets.length < parseInt(this.matchFormat)) {
      this.sets.push({ home: '', away: '', tbHome: '', tbAway: '' });
    }
  }

  needsTiebreak(set: any): boolean {
    return (set.home == '7' && set.away == '6') || (set.home == '6' && set.away == '7');
  }

  getHomeSets(): number { return this.sets.filter(s => parseInt(s.home) > parseInt(s.away)).length; }
  getAwaySets(): number { return this.sets.filter(s => parseInt(s.away) > parseInt(s.home)).length; }

  isMatchDecided(): boolean {
    var setsToWin = Math.ceil(parseInt(this.matchFormat) / 2);
    return this.getHomeSets() >= setsToWin || this.getAwaySets() >= setsToWin;
  }

  getScoreText(): string {
    return this.sets.filter(s => s.home && s.away).map(s => {
      var base = s.home + '-' + s.away;
      return this.needsTiebreak(s) && s.tbHome && s.tbAway ? base + '(' + s.tbHome + '-' + s.tbAway + ')' : base;
    }).join('  ');
  }

  getWinner(): string {
    var homeName = (this.homePlayers[0] ? this.homePlayers[0].name : this.match.homeUserName) || '';
    var awayName = (this.awayPlayers[0] ? this.awayPlayers[0].name : this.match.awayUserName) || '';
    if (this.resultType === 'walkover' || this.resultType === 'retired') {
      return this.retiredPlayer === 'home' ? awayName : homeName;
    }
    var h = this.getHomeSets(), a = this.getAwaySets();
    return h > a ? homeName : a > h ? awayName : '';
  }

  publishResult() {
    this.publishing = true;
    var homeSets = this.getHomeSets();
    var awaySets = this.getAwaySets();

    // Get player IDs from loaded participants
    var homePlayer = this.homePlayers.find(function(p) { return p.ParticipationStatus === 1; }) || this.homePlayers[0];
    var awayPlayer = this.awayPlayers.find(function(p) { return p.ParticipationStatus === 1; }) || this.awayPlayers[0];
    var homeId = homePlayer ? homePlayer.userId : (this.match.homeUserId || '');
    var awayId = awayPlayer ? awayPlayer.userId : (this.match.awayUserId || '');
    var homeName = homePlayer ? homePlayer.name : (this.match.homeUserName || '');
    var awayName = awayPlayer ? awayPlayer.name : (this.match.awayUserName || '');

    var winner = this.getWinner();
    var winnerId = winner === homeName ? homeId : awayId;
    var loserId = winnerId === homeId ? awayId : homeId;
    var resultStatus = this.resultType === 'walkover' ? 4 : this.resultType === 'retired' ? 5 : 1;

    var setScores = this.sets.filter(s => s.home && s.away).map(function(s, i) {
      var homeWon = parseInt(s.home) > parseInt(s.away);
      return { SET_NUMBER: String(i + 1), SCORE: s.home + '-' + s.away, WINNER: homeWon ? homeName : awayName };
    });

    var resultJson = {
      RESULT: {
        RESULT_STATUS: String(resultStatus),
        LOSER_ID: loserId,
        DESCRIPTION: this.resultType === 'retired'
          ? (this.retiredPlayer === 'home' ? homeName : awayName) + ' retired'
          : this.resultType === 'walkover'
            ? (this.retiredPlayer === 'home' ? homeName : awayName) + ' withdrew'
            : ''
      },
      HOME_TEAM: {
        TEAM_NAME: homeName, TEAM_ID: homeId,
        SETS_WON: String(homeSets), GAMES_WON: '0', ACES: '0',
        DOUBLE_FAULTS: '0', FIRST_SERVE_PERCENTAGE: '0', UNFORCED_ERRORS: '0', BREAK_POINTS_WON: '0'
      },
      AWAY_TEAM: {
        TEAM_NAME: awayName,
        SETS_WON: String(awaySets), GAMES_WON: '0', ACES: '0',
        DOUBLE_FAULTS: '0', FIRST_SERVE_PERCENTAGE: '0', UNFORCED_ERRORS: '0', BREAK_POINTS_WON: '0'
      },
      SET_SCORES: setScores
    };

    var payload = {
      MatchId: this.match.MatchId,
      WinnerId: winnerId,
      CreatedBy: this.sharedservice.getLoggedInUserId(),
      PublishedBy: this.sharedservice.getLoggedInUserId(),
      ResultStatus: resultStatus,
      ResultDetails: JSON.stringify(resultJson),
      resultDescription: '',
      app_type: AppType.ADMIN_NEW,
      device_type: this.sharedservice.getPlatform() === 'android' ? 1 : 2,
      parentclubId: this.sharedservice.getPostgreParentClubId()
    };

    this.httpService.post(API.PUBLISH_RESULT_STANDALONE, payload).subscribe({
      next: () => {
        this.publishing = false;
        this.showResultDialog = false;
        this.commonService.toastMessage('Result published successfully', 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.events.publish('match:refresh');
      },
      error: () => {
        this.publishing = false;
        this.commonService.toastMessage('Failed to publish result', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
    });
  }


  gotoViewCoaches() {
    this.navCtrl.push('ViewCoachesPage', { match_id: this.match.MatchId });
  }

  gotoEditMatch() {
    this.navCtrl.push('EditmatchPage', { match: this.match });
  }

  closeFab() {
    if (this.fab) this.fab.close();
  }

  gotoRecurringMatches() {
    this.closeFab();
    this.navCtrl.push('AddrecurringmatchesPage', { match: JSON.stringify(this.match) });
  }

  gotoEmailPage() {
    if (this.participants.length > 0) {
      const member_list = this.participants.map(p => ({
        IsChild: (p.User as any).IsChild || false,
        ParentId: (p.User as any).IsChild ? ((p.User as any).ParentId || "") : "",
        MemberId: p.User.Id,
        MemberEmail: (p.User as any).EmailID && (p.User as any).EmailID !== "" && (p.User as any).EmailID !== "-" && (p.User as any).EmailID !== "n/a"
          ? (p.User as any).EmailID
          : ((p.User as any).IsChild ? ((p.User as any).ParentEmailID || "") : ""),
        MemberName: p.User.FirstName + " " + p.User.LastName
      }));
      const email_modal = {
        module_info: {
          module_id: this.match.MatchId,
          module_booking_club_name: this.match.VenueName,
          module_booking_name: this.match.MatchTitle,
          module_booking_start_date: this.match.MatchStartDate,
        },
        email_users: member_list,
        type: ModuleTypeForEmail.MEMBER
      };
      this.navCtrl.push("MailToMemberByAdminPage", { email_modal });
    } else {
      this.commonService.toastMessage("No participant(s) found", 2500, ToastMessageType.Error);
    }
  }

  gotoNotificationPage() {
    if (this.participants.length > 0) {
      const user_ids = this.participants.map(p =>
        (p.User as any).IsChild ? ((p.User as any).ParentId || p.User.Id) : p.User.Id
      );
      const user_names = this.participants.map(p => p.User.FirstName + ' ' + p.User.LastName);
      this.navCtrl.push("NotificationsPage", {
        users: user_ids,
        user_names: user_names,
        type: ModuleTypes.Match,
        heading: `Match: ${this.match.MatchTitle}`,
        module_id: this.match.MatchId,
        page_id: "MATCHDETAILS"
      });
    } else {
      this.commonService.toastMessage("No participant(s) found", 2500, ToastMessageType.Error);
    }
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
    try {
      const delete_Match = gql`
       mutation deleteMatch($deleteMatchInput: DeleteMatchInput!) {
        deleteMatch(deleteMatchInput: $deleteMatchInput)
      }`
        ;
      const deleteVariable = { deleteMatchInput: { ParentClubKey: this.parentClubKey, MatchId: this.match.MatchId } }

      this.graphqlService.mutate(delete_Match, deleteVariable, 1).subscribe((response) => {
        const message = "match deleted successfully";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.commonService.updateCategory("match");
        this.events.publish('match:refresh');
        this.navCtrl.pop();

      }, (err) => {
        console.error("GraphQL mutation error:", err);
        this.commonService.toastMessage("match deletion failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
      )
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }

  // ─── REST-based Match Players (HOME/AWAY) ───
  loadMatchParticipants() {
    this.httpService.post(API.GET_MATCH_PARTICIPANTS, { MatchId: this.match.MatchId }).subscribe({
      next: (res: any) => {
        var data = (res && res.data) ? res.data : [];
        // Collect unique team_ids to determine home (first) vs away (second)
        var teamIds = [];
        data.forEach(function(p) {
          if (p.team_id && teamIds.indexOf(p.team_id) === -1) teamIds.push(p.team_id);
        });
        var homeTeamId = this.match.TeamId || this.match.homeUserId || teamIds[1] || '';
        var mapped = data.map(function(p) {
          var side = 'away';
          if (p.team_type === 'home' || p.team_type === 'Home') { side = 'home'; }
          else if (p.team_type === 'away' || p.team_type === 'Away') { side = 'away'; }
          else if (p.team_id === homeTeamId) { side = 'home'; }
          return {
            id: p.participationid || p.id,
            ParticipationId: p.participationid || p.id,
            ParticipationStatus: p.participation_status || 0,
            team_type: side,
            name: (p.first_name ? (p.first_name + ' ' + (p.last_name || '')).trim() : (p.FirstName ? (p.FirstName + ' ' + (p.LastName || '')).trim() : 'Unknown')),
            userId: p.user_id || p.UserId || ''
          };
        });
        this.homePlayers = mapped.filter(function(p) { return p.team_type === 'home'; });
        this.awayPlayers = mapped.filter(function(p) { return p.team_type === 'away'; });
      },
      error: () => { this.homePlayers = []; this.awayPlayers = []; }
    });
  }

  openAddPlayer(side: string) {
    this.addPlayerSide = side;
    this.playerSearchTerm = '';
    this.searchResults = [];
    this.showAddPlayerDialog = true;
  }

  private searchTimeout: any;
  onPlayerSearch(ev: any) {
    var val = ev && ev.target && ev.target.value ? ev.target.value : '';
    this.playerSearchTerm = val;
    clearTimeout(this.searchTimeout);
    if (val.length < 2) { this.searchResults = []; return; }
    this.searchTimeout = setTimeout(() => {
      var parentClubId = this.sharedservice.getPostgreParentClubId();
      var existingIds = [...this.homePlayers, ...this.awayPlayers].map(function(p) { return p.userId; });
      var searchQuery = gql`
        query getAllMembersByParentClubNMemberType($input: GetAllMembersByParentClubNMemberTypeInput!) {
          getAllMembersByParentClubNMemberType(input: $input) { Id FirstName LastName }
        }
      `;
      this.graphqlService.query(searchQuery, {
        input: { parentclub_id: parentClubId, club_id: '', search_term: val, member_type: 0, limit: 20, offset: 0 }
      }, 0).subscribe(
        (res: any) => {
          var members = res.data.getAllMembersByParentClubNMemberType || [];
          this.searchResults = members.filter(function(m) { return existingIds.indexOf(m.Id) === -1; });
        },
        () => { this.searchResults = []; }
      );
    }, 400);
  }

  addPlayerToMatch(member: any) {
    var payload: any = { matchId: this.match.MatchId, homePlayers: [], awayPlayers: [], autoConfirm: false };
    if (this.addPlayerSide === 'home') payload.homePlayers = [member.Id];
    else payload.awayPlayers = [member.Id];
    this.httpService.post(API.ADD_PLAYERS_TO_MATCH, payload).subscribe({
      next: () => {
        this.showAddPlayerDialog = false;
        this.loadMatchParticipants();
        this.commonService.toastMessage('Player added', 2500, ToastMessageType.Success, ToastPlacement.Bottom);
      },
      error: () => { this.commonService.toastMessage('Failed to add player', 2500, ToastMessageType.Error, ToastPlacement.Bottom); }
    });
  }

  updatePlayerStatus(player: any, status: number) {
    this.httpService.post(API.UPDATE_STANDALONE_PARTICIPATION_STATUS, {
      ParticipationId: player.ParticipationId || player.id,
      ParticipationStatus: status
    }).subscribe({
      next: () => { this.loadMatchParticipants(); },
      error: () => { this.commonService.toastMessage('Failed to update status', 2500, ToastMessageType.Error, ToastPlacement.Bottom); }
    });
  }

}
export class UserInvitationStatus {
  MatchId: string;
  MemberKey: string;
}

export class InvitationResponseInput {
  MatchId: String;
  MemberKey: String;
  ParticipationStatus: number;
  InviteStatus: number;
}
export class MatchModel {
  VenueKey: string;
  Id: string;
  Message: string;
  CreatedAt: any;
  UpdatedAt: string;
  CreatedBy: string;
  IsActive: boolean;
  IsEnable: boolean;
  MatchCreator: string; //APP Name
  Activity: ActivityModel; //Which activity it is inside the member App
  MatchVisibility: number;
  GameType: number;
  MatchType: number;
  PaymentType: number;
  ResultStatus: number;
  MatchStatus: number;
  VenueName: string;
  Details: string;
  MemberFees: number;
  NonMemberFees: number;
  MatchStartDate: any;
  Result: ResultModel;
  Capacity: number;
  MatchTitle: string;
  Teams: TeamModel[];
  Hosts: UserModel;
}

export class ActivityModel {
  ActivityKey: string;
  IsActive: boolean;
  IsEnable: boolean;
  ActivityCode: string;
  ActivityName: string;
  ActivityImageURL: string;
}

export class ResultModel {
  ResultDetails: string;
  ResultStatus: number;
  PublishedByApp: string;
  Winner: TeamModel;
}

export class TeamModel {
  Id: string;
  TeamName: string;
  ResultStatus: number;
  TeamPoint: number;
  Description: string;
  CoachName: string;
  Participants: ParticipantModel[];
}

export class ParticipantModel {
  ParticipationStatus: number;
  PaymentStatus: number;
  PaymentTracking: string;
  InviteStatus: number;
  TotalPoints: number;
  User: UserModel;
  CreatedAt: string;
  UpdatedAt: string;
  InviteType: number;
  TotalPonumbers: number;
  Team: TeamModel[];
  Match: MatchModel;
}

export class UserModel {
  Id: string;
  FirstName: string;
  LastName: string;
  Gender: string;
  DOB: string;
  FirebaseKey?: string;
}

//ladder model

export class LadderModel {
  IsActive: boolean;
  IsEnable: boolean;
  FirstName: string;
  LastName: string;
  rank: number;
  Points: number;
  IsSelf?: Boolean;
}
//invite players
export class MembersModel {
  FirstName: string;
  LastName: string;
  Gender: string;
  DOB: string;
  FirebaseKey: string;
}


export class TeamsModal {
  Id: string;
  TeamName: string;
  Participants: TeamParticipants[]
}

export class TeamParticipants {
  PaymentStatus: number
  InviteStatus: number
  InviteType: number
  ParticipationStatus: number
  User: User

}

export class User {
  Id: string
  FirstName: string
  LastName: string
  FirebaseKey: string
  isUserAvailable?: boolean
}

export class PublishResultInput {
  CreatedBy: string; //MemberKey
  ResultDetails: string; //MemberKey
  resultDescription: string; //MemberKey
  ResultStatus: number; //MemberKey
  MatchId: string; //matchId
  WinnerId: string; //Always a Team ID
  PublishedBy: string; //MemberKey
}