export interface VideosInput_V2 {
    user_postgre_metadata: UserPostgreMetadataField;
    user_device_metadata: UserDeviceMetadataField;
}



export interface UserPostgreMetadataField {
    UserParentClubId: string
}

export interface UserDeviceMetadataField {
    UserAppType: number
    UserActionType: number
    UserDeviceType: number
}

export interface VideoType{
    headline:Videos;
    videoList: Videos[]
}

export interface Videos {
    id: string
    message: string
    created_at: string
    created_by: string
    updated_at: string
    is_active: boolean
    is_enable: boolean
    associated_activity: string
    parentclub_key: string
    is_headline: boolean
    parentclub_name: string
    video_description: string
    video_tag: string
    video_title: string
    video_url: string
    thumbnail: string
    is_show_applus: boolean
    is_show_member: boolean
    unsanitized_video_url: string
    parentClub: {
        Id: string
        ParentClubName: string
        FireBaseId: string
    }
    activity: {
        Id: string
        FirebaseActivityKey: string
        ActivityName: string
    }
}