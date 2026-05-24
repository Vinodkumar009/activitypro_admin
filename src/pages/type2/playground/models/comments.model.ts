import { PostGresUserModel } from "./feed.model";

export class PlayGroundCommentModel {
  id: string;
  message: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  is_active: boolean;
  comment: string;
  user?: PostGresUserModel;
}
// export class ModifyPlayGroundCommentModel {
//   id: string;
//   message: string;
//   created_at: string;
//   created_by: string;
//   updated_at: string;
//   is_active: boolean;
//   comment: string;
//   user: PostGresUserModel;
// }
