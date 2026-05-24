import { Component, ViewChild } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  AlertController,
  ModalController,
  LoadingController,
} from "ionic-angular";
import { FirebaseService } from "../../../services/firebase.service";
import { CommonService,ToastMessageType,ToastPlacement,} from "../../../services/common.service";
import { Storage } from "@ionic/storage";
import { Apollo, QueryRef } from "apollo-angular";
import gql from "graphql-tag";
import * as moment from "moment";
import { CreateTemplateModel,} from "./model/challenge_templatemodel";

/**
 * Generated class for the AddtemplatePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-addtemplate",
  templateUrl: "addtemplate.html",
  providers: [CommonService, FirebaseService],
})
export class AddtemplatePage {
  maxDate: any;
  minDate: any;
  parentClubKey: string = "";
  activityList = [];
  selectedActivity = "";
  Challenges = [];
  Template: CreateTemplateModel = {
    TemplateName: "",
    ActivityKey: "",
    FirebaseParentClubKey: "",
    AgeGroupStart: undefined,
    AgeGroupEnd: undefined,
    TemplateType: 1,
  };
  assignChallengeToTemplate = {
    TemplateID: "",
    ChallengeInfo: [],
    ExpiryAt: "",
  };
  //Challenges:Challenge[];
  //Levels:Level[];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public fb: FirebaseService,
    private apollo: Apollo
  ) {
    let now = moment().add(10, "year");
    this.maxDate = moment(now).format("YYYY-MM-DD");
    this.minDate = moment().format("YYYY-MM-DD");
    storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        this.Template.FirebaseParentClubKey = this.parentClubKey;
        this.getActivityList();
      }
    });
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad AddtemplatePage");
  }

  getActivityList() {
    this.fb.getAll("/Activity/" + this.parentClubKey).subscribe((data) => {
      if (data.length > 0) {
        this.activityList = [];
        for (let j = 0; j < data.length; j++) {
          let ActivityList = this.commonService.convertFbObjectToArray(data[j]);
          for (let k = 0; k < ActivityList.length; k++) {
            let flag = true;
            for (let i = 0; i < this.activityList.length; i++) {
              if (ActivityList[k].IsEnable) {
                if (ActivityList[k].Key == this.activityList[i].Key) {
                  flag = false;
                  break;
                }
              }
            }
            if (
              flag &&
              ActivityList[k].Key &&
              ActivityList[k].Key != undefined &&
              ActivityList[k].ActivityName
            ) {
              this.activityList.push(ActivityList[k]);
              this.selectedActivity = this.activityList[0].Key;
              this.Template.ActivityKey = this.selectedActivity;
              flag = false;
            }
          }
        }
      }
    });
  }

  deleteChallenge(index: number) {
    let alert = this.alertCtrl.create({
      title: "Challenge Delete",
      message: "Are you sure, You want to delete challenge ?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          handler: () => {
            console.log("Cancel clicked");
          },
        },
        {
          text: "Yes:Delete",
          handler: () => {
            console.log("Delete clicked");
            this.Challenges.splice(index, 1);
          },
        },
      ],
    });
    alert.present();
  }

  AddChallenge() {
    //Challengeslist
    let profileModal = this.modalCtrl.create("Challengeslist", {
      challenges: this.Challenges,
    });
    profileModal.onDidDismiss((data) => {
      if (data && data.challenges != undefined && data.challenges.length > 0) {
        this.Challenges = [...this.Challenges, ...data.challenges];
        console.log(this.Challenges);
      }
    });
    profileModal.present();
  }

  createTemplate() {
    this.commonService.showLoader("");
    this.Template.ActivityKey = this.selectedActivity;
    this.Template.AgeGroupStart = Number(this.Template.AgeGroupStart);
    this.Template.AgeGroupEnd = Number(this.Template.AgeGroupEnd);
    if (this.Challenges.length > 0) {
      this.apollo
        .mutate({
          mutation: gql`
            mutation createTemplate($templateInput: TemplateInput!) {
              createTemplate(templateInput: $templateInput) {
                Id
                TemplateName
                Challenge {
                  Id
                  ChallengeName
                }
                ParentClub {
                  FireBaseId
                  ParentClubName
                }
              }
            }
          `,
          variables: { templateInput: this.Template },
        })
        .subscribe(
          ({ data }) => {
            console.log("assign data" + data["createTemplate"]);
            this.assignChallengesToTemplate(data["createTemplate"]["Id"]);
          },
          (err) => {
            this.commonService.hideLoader();
            console.log(JSON.stringify(err));
            this.commonService.toastMessage(
              "Template creation failed",
              2500,
              ToastMessageType.Error,
              ToastPlacement.Bottom
            );
          }
        );
    } else {
      this.commonService.hideLoader();
      this.commonService.toastMessage(
        "Add challenges to the template",
        2500,
        ToastMessageType.Error,
        ToastPlacement.Bottom
      );
    }
  }

  assignChallengesToTemplate(templateid) {
    this.Challenges.forEach((challenge) => {
      this.assignChallengeToTemplate.ChallengeInfo.push({
        ChallengeID: challenge.Id,
        Freequency: parseInt(challenge.frequency),
        // StartOn:challenge.startAt,
        // EndOn:challenge.endAt
      });
    });
    this.assignChallengeToTemplate.TemplateID = templateid;
    //this.assignChallengeToTemplate.ExpiryAt = "2021-12-12";
    this.assignChallengeToTemplate.ExpiryAt = moment().add(1,'years').format("YYYY-MM-DD");
    this.apollo
      .mutate({
        mutation: gql`
          mutation assignChallengesToTemplate($input: TemplateChallengeInput!) {
            assignChallengesToTemplate(input: $input) {
              Id
            }
          }
        `,
        variables: { input: this.assignChallengeToTemplate },
      })
      .subscribe(
        ({ data }) => {
          //console.log('assign data' + data["assignChallengesToTemplate"]);
          this.commonService.hideLoader();
          this.commonService.toastMessage("Template created successfully",2500,ToastMessageType.Success,ToastPlacement.Bottom);
          this.commonService.updateCategory("challenge_template_list");
          this.navCtrl.remove(this.navCtrl.getActive().index - 1, 2);
        },
        (err) => {
          this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage("Template creation failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }
      );
  }

  // calculateChallengePoints(){
  //   this.Challenges.forEach((challenge) => {
  //     challenge["TotPts"] = 0;
  //     challenge.Levels.forEach((level) => {
  //       challenge["TotPts"] += level.Points;
  //     })
  //   })
  // }
}
