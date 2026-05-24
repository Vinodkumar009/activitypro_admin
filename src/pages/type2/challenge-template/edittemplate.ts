import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ModalController, LoadingController } from 'ionic-angular';
import { FirebaseService } from '../../../services/firebase.service';
import { SharedServices } from '../../services/sharedservice';
import { CommonService,ToastMessageType,ToastPlacement } from '../../../services/common.service';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the EdittemplatePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-edittemplate',
  templateUrl: 'edittemplate.html',
})
export class EdittemplatePage {
  parentClubKey:string = "";
  activityList = [];
  selectedActivity = "";
  Template:any;
  //Template = {TemplateName:"" , ActivityKey:"", Description:'', AgeGroupStart:0, AgeGroupEnd:0, Challenges:Challenge};
  //Challenges:Challenge[];
  //Levels:Level[];
    
  constructor(public navCtrl: NavController, public navParams: NavParams, private alertCtrl: AlertController, public modalCtrl: ModalController, public commonService: CommonService, public loadingCtrl: LoadingController, public storage: Storage, public fb: FirebaseService, public sharedservice: SharedServices) {
    this.Template = this.navParams.get("template");
    if(this.Template.Challenge.length > 0){
      this.Template.Challenge.forEach((challenge)=>{
        challenge["Points"] = 0;
        if(challenge.Levels && challenge.Levels.length > 0){
          challenge.Levels.forEach((level)=>{
            challenge["Points"] += level.Points;
          })
        }
      })
    }
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        this.getActivityList();
      }
    })
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad EdittemplatePage');
  }

  //getting activities
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
            if (flag && ActivityList[k].Key && ActivityList[k].Key!=undefined && ActivityList[k].ActivityName) {
              this.activityList.push(ActivityList[k]);
              this.selectedActivity = "";
              this.selectedActivity = this.activityList[0].Key;
              flag = false;
            }
          }

        }
      }
    });
    
  }


  AddChallenge(){//Challengeslist
    let profileModal = this.modalCtrl.create("Challengeslist",{challenges:this.Template.Challenges});
    profileModal.onDidDismiss(data => {
      if(data.challenges && data.challenges.length > 0){
        this.Template.Challenge = [...this.Template.Challenge, ...data.challenges];
        console.log(this.Template.Challenge);
      }
    });
    profileModal.present();
  }

  deleteChallenge(index: number) {
    let alert = this.alertCtrl.create({
      title: 'Challenge Delete',
      message: 'Are you sure, You want to delete challenge ?',
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
            this.Template.Challenge.splice(index, 1);
          }
        }
      ]
    });
    alert.present();
  }


}

export class Challenge{
  ChallengeName:string;
  Description:string;
  ChallengsImageURL:string;
  ActivityKey:string;
  Levels:Level[]
} 

export class Level{
  LevelName:string;
  LevelChallenge:number;
  ImageUrl:string;
  Points:number;
  ApprovedBy:Approval;
}
export class Approval{
  ApprovedBy:string;
}



