import { Component } from "@angular/core";
import { Apollo } from "apollo-angular";
import {
  IonicPage,
  LoadingController,
  NavController,
  NavParams,
} from "ionic-angular";
import { first } from "rxjs/operators";
import {
  CommonService,
  ToastMessageType,
  ToastPlacement,
} from "../../../services/common.service";
import { FirebaseService } from "../../../services/firebase.service";
import { SharedServices } from "../../services/sharedservice";
import { Storage } from "@ionic/storage";
import gql from "graphql-tag";
import { ProductVariantModel } from "../profilebadges/models/locker.model";

/**
 * Generated class for the ProfilelockerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-profilelocker",
  templateUrl: "profilelocker.html",
})
export class ProfilelockerPage {
  getProductVariantInput: getProductVariantInput = {
    ParentClubKey: "",
    MemberKey: "",
    AppType: 0,
    ActionType: 0,
  };
  FamilyMember: Array<any>;
  prods: ProductVariantModel[] = [];
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
    this.getProductVariantInput.ParentClubKey = this.navParams.get(
      "ParentClubKey"
    )
      ? this.navParams.get("ParentClubKey")
      : "";
    this.getProductVariantInput.MemberKey = this.FamilyMember[0].Key;
    this.commonService.category.pipe(first()).subscribe((data) => {
      if (data == "profilelocker") {
        this.storage.get("userObj").then((val) => {
          val = JSON.parse(val);
          if (val.$key != "") {
            this.getProductVariantInput.MemberKey = val.UserInfo[0].MemberKey;
          }
          this.getLocker();
        });
      }
    });
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad ProfilelockerPage");
  }

  getLocker = () => {
    const lockerQuery = gql`
      query getAllGalleryItemsForUser($getProducts: getProductVariantInput!) {
        getAllGalleryItemsForUser(getProducts: $getProducts) {
          id
          productCategory {
            id
          }
          variant_type
          variant_size
          variant_color
          variant_price
          variant_description
          paymentType
          variant_shortname
          quantity
          images {
            image_url
          }
        }
      }
    `;
    this.apollo
      .query({
        query: lockerQuery,
        fetchPolicy: "no-cache",
        variables: {
          getProducts: this.getProductVariantInput,
        },
      })
      .subscribe(
        ({ data }) => {
          console.log(
            "badges data" + JSON.stringify(data["getAllGalleryItemsForUser"])
          );
          this.prods = data["getAllGalleryItemsForUser"];
        },
        (err) => {
          // this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage(
            "Failed to fetch Locker",
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
        }
      );
  };
}

export class getProductVariantInput {
  ParentClubKey: string;
  MemberKey: string;
  AppType: number;
  ActionType: number;
}
