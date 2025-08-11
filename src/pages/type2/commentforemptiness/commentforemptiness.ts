import { Component, Input } from '@angular/core';
import { NavController, PopoverController,AlertController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
// import { Type2AddVenue } from '../venue/addvenue';
// import { Dashboard } from './../../dashboard/dashboard';


import {IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'page-commentforemptiness',
  templateUrl: 'commentforemptiness.html'
})

export class CommentForEmptinessPage {
 
  @Input() customTitle:string; 

  themeType: number;
  clubs: any;
  x: any;
  constructor(public alertCtrl: AlertController,storage: Storage, public navCtrl: NavController, public sharedservice: SharedServices, public fb: FirebaseService, public popoverCtrl: PopoverController) {
    this.themeType = sharedservice.getThemeType();
  }

  public getData(){
    return this.customTitle
  }

}
