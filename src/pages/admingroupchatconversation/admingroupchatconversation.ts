import { Component, ViewChild } from "@angular/core";
import {
  Backdrop,
  Content,
  IonicPage,
  NavController,
  NavParams,
} from "ionic-angular";
import { Subscription } from "rxjs";
import { FirebaseService } from "../../services/firebase.service";
import { ChatModel, MemberGroup } from "../admingroupchat/admingroupchat";
import * as moment from "moment";
import { CommonService } from "../../services/common.service";
import { Apollo, QueryRef } from "apollo-angular";
import { HttpLink } from "apollo-angular-link-http";
import gql from "graphql-tag";
import { ActionSheetController } from "ionic-angular";
/**
 * Generated class for the AdmingroupchatconversationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-admingroupchatconversation",
  templateUrl: "admingroupchatconversation.html",
})
export class AdmingroupchatconversationPage {
  @ViewChild(Content) content: Content;
  selectedGroup: MemberGroup;
  groupSubScription: Subscription;
  memberSubscription: Subscription;
  messages: ChatModel[] = [];
  allGroupsMember: string[] = [];
  allNotifyMembers: string[] = [];
  allMemberGroupDetails: any[] = [];
  currentMessage: string;
  parentclubKey: string;
  constructor(
    public actionSheetCtrl: ActionSheetController,
    private apollo: Apollo,
    public commonService: CommonService,
    public navCtrl: NavController,
    public navParams: NavParams,
    private fb: FirebaseService
  ) {
    this.selectedGroup = this.navParams.get("selectedGroup");
    this.parentclubKey = this.navParams.get("parentclubKey");
    this.listenToGroup();
    this.getAllGroupMembers();
  }
  updateAdminReadCount() {
    this.fb.update(
      this.selectedGroup.MemberGroupKey.toString(),
      `MemberGroup/${this.parentclubKey}`,
      {
        ReadCount: 0,
      }
    );
  }
  getAllGroupMembers() {
    this.memberSubscription = this.fb
      .getAllWithQuery(`Group/${this.selectedGroup.GroupKey}/Members`, {
        orderByChild: "IsActive",
        equalTo: true,
      })
      .subscribe((data) => {
        this.allGroupsMember = [];
        data.forEach((eachMember: any) => {
          this.allGroupsMember.push(eachMember.MemberKey);
        });
        this.getParentFirebaseKeys();
      });
  }

  presentActionSheet(selectedChat: ChatModel) {
    let actionSheet = this.actionSheetCtrl.create({
      title: "Are you sure?",
      buttons: [
        {
          text: "Delete",
          role: "destructive",
          icon: "trash",
          handler: () => {
            this.deleteChat(selectedChat);
          },
        },
        {
          text: "Cancel",
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

  listenToGroup() {
    this.groupSubScription = this.fb
      .getAllWithQuery(`Group/${this.selectedGroup.GroupKey}/Messages`, {
        orderByKey: true,
      })
      .subscribe((data) => {
        this.messages = [];
        data.forEach((each) => {
          this.messages.push({
            CreatedAt: moment(each["CreatedAt"]).local().format("DD-MMM HH:mm"),
            FromKey: each["FromKey"],
            FromName: each["FromName"],
            IsActive: each["IsActive"],
            Message: each["Message"],
            Title: each["Title"],
            MessageKey: each["$key"],
          });
        });

        setTimeout(() => {
          this.content.scrollToBottom();
        }, 400);
      });
  }

  deleteChat(selectedChat: ChatModel) {
    this.apollo
      .mutate({
        mutation: gql`
          mutation ($deleteChat: ChatData!) {
            deleteChat(deleteChat: $deleteChat) {
              Id
            }
          }
        `,
        variables: {
          deleteChat: {
            GroupId: this.selectedGroup.GroupKey,
            MessageKey: selectedChat.MessageKey,
          },
        },
      })
      .subscribe(
        ({ data }) => {},
        (err) => {}
      );
  }

  ionViewDidLeave() {
    this.groupSubScription.unsubscribe();
    this.memberSubscription.unsubscribe();
    this.updateAdminReadCount();
  }

  sendMessage() {
    if (this.currentMessage != "") {
      this.fb.save(
        {
          CreatedAt: moment().utc().format(),
          FromKey: "admin",
          FromName: "admin",
          IsActive: true,
          Message: this.currentMessage,
          Title: "Admin",
        },
        `Group/${this.selectedGroup.GroupKey}/Messages`
      );
      this.onMessageAdded();
      this.currentMessage = "";
    }
  }

  getParentFirebaseKeys(){
    const chatQuery = gql`
      query getUserParentFirebaseIDs($input: FirebaseIdsInput!) {
        getUserParentFirebaseIDs(input: $input) 
      }
    `;
    this.apollo
      .query({
        query: chatQuery,
        fetchPolicy: "network-only",
        variables: { 
          input: {userFirebaseIds:this.allGroupsMember} 
        },
      })
      .subscribe(
        ({ data }) => {
          console.log(data["getUserParentFirebaseIDs"]);
          if(data["getUserParentFirebaseIDs"] && data["getUserParentFirebaseIDs"].length > 0){
            //this.allGroupsMember.push(...data["getUserParentFirebaseIDs"]);
            this.allNotifyMembers = data["getUserParentFirebaseIDs"];
          }
        },
        (err) => {
          console.log('err',err)
        }
      );
  }

  onMessageAdded() {
    this.commonService.publishPushMessage(
      this.allNotifyMembers,
      this.currentMessage,
      this.selectedGroup.SessionName,
      this.parentclubKey
    );
    for (let i = 0; i < this.allGroupsMember.length; i++) {
      const sub = this.fb
        .getAllWithQuery(`MemberGroup/${this.allGroupsMember[i]}`, {
          orderByChild: "GroupKey",
          equalTo: this.selectedGroup.GroupKey,
        })
        .subscribe((data) => {
          sub.unsubscribe();
          this.fb.update(
            data[0].$key,
            `MemberGroup/${this.allGroupsMember[i]}`,
            {
              ReadCount: data[0].ReadCount + 1,
            }
          );
        });
    }
  }

  colorObj = {
    a: "green",
    b: "purple",
    c: "yellow",
    d: "brown",
    e: "pink",
    f: "cyan",
    g: "blue",
    h: "gray",
    i: "red",
    j: "green",
    k: "purple",
    l: "yellow",
    m: "brown",
    n: "pink",
    o: "cyan",
    p: "blue",
    q: "gray",
    r: "red",
    s: "green",
    t: "purple",
    u: "yellow",
    v: "brown",
    w: "pink",
    x: "cyan",
    y: "blue",
    z: "gray",
  };

  getColorCode(name: string) {
    let char = name.toLowerCase().charAt(0);
    return this.colorObj[char];
  }

  gotoadmingroupchatinfo() {
    //SessionDetails,selected_session.ParentClubKey}/${selected_session.ClubKey}/${selected_session.CoachKey
    // this.navCtrl.push("AdmingroupchatinfoPage", {
    //   selectedGroup: this.selectedGroup,
    //   parentclubKey: this.parentclubKey,
    // });
    const session_dets ={
      ParentClubKey:this.parentclubKey,
      ClubKey:this.selectedGroup.VenueKey,
      CoachKey:this.selectedGroup.CoachKey,
      $key:this.selectedGroup.SessionKey
    }
    this.navCtrl.push("GroupsessiondetailsPage",{SessionDetails:session_dets});
  }
}
