import { Component, ViewChild } from "@angular/core";
import { Apollo } from "apollo-angular";
import { Content, IonicPage, NavController, NavParams } from "ionic-angular";
import { Subscription } from "rxjs";
import { CommonService } from "../../services/common.service";
import { FirebaseService } from "../../services/firebase.service";
import { MemberGroup } from "../admingroupchat/admingroupchat";

/**
 * Generated class for the AdmingroupchatinfoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-admingroupchatinfo",
  templateUrl: "admingroupchatinfo.html",
})
export class AdmingroupchatinfoPage {
  @ViewChild(Content) content: Content;
  selectedGroup: MemberGroup;
  groupSubScription: Subscription;
  memberSubscription: Subscription;
  allGroupsMember: any = [];
  memberlist: any = [];
  allMemberGroupDetails: any[] = [];
  parentclubKey: string;
  clubKey: string;
  firstname: string;
  lastname: string;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private apollo: Apollo,
    public commonService: CommonService,
    private fb: FirebaseService
  ) {
    this.selectedGroup = this.navParams.get("selectedGroup");
    this.parentclubKey = this.navParams.get("parentclubKey");
    this.getAllGroupMembers();
  }

  getAllGroupMembers() {
    this.memberSubscription = this.fb
      .getAllWithQuery(`Group/`, {
        orderByKey: true,
        equalTo: this.selectedGroup.GroupKey,
      })
      .subscribe((data) => {
        this.allGroupsMember = [];
        let member = this.commonService.convertFbObjectToArray(data[0].Members);
        this.clubKey = data[0].ClubKey;
        member.forEach((mem) => {
          this.fb
            .getAllWithQuery(`Member/${this.parentclubKey}/${this.clubKey}`, {
              orderByKey: true,
              equalTo: mem.MemberKey,
            })
            .subscribe((data2) => {
              if (data2.length > 0) {
                this.allGroupsMember.push({
                  firstname: data2[0].FirstName,
                  lastname: data2[0].LastName,
                });
              }
            });
        });
      });
  }

  getmemberlist() {}
}
