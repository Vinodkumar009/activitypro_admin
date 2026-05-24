import { PlayGroundCommentModel } from "./comments.model";
import { PlayGroundLikeModel } from "./likes.model";
import { PlayGroundFeedImage } from "./post.model";

export class PostGresUserModel {
  Id: string;
  Message: string;
  CreatedAt: string;
  UpdatedAt: string;
  FirstName: string;
  LastName: string;
  Gender: string;
  DOB: string;
  FirebaseKey: string;
}
export class PlayGroundFeedModel {
  id: string;
  message: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  is_active: boolean;
  feedText: string;
  urlLink: string;
  imageUrl: string;
  commentsCount: number;
  likesCount: number;
  postBy: string;
  postedbyid: string;
  userFirebaseKey: string;
  ParentClub: ParentClubModel;
  TopComments: PlayGroundCommentModel[];
  TopLikes: PlayGroundLikeModel[];
  hasLiked: boolean;
  images:PlayGroundFeedImage[];
}
export class ParentClubModel {}
