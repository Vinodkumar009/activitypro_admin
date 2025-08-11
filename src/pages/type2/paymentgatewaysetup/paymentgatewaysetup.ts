import { Component , Input, Output, EventEmitter} from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the PaymentgatewaysetupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-paymentgatewaysetup',
  templateUrl: 'paymentgatewaysetup.html',
})
export class PaymentgatewaysetupPage {

  text: string;

  @Input("InstructTxt") InstructTxt;

  @Output() navigate = new EventEmitter();
  @Output() skip = new EventEmitter();

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    //this.text = 'Hello World';
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PaymentgatewaysetupPage');
  }

  ngAfterViewInit(){
    setTimeout(()=>{
      this.text = this.InstructTxt;
    },300);
   }
 
   navigateToPayment(){
    this.navigate.emit();
   }

   skipPayment(){
     console.log("skip clicked");
    this.skip.emit();
   }
   


}
