export interface Role{
    id:string
    role_type:string
    role_name:string
}

export class UpdateTeamMemberFieldsModel {
    id: string;
    inviteType: number;
    inviteTypeText: string;
    playerStatus: number;
    playerStatusText: string;
    inviteStatus: number;
    inviteStatusText: string;
    inviteUpdatedBy: string;
    isActive: boolean;
    message?: string;
}