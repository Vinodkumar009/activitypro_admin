import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { CommonService, ToastMessageType } from '../../../../../services/common.service';
import { HttpService } from '../../../../../services/http.service';
import { API } from '../../../../../shared/constants/api_constants';
import { SharedServices } from '../../../../services/sharedservice';
import { AppType } from '../../../../../shared/constants/module.constants';
import { LeagueParticipationForMatchModel, ResultStatusModel } from '../../models/league.model';
import { LeagueMatch } from '../../models/location.model';
import { AllMatchData } from '../../../../../shared/model/match.model';
import { TeamsForParentClubModel } from '../../models/team.model';
import { TennisResultModel } from '../../../../../shared/model/league_result.model';
import { ThemeService } from '../../../../../services/theme.service';

@IonicPage()
@Component({
  selector: 'page-tennis-result-input',
  templateUrl: 'tennis_result_input.html',
  providers: [HttpService]
})
export class TennisResultInputPage {
  // Flow type
  isLeague: boolean = false;
  isEditable: boolean = true;
  // League flow properties
  homeTeamObj: any;
  awayTeamObj: any;
  matchObj: any;

  // Non-League flow properties
  matchTeamObj: AllMatchData;
  hometeamMatchObj: TeamsForParentClubModel;
  awayteamMatchObj: TeamsForParentClubModel;

  // DTO for template binding - simplified team data
  teamData: {
    homeTeamId: string;
    awayTeamId: string;
    homeTeamName: string;
    awayTeamName: string;
  } = {
    homeTeamId: "",
    awayTeamId: "",
    homeTeamName: "",
    awayTeamName: ""
  };

  // Result properties
  result_json: TennisResultModel;
  selectedWinner: string = "";
  resultStatus: string = "1";

  // Status properties
  resultStatusList: ResultStatusModel[] = [];
  selectedResultStatus: ResultStatusModel | null = null;
  isLoadingStatuses: boolean = false;
  showMatchWinner: boolean = false; // 🏆 Show winner card when status is WIN
  showStatusDropdown: boolean = false;
  activityId: string;
  activityCode: number;
  getResultStatusByActivityInput: any = {};


