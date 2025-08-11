// 👤 Interface for the User details within a Participant
export interface ParticipantUser {
    FirstName: string;
    LastName: string;
    FirebaseKey: string;
}

// 🧑‍🤝‍🧑 Interface for a Participant within a Team
export interface MatchParticipant {
    User: ParticipantUser; // 👤 Nested User details
}

// ⚽ Interface for the Activity details within a Match
export interface MatchActivity {
    Id: string;
    ActivityName: string;
}

// 🧑‍🏫 Interface for a Host within a Match
export interface MatchHost {
    Name: string;
    User: UserModel
}

// 🏈 Interface for a Team within a Match
export interface MatchTeam {
    Id: string;
    TeamName: string;
    TeamPoint: number;
    ResultStatus: number; // 📊 Status of the team's result in the match
    Participants: MatchParticipant[]; // 🧑‍🤝‍🧑 Array of participants in the team
}
export class ResultModel {
    CreatedAt: string; // 📅 Timestamp of when the result was created
    resultDescription: string; // 📝 Description of the match result
    ResultDetails: string;
    ResultStatus: number;
    PublishedByApp: string;
    Winner: TeamModel;
}
export class TeamModel {
    Id: string;
    TeamName: string;
    ResultStatus: number;
    TeamPoint: number;
    Description: string;
    CoachName: string;
    Participants: ParticipantModel[];
}

export class ParticipantModel {
    ParticipationStatus: number;
    PaymentStatus: number;
    PaymentTracking: string;
    InviteStatus: number;
    TotalPoints: number;
    User: UserModel;
    CreatedAt: string;
    UpdatedAt: string;
    InviteType: number;
    TotalPonumbers: number;
    Team: TeamModel[];
    Match: MatchModelV2;
}
export class UserModel {
    Id: string;
    FirstName: string;
    LastName: string;
    Gender: string;
    DOB: string;
    FirebaseKey?: string;
}

// 🏟️ Interface for a single Match object
export interface MatchModelV2 {
    Id: string;
    IsActive: boolean;
    IsEnable: boolean;
    CreatedAt: string; // 📅 Timestamp string
    CreatedBy: string;
    Activity: MatchActivity; // ⚽ Nested Activity details
    Result: ResultModel; // 🏆 Match result (type unknown, can be null)
    MatchVisibility: number; // 👁️ Visibility status (e.g., 0 for public)
    GameType: number; // 🎮 Type of game
    MatchType: number; // 🏅 Type of match (e.g., 2)
    PaymentType: number; // 💰 Payment status
    ResultStatus: number; // 📊 Overall match result status
    MatchStatus: number; // 🚦 Current status of the match
    VenueName: string; // 📍 Name of the venue
    Details: string; // 📝 Additional details
    MatchStartDate: string; // 📅 Start date and time string (YYYY-MM-DD HH:mm)
    Capacity: number; // 🧑‍ Capacity of the match
    MatchTitle: string; // 📛 Title of the match
    Hosts: MatchHost[]; // 🧑‍🏫 Array of hosts
    Teams: MatchTeam[]; // 🏈 Array of participating teams
}
// ___________________________________-----------______________

// // 🏟️ Interface for the main match details object
// export interface MatchDetailsData {
//     Round: string;
//     MatchId: string;
//     activityId: string;
//     Capacity: number;
//     Details: string;
//     GameType: number;
//     MatchDuration: number | null; // ⏳ Match duration (can be null)
//     MatchEndDate: string; // 📅 Match end date string
//     MatchStartDate: string; // 📅 Match start date and time string (YYYY-MM-DD HH:mm)
//     Date: string; // 📅 Formatted date string
//     Time: string; // ⏰ Formatted time string
//     MatchStatus: number; // 🚦 Current status of the match
//     MatchTitle: string; // 📛 Title of the match
//     MatchType: number; // 🏅 Type of match
//     MemberFees: string; // 💰 Member fees string
//     NonMemberFees: string; // 💰 Non-member fees string
//     VenueName: string; // 📍 Name of the venue
//     ActivityCode: string; // ⚽ Activity code
//     ActivityImageURL: string; // 🖼️ URL for the activity image
//     ActivityName: string; // ⚽ Activity name
//     FirebaseActivityKey: string; // 🔥 Firebase key for the activity
//     TeamId: string; // 🏈 Team ID (seems to be the home team ID based on context)
//     Description: string; // 📝 Team description (seems to be for the home team)
//     HomeTeam: string; // 🏠 Home team name string
//     TeamPoint: number; // 📊 Team points (seems to be for the home team)
//     AwayTeam: string; // ✈️ Away team name string
//     PostCode: string; // 🗺️ Venue postcode
//     homeUserId: string; // 👤 Home user ID (if applicable)
//     awayUserId: string; // 👤 Away user ID (if applicable)
//     homeUserName: string; // 👤 Home user name (if applicable)
//     awayUserName: string; // 👤 Away user name (if applicable)
// }

