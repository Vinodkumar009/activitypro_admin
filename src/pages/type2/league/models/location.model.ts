export interface Locations {
    id: string
    address1: string
    address2: string
    city: string
    map_latitude: string
    map_longitude: string
    map_url: string
    name: string
    note: string
    post_code: string
    website_url: string
    is_bar_available: boolean
    is_wc_available: boolean
    is_drinking_water: boolean
    is_resturant: boolean
    is_disabled_friendly: boolean
    is_baby_change: boolean
    is_parking_available: boolean
}

export interface CatandType {
    key: string
    value: number
}

export class LeagueMatch {
    fixture_id: string
    location_id: string
    home_team_id: string
    away_team_id: string;
    user1_id: string
    user2_id: string
    homeusername: string
    awayusername: string
    league_id: string
    round: number
    match_id: string
    description: string
    start_date: string
    match_title: string
    match_visibility: number;
    payment_type: number;
    member_fees:number;
    non_member_fees:number;
    home_participant_id?: string
    away_participant_id?:string;
    league_type: number;
}

export class MatchEditInput {
    fixture_id: string
    match_id: string
    homeparticipant_id: string
    awayparticipant_id: string
    start_date: string
    round: number
    match_title: string
    location_id: string
    match_visibility: number
    match_description: string;
    payment_type: number;
    member_fees: number;
    non_member_fees: number;
}