  isDarkTheme: boolean = true;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public commonService: CommonService,
    private httpService: HttpService,
    public sharedservice: SharedServices,
    public viewCtrl: ViewController,
    public events: Events,
    public storage: Storage,
    public themeService: ThemeService
  ) {
    this.isLeague = this.navParams.get("isLeague") || false;
    this.result_json = this.navParams.get('result_json') || {};
    this.activityId = this.navParams.get('activityId');
    this.activityCode = this.navParams.get('activityCode');
    this.isEditable = !(this.navParams.get('result_status') === 1);
    this.initializeTeamData();
    this.initializeValues();
    this.initializeResultStatusInput();
    this.getResultStatusByActivity();
  }

  ionViewDidLoad() {
    this.loadTheme();
    this.events.subscribe('theme:changed', (isDark) => {
      this.isDarkTheme = isDark;
      this.applyTheme();
    });
  }

  ionViewWillLeave() {
    this.events.unsubscribe('theme:changed');
  }

  loadTheme() {
    this.storage.get('dashboardTheme').then((isDarkTheme) => {
      if (isDarkTheme !== null) {
        this.isDarkTheme = isDarkTheme;
      } else {
        this.isDarkTheme = true;
      }
      this.applyTheme();
    }).catch(() => {
      this.isDarkTheme = true;
      this.applyTheme();
    });
  }

  applyTheme() {
    const element = document.querySelector('page-tennis-result-input');
    if (element) {
      if (this.isDarkTheme) {
        element.classList.remove('light-theme');
      } else {
        element.classList.add('light-theme');
      }
    }
  }

  private initializeTeamData(): void {
    if (this.isLeague) {
      this.matchObj = this.navParams.get("matchObj");
      this.homeTeamObj = this.navParams.get("homeTeamObj");
      this.awayTeamObj = this.navParams.get("awayTeamObj");

      // Handle different data structures for league flow
      // Check if data is in parentclubteam structure or direct structure
      if (this.homeTeamObj) {
        if (this.homeTeamObj.parentclubteam) {
          // Old structure with parentclubteam
          this.teamData.homeTeamId = this.homeTeamObj.parentclubteam.id || "";
          this.teamData.homeTeamName = this.homeTeamObj.parentclubteam.teamName || "";
        } else {
          // New structure - direct properties
          this.teamData.homeTeamId = this.homeTeamObj.id || "";
          this.teamData.homeTeamName = this.homeTeamObj.teamName || "";
        }
      }

      if (this.awayTeamObj) {
        if (this.awayTeamObj.parentclubteam) {
          // Old structure with parentclubteam
          this.teamData.awayTeamId = this.awayTeamObj.parentclubteam.id || "";
          this.teamData.awayTeamName = this.awayTeamObj.parentclubteam.teamName || "";
        } else {
          // New structure - direct properties
          this.teamData.awayTeamId = this.awayTeamObj.id || "";
          this.teamData.awayTeamName = this.awayTeamObj.teamName || "";
        }
      }
    } else {
      this.matchTeamObj = this.navParams.get("matchObj");
      this.hometeamMatchObj = this.navParams.get("homeTeamObj");
      this.awayteamMatchObj = this.navParams.get("awayTeamObj");

      this.teamData.homeTeamId = this.hometeamMatchObj && this.hometeamMatchObj.id || "";
      this.teamData.awayTeamId = this.awayteamMatchObj && this.awayteamMatchObj.id || "";
      this.teamData.homeTeamName = this.hometeamMatchObj && this.hometeamMatchObj.teamName || "";
      this.teamData.awayTeamName = this.awayteamMatchObj && this.awayteamMatchObj.teamName || "";
    }

    console.log('Initialized team data:', this.teamData);
  }

  initializeValues() {
    if (this.result_json.RESULT) {
      this.selectedWinner = this.result_json.RESULT.WINNER_ID || "";
      this.resultStatus = this.result_json.RESULT.RESULT_STATUS || "1";
    }
  }

  private initializeResultStatusInput(): void {
    this.getResultStatusByActivityInput = {
      parentclubId: this.sharedservice.getPostgreParentClubId() || '',
      clubId: '',
      activityId: this.activityId || '',
      memberId: this.sharedservice.getLoggedInUserId() || '',
      action_type: 0,
      device_type: this.sharedservice.getPlatform() === "android" ? 1 : 2,
      app_type: AppType.ADMIN_NEW,
      device_id: this.sharedservice.getDeviceId() || '',
      updated_by: this.sharedservice.getLoggedInUserId() || '',
      created_by: this.sharedservice.getLoggedInUserId() || '',
      activity_code: this.activityCode
    };
  }

  getResultStatusByActivity(): void {
    this.isLoadingStatuses = true;
    this.httpService.post(`${API.GET_RESULT_STATUS_BY_ACTIVITY}`, this.getResultStatusByActivityInput).subscribe(
      (res: any) => {
        this.isLoadingStatuses = false;
        try {
          if (res.data && Array.isArray(res.data)) {
            this.resultStatusList = res.data;
            this.preselectResultStatus();
          } else {
            this.resultStatusList = [];
          }
        } catch (error) {
          console.error("Error processing result status:", error);
          this.resultStatusList = [];
        }
      },
      (error) => {
        this.isLoadingStatuses = false;
        console.error("Error fetching result status:", error);
        this.resultStatusList = [];
      }
    );
  }

  private preselectResultStatus(): void {
    console.log('Preselecting status:', this.resultStatus, 'from list:', this.resultStatusList);
    if(this.result_json.RESULT) {
        this.selectedResultStatus = this.resultStatusList.find(status => Number(status.id) === Number(this.result_json.RESULT.RESULT_STATUS));
    }
    // if (this.resultStatus && this.resultStatusList.length > 0) {
    //   this.selectedResultStatus = this.resultStatusList.find(status => 
    //     status.id.toString() === this.resultStatus.toString()
    //   ) || null;
      
    //   console.log('Selected status found:', this.selectedResultStatus);
    //   if (this.selectedResultStatus) {
    //     this.showMatchWinner = this.selectedResultStatus.status === 'WIN';
    //     console.log('Show match winner:', this.showMatchWinner);
    //   }
    // }
  }

  onStatusClick(status: ResultStatusModel): void {
    if (!status) return;
    this.selectedResultStatus = status;
    this.resultStatus = status.id.toString();
    this.showMatchWinner = status.status === 'WIN';
  }

  toggleStatusDropdown(): void {
    this.showStatusDropdown = !this.showStatusDropdown;
  }

  selectStatus(status: ResultStatusModel): void {
    this.onStatusClick(status);
    this.showStatusDropdown = false;
  }

  selectWinner(teamId: string): void {
    this.selectedWinner = teamId;
  }

  saveResult() {
    if (!this.validateResult()) {
      return;
    }

    // Get calculated values from result_json (updated by set input)
    const homeSetsWon = (this.result_json.HOME_TEAM && this.result_json.HOME_TEAM.SETS_WON) || '0';
    const awaySetsWon = (this.result_json.AWAY_TEAM && this.result_json.AWAY_TEAM.SETS_WON) || '0';
    const homeGamesWon = (this.result_json.HOME_TEAM && this.result_json.HOME_TEAM.GAMES_WON) || '0';
    const awayGamesWon = (this.result_json.AWAY_TEAM && this.result_json.AWAY_TEAM.GAMES_WON) || '0';

    const resultData = {
      selectedWinner: this.selectedWinner,
      resultStatus: this.resultStatus,
      homeSetsWon: homeSetsWon,
      awaySetsWon: awaySetsWon,
      homeGamesWon: homeGamesWon,
      awayGamesWon: awayGamesWon,
      WINNER_ID: this.selectedResultStatus && this.selectedResultStatus.status === 'WIN' ? this.selectedWinner : ''
    };

    this.viewCtrl.dismiss(resultData);
  }

  private validateResult(): boolean {
    if (this.resultStatus === '1') {
      if (!this.selectedWinner) {
        this.commonService.toastMessage('Please select a match winner', 3000, ToastMessageType.Error);
        return false;
      }

      // Get calculated values from result_json
      const homeSetsWon = parseInt((this.result_json.HOME_TEAM && this.result_json.HOME_TEAM.SETS_WON) || '0');
      const awaySetsWon = parseInt((this.result_json.AWAY_TEAM && this.result_json.AWAY_TEAM.SETS_WON) || '0');

      if (homeSetsWon === 0 && awaySetsWon === 0) {
        this.commonService.toastMessage('Please enter set scores first', 3000, ToastMessageType.Error);
        return false;
      }

      if (homeSetsWon === awaySetsWon) {
        this.commonService.toastMessage('Match cannot end in a tie. One team must win more sets', 3000, ToastMessageType.Error);
        return false;
      }

      const winnerSets = this.selectedWinner === this.teamData.homeTeamId ? homeSetsWon : awaySetsWon;
      const loserSets = this.selectedWinner === this.teamData.homeTeamId ? awaySetsWon : homeSetsWon;

      if (winnerSets <= loserSets) {
        this.commonService.toastMessage('Winner must have won more sets than the loser', 3000, ToastMessageType.Error);
        return false;
      }
    }

    return true;
  }

  cancel(): void {
    this.viewCtrl.dismiss();
  }
}