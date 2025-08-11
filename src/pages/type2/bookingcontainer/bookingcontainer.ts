import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, Events, FabContainer, } from 'ionic-angular';
import { TSMap } from 'typescript-map';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonService } from '../../../services/common.service';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the BookingcontainerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-bookingcontainer',
  templateUrl: 'bookingcontainer.html',
})
export class BookingcontainerPage {
  @ViewChild('fab')fab : FabContainer;
  activeIndex = 0;
  isSelected;
  headerMap: TSMap<Number, String> = new TSMap<Number, String>();

  constructor(public navCtrl: NavController, public events: Events , public navParams: NavParams, public fb: FirebaseService, public storage: Storage, public commonService: CommonService) {
    this.isSelected = false
  }

  ionViewDidLoad() {
    
    console.log('ionViewDidLoad BookingcontainerPage');
    
  }
  // slideChanged() {
  //   if (this.slides.getActiveIndex() < this.slides.length()) {
  //     this.activeIndex = this.slides.getActiveIndex();
  //   }
  // }

  ionViewWillEnter(){
    this.fab.close();
  
  }
  ionViewDidEnter(){
    
  }


  callNewViewCourt(){
    // this.events.publish('updateScreen');
    // this.isSelected=!this.isSelected 
  }
   
  GotoSlide(SlideIndex: number) {
    //this.slides.slideTo(SlideIndex);
    switch (SlideIndex) {
      case 1:
        this.navCtrl.push("RecuringbookingPage");
        break;
      case 2:
        this.navCtrl.push("BookingPage");
        break;
    }
  }

  changeIsSelect(){
    this.isSelected = !this.isSelected
  }   
  // addRecuringBooking() {
  //   this.navCtrl.push("AddrecuringbookingPage");
  // }
}
