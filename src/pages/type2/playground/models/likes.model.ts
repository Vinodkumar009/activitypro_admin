import { PostGresUserModel } from "./feed.model";

export class PlayGroundLikeModel {
  id: string;
  // message: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  is_active: boolean;
  user: PostGresUserModel;
}
