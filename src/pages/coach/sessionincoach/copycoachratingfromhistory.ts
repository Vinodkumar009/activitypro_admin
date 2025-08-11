import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, PopoverController } from 'ionic-angular';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonService } from '../../../services/common.service';
import { TemplateDetails, Visible } from '../../Model/ActivityTemplate';
import { CoachTemplate, Rate } from '../../Model/coachTemplate';
import { SharedServices } from '../../services/sharedservice';

/**
 * Generated class for the CopycoachratingfromhistoryPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-copycoachratingfromhistory',
  templateUrl: 'copycoachratingfromhistory.html',
})
export class CopycoachratingfromhistoryPage {
  sessionInfo:any="";
  memberInfo:any = "";
  templateInfo:any = "";
  rating:number = 0;
  themeType: number;
  //Templete Info
  templateDetails:TemplateDetails = new TemplateDetails();
  visibleText = [];
  visible:Visible;
  rate:any =[];
  comments:any = []; 


//save
coachTemplate:CoachTemplate = new CoachTemplate();
rateObj:any = new Rate();


  constructor(public navCtrl: NavController, public navParams: NavParams,public fb:FirebaseService,public commonService:CommonService,public toastCtrl: ToastController,public sharedservice: SharedServices, public popoverCtrl: PopoverController) {
    this.sessionInfo = this.navParams.get('sessionDetails');
    this.memberInfo = this.navParams.get('memberDetails');
    this.templateInfo = this.navParams.get('templateDetails');
    this.themeType = sharedservice.getThemeType();
    this.templateInfo.EvaluationCriteria = this.commonService.convertFbObjectToArray(this.templateInfo.EvaluationCriteria);
    this.getTemplateInformation();
  }
//getting Template information
 getTemplateInformation(){
  this.templateDetails.ActivityName = this.templateInfo.ActivityName;
  this.templateDetails.ActivityCode = this.templateInfo.ActivityCode;
  this.templateDetails.ActivityKey = this.templateInfo.ActivityKey;
  this.templateDetails.Summary = this.templateInfo.Summary;
  this.templateDetails.TemplateName = this.templateInfo.TemplateName;
  for(let i = 0 ; i < this.templateInfo.EvaluationCriteria.length ; i ++){
    this.templateInfo.EvaluationCriteria[i].Rating = this.commonService.convertFbObjectToArray(this.templateInfo.EvaluationCriteria[i].Rating);
    // this.visible = new Visible(this.templateInfo.EvaluationCriteria[i].DisplayText);
    // this.visible.setIsActive(this.templateInfo.EvaluationCriteria[i].IsActive);
    // this.visibleText.push(this.visible); 
  }
 }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CopycoachratingfromhistoryPage');
  }
 show(){
  
  for(let i = 0 ; i < this.rate.length;i++){
    
  }
  this.saveTemplate();
 }

 saveTemplate(){
  this.coachTemplate.ParentClubKey = this.sessionInfo.ParentClubKey;
  this.coachTemplate.MemberKey = this.memberInfo.Key;
  this.coachTemplate.MemberName = this.memberInfo.FirstName+" "+this.memberInfo.LastName;
  this.coachTemplate.Mode = 1;
  this.coachTemplate.IsRated = true;
  this.coachTemplate.CreateDate = <string>new Date().getTime().toString();
  this.coachTemplate.UpdatedDate = this.coachTemplate.CreateDate;
  this.coachTemplate.CreatedBy = "Coach";
  this.coachTemplate.CoachKey = this.sessionInfo.CoachKey;
  this.coachTemplate.CoachName = this.sessionInfo.CoachName;
  this.coachTemplate.SignedUpType = this.commonService.getMemberSignedUpType(this.memberInfo);
  this.coachTemplate.ClubKey = this.sessionInfo.ClubKey;
  this.coachTemplate.ActivityCode = this.templateDetails.ActivityCode;
  this.coachTemplate.ActivityKey = this.templateDetails.ActivityKey;
  this.coachTemplate.ActivityName = this.templateDetails.ActivityName;
  this.coachTemplate.IsActive = this.templateDetails.IsActive;
  this.coachTemplate.Summary = this.templateDetails.Summary;
  this.coachTemplate.CreaterName = this.sessionInfo.CoachName;
  this.coachTemplate.Creatorkey = this.sessionInfo.CoachKey;
  this.coachTemplate.TemplateName = this.templateDetails.TemplateName;
  this.coachTemplate["EvaluationCriteria"]={};
  console.log(this.visibleText);
  this.templateInfo.EvaluationCriteria.forEach(element => {
    this.coachTemplate["EvaluationCriteria"][element.Key]={
      DisplayText:element.DisplayText,
      IsActive:element.IsActive,
      IsShow:element.IsShow,
      Order:element.Order,
    };
});
  let key = this.fb.saveReturningKey("Performance/Coach/"+this.coachTemplate.ParentClubKey+"/"+this.sessionInfo.CoachKey,this.coachTemplate);
  for(let i = 0;i < this.templateInfo.EvaluationCriteria.length ; i++){
    if(this.rate[i] == undefined){
      this.rate[i] = 0;
    }if(this.comments[i] == undefined){
      this.comments[i] = ""; 
    }
    this.rateObj.Rating = this.rate[i];
    this.rateObj.Comments =  this.comments[i];
    this.rateObj.RatingDoneBy = "Coach";
    this.rateObj.RaterKey =   this.coachTemplate.CoachKey;
    this.rateObj.RaterName =  this.coachTemplate.CoachName;
    this.fb.save(this.rateObj,"Performance/Coach/"+ this.coachTemplate.ParentClubKey+"/"+this.sessionInfo.CoachKey+"/"+key+"/EvaluationCriteria/"+this.templateInfo.EvaluationCriteria[i].Key+"/Rating");
    }
    this.presentToast('rating successfully copied');
    this.navCtrl.push("CoachratinghistoryPage",{
      sessionDetails:this.sessionInfo,
      member:this.memberInfo
    });
}
presentToast(msg) {
  let toast = this.toastCtrl.create({
    message:msg,
    duration: 5000
  });
  toast.present();
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
