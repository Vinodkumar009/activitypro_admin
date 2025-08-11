import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { CommonService, ToastMessageType } from '../../../../../services/common.service';
import { HttpService } from '../../../../../services/http.service';
import { API } from '../../../../../shared/constants/api_constants';
import { AppType } from '../../../../../shared/constants/module.constants';
import { LeagueTeamPlayerStatusType } from '../../../../../shared/utility/enums';
import { SharedServices } from '../../../../services/sharedservice';
import { LeagueMatchParticipantModel, LeagueParticipationForMatchModel } from '../../models/league.model';
import { LeagueMatch } from '../../models/location.model';



@IonicPage()
@Component({
  selector: 'page-potm',
  templateUrl: 'potm.html',
  providers: [HttpService]
})
export class PotmPage implements OnInit, OnDestroy {
  // Core data
  homeTeamName: string = '';
  awayTeamName: string = '';
  homeTeamObj: LeagueParticipationForMatchModel;
  awayTeamObj: LeagueParticipationForMatchModel;
  matchObj: LeagueMatch;
  leagueId: string;
  activityId: string;
  resultObject: any;

  // Player data
  homeTeamPlayers: LeagueMatchParticipantModel[] = [];
  awayTeamPlayers: LeagueMatchParticipantModel[] = [];
  selectedPlayerIds: Set<string> = new Set();
  maxSelections: number = 2;

  // Loading states
  isDataReady: boolean = false;

