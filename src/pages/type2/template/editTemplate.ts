import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, PopoverController, AlertController, ActionSheetController } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
import { SharedServices } from '../../services/sharedservice';
import { FirebaseService } from '../../../services/firebase.service';
import {TemplateDetails , Visible , DisplayText} from '../../Model/ActivityTemplate';
import { Storage } from '@ionic/storage';
/**
 * Generated class for the EditTemplatePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@IonicPage()
@Component({
  selector: 'page-editTemplate',
  templateUrl: 'editTemplate.html',
})
export class EditTemplatePage {
  template:any={};
  activityList = {};
  parentClubDetails = [];
  themeType: number;
  templateKey = ""
  parentClubKey = ""
  selectedActivity = ""
  templateDetails:TemplateDetails = new TemplateDetails();
  status:any = [];
  preIndex:any = 0;
  constructor(public navCtrl: NavController, public navParams: NavParams,public fb:FirebaseService,public actionSheetCtrl: ActionSheetController,public sharedservice: SharedServices, public popoverCtrl: PopoverController,public toastCtrl:ToastController,public commonService:CommonService,public alertCtrl: AlertController) {
    this.themeType = sharedservice.getThemeType();
    this.templateKey = this.navParams.get('templateKey');
    this.activityList = this.navParams.get('ActivityList');
    this.parentClubKey = this.navParams.get('parentClubkey');
    this.getParentClubDetails();
  }
  getParentClubDetails() {
    this.fb.getAllWithQuery("/ParentClub/Type2/", { orderByKey: true, equalTo: this.parentClubKey }).subscribe((data) => {
        this.parentClubDetails = data;
    });
    this.getTemplateDetails();
  }
  getTemplateDetails(){
  let templateSubscriber = this.fb.getAllWithQuery('PerformanceTemplate/ParentClub/'+this.parentClubKey ,{orderByKey:true,equalTo:this.templateKey}).subscribe((data) =>{
    data[0].EvaluationCriteria=this.commonService.convertFbObjectToArray(data[0].EvaluationCriteria);
    this.template = data[0];
    this.templateDetails.ActivityName = data[0].ActivityName;
    this.templateDetails.ActivityCode = data[0].ActivityCode;
    this.templateDetails.ActivityKey = data[0].ActivityKey;
    this.templateDetails.Summary = data[0].Summary;
    this.templateDetails.TemplateName = data[0].TemplateName;
     
    for(let i = 0 ; i < this.template.EvaluationCriteria.length ;i++){
     this. status[i] = false;
    }
  });
  }
  updateTemplate(){
    this.saveRating();
    this.fb.update(this.templateKey,'PerformanceTemplate/ParentClub/'+this.parentClubKey,{TemplateName: this.templateDetails.TemplateName,Summary:this.templateDetails.Summary});
    this.showToast("template successfully updated");
    this.navCtrl.push('Type2templatePage');
  }
  saveRating(){
   console.log(this.template.EvaluationCriteria)
   for(let i =0 ;i < this.template.EvaluationCriteria.length;i++){
     this.fb.update(this.template.EvaluationCriteria[i].Key,'PerformanceTemplate/ParentClub/'+this.parentClubKey+"/"+this.templateKey+"/EvaluationCriteria",{Comments:this.template.EvaluationCriteria[i].Comments});
   }
  }
  clearTemplate(){
    this.navCtrl.pop();
  }
  updateToggle(index){
    this.fb.update(index.Key,'PerformanceTemplate/ParentClub/'+this.parentClubKey+"/"+this.templateKey+"/EvaluationCriteria",{IsActive:index.IsActive});
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
  showToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }






  showPrompt(item) {
    let prompt = this.alertCtrl.create({
      title: 'Edit',
      message: "Enter a name ",
      inputs: [
        {
          name: 'DisplayText',
          value:item.DisplayText
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {
            console.log(data);
            this.fb.update(item.Key,"PerformanceTemplate/ParentClub/"+this.parentClubKey+"/"+this.template.$key+"/EvaluationCriteria",data);
            this.showToast('successfully updated');
          }
        }
      ]
    });
    prompt.present();
  }
  makeDiv(i,item){
   
   if(this.preIndex != i){
    this.status[this.preIndex] = false;
    console.log(item);
   }
    if(this.status[i] == true){
      this.status[i] = false;
    }else{
      this.status[i] = true;
    }
    this.preIndex = i;
  }
}

















