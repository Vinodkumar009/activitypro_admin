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
  Events,
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
import { ParticipantModel } from "../../match/matchdetails/matchdetails";
import { MatchType } from "../../../../shared/utility/enums";
import { ThemeService } from "../../../../services/theme.service";
import { DetailHeaderRow } from "../../../../shared/components/detail-header/detail-header.component";
import { SavedFormation } from "../models/lineup.model";
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
  participants: ParticipantModel[] = [];
  teams: TeamsModal[];
  TeamsType: boolean = true;
  MatchesType: boolean = true;
  league: LeaguesForParentClubModel;
  parentClubKey: string;
  activeIndex: number = 0;
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
  groups: any[] = [];
  participantGroups: any[] = [];
  pairs: any[] = [];
  showCreatePairDialog: boolean = false;
  pairPlayer1: any = null;
  pairPlayer2: any = null;
  selectedGroupPlayer: any = null;
  showCreateGroupDialog: boolean = false;
  numberOfGroups: number = 2;
  showRenameGroupDialog: boolean = false;
  renameGroupId: string = '';
  renameGroupValue: string = '';
  showDeleteGroupConfirm: boolean = false;
  groupToDelete: string = '';

  get matchesTabIndex(): number {
    return (this.individualLeague && this.individualLeague.league_type !== 3) ? 2 : 1;
  }

  get boxLeagueTabIndex(): number {
    return (this.individualLeague && this.individualLeague.league_type !== 3) ? 3 : 2;
  }

  get statsTabIndex(): number {
    return (this.individualLeague && this.individualLeague.league_type !== 3) ? 4 : 3;
  }
  partcipantDataCount: number;
  showLineupSheet: boolean = false;
  lineupFormations: SavedFormation[] = [];
  selectedLineupMatch: LeagueMatch = null;
  showParticipantSheet: boolean = false;
  selectedParticipant: LeagueParticipantModel = null;
  showTeamSheet: boolean = false;
  selectedTeam: LeagueStandingModel = null;

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
    private themeService: ThemeService,
    public events: Events
  ) {
    // this.league = this.navParams.get("league");
    // console.log(this.league);
    this.commonInput.parentclubId = this.sharedservice.getPostgreParentClubId();


  }


  async ionViewWillEnter() {
    this.loadTheme();
    this.themeService.isDarkTheme$.subscribe((isDark) => {
      this.applyTheme(isDark);
    });
    this.events.subscribe("theme:changed", (isDark) => {
      this.applyTheme(isDark);
    });
    this.events.subscribe("league:refresh", () => {
      this.getLeagueDetails();
      this.getLeagueMatches();
    });
    this.league_id = this.navParams.get("league_id");
    console.log("teams are", this.league_id);
    this.fetchGroups();
    this.fetchPairs();
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

  ionViewDidLoad() {
    console.log("ionViewDidLoad LeaguedetailsPage");
    this.activeIndex = 0;
    setTimeout(() => {
      this.loadTheme();
    }, 100);
  }

  get headerAccentColor(): string {
    return this.commonService.getTypeAccentColor(this.individualLeague ? this.individualLeague.league_type : undefined);
  }

  get headerDetailRows(): DetailHeaderRow[] {
    const rows: DetailHeaderRow[] = [];
    const l = this.individualLeague;
    if (l && l.start_date) rows.push({ icon: 'calendar', text: l.start_date + (l.end_date ? ' → ' + l.end_date : '') });
    if (l && l.club && l.club.ClubName) rows.push({ icon: 'pin', text: l.club.ClubName });
    return rows;
  }

  ionViewDidEnter() {
    this.closeFab();
  }

  ionViewWillLeave() {
    this.events.unsubscribe("theme:changed");
    this.events.unsubscribe("league:refresh");
  }

  private loadTheme(): void {
    this.storage.get("dashboardTheme").then((isDarkTheme) => {
      const isDark = isDarkTheme !== null && isDarkTheme !== undefined ? isDarkTheme : true;
      this.applyTheme(isDark);
    }).catch(() => {
      this.applyTheme(true);
    });
  }

  private applyTheme(isDark: boolean): void {
    const applyThemeToElement = () => {
      const element = document.querySelector("page-leaguedetails");
      if (element) {
        if (isDark) {
          element.classList.remove("light-theme");
          document.body.classList.remove("light-theme");
        } else {
          element.classList.add("light-theme");
          document.body.classList.add("light-theme");
        }
        return true;
      }
      return false;
    };

    if (!applyThemeToElement()) {
      setTimeout(() => applyThemeToElement(), 100);
    }
  }

  closeFab() {
    if (this.fab) {
      this.fab.close();
    }
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
        this.commonService.hideLoader();
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
    // const match_data = {
    //   ...mat
    //   formatted_round: mat.formatted_round
    // };
    // this.navCtrl.push("LeagueMatchInfoPage", { "match": mat, "leagueId": this.individualLeague.id, "activityCode": this.individualLeague.activity.ActivityCode, "activityId": this.individualLeague.activity.Id, "existingteam": this.leagueStanding.map(league_team => league_team.parentclubteam) });
    // this.navCtrl.push("LeagueMatchInfoPage", { "leagueId": this.individualLeague.id, "activityId": this.individualLeague.activity.Id, "existingteam": this.partcipantData });

    const existingTeam = this.leagueStanding ? this.leagueStanding.map(league_team => league_team.parentclubteam) : [];
    this.navCtrl.push("LeagueMatchInfoPage", {
      "match": mat,
      "leagueId": this.individualLeague.id,
      "activityCode": this.individualLeague.activity.ActivityCode,
      "activityId": this.individualLeague.activity.Id,
      "existingteam": existingTeam
    });
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

  getActiveTeams = (match: LeagueMatch) => {
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
              FirstName
              LastName
              FirebaseKey
            }
          }
      }
    }`;
    this.graphqlService.query(getTeamsQuery, { matchDetailsInput: { MatchId: match.match_id } }, 0)
      .subscribe(
        (res: any) => {
          const data = res.data;
          // console.log(
          //   "teams data" + JSON.stringify(data["getTeamsByMatch"])
          // );
          //this.commonService.hideLoader();
          this.teams = data["getTeamsByMatch"];
          console.log(this.teams.length);
          const participants_length = match.league_type == 0 ? 1 : 2;
          //this.teams = this.sortByTeamName(this.teams);
          if (this.teams.length > 0) {
            for (let i = 0; i < this.teams.length; i++) {
              this.teams[i]["IsWinner"] = false;
              this.teams[i]['Sets_Points'] = [];
              // if(this.match.Result && this.match.Result.ResultStatus == 1){
              //   this.teams[i]["IsWinner"] = this.match.Result.Winner.Id === this.teams[i].Id ? true : false;
              //   this.teams[i]["Sets_Points"] = this.match.Result && this.match.Result.ResultDetails ? JSON.parse(this.match.Result.ResultDetails.split(":")[i]) : [];
              //   //this.teams[i]["Sets_Points"] = this.match.Result.Winner.Id === this.teams[i].Id ? JSON.parse(this.match.Result.ResultDetails.split(":")[i]) : [];

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
            const teams = JSON.parse(JSON.stringify(this.teams));
            this.navCtrl.push("PublishresultPage", { matchId: match.match_id, teams: teams });
          }
        },
        (err) => {
          //this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage("Failed to fetch teams", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        }
      );
  }

  goToLineup(match: LeagueMatch) {
    // Show action sheet with saved formations instead of directly navigating
    this.fetchSavedFormations(match);
  }

  private fetchSavedFormations(match: LeagueMatch) {
    const deviceType = this.sharedservice.getPlatform() === "android" ? 1 : 2;
    const payload = {
      parentclubId: this.sharedservice.getPostgreParentClubId(),
      clubId: "",
      activityId: this.individualLeague.activity.Id, // Hardcoded activity ID
      memberId: this.sharedservice.getLoggedInId(),
      action_type: 0,
      device_type: deviceType,
      app_type: AppType.ADMIN_NEW,
      device_id: "",
      updated_by: this.sharedservice.getLoggedInId(),
      matchId: match.match_id
    };

    this.httpService.post(API.GET_SAVED_FORMATIONS, payload)
      .subscribe(
        (res: any) => {
          const savedFormations: SavedFormation[] = res.data || [];
          this.presentLineupActionSheet(match, savedFormations);
        },
        (error) => {
          console.error("Error fetching saved formations:", error);
          // Still show the action sheet with the "Create New" option even if fetch fails
          this.presentLineupActionSheet(match, []);
        }
      );
  }

  private presentLineupActionSheet(match: LeagueMatch, savedFormations: SavedFormation[]) {
    if (!match.homeusername || !match.awayusername) {
      this.commonService.toastMessage('Please assign teams first', 2500, ToastMessageType.Error);
      return;
    }
    if (this.individualLeague.activity.Id !== 'd47c2ac4-e571-488f-a895-c1940726900f') {
      this.commonService.toastMessage('Team lineup data is not available for this activity', 2500, ToastMessageType.Info);
      return;
    }
    this.selectedLineupMatch = match;
    this.lineupFormations = savedFormations;
    this.showLineupSheet = true;
  }

  selectFormation(f: SavedFormation) {
    this.showLineupSheet = false;
    this.navigateToLineup(this.selectedLineupMatch, f.lineup_name, false, f.formation_setup_id, f.team_id, f.team_size);
  }

  createNewLineup() {
    this.showLineupSheet = false;
    this.navigateToLineup(this.selectedLineupMatch, '', true);
  }

  private navigateToLineup(match: LeagueMatch, lineupName: string = '', isCreateNew: boolean = false, formationSetupId: string = '', teamId: string = '', teamSize: number = 0) {
    this.navCtrl.push("LineupPage", {
      match: match,
      matchId: match.match_id,
      activityId: this.individualLeague.activity.Id, // Hardcoded activity ID
      homeUserId: match.home_team_id,      // Map from LeagueMatch property
      awayUserId: match.away_team_id,      // Map from LeagueMatch property
      homeUserName: match.homeusername, // Use lowercase
      awayUserName: match.awayusername, // Use lowercase
      lineupName: isCreateNew ? '' : (lineupName || 'Starting line-up'),
      isCreateNew: isCreateNew,
      formationSetupId: formationSetupId,
      teamId: teamId,
      teamSize: teamSize,
      isLeague: true,           // True when navigating from league details
      leagueId: this.league_id  // Pass the league ID
    });
  }

  gotoMatchDetails(match: LeagueMatch) {
    // this.navCtrl.push("LeaguematchdetailsPage");
    //this.navCtrl.push("UpdateleaguematchPage", { leagueId: this.individualLeague.id });
    let actionSheet = this.actionSheetCtrl.create({

      buttons: [
        // {
        //   text: "Manage Teams",
        //   handler: () => {
        //     this.gotoManageTeamsPage();
        //   }
        // },
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
        // {
        //   text: "Update Result",
        //   handler: () => {

        //     //this.updateResult(match);
        //     const todays_date = moment().format("YYYY-MM-DD hh:mm A");
        //     // if (moment(this.match.MatchStartDate, "YYYY-MM-DD hh:mm A").isAfter(todays_date)) {
        //     //   this.commonService.toastMessage("cannot publish future match", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        //     //   return false;
        //     // }
        //     this.getActiveTeams(match);
        //   }
        // }
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
    this.httpService.post(API.DELETE_LEAGUE_MATCHES, commonInput).subscribe({
      next: (res: any) => {
        const message = "Match deleted successfully";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        console.log("match deleted", res);
        this.getLeagueMatches();
      }
    });
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
      league_type_text: this.individualLeague.league_type_text,
      activityId: this.individualLeague.activity.Id,
      league_type: this.individualLeague.league_type
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
      league_type: this.individualLeague.league_type
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
    this.selectedParticipant = participant;
    this.showParticipantSheet = true;
  }

  onParticipantAction(action: string) {
    this.showParticipantSheet = false;
    const participant = this.selectedParticipant;
    if (!participant) return;
    switch (action) {
      case 'payment': this.updatePayment(participant); break;
      case 'profile': this.getProfile(participant); break;
      case 'email': this.sendEmailToMember(participant); break;
      case 'remove':
        const actionType = participant.amount_pay_status === 0 ? 1 : 2;
        this.removeTeam(participant, actionType);
        break;
    }
  }

  gotoTeamDetails(team) {
    this.navCtrl.push("TeamdetailsPage", {
      "team": { ...team.parentclubteam, Id: team.parentclubteam.id }
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
        let message: string = '';
        if (this.individualLeague.league_type === MatchType.TEAM && this.leagueStanding.length === 1) {
          message = "Team removed from the competition";
        } else {
          message = actionType === 1 ? "Member removed successfully" : "Member withdrawal successfully";
        }

        this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        // this.weeklySessionDetails();
        //this.individualLeague.league_type_text != 'Team' ? this.getLeagueParticipants() : this.teamStanding();
        this.individualLeague.league_type !== MatchType.TEAM ? this.getLeagueParticipants() : this.teamStanding();
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
              matches
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
      "team": { ...team.parentclubteam, Id: team.parentclubteam.id }
    })
  }

  openTeamActions(team: LeagueStandingModel) {
    this.selectedTeam = team;
    this.showTeamSheet = true;
  }

  onTeamAction(action: string) {
    this.showTeamSheet = false;
    const team = this.selectedTeam;
    if (!team) return;
    switch (action) {
      case 'view': this.navCtrl.push("TeamdetailsPage", { "team": { ...team.parentclubteam, Id: team.parentclubteam.id } }); break;
      case 'remove': this.removeTeam(team, 1); break;
    }
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


  sendEmailToGroup(){
    const member_list = this.partcipantData.map(participant => this.prepareParticipantData(participant));
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
    this.commonInput.action_type = 2;

    this.httpService.post(API.GET_LEAGUE_MATCHES, this.commonInput).subscribe({
      next: (res: any) => {
        this.match = res.data;
        this.matchesLength = this.match.length;
        this.computeStats();
      }
    });
  }

  statsData: any[] = [];
  activeBoxGroup: number = 0;

  computeStats() {
    const stats: any = {};
    if (!this.match) { this.statsData = []; return; }
    this.match.forEach((m: any) => {
      if (!m.result_json) return;
      var json: any;
      try { json = typeof m.result_json === 'string' ? JSON.parse(m.result_json) : m.result_json; } catch (e) { return; }
      var homeId = json && json.HOME_TEAM && json.HOME_TEAM.TEAM_ID;
      var awayId = json && json.AWAY_TEAM && json.AWAY_TEAM.TEAM_ID;
      var winnerId = json && json.RESULT && json.RESULT.WINNER_ID;
      if (!homeId || !awayId) return;
      var homeName = m.homeusername || 'Home';
      var awayName = m.awayusername || 'Away';
      if (!stats[homeName]) stats[homeName] = { name: homeName, played: 0, won: 0, lost: 0, setsWon: 0, setsLost: 0, ptsWon: 0, ptsLost: 0 };
      if (!stats[awayName]) stats[awayName] = { name: awayName, played: 0, won: 0, lost: 0, setsWon: 0, setsLost: 0, ptsWon: 0, ptsLost: 0 };
      stats[homeName].played++;
      stats[awayName].played++;
      if (winnerId === homeId) { stats[homeName].won++; stats[awayName].lost++; }
      else if (winnerId === awayId) { stats[awayName].won++; stats[homeName].lost++; }
      var sets = (json.SET_SCORES || []).filter(function(s) { return s.SCORE && s.SCORE !== '0-0'; });
      sets.forEach(function(s) {
        var parts = (s.SCORE || '0-0').split('-').map(Number);
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          stats[homeName].ptsWon += parts[0]; stats[homeName].ptsLost += parts[1];
          stats[awayName].ptsWon += parts[1]; stats[awayName].ptsLost += parts[0];
          if (parts[0] > parts[1]) { stats[homeName].setsWon++; stats[awayName].setsLost++; }
          else if (parts[1] > parts[0]) { stats[awayName].setsWon++; stats[homeName].setsLost++; }
        }
      });
    });
    this.statsData = Object.keys(stats).map(function(k) {
      var s = stats[k];
      return { name: s.name, played: s.played, won: s.won, lost: s.lost, setsWon: s.setsWon, setsLost: s.setsLost, ptsWon: s.ptsWon, ptsLost: s.ptsLost, winPct: (s.ptsWon + s.ptsLost) > 0 ? Math.round((s.ptsWon / (s.ptsWon + s.ptsLost)) * 100) : 0 };
    }).sort(function(a, b) { return b.won - a.won || b.winPct - a.winPct; });
  }

  getBoxParticipants(): any[] {
    if (this.groups.length > 1) {
      var grouped = this.getGroupedParticipants();
      var group = grouped[this.activeBoxGroup];
      var names = (group && group.playerNames) ? group.playerNames : [];
      var self = this;
      return names.map(function(name) {
        return self.partcipantData.find(function(p) { return p.participant_name === name; }) || { participant_name: name };
      }).sort(function(a, b) { return (a.participant_name || '').localeCompare(b.participant_name || ''); });
    }
    return (this.partcipantData || []).slice().sort(function(a, b) { return (a.participant_name || '').localeCompare(b.participant_name || ''); });
  }

  getBoxScore(i: number, j: number): string {
    var players = this.getBoxParticipants();
    var home = players[i] ? (players[i].participant_name || '').trim().toLowerCase() : '';
    var away = players[j] ? (players[j].participant_name || '').trim().toLowerCase() : '';
    if (!this.match || !home || !away) return '';
    var m = this.match.find(function(mat) {
      var mHome = (mat.homeusername || '').trim().toLowerCase();
      var mAway = (mat.awayusername || '').trim().toLowerCase();
      return (mHome === home && mAway === away) || (mHome === away && mAway === home);
    });
    if (!m || !m.result_json) return '';
    try {
      var json = typeof m.result_json === 'string' ? JSON.parse(m.result_json) : m.result_json;
      var sets = (json.SET_SCORES || []).filter(function(s) { return s.SCORE && s.SCORE !== '0-0'; });
      if (sets.length === 0) return '';
      var scores = sets.map(function(s) { return s.SCORE; });
      var mHome = (m.homeusername || '').trim().toLowerCase();
      if (mHome === home) return scores.join(' ');
      return scores.map(function(s) { return s.split('-').reverse().join('-'); }).join(' ');
    } catch (e) { return ''; }
  }

  getBoxPoints(i: number): number {
    var players = this.getBoxParticipants();
    var player = players[i] ? (players[i].participant_name || '').trim().toLowerCase() : '';
    if (!this.match) return 0;
    return this.match.filter(function(m) {
      if (!m.result_json) return false;
      try {
        var json = typeof m.result_json === 'string' ? JSON.parse(m.result_json) : m.result_json;
        var winnerId = json && json.RESULT ? json.RESULT.WINNER_ID : null;
        if (!winnerId) return false;
        if ((m.homeusername || '').trim().toLowerCase() === player && winnerId === m.home_participant_id) return true;
        if ((m.awayusername || '').trim().toLowerCase() === player && winnerId === m.away_participant_id) return true;
        return false;
      } catch (e) { return false; }
    }).length * 3;
  }

  onBoxCellClick(i: number, j: number) {
    var players = this.getBoxParticipants();
    var home = players[i] ? players[i] : null;
    var away = players[j] ? players[j] : null;
    if (!home || !away) return;
    var homeName = home.participant_name || '';
    var awayName = away.participant_name || '';
    var homeNameLc = homeName.trim().toLowerCase();
    var awayNameLc = awayName.trim().toLowerCase();
    var m = this.match ? this.match.find(function(mat) {
      var mH = (mat.homeusername || '').trim().toLowerCase();
      var mA = (mat.awayusername || '').trim().toLowerCase();
      return (mH === homeNameLc && mA === awayNameLc) || (mH === awayNameLc && mA === homeNameLc);
    }) : null;
    if (m) {
      this.openPublishDialog(m);
    } else {
      this.selectedMatchForAction = {
        fixture_id: '',
        match_id: '',
        homeusername: homeName,
        awayusername: awayName,
        home_participant_id: home.id || '',
        away_participant_id: away.id || '',
        ResultStatus: 0,
        result_json: null
      } as any;
      this.openPublishDialog(this.selectedMatchForAction);
    }
  }

  // ─── Doubles Box League ───
  getDoublesBoxScore(i: number, j: number): string {
    var homePair = this.pairs[i];
    var awayPair = this.pairs[j];
    if (!homePair || !awayPair || !this.match) return '';
    var homeIds = homePair.players ? homePair.players.map(function(p) { return p.id; }) : [];
    var awayIds = awayPair.players ? awayPair.players.map(function(p) { return p.id; }) : [];
    var m = this.match.find(function(mat) {
      if (!mat.result_json) return false;
      try {
        var json = typeof mat.result_json === 'string' ? JSON.parse(mat.result_json) : mat.result_json;
        var hId = json && json.HOME_TEAM ? json.HOME_TEAM.TEAM_ID : '';
        var aId = json && json.AWAY_TEAM ? json.AWAY_TEAM.TEAM_ID : '';
        return (homeIds.indexOf(hId) > -1 && awayIds.indexOf(aId) > -1) ||
               (awayIds.indexOf(hId) > -1 && homeIds.indexOf(aId) > -1);
      } catch (e) { return false; }
    });
    if (!m || !m.result_json) return '';
    try {
      var json = typeof m.result_json === 'string' ? JSON.parse(m.result_json) : m.result_json;
      var sets = (json.SET_SCORES || []).filter(function(s) { return s.SCORE && s.SCORE !== '0-0'; });
      if (sets.length === 0) return '';
      var hId = json.HOME_TEAM ? json.HOME_TEAM.TEAM_ID : '';
      var rowIsHome = homeIds.indexOf(hId) > -1;
      return sets.map(function(s) {
        var parts = s.SCORE.split('-');
        return rowIsHome ? s.SCORE : parts[1] + '-' + parts[0];
      }).join(' ');
    } catch (e) { return ''; }
  }

  getDoublesBoxPoints(i: number): number {
    var pair = this.pairs[i];
    if (!pair || !this.match) return 0;
    var playerIds = pair.players ? pair.players.map(function(p) { return p.id; }) : [];
    return this.match.filter(function(m) {
      if (!m.result_json) return false;
      try {
        var json = typeof m.result_json === 'string' ? JSON.parse(m.result_json) : m.result_json;
        var winnerId = json && json.RESULT ? json.RESULT.WINNER_ID : '';
        return winnerId && playerIds.indexOf(winnerId) > -1;
      } catch (e) { return false; }
    }).length * 3;
  }

  onDoublesBoxCellClick(i: number, j: number) {
    var homePair = this.pairs[i];
    var awayPair = this.pairs[j];
    if (!homePair || !awayPair) return;
    var homeIds = homePair.players ? homePair.players.map(function(p) { return p.id; }) : [];
    var awayIds = awayPair.players ? awayPair.players.map(function(p) { return p.id; }) : [];

    // Find existing match
    var m = this.match ? this.match.find(function(mat) {
      var homeNameLc = (mat.homeusername || '').trim().toLowerCase();
      var awayNameLc = (mat.awayusername || '').trim().toLowerCase();
      var homePairName = (homePair.pair_name || '').trim().toLowerCase();
      var awayPairName = (awayPair.pair_name || '').trim().toLowerCase();
      return (homeNameLc === homePairName && awayNameLc === awayPairName) ||
             (homeNameLc === awayPairName && awayNameLc === homePairName);
    }) || this.match.find(function(mat) {
      if (!mat.result_json) return false;
      try {
        var json = typeof mat.result_json === 'string' ? JSON.parse(mat.result_json) : mat.result_json;
        var hId = json && json.HOME_TEAM ? json.HOME_TEAM.TEAM_ID : '';
        var aId = json && json.AWAY_TEAM ? json.AWAY_TEAM.TEAM_ID : '';
        return (homeIds.indexOf(hId) > -1 && awayIds.indexOf(aId) > -1) ||
               (awayIds.indexOf(hId) > -1 && homeIds.indexOf(aId) > -1);
      } catch (e) { return false; }
    }) : null;

    if (m) {
      this.openPublishDialog(m);
    } else {
      this.selectedMatchForAction = {
        fixture_id: '',
        match_id: '',
        homeusername: homePair.pair_name,
        awayusername: awayPair.pair_name,
        home_participant_id: homeIds[0] || '',
        away_participant_id: awayIds[0] || '',
        home_participant_id2: homeIds[1] || '',
        away_participant_id2: awayIds[1] || '',
        ResultStatus: 0,
        result_json: null
      } as any;
      this.openPublishDialog(this.selectedMatchForAction);
    }
  }

  fetchGroups() {
    this.httpService.post(API.GET_GROUPS, { league_id: this.league_id }).subscribe({
      next: (res: any) => {
        this.groups = res.data || [];
        this.httpService.post(API.GET_PARTICIPANT_GROUPS, { league_id: this.league_id }).subscribe({
          next: (pgRes: any) => { this.participantGroups = pgRes.data || []; },
          error: () => {}
        });
      },
      error: () => {}
    });
  }

  fetchPairs() {
    this.httpService.post(API.GET_PAIRS, { league_id: this.league_id }).subscribe({
      next: (res: any) => { this.pairs = res.data || []; },
      error: () => {}
    });
  }

  openCreatePair() {
    this.pairPlayer1 = null;
    this.pairPlayer2 = null;
    this.showCreatePairDialog = true;
  }

  selectPairPlayer(player: any) {
    if (!this.pairPlayer1) {
      this.pairPlayer1 = player;
    } else if (!this.pairPlayer2 && player.id !== this.pairPlayer1.id) {
      this.pairPlayer2 = player;
    }
  }

  resetPairSelection() {
    this.pairPlayer1 = null;
    this.pairPlayer2 = null;
  }

  createPair() {
    if (!this.pairPlayer1 || !this.pairPlayer2) return;
    this.httpService.post(API.CREATE_PAIR, {
      league_id: this.league_id,
      player1_id: this.pairPlayer1.id,
      player2_id: this.pairPlayer2.id
    }).subscribe({
      next: () => {
        this.showCreatePairDialog = false;
        this.fetchPairs();
        this.commonService.toastMessage('Pair created', 2500, ToastMessageType.Success, ToastPlacement.Bottom);
      },
      error: (err) => {
        this.commonService.toastMessage((err && err.error && err.error.message) || 'Failed to create pair', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
    });
  }

  removePair(pairId: string) {
    this.httpService.post(API.REMOVE_PAIR, { pair_id: pairId }).subscribe({
      next: () => {
        this.fetchPairs();
        this.commonService.toastMessage('Pair removed', 2500, ToastMessageType.Success, ToastPlacement.Bottom);
      },
      error: () => {
        this.commonService.toastMessage('Failed to remove pair', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
    });
  }

  getPlayerPairName(playerId: string): string {
    var pair = this.pairs.find(function(p) {
      return p.players && p.players.some(function(pl) { return pl.id === playerId; });
    });
    return pair ? pair.pair_name : '';
  }

  getGroupedParticipants(): any[] {
    if (this.groups.length === 0) return [];
    return this.groups.map(g => {
      var players = this.partcipantData.filter(p => {
        var assignment = this.participantGroups.find(a => a.id === p.id);
        return assignment && assignment.group_id === g.id;
      });
      return { id: g.id, name: g.name, playerNames: players.map(p => p.participant_name) };
    });
  }

  getGroupStats(playerNames: string[]): any[] {
    var nameSet = {};
    playerNames.forEach(function(n) { nameSet[n] = true; });
    return this.statsData.filter(function(s) { return nameSet[s.name]; });
  }

  getGroupedPlayersForDisplay(): any[] {
    var self = this;
    var grouped = [];
    var groupIds = {};
    this.groups.forEach(function(g) { groupIds[g.id] = true; });

    if (this.groups.length > 0) {
      grouped = this.groups.map(function(g) {
        var players = (self.partcipantData || []).filter(function(p) {
          var assignment = self.participantGroups.find(function(a) { return a.id === p.id; });
          return assignment && assignment.group_id === g.id;
        });
        players.forEach(function(p) { p._groupId = g.id; });
        return { id: g.id, name: g.name, players: players };
      });
    }

    // Unassigned = players whose group_id is null/empty or doesn't match any existing group
    var unassigned = (self.partcipantData || []).filter(function(p) {
      var assignment = self.participantGroups.find(function(a) { return a.id === p.id; });
      return !assignment || !assignment.group_id || !groupIds[assignment.group_id];
    });
    if (unassigned.length > 0) {
      unassigned.forEach(function(p) { p._groupId = '__unassigned__'; });
      grouped.unshift({ id: '__unassigned__', name: 'Unassigned', players: unassigned });
    }
    return grouped;
  }

  selectGroupPlayer(player: any) {
    if (this.selectedGroupPlayer && this.selectedGroupPlayer.id === player.id) {
      this.selectedGroupPlayer = null;
    } else {
      this.selectedGroupPlayer = player;
    }
  }

  movePlayerToGroup(groupId: string) {
    if (!this.selectedGroupPlayer) return;
    if (groupId === '__unassigned__') return;
    if (this.selectedGroupPlayer._groupId === groupId) { this.selectedGroupPlayer = null; return; }
    this.httpService.post(API.ASSIGN_PARTICIPANT_TO_GROUP, {
      participant_id: this.selectedGroupPlayer.id,
      group_id: groupId
    }).subscribe({
      next: () => {
        this.selectedGroupPlayer = null;
        this.fetchGroups();
        this.commonService.toastMessage('Player moved', 2500, ToastMessageType.Success, ToastPlacement.Bottom);
      },
      error: () => {
        this.commonService.toastMessage('Failed to move player', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
    });
  }

  createGroups() {
    this.httpService.post(API.CREATE_GROUPS, {
      league_id: this.league_id,
      number_of_groups: this.numberOfGroups,
      auto_assign: true
    }).subscribe({
      next: () => {
        this.showCreateGroupDialog = false;
        this.fetchGroups();
        this.commonService.toastMessage('Groups created', 2500, ToastMessageType.Success, ToastPlacement.Bottom);
      },
      error: (err) => {
        this.commonService.toastMessage((err && err.error && err.error.message) || 'Failed to create groups', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
    });
  }

  addGroup() {
    this.httpService.post(API.CREATE_GROUPS, {
      league_id: this.league_id,
      number_of_groups: 1,
      auto_assign: false
    }).subscribe({
      next: () => {
        this.fetchGroups();
        this.commonService.toastMessage('Group added', 2500, ToastMessageType.Success, ToastPlacement.Bottom);
      },
      error: (err) => {
        this.commonService.toastMessage((err && err.error && err.error.message) || 'Failed to add group', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
    });
  }

  startRenameGroup(group: any, event: Event) {
    event.stopPropagation();
    this.renameGroupId = group.id;
    this.renameGroupValue = group.name;
    this.showRenameGroupDialog = true;
  }

  confirmRenameGroup() {
    if (!this.renameGroupValue) return;
    this.httpService.post(API.RENAME_GROUP, {
      group_id: this.renameGroupId,
      name: this.renameGroupValue
    }).subscribe({
      next: () => {
        this.showRenameGroupDialog = false;
        this.fetchGroups();
        this.commonService.toastMessage('Group renamed', 2500, ToastMessageType.Success, ToastPlacement.Bottom);
      },
      error: (err) => {
        this.commonService.toastMessage((err && err.error && err.error.message) || 'Failed to rename group', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
    });
  }

  deleteGroup(groupId: string, event: Event) {
    event.stopPropagation();
    this.groupToDelete = groupId;
    this.showDeleteGroupConfirm = true;
  }

  confirmDeleteGroup() {
    this.httpService.post(API.DELETE_GROUP, { group_id: this.groupToDelete }).subscribe({
      next: () => {
        this.showDeleteGroupConfirm = false;
        this.fetchGroups();
        this.commonService.toastMessage('Group deleted', 2500, ToastMessageType.Success, ToastPlacement.Bottom);
      },
      error: (err) => {
        this.showDeleteGroupConfirm = false;
        this.commonService.toastMessage((err && err.error && err.error.message) || 'Failed to delete group', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
    });
  }

  getActivityIcon(activityName: string): string {
    if (!activityName) return 'trophy';
    const name = activityName.toLowerCase();
    const map: { [key: string]: string } = {
      'tennis': 'tennisball', 'padel tennis': 'tennisball', 'table tennis': 'tennisball',
      'football': 'football', 'badminton': 'tennisball', 'basketball': 'basketball',
      'cricket': 'baseball', 'golf': 'golf', 'swimming': 'water', 'fitness': 'fitness',
      'gymnastics': 'body', 'boxing': 'hand', 'dance': 'musical-notes', 'sing': 'mic',
      'education': 'school', 'netball': 'basketball', 'dodgeball': 'baseball',
      'squash': 'tennisball', 'bar n restaurant': 'restaurant', 'act': 'film',
      'private coaching': 'person'
    };
    return map[name] || 'trophy';
  }

  // Singles/Doubles match action sheet & publish result
  showMatchSheet: boolean = false;
  showResultDialog: boolean = false;
  selectedMatchForAction: LeagueMatch = null;
  resultType: string = 'normal';
  retiredPlayer: string = '';
  matchFormat: string = '3';
  sets: { home: string; away: string; tbHome: string; tbAway: string }[] = [
    { home: '', away: '', tbHome: '', tbAway: '' },
    { home: '', away: '', tbHome: '', tbAway: '' }
  ];
  publishing: boolean = false;

  onMatchCardClick(mat: LeagueMatch) {
    if (this.individualLeague.league_type === 3) {
      this.gotoLeagueMatchInfoPage(mat);
      return;
    }
    this.selectedMatchForAction = mat;
    this.showMatchSheet = true;
  }

  onMatchAction(action: string) {
    this.showMatchSheet = false;
    const mat = this.selectedMatchForAction;
    if (!mat) return;
    switch (action) {
      case 'result': this.openPublishDialog(mat); break;
      case 'view': this.openPublishDialog(mat); break;
      case 'edit': this.gotoEditPage(mat); break;
      case 'delete': this.removeMatch(mat); break;
    }
  }

  openPublishDialog(mat: LeagueMatch) {
    this.selectedMatchForAction = mat;
    this.resultType = 'normal';
    this.retiredPlayer = '';
    this.matchFormat = '3';
    this.sets = [
      { home: '', away: '', tbHome: '', tbAway: '' },
      { home: '', away: '', tbHome: '', tbAway: '' }
    ];

    // Pre-populate from existing result_json
    if (mat.result_json) {
      try {
        var json = typeof mat.result_json === 'string' ? JSON.parse(mat.result_json) : mat.result_json;
        if (json && json.SET_SCORES) {
          var existingSets = (json.SET_SCORES || []).filter(function(s) { return s.SCORE && s.SCORE !== '0-0'; });
          if (existingSets.length > 0) {
            this.sets = existingSets.map(function(s) {
              var parts = (s.SCORE || '0-0').split('-');
              return { home: parts[0] || '', away: parts[1] || '', tbHome: '', tbAway: '' };
            });
            if (existingSets.length === 1) this.matchFormat = '1';
            else if (existingSets.length <= 3) this.matchFormat = '3';
            else this.matchFormat = '5';
          }
        }
        if (json && json.RESULT) {
          var status = +(json.RESULT.RESULT_STATUS || 0);
          if (status === 4) { this.resultType = 'walkover'; this.retiredPlayer = 'home'; }
          else if (status === 5) { this.resultType = 'retired'; this.retiredPlayer = 'home'; }
        }
      } catch (e) {}
    }

    this.showResultDialog = true;
  }

  onResultTypeChange() {
    if (this.resultType === 'walkover') {
      this.sets = [{ home: '', away: '', tbHome: '', tbAway: '' }];
    }
  }

  onFormatChange() {
    const max = parseInt(this.matchFormat);
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
    const v = parseInt(val);
    if (isNaN(v)) return;
    const other = field === 'home' ? 'away' : 'home';
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

  getHomeSets(): number {
    return this.sets.filter(s => parseInt(s.home) > parseInt(s.away)).length;
  }

  getAwaySets(): number {
    return this.sets.filter(s => parseInt(s.away) > parseInt(s.home)).length;
  }

  isMatchDecided(): boolean {
    const setsToWin = Math.ceil(parseInt(this.matchFormat) / 2);
    return this.getHomeSets() >= setsToWin || this.getAwaySets() >= setsToWin;
  }

  getScoreText(): string {
    return this.sets.filter(s => s.home && s.away).map(s => {
      const base = `${s.home}-${s.away}`;
      return this.needsTiebreak(s) && s.tbHome && s.tbAway ? `${base}(${s.tbHome}-${s.tbAway})` : base;
    }).join('  ');
  }

  getWinner(): string {
    const mat = this.selectedMatchForAction;
    if (this.resultType === 'walkover' || this.resultType === 'retired') {
      return this.retiredPlayer === 'home' ? (mat && mat.awayusername || '') : (mat && mat.homeusername || '');
    }
    const h = this.getHomeSets(), a = this.getAwaySets();
    return h > a ? (mat && mat.homeusername || '') : a > h ? (mat && mat.awayusername || '') : '';
  }

  publishResult() {
    this.publishing = true;
    const mat = this.selectedMatchForAction;

    if (!mat.match_id) {
      // No match exists — create one first via GraphQL
      const today = new Date();
      const datePart = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
      const createPayload = {
        MatchName: mat.homeusername + ' vs ' + mat.awayusername,
        CreatedBy: this.sharedservice.getLoggedInUserId(),
        LeagueId: this.league_id,
        GroupId: '',
        Stage: 0,
        Round: 1,
        MatchVisibility: 0,
        MatchDetails: '',
        StartDate: datePart + ' 09:00',
        EndDate: datePart + ' 23:59',
        primary_participant_id: mat.home_participant_id || '',
        secondary_participant_id: mat.away_participant_id || '',
        primary_participant_id2: (mat as any).home_participant_id2 || '',
        secondary_participant_id2: (mat as any).away_participant_id2 || '',
        match_type: this.individualLeague.league_type === 2 ? 2 : 1,
        user_postgre_metadata: {
          UserParentClubId: this.sharedservice.getPostgreParentClubId(),
          UserActivityId: ''
        },
        user_device_metadata: {
          UserAppType: AppType.ADMIN_NEW,
          UserActionType: 0,
          UserDeviceType: this.sharedservice.getPlatform() === 'android' ? 1 : 2
        },
        location_id: this.individualLeague.location_id || '',
        location_type: 1,
        MatchPaymentType: 0,
        Member_Fee: '0.00',
        Non_Member_Fee: '0.00'
      };

      const addMatchMutation = gql`
        mutation addMatchToLeague($createLeagueMatchInput: CreateLeagueMatchInput!) {
          addMatchToLeague(createLeagueMatchInput: $createLeagueMatchInput) {
            match { Id }
          }
        }
      `;

      this.graphqlService.mutate(addMatchMutation, { createLeagueMatchInput: createPayload }, 0).subscribe(
        (res: any) => {
          const matchId = res.data && res.data.addMatchToLeague && res.data.addMatchToLeague.match ? res.data.addMatchToLeague.match.Id : '';
          if (matchId) {
            // Fetch league matches to get fixture_id for the new match
            this.commonInput.league_id = this.league_id;
            this.commonInput.action_type = 2;
            this.httpService.post(API.GET_LEAGUE_MATCHES, this.commonInput).subscribe({
              next: (matchRes: any) => {
                this.match = matchRes.data;
                this.matchesLength = this.match ? this.match.length : 0;
                this.computeStats();
                var newMatch = (matchRes.data || []).find(function(m) { return m.match_id === matchId; });
                if (newMatch) {
                  this.selectedMatchForAction = Object.assign({}, mat, {
                    match_id: newMatch.match_id,
                    fixture_id: newMatch.fixture_id,
                    homeusername: newMatch.homeusername || mat.homeusername,
                    awayusername: newMatch.awayusername || mat.awayusername
                  });
                } else {
                  this.selectedMatchForAction = Object.assign({}, mat, { match_id: matchId });
                }
                this.doPublishResult();
              },
              error: () => {
                this.selectedMatchForAction = Object.assign({}, mat, { match_id: matchId });
                this.doPublishResult();
              }
            });
          } else {
            this.publishing = false;
            this.commonService.toastMessage('Failed to create match', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          }
        },
        () => {
          this.publishing = false;
          this.commonService.toastMessage('Failed to create match', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        }
      );
    } else {
      this.doPublishResult();
    }
  }

  private doPublishResult() {
    const mat = this.selectedMatchForAction;
    const homeSets = this.getHomeSets();
    const awaySets = this.getAwaySets();
    const winnerId = this.getWinner() === mat.homeusername ? mat.home_participant_id : mat.away_participant_id;
    const loserId = winnerId === mat.home_participant_id ? mat.away_participant_id : mat.home_participant_id;
    const resultStatus = this.resultType === 'walkover' ? 4 : this.resultType === 'retired' ? 5 : 1;

    const setScores = this.sets.filter(s => s.home && s.away).map((s, i) => {
      const homeWon = parseInt(s.home) > parseInt(s.away);
      return {
        SET_NUMBER: String(i + 1),
        SCORE: `${s.home}-${s.away}`,
        WINNER: homeWon ? mat.homeusername : mat.awayusername,
        WINNER_TEAM_ID: homeWon ? mat.home_participant_id : mat.away_participant_id
      };
    });

    const payload = {
      parentclubId: this.sharedservice.getPostgreParentClubId(),
      clubId: '',
      activityId: this.individualLeague.activity.Id,
      memberId: this.sharedservice.getLoggedInUserId(),
      action_type: 0,
      device_type: this.sharedservice.getPlatform() === 'android' ? 1 : 2,
      app_type: AppType.ADMIN_NEW,
      device_id: '',
      updated_by: this.sharedservice.getLoggedInUserId(),
      created_by: this.sharedservice.getLoggedInUserId(),
      activityCode: this.individualLeague.activity.ActivityCode,
      leaguefixtureId: mat.match_id,
      homeLeagueParticipationId: mat.home_participant_id || '',
      awayLeagueParticipationId: mat.away_participant_id || '',
      Tennis: {
        LEAGUE_FIXTURE_ID: mat.fixture_id,
        POTM: [],
        RESULT: {
          RESULT_STATUS: String(resultStatus),
          WINNER_ID: winnerId || '',
          LOSER_ID: loserId || '',
          DESCRIPTION: this.resultType === 'retired'
            ? `${this.retiredPlayer === 'home' ? mat.homeusername : mat.awayusername} retired`
            : this.resultType === 'walkover'
              ? `${this.retiredPlayer === 'home' ? mat.homeusername : mat.awayusername} withdrew`
              : ''
        },
        HOME_TEAM: {
          TEAM_NAME: mat.homeusername,
          TEAM_ID: mat.home_participant_id,
          SETS_WON: String(homeSets),
          GAMES_WON: '0',
          ACES: '0',
          DOUBLE_FAULTS: '0',
          FIRST_SERVE_PERCENTAGE: '0',
          UNFORCED_ERRORS: '0',
          BREAK_POINTS_WON: '0'
        },
        AWAY_TEAM: {
          TEAM_NAME: mat.awayusername,
          TEAM_ID: mat.away_participant_id,
          SETS_WON: String(awaySets),
          GAMES_WON: '0',
          ACES: '0',
          DOUBLE_FAULTS: '0',
          FIRST_SERVE_PERCENTAGE: '0',
          UNFORCED_ERRORS: '0',
          BREAK_POINTS_WON: '0'
        },
        SET_SCORES: setScores
      }
    };

    this.httpService.post(API.Publish_League_Result_For_Activities, payload).subscribe({
      next: (res: any) => {
        this.publishing = false;
        this.showResultDialog = false;
        this.commonService.toastMessage('Result published successfully', 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.getLeagueMatches();
      },
      error: (err) => {
        this.publishing = false;
        this.commonService.toastMessage('Failed to publish result', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
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
  User: { FirstName: string, LastName: string, FirebaseKey: string, isUserAvailable?: boolean }
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