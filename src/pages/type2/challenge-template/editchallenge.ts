import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, AlertController, LoadingController } from 'ionic-angular';
import { FirebaseService } from '../../../services/firebase.service';
import { SharedServices } from '../../services/sharedservice';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import { Storage } from '@ionic/storage';
import { CreateChallengeModel, CreateLevelmodel,UpdateLevelModel, AssignChallenge_LevelModel, ApprovalModel } from './model/challenge_templatemodel';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { Camera, PictureSourceType, CameraOptions } from '@ionic-native/camera';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/combineLatest';
import { catchError,map } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
/**
 * Generated class for the EditchallengePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-editchallenge',
  templateUrl: 'editchallenge.html',
})
export class Editchallenge {
  activityList = [];
  selectedActivity = "";
  selectedApproval = "";
  parentClubKey: string = "";
  TitleUrl: string;
  isImgShouldUpdate:boolean = false;
  // Challenge = {
  //   Challenge: "",
  //   Description: "",
  //   AgeFrom: 0,
  //   AgeTo: 0,
  //   ActivityKey: "",
  // }
  ChallengeCategoryTypes = [
    { type:"CURL",value:0},
    { type:"PUSHUP",value:1},
    { type:"SQUAT",value:2},
    { type:"TENNIS SERVE",value:3}
  ]
  ChallengeType = [
    { name:"Normal",value:0},
    { name:"Camera Enabled",value:1}
  ]
  Challenge: any;
  // Approvals = [
  //   { Id: "Self", Approval: "Self" },
  //   { Id: "Parent", Approval: "Parent" },
  //   { Id: "Club", Approval: "Club" }
  // ]
  Approvals: ApprovalModel[];
  Challenge_level: AssignChallenge_LevelModel = { ChallengeID: '', LevelID: '' };
  level: UpdateLevelModel = {
    Id:"",
    LevelName: "",
    LevelApproval: "",
    LevelChallenge: "",
    ImageUrl: "",
    Points: undefined,
    LevelSequence: 2,
    ApprovalID: "",
    PointsID: "",
    ParentclubKey: ""
  };
  Levels: Array<any> = [];
  levelAlertTitle: string = "";
  levelBtnTitle: string = "";
  //let levelPrompt = this.alertCtrl.create()
  isShowLevelPopUp: boolean = false;
  constructor(public navCtrl: NavController, public navParams: NavParams, public actionSheetCtrl: ActionSheetController, private alertCtrl: AlertController, public commonService: CommonService, public loadingCtrl: LoadingController, public storage: Storage, private apollo: Apollo, private camera: Camera, public fb: FirebaseService, public sharedservice: SharedServices) {
    this.Challenge = this.navParams.get("challenge");
    this.parentClubKey = this.navParams.get("ParentClubKey");
    console.log(this.Challenge);
    this.Challenge.ChallengeCategory = this.Challenge.ChallengeCategory ? this.Challenge.ChallengeCategory:0;
    this.Challenge.ChallengeType = this.Challenge.ChallengeType ? this.Challenge.ChallengeType:0;
    if (this.Challenge.Levels && this.Challenge.Levels.length > 0) {
      this.Challenge.Levels.forEach((levelObj) => {
        this.Levels.push({
          Id:levelObj.Id,
          LevelName:levelObj.LevelName,
          LevelApproval:levelObj.ApprovalDetails.ApprovedBy,
          LevelChallenge :levelObj.LevelChallenge,
          Points:Number(levelObj.Points),
          LevelSequence :levelObj.LevelSequence,
          ParentclubKey : this.parentClubKey,
          ImageUrl : "",
          //ImageUrl :"https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815.appspot.com/o/ActivityPro%2FEvents%2F-KuAlAWygfsQX9t_RqNZ1602513173377?alt=media&token=f9f3f435-a1bc-47b4-83ab-e8f50e010636",//need to comment
          ApprovalID :levelObj.ApprovalDetails.Id,//this.selectedApproval;
          PointsID :levelObj.PointsDetails.Id,
          //this.selectedApproval = levelObj.ApprovalDetails.Id;
        })
      })
      this.sortLevels();
    }

    this.TitleUrl = this.Challenge.ChallengsImageURL;
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        this.getApprovals();
        this.getActivityList();
      }
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditchallengePage');
  }

  sortLevels(){
    this.Levels.sort((a, b) => {
          return a.LevelSequence - b.LevelSequence;
      });
  }

  getApprovals = () => {
    const approvalQuery = gql`
    query getApproval($approvalid:String!) {
      getApproval(approvalnput:$approvalid){
        Id
        ApprovedBy
        ApprovalType
      }
    }
  `;
    this.apollo
      .query({
        query: approvalQuery,
        variables: {
          approvalid: "",
        },
      })
      .subscribe(({ data }) => {
        //this.commonService.hideLoader();
        this.Approvals = data["getApproval"] as ApprovalModel[];
      }, (err) => {
        //this.commonService.hideLoader();
        this.commonService.toastMessage("Approvals fetch failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      });
  }



  getActivityList() {
    const activity$Obs = this.fb.getAll("/Activity/" + this.parentClubKey).subscribe((data) => {
      activity$Obs.unsubscribe();
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
            if (flag && ActivityList[k].Key && ActivityList[k].Key != undefined && ActivityList[k].ActivityName) {
              this.activityList.push(ActivityList[k]);
              flag = false;
            }
          }

        }
        this.selectedActivity = this.Challenge.Activity.FirebaseActivityKey ? this.Challenge.Activity.FirebaseActivityKey:this.activityList[0].Key;
        //this.selectedActivity = this.activityList[0].Key;
      }
    });

  }

  SelectProfImg() {
    const actionSheet = this.actionSheetCtrl.create({
      //header: 'Choose File',
      buttons: [{
        text: 'Camera',
        role: 'destructive',
        icon: 'ios-camera',
        handler: () => {
          console.log('clicked');
          const Url = this.CaptureImage(this.camera.PictureSourceType.CAMERA);
        }
      }, {
        text: 'Gallery',
        icon: 'ios-image',
        handler: () => {
          console.log('Share clicked');
          const Url = this.CaptureImage(this.camera.PictureSourceType.PHOTOLIBRARY);
        }
      }, {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }
      ]
    });
    actionSheet.present();
  }
  async CaptureImage(sourceType: PictureSourceType) {
    const options: CameraOptions = {
      quality: 60,
      sourceType: sourceType,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }
    try {
      this.camera.getPicture(options).then((data) => {
        this.TitleUrl = "data:image/jpeg;base64," + data;
        this.isImgShouldUpdate = true;
        console.log(1)
        return Promise.resolve(this.TitleUrl);

      });
    } catch (e) {
      console.log(e.message);
      let message = "Uploading failed";
      this.commonService.toastMessage(message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    }
  }


  async uploadImageFromSave(): Promise<string> {
    return new Promise((res, rej) => {
      if (this.TitleUrl != undefined) {
        let imgObj = {};
        console.log(2)
        imgObj["url"] = this.TitleUrl;
        imgObj["upload_type"] = 'apkids';
        imgObj["ImageTitle"] = this.Challenge.ChallengeName;
        imgObj["club_name"] = this.parentClubKey;

        this.fb.uploadPhoto(imgObj).then((url) => {
          console.log(2)
          res(url.toString());
        }).catch((err) => {
          let message = "Error in uploading photo";
          this.commonService.toastMessage(message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          rej(err);
        })
      } else {
        res("");
      }
    })
  }



  getPlaceholder(placeholder: string) {
    return this.actionFor == 'add' ? '' : placeholder
  }

  actionFor = '';
  levelIndex: number;
  EditLevel(actionFor: string, levelObj?: any, index?: number) {
    this.actionFor = actionFor;
    this.levelAlertTitle = "Edit Level";
    this.levelBtnTitle = "Update";
    this.level.Id = levelObj.Id;
    this.level.LevelName = levelObj.LevelName;
    this.level.LevelApproval = levelObj.LevelApproval;
    this.level.LevelChallenge = levelObj.LevelChallenge;
    this.level.Points = Number(levelObj.Points);
    this.level.LevelSequence = levelObj.LevelSequence;
    this.level.ParentclubKey = this.parentClubKey;
    this.level.ImageUrl = "";//need to comment
    //this.level.ImageUrl = "https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815.appspot.com/o/ActivityPro%2FEvents%2F-KuAlAWygfsQX9t_RqNZ1602513173377?alt=media&token=f9f3f435-a1bc-47b4-83ab-e8f50e010636";//need to comment
    this.level.ApprovalID = levelObj.ApprovalID//this.selectedApproval;
    this.level.PointsID = levelObj.PointsID//this.selectedPoints;
    this.selectedApproval = levelObj.ApprovalID;
    this.isShowLevelPopUp = true;
    this.levelIndex = index;
  }

  AddLevel() {
    this.levelAlertTitle = "Add Level";
    this.levelBtnTitle = "Add";
    //this.levelPrompt = this.alertCtrl.create()
    this.level.Id = "";
    this.level.LevelName = '';
    this.level.LevelApproval = this.Approvals[0].ApprovedBy;
    this.level.LevelChallenge = '';
    this.level.Points = 0;
    this.level.ImageUrl = "";//need to comment
    this.level.ParentclubKey = this.parentClubKey;
    //this.level.ImageUrl = "https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815.appspot.com/o/ActivityPro%2FEvents%2F-KuAlAWygfsQX9t_RqNZ1602513173377?alt=media&token=f9f3f435-a1bc-47b4-83ab-e8f50e010636";//need to comment
    this.level.ApprovalID = this.Approvals[0].Id//this.selectedApproval;
    this.level.PointsID = "cdfc32dd-aa02-433c-8756-3dbf67663252"//this.selectedPoints;
    this.selectedApproval = this.Approvals[0].Id;
    this.isShowLevelPopUp = true;

  }

  onApprovalChange() {
    let approvalIndex = this.Approvals.findIndex(approval => approval.Id === this.selectedApproval);
    if (approvalIndex !=-1) {
      this.level.LevelApproval = this.Approvals[approvalIndex].ApprovedBy;
      this.level.ApprovalID = this.Approvals[approvalIndex].Id//this.selectedApproval;
    }
  }
  async addOrEditLevel() {
    if (this.validateLevel()) {
      let level: any;

      //this.level.LevelApproval = this.selectedApproval;
      if (this.levelBtnTitle.toLocaleLowerCase() != "update") {
        this.level.Points = Number(this.level.Points);
        //this.level.LevelApproval = this.selectedApproval;
        this.level.LevelSequence = this.Levels.length + 1;//auto creating level sequence as adding
        level = JSON.parse(JSON.stringify(this.level));
        this.Levels.push(level);
      } else {
        let levelIndex = await this.Levels.findIndex((level) => level.Id === this.level.Id);
        // if (levelIndex != -1) {
        //   this.Levels.splice(this.levelIndex, 1);
        // }
          this.Levels[levelIndex].LevelName = this.level.LevelName;
          this.Levels[levelIndex].LevelApproval = this.level.LevelApproval;
          this.Levels[levelIndex].LevelChallenge = this.level.LevelChallenge;
          this.Levels[levelIndex].Points = Number(this.level.Points);
          this.Levels[levelIndex].LevelSequence  = this.level.LevelSequence;
          this.Levels[levelIndex].ParentclubKey  = this.parentClubKey;
          this.Levels[levelIndex].ImageUrl  = this.level.ImageUrl;
          //this.Levels[levelIndex].ImageUrl  = "https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815.appspot.com/o/ActivityPro%2FEvents%2F-KuAlAWygfsQX9t_RqNZ1602513173377?alt=media&token=f9f3f435-a1bc-47b4-83ab-e8f50e010636",//need to comment
          this.Levels[levelIndex].ApprovalID = this.level.ApprovalID;
          this.Levels[levelIndex].PointsID  = this.level.PointsID;
          //this.selectedApproval = levelObj.ApprovalDetails.Id;
      }
      
      this.selectedApproval = "";
      level = {
        LevelName: "",
        LevelChallenge: "",
        LevelApproval: "",
        ImageUrl: "",
        Points: undefined,
        LevelSequence: 2,
        ApprovalID: "",
        PointsID: ""
      };
      this.isShowLevelPopUp = false;
    }

    console.log(this.Levels);
    //this.isShowLevelPopUp = false;

  }

  validateLevel() {
    if (this.level.LevelName == '') {
      this.commonService.toastMessage("Enter LevelName", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    } if (this.level.LevelChallenge == '') {
      this.commonService.toastMessage("Enter Level Description", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    } else {
      return true;
    }
  }
  reorderItems(indexes) {
    console.log(`tab index:${indexes}`);
    // if (indexes.from != 0) {
    let element = this.Levels[indexes.from];
    this.Levels.splice(indexes.from, 1);
    this.Levels.splice(indexes.to, 0, element);
    this.indexLevels();
    // for (let tabIndex = 0; tabIndex < this.tabs.length; tabIndex++) {
    //     this.fb.update(this.tabs[tabIndex].Key, "/TabConfig/Member/" + this.selectedParentClubKey, { TabSequenceNo: tabIndex });
    // }
    // let message = "items reorderd successfully."
    // this.showToast(message, 2000);

  }

  indexLevels() {
    this.Levels.forEach((level, index) => {
      level.LevelSequence = index + 1;
      console.log(index + 1);
    })
    console.log(this.Levels);
  }

  nameChange(ev: any) {
    if (ev.target.value.length > 25) {
      this.level.LevelName = this.level.LevelName.substring(0, ev.target.value.length - 1);
      return false;
    }
  }

  descriptionChange(ev: any) {
    console.log(ev.target.value);
    if (ev.target.value.length > 128) {
      this.level.LevelChallenge = this.level.LevelChallenge.substring(0, ev.target.value.length - 1);
      this.commonService.toastMessage("Description can't be more than 120 characters",2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
  }


  showActions(actionFor: string, levelObj?: any, index?: number) {
    let actionSheet;
    actionSheet = this.actionSheetCtrl.create({
      title: `${levelObj.LevelName}`,
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Edit',
          icon: "ios-create",
          handler: () => {
            this.EditLevel(actionFor, levelObj, index);
          }
        }, 
        {
          text: 'Delete',
          icon: "ios-trash",
          handler: () => {
            this.deleteLevelAlert(levelObj);
          }
        },
        {
          text: 'Close',
          icon: 'ios-close',
          role: 'cancel',
          handler: () => {

          }
        }
      ]
    });
    actionSheet.present();
  }

  deleteLevelAlert(level: any) {
    let alert = this.alertCtrl.create({
      title: 'Level Delete',
      message: 'Are you sure, You want to delete level ?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Yes:Delete',
          handler: () => {
            console.log('Delete clicked');
            this.deleteLevel(level.Id);
          }
        }
      ]
    });
    alert.present();
  }


  deleteLevel = async (levelid: string,) => {
    this.commonService.showLoader();
    let levelIndex = this.Levels.findIndex((level) => level.Id === levelid);
    levelid = this.Levels[levelIndex].Id;
    this.apollo
      .mutate({
        mutation: gql`mutation deleteLevels($levelid:String!){
        deleteLevels(levelId:$levelid)
      }`,
        variables: { levelid: levelid},
      }).subscribe(({ data }) => {

        if (levelIndex != -1) {
          this.Levels.splice(levelIndex, 1);
        }
        this.commonService.hideLoader();
        this.commonService.toastMessage("Level deleted", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.navCtrl.pop();
      }, (err) => {
        this.commonService.hideLoader();
        console.log(JSON.stringify(err));
        this.commonService.toastMessage("Level deletion failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      })

  }


  validateChallenge() {
    if (this.Challenge.ChallengeName == '') {
      this.commonService.toastMessage("Enter ChallengeName", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    }
    // if (this.selectedActivity == '') {
    //   this.commonService.toastMessage("Please choose activity", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    //   return false;
    // } 
    // if (this.Levels.length <= 0) {
    //   this.commonService.toastMessage("Add atleast one level", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    //   return false;
    // } 
    else {
      return true;
    }
  }

  updateChallenge = async () => {
    if (this.validateChallenge()) {
      this.commonService.showLoader("Please wait...");
      let challengeimg = this.isImgShouldUpdate ? await this.uploadImageFromSave() : this.TitleUrl;
      console.log(`imgdata:${challengeimg}`);
      let challengeObj = {
        ChallengeName: this.Challenge.ChallengeName,
        ChallengsImageURL: challengeimg,
        ChallengeCategory:parseInt(this.Challenge.ChallengeCategory)
        //ChallengsImageURL:"https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815.appspot.com/o/ActivityPro%2FEvents%2F-KuAlAWygfsQX9t_RqNZ1602513173377?alt=media&token=f9f3f435-a1bc-47b4-83ab-e8f50e010636"
      }
      
      //challengeObj.ChallengsImageURL = "https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815.appspot.com/o/ActivityPro%2FEvents%2F-KuAlAWygfsQX9t_RqNZ1602513173377?alt=media&token=f9f3f435-a1bc-47b4-83ab-e8f50e010636";//need to comment


      this.apollo
        .mutate({
          mutation: gql`mutation updateChallenges($challengeInput:UpdateChallengesInput!,$challengeId:String!){
            updateChallenges(challengeInput:$challengeInput,challengeId:$challengeId)
          }`,
          variables: { challengeInput: challengeObj, challengeId: this.Challenge.Id },
        }).subscribe(({ data }) => {
          //this.commonService.hideLoader();
          console.log('challeges data' + data["updateChallenges"]);
          //this.updateLevel();
          const observables_array = this.Levels.map((level)=>{
            return this.updateLevel(level).pipe(
              catchError((error) => {
                console.error("Observable error:", error);
                // Return an empty observable to continue with forkJoin
                return Observable.of();
              })
            );
          })
          Observable.combineLatest(observables_array).subscribe((results) => {
            this.commonService.hideLoader();
            this.commonService.toastMessage("Challenge updated", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
            this.commonService.updateCategory("challenge_template_list")
            this.navCtrl.pop();
          })
        }, (err) => {
          this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage("Challenge updation failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        })

    }
  }

  updateLevel(level) {
    //for (let levelObj = 0; levelObj < this.Levels.length; levelObj++) {
      //this.Levels.forEach((selectedlevel) =>{
      let level_id = level.Id;
      level.Points = parseInt(level.Points);
      delete level.LevelApproval;// need to comment
      delete level.Id;
      //let level = JSON.parse(JSON.stringify(selectedlevel));
      return this.apollo
        .mutate({
          mutation: gql`
          mutation editLevels($levelInput:LevelInput!,$levelid:String!) {
            editLevels(levelInput:$levelInput,levelId:$levelid)
          }`,
          variables: { levelInput: level, levelid:level_id},
        }).pipe(
          map(({ data }) => {
            return data["editLevels"];
          }),
          catchError(() => {
            return of(true); // Assuming you want to return `true` on error
          })
      ); 
   
  }


}
