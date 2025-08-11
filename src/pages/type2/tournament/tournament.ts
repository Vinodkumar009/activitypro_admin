import { Component, ViewChild, ViewChildren } from "@angular/core";
import {
  IonicPage,
  NavController,
  ModalController,
  AlertController,
  ActionSheetController,
} from "ionic-angular";
// import * as moment from 'moment';
import { Storage } from "@ionic/storage";
import { Events } from "ionic-angular";
import { FirebaseService } from "../../../services/firebase.service";
import { CommonService, ToastMessageType } from "../../../services/common.service";
import moment, { Moment } from "moment";
import { CommonLeagueService } from "../league/commonleague.service";
import { LeagueteamlistingPage } from "../league/leagueteamlisting/leagueteamlisting";

// import { IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
  selector: "page-tournament",
  templateUrl: "tournament.html",
})
export class TournamentPage {
  @ViewChild('leagueTeamListingRef') leagueTeamListingComponent: LeagueteamlistingPage;

  Title: string = "Tournament";
  isTab: boolean = false;
  isFirstTab: boolean = true;
  selectedFooterIndex = 4;
  LangObj: any = {}; //by vinod
  parentClubKey: string;
  IsActiveTournament = "Active";
  activeTournament = [];
  pastTournaments = [];
  Tournaments = [];
  currencyDetails: any;


  Tabmenu: Array<any> = [
    { DisplayName: "Tournament", Icon: "trophy", Index: 0, IsSelect: false },
    { DisplayName: "Match", Icon: "ios-contacts", Index: 1, IsSelect: false },
    { DisplayName: "Ladder", Icon: "stats", Index: 2, IsSelect: false },
    { DisplayName: "History", Icon: "timer", Index: 3, IsSelect: false },
  ];

  currentActiveType: number;

