import { Component } from "@angular/core";
import { IonicPage,LoadingController,NavController,NavParams,} from "ionic-angular";
import { CommonService,ToastMessageType,ToastPlacement,} from "../../services/common.service";
import { FirebaseService } from "../../services/firebase.service";
import { SharedServices } from "../services/sharedservice";
import { Apollo, QueryRef } from "apollo-angular";
import gql from "graphql-tag";
import { Subscription } from "rxjs";
import { Storage } from "@ionic/storage";
import * as moment from "moment";
import * as firebase from "firebase";

/**
 * Generated class for the AdmingroupchatPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-admingroupchat",
  templateUrl: "admingroupchat.html",
  providers: [CommonService, SharedServices, FirebaseService],
})
export class AdmingroupchatPage {
  gropus: MemberGroup[] = [];
  subscriptionArr: Subscription[] = [];
  latestMessageSubscription: firebase.database.Reference;
  parentclubKey: string;
  latestMessage: ChatModel;

  constructor(
    private storage: Storage,
    public commonService: CommonService,
    private apollo: Apollo,
    public navCtrl: NavController,
    public navParams: NavParams,
    private fb: FirebaseService
  ) {}

  getAllActiveChats(parentclubKey) {
    this.commonService.showLoader("Please wait...");
    const chatQuery = gql`
      query getAdminChatSessionsByParenctClub($ParentClub: String) {
        getAdminChatSessionsByParenctClub(ParentClub: $ParentClub) {
          SessionKey
          VenueKey
          CoachKey
          SessionName
          MemberGroupKey
          GroupKey
          CoachName
          Session_Venue
    			SessionDay
          Session_StartDate
    			Session_StartTime
        }
      }
    `;
    this.apollo
      .query({
        query: chatQuery,
        fetchPolicy: "network-only",
        variables: { ParentClub: parentclubKey },
      })
      .subscribe(
        ({ data }) => {
          this.commonService.hideLoader();
          console.log(data);
          this.gropus = data["getAdminChatSessionsByParenctClub"];
          this.listenToGroups(parentclubKey);
          this.listenToLatestMessage();
        },
        (err) => {
          this.commonService.hideLoader();
          this.commonService.toastMessage("Chat fetch failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }
      );
  }
  listenToGroups(parentclubKey) {
    for (let group = 0; group < this.gropus.length; group++) {
      const sub = this.fb
        .getAllWithQuery(`MemberGroup/${parentclubKey}`, {
          orderByKey: true,
          equalTo: this.gropus[group].MemberGroupKey,
        })
        .subscribe((data) => {
          console.log(data);
          this.gropus[group].ReadCount = data[0]["ReadCount"];
        });
      this.subscriptionArr.push(sub);
    }
  }
  listenToLatestMessage() {
    for (let group = 0; group < this.gropus.length; group++) {
      this.latestMessageSubscription = firebase
        .database()
        .ref("/")
        .child("Group")
        .child(<string>this.gropus[group].GroupKey)
        .child("LastMessage");
      this.latestMessageSubscription.on("value", (snapshot) => {
        const data = snapshot.val();
        if (data != null) {
          if (
            moment().format("YYYY-MM-DD") ==
            moment(data.CreatedAt).format("YYYY-MM-DD")
          ) {
            data.CreatedAt = moment(data.CreatedAt).local().format("HH:mm");
          } else {
            data.CreatedAt = moment(data.CreatedAt).format("DD-MMM");
          }
          this.gropus[group].LatastMessage = data;
        }
      });
    }
  }

  ionViewDidEnter() {
    this.storage.get("userObj").then((val) => {
      console.log("");
      val = JSON.parse(val);
      if (val.$key != "") {
        this.getAllActiveChats(val.UserInfo[0].ParentClubKey);
        this.parentclubKey = val.UserInfo[0].ParentClubKey;
      }
    });
  }
  ionViewDidLeave() {
    this.subscriptionArr.forEach((eachSub) => {
      eachSub.unsubscribe();
    });
    this.latestMessageSubscription.off();
    this.subscriptionArr = [];
    this.latestMessageSubscription = null;
  }
  gotoadminchat(group) {
    this.navCtrl.push("AdmingroupchatconversationPage", {
      selectedGroup: group,
      parentclubKey: this.parentclubKey,
    });
  }

  getFormattedTime(index:number){
    const session_date = moment(this.gropus[index].Session_StartDate,"YYYY-MM-DD").format("YYYY-MM-DD");
    return moment(`${session_date} ${this.gropus[index].Session_StartTime}`).format("hh:mm A");
  }
}

export class ChatModel {
  Title: String;
  Message: String;
  FromKey: String;
  FromName: String;
  IsActive: boolean;
  CreatedAt: String;
  MessageKey: String;
}

export class MemberGroup {
  GroupKey: string;
  MemberGroupKey: string;
  ReadCount: number;
  SessionKey: string;
  VenueKey:string;
  CoachKey:string
  SessionName: string;
  CoachName: string;
  Session_Venue:string;
  SessionDay:string;
  Session_StartDate
  Session_StartTime
  LatastMessage: ChatModel;
  constructor() {
    this.ReadCount = 0;
  }
}
