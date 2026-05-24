import { Component } from '@angular/core';
import { ActionSheetController, AlertController, IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../../services/firebase.service';
import { CommonService, ToastPlacement, ToastMessageType } from '../../../../services/common.service';

/**
 * Generated class for the ThemePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-appsetup',
  templateUrl: 'appsetup.html',
})
export class AppSetup {

  ParentClubKey: string = "";
  timelineModalItems = [
    {
      Name: 'Challenges',
      DisplayName: 'Challenges',
      ImageURL: 'https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815.appspot.com/o/Apkids%2FMenu%2FChallenge.png?alt=media&token=a6d3b05e-300a-4266-a544-71ab36ff3b43',
      Routing: '/challengesScreen',
      IsEnable: true,
      IsActive: true,
      CreatedDate: '',
      UpdatedDate: '',
      Sequence: 1,
      CreatedBy: '',
      IsApplicableVisibleFlag: true
    },
    {
      Name: 'Goals',
      DisplayName: 'Goals',
      ImageURL: 'https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815.appspot.com/o/Apkids%2FMenu%2FGoals.png?alt=media&token=6b840f00-b53d-4532-b0f5-92506f14179d',
      Routing: '/goalsScreen',
      IsEnable: false,
      IsActive: true,
      CreatedDate: '',
      UpdatedDate: '',
      Sequence: 2,
      CreatedBy: '',
      UpdatedBy: '',
      IsApplicableVisibleFlag: true
    },
    {
      Name: 'Videos',
      DisplayName: 'Videos',
      ImageURL: 'https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815.appspot.com/o/Apkids%2FMenu%2Fvideo.png?alt=media&token=56f70060-a39a-4e90-b20a-c9b55e5b7cb7',
      Routing: '/videosScreen',
      IsEnable: true,
      IsActive: true,
      CreatedDate: '',
      UpdatedDate: '',
      Sequence: 3,
      CreatedBy: '',
      UpdatedBy: '',
      IsApplicableVisibleFlag: true
    },
    {
      Name: 'News and Photos',
      DisplayName: 'News and Photos',
      ImageURL: 'https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815.appspot.com/o/Apkids%2FMenu%2Fnewspaper.png?alt=media&token=f6715c06-1367-4d8e-963b-764eeed40f3f',
      Routing: '/newsAndPhotosScreen',
      IsEnable: true,
      IsActive: true,
      CreatedDate: '',
      UpdatedDate: '',
      Sequence: 4,
      CreatedBy: '',
      UpdatedBy: '',
      IsApplicableVisibleFlag: true
    },
    {
      Name: 'Quiz',
      DisplayName: 'Quiz',
      ImageURL: 'https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815.appspot.com/o/Apkids%2FMenu%2FQuiz.png?alt=media&token=ca299301-e40d-481b-8ea4-8ad528cb88b5',
      Routing: '/quizScreen',
      IsEnable: true,
      IsActive: true,
      CreatedDate: '',
      UpdatedDate: '',
      Sequence: 5,
      CreatedBy: '',
      UpdatedBy: '',
      IsApplicableVisibleFlag: true
    },
    {
      Name: 'World Sports',
      DisplayName: 'World Sports',
      ImageURL: 'https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815.appspot.com/o/Apkids%2FMenu%2FSports.png?alt=media&token=de65ce82-c801-42ba-af0f-00ade3439317',
      Routing: '/worldSportsScreen',
      IsEnable: true,
      IsActive: true,
      CreatedDate: '',
      UpdatedDate: '',
      Sequence: 6,
      CreatedBy: '',
      UpdatedBy: '',
      IsApplicableVisibleFlag: true
    },
    {
      Name: 'Group Sessions',
      DisplayName: 'Group Sessions',
      ImageURL: 'https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815.appspot.com/o/Apkids%2FMenu%2Fsession.png?alt=media&token=ef8d3dca-f4ff-421b-a38c-67a740642f27',
      Routing: '/groupSessionScreen',
      IsEnable: true,
      IsActive: true,
      CreatedDate: '',
      UpdatedDate: '',
      Sequence: 7,
      CreatedBy: '',
      UpdatedBy: '',
      IsApplicableVisibleFlag: true
    },
    {
      Name: 'Leaderboard',
      DisplayName: 'Leaderboard',
      ImageURL: 'https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815.appspot.com/o/Apkids%2FMenu%2FLeaderboard.png?alt=media&token=73bc1208-5348-45c3-8237-fc935526b24c',
      Routing: '/leaderboardScreen',
      IsEnable: true,
      IsActive: true,
      CreatedDate: '',
      UpdatedDate: '',
      Sequence: 8,
      CreatedBy: '',
      UpdatedBy: '',
      IsApplicableVisibleFlag: true
    },
    {
      Name: 'Tips',
      DisplayName: 'Tips',
      ImageURL: 'https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815.appspot.com/o/Apkids%2FMenu%2Ftips.png?alt=media&token=581bd0da-7e75-4740-9577-96970a7554c6',
      Routing: '/tipsScreen',
      IsEnable: false,
      IsActive: true,
      CreatedDate: '',
      UpdatedDate: '',
      Sequence: 9,
      CreatedBy: '',
      UpdatedBy: '',
      IsApplicableVisibleFlag: true
    },
    {
      Name: '',
      DisplayName: '',
      ImageURL: '',
      Routing: '',
      IsEnable: false,
      IsActive: true,
      CreatedDate: '',
      UpdatedDate: '',
      Sequence: 10,
      CreatedBy: '',
      UpdatedBy: '',
      IsApplicableVisibleFlag: true
    },
  ];

  loginas = 'System'
  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public actionSheetCtrl: ActionSheetController, public navParams: NavParams, public storage: Storage, public fb: FirebaseService,
    public commonService: CommonService) {
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      this.ParentClubKey = val.UserInfo[0].ParentClubKey;
      this.saveSetup()
    })
  }


  saveSetup() {
    let isMenuPresent = false

    //this.fb.deleteFromFb(`ApKids/Menu/${this.ParentClubKey}`)
    let y = this.fb.getAll(`ApKids/Menu/${this.ParentClubKey}`).subscribe(data => {
      console.log("getAll", data)
      if (data.length > 0) {
        isMenuPresent = true

        this.timelineModalItems = data.filter(item => item.Name != "")
      }
      y.unsubscribe()
      if (!isMenuPresent) {
        this.timelineModalItems.forEach(menu => {
          menu.CreatedBy = this.loginas
          menu.UpdatedBy = this.loginas
          menu.UpdatedDate = new Date().toISOString()
          menu.CreatedDate = new Date().toISOString()
          this.fb.saveReturningKey(`ApKids/Menu/${this.ParentClubKey}`, menu)
        })
      }
    })
  }

  editSetup() {

  }

  action(item) {
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Edit Menu Name',
          handler: () => {
            this.saveText(item)
          }
        },
        {
          text: 'Edit Sequence',
          handler: () => {
            this.savesequence(item)
          }
        },
        {
          text: 'Edit image',
          handler: () => {
            this.image(item)
          }
        }
      ]
    })
    actionSheet.present()
  }
  image(tabItem: any) {
    let prompt = this.alertCtrl.create({
      subTitle: tabItem.DisplayName,
      message: "Modify menu details!",
      inputs: [
        {
          name: 'ImageURL',
          placeholder: 'Menu Image',
          value: tabItem.ImageURL
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {


            if (data.ImageURL) {
              this.fb.update(tabItem.$key, `ApKids/Menu/${this.ParentClubKey}`, { ImageURL: data.ImageURL });
              this.saveSetup()
            }
          }
        }
      ]
    });
    prompt.present();
  }

  saveText(tabItem) {

    let prompt = this.alertCtrl.create({
      subTitle: tabItem.DisplayName,
      message: "Modify menu details!",
      inputs: [
        {
          name: 'MenuName',
          placeholder: 'Menu Name',
          value: tabItem.DisplayName
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {


            if (data.MenuName) {
              this.fb.update(tabItem.$key, `ApKids/Menu/${this.ParentClubKey}`, { DisplayName: data.MenuName });
              this.saveSetup()
            }
          }
        }
      ]
    });
    prompt.present();
  }

  savesequence(tabItem) {

    let prompt = this.alertCtrl.create({
      subTitle: tabItem.DisplayName,
      message: "Modify sequence no.",
      inputs: [
        {
          name: 'Sequence',
          placeholder: 'Sequence',
          value: tabItem.Sequence
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {


            if (data.Sequence) {
              this.fb.update(tabItem.$key, `ApKids/Menu/${this.ParentClubKey}`, { Sequence: data.Sequence });
              this.saveSetup()
            }
          }
        }
      ]
    });
    prompt.present();
  }

  disableMenu(menu) {
    this.fb.update(menu.$key, `ApKids/Menu/${this.ParentClubKey}`, { IsEnable: menu.IsEnable });
    this.saveSetup()
  }

  addmenu(){
    this.fb.update('-MRu6Fea9KMKo-kaRJD_', `ApKids/Menu/${this.ParentClubKey}`, { IsEnable: true,
      Name: 'Tips',
      DisplayName: 'Tips',
      ImageURL: 'https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815.appspot.com/o/Apkids%2FMenu%2Ftips.png?alt=media&token=581bd0da-7e75-4740-9577-96970a7554c6',
      Routing: '/tipsScreen',
     } )
  }

}