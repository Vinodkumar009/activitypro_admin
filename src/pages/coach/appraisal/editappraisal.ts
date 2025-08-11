import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
import { FirebaseService } from '../../../services/firebase.service';

/**
 * Generated class for the EditappraisalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-editappraisal',
  templateUrl: 'editappraisal.html',
})
export class EditappraisalPage {
  parentClubKey:string = "";
  coachKey:string="";
  templateDetails:any= "";

  constructor(public toastCtrl: ToastController,public fb:FirebaseService,public navCtrl: NavController, public navParams: NavParams,public commonService:CommonService) {
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
  chkBtn():boolean{
    if(this.templateDetails.ReferedBy ==""|| this.templateDetails.ReferedBy == undefined){
      return true;
    }else{
      return false;
    }
  }
  submitBack(){
    this.update();
    this.fb.update(this.templateDetails.ReferedTemplateKey,"Performance/Coach/"+this.parentClubKey+"/"+this.templateDetails.CoachKey,{IsActive:true,Mode:1,Status:2,ReferedCoachComment:this.templateDetails.ReferedCoachComment});
    for(let i = 0 ;i< this.templateDetails.EvaluationCriteria.length ;i++){
      for(let j = 0 ; j <  this.templateDetails.EvaluationCriteria[i].Rating.length;j++){
        this.templateDetails.EvaluationCriteria[i].Rating[j].Comments = this.templateDetails.EvaluationCriteria[i].Rating[j].Comments;
        this.templateDetails.EvaluationCriteria[i].Rating[j].Rating = this.templateDetails.EvaluationCriteria[i].Rating[j].Rating;
       this.fb.update(this.templateDetails.EvaluationCriteria[i].Rating[j].Key,"Performance/Coach/"+this.parentClubKey+"/"+this.templateDetails.CoachKey+"/"+this.templateDetails.ReferedTemplateKey+"/EvaluationCriteria/"+this.templateDetails.EvaluationCriteria[i].Key+"/Rating",
       {
         Comments:this.templateDetails.EvaluationCriteria[i].Rating[j].Comments,
         Rating:this.templateDetails.EvaluationCriteria[i].Rating[j].Rating
       });
      }
    }
    this.fb.update(this.templateDetails.$key,"Performance/Coach/"+this.parentClubKey+"/"+this.coachKey,{IsActive:false});
    this.presentToast('successfully submited');
   this.navCtrl.push('AppraisalPage');

  }
  update(){
  
    this.fb.update(this.templateDetails.$key,"Performance/Coach/"+this.parentClubKey+"/"+this.coachKey,{AveragePerformance:this.templateDetails.AveragePerformance,Summary:this.templateDetails.Summary,ReferedCoachComment:this.templateDetails.ReferedCoachComment});
    for(let i= 0 ; i < this.templateDetails.EvaluationCriteria.length ;i++){
      for(let j = 0; j < this.templateDetails.EvaluationCriteria[i].Rating.length ;j++){
        this.fb.update(this.templateDetails.EvaluationCriteria[i].Rating[j].Key,"Performance/Coach/"+this.parentClubKey+"/"+this.coachKey+"/"+this.templateDetails.$key+"/EvaluationCriteria/"+this.templateDetails.EvaluationCriteria[i].Key+"/Rating",
        {
          Comments:this.templateDetails.EvaluationCriteria[i].Rating[j].Comments,
          Rating:this.templateDetails.EvaluationCriteria[i].Rating[j].Rating
        });
      }
    }
  
    this.presentToast('successfully updated');
    this.navCtrl.push('AppraisalPage');
  }
  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message:msg,
      duration: 3000
    });
    toast.present();
  }
}
