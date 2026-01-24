

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
