import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams, Events, ViewController, AlertController } from "ionic-angular";
import { Storage } from "@ionic/storage";
import { ThemeService } from "../../../../services/theme.service";
import { CommonService, ToastMessageType, ToastPlacement } from "../../../../services/common.service";
import { SharedServices } from "../../../services/sharedservice";
import { HttpService } from "../../../../services/http.service";
import { API } from "../../../../shared/constants/api_constants";
import { LineupVisibility, LeagueTeamPlayerStatusType, LeagueMatchActionType, LeagueParticipationStatus } from "../../../../shared/utility/enums";
import { GetIndividualMatchParticipantModel } from "../../../../shared/model/match.model";
import { LeagueMatchParticipantModel } from "../../league/models/league.model";
import { AppType } from "../../../../shared/constants/module.constants";
import { ApiPosition, ApiResponse, DeleteLineupApiInput, Formation, FormationApiInput, LeagueParticipantApiInput, LineupDismissData, ParticipantApiInput, Player, PlayerPosition, SaveLineupApiInput, SaveLineupResponse, TEAM_SIZES, TeamFormation, TeamFormationsApiResponse, TeamOption, TeamSizeFormation, UpdateParticipationApiInput, VisibilityOption } from "../../league/models/lineup.model";

/**
 * Interface for storing team lineup state
 */
interface TeamLineupState {
    positions: PlayerPosition[];
    substitutes: Player[];
    formation: string;
    teamSize: number;
}

/**
 * LineupPage - Football Formation Creator
 * Allows users to select team size, formation, and view player positions on a pitch.
 * 
 * Following code-flow-guide patterns:
 * - Dependency Injection via constructor
 * - Event-based theme handling
 * - HttpService for API calls
 */
@IonicPage()
@Component({
    selector: "page-lineup",
    templateUrl: "lineup.html",
})
export class LineupPage {
    // ===========================================
    // Theme State
    // ===========================================
    isDarkTheme: boolean = false;

    // ===========================================
    // Lineup Configuration
    // ===========================================
    lineupName: string = '';
    selectedTeam: string = '';
    selectedTeamLogo: string = '';
    selectedTeamId: string = '';
    visibility: LineupVisibility = LineupVisibility.ALL_INVITEES;
    selectedTeamSize: number = 5;
    selectedFormation: string = '1-2-1';
    currentPositions: PlayerPosition[] = [];

    // ===========================================
    // Data & Options
    // ===========================================
    teamSizes: number[] = TEAM_SIZES;
    visibilityOptions: VisibilityOption[] = [
        { value: LineupVisibility.ALL_INVITEES, label: 'All invitees' },
        { value: LineupVisibility.TEAM_ONLY, label: 'Team only' },
        { value: LineupVisibility.ADMIN_COACH, label: 'Coaches only' }
    ];
    teams: TeamOption[] = [];
    availablePlayers: Player[] = [];
    substitutes: Player[] = [];

    // API data for formations
    allTeamFormations: TeamFormation[] = [];
    apiFormationData: TeamSizeFormation[] = [];

    // ===========================================
    // Loading States
    // ===========================================
    isLoadingFormations: boolean = false;
    isLoadingPlayers: boolean = false;

    // ===========================================
    // UI State (Dropdowns & Modals)
    // ===========================================
    showTeamDropdown: boolean = false;
    showTeamSizeDropdown: boolean = false;
    showFormationDropdown: boolean = false;
    showVisibilityDropdown: boolean = false;
    showPlayerSelection: boolean = false;
    private dropdownSelectionGuard: boolean = false; // 🛡️ Prevents toggle re-fire on mobile touch events
    showPlayerOptions: boolean = false;
    activePosition: PlayerPosition | null = null;
    selectedSubstitute: Player | null = null;
    recentlyReplacedPlayer: Player | null = null;

    // ===========================================
    // NavParams Data
    // ===========================================
    private matchId: string = '';
    private activityId: string = '';
    isCreateNew: boolean = false;
    private formationSetupId: string = '';
    match: unknown;
    isLeague: boolean = false;  // Flag to determine if navigating from league context
    leagueId: string = '';      // League ID when in league context

    // ===========================================
    // API Input Objects
    // ===========================================
    private participantInput: ParticipantApiInput = {
        parentclubId: "",
        clubId: "",
        activityId: "",
        memberId: "",
        action_type: LeagueMatchActionType.MATCH,
        device_type: 0,
        app_type: AppType.ADMIN_NEW,
        device_id: "",
        updated_by: "",
        MatchId: "",
        TeamId: "",
        leagueTeamPlayerStatusType: LeagueTeamPlayerStatusType.All
    };

    // League-specific participant input (used when isLeague is true)
    private leagueParticipantInput: LeagueParticipantApiInput = {
        parentclubId: "",
        clubId: "",
        activityId: "",
        memberId: "",
        action_type: 0,
        device_type: 0,
        app_type: AppType.ADMIN_NEW,
        device_id: "",
        updated_by: "",
        LeagueId: "",
        MatchId: "",
        TeamId: "",
        TeamId2: "",
        leagueTeamPlayerStatusType: LeagueTeamPlayerStatusType.PLAYING
    };

