export class TemplateModel {
  Id: string;
  TemplateName: string;
  AgeGroupStart: number;
  AgeGroupEnd: number;
  Challenge: ChallengeModel[];
}

export class ChallengeModel {
  Id: string;
  ChallengeName: string;
  Description: string;
  ChallengsImageURL: string;
  ChallengeCategory:number;
  // AgeFrom: number;
  // AgeTo: number;:
  Activity: ActivityModel;
  ParentClub: ParentClubModel;
  FireBaseId: string;
  Levels: Levelmodel[];
}
export class ParentClubModel {
  Id: string;
}

export class ActivityModel {
  Id: string;
  ActivityCode: string;
  FirebaseActivityKey:string;
}

export class Levelmodel {
  LevelName: string;
  //Description: string;
  LevelChallenge: number;
  //ImageUrl: string;
  Points: number;
  ApprovedBy: string;
  //ApprovedBy:Approval;
}
export class Approval {
  ApprovedBy: string;
}

export class CreateChallengeModel {
  ChallengeName: string;
  ChallengsImageURL: string;
  FirebaseActivityId: string;
  ParentClubId: string;
  ChallengeCategory?:number;
  ChallengeType?:number;
}

export class CreateLevelmodel {
  LevelName: string;
  LevelApproval: string;
  LevelChallenge: string;
  ParentclubKey: string;
  ImageUrl: string;
  Points: Number;
  LevelSequence: number;
  ApprovalID: string;
  PointsID: string;
  Target:number;
}
export class UpdateLevelModel {
  Id: string;
  LevelName: string;
  LevelApproval: string;
  LevelChallenge: string;
  ParentclubKey: string;
  ImageUrl: string;
  Points: Number;
  LevelSequence: number;
  ApprovalID: string;
  PointsID: string;
}
export class AssignChallenge_LevelModel {
  ChallengeID: string;
  LevelID: string;
}

export class CreateTemplateModel {
  TemplateName: string;
  ActivityKey: string;
  FirebaseParentClubKey: string;
  AgeGroupStart: number;
  AgeGroupEnd: number;
  TemplateType: number;
}

export class ApprovalModel {
  Id: string;
  ApprovedBy: string;
  ApprovalType: number;
}
