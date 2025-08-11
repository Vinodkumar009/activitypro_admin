import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController,  LoadingController } from 'ionic-angular';
import { Apollo, QueryRef } from 'apollo-angular';
import { HttpLink } from 'apollo-angular-link-http'
import gql from 'graphql-tag';
import { Storage } from '@ionic/storage';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { FirebaseService } from '../../../../services/firebase.service';

/**
 * Generated class for the AgecategoryPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-agecategory',
  templateUrl: 'agecategory.html',
})
export class AgecategoryPage {
  parentClubKey:string = "";
  SelectedStartAge:number;
  SelectedEndAge:number;
  ageCategories:ageCategoriesModel[] = [];
  isNoCatgs:boolean = false;
  // ageCategories:Array<AgeCategory> = [
  //   {CategoryName:"Childern", AgeFrom:0, AgeTo:14,Description:""},
  //   {CategoryName:"Youth", AgeFrom:15,AgeTo:24,Description:""},
  //   {CategoryName:"Adults", AgeFrom:25,AgeTo:30,Description:""},
  //   {CategoryName:"Seniors", AgeFrom:31,AgeTo:40,Description:""},
  // ]
  constructor(public navCtrl: NavController, public navParams: NavParams,private apollo: Apollo, private httpLink: HttpLink, public commonService: CommonService, public loadingCtrl: LoadingController, public actionSheetCtrl: ActionSheetController, public storage: Storage, public fb: FirebaseService, ) {
  
    
  }


  ionViewWillEnter(){
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        this.getAgeCategories();
      }
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AgecategoryPage');
  }


  getAgeCategories = () => {
    this.commonService.showLoader("Fetching Agecategories...")
    const ageCategoryQuery = gql`
    query getAgeCategories($parentClub:String!) {

      getAgeCategories(ParentClub:$parentClub){
        Id
        CategoryName
        AgeFrom
        AgeTo
        Description
      }
    }
  `;
 this.apollo
  .query({
    query: ageCategoryQuery,
    fetchPolicy: 'network-only',
    variables: {
      parentClub:this.parentClubKey,
    },
  })
  .subscribe(({data}) => {
    console.log('age categories data' + data["getAgeCategories"]);
    this.commonService.hideLoader();
    this.isNoCatgs = data["getAgeCategories"].length > 0 ? false : true;
    //this.commonService.toastMessage("Age categories fetched",2500,ToastMessageType.Success,ToastPlacement.Bottom);
    this.ageCategories = data["getAgeCategories"] as ageCategoriesModel[];
    
  },(err)=>{
    this.commonService.hideLoader();
    this.commonService.toastMessage("Age categories fetch failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
  });
  }


  createCategory(){
    this.navCtrl.push("Addagecategory");
  }

  showAcionSheet(category:any){
    let actionSheet = this.actionSheetCtrl.create({
      title:`${category.CategoryName}`,
      buttons: [
        {
          text: 'Delete',
          icon:'trash',
          handler: () => {
            this.deleteAgeCategory(category.Id);
          }
        },
        {
          text:'Close',
          icon:'close',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
 
    actionSheet.present();
  }

  //delete
  deleteAgeCategory = (categorykey:string) => {
    this.commonService.showLoader("Please wait...")
  
    this.apollo
      .mutate({ 
        mutation: gql`
        mutation removeAgeCategory($parentClubKey:String!,$categoryKey:String!) {
          removeAgeCategory(ParentClubKey:$parentClubKey,CategoryKey:$categoryKey)
        }`,
        variables: {
          parentClubKey:this.parentClubKey,
          categoryKey:categorykey
        },
      })
      .subscribe(({data}) => {
        //console.log('challenges data' + data["getChallengesByParentClubAndActivity"]);
        this.commonService.hideLoader();
        this.commonService.toastMessage("Age category removed",2500,ToastMessageType.Success,ToastPlacement.Bottom); 
        this.navCtrl.pop();
      },(err)=>{
        this.commonService.hideLoader();
        console.log(JSON.stringify(err));
        this.commonService.toastMessage("removal failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
      });
   
  }


}

export class ageCategoriesModel{
  CategoryName:string;
  AgeFrom:number;
  AgeTo:number;
  Description:string;  
}
