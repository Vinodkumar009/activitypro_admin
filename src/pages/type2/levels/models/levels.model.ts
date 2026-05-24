export class getAllLevelsInParentclubModel {
  id: string;
  level_name: string;
  is_active: boolean;
  sequence: number;
  is_selected: boolean;
}

// get all focus area
export class ChallengeFocusAreaModel {
  id: string;
  message: string
  created_at: string
  created_by: string
  updated_at: string
  is_active: boolean
  focus_area_name: string;
  lang_code: number;
  is_selected: boolean;
}

//get all target area
export class ChallengeTargetAreaModel {
  isAllreadySelected: boolean
  id: string;
  message: string
  created_at: string
  created_by: string
  updated_at: string
  is_active: boolean
  target_area_name: string
  lang_code: number
  status: number
}

export class ChallengeModel {
  Id: string;
  Message: string;
  CreatedAt: string;
  UpdatedAt: string;
  ChallengeName: string;
  ChallengsImageURL: string;
  // Activity: Activity!
  // ParentClub: ParentClub!
  // Levels: [Level!]
  Users: [PostgreUser]
  ChallengeType: number
  ChallengeCategory: number
  CVUrl: string;
}

export class ChallengeClassificationModel {
  id: string;
  challenge: ChallengeModel
  focus_area: ChallengeFocusAreaModel
  target_area: [ChallengeTargetAreaModel]
}

export class PostgreUser {
  Id: string;
  FirstName: string;
  LastName: string;
  DOB: string;
}

export class FocusAreaProgressModel {
  id: string;
  message: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  is_active: boolean;
  focus_area_name: string;
  count: string;
}

export class UserFocusAreaProgressModel {
  id: string;
  message: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  is_active: boolean;
  focus_area_name: string;
  count: string;
  total_count: string;
  total_points: string;
  is_completed: Boolean
  percentage: string;
}
export class UserLevelProgressModel {
  is_selected: boolean;
  id: string;
  message: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  is_active: boolean;
  level_name: string;
  sequence: number;
  is_completed: boolean;
  is_current_user_level: boolean;
}

export class UserLevelStats {
  id: string
  message: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  is_active: boolean;
  level_name: string;
  sequence: number;
  count: string;
}

export class CurrentUserLevelStats {
  id: string;
  message: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  is_active: boolean;
  user: PostgreUser;
  level: UserLevelDetail;
  progress: string;
  total_points: string;
  level_status: string;
  completed_on: string;
  approval: string;
}

export class UserLevelDetail {
  id: string;
  message: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  is_active: boolean;
  level_name: string;
  sequence: number;
}

export class AssignedChallengeDetailsModel {
  id: string;
  message: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  is_active: boolean;
  ChallengeId: string;
  ChallengeName: string;
  FocusId: string;
  FocusAreaName: string;
  TargetId: string;
  TargetAreaName: string;
}

export class UserLevelChallengeModel {
  id: string;
  challenge_name: string;
  target_area: [ChallengeDetailsAndTargetAreaModel];
  challenge_id: string;
  points: string;
  level_id: string;
  help_text: string;
}

export class ChallengeDetailsAndTargetAreaModel {
  id: string;
  message: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  is_active: boolean;
  target_area_name: string;
  lang_code: number;
  status: number;
  approval_status: number
  challenge_classification_id: string;
}

export class UserLevelHistoryForApprovalModel {
  id: string;
  message: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  is_active: boolean;
  user_id: string;
  FirstName: string;
  LastName: string;
  DOB: string;
  focus_area_name: string;
  focus_id: string;
  target_area_name: string;
  target_id: string;
  approval: number;
  approval_desciption: string;
  completed_on: string;
  level_name: string;
  challenge_name: string;
}

