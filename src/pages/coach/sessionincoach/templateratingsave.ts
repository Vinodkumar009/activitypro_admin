import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, PopoverController } from 'ionic-angular';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonService } from '../../../services/common.service';
import { Type2HolidayCampModule } from '../../type2/holidaycamp/holidaycamp.module';
import { SharedServices } from '../../services/sharedservice';

/**
 * Generated class for the TemplateratingsavePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-templateratingsave',
  templateUrl: 'templateratingsave.html',
})
export class TemplateratingsavePage {
  //session details
  themeType: number;
  sessionInfo:any = "";
  memberInfo:any = "";
  templateDetails:any ="";
  visibleText:any = "";
  //save as type
  submitToType:any="";
  coachDetails:any = [];
  key:any = "";
  constructor(public navCtrl: NavController, public navParams: NavParams,public fb:FirebaseService,public commonService:CommonService,public alertCtrl: AlertController,public sharedservice: SharedServices, public popoverCtrl: PopoverController) {
    this.sessionInfo = this.navParams.get('sessionInfo');
    this.memberInfo = this.navParams.get('memberInfo');
    this.templateDetails = this.navParams.get('templateDetails');
    this.themeType = sharedservice.getThemeType();
    this.key = this.navParams.get('key');
    this.fb.getAll("Coach/Type2/"+this.memberInfo.ParentClubKey).subscribe((data) =>{
      this.coachDetails = [];
      for(let i = 0; i < data.length;i++){
        this.coachDetails.push(data[i]);
      }
    });  
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad TemplateratingsavePage');
  }
  submitTo(type){
    if(type == "Coach"){
      this.submitToType ="Coach";
    }else{
      this.submitToType ="Member";
    }
  }
  submitCoach(submittedCoachInfo){
    if(this.key == undefined){
      this.key = this.templateDetails.$key;
    }
    this.fb.update(this.key,"Performance/Coach/"+this.templateDetails.ParentClubKey+"/"+this.sessionInfo.CoachKey,{Mode:2,SubmitedTo:submittedCoachInfo.$key,SubmitedType:'Coach',Status:1});
    let subscriber = this.fb.getAllWithQuery("Performance/Coach/"+this.templateDetails.ParentClubKey+"/"+this.sessionInfo.CoachKey,{orderByKey:true,equalTo:this.key}).subscribe((data) =>{
     delete data[0].$key;
     data[0].ReferedBy = this.sessionInfo.CoachKey;
     data[0].ReferedTemplateKey = this.key;
     data[0].Mode = 1;
     this.fb.save(data[0],"Performance/Coach/"+this.templateDetails.ParentClubKey+"/"+submittedCoachInfo.$key);
     subscriber.unsubscribe();
    });
  
   this.navCtrl.push("CoachratinghistoryPage",{
    sessionDetails:this.sessionInfo,
    member:this.memberInfo
  });
  }
  showConfirm(coach) {
    let confirm = this.alertCtrl.create({
      title: 'Submit!',
      message: 'Do you agree to submit',
      buttons: [
        {
          text: 'submit',
          handler: () => {
            this.submitCoach(coach)
          }
        },
        {
          text: 'cancel',
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    });
    confirm.present();
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
  submitToMember(){
    if(this.key == "" || this.key == undefined){
      this.fb.update(this.templateDetails.$key,"Performance/Coach/"+this.templateDetails.ParentClubKey+"/"+this.sessionInfo.CoachKey,{Mode:3});
    }else{
     this.fb.getAllWithQuery("Performance/Coach/"+this.templateDetails.ParentClubKey+"/"+this.sessionInfo.CoachKey,{orderByKey:true,equalTo:this.key}).subscribe((data) =>{
      this.fb.update(this.key,"Performance/Coach/"+this.templateDetails.ParentClubKey+"/"+this.sessionInfo.CoachKey,{Mode:3});
     });
    }
    this.navCtrl.push("CoachratinghistoryPage",{
     sessionDetails:this.sessionInfo,
     member:this.memberInfo
   });
  }
}
