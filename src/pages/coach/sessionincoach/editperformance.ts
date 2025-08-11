import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
import { SharedServices } from '../../services/sharedservice';
import { FirebaseService } from '../../../services/firebase.service';
import { Rate } from '../../Model/coachTemplate';

/**
 * Generated class for the EditperformancePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-editperformance',
  templateUrl: 'editperformance.html',
})
export class EditperformancePage {
templateInfo:any = [];
sessionDetails:any = [];
memberDetails:any = [];
dataRating:any = [];
rate = new Rate();
  constructor(public navCtrl: NavController, public navParams: NavParams,public commonService:CommonService,public sharedservice: SharedServices, public popoverCtrl: PopoverController,public fb:FirebaseService) {
   
    this.templateInfo  = this.navParams.get("templateDetails");
    this.sessionDetails = this.navParams.get("sessionDetails");
    this.memberDetails = this.navParams.get("memberDetails");
    if(this.templateInfo.EvaluationCriteria.length == undefined){
    this.templateInfo.EvaluationCriteria = this.commonService.convertFbObjectToArray(this.templateInfo.EvaluationCriteria);
  };
      for(let i = 0 ; i < this.templateInfo.EvaluationCriteria.length ;i++){
        if(this.templateInfo.EvaluationCriteria[i].Rating.length == undefined){
          this.templateInfo.EvaluationCriteria[i].Rating = this.commonService.convertFbObjectToArray(this.templateInfo.EvaluationCriteria[i].Rating);
        }
        
      this.dataRating.push( this.templateInfo.EvaluationCriteria[i].Rating);
    }
    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditperformancePage');
   
  }
  ionViewWillLeave() {
   
  }
  update(){
    console.log(this.templateInfo);
    console.log(this.dataRating);
    this.fb.update(this.templateInfo.$key,'Performance/Coach/'+this.templateInfo.ParentClubKey+"/"+this.templateInfo.CoachKey,{AveragePerformance:this.templateInfo.AveragePerformance,Summary:this.templateInfo.Summary,StartDate:this.templateInfo.StartDate,EndDate:this.templateInfo.EndDate})
    this.rate = new Rate();
    for(let i = 0; i < this.dataRating.length ;i++){
      this.rate.Rating = this.dataRating[i][0].Rating;
      this.rate.RatingDoneBy = "Coach";
      this.rate.RaterKey = this.dataRating[i][0].RaterKey;
      this.rate.RaterName = this.dataRating[i][0].RaterName;
      this.rate.Comments = this.dataRating[i][0].Comments;
      this.fb.update(this.dataRating[i][0].Key,'Performance/Coach/'+this.templateInfo.ParentClubKey+"/"+this.templateInfo.CoachKey+"/"+this.templateInfo.$key+"/EvaluationCriteria/"+this.templateInfo.EvaluationCriteria[i].Key+"/Rating",this.rate);
    }
    this.navCtrl.push("CoachratinghistoryPage",{
      sessionDetails:this.sessionDetails,
      member:this.memberDetails
    });
  }
}
