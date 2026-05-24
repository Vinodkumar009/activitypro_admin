import { PostGresUserModel } from "./feed.model";

export class PlayGroundFeedModel {
  id: string;
  feedText: string;
  urlLink: string;
  imageUrl: string;
  commentsCount: number;
  likesCount: number;
  apptype: number;
  postedbyid: string;
  images: PlayGroundFeedImage[];
  postBy: PostGresUserModel;
}

export class PlayGroundFeedImage {
  image_url: string;
  image_sequence: number;
}
