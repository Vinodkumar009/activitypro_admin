

/**
 * Position data from API response
 */
export interface ApiPosition {
    x: number;
    y: number;
    role: string;
    playerid?: string | null;
    image?: string;

}

/**
 * Team formation from API response
 */
export interface TeamFormation {
    id: string;
    created_at: string;
    created_by: string;
    updated_at: string;
    deleted_at: string | null;
    updated_by: string;
    is_active: boolean;
    formation_name: string;
    team_size: number;
    positions: ApiPosition[];
    activity_id: string;
    lineup_name?: string | null;
    visibility?: number;
    is_saved?: boolean; // Indicates if this is a saved lineup
}

/**
 * API response structure for team formations
 */
export interface TeamFormationsApiResponse {
    status: number;
    message: string;
    data: TeamFormation[];
    type: string;
    isArray: boolean;
}

/**
 * Represents a player in the system
 */
export interface Player {
    playerid: string;
    name: string;
    image?: string;
    status?: number; // 1 = PLAYING, 2 = BENCH
    participationId?: string; // For update participation status API
}

/**
 * Represents a player's position on the pitch
 * x and y are percentages (0-100) from top-left corner
 */
export interface PlayerPosition {
    role: string;
    x: number; // 0–100 (left to right)
    y: number; // 0–100 (top to bottom)
    playerid?: string | null; // ID of assigned player
    image?: string | null; // URL to the player's profile image
    player?: Player | null; // Full player object (optional for UI)
}

/**
 * Represents a single formation for a team size
 */
export interface Formation {
    id: string;
    formation_name: string;
    positions: PlayerPosition[];
    is_saved?: boolean; // Indicates if this is a saved lineup
}

/**
 * Maps a team size to its available formations
 */
export interface TeamSizeFormation {
    teamSize: number;
    formations: Formation[];
}

/**
 * Represents a saved lineup/formation from the API
 * Used in the action sheet for lineup selection
 */
export interface SavedFormation {
    id: string;
    formation_name: string;
    lineup_name: string;
    formation_setup_id: string;
    team_size: number;
    team_name: string;
    team_id: string;
}



/**
 * Available team sizes
 */
export const TEAM_SIZES: number[] = [5, 6, 7, 8, 9, 10, 11];

// ===========================================
// API Input Types
// ===========================================

/**
 * Base API input with common fields
 */
export interface BaseApiInput {
    parentclubId: string;
    clubId: string;
    memberId: string;
    action_type: number;
    device_type: number;
    app_type: number;
    device_id: string;
    updated_by: string;
}

/**
 * Input for GetIndividualMatchParticipant API
 */
export interface ParticipantApiInput extends BaseApiInput {
    activityId: string;
    MatchId: string;
    TeamId: string;
    leagueTeamPlayerStatusType: number;
}

/**
 * Input for GetLeagueMatchParticipant API
 */
export interface LeagueParticipantApiInput extends BaseApiInput {
    activityId: string;
    LeagueId: string;
    MatchId: string;
    TeamId: string;
    TeamId2: string;
    leagueTeamPlayerStatusType: number;
}

/**
 * Input for GetTeamFormations API
 */
export interface FormationApiInput extends BaseApiInput {
    activityId: string;
    teamSize: number;
    matchId: string;
    teamId: string;
}

/**
 * Input for UpdateLeagueMatchParticipationStatus API
 */
export interface UpdateParticipationApiInput extends BaseApiInput {
    activityId: string;
    LeagueId: string;
    MatchId: string;
    ParticipationId: string;
    ParticipationStatus: number;
}

/**
 * Input for SaveTeamFormation API
 */
export interface SaveLineupApiInput extends BaseApiInput {
    activityId: string;
    formationSetupId: string;
    matchId: string;
    leagueId: string;
    teamId: string;
    lineup_name: string;
    visibility: number;
    teamSize: number;
    positions: PositionPayload[];
    substitutes: SubstitutePayload[];
    createdBy: string;
}

/**
 * Position payload for save API
 */
export interface PositionPayload {
    x: number;
    y: number;
    role: string;
    playerid: string | null;
    image: string | null;
}

/**
 * Substitute payload for save API
 */
export interface SubstitutePayload {
    playerid: string;
    name: string;
    image: string | undefined;
}

/**
 * Input for DeleteTeamFormation API
 */
export interface DeleteLineupApiInput {
    matchId: string;
    teamId: string;
    formationSetupId: string;
    deletedBy: string;
}

// ===========================================
// API Response Types
// ===========================================

/**
 * Generic API response structure
 */
export interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
    type?: string;
    isArray?: boolean;
}

/**
 * Response for save lineup API
 */
export interface SaveLineupResponse {
    id: string;
    message?: string;
}

/**
 * Team option for dropdown
 */
export interface TeamOption {
    id: string;
    name: string;
    logo: string;
}

/**
 * Visibility option for dropdown
 */
export interface VisibilityOption {
    value: number;
    label: string;
}

/**
 * Lineup data returned when dismissing the page
 */
export interface LineupDismissData {
    name: string;
    team: string;
    teamId: string;
    visibility: number;
    teamSize: number;
    formation: string;
    positions: PlayerPosition[];
    substitutes: Player[];
    deleted?: boolean;
}
