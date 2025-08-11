import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { CommonService, ToastMessageType } from '../../../../../services/common.service';
import { HttpService } from '../../../../../services/http.service';
import { API } from '../../../../../shared/constants/api_constants';
import { AppType } from '../../../../../shared/constants/module.constants';
import { LeagueTeamPlayerStatusType } from '../../../../../shared/utility/enums';
import { SharedServices } from '../../../../services/sharedservice';
import { LeagueParticipationForMatchModel, LeagueMatchParticipantModel } from '../../models/league.model';
import { LeagueMatch } from '../../models/location.model';
import { FootballResultModel, FootballScoreDetailModel } from '../../../../../shared/model/league_result.model';

@IonicPage()
@Component({
  selector: 'page-score_input',
  templateUrl: 'score_input.html',
  providers: [HttpService]
})
export class ScoreInputPage {
  isWinner: boolean;
  teamObj: LeagueParticipationForMatchModel;
  matchObj: LeagueMatch;
  leagueId: string;
  activityId: string;
  selectedPlayer: string[] = [];
  goalTime: string[] = [];
  goalDateTime: string[] = [];
  goalDetails: any[] = [];
  score: number = 0;
  isDataLoaded: boolean = false;
  teamName: string = '';

  // Result Object from summary page
  resultObject: FootballResultModel;

