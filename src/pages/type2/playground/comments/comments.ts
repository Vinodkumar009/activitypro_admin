import { Component } from "@angular/core";
import { Apollo } from "apollo-angular";
import { Storage } from "@ionic/storage";
import { ActionSheetController,IonicPage,NavController,NavParams,} from "ionic-angular";
import { LoadingController } from "ionic-angular/components/loading/loading-controller";
import {
  CommonService,
  ToastMessageType,
  ToastPlacement,
} from "../../../../services/common.service";
import { FirebaseService } from "../../../../services/firebase.service";
import { SharedServices } from "../../../services/sharedservice";
import { PlayGroundCommentModel } from "../models/comments.model";
import moment from "moment";
import gql from "graphql-tag";
import { variable } from "@angular/compiler/src/output/output_ast";
import { PlayGroundFeedModel } from "../models/feed.model";

/**
 * Generated class for the CommentsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-comments",
  templateUrl: "comments.html",
})
export class CommentsPage {
  noOfLikes: number = 0;
  showFullImage: boolean = false;
  full_view_img: string;
  commentInput: PlayGroundCommentsInput = {
    ParentClubKey: "",
    MemberKey: "",
    AppType: 0,
    ActionType: 0,
    FeedId: "",
    Comment: "",
    CommentId: "",
  };
  // modifycommentInput: PlayGroundCommentsInput = {
  //   ParentClubKey: "",
  //   MemberKey: "",
  //   AppType: 0,
  //   ActionType: 0,
  //   FeedId: "",
  //   Comment: "",
  //   CommentId: "",
  // };

  likeInput: GetPlayGroundLikeInput = {
    ParentClubKey: "",
    FeedId: "",
    MemberKey: "",
    AppType: 0,
    hasLiked: 1,
  };

  feeds: PlayGroundFeedModel[] = [];
  comments: PlayGroundCommentModel[] = [];
  // modifyCommments: ModifyPlayGroundCommentModel[] = [];
  hasliked: boolean;
  feedText: string = "";
  likesCount: number = 0;
  commentsCount: number = 0;
  imageUrls = [];
  timeInterval = "";
  currentMessage: string;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private apollo: Apollo,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public fb: FirebaseService,
    public sharedservice: SharedServices,
    public actionSheetCtrl: ActionSheetController
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad CommentsPage");
  }
  ionViewWillEnter() {
    this.commentInput.ParentClubKey = this.navParams.get(
      "selectedParentCubKey"
    );
    this.commentInput.MemberKey = this.navParams.get("selectedMemberKey");
    this.commentInput.FeedId = this.navParams.get("slectedFeedId");
    this.likeInput.MemberKey = this.navParams.get("selectedMemberKey");
    this.likeInput.FeedId = this.navParams.get("slectedFeedId");
    this.likeInput.hasLiked = this.navParams.get("selectedhasliked");

    this.feedText = this.navParams.get("selectedFeedText");
    this.noOfLikes = this.navParams.get("selectedLikesCount");
    this.commentsCount = this.navParams.get("selectedCommentsCount");
    this.imageUrls = this.navParams.get("selectedImage");
    console.table(this.imageUrls);
    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.commentInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
        this.likeInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
      }
      this.getComments();
    });
  }

  formatMatchStartDate(date) {
    return moment(+date).format("DD-MMM-YYYY, hh:mm A");
  }

  showFullViewImage(img_index: number) {
    this.full_view_img = this.imageUrls[img_index].image_url;
    this.showFullImage = true;
  }

  getTime(value) {
    this.timeInterval = "";
    let time = 0;
    let totalTimeInMiliSec = new Date().getTime() - new Date(+value).getTime();
    if (totalTimeInMiliSec >= 0 && totalTimeInMiliSec < 60000) {
      time = totalTimeInMiliSec / 1000;
      if (Math.floor(time) <= 1) {
        this.timeInterval = Math.floor(time) + " sec";
        console.log(this.timeInterval);
      } else {
        this.timeInterval = Math.floor(time) + " secs";
        console.log(this.timeInterval);
      }
    } else if (totalTimeInMiliSec >= 60000 && totalTimeInMiliSec < 3600000) {
      time = totalTimeInMiliSec / 60000;
      if (Math.floor(time) <= 1) {
        this.timeInterval = Math.floor(time) + " min";
        console.log(this.timeInterval);
      } else {
        this.timeInterval = Math.floor(time) + " mins";
        console.log(this.timeInterval);
      }
    } else if (totalTimeInMiliSec >= 3600000 && totalTimeInMiliSec < 86400000) {
      time = totalTimeInMiliSec / 3600000;

      if (Math.floor(time) <= 1) {
        this.timeInterval = Math.floor(time) + " hr";
        console.log(this.timeInterval);
      } else {
        this.timeInterval = Math.floor(time) + " hrs";
        console.log(this.timeInterval);
      }
    } else if (totalTimeInMiliSec >= 86400000 && totalTimeInMiliSec < 2678400000) {
      time = totalTimeInMiliSec / 86400000;
      if (Math.floor(time) <= 1) {
        this.timeInterval = Math.floor(time) + " day";
        console.log(this.timeInterval);
      } else {
        this.timeInterval = Math.floor(time) + " days";
        console.log(this.timeInterval);
      }
    } else if (totalTimeInMiliSec >= 2678400000 && totalTimeInMiliSec < 31536000000) {
      time = totalTimeInMiliSec / 2678400000;
      if (Math.floor(time) <= 1) {
        this.timeInterval = Math.floor(time) + " month";
        console.log(this.timeInterval);
      } else {
        this.timeInterval = Math.floor(time) + " months";
        console.log(this.timeInterval);
      }
    } else if (totalTimeInMiliSec >= 31536000000) {
      time = totalTimeInMiliSec / 31536000000;
      if (Math.floor(time) <= 1) {
        this.timeInterval = Math.floor(time) + " yr";
        console.log(this.timeInterval);
      } else {
        this.timeInterval = Math.floor(time) + " yrs";
        console.log(this.timeInterval);
      }
    }
    console.log(this.timeInterval);
    //return this.timeInterval;
  }

  getComments = () => {
    this.commonService.showLoader("Fetching comments...");
    const commentsQuery = gql`
      query getPlaygroundFeedComments(
        $playgroundCommentInput: PlayGroundCommentsInput!
      ) {
        getPlaygroundFeedComments(
          playgroundCommentInput: $playgroundCommentInput
        ) {
          id
          created_at
          comment
          is_active
          user {
            FirstName
            LastName
            Gender
            FirebaseKey
          }
        }
      }
    `;
    this.apollo
      .query({
        query: commentsQuery,
        fetchPolicy: "no-cache",
        variables: {
          playgroundCommentInput: this.commentInput,
        },
      })
      .subscribe(
        ({ data }) => {
          console.log(
            "comments data" + JSON.stringify(data["getPlaygroundFeedComments"])
          );
          this.commonService.hideLoader();
          this.comments = data["getPlaygroundFeedComments"];
        },
        (err) => {
          this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage(
            "Failed to fetch comments",
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
        }
      );
  };
  toggleLike = () => {
    //this.noOfLikes = this.likeInput.hasLiked && Number(this.noOfLikes >= 0) ? Number(this.noOfLikes--) : Number(this.noOfLikes++);
    if(this.likeInput.hasLiked && Number(this.noOfLikes >= 0)){
      Number(this.noOfLikes--);
      console.log(`decrease:${this.noOfLikes}`);
    }else{
      Number(this.noOfLikes++);
      console.log(`increase:${this.noOfLikes}`);
    }
    this.likeInput.hasLiked = this.likeInput.hasLiked ? 0 : 1;
    const toggleLikeQuery = gql`
      query toggleFeedLike($playgroundLikeInput: GetPlayGroundLikeInput!) {
        toggleFeedLike(playgroundLikeInput: $playgroundLikeInput)
      }
    `;
    this.apollo
      .query({
        query: toggleLikeQuery,
        fetchPolicy: "no-cache",
        variables: {
          playgroundLikeInput: this.likeInput,
        },
      })
      .subscribe(
        ({ data }) => {
          console.log(
            "toggle likes data" + JSON.stringify(data["toggleFeedLike"])
          );
          // this.comments = data["getPlaygroundFeedComments"];
        },
        (err) => {
          // this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage(
            "Like failed",
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom);
        }
      );
  };

  //deleting feed
  deleteFeed(){
    const feed_modify_obj = {
      ParentClubKey:this.commentInput.ParentClubKey,
      MemberKey: "",
      fromDate: "",
      AppType: 0,
      ActionType: 0,
      playgroundFeedId: this.navParams.get("slectedFeedId")
    }
    this.apollo
    .mutate({
      mutation: gql`
        mutation modifyPlaygroundFeed($feeModifyInput: modifyPlaygroundFeedInput!) {
          modifyPlaygroundFeed(playgroundInput: $feeModifyInput) 
        }
      `,
      variables: { feeModifyInput: feed_modify_obj },
    })
    .subscribe(
      ({ data }) => {
        this.commonService.toastMessage("Feed deleted successfully",2500,ToastMessageType.Success,ToastPlacement.Bottom);
        console.log("feed modify data" + data["modifyPlaygroundFeed"]);
        this.navCtrl.pop()
      },
      (err) => {
        // this.commonService.hideLoader();
        console.log(JSON.stringify(err));
        this.commonService.toastMessage("Feed deletion failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
      });
  }

  selectActionType(index: number, selectedComment?: PlayGroundCommentModel) {
    this.commentInput.ActionType = index;
    switch (Number(index)) {
      case 0: {
        this.modifyComments();
        break;
      }
      case 1: {
        // this.commentInput.FeedId=selectedComment.slectedFeedId
        this.commentInput.CommentId = selectedComment.id;
        this.modifyComments();
      }
    }
  }

  sendMessage() {
    // if (this.comments[0].comment != "" && this.comments[0].comment != undefined) {
    //   this.selectActionType(0);
    // }
    if (this.currentMessage && this.currentMessage != "") {
      this.commentInput.Comment = this.currentMessage;
      Number(this.commentsCount++);
      this.selectActionType(0);
    } else {
      this.commonService.toastMessage("Please type comment",2500,ToastMessageType.Info,ToastPlacement.Bottom);
    }
  }
  //action when click on individual comment
  presentActionSheet(selectedComment: PlayGroundCommentModel) {
    let actionSheet = this.actionSheetCtrl.create({
      title: ``,
      buttons: [
        {
          text: "Delete",
          role: "destructive",
          icon: "trash",
          handler: () => {
            this.commonService.commonAlter(
              "Comment",
              "Are you sure want to delete?",
              () => {
                this.selectActionType(1, selectedComment);
              }
            );
          },
        },
        {
          text: "No",
          role: "cancel",
          icon: "close",
          handler: () => {
            console.log("Cancel clicked");
          },
        },
      ],
    });
    actionSheet.present();
  }
  modifyComments() {
    // this.commentInput.ParentClubKey =
    //   selectedComment.this.commentInput.CommentId = selectedComment.id;
    // this.commentInput.FeedId = selectedComment.slectedFeedId;
    
    let input = this.commentInput;
    console.log(input);
    this.apollo
      .mutate({
        mutation: gql`
          mutation modifyPlaygroundFeedComment(
            $playgroundCommentInput: PlayGroundCommentsInput!
          ) {
            modifyPlaygroundFeedComment(
              playgroundCommentInput: $playgroundCommentInput
            ) {
              id
              created_at
              is_active
              comment
              user {
                FirstName
                LastName
                FirebaseKey
              }
            }
          }
        `,
        variables: { playgroundCommentInput: input },
      })
      .subscribe(
        ({ data }) => {
          // this.commonService.hideLoader();
          this.currentMessage = "";//empty the current msg
          this.getComments(); //to refresh comments after delete or new comment
          this.commonService.toastMessage("Modified comment successfully",2500,ToastMessageType.Success,ToastPlacement.Bottom);
          // this.comments = data["modifyPlaygroundFeedComment"];
          console.log("modifyComments data" + data["modifyPlaygroundFeedComment"]);

          // this.navCtrl.pop().then(() => this.navCtrl.pop());
        },
        (err) => {
          // this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage(
            "Comment modification failed",
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
        }
      );
  }

  likebuttonclick() {
    if (this.hasliked == false) {
      this.noOfLikes++;
    } else return this.noOfLikes--;
  }

  getLikes = () => {
    const likesQuery = gql`
      query getPlaygroundFeedLikes(
        $playgroundLikeInput: GetPlayGroundLikeInput!
      ) {
        getPlaygroundFeedLikes(playgroundLikeInput: $playgroundLikeInput) {
          id
          created_at
          is_active
          user {
            FirstName
            LastName
            FirebaseKey
          }
        }
      }
    `;
    this.apollo
      .query({
        query: likesQuery,
        fetchPolicy: "no-cache",
        variables: {
          playgroundLikeInput: this.likeInput,
        },
      })
      .subscribe(
        ({ data }) => {
          console.log(
            "like data" + JSON.stringify(data["getPlaygroundFeedLikes"])
          );
          this.feeds = data["getPlaygroundFeedLikes"];
        },
        (err) => {
          this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage("Failed to fetch likes",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }
      );
  };
}

export class PlayGroundCommentsInput {
  ParentClubKey: string;
  MemberKey: string;
  AppType: number;
  ActionType: number;
  FeedId: string;
  Comment: string;
  CommentId: string;
}
export class GetPlayGroundLikeInput {
  ParentClubKey: String;
  FeedId: String;
  MemberKey: String;
  AppType: number;
  hasLiked: number;
}
