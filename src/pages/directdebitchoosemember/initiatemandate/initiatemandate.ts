import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FirebaseService } from '../../../services/firebase.service';

/**
 * Generated class for the InitiatemandatePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-initiatemandate',
  templateUrl: 'initiatemandate.html',
})
export class InitiatemandatePage {
  memberInfo:any = {};
  mandates:Array<any> = [];
  constructor(public navCtrl: NavController, public navParams: NavParams,public fb:FirebaseService) {
  }

  ionViewDidLoad() {
    this.memberInfo = this.navParams.get('memberInfo');
    console.log('ionViewDidLoad InitiatemandatePage');
    this.getMandates();
  }
  addMandate(){
    this.navCtrl.push('CreatemandatesPage',{
      memberIno:this.memberInfo
    })
  }
  getMandates(){
    this.fb.getAllWithQuery("GoCardLess/Mandates/"+this.memberInfo.ParentClubKey+"/"+this.memberInfo.ClubKey+"/"+this.memberInfo.$key,{orderByChild:'IsActive',equalTo:true}).subscribe((data)=>{
      this.mandates = data;
    })
  }
}
