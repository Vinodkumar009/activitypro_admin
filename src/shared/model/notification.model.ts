export interface INotification {
    id: string;
    created_at: string;
    sender: string | null;
    receiver: string;
    onclick: string | null;
    metadata: any | null;
    message_header: string;
    message_body: string;
    source: number;
    is_read: boolean;
}

export interface IGetNotificationsInput {
    parentclub_id: string;
    club_id: string;
    activity_id: string;
    member_id: string;
    action_type: number;
    device_type: number;
    app_type: number;
    device_id: string;
    updated_by: string;
    user_id: string;
    cursor?: string;
}

export interface IGetNotificationsResponse {
    status: number;
    message: string;
    data: {
        notifications: INotification[];
        next_cursor: string | null;
    };
    type: string;
    isArray: boolean;
}

export interface IDeleteNotificationInput {
    parentclub_id: string;
    club_id: string;
    activity_id: string;
    member_id: string;
    action_type: number;
    device_type: number;
    app_type: number;
    device_id: string;
    updated_by: string;
    notification_id: string;
}

export interface IDeleteNotificationResponse {
    status: number;
    message: string;
    type: string;
    isArray: boolean;
}
