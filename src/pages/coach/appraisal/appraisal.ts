import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, ToastController, PopoverController } from 'ionic-angular';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonService } from '../../../services/common.service';
import { SharedServices } from '../../services/sharedservice';
import { Mode } from '../../Model/coachTemplate';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the AppraisalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-appraisal',
  templateUrl: 'appraisal.html',
})
export class AppraisalPage {
  themeType: number;
  HistoryDetails:any =[];
  rate:any;
  coachType: any;
  parentClubKey: any;
  selectedCoach: any;
  modeCount:number = 0;
    constructor( storage: Storage,public navCtrl: NavController, public navParams: NavParams,public fb:FirebaseService,public commonService:CommonService,public actionSheetCtrl: ActionSheetController,public toastCtrl: ToastController, public sharedservice: SharedServices, public popoverCtrl: PopoverController) {
      this.themeType = sharedservice.getThemeType();
      
    storage.get('userObj').then((val) => {
      console.log('')
      val = JSON.parse(val);
      if (val.$key != "") {
        this.selectedCoach = val.UserInfo[0].CoachKey;
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        this.coachType = val.Type;
      this.getDetails();
      }
    }); 
    }
    getDetails(){
     let x =  this.fb.getAllWithQuery("Performance/Coach/"+this.parentClubKey+"/"+this.selectedCoach,{orderByChild:"Mode",equalTo:1}).subscribe((data) => {
      this.HistoryDetails=[];  
      for(let i = data.length-1 ;i >=0 ; i--){
          if(data[i].IsActive == true){
            this.HistoryDetails.push(data[i]);
          }
        }
       });
    
    }
  getMode(num:number):string{
  return new Mode().getMode(num);
  }
    ionViewDidLoad() {
      console.log('ionViewDidLoad CoachratinghistoryPage');
    }
  
    onModelChange(event){
      this.rate=event;
    }
    showToast(message) {
      let toast = this.toastCtrl.create({
        message: message,
        duration: 3000
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
  
    presentActionSheet(data) {
      console.log(data);
      let actionSheet = this.actionSheetCtrl.create({
        buttons: [
          {
            text: 'View',
            handler: () => {
             this.navCtrl.push('ViewappraisalPage',{
               parentClubKey:this.parentClubKey,
               coachKey:this.selectedCoach,
               tempalteDetails:data
             });
            }
          },
         
          // {
          //   text: 'Submit',
          //   handler: () => {
          //     this.navCtrl.push('EditappraisalPage',{
          //       parentClubKey:this.parentClubKey,
          //       coachKey:this.selectedCoach,
          //       tempalteDetails:data
          //     });
          //   }
          // },
          {
            text: 'Delete',
            handler: () => {
              this.fb.update(data.$key,"Performance/Coach/"+this.parentClubKey+"/"+this.selectedCoach,{IsActive:false});
              this.presentToast('successfully deleted');
            }
          },
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          }
        ]
      });
      actionSheet.present();
      
    }
    presentToast(msg) {
      let toast = this.toastCtrl.create({
        message:msg,
        duration: 3000
      });
      toast.present();
    }
}
