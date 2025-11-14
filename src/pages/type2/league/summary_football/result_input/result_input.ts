import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { ThemeService } from '../../../../../services/theme.service';
import { AppType } from '../../../../../shared/constants/module.constants';
import { HttpService } from '../../../../../services/http.service';
import { CommonService, ToastMessageType } from '../../../../../services/common.service';
import { API } from '../../../../../shared/constants/api_constants';
import { SharedServices } from '../../../../services/sharedservice';
import { LeagueParticipationForMatchModel, LeagueMatchParticipantModel, ResultStatusModel } from '../../models/league.model';
import { LeagueMatch } from '../../models/location.model';
import { FootballResultModel, FootballResultStatsModel } from '../../../../../shared/model/league_result.model';
import { AllMatchData } from '../../../../../shared/model/match.model';
import { TeamsForParentClubModel } from '../../models/team.model';

@IonicPage()
@Component({
  selector: 'page-result-input',
  templateUrl: 'result_input.html',
  providers: [HttpService]
})
export class ResultInputPage {
  updateResultEntityInput: UpdateResultEntityInput = {
    resultId: '',
    ResultStatus: 0,
    PublishedByApp: '',
    winner_league_participation_id: '',
    loser_league_participation_id: ''
  }

  homeTeamObj: LeagueParticipationForMatchModel;
  awayTeamObj: LeagueParticipationForMatchModel;
  matchObj: LeagueMatch;
  matchTeamObj: AllMatchData;
  hometeamMatchObj: TeamsForParentClubModel;
  awayteamMatchObj: TeamsForParentClubModel;

  resultId: string;
  leagueId: string;
  activityId: string;
  isLeague: boolean = false;
  selectedPlayer: string[] = [];
  goalTime: number[] = [];
  goalDetails: any[] = [];
  score: number = 0;
  currentGoalIndex: number = -1;

  leagueMatchParticipantRes: LeagueMatchParticipantModel[] = [];
  selectedResultStatus: ResultStatusModel | null = null;
  selectedWinnerTeamId: string = '';
  TEAMS: LeagueParticipationForMatchModel[] = [];

  homeTeamGoals: number;
  awayTeamGoals: number;
  resultObject: FootballResultModel;

  resultStatusList: ResultStatusModel[] = [];
  isLoadingStatuses: boolean = false;
  getResultStatusByActivityInput: GetResultStatusByActivityInput = {
    parentclubId: '',
    clubId: '',
    activityId: '',
    memberId: '',
    action_type: 0,
    device_type: 0,
    app_type: 0,
    device_id: '',
    updated_by: '',
    created_by: '',
    activity_code: 1001
  };
  activityCode: number;

  resultDescription: string = '';
  isEditable: boolean = true;
  isDarkTheme: boolean = true;
  
