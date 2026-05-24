export class UsersListInput {
    parentclub_id: string;
    club_id: string;
    search_term?: string;
    limit?: number;
    offset?: number;
    member_type?: number
    action_type?: number
}