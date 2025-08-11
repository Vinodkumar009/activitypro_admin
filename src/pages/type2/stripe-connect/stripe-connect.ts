import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { ModuleTypes } from '../../../shared/constants/module.constants';

/**
 * Generated class for the StripeConnectPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-stripe-connect',
  templateUrl: 'stripe-connect.html',
})
export class StripeConnectPage {
  stripeAccountSetupList: Array<any>;

  SelectedAccountSetup: string = '';

  constructor(public navCtrl: NavController,  public alertCtrl: AlertController,public navParams: NavParams) {
  //  this.showalert()
    this.stripeAccountSetupList = [

      {
        SetupName: 'Session Management',
        DisplayName:'Group Session',    
        VenueList: true,
        ImageUrl: "https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815/o/ActivityPro%2FActivityIcons%2Fgroupsession.svg?alt=media&token=1f19b4aa-5051-4131-918d-4fa17091a7f9",
        type:ModuleTypes.TERMSESSION
      },
      { SetupName: 'Membership', DisplayName:'Membership', ImageUrl: "https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815/o/ActivityPro%2FActivityIcons%2Fmembership.svg?alt=media&token=824fa9dd-a964-4eb9-a8f3-7ab8864c0a48",type:ModuleTypes.MEMBERSHIP },
      { SetupName: 'Court Booking', DisplayName:'Facility Booking', ImageUrl: "assets/images/tennis-court.svg",type:ModuleTypes.COURTBOOKING },
      { SetupName: 'Events', DisplayName:'Events', ImageUrl: "https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815/o/ActivityPro%2FActivityIcons%2Feventcalendar.svg?alt=media&token=294cf1f3-bb52-4b16-bfe5-64b45d9971f4",type:ModuleTypes.EVENTS }
      // { SetupName: 'APKIDS', DisplayName:'AP Pro+', ImageUrl: "assets/imgs/APPro.png" },
    ]

  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad StripeConnectPage');
    this.SelectedAccountSetup = ''
  }
  // showalert(){
  //   let alert = this.alertCtrl.create({
  //     title: 'Setup in Progress',
  //     message:'We are still setting this up. Thank you for your patience.',
  //     buttons: [
  //       {
  //         text: 'OK',
  //         handler: () => {
  //          // this.navCtrl.pop()
  //         }   
  //       },
    
  //     ]
  //   });
  //   alert.present();
  // }

  addSetup(setup) {
    this.navCtrl.push('StripeconnectsetuplistPage', {
      setupDetails: setup
    })
  }
}
