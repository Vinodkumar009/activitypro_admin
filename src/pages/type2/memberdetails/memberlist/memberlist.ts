import { Component } from '@angular/core';
import { IonicPage, LoadingController, NavController, NavParams } from 'ionic-angular';
import { Storage } from "@ionic/storage";
import { FirebaseService } from '../../../../services/firebase.service';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { CurrentUserLevelStats } from '../../levels/models/levels.model';
import { first } from 'rxjs/operators';
import { GraphqlService } from '../../../../services/graphql.service';

/**
 * Generated class for the MemberlistPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-memberlist',
  templateUrl: 'memberlist.html',
  providers:[GraphqlService]
})
export class MemberlistPage {
  getLevelUsersInput: getLevelUsersInput = {
    ParentClubKey: '',
    ClubKey: '',
    MemberKey: '',
    AppType: 0,
    ActionType: 0,
    DeviceType: 1,
    levelId: ""
    // levelId: '256cdee0-725e-487b-ad9b-711be8aa27bd'
  };
  members: CurrentUserLevelStats[] = [];
  filteredMembers: CurrentUserLevelStats[] = [];
  level: any;
  selectedActivityKey: any;
  constructor(public navCtrl: NavController,
    public navParams: NavParams, private apollo: Apollo,
    // public actionSheetCtrl: ActionSheetController,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public fb: FirebaseService,
    private graphqlService:GraphqlService
    // public viewCtrl: ViewController,
  ) {
    // this.level = this.navParams.get("level");
    // this.selectedActivityKey = this.navParams.get("selectedActivityKey");
    // console.log(this.selectedActivityKey);
    // console.log(this.level);
    // this.getLevelUsersInput.levelId = this.level.id
    // this.storage.get("userObj").then((val) => {
    //   val = JSON.parse(val);
    //   if (val.$key != "") {
    //     this.getLevelUsersInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
    //   }
    //   this.getUsersForLevel();
    // });
    //this.commonService.category.pipe(first()).subscribe((data) => {
      //if (data == "upgradedowngradelevel") {
        // this.level = this.navParams.get("level");
        // this.selectedActivityKey = this.navParams.get("selectedActivityKey");
        // console.log(this.selectedActivityKey);
        // console.log(this.level);
        // this.getLevelUsersInput.levelId = this.level.id
        
      //}
    //});
  }

  ionViewWillEnter() {
    this.storage.get("userObj").then((val) => {
      this.level = this.navParams.get("level");
      this.selectedActivityKey = this.navParams.get("selectedActivityKey");
      console.log(this.selectedActivityKey);
      console.log(this.level);
      this.getLevelUsersInput.levelId = this.level.id
      val = JSON.parse(val);
      if (val.$key != "") {
        this.getLevelUsersInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
      }
      this.getUsersForLevel();
    });
  }

  ionViewWillLeave() {
    // this.commonService.updateCategory('');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MemberlistPage');
  }
  gotoNext(mem) {
    this.navCtrl.push("MemberdetailsfocusareaPage", {
      mem: mem,
      selectedActivityKey: this.selectedActivityKey,
      level: this.level
    });
    this.commonService.updateCategory('upgradedowngradelevel');
  }
  calculateDaysElapsed(createdAt: string): string {
    const currentTime = new Date().getTime();
    const elapsedTime = currentTime - parseInt(createdAt);
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const daysElapsed = Math.floor(elapsedTime / millisecondsPerDay);
    // return daysElapsed;
    if (daysElapsed === 0) {
      return 'Today';
    } else {
      return daysElapsed.toString();
    }
  }
  getUsersForLevel = () => {
    this.commonService.showLoader("Fetching members...");
    const getUsersForLevelQuery = gql`
      query getUsersForLevel(
        $levelUsersInput: getLevelUsersInput!
      ) {
        getUsersForLevel(
          levelUsersInput: $levelUsersInput
        ) {
          id
          created_at
          user {
            Id
            FirstName
            LastName
          }
          progress  
        }
      }
    `;
    this.graphqlService.query(getUsersForLevelQuery,{levelUsersInput: this.getLevelUsersInput},1)
      .subscribe(
        ({ data }) => {
          console.log(
            "getUsersForLevel DATA" +
            JSON.stringify(data["getUsersForLevel"])
          );
          this.commonService.hideLoader();
          this.members = data["getUsersForLevel"];
          this.filteredMembers = JSON.parse(JSON.stringify(this.members));
        },
        (err) => {
          this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage(
            "Failed to fetch members",
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom,
          );
        }
      );
  };

  getFilterItems(ev: any) {
    let val = ev.target.value;
    if (val && val.trim() != "") {
      this.filteredMembers = this.members.filter((item) => {
        if (item.user.FirstName != undefined) {
          if (item.user.FirstName.toLowerCase().indexOf(val.toLowerCase()) > -1) return true;
        }
        if (item.user.LastName != undefined) {
          if (item.user.LastName.toLowerCase().indexOf(val.toLowerCase()) > -1) return true;
        }
      });
    } else this.initializeItems();
  }
  initializeItems() {
    this.filteredMembers = this.members;
  }

}

export class getLevelUsersInput {
  ParentClubKey: string;
  ClubKey: string;
  MemberKey: string;
  AppType: number;
  ActionType: number;
  DeviceType: number;
  levelId: string;
}