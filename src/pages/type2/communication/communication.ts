import { Component } from '@angular/core';
import { ModalController,NavController,PopoverController ,AlertController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
// import { Communication_Session } from '../../modal/communication_session';

import {IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'communication-page',
  templateUrl: 'communication.html'
})

export class Type2Communication {
themeType:number ;
menus:Array<{DisplayTitle: string; 
  OriginalTitle:string;
  MobComponent: string;
  WebComponent: string; 
  MobIcon:string;
  MobLocalImage: string;
  MobCloudImage: string; 
  WebIcon:string;
  WebLocalImage: string;
  WebCloudImage:string;
  MobileAccess:boolean;
  WebAccess:boolean;
  Role: number;
  Type: number;
  Level: number}>;
communicationType: string = "session";
  constructor(public alertCtrl: AlertController,public modalCtrl: ModalController,public navCtrl: NavController,public sharedservice:SharedServices, public popoverCtrl:PopoverController) {
    this.themeType = sharedservice.getThemeType();
    this.menus = sharedservice.getMenuList();
  }
  editCommunicationModal(characterNum) {

    let modal = this.modalCtrl.create("Communication_Session", characterNum);
    modal.present();
  }
  deleteCommunication(characterNum) {

    let confirm = this.alertCtrl.create({
      title: 'Delete Communication',
      message: 'Do you want to delete the message',
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
            console.log('Agree clicked');
          }
        }
      ]
    });
    confirm.present();
  }
  
  goTo(obj){
    this.navCtrl.push(obj.component);
  }
  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }
}
 