
import { Component } from '@angular/core';
import { LoadingController, AlertController, NavParams, ToastController, NavController, Platform } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
import { IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import { ModuleTypes } from '../../../shared/constants/module.constants';
import gql from "graphql-tag";
import { GraphqlService } from '../../../services/graphql.service';


@IonicPage()
@Component({
  selector: 'notificationsession-page',
  templateUrl: 'notificationsession.html'
})

export class Type2NotificationSession {
  themeType: number;
  isAndroid: boolean = false;
  parentClubKey: any;
  //notificationObj = { CreatedTime: "", Message: '', SendTo: '', SendBy: '', ComposeOn: '', Purpose: '', sendByRole: "", Status: "Unread", SessionName: '' };
  sendTo = [];
  session: any;
  mlist = [];
  selectedClub: any;
  loading: any;
  deviceTokens = [];
  notification_input = {
      parentClubId:"" ,
      userIds: [],
      heading: "",
      message: "",
      moduleId: ModuleTypes.TERMSESSION
  }

  constructor(
    public commonService: CommonService, 
    public loadingCtrl: LoadingController,
     public alertCtrl: AlertController, 
     public navParams: NavParams,
      public fb: FirebaseService,  
      public navCtrl: NavController, 
      public sharedservice: SharedServices, 
      platform: Platform, 
      public popoverCtrl: PopoverController,
      private graphqlService: GraphqlService
    ) {

    this.themeType = sharedservice.getThemeType();
    this.isAndroid = platform.is('android');

    const user_ids = navParams.get('users');
    this.notification_input.moduleId = navParams.get('type');
    this.notification_input.heading = navParams.get('heading');
    this.notification_input.parentClubId = this.sharedservice.getPostgreParentClubId();
    //this.session = navParams.get('SessionDetails');
    const valid_user_ids = user_ids.filter(item => item !== undefined && item !== null && item !== "");
    if(valid_user_ids.length > 0){
      this.notification_input.userIds = Array.from(new Set(valid_user_ids)) //this removes duplicate user Ids
    }
  
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
    //let message = this.session.navigateFrom == undefined ? "Are you sure you want to send the notification to all the members of the session?":"Are you sure you want to send the notification to all the members of the event?"
    let confirm = this.alertCtrl.create({
      title: 'Notification Alert',
      message: 'Are you sure you want to send the notification to all the members?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.notify()
          }
        }
      ]
    });
    confirm.present();
  }
  
  notify() {
      if(this.notification_input.message === ""){
        this.commonService.toastMessage("Please enter the notification message",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        return false;
      }
      const notify_mutation = gql`
      mutation notifyGroupUsers($notifyInput: GroupUserNotify!) {
        notifyGroupUsers(input: $notifyInput)
      }` 

      const notifiy_variable = { notifyInput: this.notification_input };

      this.graphqlService.mutate(notify_mutation,notifiy_variable,0).subscribe((response)=>{
          const message = "Notification sent successfully.";
          this.commonService.toastMessage(message, 2500,ToastMessageType.Success,ToastPlacement.Bottom);
          this.navCtrl.pop();
      },(err)=>{
          this.commonService.toastMessage("Notification sent failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
      });
  }
}