  leagueMatchParticipantRes: LeagueMatchParticipantModel[] = [];
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
    MatchId: "",
    TeamId: "",
    TeamId2: "",
    leagueTeamPlayerStatusType: 0
  }

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController,
    public storage: Storage, private httpService: HttpService, public sharedservice: SharedServices,
    public commonService: CommonService, public alertCtrl: AlertController) {

    this.initializePageData();
    this.setupApiInput();
    this.getLeagueMatchParticipant();
  }

  private initializePageData(): void {
    this.isWinner = this.navParams.get("ishome");
    this.matchObj = this.navParams.get("matchObj");
    this.leagueId = this.navParams.get("leagueId");
    this.activityId = this.navParams.get("activityId");
    this.teamObj = this.navParams.get("teamObj");
    this.score = this.navParams.get("score") || 0;
    this.resultObject = this.navParams.get("resultObject");

    console.log("Initialized page data:", {
      isWinner: this.isWinner,
      score: this.score,
      hasResultObject: !!this.resultObject,
      resultObject: this.resultObject
    });

    // Set team name for display
    this.teamName = this.getTeamName();

    // Initialize arrays based on score
    this.initializeFormArrays();
  }

  private setupApiInput(): void {
    this.leagueMatchParticipantInput.parentclubId = this.sharedservice.getPostgreParentClubId();
    this.leagueMatchParticipantInput.memberId = this.sharedservice.getLoggedInId();
    this.leagueMatchParticipantInput.action_type = 0;
    this.leagueMatchParticipantInput.app_type = AppType.ADMIN_NEW;
    this.leagueMatchParticipantInput.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;
    this.leagueMatchParticipantInput.LeagueId = this.leagueId;
    this.leagueMatchParticipantInput.MatchId = this.matchObj.match_id;
  }

  private initializeFormArrays(): void {
    this.selectedPlayer = new Array(this.score).fill('');
    this.goalTime = new Array(this.score).fill('0"00"');
    // Initialize with proper ISO datetime format for today at 00:00
    this.goalDateTime = new Array(this.score).fill(this.createDateTimeString(0, 0));
    this.goalDetails = [];

    // Don't prefill here - wait for API calls to complete
  }

  private getTeamName(): string {
    if (this.teamObj && this.teamObj.parentclubteam) {
      return this.teamObj.parentclubteam.teamName || 'Team';
    }
    return 'Team';
  }

  onPlayerSelect(index: number) {
    this.updateGoalDetails(index);
  }

  onGoalTimeChange(index: number) {
    this.convertDateTimeToGoalTime(index);
    this.updateGoalDetails(index);
  }


  getNumberArray(count: number): any[] {
    return Array(count).fill(0);
  }

  getPlayerDisplayName(player: LeagueMatchParticipantModel): string {
    if (!player || !player.user) {
      return 'Unknown Player';
    }
    const firstName = player.user.FirstName || '';
    const lastName = player.user.LastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || 'Unknown Player';
  }

  isGoalComplete(index: number): boolean {
    return !!(this.selectedPlayer[index] && this.goalTime[index] && this.goalTime[index] !== '0"00"');
  }

  private isTimeSet(index: number): boolean {
    const dateTimeValue = this.goalDateTime[index];
    if (!dateTimeValue) return false;

    // Parse the ISO datetime string directly to avoid timezone issues
    const timePart = dateTimeValue.split('T')[1]; // Get the time part
    const timeComponents = timePart.split(':'); // Split HH:MM:SS.000Z

    const minutes = parseInt(timeComponents[1]) || 0; // Get minutes (MM)
    const seconds = parseInt(timeComponents[2].split('.')[0]) || 0; // Get seconds (SS)

    return minutes > 0 || seconds > 0;
  }

  convertDateTimeToGoalTime(index: number): void {
    const dateTimeValue = this.goalDateTime[index];
    if (dateTimeValue) {
      // Parse the ISO datetime string directly to avoid timezone issues
      // Format: YYYY-MM-DDTHH:MM:SS.000Z
      const timePart = dateTimeValue.split('T')[1]; // Get the time part
      const timeComponents = timePart.split(':'); // Split HH:MM:SS.000Z

      const minutes = parseInt(timeComponents[1]) || 0; // Get minutes (MM)
      const seconds = parseInt(timeComponents[2].split('.')[0]) || 0; // Get seconds (SS)

      // Convert to MM"SS" format as requested
      this.goalTime[index] = `${minutes}"${seconds.toString().padStart(2, '0')}"`;

      console.log(`DateTime: ${dateTimeValue}, Parsed: ${minutes}:${seconds}, Result: ${this.goalTime[index]}`);
    } else {
      this.goalTime[index] = '0"00"';
    }
  }

  getFormattedTime(index: number): string {
    return this.goalTime[index] || '0"00"';
  }

  getPlayerById(playerId: string): LeagueMatchParticipantModel {
    return this.leagueMatchParticipantRes.find(p => p.user.Id === playerId);
  }

  private createDateTimeString(minutes: number, seconds: number): string {
    const today = new Date().toISOString().split('T')[0];
    // Format as HH:MM:SS where HH=00, MM=minutes, SS=seconds
    const timeString = `00:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.000Z`;
    return `${today}T${timeString}`;
  }

  updateGoalDetails(index: number) {
    const selectedPlayerId = this.selectedPlayer[index];
    const goalTime = this.goalTime[index];

    if (selectedPlayerId && this.isTimeSet(index)) {
      const selectedPlayerObj = this.leagueMatchParticipantRes.find(player => player.user.Id === selectedPlayerId);

      // Ensure playerObj has the correct structure for summary_football.ts
      const enhancedPlayerObj = selectedPlayerObj ? {
        ...selectedPlayerObj,
        user: {
          ...selectedPlayerObj.user,
          Id: selectedPlayerId // Ensure Id is set
        },
        memberId: selectedPlayerId // Add memberId as fallback
      } : null;

      // Maintain original goalDetail structure with PLAYER_ID included
      const goalDetail = {
        playerId: selectedPlayerId, // Keep original property name
        playerObj: enhancedPlayerObj,
        time: goalTime,
        index: index,
        // Add PLAYER_ID for compatibility
        PLAYER_ID: selectedPlayerId,
        PLAYER: selectedPlayerObj ? `${selectedPlayerObj.user.FirstName} ${selectedPlayerObj.user.LastName}`.trim() : '',
        TIME: goalTime
      };

      const existingGoalIndex = this.goalDetails.findIndex(goal => goal.index === index);
      if (existingGoalIndex > -1) {
        this.goalDetails[existingGoalIndex] = goalDetail;
      } else {
        this.goalDetails.push(goalDetail);
      }
    } else {
      const existingGoalIndex = this.goalDetails.findIndex(goal => goal.index === index);
      if (existingGoalIndex > -1) {
        this.goalDetails.splice(existingGoalIndex, 1);
      }
    }

    console.log('Goal Details:', this.goalDetails);
  }

  saveGoal() {
    if (!this.validateGoalInputs()) {
      return;
    }

    this.viewCtrl.dismiss({
      goalDetails: this.goalDetails,
      isWinner: this.isWinner
    });
  }

  private validateGoalInputs(): boolean {
    for (let i = 0; i < this.score; i++) {
      if (!this.selectedPlayer[i]) {
        this.commonService.toastMessage(
          `Please select a player for Goal ${i + 1}.`,
          3000,
          ToastMessageType.Info
        );
        return false;
      }

      if (!this.isTimeSet(i)) {
        this.commonService.toastMessage(
          `Please enter a goal time for Goal ${i + 1}.`,
          3000,
          ToastMessageType.Info
        );
        return false;
      }

      // Validate time format and range
      const timeMatch = this.goalTime[i].match(/^(\d+)"(\d{2})"$/);
      if (!timeMatch) {
        this.commonService.toastMessage(
          `Invalid time format for Goal ${i + 1}.`,
          3000,
          ToastMessageType.Info
        );
        return false;
      }

      const minutes = parseInt(timeMatch[1]);
      const seconds = parseInt(timeMatch[2]);

      if (minutes < 0 || minutes > 150) {
        this.commonService.toastMessage(
          `Goal time for Goal ${i + 1} must be between 0 and 150 minutes.`,
          3000,
          ToastMessageType.Info
        );
        return false;
      }

      if (seconds < 0 || seconds > 59) {
        this.commonService.toastMessage(
          `Seconds for Goal ${i + 1} must be between 0 and 59.`,
          3000,
          ToastMessageType.Info
        );
        return false;
      }
    }
    return true;
  }
  dismiss() {
    this.viewCtrl.dismiss({ goalDetails: [], isWinner: this.isWinner });
  }

  getLeagueMatchParticipant() {
    this.commonService.showLoader("Loading players...");
    this.leagueMatchParticipantInput.TeamId = this.teamObj.parentclubteam.id;
    this.leagueMatchParticipantInput.leagueTeamPlayerStatusType = LeagueTeamPlayerStatusType.PLAYINGPLUSBENCH;

    console.log("Fetching participants with input:", this.leagueMatchParticipantInput);

    this.httpService.post(`${API.Get_League_Match_Participant}`, this.leagueMatchParticipantInput).subscribe(
      (res: any) => {
        this.commonService.hideLoader();
        if (res && res.data) {
          this.leagueMatchParticipantRes = res.data;
          this.isDataLoaded = true;
          console.log("Players loaded successfully:", res.data.length);

          // Try to initialize with existing scorers
          this.initializeFormWithExistingScorers();
        } else {
          this.handleApiError("No player data received");
        }
      },
      (error) => {
        this.commonService.hideLoader();
        this.handleApiError("Failed to load players");
        console.error("API Error:", error);
      }
    );
  }

  private handleApiError(message: string): void {
    this.commonService.toastMessage(message, 3000, ToastMessageType.Info);
    this.isDataLoaded = true; // Allow UI to show even with error
  }

  private initializeFormWithExistingScorers(): void {
    if (!this.resultObject || this.leagueMatchParticipantRes.length === 0) {
      return;
    }

    const existingScorers = this.getExistingScorersForTeam();
    if (!existingScorers || existingScorers.length === 0) {
      return;
    }

    // Prefill form and build goalDetails in one step
    existingScorers.forEach((scorer: FootballScoreDetailModel, index) => {
      console.log(`Processing scorer ${index}:`, scorer);

      if (index < this.score && scorer.PLAYER_ID && scorer.TIME) {
        this.selectedPlayer[index] = scorer.PLAYER_ID;

        // Parse time - handle MM"SS" format
        const timeString = scorer.TIME.toString();
        if (timeString.includes('"')) {
          this.goalTime[index] = timeString;
          const parts = timeString.split('"');
          const minutes = parseInt(parts[0]) || 0;
          const seconds = parseInt(parts[1]) || 0;
          this.goalDateTime[index] = this.createDateTimeString(minutes, seconds);
        } else {
          const timeInSeconds = parseInt(timeString) || 0;
          const minutes = Math.floor(timeInSeconds / 60);
          const seconds = timeInSeconds % 60;
          this.goalTime[index] = `${minutes}"${seconds.toString().padStart(2, '0')}"`;
          this.goalDateTime[index] = this.createDateTimeString(minutes, seconds);
        }

        // Build goalDetail immediately
        const playerObj = this.leagueMatchParticipantRes.find(player => player.user.Id === scorer.PLAYER_ID);
        if (playerObj) {
          // Ensure playerObj has the correct structure for summary_football.ts
          const enhancedPlayerObj = {
            ...playerObj,
            user: {
              ...playerObj.user,
              Id: scorer.PLAYER_ID // Ensure Id is set
            },
            memberId: scorer.PLAYER_ID // Add memberId as fallback
          };

          const goalDetail = {
            playerId: scorer.PLAYER_ID,
            playerObj: enhancedPlayerObj,
            time: this.goalTime[index],
            index: index,
            PLAYER_ID: scorer.PLAYER_ID,
            PLAYER: `${playerObj.user.FirstName} ${playerObj.user.LastName}`.trim(),
            TIME: this.goalTime[index]
          };
          this.goalDetails.push(goalDetail);
        }
      }
    });

    console.log("Form initialized - Players:", this.selectedPlayer, "GoalDetails:", this.goalDetails);
  }



  private getExistingScorersForTeam(): FootballScoreDetailModel[] {
    if (!this.resultObject) {
      return [];
    }

    // Get existing scorers based on team (home or away)
    if (this.isWinner && this.resultObject.HOME_TEAM && this.resultObject.HOME_TEAM.SCORE) {
      return this.resultObject.HOME_TEAM.SCORE;
    }

    if (!this.isWinner && this.resultObject.AWAY_TEAM && this.resultObject.AWAY_TEAM.SCORE) {
      return this.resultObject.AWAY_TEAM.SCORE;
    }

    // Fallback: return any available SCORE data
    if (this.resultObject.HOME_TEAM && this.resultObject.HOME_TEAM.SCORE) {
      return this.resultObject.HOME_TEAM.SCORE;
    }

    if (this.resultObject.AWAY_TEAM && this.resultObject.AWAY_TEAM.SCORE) {
      return this.resultObject.AWAY_TEAM.SCORE;
    }

    return [];
  }



}

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
  MatchId: string;
  TeamId: string;
  TeamId2: string;
  leagueTeamPlayerStatusType: number;
}