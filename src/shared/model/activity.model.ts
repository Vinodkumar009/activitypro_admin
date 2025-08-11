export interface IActivityDetails{
    Id:string
    ActivityName:string
    ActivityCode:string
    FirebaseActivityKey:string
    ActivityKey?:string
}



export class ClubActivity{
    id:string;
    activity_key:string
    activity_code:string;
    activity_image_url:string
    activity_name:string
    alias_name:string;
    club:{
        Id:string,
        FirebaseId:string,
        ClubName:string,
    };
    parentclub:{
        Id:string,
        FireBaseId:string,
        ParentClubName:string,
    };
    activity:{
        Id:string;
    };
    is_selected?:boolean
}