  constructor(
    public events: Events,
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public comonService: CommonService,
    public storage: Storage,
    public fb: FirebaseService,
    public actionSheetCtrl: ActionSheetController,
    public alertCtrl: AlertController,
    private leagueService: CommonLeagueService
  ) {
    this.currentActiveType = this.leagueService.getActiveLeagueType();

    this.leagueService.activeTypeSubject.subscribe(type => {
      console.log('Tournament page subscription received type:', type);
      this.currentActiveType = type;
    });
    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
      }
      //this.getTournamentList();
      this.selectedFooterIndex = 4;
      this.Title = "Competition";
      this.comonService.updateCategory("leagueteamlisting");
    });
    this.storage.get("Currency").then((val) => {
      this.currencyDetails = JSON.parse(val);
    }).catch((error) => { });
  }

  ionViewWillEnter() {
    this.currentActiveType = this.leagueService.getActiveLeagueType();
    console.log('Tournament page will enter, current type:', this.currentActiveType);
  }

  // 🎯 New improved method using ViewChild
  gotoDifferentTab() {
    console.log('gotoDifferentTab called');

    if (this.leagueTeamListingComponent) {
      // 📞 Call the leagueteamlisting component's createAction method directly
      console.log('Calling leagueTeamListingComponent.createAction()');
      this.leagueTeamListingComponent.createAction();
    } else {
      // 🔄 Fallback to current logic if ViewChild not available
      console.log('ViewChild not available, using fallback logic');
      console.log('gotoDifferentTab - Current type:', this.currentActiveType);

      switch (this.currentActiveType) {
        case 0:
          console.log('Going to CreateleaguePage');
          this.navCtrl.push("CreateleaguePage");
          break;
        case 1:
          console.log('Going to CreateteamPage');
          this.navCtrl.push("CreateteamPage");
          break;
        case 2:
          console.log('Going to CreatematchPage');
          this.navCtrl.push("CreatematchPage");
          break;
        default:
          console.log('Default: Going to CreateleaguePage');
          this.navCtrl.push("CreateleaguePage");
      }
    }


    // gotoDifferentTab() {
    //   // ✅ Use component's currentActiveType instead of calling service method
    //   console.log('gotoDifferentTab - Current type:', this.currentActiveType);

    //   switch (this.currentActiveType) {
    //     case 0:
    //       console.log('Going to CreateleaguePage');
    //       this.navCtrl.push("CreateleaguePage");
    //       break;
    //     case 1:
    //       console.log('Going to CreateteamPage');
    //       this.navCtrl.push("CreateteamPage");
    //       break;
    //     case 2:
    //       console.log('Going to CreatematchPage');
    //       this.navCtrl.push("CreatematchPage");
    //       break;
    //     default:
    //       console.log('Default: Going to CreateleaguePage');
    //       this.navCtrl.push("CreateleaguePage");
    //   }
    // const activeType = this.leagueService.getActiveLeagueType();
    // console.log('gotoDifferentTab - Current type:', activeType);

    // switch (activeType) {
    //   case 0:
    //     console.log('Going to CreateleaguePage');
    //     this.navCtrl.push("CreateleaguePage");
    //     break;
    //   case 1:
    //     console.log('Going to CreateteamPage');
    //     this.navCtrl.push("CreateteamPage");
    //     break;
    //   case 2:
    //     console.log('Going to CreatematchPage');
    //     this.navCtrl.push("CreatematchPage");
    //     break;
    //   default:
    //     console.log('Default: Going to CreateleaguePage');
    //     this.navCtrl.push("CreateleaguePage");
    // }
  }

  ionViewDidLoad() {
    this.getLanguage();
    this.events.subscribe("language", (res) => {
      this.getLanguage();
    });
  }

  getLanguage() {
    this.storage.get("language").then((res) => {
      console.log(res["data"]);
      this.LangObj = res.data;
    });
  }
  getTournamentList() {
    const tournments$ = this.fb.getAllWithQuery("Tournament/" + this.parentClubKey, { orderByChild: "IsActive", equalTo: true }).subscribe((data) => {
      tournments$.unsubscribe();
      this.Tournaments = [];
      this.activeTournament = [];
      this.pastTournaments = [];
      this.Tournaments = this.comonService.convertFbObjectToArray(data);
      let tournamentsBackup = this.comonService.convertFbObjectToArray(data);

      tournamentsBackup = this.Tournaments.sort((left, right) => {
        return moment(left.StartDate).diff(moment(right.StartDate));
      });
      tournamentsBackup.forEach((eachTournament) => {
        eachTournament["TotalAmount"] = 0;
        eachTournament["AmountRecived"] = 0;
        eachTournament["TotalMembers"] = 0;
        eachTournament["PaidMembers"] = 0;
        eachTournament["backupEndDate"] = eachTournament.EndDate;
        eachTournament.StartDate = moment(eachTournament.StartDate).format(
          "DD MMM YYYY"
        );
        eachTournament.EndDate = moment(eachTournament.EndDate).format(
          "DD MMM YYYY"
        );

        this.comonService
          .convertFbObjectToArray(eachTournament.Group)
          .forEach((eachGroup) => {
            // element.Group
            if (eachGroup.Member)
              this.comonService
                .convertFbObjectToArray(eachGroup.Member)
                .forEach((member) => {
                  if (member.IsActive) {
                    eachTournament.TotalAmount =
                      eachTournament.TotalAmount + member.TotalFeesAmount * 1;
                    eachTournament.TotalMembers++;
                    if (
                      member.AmountPayStatus != "due" &&
                      member.AmountPayStatus != "Due"
                    ) {
                      eachTournament.AmountRecived =
                        eachTournament.AmountRecived +
                        member.TotalFeesAmount * 1;
                      eachTournament.PaidMembers++;
                    }
                  }
                });
          });
        // element['TotalAmount'] = totalAmount;
        // element['AmountRecived'] = amountRecived;
        // element['TotalMembers'] = totalMembers;
        // element['PaidMembers'] = paidMembers;
        //if (eachTournament.IsActive) {
        if (
          new Date(eachTournament.backupEndDate).getTime() >=
          new Date(this.comonService.getTodaysDate()).getTime()
        ) {
          this.activeTournament.push(eachTournament);
        } else {
          this.pastTournaments.push(eachTournament);
        }
        // } else {
        //   this.pastTournaments.push(eachTournament)
        //}
      });
      console.log(this.pastTournaments);
    });
  }
  goToDetails(tournamentKey) {
    this.navCtrl.push("TournamentDetailsPage", {
      TournamentKey: tournamentKey,
      ParentClubKey: this.parentClubKey
    });
  }

  // showOptions(tournamentKey) {
  //   let actionSheet;
  //   actionSheet = this.actionSheetCtrl.create({
  //     buttons: [
  //       {
  //         text: 'View Tournament',
  //         icon: this.platform.is('android') ? 'ios-create-outline' : '',
  //         handler: () => {
  //           this.goToDetails(tournamentKey);
  //         }
  //       }, {
  //         text: 'Delete Tournament',
  //         cssClass: 'dangerRed',
  //         icon: this.platform.is('android') ? 'trash' : '',
  //         handler: () => {
  //           let delalert = this.alertCtrl.create({
  //             message: ' Are you sure to delete this Tournament ?',
  //             buttons: [
  //               {
  //                 text: "Cancel",
  //                 role: 'cancel'

  //               },
  //               {
  //                 text: 'Delete',
  //                 handler: data => {
  //                   this.deleteTournament(tournamentKey)
  //                 }
  //               }
  //             ]
  //           });
  //           delalert.present();
  //         }
  //       }
  //     ]
  //   });

  //   actionSheet.present();
  // }

  deleteTournament(tournamentKey) {
    this.activeTournament.forEach((eachTournament) => {
      if (eachTournament.$key == tournamentKey) {
        this.comonService
          .convertFbObjectToArray(eachTournament.Group)
          .forEach((eachGroup) => {
            // element.Group
            if (eachGroup.Member)
              this.comonService
                .convertFbObjectToArray(eachGroup.Member)
                .forEach((member) => {
                  this.fb.update(
                    tournamentKey,
                    "Member/" +
                    member.ParentClubKey +
                    "/" +
                    member.ClubKey +
                    "/" +
                    member.Key +
                    "/Tournament",
                    { IsActive: false }
                  );
                });
          });
        this.fb.update(tournamentKey, "Tournament/" + this.parentClubKey, {
          IsActive: false,
        });
        this.comonService.toastMessage(
          eachTournament.TournamentName + " successfully deleted", 2500, ToastMessageType.Success);
      }
    });
  }

  createTournament() {
    this.navCtrl.push("CreateTournamentPage");
    console.log("create Tournament");
  }

  gotoLadder() {
    this.navCtrl.push("MatchladderPage");
  }

  gotoMatch() {
    this.navCtrl.push("MatchPage");
  }

  gotoCreateLeague() {
    this.navCtrl.push("CreateleaguePage");
  }

  selectedTab(index: number) {
    this.selectedFooterIndex = index;
    if (this.selectedFooterIndex == 0) {
    } else if (this.selectedFooterIndex == 1) {
      this.comonService.updateCategory("matchlist");
      this.Title = "Match";
    } else if (this.selectedFooterIndex == 2) {
      this.comonService.updateCategory("ladderlist");
      this.Title = "Ladder";
    } else if (this.selectedFooterIndex == 3) {
      this.comonService.updateCategory("match_history");
      this.Title = "History";
    } else if (this.selectedFooterIndex == 4) {
      this.comonService.updateCategory("leagueteamlisting");
      this.Title = "Leagues";
    }
  }

  gotoHistory() {
    this.navCtrl.push("MatchhistoryPage");
  }
  gotoCreateMatch() {
    this.navCtrl.push("CreatematchPage");
  }

  debugCurrentType() {
    console.log('Current type in component:', this.currentActiveType);
    console.log('Current type in service:', this.leagueService.getActiveLeagueType());
  }
}
