import { Component } from '@angular/core';
import { LoadingController, AlertController, NavParams, ToastController, NavController, Platform, ActionSheetController, ModalController } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
// import { PopoverPage } from '../../popover/popover';
import { Storage } from '@ionic/storage';
import * as $ from 'jquery';
import { Http, Headers, RequestOptions } from '@angular/http';
import { IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { FirebaseService } from '../../../../services/firebase.service';
import { SharedServices } from '../../../services/sharedservice';
import { HttpClient } from '@angular/common/http';
import { GetPlayerModel, GetStaffModel } from '../models/team.model';
import { HttpLink } from 'apollo-angular-link-http';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
/**
 * Generated class for the StaffnotificationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-staffnotification',
  templateUrl: 'staffnotification.html',
})
export class StaffnotificationPage {
  mlist: GetStaffModel;
  notificationObj = { CreatedTime: "", Message: '', SendTo: '', SendBy: '', ComposeOn: '', Purpose: '', sendByRole: "", Status: "Unread"};
  parentClubKey:any;
  popoverCtrl: any;

  constructor(public navCtrl: NavController,
     public navParams: NavParams,
     private apollo: Apollo,
     private httpLink: HttpLink,
     public actionSheetCtrl: ActionSheetController,
     public loadingCtrl: LoadingController,
     public storage: Storage,
     public platform: Platform,
     public fb: FirebaseService,
     public alertCtrl: AlertController,
     public commonService: CommonService,
     private toastCtrl: ToastController,
     public sharedservice: SharedServices,
     public modalCtrl: ModalController,
     popoverCtrl:PopoverController) {
      this.mlist=this.navParams.get("staff");
      console.log('data for notification:',this.mlist);
      this.notificationObj.Message="Hi "+this.mlist.StaffDetail.name+" ";

      this.parentClubKey = navParams.get('ParentClubKey');
      console.log("Parent Club Id is:",typeof this.parentClubKey)
      
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StaffnotificationPage');
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }

  cancel() {
    this.navCtrl.pop();
  }

  sendNotification() {
  
    let alert = this.alertCtrl.create({
      subTitle: 'Send notification',
      message: 'Are you sure want to send notification ?',
      buttons: [
        {
          text: "Don't send",
          role: 'cancel',
          handler: () => {

          }
        },
        {
          text: 'Send',
          handler: () => {
            this.notify();
          }
        }
      ]
    });
    alert.present();
  } 


  showToast(m: string, d: number) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: d,
      position: 'bottom'
    });
    toast.present();
  }


  notify(){
    const notifyUser = gql`
    query notifyUser($parentClub: String!, $heading:String!, $message:String! , $userFirebaseId:String!) {
      notifyUser(parentClub:$parentClub, heading:$heading ,message:$message, userFirebaseId:$userFirebaseId) 
       
   
      }

  `;
  this.apollo
    .query({
      query: notifyUser,
      fetchPolicy: "network-only",
      variables: {
        parentClub:this.parentClubKey,
        heading:"",
        message:this.notificationObj.Message,
        userFirebaseId:"-MP3ld83zU7MCJjU0JQy"


      },
    })
    .subscribe(({ data }) => {
      this.commonService.hideLoader();
        this.commonService.toastMessage(
          "Notification Send Successfully",
          2500,
          ToastMessageType.Success,
          ToastPlacement.Bottom
        );
        console.log("Notification Data:" +data[notifyUser]);

        this.navCtrl.pop();


     
    });
  (err) => {
    // this.commonService.hideLoader();
    console.log(JSON.stringify(err));
    this.commonService.toastMessage(
      "Notification failed",
      2500,
      ToastMessageType.Error,
      ToastPlacement.Bottom
    );
  };
  }
}
