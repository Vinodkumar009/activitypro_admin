import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the AppuiconfigPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-appuiconfig',
  templateUrl: 'appuiconfig.html',
})
export class AppuIconfig{

  configSetupList: Array<any>;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.configSetupList = [

      {
        DisplayName: 'App Colour',
        Description:'Setup app header, tab text colour.', 
        Component:"Theme",
        ImageUrl: "assets/images/pantone.svg"
      },
      
      { DisplayName: 'Home Page Image', Description:'Choose app home image', Component:"Appimage",ImageUrl: "assets/images/upload.svg" },
      { DisplayName: 'AP Plus Menu', Description:'Setup AP Plus app menu', Component:"AppSetup",ImageUrl: "assets/imgs/menu.png" },
     // { DisplayName: 'Tips', Description:'Tips setup', Component:"TipsPage",ImageUrl: "assets/images/upload.svg" },
      // { DisplayName: 'Court Booking', Description:'Court Booking', ImageUrl: "assets/images/tennis-court.svg" },
      // { DisplayName: 'Events', Description:'Events', ImageUrl: "https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815/o/ActivityPro%2FActivityIcons%2Feventcalendar.svg?alt=media&token=294cf1f3-bb52-4b16-bfe5-64b45d9971f4" },
    ]

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AppuiconfigPage');
  }

  addSetup(setup) {
    // this.navCtrl.push('StripeconnectsetuplistPage', {
    //   setupDetails: setup
    // })
    this.navCtrl.push(setup.Component);
  }

}
