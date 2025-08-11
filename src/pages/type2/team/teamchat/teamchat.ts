import { Component } from '@angular/core';

import {
  IonicPage,
  LoadingController,
  NavController,
  NavParams,
} from "ionic-angular";
import { CommonService } from '../../../../services/common.service';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular-link-http';
import { FirebaseService } from '../../../../services/firebase.service';
import { SharedServices } from '../../../services/sharedservice';
import gql from "graphql-tag";
import { Subscription } from "rxjs";
import { Storage } from "@ionic/storage";
import * as moment from "moment";
import * as firebase from "firebase";
import { LeagueParticipantModel } from '../../league/models/league.model';

/**
 * Generated class for the TeamchatPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-teamchat',
  templateUrl: 'teamchat.html',
})
export class TeamchatPage {

  teams:LeagueParticipantModel[];
  subscriptionArr: Subscription[] = [];
  latestMessageSubscription: firebase.database.Reference;
  parentclubKey: string;
  latestMessage: ChatModel;
  ReadCount:number;
  constructor(
    public navCtrl: NavController,
    
    private apollo: Apollo,
    private httpLink: HttpLink,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public fb: FirebaseService,
    public sharedservice: SharedServices,
     public navParams: NavParams) {
      this.teams=this.navParams.get("teams");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TeamchatPage');
  }

  // getAllActiveChats(parentclubKey) {
  //   this.commonService.showLoader("Please wait...");
  //   const chatQuery = gql`
  //     query getAdminChatSessionsByParenctClub($ParentClub: String) {
  //       getAdminChatSessionsByParenctClub(ParentClub: $ParentClub) {
  //         SessionName
  //         MemberGroupKey
  //         GroupKey
  //         CoachName
  //       }
  //     }
  //   `;
  //   this.apollo
  //     .query({
  //       query: chatQuery,
  //       fetchPolicy: "network-only",
  //       variables: { ParentClub: parentclubKey },
  //     })
  //     .subscribe(
  //       ({ data }) => {
  //         this.commonService.hideLoader();
  //         console.log(data);
  //         this.teams = data["getAdminChatSessionsByParenctClub"];
  //         this.listenToGroups(parentclubKey);
  //         // this.listenToLatestMessage();
  //       },
  //       (err) => {
  //         this.commonService.hideLoader();
  //         this.commonService.toastMessage(
  //           "Chat fetch failed",
  //           2500,
  //           ToastMessageType.Error,
  //           ToastPlacement.Bottom
  //         );
  //       }
  //     );
  // }


  // listenToGroups(parentclubKey) {
  //   for (let team = 0; team < this.teams.length; team++) {
  //     const sub = this.fb
  //       .getAllWithQuery(`MemberGroup/${parentclubKey}`, {
  //         orderByKey: true,
  //         equalTo: this.teams[team].MemberGroupKey,
  //       })
  //       .subscribe((data) => {
  //         console.log(data);
  //         this.teams[team].ReadCount = data[0]["ReadCount"];
  //       });
  //     this.subscriptionArr.push(sub);
  //   }
  // }
  
  groups = [
    {
      SessionName: "Chennai Super Kings",
      LatastMessage: "Hello",
      ReadCount: "1",
      CreatedAt: "04:00PM"
    },
    {
      SessionName: "Mumbai Indians",
      LatastMessage: "Hello",
      ReadCount: "1",
      CreatedAt: "04:00PM"
    },
    {
      SessionName: "Kings Eleven",
      LatastMessage: "Hello",
      ReadCount: "1",
      CreatedAt: "04:00PM"
    },
    {
      SessionName: "Kolkata Knightriders",
      LatastMessage: "Hello",
      ReadCount: "1",
      CreatedAt: "04:00PM"
    },
    {
      SessionName: "Delhi Daredewills",
      LatastMessage: "Hello",
      ReadCount: "1",
      CreatedAt: "04:00PM"
    },
    {
      SessionName: "Sunrizers Hyderabad",
      LatastMessage: "Hello",
      ReadCount: "1",
      CreatedAt: "04:00PM"
    },
    {
      SessionName: "Gujarat Titans",
      LatastMessage: "Hello",
      ReadCount: "1",
      CreatedAt: "04:00PM"
    },
    {
      SessionName: "Lucknow 11",
      LatastMessage: "Hello",
      ReadCount: "1",
      CreatedAt: "04:00PM"
    },
    {
      SessionName: "Patna Pirates",
      LatastMessage: "Hello",
      ReadCount: "1",
      CreatedAt: "04:00PM"
    },
    {
      SessionName: "Haryana 11",
      LatastMessage: "Hello",
      ReadCount: "1",
      CreatedAt: "04:00PM"
    }

  ]

  gotoadminchat() {
    this.navCtrl.push("TeamchatconversationPage");
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

