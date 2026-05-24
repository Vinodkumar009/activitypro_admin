import { Component } from "@angular/core";
import { Apollo } from "apollo-angular";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { LoadingController } from "ionic-angular/components/loading/loading-controller";
import { CommonService,ToastMessageType,ToastPlacement,} from "../../../services/common.service";
import { FirebaseService } from "../../../services/firebase.service";
import { SharedServices } from "../../services/sharedservice";
import { Storage } from "@ionic/storage";
import gql from "graphql-tag";
import { PlayGroundFeedModel } from "./models/feed.model";
import moment from "moment";
import { PlayGroundLikeModel } from "./models/likes.model";

/**
 * Generated class for the PlaygroundPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-playground",
  templateUrl: "playground.html",
})
export class PlaygroundPage {
  colors = [
    // Color.fromRGBO(1, 96, 100, 1.00),
    // Color.fromRGBO(89, 120, 142, 1.00),
    // Color.fromRGBO(31, 69, 110, 1.00),
    // Color.fromRGBO(10, 17, 114, 1.00),
    // Color.fromRGBO(50, 97, 45, 1.00),
    // Color.fromRGBO(89, 77, 91, 1.00),
  ];
  imgUrls = [];
  presigned_urls = [];
  showFullImage: boolean = false;
  full_view_img: string;
  GetPlayGroundFeedInput: GetPlayGroundFeedInput = {
    ParentClubKey: "",
    MemberKey: "",
    fromDate: "",
    AppType: 0,
  };
  likeInput: GetPlayGroundLikeInput = {
    ParentClubKey: "",
    FeedId: "",
    MemberKey: "",
    AppType: 0,
    hasLiked: 0,
  };
  feeds: PlayGroundFeedModel[] = [];
  filteredFeeds: PlayGroundFeedModel[] = [];
  searchInput = "";
  likes: PlayGroundLikeModel[] = [];
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private apollo: Apollo,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public fb: FirebaseService,
    public sharedservice: SharedServices
  ) {
    // for (let i = 0; i < 7; i++)
    //   this.colors.push({
    //     num: i,
    //     color: "#" + Math.floor(Math.random() * 16777215).toString(16),
    //   });
  }

  ionViewDidLoad() {}
  ionViewWillEnter() {
    console.log("ionViewDidLoad PlaygroundPage");
    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.GetPlayGroundFeedInput.ParentClubKey =
          val.UserInfo[0].ParentClubKey;
        this.GetPlayGroundFeedInput.MemberKey = val.$key;
      }
      this.getFeeds();
    });
  }
  gotoPlaygroundProfile() {
    this.navCtrl.push("PlaygroundprofilePage");
  }

  gotoPlaygroundPost() {
    this.navCtrl.push("PlaygroundpostPage");
    // {
    //   // slectedFeedId: i.id,
    //   selectedParentCubKey: this.GetPlayGroundFeedInput.ParentClubKey,
    //   selectedMemberKey: this.GetPlayGroundFeedInput.MemberKey,
    //   selectedFeedText: i.feedText,
    //   selectedLikesCount: i.likesCount,
    //   selectedhasliked: i.hasLiked,
    //   selectedCommentsCount: i.commentsCount,
    //   selectedImageUrl: i.imageUrl,
    // };
  }

  gotoComments(save) {
    this.navCtrl.push("CommentsPage", {
      slectedFeedId: save.id,
      selectedParentCubKey: this.GetPlayGroundFeedInput.ParentClubKey,
      selectedMemberKey: this.GetPlayGroundFeedInput.MemberKey,
      selectedFeedText: save.feedText,
      selectedLikesCount: save.likesCount,
      selectedhasliked: save.hasLiked,
      selectedCommentsCount: save.commentsCount,
      selectedImage: save.images,
    });
  }
  formatMatchStartDate(date) {
    return moment(+date).format("DD-MMM-YYYY, hh:mm A");
  }
  getFeeds = () => {
    this.commonService.showLoader("Fetching feeds...");
    const feedsQuery = gql`
      query getPlaygroundFeedsForUser(
        $playgroundInput: GetPlayGroundFeedInput!
      ) {
        getPlaygroundFeedsForUser(playgroundInput: $playgroundInput) {
          images {
            image_url
            image_sequence
          }
          id
          created_at
          feedText
          imageUrl
          commentsCount
          likesCount
          hasLiked
          userFirebaseKey
          postedbyid
        }
      }
    `;
    this.apollo
      .query({
        query: feedsQuery,
        fetchPolicy: "no-cache",
        variables: {
          playgroundInput: this.GetPlayGroundFeedInput,
        },
      })
      .subscribe(
        ({ data }) => {
          this.commonService.hideLoader();
          this.feeds = data["getPlaygroundFeedsForUser"];
          console.table(data["getPlaygroundFeedsForUser"]);
          this.filteredFeeds = JSON.parse(JSON.stringify(this.feeds));
        },
        (err) => {
          this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage(
            "Failed to fetch feeds",
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
        }
      );
  };

  toggleLike = () => {
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
            ToastPlacement.Bottom
          );
        }
      );
  };

  getFilterItems(ev: any) {
    // Reset items back to all of the items
    // this.initializeItems();
    // set val to the value of the searchbar
    let val = ev.target.value;
    // if the value is an empty string don't filter the items
    if (val && val.trim() != "") {
      this.filteredFeeds = this.feeds.filter((item) => {
        if (item.feedText != undefined) {
          if (item.feedText.toLowerCase().indexOf(val.toLowerCase()) > -1)
            return true;
        }
        // if (item.Activity.ActivityName != undefined) {
        //   if (
        //     item.Activity.ActivityName.toLowerCase().indexOf(
        //       val.toLowerCase()
        //     ) > -1
        //   )
        //     return true;
        // }
      });
    } else this.initializeItems();
  }

  initializeItems() {
    this.filteredFeeds = this.feeds;
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
          // this.commonService.toastMessage(
          //   "Failed to fetch feeds",
          //   2500,
          //   ToastMessageType.Error,
          //   ToastPlacement.Bottom
          // );
        }
      );
  };
}
export class GetPlayGroundFeedInput {
  ParentClubKey: string;
  MemberKey: string;
  fromDate: string;
  AppType: number;
}

export class GetPlayGroundLikeInput {
  ParentClubKey: string;
  FeedId: string;
  MemberKey: string;
  AppType: number;
  hasLiked: number;
}
