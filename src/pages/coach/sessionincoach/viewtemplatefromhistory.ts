import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
//import { Mode } from '../../../model/coachTemplate';
import { SharedServices } from '../../services/sharedservice';
import { Mode } from '../../Model/coachTemplate';

/**
 * Generated class for the ViewtemplatefromhistoryPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-viewtemplatefromhistory',
  templateUrl: 'viewtemplatefromhistory.html',
})
export class ViewtemplatefromhistoryPage {
sessionInfo:any = "";
memberInfo:any = "";
templateInfo:any = "";
evaluationCriteria:any = "";
themeType: number;
dataRating:any = [];
m = new Mode();
rateNum:any;
  constructor(public navCtrl: NavController, public navParams: NavParams,public commonService:CommonService,public sharedservice: SharedServices, public popoverCtrl: PopoverController) {
  this.sessionInfo = this.navParams.get('sessionDetails');
  this.themeType = sharedservice.getThemeType();
  this.memberInfo = this.navParams.get('memberDetails');
  this.templateInfo = this.navParams.get('templateDetails');
  this.templateInfo.EvaluationCriteria = this.commonService.convertFbObjectToArray(this.templateInfo.EvaluationCriteria);
  for(let i = 0 ; i < this.templateInfo.EvaluationCriteria.length ;i++){
    this.dataRating.push(this.commonService.convertFbObjectToArray(this.templateInfo.EvaluationCriteria[i].Rating));
  }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ViewtemplatefromhistoryPage');
  }
  onModelChange(event){
    this.rateNum=event;
  }
  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }
  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }
}