// // 📊 Interface for the team summary object (e.g., HomeTeamName, AwayTeamName)
// export interface TeamSummaryData {
//     Name: string; // 📛 Team name
//     MemberLength: number; // 🧑‍🤝‍🧑 Number of members
// }

// // 🧑‍🤝‍🧑 Interface for a single team member/participant in the HomeTeam/AwayTeam arrays
// export interface TeamMemberData {
//     participationid: string; // 🆔 Participation ID
//     is_family_member: boolean; // 👨‍👩‍👧‍👦 Is a family member
//     availability: any[]; // 🗓️ Availability (type unknown, using any[])
//     userid: string; // 👤 User ID
//     FirstName: string; // 👤 User first name
//     LastName: string; // 👤 User last name
//     teamid: string; // 🏈 Team ID the member belongs to
//     teamName: string; // 🏈 Team name the member belongs to
//     teamDescription: string; // 📝 Team description the member belongs to
//     participationStatus: number | null; // 📊 Participation status (can be null)
//     participationStatus_text: string; // 📝 Participation status text
//     inviteStatus: number; // ✉️ Invite status
//     inviteStatus_text: string; // 📝 Invite status text
//     is_pay_family_member?: boolean; // 💰 Is a paying family member (optional)
//     paymentStatus: number; // 💳 Payment status
//     paymentStatus_text: string; // 📝 Payment status text
//     paymentTracking?: any[]; // 📈 Payment tracking (optional, type unknown)
//     totalPoints: number; // 💯 Total points
//     roleid: string; // 🎭 Role ID
//     role_name: string; // 🎭 Role name
//     role_description: string; // 📝 Role description
//     role_type: string; // 🎭 Role type
// }

// // 📦 Interface for the structure within the "data" key of the response
// export interface MatchDetailsResponseData {
//     match: MatchDetailsData; // 🏟️ Main match details
//     HomeTeamName: TeamSummaryData; // 🏠 Summary of the home team
//     AwayTeamName: TeamSummaryData; // ✈️ Summary of the away team
//     HomeTeam: TeamMemberData[]; // 🏠 Array of home team members
//     AwayTeam: TeamMemberData[]; // ✈️ Array of away team members
// }

// // 📄 Export class to hold the entire match details response data structure
// export class GetTeamsByMatchModel {
//     match: MatchDetailsData; // 🏟️ Main match details
//     HomeTeamName: TeamSummaryData; // 🏠 Summary of the home team
//     AwayTeamName: TeamSummaryData; // ✈️ Summary of the away team
//     HomeTeam: TeamMemberData[]; // 🏠 Array of home team members
//     AwayTeam: TeamMemberData[]; // ✈️ Array of away team members

// }


// 👤 Interface for the User details within a participant entry
export interface ParticipantUserData {
    Id: string;
    CreatedAt: string; // 📅 Timestamp string
    CreatedBy: string;
    UpdatedAt: string; // 📅 Timestamp string
    DeletedAt: string | null; // 🗑️ Timestamp string or null
    UpdatedBy: string;
    IsActive: boolean;
    IsEnable: boolean;
    FirstName: string;
    LastName: string;
    Gender: string;
    DOB: string; // 🎂 Date of birth string
    member_type: number; // 🧑‍ Type of member
    FirebaseKey: string; // 🔥 Firebase key
    media_consent: boolean; // 📸 Media consent status
    profile_status: string; // 👁️ Profile visibility status
}

// 🏈 Interface for the Team details within a participant entry
export interface ParticipantTeamData {
    id: string;
    created_at: string; // 📅 Timestamp string
    created_by: string;
    updated_at: string; // 📅 Timestamp string
    deleted_at: string | null; // 🗑️ Timestamp string or null
    updated_by: string;
    is_active: boolean;
    short_name: string | null; // 📛 Short name (can be null)
    venueKey: string; // 🏟️ Venue Firebase key
    club_id: string; // 🏢 Club ID
    logo_url: string; // 🖼️ URL for the team logo
    venueType: number; // 🏟️ Type of venue
    ageGroup: string; // 👶 Age group string
    teamName: string; // 📛 Team name
    teamStatus: number; // 📊 Team status
    teamVisibility: number; // 👁️ Team visibility
    teamDescription: string; // 📝 Team description
}

