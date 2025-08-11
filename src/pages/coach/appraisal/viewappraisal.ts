import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';
import { Mode } from '../../Model/coachTemplate';
import { SharedServices } from '../../services/sharedservice';
import { CommonService } from '../../../services/common.service';
import { FirebaseService } from '../../../services/firebase.service';

/**
 * Generated class for the ViewappraisalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-viewappraisal',
  templateUrl: 'viewappraisal.html',
})
export class ViewappraisalPage {
  parentClubKey:string = "";
  coachKey:string="";
  templateDetails:any= "";

  constructor(public fb:FirebaseService,public navCtrl: NavController, public navParams: NavParams,public commonService:CommonService) {
    this.parentClubKey = this.navParams.get('parentClubKey');
    this.coachKey = this.navParams.get('coachKey');
    this.templateDetails = this.navParams.get('tempalteDetails');
    if(this.templateDetails.EvaluationCriteria.length == undefined){
      this.templateDetails.EvaluationCriteria = this.commonService.convertFbObjectToArray(this.templateDetails.EvaluationCriteria);
    }
    for(let i = 0 ; i < this.templateDetails.EvaluationCriteria.length ;i++){
      if(this.templateDetails.EvaluationCriteria[i].Rating.length == undefined){
        this.templateDetails.EvaluationCriteria[i].Rating = this.commonService.convertFbObjectToArray( this.templateDetails.EvaluationCriteria[i].Rating);
      }
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditappraisalPage');
  }
}
