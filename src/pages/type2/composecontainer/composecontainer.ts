import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides } from 'ionic-angular';
import { ComposenotificationPage } from './composenotification/composenotification';
import { ComposeemialPage } from './composeemial/composeemial';

/**
 * Generated class for the ComposecontainerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-composecontainer',
  templateUrl: 'composecontainer.html',
})
export class ComposecontainerPage {
  @ViewChild(Slides) slides: Slides;
  @ViewChild("notification")public notificationOnj:ComposenotificationPage;
  @ViewChild("email")public emailObj:ComposeemialPage;
  header:String = "Notification"
  headerType:number = 1;
  IsSendNotification:any = {
    value:false
  };
  IsSendEmail:boolean = false;
   x = { h:1}
  
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ComposecontainerPage');
    let startslide = this.navParams.get("slideIndex");
    setTimeout(() => {
      this.slides.slideTo(startslide);
    },500);
  }
  slideChanged(){
    let index = this.slides.getActiveIndex();
    console.log(index);
    switch(index){
      case 0:{
        this.header = "Notification"
        this.headerType = 1;
        break;
      }
      case 1:{
        this.header = "Email"
        this.headerType = 2;
        break;
      }
    }
  }
  send(){
    let index = this.slides.getActiveIndex();
    console.log(index);
    switch(index){
      case 0:{
       this.notificationOnj.sendNotification();
       break;
      }
      case 1:{
        this.emailObj.sendEmail();
      }
    }
  }
}
