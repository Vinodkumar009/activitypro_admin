
export class ClubVenue {
  // Id: String;
  // Message: String;
  // CreatedAt: String;
  // UpdatedAt: String;
  ClubName: string;
  ClubKey: string;
  LocationType: number;
}

export class SchoolVenue {
  // Id: String;
  // Message: String;
  // CreatedAt: String;
  // UpdatedAt: String;
  SchoolName: string;
  ParentClubKey: string;
}

export interface ActivityModel{
  ActivityCode:string
  ActivityName:string 
  ActivityKey:string
}

export interface IClubDetails{
  Id:string
  ClubName:string
  FirebaseId:string
  MapUrl:string
  sequence:string;
  AmountPaid?: string; // Make these properties optional
  Transactions?: number;
  AmountDue?:string
}