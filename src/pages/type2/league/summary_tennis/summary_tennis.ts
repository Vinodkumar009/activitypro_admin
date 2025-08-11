import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { IonicPage, ModalController, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { LeagueMatch } from '../models/location.model';
import { LeagueMatchParticipantModel, LeagueParticipationForMatchModel, SelectedPlayerScorersModel } from '../models/league.model';
import { HttpService } from '../../../../services/http.service';
import { API } from '../../../../shared/constants/api_constants';
import { LeagueTeamPlayerStatusType } from '../../../../shared/utility/enums';
import { SharedServices } from '../../../services/sharedservice';
import { AppType } from '../../../../shared/constants/module.constants';
import { first } from 'rxjs/operators';
import {
    TennisSectionModel,
    LeagueResultModel,
    LeagueMatchResultInput,
    PublishLeagueResultForActivitiesInput,
    LeagueMatchParticipantInput,
    POTMDetailModel
} from '../../../../shared/model/league_result.model';

// Tennis-specific interfaces
export interface TennisResultModel {
    LEAGUE_FIXTURE_ID?: string;
    POTM?: POTMDetailModel[];
    HOME_TEAM?: TennisTeamStatsModel;
    AWAY_TEAM?: TennisTeamStatsModel;
    SET_SCORES?: TennisSetScoreModel[];
}

export interface TennisTeamStatsModel {
    IS_WINNER?: boolean;
    NAME?: string;
    TEAM_ID?: string;
    SETS_WON?: number;
    GAMES_WON?: number;
    ACES?: number;
    DOUBLE_FAULTS?: number;
    FIRST_SERVE_PERCENTAGE?: string;
    WINNERS?: number;
    UNFORCED_ERRORS?: number;
    BREAK_POINTS_WON?: number;
}

export interface TennisSetScoreModel {
    SET_NUMBER?: number;
    SCORE?: string;
    WINNER?: string;
}

@IonicPage({
    name: 'SummaryTennisPage',
    segment: 'summary-tennis'
})
@Component({
    selector: 'page-summary_tennis',
    templateUrl: 'summary_tennis.html',
    providers: [HttpService]
})
export class SummaryTennisPage implements AfterViewInit {
    @ViewChild('doughnutCanvas', { read: ElementRef }) doughnutCanvas: ElementRef;

    // Component properties
    homeSetsWon: string = '0';
    awaySetsWon: string = '0';
    potmList: any;
    matchObj: LeagueMatch;
    leagueId: string;
    activityId: string;
    activityCode: number;
    homeTeamObj: LeagueParticipationForMatchModel;
    awayTeamObj: LeagueParticipationForMatchModel;
    selectedPlayersPotm: LeagueMatchParticipantModel[] = [];
    selectedPOTMs: any[] = [];
    potmDisabled: boolean = false;
    leagueMatchParticipantRes: LeagueMatchParticipantModel[] = [];
    getLeagueMatchResultRes: LeagueResultModel | null = null;
    publishLeagueResultForActivitiesRes: any;

    result_json: TennisResultModel = {
        POTM: [],
        HOME_TEAM: {
            IS_WINNER: false,
            NAME: '',
            TEAM_ID: '',
            SETS_WON: 0,
            GAMES_WON: 0,
            ACES: 0,
            DOUBLE_FAULTS: 0,
            FIRST_SERVE_PERCENTAGE: '0%',
            WINNERS: 0,
            UNFORCED_ERRORS: 0,
            BREAK_POINTS_WON: 0
        },
        AWAY_TEAM: {
            IS_WINNER: false,
            NAME: '',
            TEAM_ID: '',
            SETS_WON: 0,
            GAMES_WON: 0,
            ACES: 0,
            DOUBLE_FAULTS: 0,
            FIRST_SERVE_PERCENTAGE: '0%',
            WINNERS: 0,
            UNFORCED_ERRORS: 0,
            BREAK_POINTS_WON: 0
        },
        SET_SCORES: [],
        LEAGUE_FIXTURE_ID: ''
    };

    selectedTab: string = 'Stats';
    homeWinners: string = '0';
    awayWinners: string = '0';
    homeAces: string = '0';
    awayAces: string = '0';
    isHomeStatsPopupVisible: boolean = false;
    isAwayStatsPopupVisible: boolean = false;

    // API Input Objects
    leagueMatchParticipantInput: LeagueMatchParticipantInput = {
        parentclubId: '',
        clubId: '',
        activityId: '',
        memberId: '',
        action_type: 0,
        device_type: 0,
        app_type: 0,
        device_id: '',
        updated_by: '',
        LeagueId: '',
        MatchId: '',
        TeamId: '',
        TeamId2: '',
        leagueTeamPlayerStatusType: 0
    };

    leagueMatchResultInput: LeagueMatchResultInput = {
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
        MatchId: '',
        ActivityCode: 0
    };

    publishLeagueResultForActivitiesInput: PublishLeagueResultForActivitiesInput = {
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
        activityCode: '',
        leaguefixtureId: '',
        homeLeagueParticipationId: '',
        awayLeagueParticipationId: '',
        Tennis: {
            LEAGUE_FIXTURE_ID: '',
            result_description: '',
            result_dets: '',
            POTM: [],
            HOME_TEAM: {
                IS_WINNER: false,
                NAME: '',
                TEAM_ID: '',
                SETS_WON: 0,
                GAMES_WON: 0,
                ACES: 0,
                DOUBLE_FAULTS: 0,
                FIRST_SERVE_PERCENTAGE: '0%',
                WINNERS: 0,
                UNFORCED_ERRORS: 0,
                BREAK_POINTS_WON: 0
            },
            AWAY_TEAM: {
                IS_WINNER: false,
                NAME: '',
                TEAM_ID: '',
                SETS_WON: 0,
                GAMES_WON: 0,
                ACES: 0,
                DOUBLE_FAULTS: 0,
                FIRST_SERVE_PERCENTAGE: '0%',
                WINNERS: 0,
                UNFORCED_ERRORS: 0,
                BREAK_POINTS_WON: 0
            },
            SET_SCORES: []
        }
    };

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public storage: Storage,
        public commonService: CommonService,
        public alertCtrl: AlertController,
        private httpService: HttpService,
        public sharedservice: SharedServices,
        public modalCtrl: ModalController
    ) {
        this.initializeComponent();
    }

    private initializeComponent(): void {
        try {
            // Get navigation parameters
            this.matchObj = this.navParams.get("match");
            this.leagueId = this.navParams.get("leagueId");
            this.activityId = this.navParams.get("activityId");
            this.activityCode = this.navParams.get("activityCode");
            this.homeTeamObj = this.navParams.get("homeTeam");
            this.awayTeamObj = this.navParams.get("awayTeam");
            console.log("ACTIVITY CODE:", this.activityCode);

            // Initialize API inputs
            this.initializeApiInputs();

            // Load data
            this.getLeagueMatchParticipant();
            this.getLeagueMatchResult();

        } catch (error) {
            console.error("Error initializing component:", error);
            this.commonService.toastMessage("Error initializing page", 3000, ToastMessageType.Error);
        }
    }

    private initializeApiInputs(): void {
        const baseInput = this.createBaseApiInput();

        // Initialize league match participant input
        this.leagueMatchParticipantInput = {
            ...baseInput,
            LeagueId: this.leagueId,
            MatchId: this.matchObj.match_id,
            TeamId: this.homeTeamObj.parentclubteam.id || '',
            TeamId2: this.awayTeamObj.parentclubteam.id || '',
            leagueTeamPlayerStatusType: LeagueTeamPlayerStatusType.PLAYINGPLUSBENCH
        };

        // Initialize league match result input
        this.leagueMatchResultInput = {
            ...baseInput,
            MatchId: this.matchObj.match_id,
            ActivityCode: this.activityCode || 0
        };

        // Initialize publish league result input
        this.publishLeagueResultForActivitiesInput = {
            ...baseInput,
            activityCode: this.activityCode.toString() || '',
            leaguefixtureId: this.matchObj.fixture_id || '',
            homeLeagueParticipationId: this.homeTeamObj.id || '',
            awayLeagueParticipationId: this.awayTeamObj.id || '',
            isDrawn: false,
            isHomeTeamWinner: false,
            isAwayTeamWinner: false,
            Tennis: {
                LEAGUE_FIXTURE_ID: '',
                result_description: '',
                result_dets: '',
                POTM: [],
                HOME_TEAM: {
                    SETS_WON: 0,
                    GAMES_WON: 0,
                    ACES: 0,
                    DOUBLE_FAULTS: 0,
                    FIRST_SERVE_PERCENTAGE: '0%',
                    WINNERS: 0,
                    UNFORCED_ERRORS: 0,
                    BREAK_POINTS_WON: 0
                },
                AWAY_TEAM: {
                    SETS_WON: 0,
                    GAMES_WON: 0,
                    ACES: 0,
                    DOUBLE_FAULTS: 0,
                    FIRST_SERVE_PERCENTAGE: '0%',
                    WINNERS: 0,
                    UNFORCED_ERRORS: 0,
                    BREAK_POINTS_WON: 0
                },
                SET_SCORES: []
            }
        };
    }

    private createBaseApiInput(): any {
        return {
            parentclubId: this.sharedservice.getPostgreParentClubId() || '',
            clubId: '',
            activityId: this.activityId || '',
            memberId: this.sharedservice.getLoggedInId() || '',
            action_type: 0,
            device_type: this.sharedservice.getPlatform() === "android" ? 1 : 2,
            app_type: AppType.ADMIN_NEW,
            device_id: this.sharedservice.getDeviceId() || '',
            updated_by: '',
            created_by: ''
        };
    }

    get potmDisplayNames(): POTMDetailModel[] {
        if (!this.result_json || !this.getLeagueMatchResultRes) {
            return [];
        }
        let potm: POTMDetailModel[] = [];

        if (this.selectedPlayersPotm.length && this.selectedPlayersPotm[0].user) {
            potm = this.selectedPlayersPotm
                .map(s => ({
                    PLAYER: `${s.user.FirstName} ${s.user.LastName}`.trim(),
                    PLAYER_ID: s.user.Id,
                    TEAM: s.Team.teamName,
                    TEAM_ID: s.Team.id
                }))
                .filter(p => p.PLAYER.length > 0);

            return potm;
        }

        // Return existing data if no new selections
        return this.result_json.POTM.map(p => ({
            PLAYER: p.PLAYER || '',
            PLAYER_ID: p.PLAYER_ID || '',
            TEAM: p.TEAM || '',
            TEAM_ID: p.TEAM_ID || ''
        })) || [];
    }

    // API Methods
    getLeagueMatchResult(): void {
        this.httpService.post(`${API.Get_League_Match_Result}`, this.leagueMatchResultInput).subscribe(
            (res: any) => {
                try {
                    if (res.data) {
                        this.getLeagueMatchResultRes = res.data;
                        console.log("Get_League_Match_Result RESPONSE", res.data);
                        this.processLeagueMatchResult(this.getLeagueMatchResultRes.result_json);
                    } else {
                        console.log("No data received from getLeagueMatchResult");
                        this.initializeDefaultValues();
                    }
                } catch (error) {
                    console.error("Error processing league match result:", error);
                    this.initializeDefaultValues();
                }
            },
            (error) => {
                console.error("Error fetching league match result:", error);
                this.commonService.toastMessage("Error fetching match result", 3000, ToastMessageType.Error);
                this.initializeDefaultValues();
            }
        );
    }

    private processLeagueMatchResult(rawResultJson: any): void {
        if (typeof rawResultJson === 'string') {
            try {
                this.result_json = JSON.parse(rawResultJson) as TennisResultModel;
                console.log("Decoded result_json (parsed):", this.result_json);
            } catch (err) {
                console.error('Failed to parse result_json:', err, rawResultJson);
                this.result_json = {};
            }
        } else if (typeof rawResultJson === 'object' && rawResultJson !== null) {
            this.result_json = rawResultJson as TennisResultModel;
            console.log("Decoded result_json (object):", this.result_json);
        } else {
            console.warn('result_json is neither string nor object:', rawResultJson);
            this.result_json = {};
        }

        // Update component properties from result_json
        this.updateComponentFromResultJson();
    }

    private updateComponentFromResultJson(): void {
        if (this.result_json) {
            const homeTeam = this.result_json.HOME_TEAM;
            const awayTeam = this.result_json.AWAY_TEAM;

            if (homeTeam && awayTeam) {
                this.homeSetsWon = homeTeam.SETS_WON ? homeTeam.SETS_WON.toString() : '0';
                this.awaySetsWon = awayTeam.SETS_WON ? awayTeam.SETS_WON.toString() : '0';
                this.homeWinners = homeTeam.WINNERS ? homeTeam.WINNERS.toString() : '0';
                this.awayWinners = awayTeam.WINNERS ? awayTeam.WINNERS.toString() : '0';
                this.homeAces = homeTeam.ACES ? homeTeam.ACES.toString() : '0';
                this.awayAces = awayTeam.ACES ? awayTeam.ACES.toString() : '0';
            }
        }
    }

    private initializeDefaultValues(): void {
        this.result_json = {};
        this.homeSetsWon = '0';
        this.awaySetsWon = '0';
        this.homeWinners = '0';
        this.awayWinners = '0';
        this.homeAces = '0';
        this.awayAces = '0';
    }

    PublishLeagueResult(result_input: Partial<PublishLeagueResultForActivitiesInput>): void {
        this.httpService.post(`${API.Publish_League_Result_For_Activities}`, result_input).subscribe(
            (res: any) => {
                if (res.data) {
                    console.log("Publish_League_Result RESPONSE", res.data);
                    this.commonService.toastMessage("Result published successfully", 2500, ToastMessageType.Success);
                    if (this.isHomeStatsPopupVisible) this.isHomeStatsPopupVisible = false;
                    if (this.isAwayStatsPopupVisible) this.isAwayStatsPopupVisible = false;
                    this.getLeagueMatchResult();
                } else {
                    console.log("No data received from PublishLeagueResult");
                }
            },
            (error) => {
                console.error("Error publishing league result:", error);
                this.commonService.toastMessage("Error publishing result", 3000, ToastMessageType.Error);
            }
        );
    }

    publishLeagueResultForActivities(): void {
        try {
            // Update Tennis section with current data
            if (this.publishLeagueResultForActivitiesInput.Tennis) {
                this.publishLeagueResultForActivitiesInput.Tennis.HOME_TEAM.WINNERS = this.result_json.HOME_TEAM && this.result_json.HOME_TEAM.WINNERS ? this.result_json.HOME_TEAM.WINNERS : 0;
                this.publishLeagueResultForActivitiesInput.Tennis.AWAY_TEAM.WINNERS = this.result_json.AWAY_TEAM && this.result_json.AWAY_TEAM.WINNERS ? this.result_json.AWAY_TEAM.WINNERS : 0;
                this.publishLeagueResultForActivitiesInput.Tennis.HOME_TEAM.ACES = this.result_json.HOME_TEAM && this.result_json.HOME_TEAM.ACES ? this.result_json.HOME_TEAM.ACES : 0;
                this.publishLeagueResultForActivitiesInput.Tennis.AWAY_TEAM.ACES = this.result_json.AWAY_TEAM && this.result_json.AWAY_TEAM.ACES ? this.result_json.AWAY_TEAM.ACES : 0;
            }

            this.httpService.post(`${API.Publish_League_Result_For_Activities}`, this.publishLeagueResultForActivitiesInput).subscribe(
                (res: any) => {
                    if (res.data) {
                        this.publishLeagueResultForActivitiesRes = res.data;
                        console.log("Publish_League_Result_For_Activities RESPONSE", res.data);
                        this.getLeagueMatchResult();
                    } else {
                        console.log("No data received from publishLeagueResultForActivities");
                    }
                },
                (error) => {
                    console.error("Error in publishLeagueResultForActivities:", error);
                    this.commonService.toastMessage("Error publishing activities result", 3000, ToastMessageType.Error);
                }
            );
        } catch (error) {
            console.error("Error preparing data for publishLeagueResultForActivities:", error);
        }
    }

    getLeagueMatchParticipant(): void {
        if (!this.leagueMatchParticipantInput.TeamId || !this.leagueMatchParticipantInput.TeamId2) {
            console.error("TeamId and TeamId2 are required for getLeagueMatchParticipant");
            return;
        }

        this.commonService.showLoader("Fetching participants...");

        this.httpService.post(`${API.Get_League_Match_Participant}`, this.leagueMatchParticipantInput).subscribe(
            (res: any) => {
                this.commonService.hideLoader();
                if (res.data) {
                    this.leagueMatchParticipantRes = res.data || [];
                    console.log("Get_League_Match_Participant RESPONSE", JSON.stringify(res.data));
                } else {
                    console.log("No participants data received");
                    this.leagueMatchParticipantRes = [];
                }
            },
            (error) => {
                this.commonService.hideLoader();
                console.error("Error fetching league match participants:", error);
                this.commonService.toastMessage("Error fetching participants", 3000, ToastMessageType.Error);
                this.leagueMatchParticipantRes = [];
            }
        );
    }

    async updateHomeTeamStats() {
        const result_input: Partial<PublishLeagueResultForActivitiesInput> = {
            ...this.createBaseResultInput(),
            Tennis: {
                LEAGUE_FIXTURE_ID: this.matchObj.fixture_id || '',
                HOME_TEAM: {
                    IS_WINNER: false,
                    NAME: this.homeTeamObj.parentclubteam.teamName || '',
                    TEAM_ID: this.homeTeamObj.parentclubteam.id || '',
                    SETS_WON: this.result_json.HOME_TEAM && this.result_json.HOME_TEAM.SETS_WON ? this.result_json.HOME_TEAM.SETS_WON : 0,
                    GAMES_WON: this.result_json.HOME_TEAM && this.result_json.HOME_TEAM.GAMES_WON ? this.result_json.HOME_TEAM.GAMES_WON : 0,
                    ACES: this.result_json.HOME_TEAM && this.result_json.HOME_TEAM.ACES ? this.result_json.HOME_TEAM.ACES : 0,
                    DOUBLE_FAULTS: this.result_json.HOME_TEAM && this.result_json.HOME_TEAM.DOUBLE_FAULTS ? this.result_json.HOME_TEAM.DOUBLE_FAULTS : 0,
                    FIRST_SERVE_PERCENTAGE: this.result_json.HOME_TEAM && this.result_json.HOME_TEAM.FIRST_SERVE_PERCENTAGE ? this.result_json.HOME_TEAM.FIRST_SERVE_PERCENTAGE : '0%',
                    WINNERS: this.result_json.HOME_TEAM && this.result_json.HOME_TEAM.WINNERS ? this.result_json.HOME_TEAM.WINNERS : 0,
                    UNFORCED_ERRORS: this.result_json.HOME_TEAM && this.result_json.HOME_TEAM.UNFORCED_ERRORS ? this.result_json.HOME_TEAM.UNFORCED_ERRORS : 0,
                    BREAK_POINTS_WON: this.result_json.HOME_TEAM && this.result_json.HOME_TEAM.BREAK_POINTS_WON ? this.result_json.HOME_TEAM.BREAK_POINTS_WON : 0
                }
            }
        };
        this.PublishLeagueResult(result_input);
    }

    async updateAwayTeamStats() {
        const result_input: Partial<PublishLeagueResultForActivitiesInput> = {
            ...this.createBaseResultInput(),
            Tennis: {
                LEAGUE_FIXTURE_ID: this.matchObj.fixture_id || '',
                AWAY_TEAM: {
                    IS_WINNER: false,
                    NAME: this.awayTeamObj.parentclubteam.teamName || '',
                    TEAM_ID: this.awayTeamObj.parentclubteam.id || '',
                    SETS_WON: this.result_json.AWAY_TEAM && this.result_json.AWAY_TEAM.SETS_WON ? this.result_json.AWAY_TEAM.SETS_WON : 0,
                    GAMES_WON: this.result_json.AWAY_TEAM && this.result_json.AWAY_TEAM.GAMES_WON ? this.result_json.AWAY_TEAM.GAMES_WON : 0,
                    ACES: this.result_json.AWAY_TEAM && this.result_json.AWAY_TEAM.ACES ? this.result_json.AWAY_TEAM.ACES : 0,
                    DOUBLE_FAULTS: this.result_json.AWAY_TEAM && this.result_json.AWAY_TEAM.DOUBLE_FAULTS ? this.result_json.AWAY_TEAM.DOUBLE_FAULTS : 0,
                    FIRST_SERVE_PERCENTAGE: this.result_json.AWAY_TEAM && this.result_json.AWAY_TEAM.FIRST_SERVE_PERCENTAGE ? this.result_json.AWAY_TEAM.FIRST_SERVE_PERCENTAGE : '0%',
                    WINNERS: this.result_json.AWAY_TEAM && this.result_json.AWAY_TEAM.WINNERS ? this.result_json.AWAY_TEAM.WINNERS : 0,
                    UNFORCED_ERRORS: this.result_json.AWAY_TEAM && this.result_json.AWAY_TEAM.UNFORCED_ERRORS ? this.result_json.AWAY_TEAM.UNFORCED_ERRORS : 0,
                    BREAK_POINTS_WON: this.result_json.AWAY_TEAM && this.result_json.AWAY_TEAM.BREAK_POINTS_WON ? this.result_json.AWAY_TEAM.BREAK_POINTS_WON : 0
                }
            }
        };
        this.PublishLeagueResult(result_input);
    }

    async gotoSetScoreInputPage(): Promise<void> {
        const setsWon = Math.max(parseInt(this.homeSetsWon), parseInt(this.awaySetsWon));

        if (setsWon <= 0) {
            this.commonService.toastMessage("Please set the match result first", 3000, ToastMessageType.Info);
            return;
        }

        const modal = this.modalCtrl.create("TennisScoreInputPage", {
            "matchObj": this.matchObj,
            "leagueId": this.leagueId,
            "activityId": this.activityId,
            "teamObj": this.homeTeamObj,
            "setsWon": setsWon,
            "ishome": true,
        });

        modal.onDidDismiss(data => {
            console.log('TennisScoreInputPage modal dismissed');
            if (data.setDetails) {
                this.handleSetScoreInputResult(data.setDetails);
            } else {
                console.log('No set details received from modal');
            }
        });

        modal.present();
    }

    private handleSetScoreInputResult(setDetails: any[]): void {
        try {
            const result_input: Partial<PublishLeagueResultForActivitiesInput> = {
                ...this.createBaseResultInput(),
                Tennis: {
                    LEAGUE_FIXTURE_ID: this.matchObj.fixture_id || '',
                    SET_SCORES: setDetails
                }
            };

            this.PublishLeagueResult(result_input);
            console.log("Received Set Details:", setDetails);
        } catch (error) {
            console.error("Error handling set score input result:", error);
            this.commonService.toastMessage("Error processing set details", 3000, ToastMessageType.Error);
        }
    }

    async gotoResultInputPage(): Promise<void> {
        console.log("Going to result input page");

        const modal = this.modalCtrl.create("TennisResultInputPage", {
            "matchObj": this.matchObj,
            "leagueId": this.leagueId,
            "activityId": this.activityId,
            "homeTeamObj": this.homeTeamObj,
            "awayTeamObj": this.awayTeamObj,
            "resultId": this.getLeagueMatchResultRes ? this.getLeagueMatchResultRes.Id : '',
        });

        modal.onDidDismiss(data => {
            console.log('TennisResultInputPage modal dismissed');
            if (data && this.isValidResultData(data)) {
                this.handleResultInputData(data);
            } else {
                console.log('Invalid or no data received from result input modal');
            }
        });

        modal.present();
    }

    private isValidResultData(data: any): boolean {
        return data &&
            data.homeSetsWon !== undefined &&
            data.awaySetsWon !== undefined &&
            parseInt(data.homeSetsWon) >= 0 &&
            parseInt(data.awaySetsWon) >= 0;
    }

    private handleResultInputData(data: any): void {
        try {
            console.log("Received data from result input page:", data);

            const homeSets = parseInt(data.homeSetsWon);
            const awaySets = parseInt(data.awaySetsWon);

            this.homeSetsWon = homeSets.toString();
            this.awaySetsWon = awaySets.toString();

            const isDrawn = homeSets === awaySets;

            const result_input: Partial<PublishLeagueResultForActivitiesInput> = {
                ...this.createBaseResultInput(),
                Tennis: {
                    LEAGUE_FIXTURE_ID: this.matchObj.fixture_id || '',
                    HOME_TEAM: {
                        IS_WINNER: isDrawn ? false : homeSets > awaySets,
                        NAME: this.homeTeamObj.parentclubteam.teamName || '',
                        TEAM_ID: this.homeTeamObj.parentclubteam.id || '',
                        SETS_WON: homeSets
                    },
                    AWAY_TEAM: {
                        IS_WINNER: isDrawn ? false : awaySets > homeSets,
                        NAME: this.awayTeamObj.parentclubteam.teamName || '',
                        TEAM_ID: this.awayTeamObj.parentclubteam.id || '',
                        SETS_WON: awaySets
                    }
                }
            };

            this.PublishLeagueResult(result_input);
        } catch (error) {
            console.error("Error handling result input data:", error);
            this.commonService.toastMessage("Error processing result data", 3000, ToastMessageType.Error);
        }
    }

    async gotoPotmPage(): Promise<void> {
        console.log("Going to POTM page");

        const modal = this.modalCtrl.create("PotmPage", {
            "matchObj": this.matchObj,
            "leagueId": this.leagueId,
            "activityId": this.activityId,
            "homeTeamObj": this.homeTeamObj,
            "awayTeamObj": this.awayTeamObj,
        });

        modal.onDidDismiss(data => {
            console.log('PotmPage modal dismissed');
            if (data && Array.isArray(data)) {
                this.selectedPlayersPotm = data;
                console.log("Received selected POTM players:", this.selectedPlayersPotm);

                const result_input: Partial<PublishLeagueResultForActivitiesInput> = {
                    ...this.createBaseResultInput(),
                    Tennis: {
                        LEAGUE_FIXTURE_ID: this.matchObj.fixture_id || '',
                        POTM: this.potmDisplayNames
                    }
                };

                this.PublishLeagueResult(result_input);
            } else {
                console.log('No valid POTM data received from modal');
            }
        });

        modal.present();
    }

    private createBaseResultInput(): Partial<PublishLeagueResultForActivitiesInput> {
        return {
            parentclubId: this.sharedservice.getPostgreParentClubId() || '',
            clubId: '',
            memberId: this.sharedservice.getLoggedInId() || '',
            action_type: 0,
            device_type: this.sharedservice.getPlatform() === "android" ? 1 : 2,
            app_type: AppType.ADMIN_NEW,
            device_id: this.sharedservice.getDeviceId() || '',
            updated_by: this.sharedservice.getLoggedInId() || '',
            created_by: this.sharedservice.getLoggedInId() || '',
            activityId: this.activityId || '',
            activityCode: this.activityCode.toString() || '',
            leaguefixtureId: this.matchObj.fixture_id || '',
        };
    }

    ngAfterViewInit() {
        this.drawDoughnutChart();
    }

    drawDoughnutChart() {
        const canvas = this.doughnutCanvas.nativeElement;
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(canvas.width, canvas.height) / 2;

        // Parse and validate winners data for tennis
        let homeValue = parseFloat(this.homeWinners) || 0;
        let awayValue = parseFloat(this.awayWinners) || 0;

        console.log('Original values - Home:', this.homeWinners, 'Away:', this.awayWinners);
        console.log('Parsed values - Home:', homeValue, 'Away:', awayValue);

        const total = homeValue + awayValue;
        console.log('Total:', total);

        // If both are 0, show equal split
        if (total === 0) {
            homeValue = 50;
            awayValue = 50;
        } else {
            // Convert to percentages
            homeValue = (homeValue / total) * 100;
            awayValue = (awayValue / total) * 100;
        }

        homeValue = parseFloat(homeValue.toFixed(2));
        awayValue = parseFloat(awayValue.toFixed(2));

        const data = [homeValue, awayValue];
        console.log('Final chart data:', data);

        const labels = [this.homeTeamObj.parentclubteam.teamName || 'Home Team', this.awayTeamObj.parentclubteam.teamName || 'Away Team'];
        const colors = ['#FF6B6B', '#4ECDC4'];

        let startAngle = -Math.PI / 2; // Start from top

        // Clear canvas first
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < data.length; i++) {
            if (data[i] > 0) {
                const sliceAngle = (2 * Math.PI * data[i]) / 100;
                console.log(`Drawing slice ${i}: value=${data[i]}%, angle=${sliceAngle.toFixed(4)} radians, degrees=${(sliceAngle * 180 / Math.PI).toFixed(1)}°`);

                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
                ctx.lineTo(centerX, centerY);
                ctx.fillStyle = colors[i];
                ctx.fill();
                ctx.closePath();

                startAngle += sliceAngle;
            }
        }

        // Add white circle in the middle to make it a doughnut chart
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.8, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.closePath();

        // Add team logos
        const homeLogo = new Image();
        homeLogo.src = this.homeTeamObj.parentclubteam.logo_url || 'assets/imgs/default-team-logo.png';
        const awayLogo = new Image();
        awayLogo.src = this.awayTeamObj.parentclubteam.logo_url || 'assets/imgs/default-team-logo.png';

        let imagesLoaded = 0;
        const totalImages = 2;

        const checkImagesLoaded = () => {
            imagesLoaded++;
            if (imagesLoaded === totalImages) {
                let logoWidth = 40;
                let logoHeight = 40;
                const homeLogoX = centerX - logoWidth - 15;
                const homeLogoY = centerY - logoHeight / 2;
                const awayLogoX = centerX + 15;
                const awayLogoY = centerY - logoHeight / 2;

                ctx.drawImage(homeLogo, homeLogoX, homeLogoY, logoWidth, logoHeight);
                ctx.drawImage(awayLogo, awayLogoX, awayLogoY, logoWidth, logoHeight);
            }
        };

        homeLogo.onload = checkImagesLoaded;
        awayLogo.onload = checkImagesLoaded;
        homeLogo.onerror = checkImagesLoaded;
        awayLogo.onerror = checkImagesLoaded;
    }

    // Utility Methods
    homeTeamData(): TennisTeamStatsModel {
        return this.result_json.HOME_TEAM || {};
    }

    awayTeamData(): TennisTeamStatsModel {
        return this.result_json.AWAY_TEAM || {};
    }

    getPercentage(value1: string | number, value2: string | number, team: 'HOME_TEAM' | 'AWAY_TEAM'): number {
        const val1 = typeof value1 === 'string' ? parseFloat(value1) || 0 : value1 || 0;
        const val2 = typeof value2 === 'string' ? parseFloat(value2) || 0 : value2 || 0;
        const total = val1 + val2;

        if (total === 0) return 50;

        if (team === 'HOME_TEAM') {
            return (val1 / total) * 100;
        } else {
            return (val2 / total) * 100;
        }
    }

    // Safe getter methods for template
    getHomeTeamStat(statName: string): number | string {
        return this.result_json.HOME_TEAM && this.result_json.HOME_TEAM[statName] ? this.result_json.HOME_TEAM[statName] : 0;
    }

    getAwayTeamStat(statName: string): number | string {
        return this.result_json.AWAY_TEAM && this.result_json.AWAY_TEAM[statName] ? this.result_json.AWAY_TEAM[statName] : 0;
    }

    getStatPercentage(statName: string, team: 'HOME_TEAM' | 'AWAY_TEAM'): number {
        const homeValue = this.result_json.HOME_TEAM && this.result_json.HOME_TEAM[statName] ? this.result_json.HOME_TEAM[statName] : 0;
        const awayValue = this.result_json.AWAY_TEAM && this.result_json.AWAY_TEAM[statName] ? this.result_json.AWAY_TEAM[statName] : 0;
        return this.getPercentage(homeValue, awayValue, team);
    }
}