import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ActionSheetController, PopoverController, ToastController } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
import { FirebaseService } from '../../../services/firebase.service';
import { SharedServices } from '../../services/sharedservice';
import { Storage } from '@ionic/storage';
import { storage } from 'firebase';
import { TemplateDetails, Visible } from '../../Model/ActivityTemplate';

@IonicPage()
@Component({
  selector: 'page-type2template',
  templateUrl: 'template.html',
})
export class Type2templatePage {
  themeType: number;
  activityList = [];
  ParentClubKey = "";
  clubKeyList = [];
  selectedActivity = "";
  templateList = [];

  // copy variables
  templateDetails:TemplateDetails = new TemplateDetails();
  visibleText = [];
  visible:Visible;
  visibilityCriteriaKeys = [];
  parentClubDetails = [];
  templateKey = ""




  constructor(public navCtrl: NavController, public navParams: NavParams, storage: Storage, public fb: FirebaseService, public actionSheetCtrl: ActionSheetController, public sharedservice: SharedServices, public popoverCtrl: PopoverController, public commonService: CommonService,public altctrl:AlertController,public toastCtrl: ToastController) {
    this.themeType = sharedservice.getThemeType();
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      for (let user of val.UserInfo) {
        this.ParentClubKey = user.ParentClubKey;
      }
      this.fb.getAll('Activity/'+this.ParentClubKey).subscribe((data) => {
        for(let i = 0; i < data.length ;i++){
          let data2 = this.commonService.convertFbObjectToArray(data[i]);
          for(let j = 0; j < data2.length ; j++){
           if(!this.checkInclusion(data2[j].Key)){
            this.activityList.push(data2[j]);
           }
          }
        }
      this.selectedActivity = this.activityList[0].ActivityName;
      }); 
  
    }).catch(error => {
      console.log(error);
    });
   
   
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad Type2titlePage');
  }
  checkInclusion(word:string):boolean{
    let x:boolean=false;
    for(let i = 0;i < this.activityList.length;i++){
      if( this.activityList[i].Key.trim().toLowerCase() == word.trim().toLowerCase()){
        x = true;
        break;
      }else{
        x = false;
      }

    }
    return x;

  }

  presentActionSheet(key) {
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Copy',
          handler: () => {
            this.presentPrompt(key,this.ParentClubKey);
          }
        },
        {
          text: 'Edit',
          handler: () => {
            this.navCtrl.push('EditTemplatePage',{
              ActivityList:this.activityList,
              parentClubkey:this.ParentClubKey,
              templateKey:key
            });
          }
        },
        {
          text: 'Delete',
          handler: () => {
            this.fb.update(key,'PerformanceTemplate/ParentClub/'+this.ParentClubKey,{IsActive:false});
            this.showToast("Template successfully deleted");
           
          }
        },
        {
          text: 'Cancel',
          handler: () => {

          }
        }
      ]
    });
    actionSheet.present();
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
  gotoCreatetemplatePage() {
    this.navCtrl.push('CreatetemplatePage',{
      activityList:this.activityList,
      parentClubkey:this.ParentClubKey
    });
  }
  getTemplate():void{
    this.fb.getAllWithQuery('PerformanceTemplate/ParentClub/'+this.ParentClubKey,{orderByChild:'ActivityName',equalTo:this.selectedActivity}).subscribe((data) =>{
    this.templateList = [];
      for(let i = 0; i < data.length; i++){
        if(data[i].IsActive){
          this.templateList.push(data[i]);
        }
      }
    });
  }

 


  presentPrompt(key,parentKey) {
    let alert = this.altctrl.create({
      title: 'Copy Template',
      message:'Enter the Name of Template',
      inputs: [
        {
          name: 'username',
          placeholder: 'Template Name'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Copy',
          //fetching details according to selected template
          handler: data => {
            this.templateDetails.TemplateName = data.username;
           let temp =  this.fb.getAllWithQuery('PerformanceTemplate/ParentClub/'+parentKey ,{orderByKey:true,equalTo:key}).subscribe((data) =>{
              data[0].EvaluationCriteria=this.commonService.convertFbObjectToArray(data[0].EvaluationCriteria);
              this.templateDetails.ActivityName = data[0].ActivityName;
              this.templateDetails.ActivityCode = data[0].ActivityCode;
              this.templateDetails.ActivityKey = data[0].ActivityKey;
              this.templateDetails.Summary = data[0].Summary;
              for(let i = 0 ; i < data[0].EvaluationCriteria.length; i++){
                this.visible = new Visible(data[0].EvaluationCriteria[i].DisplayText);
                this.visible.Comments = data[0].EvaluationCriteria[i].Comments;
                this.visible.Order =  data[0].EvaluationCriteria[i].Order;
                this.visible.setIsActive(data[0].EvaluationCriteria[i].IsActive)
                this.visibleText[i] = this.visible;   
                this.visibilityCriteriaKeys[i] = data[0].EvaluationCriteria[i].Key;
              }
         //insert data
         let InsertedDatakey = this.fb.saveReturningKey("PerformanceTemplate/ParentClub/"+this.ParentClubKey,this.templateDetails);
         for( let i = 0 ; i < this.visibleText.length ;i++){
           this.fb.save(this.visibleText[i],"PerformanceTemplate/ParentClub/"+this.ParentClubKey+"/"+InsertedDatakey+"/EvaluationCriteria");
         }
         temp.unsubscribe();
         this.showToast("Template successfully copied"); 
       
            })


          }
        }
      ]
    });
    alert.present();
  }
  showToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }
  getcolor():string{
    return ColorCombination.getColor();
  }
}
class ColorCombination{
  static count:number = 0;
  static col=['rgb(100, 165, 100)','rgb(97, 165, 243','rgb(221, 114, 114)'];
  static getColor():string{
    if(ColorCombination.count == 0){
      return ColorCombination.col[0];
    }else if(ColorCombination.count == 1){
      return ColorCombination.col[1];
    }else if(ColorCombination.count == 2){
      ColorCombination.count = 0;
      return ColorCombination.col[1];
    }
    ColorCombination.count++;
  }

}