// 🏟️ Interface for the Match details within a participant entry
export interface ParticipantMatchData {
    Id: string;
    CreatedAt: string; // 📅 Timestamp string
    CreatedBy: string;
    UpdatedAt: string; // 📅 Timestamp string
    DeletedAt: string | null; // 🗑️ Timestamp string or null
    UpdatedBy: string;
    IsActive: boolean;
    IsEnable: boolean;
    Round: number; // 🏅 Match round
    MatchCreator: number; // 🧑‍ Creator type
    MatchVisibility: number; // 👁️ Match visibility
    GameType: number; // 🎮 Type of game
    MatchType: number; // 🏅 Type of match
    PaymentType: number; // 💰 Payment status
    ResultStatus: number; // 📊 Match result status
    MatchStatus: number; // 🚦 Current status of the match
    RefreeFirebaseKey: string | null; // 🔥 Refree Firebase key (can be null)
    RefreeName: string | null; // 🧑‍ Refree name (can be null)
    VenueName: string; // 📍 Name of the venue
    VenueFirebaseKey: string; // 🔥 Venue Firebase key
    Details: string; // 📝 Additional details
    MemberFees: number; // 💰 Member fees
    NonMemberFees: number; // 💰 Non-member fees
    MatchStartDate: string; // 📅 Match start date and time string
    MatchEndDate: string; // 📅 Match end date and time string
    MatchDuration: number | null; // ⏳ Match duration (can be null)
    Capacity: number; // 🧑‍ Capacity of the match
    MatchTitle: string; // 📛 Title of the match
    player_visibility: number; // 👁️ Player visibility
}

// 🎭 Interface for the Team Role details within a participant entry
export interface ParticipantTeamRoleData {
    id: string;
    role_type: number; // 🎭 Type of role
    role_name: string; // 🎭 Name of the role
    role_description: string | null; // 📝 Description of the role (can be null)
}

// 🧑‍🤝‍🧑 Interface for a single entry in the 'data' array
export class GetIndividualMatchParticipantModel {
    id: string;
    created_at: string; // 📅 Timestamp string
    created_by: string;
    updated_at: string; // 📅 Timestamp string
    deleted_at: string | null; // 🗑️ Timestamp string or null
    updated_by: string;
    is_active: boolean;
    participation_status: number | null; // 📊 Participation status (can be null)
    invite_status: number; // ✉️ Invite status
    total_points: number; // 💯 Total points
    payment_status: number; // 💳 Payment status
    payment_tracking: any | null; // 📈 Payment tracking (type unknown, can be null)
    invite_type: number; // ✉️ Type of invite
    initiator: string; // 👤 Initiator identifier
    amount_pay_status: number; // 💰 Amount pay status
    paid_amount: string; // 💵 Paid amount string
    paidby: string | null; // 👤 Paid by identifier (can be null)
    cash_pay_to: string; // 💵 Cash paid to identifier
    payment_type: number; // 💳 Type of payment
    paid_on: string | null; // 📅 Date paid on (can be null)
    participant_status: number; // 📊 Participant status
    amount_due: string; // 💸 Amount due string
    total_amount: string; // 💰 Total amount string
    user: ParticipantUserData; // 👤 Nested user details
    Team: ParticipantTeamData; // 🏈 Nested team details
    Match: ParticipantMatchData; // 🏟️ Nested match details
    teamrole: ParticipantTeamRoleData; // 🎭 Nested team role details
}

// ___________-----------------------

// 🏟️ Interface for a single match object within the "AllMatches" array
export interface AllMatchData {
    Round: string;
    MatchId: string;
    activityId: string;
    Capacity: number;
    Details: string;
    GameType: number;
    MatchDuration: number | null; // ⏳ Match duration (can be null)
    MatchEndDate: string; // 📅 Match end date string
    MatchStartDate: string; // 📅 Match start date and time string (YYYY-MM-DD HH:mm)
    Date: string; // 📅 Formatted date string
    Time: string; // ⏰ Formatted time string
    MatchStatus: number; // 🚦 Current status of the match
    MatchTitle: string; // 📛 Title of the match
    MatchType: number; // 🏅 Type of match
    MemberFees: string; // 💰 Member fees string
    NonMemberFees: string; // 💰 Non-member fees string
    VenueName: string; // 📍 Name of the venue
    ActivityCode: string; // ⚽ Activity code
    ActivityImageURL: string; // 🖼️ URL for the activity image
    ActivityName: string; // ⚽ Activity name
    FirebaseActivityKey: string; // 🔥 Firebase key for the activity
    TeamId: string; // 🏈 Team ID (could be home or away depending on context)
    Description: string; // 📝 Team description
    TeamPoint: number; // 📊 Team points
    PostCode: string; // 🗺️ Venue postcode
    homeUserId: string; // 👤 Home user ID (if applicable)
    awayUserId: string; // 👤 Away user ID (if applicable)
    homeUserName: string; // 👤 Home user name (if applicable)
    awayUserName: string; // 👤 Away user name (if applicable)
    LeagueFixtureId: string; // 🏟️ League fixture ID
}

// 📄 Export class to hold the entire All Matches response data structure
export class MatchModelV3 {
    AllMatches: AllMatchData[]; // 🏟️ Array of match objects
    MatchCount: number; // 🔢 Total count of matches
}



