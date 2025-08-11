import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, ActionSheetController, AlertController, PopoverController } from 'ionic-angular';
import { TemplateDetails,Visible,DisplayText } from '../../Model/ActivityTemplate';
import { FirebaseService } from '../../../services/firebase.service';
import { SharedServices } from '../../services/sharedservice';
import { CommonService } from '../../../services/common.service';

/**
 * Generated class for the TemplatelistPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-templatelist',
  templateUrl: 'templatelist.html',
})
export class TemplatelistPage {
  themeType: number;
  sessionDetails:any = '';
  memberInformation = "";
  tempLetList = [];
  template:TemplateDetails = new TemplateDetails();
  templateIndex = [];
  constructor(public navCtrl: NavController, public navParams: NavParams,public fb: FirebaseService, public actionSheetCtrl: ActionSheetController, public sharedservice: SharedServices, public popoverCtrl: PopoverController, public commonService: CommonService,public altctrl:AlertController,public toastCtrl: ToastController,) {
    this.sessionDetails = this.navParams.get('sessionDetails');
    this.themeType = sharedservice.getThemeType();
    this.memberInformation = this.navParams.get('member');
    this.getTempletList();
    this.presentToast();
  }
getTempletList(){
  console.log(this.sessionDetails);
  console.log(this.memberInformation);
  this.fb.getAllWithQuery('PerformanceTemplate/ParentClub/'+this.sessionDetails.ParentClubKey,{orderByChild:'ActivityKey',equalTo:this.sessionDetails.ActivityKey}).subscribe((data) =>{
    for(let i = 0 ; i < data.length ;i++){
      data[i].EvaluationCriteria = this.commonService.convertFbObjectToArray(data[i].EvaluationCriteria);
      if(data[i].IsActive == true){
        this.template.ActivityCode = data[i].ActivityCode;
        this.template.ActivityKey = data[i].ActivityKey;
        this.template.ActivityName = data[i].ActivityName;
        this.template.IsActive = data[i].IsActive;
        this.template.Summary = data[i].Summary;
        this.template.TemplateName = data[i].TemplateName;
        this.tempLetList.push(this.template);
        this.template = new TemplateDetails();
        this.templateIndex.push(data[i].$key);
      }
     
    }
  });
}
  ionViewDidLoad() {
    console.log('ionViewDidLoad TemplatelistPage');
  }
  goToTemplateratingpage(templatedetail){
    this.navCtrl.push('TemplateratingPage',{
      templateInfo:this.templateIndex[templatedetail],
      sessionInfo: this.sessionDetails,
      memberInfo:this.memberInformation
    })
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
  presentToast() {
    let toast = this.toastCtrl.create({
      message: 'select template',
      duration: 3000
    });
    toast.present();
  }
}
