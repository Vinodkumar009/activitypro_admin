import { Component } from "@angular/core";
import {
  IonicPage,
  LoadingController,
  NavController,
  NavParams,
} from "ionic-angular";
import { Storage } from "@ionic/storage";
import {
  CommonService,
  ToastMessageType,
  ToastPlacement,
} from "../../../../services/common.service";
import { SharedServices } from "../../../services/sharedservice";
import { FirebaseService } from "../../../../services/firebase.service";
import gql from "graphql-tag";
import { Apollo } from "apollo-angular";
import { LadderModel } from "../models/match.model";
import { HttpLink } from "apollo-angular-link-http";
import { first } from "rxjs/operators";
import { GraphqlService } from "../../../../services/graphql.service";
import { ThemeService } from "../../../../services/theme.service";
import { error } from "console";
/**
 * Generated class for the MatchladderPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-matchladder",
  templateUrl: "matchladder.html",
})
export class MatchladderPage {
  isPoints = "Points";
  // ladderPoints = [];
  // ladderHeadtoHead = [];

  ladders: LadderModel[] = [];

  fetchLadderInput: FetchLadderInput = {
    ParentClubId: "",
    AgeFrom: 0,
    AgeTo: 0,
    userId: "",
    AppType: 0,
  };
  filteredLadder: LadderModel[] = [];
  ageCategories = [];
  selectedcat = "";
  headtohead: any;
  filteredLadderHead: any;
  parentclubKey: string;
  isDarkTheme: boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private apollo: Apollo,
    private httpLink: HttpLink,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public fb: FirebaseService,
    public sharedservice: SharedServices,
    private graphqlService: GraphqlService,
    private themeService: ThemeService
  ) {
    this.commonService.category.pipe(first()).subscribe((data) => {
      if (data == "ladderlist") {
        // Force theme application when navigating to this page
        setTimeout(() => {
          this.loadTheme();
        }, 100);

        this.storage.get("userObj").then((val) => {
          val = JSON.parse(val);
          if (val.$key != "") {
          }
          this.fetchLadderInput.ParentClubId =
            this.sharedservice.getPostgreParentClubId();
          this.parentclubKey = val.UserInfo[0].ParentClubKey;
          this.getHeadtoHeadList();
          this.getAgeCategories();
        });
      }
    });
  }

  ionViewWillEnter() {
    console.log("MatchLadder page - ionViewWillEnter");

    // Load and apply theme immediately
    this.loadTheme();

    // Subscribe to theme changes
    this.themeService.isDarkTheme$.subscribe((isDark) => {
      console.log("MatchLadder page - theme service change:", isDark);
      this.isDarkTheme = isDark;
      this.applyTheme(isDark);
    });
  }

  ionViewDidEnter() {
    console.log("MatchLadder page - ionViewDidEnter");

    // Apply theme again after view is fully loaded with multiple attempts
    setTimeout(() => {
      this.forceThemeCheck();
    }, 50);

    setTimeout(() => {
      this.forceThemeCheck();
    }, 200);

    setTimeout(() => {
      this.forceThemeCheck();
    }, 500);

    setTimeout(() => {
      this.forceThemeCheck();
    }, 1000);
  }

  ionViewDidLoad() {
    console.log("MatchLadder page - ionViewDidLoad");

    // Force theme application on load
    setTimeout(() => {
      this.loadTheme();
    }, 100);
  }

  private applyTheme(isDark: boolean): void {
    console.log(
      "MatchLadder page - applying theme:",
      isDark ? "dark" : "light"
    );

    // Force apply theme immediately and with retries
    const applyThemeToElement = () => {
      const ladderElement = document.querySelector("page-matchladder");

      if (ladderElement) {
        if (isDark) {
          ladderElement.classList.remove("light-theme");
          document.body.classList.remove("light-theme");
        } else {
          ladderElement.classList.add("light-theme");
          document.body.classList.add("light-theme");
        }
        console.log(
          "MatchLadder page - theme applied successfully:",
          isDark ? "dark" : "light"
        );
        return true;
      }
      return false;
    };

    // Try to apply immediately
    if (!applyThemeToElement()) {
      // If not found, retry multiple times
      let retryCount = 0;
      const maxRetries = 5;

      const retryApply = () => {
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`MatchLadder page - retry ${retryCount}/${maxRetries}`);

          if (!applyThemeToElement()) {
            setTimeout(retryApply, 100 * retryCount); // Increasing delay
          }
        } else {
          console.warn(
            "MatchLadder page - failed to apply theme after all retries"
          );
        }
      };

      setTimeout(retryApply, 50);
    }
  }

  private loadTheme(): void {
    this.storage
      .get("dashboardTheme")
      .then((isDarkTheme) => {
        console.log(
          "MatchLadder page - loaded theme from storage:",
          isDarkTheme
        );

        // If theme is null/undefined, default to dark theme
        const isDark =
          isDarkTheme !== null && isDarkTheme !== undefined
            ? isDarkTheme
            : true;

        console.log(
          "MatchLadder page - applying theme:",
          isDark ? "dark" : "light"
        );
        this.isDarkTheme = isDark;
        this.applyTheme(isDark);
      })
      .catch((error) => {
        console.log("MatchLadder page - error loading theme:", error);
        this.isDarkTheme = true;
        this.applyTheme(true); // Default to dark theme
      });
  }

  // Force theme check method
  private forceThemeCheck(): void {
    console.log("MatchLadder page - forcing theme check");

    // Check multiple sources for theme
    this.storage.get("dashboardTheme").then((storageTheme) => {
      console.log("MatchLadder page - storage theme:", storageTheme);

      // Also check if body has light-theme class
      const bodyHasLightTheme = document.body.classList.contains("light-theme");
      console.log(
        "MatchLadder page - body has light theme:",
        bodyHasLightTheme
      );

      // Determine final theme
      let isDark = true;
      if (storageTheme !== null && storageTheme !== undefined) {
        isDark = storageTheme;
      } else if (bodyHasLightTheme) {
        isDark = false;
      }

      console.log(
        "MatchLadder page - force applying theme:",
        isDark ? "dark" : "light"
      );
      this.isDarkTheme = isDark;
      this.applyTheme(isDark);
    });
  }

  getAgeCategories = () => {
    this.commonService.showLoader("Fetching Agecategories...");
    const ageCategoryQuery = gql`
      query getAgeCategories($parentClub: String!) {
        getAgeCategories(ParentClub: $parentClub) {
          Id
          CategoryName
          AgeFrom
          AgeTo
          Description
        }
      }
    `;
    this.graphqlService
      .query(ageCategoryQuery, { parentClub: this.parentclubKey }, 0)
      .subscribe(
        (res: any) => {
          this.commonService.hideLoader();
          //this.commonService.toastMessage("Age categories fetched",2500,ToastMessageType.Success,ToastPlacement.Bottom);
          this.ageCategories = res.data["getAgeCategories"];
          this.selectedcat = this.ageCategories[0].Id;
        },
        (error) => {
          this.commonService.hideLoader();
          this.commonService.toastMessage(
            "Age categories fetch failed",
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
          if (error.graphQLErrors) {
            for (const gqlError of error.graphQLErrors) {
              console.error("Error Message:", gqlError.message);
              console.error("Error Extensions:", gqlError.extensions);
            }
          }
          if (error.networkError) {
            console.error("Network Error:", error.networkError);
          }
        }
      );
    // this.apollo
    //   .query({
    //     query: ageCategoryQuery,
    //     fetchPolicy: "network-only",
    //     variables: {
    //       parentClub: this.parentclubKey,
    //     },
    //   })
    //   .subscribe(
    //     ({ data }) => {
    //       console.log("age categories data" + data["getAgeCategories"]);
    //       this.commonService.hideLoader();

    //       //this.commonService.toastMessage("Age categories fetched",2500,ToastMessageType.Success,ToastPlacement.Bottom);
    //       this.ageCategories = data["getAgeCategories"];
    //       this.selectedcat = this.ageCategories[0].Id;
    //     },
    //     (err) => {
    //       this.commonService.hideLoader();
    //       this.commonService.toastMessage(
    //         "Age categories fetch failed",
    //         2500,
    //         ToastMessageType.Error,
    //         ToastPlacement.Bottom
    //       );
    //     }
    //   );
  };

  getLadderList = () => {
    this.commonService.showLoader("Fetching ladder...");
    let cat = this.ageCategories.filter((age) => age.Id == this.selectedcat)[0];
    this.fetchLadderInput.AgeFrom = cat.AgeFrom;
    this.fetchLadderInput.AgeTo = cat.AgeTo;
    const ladderQuery = gql`
      query getLadder($ladderInput: FetchLadderInput!) {
        getLadder(ladderInput: $ladderInput) {
          Id
          FirstName
          LastName
          rank
          Points
        }
      }
    `;
    this.graphqlService
      .query(ladderQuery, { ladderInput: this.fetchLadderInput }, 0)
      .subscribe(
        (res: any) => {
          this.commonService.hideLoader();
          this.ladders = res.data["getLadder"];
          this.filteredLadder = JSON.parse(JSON.stringify(this.ladders));
        },
        (error) => {
          this.commonService.toastMessage(
            "Failed to fetch ladder",
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
          console.error("Error in fetching:", error);
        }
      );
  };

  getHeadtoHeadList = () => {
    let head2head = {
      ParentClubId: this.fetchLadderInput.ParentClubId,
      LadderType: 2,
    };
    const ladderQuery = gql`
      query getHeadToHead($headToHeadInput: HeadToHeadInput!) {
        getHeadToHead(headToHeadInput: $headToHeadInput) {
          LastName
          FirstName
          Points
          rank
          LastMatchPlayed
          TotalMatches
        }
      }
    `;
    this.graphqlService
      .query(ladderQuery, { headToHeadInput: head2head }, 0)
      .subscribe(
        (res: any) => {
          this.headtohead = res.data["getHeadToHead"];
          this.filteredLadderHead = JSON.parse(JSON.stringify(this.ladders));
        },
        (error) => {
          this.commonService.toastMessage(
            "Failed to fetch ladder",
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
          console.error("Error in fetching:", error);
        }
      );
    // this.apollo
    //   .query({
    //     query: ladderQuery,
    //     fetchPolicy: "network-only",
    //     variables: {
    //       headToHeadInput: head2head,
    //     },
    //   })
    //   .subscribe(
    //     ({ data }) => {
    //       this.headtohead = data["getHeadToHead"];
    //       this.filteredLadderHead = JSON.parse(JSON.stringify(this.ladders));
    //     },
    //     (err) => {
    //       this.commonService.hideLoader();
    //     }
    //   );
  };

  callheadtohead() {
    if (this.isPoints == "HeadtoHead") {
      this.getFilterItems({ target: "" });
    }
  }

  getFilterItems(ev: any) {
    if (this.isPoints == "Points") {
      let val = ev.target.value;
      // if the value is an empty string don't filter the items
      if (val && val.trim() != "") {
        this.filteredLadder = this.ladders.filter((item) => {
          if (item.FirstName != undefined) {
            if (item.FirstName.toLowerCase().indexOf(val.toLowerCase()) > -1)
              return true;
          }
          if (item.LastName != undefined) {
            if (item.LastName.toLowerCase().indexOf(val.toLowerCase()) > -1)
              return true;
          }
          if (item.rank != undefined) {
            if (String(item.rank).indexOf(val.toLowerCase()) > -1) return true;
          }
          // if (item.Points != undefined) {
          //   if( String(item.Points).indexOf(val.toLowerCase()) > -1) return true
          // }
          // if (item. Points!= undefined) {
          //   return (
          //     item.Activity.ActivityName.toLowerCase().indexOf(
          //       val.toLowerCase()
          //     ) > -1
          //   );
          // }
          // if (item.Hosts.Name != undefined) {
          //   return item.Hosts.Name.toLowerCase().indexOf(val.toLowerCase()) > -1;
          // }
        });
      } else this.initializeItems();
    } else {
      let val = ev.target.value;
      // if the value is an empty string don't filter the items
      if (val && val.trim() != "") {
        this.filteredLadderHead = this.headtohead.filter((item) => {
          if (item.FirstName != undefined) {
            if (item.FirstName.toLowerCase().indexOf(val.toLowerCase()) > -1)
              return true;
          }
          if (item.LastName != undefined) {
            if (item.LastName.toLowerCase().indexOf(val.toLowerCase()) > -1)
              return true;
          }
          if (item.rank != undefined) {
            if (String(item.rank).indexOf(val.toLowerCase()) > -1) return true;
          }
          // if (item.Points != undefined) {
          //   if( String(item.Points).indexOf(val.toLowerCase()) > -1) return true
          // }
          // if (item. Points!= undefined) {
          //   return (
          //     item.Activity.ActivityName.toLowerCase().indexOf(
          //       val.toLowerCase()
          //     ) > -1
          //   );
          // }
          // if (item.Hosts.Name != undefined) {
          //   return item.Hosts.Name.toLowerCase().indexOf(val.toLowerCase()) > -1;
          // }
        });
      } else this.initializeItems2nd();
    }
  }

  initializeItems() {
    this.filteredLadder = this.ladders;
  }

  initializeItems2nd() {
    this.filteredLadderHead = this.headtohead;
  }
}

export class FetchLadderInput {
  ParentClubId: string;
  userId: string;
  AppType: number;
  AgeFrom: number;
  AgeTo: number;
}
