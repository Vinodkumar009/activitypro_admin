import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, AlertController, LoadingController} from 'ionic-angular';
import moment from 'moment';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { CommonService, ToastMessageType } from '../../../services/common.service';
import { FirebaseService } from '../../../services/firebase.service';
import { SharedServices } from '../../services/sharedservice';

/**
 * Generated class for the FilterbookingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-superuserpromotion',
  templateUrl: 'superuserpromotion.html',
})
export class SuperuserPromotion {
  TempParentClubs=[];
  parentclubs=[];
  totalmembercount: any;
  nestUrl: any;
  countparentClubs = []

  HomeSetupPromotion= {
    Size: SIZE.default,
    IsEnable: true,
    CreatedDate: 0,
    Placement: PLACEMENT.top,
  }
  DashBoardSetupPromotion= {
    Size: SIZE.small,
    IsEnable: true,
    CreatedDate: 0,
    Placement: PLACEMENT.top,
  }
  APProSetupPromotion= {
    Size: SIZE.small,
    IsEnable: true,
    CreatedDate: 0,
    Placement: PLACEMENT.top,
  }

  sizeArr = [
    {name:'Small', code:SIZE.small},
    {name:'Standard', code:SIZE.default},
    {name:'large', code:SIZE.large}
  ]

  placementArr = [
    {name:'Top', code:PLACEMENT.top},
    {name:'Bottom', code:PLACEMENT.bottom}
  ]
  selectedParentClubKey: any;
  selectedPrentClub: any;
  setupType = 'Home';
  promotion = [];
  isUpdate: any = false;
  APProSetupPromotionBackup = [];
  DashBoardSetupPromotionBackup = [];
  HomeSetupPromotionBackup = []
  constructor(public navCtrl: NavController, 
    public loadingCtrl: LoadingController, 
    public storage: Storage,
    private http:HttpClient,
    public commonService: CommonService,
    public fb: FirebaseService,
    public navParams: NavParams,
    public sharedService:SharedServices) {
    this.setupType = 'Home';
    this.nestUrl = this.sharedService.getnestURL();
    this.parentclubs = this.navParams.get('parentclubs')
    this.parentclubs.forEach(club => club["IsEnable"] = false)
    //this.globalPromotionScript()
  }
 
  getFilterItems(ev: any) {
    // Reset items back to all of the items
    let val = ev.target.value;
    this.TempParentClubs = JSON.parse(JSON.stringify(this.parentclubs))
    // if the value is an empty string don't filter the items
    if (val && val.trim() != '' && val.length > 3) {
      this.TempParentClubs = this.parentclubs.filter((item) => {
        if (item.ParentClubName != undefined) {
          return (item.ParentClubName.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }
      })
    } else {
      this.TempParentClubs = this.parentclubs;
    }
  }

  GetSetupInfo(parent){
    this.selectedParentClubKey = parent.Key
    this.selectedPrentClub = parent.ParentClubName
    this.TempParentClubs = []
    parent.IsEnable = true
    this.getSetup()
  }

  getSetup(){
    this.fb.getAllWithQuery(`ActivityPro/Promotions/${this.selectedParentClubKey}`,{orderByChild:"IsActive", equalTo:true}).subscribe(data =>{
      if (data.length > 0){
        this.promotion = data
      }
    })
    this.fb.getAll(`APSetup/${this.selectedParentClubKey}/PromotionSetup`).subscribe(data =>{
      if(data.length > 0){
        this.HomeSetupPromotionBackup = data.filter(setup => setup.$key == "HomeSetup")
        if (this.HomeSetupPromotionBackup.length > 0){
          this.HomeSetupPromotion = this.HomeSetupPromotionBackup [0]
        }
        this.DashBoardSetupPromotionBackup = data.filter(setup => setup.$key == "DashBoardSetup")
        if (this.DashBoardSetupPromotionBackup.length > 0){
          this.DashBoardSetupPromotion = this.DashBoardSetupPromotionBackup[0]
        }
        this.APProSetupPromotionBackup = data.filter(setup => setup.$key == "APProSetup")
        if (this.APProSetupPromotionBackup.length > 0){
          this.APProSetupPromotion = this.APProSetupPromotionBackup[0]
        }
        this.isUpdate = true
      }
    })
  }

  gotoCreatePromotion(){
    this.navCtrl.push('CreateSuperPromotion', {ClubKey:this.selectedParentClubKey})
  }

  gotoeditPromo(promo){
    this.navCtrl.push('CreateSuperPromotion', {ClubKey:this.selectedParentClubKey, prmotion:promo})
  }
  saveSetup(){
    if(!this.isUpdate){
      this.HomeSetupPromotion.CreatedDate = new Date().getTime()
      this.DashBoardSetupPromotion.CreatedDate = new Date().getTime()
    }
    if (this.setupType == 'Home'){
      if (this.HomeSetupPromotionBackup.length > 0)
        delete this.HomeSetupPromotion['$key'] 
      this.fb.update('HomeSetup',`APSetup/${this.selectedParentClubKey}/PromotionSetup`, this.HomeSetupPromotion)
    }
    if(this.setupType == 'DashBoard'){
      if (this.DashBoardSetupPromotionBackup.length > 0)
        delete this.DashBoardSetupPromotion['$key']
      this.fb.update('DashBoardSetup',`APSetup/${this.selectedParentClubKey}/PromotionSetup`, this.DashBoardSetupPromotion)
    }
    if (this.setupType == 'APPro'){
      if (this.DashBoardSetupPromotionBackup.length > 0)
        delete this.APProSetupPromotion['$key']
      this.fb.update('APProSetup',`APSetup/${this.selectedParentClubKey}/PromotionSetup`, this.APProSetupPromotion)
    }
    this.commonService.toastMessage('Saved...', 2000, ToastMessageType.Success)
  }

  globalPromotionScript(){
    let obj = {
      Title:'Demo Global Promotion',
      ImageUrl:'https://en.wikipedia.org/wiki/Image#/media/File:Tourism_in_London795.jpg',
      Sequence:1,
      RedirectedUrl:'www.facebook.com',
      CreationDate:new Date().getTime(),
      Description:'',
      IsEnable:true,
      IsActive:true
    }
    this.fb.saveReturningKey(`ActivityPro/GlobalPromotions`, obj)
    this.commonService.toastMessage('Saved Successfully...', 2000,ToastMessageType.Success)
  }

  sink(){
    try{
      this.commonService.commonAlter('Sink', 'Are you sure?', ()=>{
        this.commonService.showLoader()
        //this.nestUrl = "http://localhost:5000"
        this.http.post(`${this.nestUrl}/superadmin/sinkglobalpromotion`,{
          type:'global'
        }).subscribe((data) => {
          this.commonService.hideLoader()
          if (data['data']){
            this.commonService.toastMessage('Sink Done...', 2000, ToastMessageType.Success)
          }
        }, err => {
          this.commonService.hideLoader()
        })
      })
    }catch(err){
      
    }
  }




}

export enum PLACEMENT{
  top,
  bottom
}
export enum SIZE {
  default=0,
  small=1,
  large=2
}


//activitypro17@gmail.com