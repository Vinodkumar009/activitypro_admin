import { Component, ComponentFactoryResolver } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController, ActionSheetController, ToastController } from 'ionic-angular';
import { FirebaseService } from '../../../services/firebase.service';
import { SharedServices } from '../../services/sharedservice';

 import {TemplateDetails , Visible , DisplayText} from '../../Model/ActivityTemplate';
/**
 * Generated class for the CreatetemplatePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-createtemplate',
  templateUrl: 'createtemplate.html',
})
export class CreatetemplatePage {
  parentClubDetails = [];
  activityList = {};
  selectedActivity = "";
  themeType: number;
  templateDetails = new TemplateDetails();
  selectedActivitiesIndex:any ="";
  parentClubKey = "";
  visibleText = [];
  displayText = DisplayText.displayText;
  constructor(public navCtrl: NavController, public navParams: NavParams,public fb:FirebaseService,public actionSheetCtrl: ActionSheetController,public sharedservice: SharedServices, public popoverCtrl: PopoverController,public toastCtrl:ToastController) {
    this.themeType = sharedservice.getThemeType();
    this.activityList = this.navParams.get('activityList');
    this.parentClubKey  = this.navParams.get('parentClubkey');
    this.getParentClubDetails();
   for(let i = 0; i < this.displayText.length;i++){
    this.visibleText[i] = new Visible(this.displayText[i]);
   }
   
    
  }
  getParentClubDetails() {
    this.fb.getAllWithQuery("/ParentClub/Type2/", { orderByKey: true, equalTo: this.parentClubKey }).subscribe((data) => {
        this.parentClubDetails = data;
    });
}
  saveTemplate():void{
    
   if(this.checkValid()){
    this.templateDetails.ActivityCode = this.activityList[this.selectedActivitiesIndex].ActivityCode;
    this.templateDetails.ActivityKey = this.activityList[this.selectedActivitiesIndex].Key;
    this.templateDetails.ActivityName = this.activityList[this.selectedActivitiesIndex].ActivityName;
    this.templateDetails.IsActive = true;
    let InsertedDatakey = this.fb.saveReturningKey("PerformanceTemplate/ParentClub/"+this.parentClubKey,this.templateDetails);
    for( let i = 0 ; i < this.visibleText.length ;i++){
      this.fb.save(this.visibleText[i],"PerformanceTemplate/ParentClub/"+this.parentClubKey+"/"+InsertedDatakey+"/EvaluationCriteria");
    }
    this.showToast("Template successfully saved"); 
    this.navCtrl.pop();
   }
  }
  clearTemplate():void{
   this.templateDetails = new TemplateDetails();
   this.navCtrl.pop();
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad CreatetemplatePage');
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
  checkValid():boolean{
    if( this.selectedActivitiesIndex == "" || this.selectedActivitiesIndex == undefined){
      this.showToast('please select activityname');
      return false;
    }else if(this.templateDetails.TemplateName == "" || this.templateDetails.TemplateName == undefined){
      this.showToast('please enter templatename');
      return false;
    }else if(this.templateDetails.Summary == "" || this.templateDetails.Summary == undefined){
      this.showToast('please enter summary');
      return false;
    }else{
      return true;
    }
  }
}
