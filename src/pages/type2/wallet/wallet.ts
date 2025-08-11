import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, AlertController, LoadingController} from 'ionic-angular';
import moment from 'moment';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the FilterbookingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-wallet',
  templateUrl: 'wallet.html',
})
export class WalletPage {

  constructor(public navCtrl: NavController, 
    public storage: Storage, public loadingCtrl: LoadingController,  public navParams: NavParams) {
    this.navCtrl.push('LoyaltySetupPage')
  }

  ionViewDidLoad() {
   
  }

  addSetup(){
    this.navCtrl.push('LoyaltySetupPage')
  }
}
