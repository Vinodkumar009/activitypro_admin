import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ViewController } from 'ionic-angular';

/**
 * Generated class for the TextareamodalcontrollerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-textareamodalcontroller',
  templateUrl: 'textareamodalcontroller.html',
})
export class TextareamodalcontrollerPage {

  description="";
  callback:any;
  constructor(
    public platform: Platform,
    public params: NavParams,
    public viewCtrl: ViewController
  ) {
    this.callback = this.params.get('callback');
    console.log(this.callback);
    this.description = this.params.get('Description');
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
  done(){
    this.callback(this.description).then( () => {  this.viewCtrl.dismiss(); });
  }
  
}
