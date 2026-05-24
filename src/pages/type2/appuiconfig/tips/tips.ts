import { forEach } from '@firebase/util';
import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { CommonService } from '../../../../services/common.service';
import { FirebaseService } from '../../../../services/firebase.service';
import { SharedServices } from '../../../services/sharedservice';
/**
 * Generated class for the TipsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-tips',
  templateUrl: 'tips.html',
})
export class TipsPage {
  parentClubKey: any;
  allClub = [];
  activity = [];
  selectedActivity: string = "";
  tipList = []
  standardTips = []
  tips = {
    Title: '',
    DisplayTitle: '',
    Type: '',
    Description: '',
    ImageUrl: '',
    CreateDate: '',
    IsActive: true,
    IsEnable: true
  }
  apptour = [{
    ButtonText: 'Skip to End',
    Description:'make your kids day with Ap Pro Plus',
    Title:'App for Kids',
    ImageURL:'https://i.pinimg.com/originals/37/6e/2d/376e2dab5652d6e1751e25cbcb52f2d5.jpg',
    Sequence: 1, 
    IsActive:true,
    CreateDate: '',
    IsVisible: true
  },
  {
    ButtonText: 'Skip to End',
    Description:'make your kids day with Ap Pro Plus',
    Title:'App for Kids',
    ImageURL:'https://i.pinimg.com/originals/37/6e/2d/376e2dab5652d6e1751e25cbcb52f2d5.jpg',
    Sequence: 1, 
    IsActive:true,
    CreateDate: '',
    IsVisible: true
  },
  {
    ButtonText: 'Skip to End',
    Description:'make your kids day with Ap Pro Plus',
    Title: 'Avatar',
    ImageURL:'https://i.pinimg.com/originals/37/6e/2d/376e2dab5652d6e1751e25cbcb52f2d5.jpg',
    Sequence: 1, 
    IsActive:true,
    CreateDate: '',
    IsVisible: true
  },
  {
    ButtonText: 'Skip to End',
    Description:'make your kids day with Ap Pro Plus',
    Title:'Challenges',
    ImageURL:'https://i.pinimg.com/originals/37/6e/2d/376e2dab5652d6e1751e25cbcb52f2d5.jpg',
    Sequence: 1, 
    IsActive:true,
    CreateDate: '',
    IsVisible: true
  },
  {
    ButtonText: 'Skip to End',
    Description:'make your kids day with Ap Pro Plus',
    Title:'Sessions',
    ImageURL:'https://i.pinimg.com/originals/37/6e/2d/376e2dab5652d6e1751e25cbcb52f2d5.jpg',
    Sequence: 1, 
    IsActive:true,
    CreateDate: '',
    IsVisible: true
  },
  {
    ButtonText: 'Skip to End',
    Description:'make your kids day with Ap Pro Plus',
    Title:'Loyalty Points',
    ImageURL:'https://i.pinimg.com/originals/37/6e/2d/376e2dab5652d6e1751e25cbcb52f2d5.jpg',
    Sequence: 1, 
    IsActive:true,
    CreateDate: '',
    IsVisible: true
  }]
  tipkids: any[];
  constructor(public alertCtrl: AlertController, storage: Storage, public commonService: CommonService, public fb: FirebaseService, public navCtrl: NavController, public sharedservice: SharedServices, public popoverCtrl: PopoverController) {
    storage.get('userObj').then(async (val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        this.getAllClub()
      
      }
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TipsPage');
  }

  getAllClub() {

      let x = this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data4) => {
        if (data4.length > 0) {
          this.allClub = []
          this.allClub = data4;
  
          this.allClub.forEach( club => {
               this.getAllActivity(club.$key);
          })
          x.unsubscribe()
      
        }

    })
  }

  getAllActivity(selectedClubKey) {
      let x = this.fb.getAll("/Activity/" + this.parentClubKey + "/" + selectedClubKey + "/").subscribe( (data) => {

        this.selectedActivity = "";
        if (data.length > 0) {
          data.forEach( activity => {
  
  
            if (activity.IsActive) {
              let obj = {
                ActivityName: activity.ActivityName,
                ActivityCode: activity.ActivityCode,
                ActivityKey: activity.$key,
                IsShowCat: false,
                IsExistActivityCategory: activity.IsExistActivityCategory,
                ActivityImageURL: activity.ActivityImageURL
              }
              let activityarr: any = this.activity
              const isalreadypresent = activityarr.some(act => act.ActivityName == obj.ActivityName)
              if (!isalreadypresent) {
                this.activity.push(obj)
              }
            }
          })
          this.tipList = []
          this.selectedActivity = this.activity[0].ActivityKey;
      
          this.getStandardSetup()
          
         
    
          x.unsubscribe()
        
        }
      
    })
  }
  
  // saveapp(){
  //   this.apptour.forEach(tour => {
  //     tour.CreateDate = new Date().toISOString()
  //     this.fb.saveReturningKey(`ApKids/AppTour`, tour)
  //   })
  // }
  


  getStandardSetup(){
    
      let z = this.fb.getAllWithQuery(`StandardCode/ApKids/Tips/${this.selectedActivity}`,{orderByChild:"IsActive", equalTo:true}).subscribe( data => {
        if (data.length > 0) {
          let standardTips = []
          standardTips = data
          standardTips.forEach(tip => {
            tip['IsStandard'] = true;
          })
  
          standardTips.forEach(tip => {
            if(!this.tipList.some(tips => tips.$key == tip.$key)){
              this.tipList.push(tip)
            }
          })
          this.gettips()
        }
  
        z.unsubscribe()
      })
    
    
  }

  gettips(){
    
    this.fb.getAllWithQuery(`ApKids/Tips/${this.parentClubKey}/${this.selectedActivity}`,{orderByChild:"IsActive", equalTo:true}).subscribe(data => {
      if (data.length > 0) {
        let tipkids = []
        tipkids = data
        tipkids.forEach(tip => {
          if(!this.tipList.some(tips => tips.$key == tip.$key)){
            this.tipList.push(tip)
          }
        })
      }
     
    })
  
  }


  gotoEdit(item) {
    if (!item.IsStandard){
      this.navCtrl.push('Createtip', { tip: item})
    }else{
      this.commonService.toastMessage('Not editable', 2000);
    }
   
  }

  gototipforreview(){
    this.navCtrl.push('Createtip', {standard:true})
  }

  gototip() {
    this.navCtrl.push('Createtip')
  }

}


