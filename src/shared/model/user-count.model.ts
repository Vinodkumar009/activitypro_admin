export class ClubUserCountModel {
  club:string;
  name: string;
  member_count: number;
  member_status_count: number;
  non_member_status_count: number;
  total_count: number;
  child_count: number;
}

export class UserCountModel {
  member_count: number;
  child_count: number;
  member_status_count: number;
  non_member_status_count: number;
  total_count: number;
  club: ClubUserCountModel[];
}

export class UserCountResponseModel {
  message: string;
  data: UserCountModel;
}