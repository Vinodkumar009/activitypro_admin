


export interface NewsAndPhotoInput {

    AppType: number
    ActionType: number
    DeviceType: number
    news_photos_postgre_fields: news_photos_fields
    category_name: string
    is_headLine: boolean
    is_enable: boolean
    image_caption: string
    image_description: string
    image_tag: string
    image_title: string
    image_url: string
    is_show_applus: boolean
    is_show_member: boolean
    associatedActivity: string
    photos: NewsImageInput[]
}

export class NewsImageInput {
    image_caption: string
    image_description: string
    image_tag: string
    image_title: string
    image_url: string
    sequence_no: number

}

export interface news_photos_fields {
    parentclub_id: string
    activity_id: string
}

export interface NewsType {
    headline: NewsAndPhotoResult;
    newsphotosList: NewsAndPhotoResult[];
}
export interface NewsAndPhotoResult {

    id: string
    created_at: string
    created_by: string
    updated_at: string
    image_caption: string
    image_description: string
    image_url: string
    is_headline: boolean
    is_enable: boolean
    associated_activity: string
    category_name: string
    image_tag: string

    image_title: string

    is_show_applus: boolean
    is_show_member: boolean
    ParentClub: {
        Id: string
        FireBaseId: string
        ParentClubName: string
    }
    Activity: {
        ActivityName: string
        FirebaseActivityKey: string
        Id: string
    }
    images: NewsImageReturnType[]
}

export interface NewsImageReturnType {
    id: string
    created_at: string
    created_by: string
    updated_at: string
    is_active: boolean
    is_enable: boolean
    image_caption: string
    image_description: string
    image_tag: string
    image_title: string
    image_url: string
    sequence_no: number
}

export interface GetNewsAndPhoto {
    ParentClubKey: string
    ClubKey: string
    MemberKey: string
    AppType: number
    ActionType: number
    DeviceType: number
    postGresInput: PostgreInput
}

export interface PostgreInput {
    PostgresParentclubId: string
}


export interface UpdateNewsAndPhotoInput {
    id: string
    news_photos_postgre_fields: news_photos_fields
    category_name: string

    image_caption: string
    image_description: string
    image_tag: string
    image_title: string
    image_url: string
    is_show_applus: boolean
    is_show_member: boolean

    is_headLine: boolean
    is_enable: boolean

    associatedActivity: string
    photos: UpdateNewsImageInput[]
}

export class UpdateNewsImageInput {
    id: string
    image_caption: string
    image_description: string
    image_tag?: string
    image_title?: string
    image_url: string
    sequence_no?: number
}