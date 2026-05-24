import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ActionSheetController, LoadingController } from 'ionic-angular';
import { FirebaseService } from '../../../services/firebase.service';
import { SharedServices } from '../../services/sharedservice';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import { Storage } from '@ionic/storage';
import { CreateChallengeModel, CreateLevelmodel, AssignChallenge_LevelModel,ApprovalModel } from './model/challenge_templatemodel';
import { Apollo, QueryRef } from 'apollo-angular';
import { HttpLink } from 'apollo-angular-link-http'
import gql from 'graphql-tag';
import { Camera, PictureSourceType, CameraOptions } from '@ionic-native/camera';
import { v } from '@angular/core/src/render3';
/**
 * Generated class for the CreatechallengePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-createchallenge',
  templateUrl: 'createchallenge.html',
})
export class Createchallenge {
  
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
  isToastShown:boolean = false;

  TitleUrl: any;
  activityList = [];
  selectedActivity = "";
  selectedApproval = "";
  selectedPoints = "";
  parentClubKey: string = "";
  Challenge: CreateChallengeModel = {
    ChallengeName: "",
    ChallengsImageURL: "",
    FirebaseActivityId: "",
    ParentClubId: "",
    ChallengeCategory:0,
    ChallengeType:0
  }
  Approvals:ApprovalModel[];
  // Approvals = [
  //   { Id: "Self", Approval: "Self" },
  //   { Id: "Parent", Approval: "Parent" },
  //   { Id: "Club", Approval: "Club" }
  // ]

  Challenge_level: AssignChallenge_LevelModel = { ChallengeID: '', LevelID: '' };
  level = {
    LevelName: "",
    LevelChallenge: "",
    LevelApproval: "",
    ImageUrl: "",
    Points: undefined,
    LevelSequence: 2,
    ApprovalID: "",
    PointsID: "",
    ParentclubKey:"",
    Target:0
  };
  Levels: Array<CreateLevelmodel> = [];
  //Levels = [];

  levelAlertTitle: string = "";
  levelBtnTitle: string = "";
  //let levelPrompt = this.alertCtrl.create()
  isShowLevelPopUp: boolean = false;
  constructor(public navCtrl: NavController, public actionSheetCtrl: ActionSheetController, public navParams: NavParams, private alertCtrl: AlertController, public commonService: CommonService, public loadingCtrl: LoadingController, private camera: Camera,
    private apollo: Apollo, private httpLink: HttpLink, public storage: Storage, public fb: FirebaseService, public sharedservice: SharedServices) {
    //this.selectedApproval = this.Approvals[0].Id;
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        this.Challenge.ParentClubId = this.parentClubKey;
        this.getActivityList();
        this.getApprovals();
      }
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditchallengePage');
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
            if (flag && ActivityList[k].Key && ActivityList[k].Key != undefined && ActivityList[k].ActivityName) {
              this.activityList.push(ActivityList[k]);
              flag = false;
            }
          }

        }
        this.Challenge.FirebaseActivityId = this.activityList[0].Key;
        this.selectedActivity = this.Challenge.FirebaseActivityId;
      }
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
      approvalid:"",
    },
  })
  .subscribe(({data}) => {
    this.commonService.hideLoader();
    this.Approvals = data["getApproval"] as ApprovalModel[];
  },(err)=>{
    //this.commonService.hideLoader();
    this.commonService.toastMessage("Approvals fetch failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
  });
  }


  getPlaceholder(placeholder: string) {
    return this.actionFor == 'add' ? '' : placeholder
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
          rej(err)
        })
      } else {
        res("");
      }
    });
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

indexLevels(){
  this.Levels.forEach((level,index)=>{
    level.LevelSequence = index + 1;
    console.log(index + 1);
  })
  console.log(this.Levels);
}

nameChange(ev:any){
  //console.log(ev.target.value);
  if(ev.target.value.length > 25){
    this.level.LevelName = this.level.LevelName.substring(0,ev.target.value.length -1);
    return false;
  }
}

descriptionChange(ev:any){
  console.log(ev.target.value);
  if(ev.target.value.length > 128){
    this.level.LevelChallenge = this.level.LevelChallenge.substring(0,ev.target.value.length -1);
    this.commonService.toastMessage("Description can't be more than 120 characters",2500,ToastMessageType.Error,ToastPlacement.Bottom);
  }
}


  actionFor = '';
  levelIndex: number;
  EditLevel(actionFor: string, levelObj?: any, index?: number) {
    this.actionFor = actionFor;
    this.levelAlertTitle = "Edit Level";
    this.levelBtnTitle = "Update";
    //this.levelPrompt = this.alertCtrl.create()
    this.level.LevelName = levelObj.LevelName;
    this.level.LevelApproval = levelObj.LevelApproval;
    this.level.LevelChallenge = levelObj.LevelChallenge;
    this.level.Points = Number(levelObj.Points);
    this.level.LevelSequence = levelObj.LevelSequence;
    this.level.ImageUrl = "";//need to comment
    //this.level.ImageUrl = "https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815.appspot.com/o/ActivityPro%2FEvents%2F-KuAlAWygfsQX9t_RqNZ1602513173377?alt=media&token=f9f3f435-a1bc-47b4-83ab-e8f50e010636";//need to comment
    //this.level.ApprovalID = "a9df9288-6b5b-455c-b1a1-f5c0e647c748"//this.selectedApproval;ApprovalDetails
    this.level.ApprovalID = levelObj.ApprovalID;
    this.level.PointsID = "cdfc32dd-aa02-433c-8756-3dbf67663252"//this.selectedPoints;
    this.selectedApproval = levelObj.ApprovalID;
    this.level.ParentclubKey = this.parentClubKey;
    this.level.Target = levelObj.Target;
    this.isShowLevelPopUp = true;
    this.levelIndex = index;
  }

  AddLevel() {
    this.levelAlertTitle = "Add Level";
    this.levelBtnTitle = "Add";
    //this.levelPrompt = this.alertCtrl.create()
    this.level.LevelName = '';
    this.level.LevelApproval = this.Approvals[0].ApprovedBy;
    this.level.LevelChallenge = '';
    this.level.Points = 0;
    this.level.Target = 0;
    this.level.ParentclubKey = this.parentClubKey;
    this.level.ImageUrl = "";//need to comment
    //this.level.ImageUrl = "https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815.appspot.com/o/ActivityPro%2FEvents%2F-KuAlAWygfsQX9t_RqNZ1602513173377?alt=media&token=f9f3f435-a1bc-47b4-83ab-e8f50e010636";//need to comment
    this.level.ApprovalID = this.Approvals[0].Id//this.selectedApproval;
    this.level.PointsID = "cdfc32dd-aa02-433c-8756-3dbf67663252"//this.selectedPoints;
    this.selectedApproval = this.Approvals[0].Id;
    this.isShowLevelPopUp = true;

  }

  onApprovalChange(){
    let approvalIndex = this.Approvals.findIndex(approval => approval.Id === this.selectedApproval);
    if(approvalIndex!=-1){
      this.level.LevelApproval = this.Approvals[approvalIndex].ApprovedBy;
      this.level.ApprovalID = this.Approvals[approvalIndex].Id//this.selectedApproval;
    }
  }

  deleteLevel(index: number) {
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
            this.Levels.splice(index, 1);
            this.indexLevels();
          }
        }
      ]
    });
    alert.present();
  }

  async addOrEditLevel() {
    if (this.validateLevel()) {
      let level: any;

      //this.level.LevelApproval = this.selectedApproval;
      if(this.levelBtnTitle.toLocaleLowerCase() != "update"){
        this.level.Points = Number(this.level.Points);
        this.level.LevelSequence = this.Levels.length + 1;//auto creating level sequence as adding
        }else{
          let levelIndex = await this.Levels.findIndex((level)=>level.LevelSequence === this.level.LevelSequence);
          if(levelIndex!=-1){
            this.Levels.splice(this.levelIndex,1);
          }
        }
        level = JSON.parse(JSON.stringify(this.level));
        this.Levels.push(level);
        // this.Levels.sort((a, b) => {
        //   return a.LevelSequence - b.LevelSequence;
        // });
        this.selectedApproval = "";
          level = {
            LevelName: "",
            LevelChallenge: "",
            LevelApproval: "",
            ImageUrl: "",
            Points: undefined,
            LevelSequence: 2,
            ApprovalID: "",
            PointsID: "",
            Target:0,
            ParentclubKey:""
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

  validateChallenge() {
    if (this.Challenge.ChallengeName == '') {
      this.commonService.toastMessage("Enter ChallengeName", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    } if (this.selectedActivity == '') {
      this.commonService.toastMessage("Please choose activity", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    } if (this.Levels.length <= 0) {
      this.commonService.toastMessage("Add at least one level", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    } else {
      return true;
    }
  }
  //Create Challenge
  createChallenge = async () => {
    if (this.validateChallenge()) {
      this.commonService.showLoader("Please wait...");
      if(this.Challenge.ChallengeType == 0) this.Challenge.ChallengeCategory=0;
      this.Challenge.FirebaseActivityId = this.selectedActivity;
      //this.Challenge.ParentClubId = "78c25502-a302-4276-9460-2114db73de03" ;//need to uncomment
      this.Challenge.ChallengsImageURL = await this.uploadImageFromSave();//need to uncomment
      //this.Challenge.ChallengsImageURL = "https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815.appspot.com/o/ActivityPro%2FEvents%2F-KuAlAWygfsQX9t_RqNZ1602513173377?alt=media&token=f9f3f435-a1bc-47b4-83ab-e8f50e010636";//need to comment
      this.Challenge.ChallengeCategory = Number(this.Challenge.ChallengeCategory);
      this.Challenge.ChallengeType = Number(this.Challenge.ChallengeType);

      this.apollo
        .mutate({
          mutation: gql`mutation ($challengeInput:ChallengeInput!){
            createChallenges(challengeInput:$challengeInput){
              Id
              ChallengeName
              ChallengsImageURL
              ParentClub{
                Id
              }
              Activity{
                Id
                ActivityCode
              }
              Levels{
                LevelName
                LevelChallenge
                LevelSequence
                Points
                ApprovalDetails{
                  ApprovedBy
                }
              }
      
            }
          }`,
          variables: { challengeInput: this.Challenge },
        }).subscribe(({ data }) => {
          this.commonService.hideLoader();
          console.log('challeges data' + data["createChallenges"]);
          //this.commonService.toastMessage("Challenge created", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
          this.createLevel(data["createChallenges"]["Id"]);
        }, (err) => {
          this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage("Challenge creation failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        })

    }
  }


  createLevel(challengeid) {
    for (let levelObj = 0; levelObj < this.Levels.length; levelObj++) {
      this.Levels[levelObj].Target = Number(this.Levels[levelObj].Target);
      delete this.Levels[levelObj].LevelApproval;// need to comment
      this.apollo
        .mutate({
          mutation: gql`
          mutation createLevels($levelInput:LevelInput!) {
            createLevels(levelInput:$levelInput){
              Id
              LevelName
              LevelChallenge
              LevelSequence
            }
          }`,
          variables: { levelInput: this.Levels[levelObj] },
        })
        .subscribe(({ data }) => {
          this.commonService.hideLoader();
          console.log('level data' + data["createLevels"]);
          //this.commonService.toastMessage("levels created", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
          this.assignLevelstoChallenges(challengeid, data["createLevels"]["Id"]);
        }, (err) => {
          this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage("levels creation failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        });
    }

  }

  assignLevelstoChallenges(challengeid, levelid) {
    this.Challenge_level.ChallengeID = challengeid;
    this.Challenge_level.LevelID = levelid;
    const assignlevelMutation =
      this.apollo
        .mutate({
          mutation: gql`
        mutation assignLevel($challengesLevelInput:ChallengesLevelInput!){
          assignLevel(challengesLevelInput:$challengesLevelInput){
            ChallengeDetails{
              ChallengeName
            }
            LevelDetails{
              LevelName
              LevelSequence
            }
          }
        }
      `,
          variables: { challengesLevelInput: this.Challenge_level },
        })
        .subscribe(({ data }) => {
          console.log('assign data' + data["assignLevel"]);
          if(!this.isToastShown){
            this.isToastShown = true;
            this.commonService.hideLoader();
            this.commonService.toastMessage("Challenge created successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
            this.commonService.updateCategory("challenge_template_list");
            this.navCtrl.pop();
          }
        }, (err) => {
          console.log(JSON.stringify(err));
          this.commonService.hideLoader();
          this.commonService.toastMessage("Challenge creation failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        });
        
        
  }






}
