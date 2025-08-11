export interface VideoCreationInput {
    
    AppType: number
    ActionType: number
    DeviceType: number
    video: VideoInput
}

 export interface VideoInput {
    parentclub_id: string
    activity_id:string
    is_headline: boolean
    video_description: string
    video_tag: string
    video_title: string
    video_url: string
    thumbnail: string
    is_show_applus: boolean
    is_show_member: boolean
    unsanitized_video_url: string
    is_enable:boolean
    
}