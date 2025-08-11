import { CommonInputTypeDefs_V3 } from "./common.model"

export interface IClubDetails{
    Id:string
    ClubName:string
    FirebaseId:string
    MapUrl:string
    sequence:string
}

export class IClubCoaches{
  coach_firebase_id:string
  first_name:string
  last_name:string
  gender:string
  email_id:string 
}

export class SchoolDto {
  id: string;
  school_name: string
  firebasekey: string
  VenueType?: string
  postcode: string
  firstline_address: string
  secondline_address: string
}



//@ObjectType()
export class Activity {
    Id:string;
    ActivityCode: number;
    ActivityName: string;
    ActivityImageURL: string;
    FirebaseActivityKey: string;
    ActivityKey:string;
    PriceSetup?:Activity_PriceSetUp
  }

export class Activity_PriceSetUp extends Activity {
    IsActive?:boolean;
    MemberPricePerHour?: string;
    NonMemberPricePerHour?:string;
}
  
  
  
  ///@InputType()
  export class ActivityInput {
    ActivityID: string;
    ActivityCode: number;
    ActivityName: string;
    FirebaseKey: string;
    ActivityImageURL: string;
  }
  
  //@InputType()
  export class ClubActivityInput extends CommonInputTypeDefs_V3{
    VenueKey: string;
  }
  
  
  //@ObjectType()
  export class ActivityCoach {
    EmailID:string
    FirstName: string;
    LastName: string;
    Gender:string;
    DOB:string;
    CoachId:string;                
  }
  
  
  //@InputType()
  export class id_fields{
    parentclub_id: string;
    club_id: string; 
    activity_id?: string;
    category_id?:string;
  }
  
  //@InputType()
  export class ActivityInfoInput extends CommonInputTypeDefs_V3{
    postgre_fields?:id_fields;
    firebase_fields:id_fields;
  }
  
  
  //@ObjectType()
  export class ActivityCategory {
    ActivityCategoryCode: string;
    ActivityCategoryName:string;
    ActivityCategoryId:string;
  }
  
  //@ObjectType()
  export class ActivitySubCategory {
    ActivitySubCategoryCode: string;
    ActivitySubCategoryName:string;
    ActivitySubCategoryId:string;
  }

export class ParentClub{
  Id?:string;
  ParentClubAppIconURL:string
  ParentClubName:string
  ParentClubAdminEmailID:string
}
  

export interface IClubDetails{
  Id:string
  ClubName:string
  FirebaseId:string
  MapUrl:string
  sequence:string
}



export class Activities{
  Id?:string
  activity_key: string
  activity_id: string
  activity_code:string
  activity_name:string
}