  showStatusDropdown: boolean = false;
  showWinnerDropdown: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController,
    public storage: Storage, private httpService: HttpService, public sharedservice: SharedServices,
    public commonService: CommonService, public alertCtrl: AlertController, public events: Events,
    public themeService: ThemeService) {
    this.initializeComponent();
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
    const element = document.querySelector('page-result-input');
    if (element) {
      if (this.isDarkTheme) {
        element.classList.remove('light-theme');
      } else {
        element.classList.add('light-theme');
      }
    }
  }

  private initializeComponent(): void {
    this.isLeague = this.navParams.get("isLeague") || false;
    this.leagueId = this.navParams.get("leagueId");
    this.activityId = this.navParams.get("activityId");
    this.resultId = this.navParams.get("resultId");
    this.score = this.navParams.get("score");
    this.activityCode = this.navParams.get("activityCode");
    this.resultObject = this.navParams.get("resultObject");
    
    const getLeagueMatchResultRes = this.navParams.get('getLeagueMatchResultRes');
    this.isEditable = !(getLeagueMatchResultRes && getLeagueMatchResultRes.data && getLeagueMatchResultRes.data.ResultStatus === 1);

    if (this.isLeague) {
      this.matchObj = this.navParams.get("matchObj");
      this.homeTeamObj = this.navParams.get("homeTeamObj");
      this.awayTeamObj = this.navParams.get("awayTeamObj");
      this.TEAMS = [this.homeTeamObj, this.awayTeamObj];
    } else {
      this.matchTeamObj = this.navParams.get("matchObj");
      this.hometeamMatchObj = this.navParams.get("homeTeamObj");
      this.awayteamMatchObj = this.navParams.get("awayTeamObj");
      this.TEAMS = [
        {
          id: this.hometeamMatchObj.id || '',
          parentclubteam: {
            id: this.hometeamMatchObj.id || '',
            teamName: this.hometeamMatchObj.teamName || 'Home Team'
          }
        } as LeagueParticipationForMatchModel,
        {
          id: this.awayteamMatchObj.id || '',
          parentclubteam: {
            id: this.awayteamMatchObj.id || '',
            teamName: this.awayteamMatchObj.teamName || 'Away Team'
          }
        } as LeagueParticipationForMatchModel
      ];
    }

    this.updateResultEntityInput.resultId = this.resultId;
    this.updateResultEntityInput.PublishedByApp = AppType.ADMIN_NEW.toString();

    this.initializeFormWithExistingData();
    this.initializeResultStatusInput();
    this.getResultStatusByActivity();
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

  private initializeFormWithExistingData(): void {
    if (this.resultObject) {
      if (this.resultObject.HOME_TEAM && this.resultObject.AWAY_TEAM) {
        this.homeTeamGoals = parseInt(this.resultObject.HOME_TEAM.GOAL) || 0;
        this.awayTeamGoals = parseInt(this.resultObject.AWAY_TEAM.GOAL) || 0;
      }

      if (this.resultObject.RESULT && this.resultObject.RESULT.DESCRIPTION) {
        this.resultDescription = this.resultObject.RESULT.DESCRIPTION;
      }

      if (this.resultObject.RESULT && this.resultObject.RESULT.WINNER_ID) {
        this.selectedWinnerTeamId = this.resultObject.RESULT.WINNER_ID;
      }
    }
  }

  getResultStatusByActivity(): void {
    this.isLoadingStatuses = true;
    this.httpService.post(`${API.GET_RESULT_STATUS_BY_ACTIVITY}`, this.getResultStatusByActivityInput).subscribe(
      (res: any) => {
        this.isLoadingStatuses = false;
        try {
          if (res.data && Array.isArray(res.data)) {
            this.resultStatusList = res.data;
            
            if (this.resultObject && this.resultObject.RESULT && this.resultObject.RESULT.RESULT_STATUS) {
              const existingStatus = this.resultStatusList.find(status => status.id.toString() === this.resultObject.RESULT.RESULT_STATUS.toString());
              if (existingStatus) {
                this.selectedResultStatus = existingStatus;
              }
            }
          }
        } catch (error) {
          console.error('Error processing result status response:', error);
        }
      },
      (error) => {
        this.isLoadingStatuses = false;
        this.commonService.toastMessage('Failed to load result statuses', ToastMessageType.Error);
      }
    );
  }

  dismiss() {
    this.viewCtrl.dismiss({
      winnerTeam: {},
      loserTeam: {},
      winnerTeamGoals: 0,
      loserTeamGoals: 0,
      footballResultStats: null
    });
  }

  // Getter methods for unified access to team data
  get homeTeamName(): string {
    if (this.isLeague) {
      return (this.homeTeamObj && this.homeTeamObj.parentclubteam && this.homeTeamObj.parentclubteam.teamName)
        ? this.homeTeamObj.parentclubteam.teamName : 'Home Team';
    } else {
      return (this.hometeamMatchObj && this.hometeamMatchObj.teamName)
        ? this.hometeamMatchObj.teamName : 'Home Team';
    }
  }

  get awayTeamName(): string {
    if (this.isLeague) {
      return (this.awayTeamObj && this.awayTeamObj.parentclubteam && this.awayTeamObj.parentclubteam.teamName)
        ? this.awayTeamObj.parentclubteam.teamName : 'Away Team';
    } else {
      return (this.awayteamMatchObj && this.awayteamMatchObj.teamName)
        ? this.awayteamMatchObj.teamName : 'Away Team';
    }
  }

  get matchTitle(): string {
    if (this.isLeague) {
      return (this.matchObj && this.matchObj.match_title) ? this.matchObj.match_title : '';
    } else {
      return (this.matchTeamObj && this.matchTeamObj.MatchTitle) ? this.matchTeamObj.MatchTitle : '';
    }
  }

  get homeTeamId(): string {
    if (this.isLeague) {
      return (this.homeTeamObj && this.homeTeamObj.parentclubteam && this.homeTeamObj.parentclubteam.id)
        ? this.homeTeamObj.parentclubteam.id : '';
    } else {
      return (this.hometeamMatchObj && this.hometeamMatchObj.id)
        ? this.hometeamMatchObj.id : '';
    }
  }

  get awayTeamId(): string {
    if (this.isLeague) {
      return (this.awayTeamObj && this.awayTeamObj.parentclubteam && this.awayTeamObj.parentclubteam.id)
        ? this.awayTeamObj.parentclubteam.id : '';
    } else {
      return (this.awayteamMatchObj && this.awayteamMatchObj.id)
        ? this.awayteamMatchObj.id : '';
    }
  }

  toggleStatusDropdown() {
    this.showStatusDropdown = !this.showStatusDropdown;
    this.showWinnerDropdown = false;
  }

  toggleWinnerDropdown() {
    this.showWinnerDropdown = !this.showWinnerDropdown;
    this.showStatusDropdown = false;
  }

  selectResultStatus(status: ResultStatusModel) {
    this.selectedResultStatus = status;
    this.showStatusDropdown = false;
  }

  selectStatus(status: ResultStatusModel) {
    this.selectResultStatus(status);
  }

  selectWinnerTeam(teamId: string) {
    this.selectedWinnerTeamId = teamId;
    this.showWinnerDropdown = false;
  }

  getSelectedStatusName(): string {
    return this.selectedResultStatus && this.selectedResultStatus.status || '';
  }

  getSelectedWinnerName(): string {
    const selectedTeam = this.TEAMS.find(team => team && team.parentclubteam && team.parentclubteam.id === this.selectedWinnerTeamId);
    return selectedTeam && selectedTeam.parentclubteam && selectedTeam.parentclubteam.teamName || '';
  }

  closeDropdowns() {
    this.showStatusDropdown = false;
    this.showWinnerDropdown = false;
  }

  saveResult(): void {
    if (!this.validateForm()) {
      return;
    }

    // this.updateResultEntityInput.ResultStatus = this.selectedResultStatus && this.selectedResultStatus.id || 0;
    
    // if (this.selectedWinnerTeamId) {
    //   const winnerTeam = this.TEAMS.find(team => team && team.parentclubteam && team.parentclubteam.id === this.selectedWinnerTeamId);
    //   if (winnerTeam) {
    //     this.updateResultEntityInput.winner_league_participation_id = winnerTeam.id;
    //     const loserTeam = this.TEAMS.find(team => team && team.parentclubteam && team.parentclubteam.id !== this.selectedWinnerTeamId);
    //     if (loserTeam) {
    //       this.updateResultEntityInput.loser_league_participation_id = loserTeam.id;
    //     }
    //   }
    // }

    // this.httpService.post(`${API.UPDATE_RESULT_ENTITY}`, this.updateResultEntityInput).subscribe(
    //   (response: any) => {
    //     this.commonService.toastMessage('Result saved successfully', 2500,ToastMessageType.Success);
    //     this.viewCtrl.dismiss({ saved: true });
    //   },
    //   (error) => {
    //     this.commonService.toastMessage('Failed to save result', 2500, ToastMessageType.Error);
    //   }
    // );


    // const isDrawn = this.selectedResultStatus.status.toUpperCase() === 'DRAW';
    // const isWin = this.selectedResultStatus.status.toUpperCase() === 'WIN';

    const isDrawn = this.selectedResultStatus.status.toUpperCase() === 'DRAW';
    const isWin = this.selectedResultStatus.status.toUpperCase() === 'WIN';
    
    // 🏟️ Validate home and away goals for WIN and DRAW statuses
    if (isWin || isDrawn) {
      const homeGoals = Number(this.homeTeamGoals);
      const awayGoals = Number(this.awayTeamGoals);

      if (
        this.homeTeamGoals === undefined ||
        this.awayTeamGoals === undefined ||
        isNaN(homeGoals) ||
        isNaN(awayGoals) ||
        homeGoals < 0 ||
        awayGoals < 0
      ) {
        this.commonService.toastMessage('Please enter valid numbers for both team goals.', 3000, ToastMessageType.Info);
        return;
      }
    }

    // Create FootballResultStatsModel
    const footballResultStats: FootballResultStatsModel = {
      DESCRIPTION: this.resultDescription || '',
      WINNER_ID: '',
      LOSER_ID: '',
      RESULT_STATUS: this.selectedResultStatus.status
    };

    // 🤝 Handle different result types
    if (isWin) {
      // Validate winner selection for 'WIN' result type
      if (!this.selectedWinnerTeamId) {
        this.commonService.toastMessage('Please select a winner team.', 3000, ToastMessageType.Info);
        return;
      }

      // 🏆 Find winner and loser teams based on selectedWinnerTeamId
      const winnerTeam = this.TEAMS.find(team => team.parentclubteam.id === this.selectedWinnerTeamId);
      const loserTeam = this.TEAMS.find(team => team.parentclubteam.id !== this.selectedWinnerTeamId);

      // 🏟️ Assign goals based on which team is the winner
      // Convert to numbers to ensure proper comparison
      const homeGoals = Number(this.homeTeamGoals);
      const awayGoals = Number(this.awayTeamGoals);
      let winnerTeamGoals = 0;
      let loserTeamGoals = 0;

      if (this.selectedWinnerTeamId === this.homeTeamId) {
        winnerTeamGoals = homeGoals;
        loserTeamGoals = awayGoals;
      } else if (this.selectedWinnerTeamId === this.awayTeamId) {
        winnerTeamGoals = awayGoals;
        loserTeamGoals = homeGoals;
      }

      // Validate that winner team has more goals than loser team
      if (winnerTeamGoals <= loserTeamGoals) {
        this.commonService.toastMessage('Winner team goals must be greater than losing team goals.', 3000, ToastMessageType.Info);
        return;
      }

      // Set winner ID in FootballResultStatsModel
      footballResultStats.WINNER_ID = this.selectedWinnerTeamId;

      // 🟢 Dismiss modal with winner result data
      this.viewCtrl.dismiss({
        homeTeamGoals: homeGoals.toString(),
        awayTeamGoals: awayGoals.toString(),
        winnerTeamGoals: winnerTeamGoals.toString(),
        loserTeamGoals: loserTeamGoals.toString(),
        resultStatus: this.selectedResultStatus.id,
        footballResultStats: footballResultStats
      });
    } else if (isDrawn) {
      // For drawn type, check if both teams have the same number of goals
      // Convert to numbers to ensure proper comparison
      const homeGoals = Number(this.homeTeamGoals);
      const awayGoals = Number(this.awayTeamGoals);

      if (homeGoals !== awayGoals) {
        this.commonService.toastMessage('For drawn matches, both teams must have the same number of goals.', 3000, ToastMessageType.Info);
        return;
      }

      // For draw, no specific winner ID
      footballResultStats.WINNER_ID = '';

      // 🤝 For drawn matches, dismiss modal with drawn match data
      this.viewCtrl.dismiss({
        homeTeamGoals: homeGoals.toString(),
        awayTeamGoals: awayGoals.toString(),
        winnerTeamGoals: null,
        loserTeamGoals: null,
        resultStatus: this.selectedResultStatus.id,
        footballResultStats: footballResultStats
      });
    } else {
      // For other statuses (POSTPONED, ABANDONED, CANCELLED), no winner ID
      footballResultStats.WINNER_ID = '';

      // For other statuses, just save the status
      this.viewCtrl.dismiss({
        homeTeamGoals: this.homeTeamGoals ? this.homeTeamGoals.toString() : '0',
        awayTeamGoals: this.awayTeamGoals ? this.awayTeamGoals.toString() : '0',
        winnerTeamGoals: null,
        loserTeamGoals: null,
        resultStatus: this.selectedResultStatus.id,
        footballResultStats: footballResultStats
      });
    }



  }

  private validateForm(): boolean {
    if (!this.selectedResultStatus) {
      this.commonService.toastMessage('Please select a result status', ToastMessageType.Error);
      return false;
    }
    return true;
  }

  closeModal(): void {
    this.viewCtrl.dismiss();
  }
}

interface UpdateResultEntityInput {
  resultId: string;
  ResultStatus: number;
  PublishedByApp: string;
  winner_league_participation_id: string;
  loser_league_participation_id: string;
}

interface GetResultStatusByActivityInput {
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
  activity_code: number;
}