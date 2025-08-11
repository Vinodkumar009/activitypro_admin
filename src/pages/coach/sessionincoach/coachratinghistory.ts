import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, ToastController, PopoverController } from 'ionic-angular';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonService } from '../../../services/common.service';
import { Mode } from '../../Model/coachTemplate';

import { Ionic2RatingModule } from 'ionic2-rating';
import { SharedServices } from '../../services/sharedservice';
/**
 * Generated class for the CoachratinghistoryPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-coachratinghistory',
  templateUrl: 'coachratinghistory.html',
})
export class CoachratinghistoryPage {
  themeType: number;
sessionInfo:any = "";
memberDetails:any = "";
HistoryDetails:any =[];
rate:any;
//
modeCount:number = 0;
  constructor(public navCtrl: NavController, public navParams: NavParams,public fb:FirebaseService,public commonService:CommonService,public actionSheetCtrl: ActionSheetController,public toastCtrl: ToastController, public sharedservice: SharedServices, public popoverCtrl: PopoverController) {
    this.sessionInfo = this.navParams.get('sessionDetails');
    this.memberDetails = this.navParams.get('member');
    this.themeType = sharedservice.getThemeType();
    this.getDetails();
  }
  getDetails(){
   let x =  this.fb.getAllWithQuery("Performance/Coach/"+this.sessionInfo.ParentClubKey+"/"+this.sessionInfo.CoachKey,{orderByChild:"MemberKey",equalTo:this.memberDetails.Key}).subscribe((data) => {
    this.HistoryDetails=[];  
    this.modeCount = 0;
    for(let i = data.length-1 ;i >=0 ; i--){
        if(data[i].IsActive == true){
          if(data[i].Mode == 1){
            this.modeCount++;
          }
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
  presentActionSheet(templateDetail) {
    let actionSheet:any = "";
    if(templateDetail.Mode == 1){
      actionSheet = this.actionSheetCtrl.create({
        buttons: [
          {
            text: 'Edit',
            handler: () => {
              this.navCtrl.push("EditperformancePage",{
                templateDetails:templateDetail,
                sessionDetails:this.sessionInfo,
                memberDetails:this.memberDetails
               });
            }
          },
          {
            text: 'Copy',
            handler: () => {
              if(this.modeCount <2){
                this.navCtrl.push('CopycoachratingfromhistoryPage',{
                  templateDetails:templateDetail,
                  sessionDetails:this.sessionInfo,
                  memberDetails:this.memberDetails
                });
              }else{
                this.showToast("only two In Progress mode allowed, for further copy delete any one of them")
              }
            }
          },
          {
            text: 'Submit',
            handler: () => {
              this.navCtrl.push("TemplateratingsavePage",{
                sessionInfo:this.sessionInfo,
                memberInfo:this.memberDetails,
                templateDetails:templateDetail
              });
            }
          },
          {
            text: 'Delete',
            handler: () => {
              console.log(templateDetail);
             this.fb.update(templateDetail.$key,"Performance/Coach/"+templateDetail.ParentClubKey+"/"+templateDetail.CoachKey,{"IsActive":false});
             this.showToast("rating successfully deleted")
              // this.navCtrl.push("CoachratinghistoryPage",{
              //   sessionDetails:this.sessionInfo,
              //   member:this.memberDetails
              // });
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
    }
    if(templateDetail.Mode == 2){
      actionSheet = this.actionSheetCtrl.create({
        buttons: [
          {
            text: 'View',
            handler: () => {
              this.navCtrl.push("ViewtemplatefromhistoryPage",{
                templateDetails:templateDetail,
                sessionDetails:this.sessionInfo,
                memberDetails:this.memberDetails
               });
            }
          },
          {
            text: 'Copy',
            handler: () => {
              if(this.modeCount <2){
                this.navCtrl.push('CopycoachratingfromhistoryPage',{
                  templateDetails:templateDetail,
                  sessionDetails:this.sessionInfo,
                  memberDetails:this.memberDetails
                });
              }else{
                this.showToast("only two In Progress mode allowed, for further copy delete any one of them")
              }
            }
          },
          {
            text: 'Edit',
            handler: () => {
              this.navCtrl.push("EditperformancePage",{
                templateDetails:templateDetail,
                sessionDetails:this.sessionInfo,
                memberDetails:this.memberDetails
               });
            }
          },
          {
            text: 'Submit',
            handler: () => {
              this.navCtrl.push("TemplateratingsavePage",{
                sessionInfo:this.sessionInfo,
                memberInfo:this.memberDetails,
                templateDetails:templateDetail
              });
            }
          },
          {
            text: 'Pull Back',
            handler: () => {
              this.fb.update(templateDetail.$key,"Performance/Coach/"+templateDetail.ParentClubKey+"/"+this.sessionInfo.CoachKey,{Mode:1});
            }
          },
          {
            text: 'Delete',
            handler: () => {
              console.log(templateDetail);
             this.fb.update(templateDetail.$key,"Performance/Coach/"+templateDetail.ParentClubKey+"/"+templateDetail.CoachKey,{"IsActive":false});
             this.showToast("rating successfully deleted")
              // this.navCtrl.push("CoachratinghistoryPage",{
              //   sessionDetails:this.sessionInfo,
              //   member:this.memberDetails
              // });
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
    }
    if(templateDetail.Mode == 3){
      actionSheet = this.actionSheetCtrl.create({
        buttons: [
          {
            text: 'View',
            handler: () => {
              this.navCtrl.push("ViewtemplatefromhistoryPage",{
                templateDetails:templateDetail,
                sessionDetails:this.sessionInfo,
                memberDetails:this.memberDetails
               });
            }
          },
          {
            text: 'Copy',
            handler: () => {
              if(this.modeCount <2){
                this.navCtrl.push('CopycoachratingfromhistoryPage',{
                  templateDetails:templateDetail,
                  sessionDetails:this.sessionInfo,
                  memberDetails:this.memberDetails
                });
              }else{
                this.showToast("only two In Progress mode allowed, for further copy delete any one of them")
              }
            }
          },
          {
            text: 'Pull Back',
            handler: () => {
            if(templateDetail.Mode == 3){
              this.fb.update(templateDetail.$key,"Performance/Coach/"+templateDetail.ParentClubKey+"/"+this.sessionInfo.CoachKey,{Mode:1});
            }else{
              this.showToast('rating has not submited yet, only submitted rating able to pull back ');
            }
            }
          },
          {
            text: 'Delete',
            handler: () => {
              console.log(templateDetail);
             this.fb.update(templateDetail.$key,"Performance/Coach/"+templateDetail.ParentClubKey+"/"+templateDetail.CoachKey,{"IsActive":false});
             this.showToast("rating successfully deleted")
              // this.navCtrl.push("CoachratinghistoryPage",{
              //   sessionDetails:this.sessionInfo,
              //   member:this.memberDetails
              // });
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
    }
    
 
 
 
    actionSheet.present();
  }
  goTotemplateListingPage(){
    this.navCtrl.push('TemplatelistPage',{
      sessionDetails:this.sessionInfo,
      member:this.memberDetails
    });
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

}
