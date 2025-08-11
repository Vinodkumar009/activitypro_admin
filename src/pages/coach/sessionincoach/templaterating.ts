import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';
import { TemplateDetails, Visible } from '../../Model/ActivityTemplate';
import { CommonService } from '../../../services/common.service';
import { FirebaseService } from '../../../services/firebase.service';
import { CoachTemplate, Rate } from '../../Model/coachTemplate';
import { SharedServices } from '../../services/sharedservice';
import { ToastController } from 'ionic-angular';
/**
 * Generated class for the TemplateratingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-templaterating',
  templateUrl: 'templaterating.html',
})
export class TemplateratingPage {
  templateInfo:any ={};
  sessionInfo:any={};
  memberInfo:any={};
  textArea:boolean = false;
  themeType: number;

  //
  activityList = {};
  parentClubDetails = [];
  templateKey = ""
  parentClubKey = ""
  selectedActivity = ""
  templateDetails:TemplateDetails = new TemplateDetails();
  visibleText = [];
  visible:Visible;
  visibilityCriteriaKeys = [];
  rating:any=""
  showRange:boolean=false;
  rate:any = [];
  Categorycomments:any=[];
  comment:any="";
  selectedIndex:number = null;
  InsertedPerformancekey:any = "";
  manageVisibleText:any = [];
  status:any = [];
  manage:boolean = true;
  ratingActivity:boolean = true;
  manageratingActivity:boolean = false;
  //save
  coachTemplate:CoachTemplate = new CoachTemplate();
  managebtn:boolean = true;
  //
  rateObj:any = new Rate();
  constructor(public toastCtrl: ToastController,public navCtrl: NavController, public navParams: NavParams,public fb:FirebaseService,public commonService:CommonService, public sharedservice: SharedServices, public popoverCtrl: PopoverController) {
    this.templateInfo  = this.navParams.get('templateInfo');
    this.sessionInfo = this.navParams.get('sessionInfo');
    this.memberInfo = this.navParams.get('memberInfo');
    this.themeType = sharedservice.getThemeType();
    this.getTemplateDetails();


  }
  getTemplateDetails(){
    let templateSubscriber = this.fb.getAllWithQuery('PerformanceTemplate/ParentClub/'+this.sessionInfo.ParentClubKey ,{orderByKey:true,equalTo:this.templateInfo}).subscribe((data) =>{
      data[0].EvaluationCriteria=this.commonService.convertFbObjectToArray(data[0].EvaluationCriteria);
      this.templateDetails.ActivityName = data[0].ActivityName;
      this.templateDetails.ActivityCode = data[0].ActivityCode;
      this.templateDetails.ActivityKey = data[0].ActivityKey;
      this.templateDetails.Summary = data[0].Summary;
      this.templateDetails.TemplateName = data[0].TemplateName;
      let j = 0;
      for(let i = 0 ; i < data[0].EvaluationCriteria.length; i++){
        this.visible = new Visible(data[0].EvaluationCriteria[i].DisplayText);
        this.visible.setIsActive(data[0].EvaluationCriteria[i].IsActive)
        if(this.visible.IsActive == true){
          this.visibleText[j] = this.visible; 
          this.visibleText[j].Key =   data[0].EvaluationCriteria[i].Key;
        this.visibilityCriteriaKeys[j] = data[0].EvaluationCriteria[i].Key;
        this.status[j] = true;
        this.Categorycomments[j] = "";
        j++;
        }
      }
     
      templateSubscriber.unsubscribe();
    });
    }




    getRating(num){
      this.showRange = true;
      this.selectedIndex = num;
    }
  ionViewDidLoad() {
    console.log('ionViewDidLoad TemplateratingPage');
  }
  geatTextArea():boolean{
    if(this.textArea == true){
      return false;
    }else{
      return true;
    }
  }
  getTemplateRating(){
    for(let i = 0 ; i < this.visibleText.length ; i++){
      if(this.rate[i] == undefined){
        this.rate[i] = 0;
      }
      if(this.Categorycomments[i] == undefined){
        this.Categorycomments[i] = "";
      }
      this.visibleText[i].Rating = this.rate[i];
    }
  }
  saveRating(){
    this.showRange = false;
  }

saveData(){
  this.getTemplateRating();
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
  this.visibleText.forEach(element => {
    this.coachTemplate["EvaluationCriteria"][element.Key]={
      DisplayText:element.DisplayText,
      IsActive:element.IsActive,
      IsShow:element.IsShow,
      Order:element.Order,
    };
});
  this.InsertedPerformancekey = this.fb.saveReturningKey("Performance/Coach/"+this.coachTemplate.ParentClubKey+"/"+this.sessionInfo.CoachKey,this.coachTemplate);
  for(let i = 0;i < this.visibleText.length ; i++){
    this.rateObj.Rating = this.visibleText[i].Rating;
    this.rateObj.Comments =  this.Categorycomments[i];
    this.rateObj.RatingDoneBy = "Coach";
    this.rateObj.RaterKey =   this.coachTemplate.CoachKey;
    this.rateObj.RaterName =  this.coachTemplate.CoachName;
    this.fb.save(this.rateObj,"Performance/Coach/"+ this.coachTemplate.ParentClubKey+"/"+this.sessionInfo.CoachKey+"/"+this.InsertedPerformancekey+"/EvaluationCriteria/"+this.visibleText[i].Key+"/Rating");
    }
  
}
  saveTemplate(){
    this.hideMe();
    if(this.validate()){
      this.saveData();
    this.navCtrl.push("CoachratinghistoryPage",{
    sessionDetails:this.sessionInfo,
    member:this.memberInfo
  });
    }
   
   
  }

  onModelChange(event){
    this.rating=event;
  }
  SubmitTemplate(){
   if(this.validate()){
    this.hideMe();
    this.saveData();
    this.navCtrl.push("TemplateratingsavePage",{
      sessionInfo:this.sessionInfo,
      memberInfo:this.memberInfo,
      templateDetails:this.coachTemplate,
      key:this.InsertedPerformancekey
    })
   }
  }
  hideMe(){
   for(let i = 0 ; i <this.status.length; i++){
     if(this.status[i] == false){
      try{
        this.rate.splice(i, 1);
      }catch(e){
        
      }
      try{
        this.Categorycomments.splice(i, 1);
      }catch(e){
        
      }
      try{
        this.visibleText.splice(i,1);
        this.visibilityCriteriaKeys.splice(i,1);
      }catch(e){
        
      }
     }
   }

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
  onOverallRatingChange($event){
    this.coachTemplate.AveragePerformance = $event;
    console.log($event);
  }
  manageCriteria(){
    this.showRange = false;
    this.selectedIndex = null;
  if(this.manage == true){
    this.manage = false;
    this.ratingActivity = true;
    this.manageratingActivity = false;
    this.managebtn = true;
  }else{
    this.manage = true;
    this.ratingActivity = false;
    this.manageratingActivity = true;
    this.managebtn = false;
  }
  }
  hideActivity(index){
    this.status[index] = false;
   
  }
  showActivity(index){
    this.status[index] = true;

  }
  validate():boolean{
    if(this.coachTemplate.StartDate == "" || this.coachTemplate.StartDate == undefined){
      this.presentToast('Enter StartDate');
      return false;
    }else if(this.coachTemplate.EndDate == "" || this.coachTemplate.EndDate == undefined){
      this.presentToast('Enter EndDate');
      return false;
    }else{
      return true;
    }
  }
  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000
    });
    toast.present();
  }
}
