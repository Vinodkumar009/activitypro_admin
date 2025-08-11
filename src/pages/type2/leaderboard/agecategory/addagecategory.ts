import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  LoadingController,
} from "ionic-angular";
import { Apollo, QueryRef } from "apollo-angular";
import { HttpLink } from "apollo-angular-link-http";
import gql from "graphql-tag";
import { Storage } from "@ionic/storage";
import {
  CommonService,
  ToastMessageType,
  ToastPlacement,
} from "../../../../services/common.service";
import { FirebaseService } from "../../../../services/firebase.service";
/**
 * Generated class for the AddagecategoryPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-addagecategory",
  templateUrl: "addagecategory.html",
})
export class Addagecategory {
  SelectedStartAge: number;
  SelectedEndAge: number;
  AgeCategory: AgeCategoryModel = {
    ParentClubKey: "",
    CategoryName: "",
    AgeFrom: 0,
    AgeTo: 0,
    Description: "",
  };
  AgeStartsFrom = [];
  AgeEndTo = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private apollo: Apollo,
    private httpLink: HttpLink,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public fb: FirebaseService
  ) {
    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.AgeCategory.ParentClubKey = val.UserInfo[0].ParentClubKey;
      }
      for (let i = 0; i < 100; i++) {
        this.AgeStartsFrom.push({ ageKey: i, ageVal: i });
        this.AgeEndTo.push({ ageKey: i, ageVal: i });
      }
    });
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad AddagecategoryPage");
  }

  saveAgeCategory = () => {
    if (this.IsFormValid()) {
      this.AgeCategory.AgeFrom = Number(this.SelectedStartAge);
      this.AgeCategory.AgeTo = Number(this.SelectedEndAge);
      this.apollo
        .mutate({
          mutation: gql`
            mutation ($ageCategoryInput: AgeCategoryInput!) {
              saveAgeCategory(ageCategoryInput: $ageCategoryInput) {
                Id
                CategoryName
                AgeFrom
                AgeTo
                Description
              }
            }
          `,
          variables: { ageCategoryInput: this.AgeCategory },
        })
        .subscribe(
          ({ data }) => {
            this.commonService.toastMessage(
              "Age category created successfuly",
              2500,
              ToastMessageType.Success,
              ToastPlacement.Bottom
            );
            this.navCtrl.pop();
          },
          (err) => {
            console.log(JSON.stringify(err));
            this.commonService.toastMessage(
              "Age category creation failed",
              2500,
              ToastMessageType.Error,
              ToastPlacement.Bottom
            );
          }
        );
    }
  };

  IsFormValid() {
    if (this.AgeCategory.CategoryName == "") {
      this.commonService.toastMessage(
        "Category name should not be empty",
        2500,
        ToastMessageType.Error,
        ToastPlacement.Bottom
      );
      return false;
    }
    if (!this.SelectedStartAge) {
      this.commonService.toastMessage(
        "Please select AgeFrom",
        2500,
        ToastMessageType.Error,
        ToastPlacement.Bottom
      );
      return false;
    }
    if (!this.SelectedEndAge) {
      this.commonService.toastMessage(
        "Please select AgeTo",
        2500,
        ToastMessageType.Error,
        ToastPlacement.Bottom
      );
      return false;
    }
    if (Number(this.SelectedStartAge) > Number(this.SelectedEndAge)) {
      this.commonService.toastMessage(
        "FromAge Should not greaterthan EndAge",
        2500,
        ToastMessageType.Error,
        ToastPlacement.Bottom
      );
      return false;
    } else {
      return true;
    }
  }
}

export class AgeCategoryModel {
  ParentClubKey: string;
  CategoryName: string;
  AgeFrom: number;
  AgeTo: number;
  Description: string;
}