    private formationInput: FormationApiInput = {
        parentclubId: "",
        clubId: "",
        memberId: "",
        action_type: 0,
        device_type: 0,
        app_type: 0,
        device_id: "",
        updated_by: "",
        activityId: "d47c2ac4-e571-488f-a895-c1940726900f",
        teamSize: 5,
        matchId: "",
        teamId: ""
    };

    private updateParticipationInput: UpdateParticipationApiInput = {
        parentclubId: "",
        clubId: "",
        activityId: "",
        memberId: "",
        action_type: 1,
        device_type: 0,
        app_type: 0,
        device_id: "",
        updated_by: "",
        LeagueId: "",
        MatchId: "",
        ParticipationId: "",
        ParticipationStatus: 0
    };

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private storage: Storage,
        public commonService: CommonService,
        private themeService: ThemeService,
        private events: Events,
        private viewCtrl: ViewController,
        private httpService: HttpService,
        private sharedservice: SharedServices,
        private alertCtrl: AlertController
    ) {
        this.initializeFromNavParams();
        this.initializeApiInputs();
        this.subscribeToThemeEvents();
    }

    // ===========================================
    // Lifecycle Hooks
    // ===========================================

    ionViewDidLoad(): void {
        console.log("ionViewDidLoad LineupPage");
        this.loadTheme();
        this.fetchTeamFormations();
        this.fetchPlayersForTeam();
    }

    ionViewWillEnter(): void {
        console.log("Lineup page - ionViewWillEnter");
        this.loadTheme();

        // Subscribe to theme changes from service
        this.themeService.isDarkTheme$.subscribe(isDark => {
            this.isDarkTheme = isDark;
            this.applyTheme(isDark);
        });

        // Listen for theme changes from events
        this.events.subscribe('theme:changed', (isDark) => {
            this.isDarkTheme = isDark === 'dark' || isDark === true;
            this.applyTheme(this.isDarkTheme);
        });
    }

    ionViewDidEnter(): void {
        setTimeout(() => this.forceThemeCheck(), 50);
        setTimeout(() => this.forceThemeCheck(), 200);
    }

    ionViewWillLeave(): void {
        this.events.unsubscribe('theme:changed');
    }

    // ===========================================
    // Initialization Methods
    // ===========================================

    private initializeFromNavParams(): void {
        this.match = this.navParams.get('match');
        this.matchId = this.navParams.get('matchId') || '';
        this.activityId = this.navParams.get('activityId') || '';
        this.isCreateNew = !!this.navParams.get('isCreateNew');
        this.formationSetupId = this.navParams.get('formationSetupId') || '';
        this.lineupName = this.navParams.get('lineupName') || '';

        // Get league context params
        this.isLeague = !!this.navParams.get('isLeague');
        this.leagueId = this.navParams.get('leagueId') || '';

        // Set teamSize from navParams if not create new
        if (!this.isCreateNew) {
            const teamSize = this.navParams.get('teamSize');
            if (teamSize && teamSize > 0) {
                this.selectedTeamSize = teamSize;
            }
        }

        const homeUserId = this.navParams.get('homeUserId');
        const awayUserId = this.navParams.get('awayUserId');
        const homeUserName = this.navParams.get('homeUserName');
        const awayUserName = this.navParams.get('awayUserName');

        if (homeUserName && awayUserName) {
            const placeholderLogo = 'assets/images/img_placehlder.png';
            this.teams = [
                { id: homeUserId, name: homeUserName, logo: placeholderLogo },
                { id: awayUserId, name: awayUserName, logo: placeholderLogo }
            ];

            if (this.isCreateNew) {
                // Create new: default to 0th element (home team)
                this.selectedTeam = homeUserName;
                this.selectedTeamId = homeUserId;
                this.selectedTeamLogo = placeholderLogo;
            } else {
                // Saved formation: preselect team from navParams
                const teamId = this.navParams.get('teamId') || '';
                const matchedTeam = this.teams.find(t => t.id === teamId);
                if (matchedTeam) {
                    this.selectedTeam = matchedTeam.name;
                    this.selectedTeamId = matchedTeam.id;
                    this.selectedTeamLogo = matchedTeam.logo;
                } else {
                    this.selectedTeam = homeUserName;
                    this.selectedTeamId = homeUserId;
                    this.selectedTeamLogo = placeholderLogo;
                }
            }
        }
    }

    private initializeApiInputs(): void {
        const parentclubId = this.sharedservice.getPostgreParentClubId();
        const memberId = this.sharedservice.getLoggedInId();
        const deviceType = this.sharedservice.getPlatform() === "android" ? 1 : 2;


        // League participant API input (only when isLeague is true)
        if (this.isLeague) {
            this.leagueParticipantInput.parentclubId = parentclubId;
            this.leagueParticipantInput.memberId = memberId;
            this.leagueParticipantInput.device_type = deviceType;
            this.leagueParticipantInput.LeagueId = this.leagueId;
            this.leagueParticipantInput.MatchId = this.matchId;
            this.leagueParticipantInput.TeamId = this.selectedTeamId;
        } else {
            // Participant API input
            this.participantInput.parentclubId = parentclubId;
            this.participantInput.memberId = memberId;
            this.participantInput.device_type = deviceType;
            this.participantInput.activityId = this.activityId;
            this.participantInput.MatchId = this.matchId;
            this.participantInput.TeamId = this.selectedTeamId;

        }

        // Formation API input
        this.formationInput.parentclubId = parentclubId;
        this.formationInput.clubId = "";
        this.formationInput.memberId = memberId;
        this.formationInput.action_type = 0;
        this.formationInput.device_type = deviceType;
        this.formationInput.app_type = AppType.ADMIN_NEW;
        this.formationInput.device_id = "";
        this.formationInput.updated_by = memberId;
        this.formationInput.activityId = this.activityId || "d47c2ac4-e571-488f-a895-c1940726900f";
        this.formationInput.matchId = this.isCreateNew ? '' : this.matchId;
        this.formationInput.teamId = this.isCreateNew ? '' : this.selectedTeamId;

        // Update participation status API input
        this.updateParticipationInput.parentclubId = parentclubId;
        this.updateParticipationInput.memberId = memberId;
        this.updateParticipationInput.device_type = deviceType;
        this.updateParticipationInput.app_type = AppType.ADMIN_NEW;
        this.updateParticipationInput.MatchId = this.matchId;
        // Set LeagueId and action_type based on context
        if (this.isLeague) {
            this.updateParticipationInput.LeagueId = this.leagueId;
            this.updateParticipationInput.action_type = 0;
        } else {
            this.updateParticipationInput.LeagueId = "";
            this.updateParticipationInput.action_type = LeagueMatchActionType.MATCH;
        }
    }

    private subscribeToThemeEvents(): void {
        this.events.subscribe('theme:changed', (theme: string) => {
            this.isDarkTheme = theme === 'dark';
        });
    }

    private loadTheme(): void {
        this.storage.get('dashboardTheme').then((theme) => {
            const isDark = theme === 'dark' || theme === true;
            this.isDarkTheme = isDark;
            this.applyTheme(isDark);
        }).catch(() => {
            this.isDarkTheme = false;
            this.applyTheme(false);
        });
    }

    private applyTheme(isDark: boolean): void {
        const applyToElement = () => {
            const el = document.querySelector("page-lineup");
            if (el) {
                if (isDark) {
                    el.classList.add("dark-theme");
                    el.classList.remove("light-theme");
                    document.body.classList.add("dark-theme");
                    document.body.classList.remove("light-theme");
                } else {
                    el.classList.remove("dark-theme");
                    el.classList.add("light-theme");
                    document.body.classList.remove("dark-theme");
                    document.body.classList.add("light-theme");
                }
                return true;
            }
            return false;
        };

        if (!applyToElement()) {
            setTimeout(() => applyToElement(), 100);
        }
    }

    private forceThemeCheck(): void {
        this.storage.get("dashboardTheme").then((storageTheme) => {
            const bodyHasDarkTheme = document.body.classList.contains("dark-theme");
            let isDark = storageTheme === 'dark' || storageTheme === true;
            if (storageTheme === null && bodyHasDarkTheme) {
                isDark = true;
            }
            this.isDarkTheme = isDark;
            this.applyTheme(isDark);
        });
    }

    // ===========================================
    // API Methods
    // ===========================================

    /**
     * Fetch players - branches to league or match API based on context
     */
    private fetchPlayersForTeam(): void {
        if (!this.matchId || !this.selectedTeamId) {
            console.warn('Missing matchId or teamId for fetching players');
            return;
        }
        this.leagueParticipantInput.TeamId = this.selectedTeamId;
        this.isLoadingPlayers = true;

        if (this.isLeague) {
            this.fetchPlayersForLeague();
        } else {
            this.fetchPlayersForMatch();
        }
    }

    /**
     * Fetch players from GetIndividualMatchParticipant API (non-league context)
     */
    private fetchPlayersForMatch(): void {
        this.participantInput.TeamId = this.selectedTeamId;

        this.httpService.post(`${API.GetIndividualMatchParticipant}`, this.participantInput)
            .subscribe(
                (res: ApiResponse<GetIndividualMatchParticipantModel[]>) => this.handlePlayersResponse(res),
                (error) => this.handlePlayersError(error)
            );
    }

    /**
     * Fetch players from GetLeagueMatchParticipant API (league context)
     * Uses PLAYINGPLUSBENCH to get both playing and bench players in one call
     */
    private fetchPlayersForLeague(): void {
        this.leagueParticipantInput.TeamId = this.selectedTeamId;
        this.leagueParticipantInput.MatchId = this.matchId;
        this.leagueParticipantInput.leagueTeamPlayerStatusType = LeagueTeamPlayerStatusType.PLAYINGPLUSBENCH;

        this.httpService.post(`${API.Get_League_Match_Participant}`, this.leagueParticipantInput)
            .subscribe(
                (res: ApiResponse<LeagueMatchParticipantModel[]>) => this.handleLeaguePlayersResponse(res),
                (error) => this.handlePlayersError(error)
            );
    }

    private handlePlayersResponse(res: ApiResponse<GetIndividualMatchParticipantModel[]>): void {
        if (res && res.data) {
            const participants: GetIndividualMatchParticipantModel[] = res.data;

            // Map PLAYING players → availablePlayers (always refresh from API)
            this.availablePlayers = participants
                .filter((p: GetIndividualMatchParticipantModel) => p.participant_status === LeagueParticipationStatus.PARTICIPANT)
                .map((p: GetIndividualMatchParticipantModel) => this.mapParticipantToPlayer(p));

            // Only set substitutes from API if this is a fresh load (no user modifications yet)
            // Check if we already have positions or substitutes set from cache restore
            const hasExistingState = this.currentPositions.some((p: PlayerPosition) => p.player !== null) ||
                this.substitutes.length > 0;

            if (!hasExistingState) {
                // Map BENCH players → substitutes
                this.substitutes = participants
                    .filter((p: GetIndividualMatchParticipantModel) => p.participant_status === LeagueParticipationStatus.NON_PARTICIPANT)
                    .map((p: GetIndividualMatchParticipantModel) => this.mapParticipantToPlayer(p));
            }

            // Sync: If positions have playerid but no player object (e.g. fresh from API), resolve them
            this.currentPositions.forEach((pos: PlayerPosition) => {
                if (pos.playerid && !pos.player) {
                    const foundPlayer = [...this.availablePlayers, ...this.substitutes].find((p: Player) => p.playerid === pos.playerid);
                    if (foundPlayer) {
                        pos.player = foundPlayer;
                        pos.image = foundPlayer.image; // Populate image in position
                    }
                }
            });
        }
        this.isLoadingPlayers = false;
    }

    private handlePlayersError(error: Error): void {
        console.error('Error fetching players:', error);
        this.commonService.toastMessage("Failed to fetch players", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        this.isLoadingPlayers = false;
    }

    private mapParticipantToPlayer(participant: GetIndividualMatchParticipantModel): Player {
        const profileImage = participant.user && participant.user.profile_image_url ? participant.user.profile_image_url : null;
        return {
            playerid: participant.user.Id,
            participationId: participant.id,
            name: `${participant.user.FirstName} ${participant.user.LastName}`,
            image: profileImage && profileImage !== '' ? profileImage : 'assets/images/img_placehlder.png',
            status: participant.participant_status
        };
    }

    /**
     * Handle response from GetLeagueMatchParticipant API (league context)
     * Filters PLAYING and BENCH players client-side similar to match context
     */
    private handleLeaguePlayersResponse(res: ApiResponse<LeagueMatchParticipantModel[]>): void {
        if (res && res.data) {
            const participants: LeagueMatchParticipantModel[] = res.data;

            // Map PLAYING players → availablePlayers
            this.availablePlayers = participants
                .filter((p: LeagueMatchParticipantModel) => p.participant_status === LeagueParticipationStatus.PARTICIPANT)
                .map((p: LeagueMatchParticipantModel) => this.mapLeagueParticipantToPlayer(p));

            // Only set substitutes from API if this is a fresh load
            const hasExistingState = this.currentPositions.some((pos: PlayerPosition) => pos.player !== null) ||
                this.substitutes.length > 0;

            if (!hasExistingState) {
                // Map BENCH players → substitutes
                this.substitutes = participants
                    .filter((p: LeagueMatchParticipantModel) => p.participant_status === LeagueParticipationStatus.NON_PARTICIPANT)
                    .map((p: LeagueMatchParticipantModel) => this.mapLeagueParticipantToPlayer(p));
            }

            // Sync: If positions have playerid but no player object, resolve them
            this.currentPositions.forEach((pos: PlayerPosition) => {
                if (pos.playerid && !pos.player) {
                    const foundPlayer = [...this.availablePlayers, ...this.substitutes].find((p: Player) => p.playerid === pos.playerid);
                    if (foundPlayer) {
                        pos.player = foundPlayer;
                        pos.image = foundPlayer.image;
                    }
                }
            });
        }
        this.isLoadingPlayers = false;
    }

    /**
     * Map LeagueMatchParticipantModel to Player
     */
    private mapLeagueParticipantToPlayer(participant: LeagueMatchParticipantModel): Player {
        // Note: User model doesn't include ImageURL, using placeholder
        return {
            playerid: participant.user.Id,
            participationId: participant.id,
            name: `${participant.user.FirstName} ${participant.user.LastName}`,
            image: 'assets/images/img_placehlder.png',
            status: participant.participant_status
        };
    }

    /**
     * Fetch team formations from API
     */
    private fetchTeamFormations(): void {
        this.isLoadingFormations = true;
        this.formationInput.teamSize = this.selectedTeamSize;

        this.httpService.post(`${API.GET_TEAM_FORMATIONS}`, this.formationInput)
            .subscribe(
                (res: TeamFormationsApiResponse) => this.handleFormationsResponse(res),
                (error) => this.handleFormationsError(error)
            );
    }

    private handleFormationsResponse(res: TeamFormationsApiResponse): void {
        const data = res && res.data ? res.data : null;
        if (data && data.length > 0) {
            this.allTeamFormations = data;

            if (!this.isCreateNew && this.formationSetupId) {
                // Saved formation flow: preselect from navParams
                const matchedFormation = data.find((f: TeamFormation) => f.id === this.formationSetupId);
                this.selectedFormation = matchedFormation ? matchedFormation.id : data[0].id;
                if (matchedFormation && matchedFormation.visibility !== undefined) {
                    this.visibility = matchedFormation.visibility;
                }
            } else {
                // Create new flow: default to 0th element
                this.selectedFormation = data[0].id;
            }

            this.apiFormationData = this.transformApiToFormationData(data);
            this.validateAndSetFormation();
        } else {
            console.warn('Invalid API response, falling back to hardcoded data');
            this.fallbackToHardcodedData();
        }
        this.currentPositions = [];
        this.updateFormation();
        this.isLoadingFormations = false;
    }

    private handleFormationsError(error: Error): void {
        console.error('Error fetching team formations:', error);
        this.commonService.toastMessage("Formation fetch failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        this.fallbackToHardcodedData();
        this.isLoadingFormations = false;
    }

    private validateAndSetFormation(): void {
        const formations = this.getAvailableFormations();
        if (formations.length === 0) return;

        const existsById = formations.some((f: Formation) => f.id === this.selectedFormation);
        const existsByName = formations.some((f: Formation) => f.formation_name === this.selectedFormation);

        if (!existsById && !existsByName) {
            this.selectedFormation = formations[0].id;
        } else if (!existsById && existsByName) {
            const found = formations.find((f: Formation) => f.formation_name === this.selectedFormation);
            if (found) this.selectedFormation = found.id;
        }
    }

    private transformApiToFormationData(apiFormations: TeamFormation[]): TeamSizeFormation[] {
        const groupedBySize: { [key: number]: Formation[] } = {};

        apiFormations.forEach((formation: TeamFormation) => {
            if (!groupedBySize[formation.team_size]) {
                groupedBySize[formation.team_size] = [];
            }
            groupedBySize[formation.team_size].push({
                id: formation.id,
                formation_name: formation.formation_name,
                is_saved: formation.is_saved || false,
                positions: formation.positions.map((pos: ApiPosition) => ({
                    role: pos.role,
                    x: pos.x,
                    y: pos.y,
                    playerid: pos.playerid || "",
                    image: pos.image || ""
                }))
            });
        });

        return Object.keys(groupedBySize)
            .map((size: string) => ({
                teamSize: parseInt(size, 10),
                formations: groupedBySize[parseInt(size, 10)]
            }))
            .sort((a: TeamSizeFormation, b: TeamSizeFormation) => a.teamSize - b.teamSize);
    }

    private fallbackToHardcodedData(): void {
        this.apiFormationData = [];
        this.teamSizes = TEAM_SIZES;
    }

    // ===========================================
    // Formation & Position Helpers
    // ===========================================

    get selectedFormationName(): string {
        const formations = this.getAvailableFormations();
        if (!formations || formations.length === 0) return this.selectedFormation;

        const formation = formations.find((f: Formation) => f.id === this.selectedFormation);
        if (formation) return formation.formation_name;

        const byName = formations.find((f: Formation) => f.formation_name === this.selectedFormation);
        return byName ? byName.formation_name : this.selectedFormation;
    }

    getAvailableFormations(): Formation[] {
        const teamData = this.apiFormationData.find((f: TeamSizeFormation) => f.teamSize === this.selectedTeamSize);
        return teamData ? teamData.formations : [];
    }

    updateFormation(): void {
        const formationData = this.getFormationData();
        if (!formationData) return;

        this.currentPositions = formationData.map((pos: PlayerPosition) => {
            let assignedPlayer = null;
            let assignedImage = null;

            // Priority 1: If position has playerid from API (saved lineup), find matching player
            if (pos.playerid && pos.playerid !== "") {
                const foundPlayer = [...this.availablePlayers, ...this.substitutes].find(
                    (p: Player) => p.playerid === pos.playerid
                );
                if (foundPlayer) {
                    assignedPlayer = foundPlayer;
                    assignedImage = foundPlayer.image;
                } else {
                    // Use image from API if player not found in current lists
                    assignedImage = pos.image || null;
                }
            }

            // Priority 2: Check if there's an existing player assignment for this role (from cache)
            if (!assignedPlayer) {
                assignedPlayer = this.findExistingPlayerForRole(pos.role);
                assignedImage = assignedPlayer && assignedPlayer.image ? assignedPlayer.image : null;
            }

            return {
                ...pos,
                player: assignedPlayer,
                playerid: assignedPlayer && assignedPlayer.playerid ? assignedPlayer.playerid : (pos.playerid || null),
                image: assignedImage || pos.image || null
            };
        });
    }

    private findExistingPlayerForRole(role: string): Player | null {
        const existing = this.currentPositions.find((p: PlayerPosition) => p.role === role);
        return existing && existing.player ? existing.player : null;
    }

    private getFormationData(): PlayerPosition[] {
        const teamData = this.apiFormationData.find((f: TeamSizeFormation) => f.teamSize === this.selectedTeamSize);
        if (!teamData) return [];

        const formation = teamData.formations.find((f: Formation) => f.id === this.selectedFormation);
        return formation ? formation.positions : [];
    }

    // ===========================================
    // Event Handlers (Dropdowns & Selection)
    // ===========================================

    onTeamSizeChange(size: number): void {
        this.dropdownSelectionGuard = true;
        setTimeout(() => this.dropdownSelectionGuard = false, 0);
        this.selectedTeamSize = size;
        this.showTeamSizeDropdown = false;
        this.fetchTeamFormations();
    }

    onFormationChange(formationId: string): void {
        this.dropdownSelectionGuard = true;
        setTimeout(() => this.dropdownSelectionGuard = false, 0);
        this.selectedFormation = formationId;
        this.showFormationDropdown = false;
        this.updateFormation();
    }

    onTeamChange(team: TeamOption): void {
        this.dropdownSelectionGuard = true;
        setTimeout(() => this.dropdownSelectionGuard = false, 0);
        if (team.id === this.selectedTeamId) {
            this.showTeamDropdown = false;
            return;
        }

        // Update selection
        this.selectedTeam = team.name;
        this.selectedTeamId = team.id;
        this.selectedTeamLogo = team.logo;
        this.showTeamDropdown = false;

        // Re-initialize API inputs with new teamId
        this.initializeApiInputs();

        // Reset to defaults and fetch fresh data
        this.resetToDefaults();

        // Fetch formations and players for new team
        this.fetchTeamFormations();
        this.fetchPlayersForTeam();
    }

    /**
     * Reset lineup to default empty state
     */
    private resetToDefaults(): void {
        this.selectedTeamSize = 5;
        this.currentPositions = [];
        this.substitutes = [];

        // Get the first available formation for the default team size
        const formations = this.getAvailableFormations();
        if (formations.length > 0) {
            this.selectedFormation = formations[0].id;
        } else {
            // Fallback to hardcoded if no API data
            this.selectedFormation = '1-2-1';
        }

        this.updateFormation();
    }

    onVisibilityChange(visibility: LineupVisibility): void {
        this.dropdownSelectionGuard = true;
        setTimeout(() => this.dropdownSelectionGuard = false, 0);
        this.visibility = visibility;
        this.showVisibilityDropdown = false;
    }

    get visibilityLabel(): string {
        const option = this.visibilityOptions.find(o => o.value === this.visibility);
        return option && option.label ? option.label : '';
    }

    // ===========================================
    // Dropdown Toggles
    // ===========================================

    toggleTeamDropdown(): void {
        if (this.dropdownSelectionGuard) return;
        this.closeOtherDropdowns('team');
        this.showTeamDropdown = !this.showTeamDropdown;
    }

    toggleTeamSizeDropdown(): void {
        if (this.dropdownSelectionGuard) return;
        this.closeOtherDropdowns('teamSize');
        this.showTeamSizeDropdown = !this.showTeamSizeDropdown;
    }

    toggleFormationDropdown(): void {
        if (this.dropdownSelectionGuard) return;
        this.closeOtherDropdowns('formation');
        this.showFormationDropdown = !this.showFormationDropdown;
    }

    toggleVisibilityDropdown(): void {
        if (this.dropdownSelectionGuard) return;
        this.closeOtherDropdowns('visibility');
        this.showVisibilityDropdown = !this.showVisibilityDropdown;
    }

    private closeOtherDropdowns(except: string): void {
        if (except !== 'team') this.showTeamDropdown = false;
        if (except !== 'teamSize') this.showTeamSizeDropdown = false;
        if (except !== 'formation') this.showFormationDropdown = false;
        if (except !== 'visibility') this.showVisibilityDropdown = false;
    }

    closeAllDropdowns(): void {
        this.showTeamDropdown = false;
        this.showTeamSizeDropdown = false;
        this.showFormationDropdown = false;
        this.showVisibilityDropdown = false;
        this.showPlayerSelection = false;
        this.showPlayerOptions = false;
        this.selectedSubstitute = null;
    }

    onAddSubstituteClick(): void {
        this.activePosition = null;
        this.selectedSubstitute = null;
        this.showPlayerSelection = true;
        this.showPlayerOptions = false;
    }

    // ===========================================
    // Player Assignment Logic
    // ===========================================

    onPlayerNodeClick(position: PlayerPosition): void {
        // If a substitute is selected and position is empty, assign directly
        if (this.selectedSubstitute && !position.player) {
            this.assignSubstituteToPosition(position);
            return;
        }

        this.activePosition = position;
        this.selectedSubstitute = null;

        if (position.player) {
            this.showPlayerOptions = true;
            this.showPlayerSelection = false;
        } else {
            this.showPlayerSelection = true;
            this.showPlayerOptions = false;
        }
    }

    private assignSubstituteToPosition(position: PlayerPosition): void {
        position.player = this.selectedSubstitute;
        position.playerid = this.selectedSubstitute!.playerid;
        position.image = this.selectedSubstitute!.image;
        this.substitutes = this.substitutes.filter(sub => sub.playerid !== this.selectedSubstitute!.playerid);
        this.selectedSubstitute = null;
    }

    isPlayerSelected(player: Player): boolean {
        const onPitch = this.currentPositions.some(pos => pos.player && pos.player.playerid === player.playerid);
        const isSub = this.substitutes.some(sub => sub.playerid === player.playerid);
        return onPitch || isSub;
    }

    getFilteredPlayers(): Player[] {
        const filtered = this.availablePlayers.filter(player => !this.isPlayerSelected(player));

        // Prioritize recently replaced player
        if (this.recentlyReplacedPlayer) {
            const index = filtered.findIndex(p => p.playerid === this.recentlyReplacedPlayer!.playerid);
            if (index > -1) {
                const [player] = filtered.splice(index, 1);
                filtered.unshift(player);
            }
        }

        return filtered;
    }

    getFilteredSubstitutes(): Player[] {
        const assignedPlayerIds = this.currentPositions
            .filter(pos => pos.playerid)
            .map(pos => pos.playerid);
        return this.substitutes.filter(sub => !assignedPlayerIds.includes(sub.playerid));
    }

    assignPlayer(player: Player): void {
        if (this.isPlayerSelected(player)) return;

        if (this.activePosition) {
            this.activePosition.player = player;
            this.activePosition.playerid = player.playerid;
            this.activePosition.image = player.image;
            this.recentlyReplacedPlayer = null;
            this.showPlayerSelection = false;
        } else {
            // Adding to substitutes - call update API
            this.updateParticipationInput.ParticipationId = player.participationId;
            this.updateParticipationInput.ParticipationStatus = LeagueParticipationStatus.NON_PARTICIPANT;

            this.commonService.showLoader("Adding to bench...");
            this.httpService.post(`${API.Update_League_Match_Participation_Status}`, this.updateParticipationInput)
                .subscribe(
                    (res: ApiResponse<unknown>) => {
                        this.commonService.hideLoader();
                        player.status = LeagueParticipationStatus.NON_PARTICIPANT;
                        this.substitutes.push(player);
                        this.availablePlayers = this.availablePlayers.filter(p => p.playerid !== player.playerid);
                        this.commonService.toastMessage("Player added to bench", 2000, ToastMessageType.Success);
                        this.showPlayerSelection = false;
                    },
                    (error: { error?: { message?: string } }) => {
                        this.commonService.hideLoader();
                        this.commonService.toastMessage(error && error.error && error.error.message ? error.error.message : "Failed to update", 2500, ToastMessageType.Error);
                    }
                );
        }
    }

    removePlayer(): void {
        if (!this.activePosition || !this.activePosition.player) return;

        const removedPlayer = this.activePosition.player;

        // Add back based on original status: 1 = PLAYING → availablePlayers, 2 = BENCH → substitutes
        if (removedPlayer.status === LeagueParticipationStatus.NON_PARTICIPANT) {
            if (!this.substitutes.some(p => p.playerid === removedPlayer.playerid)) {
                this.substitutes.push(removedPlayer);
            }
        } else {
            if (!this.availablePlayers.some(p => p.playerid === removedPlayer.playerid)) {
                this.availablePlayers.push(removedPlayer);
            }
        }

        // Clear the position
        this.activePosition.player = null;
        this.activePosition.playerid = null;
        this.activePosition.image = null;
        this.showPlayerOptions = false;

        this.commonService.toastMessage(`${removedPlayer.name.split(' ')[0]} removed`, 2000);
    }

    replacePlayer(): void {
        this.showPlayerOptions = false;

        if (this.activePosition && this.activePosition.player) {
            const playerToReplace = this.activePosition.player;
            this.recentlyReplacedPlayer = playerToReplace;

            this.activePosition.player = null;
            this.activePosition.playerid = null;
            this.activePosition.image = null;

            // Add replaced player back to substitutes
            this.substitutes.push(playerToReplace);
            this.commonService.toastMessage(`${playerToReplace.name.split(' ')[0]} moved to substitutes`, 2000);
        }

        setTimeout(() => {
            this.showPlayerSelection = true;
        }, 50);
    }

    onSubstituteClick(player: Player, event: Event): void {
        event.stopPropagation();

        if (this.selectedSubstitute && this.selectedSubstitute.playerid === player.playerid) {
            this.selectedSubstitute = null;
        } else {
            this.selectedSubstitute = player;
            this.commonService.toastMessage(`Tap an empty position to assign ${player.name.split(' ')[0]}`, 2000);
        }
    }

    removeSubstitute(player: Player): void {
        this.substitutes = this.substitutes.filter(sub => sub.playerid !== player.playerid);
        if (this.selectedSubstitute && this.selectedSubstitute.playerid === player.playerid) {
            this.selectedSubstitute = null;
        }
    }

    moveToSubstitutes(): void {
        if (!this.activePosition || !this.activePosition.player) return;

        const playerToMove = this.activePosition.player;
        this.substitutes.push(playerToMove);
        this.activePosition.player = null;
        this.activePosition.playerid = null;
        this.activePosition.image = null;
        this.showPlayerOptions = false;
        this.commonService.toastMessage("Player moved to substitutes", 2000);
    }

    // ===========================================
    // Navigation Actions
    // ===========================================

    cancel(): void {
        this.viewCtrl.dismiss();
    }

    save(): void {
        // Basic validation before showing the popup
        if (!this.matchId || !this.selectedTeamId) {
            this.commonService.toastMessage("Missing match or team information", 2500, ToastMessageType.Error);
            return;
        }

        if (!this.lineupName || !this.lineupName.trim()) {
            this.commonService.toastMessage("Please enter a lineup name", 2500, ToastMessageType.Error);
            return;
        }

        const alert = this.alertCtrl.create({
            title: 'Save Lineup',
            message: 'Are you sure you want to save this lineup?',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                        console.log('Save cancelled');
                    }
                },
                {
                    text: 'Save',
                    handler: () => {
                        this.performSave();
                    }
                }
            ]
        });
        alert.present();
    }

    private performSave(): void {
        // Build API payload
        const positionsPayload = this.currentPositions.map((pos: PlayerPosition) => ({
            x: pos.x,
            y: pos.y,
            role: pos.role,
            image: pos.image || "",
            playerid: pos.playerid || ""
        }));

        const substitutesPayload = this.substitutes.map((sub: Player) => ({
            playerid: sub.playerid,
            name: sub.name,
            image: sub.image
        }));

        const deviceType = this.sharedservice.getPlatform() === "android" ? 1 : 2;
        const memberId = this.sharedservice.getLoggedInId();

        const payload: SaveLineupApiInput = {
            parentclubId: this.sharedservice.getPostgreParentClubId(),
            clubId: "",
            activityId: this.activityId,
            memberId: memberId,
            action_type: 0,
            device_type: deviceType,
            app_type: AppType.ADMIN_NEW,
            device_id: "",
            updated_by: memberId,
            formationSetupId: this.selectedFormation,
            matchId: this.matchId,
            leagueId: "", // Empty for standalone matches
            teamId: this.selectedTeamId,
            lineup_name: this.lineupName,
            visibility: this.visibility,
            teamSize: this.selectedTeamSize || 5,
            positions: positionsPayload,
            substitutes: substitutesPayload,
            createdBy: memberId
        };

        console.log('Saving lineup payload:', payload);
        this.commonService.showLoader("Saving lineup...");

        this.httpService.post(`${API.SAVE_TEAM_FORMATION}`, payload)
            .subscribe(
                (res: ApiResponse<SaveLineupResponse>) => {
                    this.commonService.hideLoader();
                    console.log('Save lineup response:', res);
                    this.commonService.toastMessage("Lineup saved successfully", 2500, ToastMessageType.Success);

                    if (res && res.data && res.data.id) {
                        this.isCreateNew = false; // Mark as saved
                        this.selectedFormation = res.data.id; // Sync with returned ID
                    }

                    // Dismiss with the saved data
                    const lineupData: LineupDismissData = {
                        name: this.lineupName,
                        team: this.selectedTeam,
                        teamId: this.selectedTeamId,
                        visibility: this.visibility,
                        teamSize: this.selectedTeamSize,
                        formation: this.selectedFormation,
                        positions: this.currentPositions,
                        substitutes: this.substitutes
                    };
                    this.viewCtrl.dismiss(lineupData);
                },
                (error: { error?: { message?: string } }) => {
                    this.commonService.hideLoader();
                    console.error('Error saving lineup:', error);
                    const errorMessage = error && error.error && error.error.message ? error.error.message : "Failed to save lineup";
                    this.commonService.toastMessage(errorMessage, 2500, ToastMessageType.Error);
                }
            );
    }

    deleteLineup(): void {
        // Show confirmation popup before deletion
        const alert = this.alertCtrl.create({
            title: 'Delete Lineup',
            message: 'Are you sure you want to delete this lineup? This action cannot be undone.',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                        console.log('Delete cancelled');
                    }
                },
                {
                    text: 'Delete',
                    cssClass: 'danger-button',
                    handler: () => {
                        this.performDelete();
                    }
                }
            ]
        });
        alert.present();
    }

    private performDelete(): void {
        if (!this.selectedFormation) {
            this.commonService.toastMessage("No lineup selected to delete", 2500, ToastMessageType.Error);
            return;
        }

        const payload: DeleteLineupApiInput = {
            matchId: this.matchId,
            teamId: this.selectedTeamId,
            formationSetupId: this.selectedFormation,
            deletedBy: this.sharedservice.getLoggedInId()
        };

        console.log('Deleting lineup payload:', payload);
        this.commonService.showLoader("Deleting lineup...");

        this.httpService.post(`${API.DELETE_TEAM_FORMATION}`, payload)
            .subscribe(
                (res: ApiResponse<unknown>) => {
                    this.commonService.hideLoader();
                    console.log('Delete lineup response:', res);
                    this.commonService.toastMessage("Lineup deleted successfully", 2500, ToastMessageType.Success);
                    this.viewCtrl.dismiss({ deleted: true });
                },
                (error: { error?: { message?: string } }) => {
                    this.commonService.hideLoader();
                    console.error('Error deleting lineup:', error);
                    const errorMessage = error && error.error && error.error.message ? error.error.message : "Failed to delete lineup";
                    this.commonService.toastMessage(errorMessage, 2500, ToastMessageType.Error);
                }
            );
    }
}
