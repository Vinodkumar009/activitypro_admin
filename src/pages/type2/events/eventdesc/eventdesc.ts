import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ViewController } from 'ionic-angular';


/**
 * Generated class for the EventdescPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-eventdesc',
  templateUrl: 'eventdesc.html',
})
export class EventdescPage {
  description:string = "";
  can_update:boolean = false;
  constructor(
    public platform: Platform,
    public params: NavParams,
    public viewCtrl: ViewController
  ) {
    //this.callback = this.params.get('callback');
    this.description = this.params.get('Description');
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  done(){
    this.can_update = true;
    this.viewCtrl.dismiss({description:this.description,can_update:this.can_update});
  }

  

}