  // API input
  private baseApiInput: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public storage: Storage,
    public viewCtrl: ViewController,
    public commonService: CommonService,
    public alertCtrl: AlertController,
    private httpService: HttpService,
    public sharedservice: SharedServices
  ) {
    this.initializeNavParams();
    this.setupBaseApiInput();
  }

  ngOnInit() {
    this.loadTeamParticipants();
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  private initializeNavParams(): void {
    this.matchObj = this.navParams.get("matchObj");
    this.leagueId = this.navParams.get("leagueId");
    this.activityId = this.navParams.get("activityId");
    this.homeTeamObj = this.navParams.get("homeTeamObj");
    this.awayTeamObj = this.navParams.get("awayTeamObj");
    this.resultObject = this.navParams.get("resultObject");

    this.homeTeamName = (this.homeTeamObj && this.homeTeamObj.parentclubteam && this.homeTeamObj.parentclubteam.teamName) || 'Home Team';
    this.awayTeamName = (this.awayTeamObj && this.awayTeamObj.parentclubteam && this.awayTeamObj.parentclubteam.teamName) || 'Away Team';

    console.log("POTM Page initialized with:", {
      homeTeam: this.homeTeamName,
      awayTeam: this.awayTeamName,
      hasResultObject: !!this.resultObject
    });
  }

  private setupBaseApiInput(): void {
    this.baseApiInput = {
      parentclubId: this.sharedservice.getPostgreParentClubId() || '',
      clubId: '',
      activityId: this.activityId || '',
      memberId: this.sharedservice.getLoggedInId() || '',
      action_type: 0,
      device_type: this.sharedservice.getPlatform() === "android" ? 1 : 2,
      app_type: AppType.ADMIN_NEW,
      device_id: this.sharedservice.getDeviceId() || '',
      updated_by: '',
      LeagueId: this.leagueId,
      MatchId: (this.matchObj && this.matchObj.match_id) || '',
      leagueTeamPlayerStatusType: LeagueTeamPlayerStatusType.PLAYINGPLUSBENCH
    };
  }

  private async loadTeamParticipants(): Promise<void> {
    this.commonService.showLoader("Fetching participants...");

    try {
      await Promise.all([
        this.loadHomeTeamParticipants(),
        this.loadAwayTeamParticipants()
      ]);

      this.commonService.hideLoader();
      this.isDataReady = true;
      this.initializeExistingSelections();
    } catch (error) {
      this.commonService.hideLoader();
      console.error("Error loading team participants:", error);
      this.commonService.toastMessage("Error loading team data", 3000, ToastMessageType.Error);
    }
  }

  private loadHomeTeamParticipants(): Promise<void> {
    return new Promise((resolve, reject) => {
      const input = {
        ...this.baseApiInput,
        TeamId: this.homeTeamObj.parentclubteam.id
      };

      this.httpService.post(`${API.Get_League_Match_Participant}`, input).subscribe(
        (res: any) => {
          if (res && res.data) {
            this.homeTeamPlayers = res.data.map((player: any) => ({
              ...player,
              user: { ...player.user, selected: false }
            }));
            console.log("Home team participants loaded:", this.homeTeamPlayers.length);
            resolve();
          } else {
            reject(new Error("No home team data received"));
          }
        },
        (error) => {
          console.error("Error loading home team participants:", error);
          reject(error);
        }
      );
    });
  }

  private loadAwayTeamParticipants(): Promise<void> {
    return new Promise((resolve, reject) => {
      const input = {
        ...this.baseApiInput,
        TeamId: this.awayTeamObj.parentclubteam.id
      };

      this.httpService.post(`${API.Get_League_Match_Participant}`, input).subscribe(
        (res: any) => {
          if (res && res.data) {
            this.awayTeamPlayers = res.data.map((player: any) => ({
              ...player,
              user: { ...player.user, selected: false }
            }));
            console.log("Away team participants loaded:", this.awayTeamPlayers.length);
            resolve();
          } else {
            reject(new Error("No away team data received"));
          }
        },
        (error) => {
          console.error("Error loading away team participants:", error);
          reject(error);
        }
      );
    });
  }

  private initializeExistingSelections(): void {
    if (!this.resultObject || !this.resultObject.POTM || !this.resultObject.POTM.length) {
      console.log("No existing POTM data to initialize");
      return;
    }

    console.log("Initializing existing POTM selections:", this.resultObject.POTM);

    const allPlayers = [...this.homeTeamPlayers, ...this.awayTeamPlayers];

    this.resultObject.POTM.forEach((potm: any) => {
      const player = allPlayers.find(p => p.user.Id === potm.PLAYER_ID);
      if (player) {
        player.user.selected = true;
        this.selectedPlayerIds.add(potm.PLAYER_ID);
        console.log(`Pre-selected POTM: ${player.user.FirstName} ${player.user.LastName}`);
      }
    });

    console.log(`Initialized ${this.selectedPlayerIds.size} existing POTM selections`);
  }

  togglePlayerSelection(player: LeagueMatchParticipantModel): void {
    const playerId = player.user.Id;
    const isCurrentlySelected = this.selectedPlayerIds.has(playerId);

    if (isCurrentlySelected) {
      // Deselect player
      this.selectedPlayerIds.delete(playerId);
      player.user.selected = false;
      console.log(`Deselected: ${player.user.FirstName} ${player.user.LastName}`);
    } else {
      // Check if we can select more players
      if (this.selectedPlayerIds.size >= this.maxSelections) {
        this.commonService.toastMessage(
          `You can select a maximum of ${this.maxSelections} players`,
          3000,
          ToastMessageType.Info
        );
        return;
      }

      // Select player
      this.selectedPlayerIds.add(playerId);
      player.user.selected = true;
      console.log(`Selected: ${player.user.FirstName} ${player.user.LastName}`);
    }

    console.log(`Total selected: ${this.selectedPlayerIds.size}/${this.maxSelections}`);
  }

  isPlayerDisabled(player: LeagueMatchParticipantModel): boolean {
    return !player.user.selected && this.selectedPlayerIds.size >= this.maxSelections;
  }

  get selectedPlayers(): LeagueMatchParticipantModel[] {
    const allPlayers = [...this.homeTeamPlayers, ...this.awayTeamPlayers];
    return allPlayers.filter(player => this.selectedPlayerIds.has(player.user.Id));
  }

  get isLoading(): boolean {
    return !this.isDataReady;
  }

  get canSave(): boolean {
    return this.isDataReady && this.selectedPlayerIds.size > 0;
  }

  save(): void {
    if (!this.canSave) {
      this.commonService.toastMessage("Please select at least one player", 3000, ToastMessageType.Info);
      return;
    }

    const selectedPlayers = this.selectedPlayers;
    console.log("Saving POTM selections:", selectedPlayers.map(p => `${p.user.FirstName} ${p.user.LastName}`));

    this.viewCtrl.dismiss(selectedPlayers);
  }

  dismiss(): void {
    this.viewCtrl.dismiss([]);
  }

  trackByPlayerId(_index: number, player: LeagueMatchParticipantModel): string {
    return player.user.Id;
  }
}

export interface LeagueMatchParticipantInput {
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