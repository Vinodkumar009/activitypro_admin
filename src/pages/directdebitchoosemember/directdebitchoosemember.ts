import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, isActivatable, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../services/firebase.service';
import { HttpClient, HttpParams,HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import * as $ from 'jquery';
import { JsonPipe } from '@angular/common';
import { DirectDebitController } from '../../controller/directdebit.controller';
/**
 * Generated class for the DirectdebitchoosememberPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-directdebitchoosemember',
  templateUrl: 'directdebitchoosemember.html',
})
export class DirectdebitchoosememberPage {
  httpOptions = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'secret-key'
    })
};
  selectedParentClubKey:any = "";
  clubList:Array<any> = [];
  selectedClub:any = {};
  memberList:Array<any> = [];
  searchList:Array<any> = [];
  isVarified:boolean = false;
  selectedType:string = "";
  perMemberObj:any = {};
  selectedMember:any = {};
  loading:any = "";
  constructor(public navCtrl: NavController, public navParams: NavParams, storage: Storage,public fb:FirebaseService,private http:HttpClient,public loadingCtrl: LoadingController) {
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      for (let user of val.UserInfo) {
        if (val.$key != "") {
          this.selectedParentClubKey = user.ParentClubKey;
          
        }
      }
      this.getClubDetails();
    }).catch(error => {

    });
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad DirectdebitchoosememberPage');
	
	//Testing svn lock commit
  }
  getClubDetails(){
    this.fb.getAllWithQuery('Club/Type2/'+this.selectedParentClubKey,{orderByChild:'IsActive',equalTo:true}).subscribe((clubDetails)=>{
      this.clubList = clubDetails;
      if(this.clubList.length > 0){
        this.selectedClub = this.clubList[0].$key;
        this.getMemberDetails();
      }
    })
  }
  getMemberDetails(){
    this.proceed();
    this.fb.getAllWithQuery("Member/"+this.selectedParentClubKey+"/"+this.selectedClub,{orderByChild:"IsActive",equalTo:true}).subscribe((memberDetails)=>{
      this.memberList = memberDetails;
      this.memberList.forEach((member) =>{
        member["IsChecked"] = false;
      })
      this.searchList = JSON.parse(JSON.stringify(this.memberList));
    })
  }
  initializeItems(){
    this.searchList = JSON.parse(JSON.stringify(this.memberList));
  }
  getFilterItems(ev){
    try {
      // Reset items back to all of the items
      this.initializeItems();

      // set val to the value of the searchbar
      let val = ev.target.value;

      // if the value is an empty string don't filter the items
      if (val && val.trim() != '') {
        this.searchList = this.searchList.filter((item) => {
          if (item.FirstName != undefined || item.LastName != undefined) {
            if (item.FirstName.toLowerCase().indexOf(val.toLowerCase()) > -1) {
              return true;
            }else if(item.LastName.toLowerCase().indexOf(val.toLowerCase()) > -1){
              return true;
            }
            else {
              if (item.ChildMember != undefined) {
                for (let i = 0; i < item.ChildMember.length; i++) {
                  if (item.ChildMember[i].FullName.toLowerCase().indexOf(val.toLowerCase()) > -1) {
                    return true;
                  }
                }
              }
            }

          }
        })
      }
    }
    catch (ex) {
      let msg = "Some error occured! Pls. contact support";
    }
  }

  checkSetup(){
    return new Promise((resolve,reject) =>{
      let obj = {
        "parentClubKey":this.selectedParentClubKey,
        "clubKey":this.selectedClub
      }
      $.ajax({
        url: new DirectDebitController().getApi('checkAccessToken'),
        type: "POST", 
        data:obj,
        success: function(res){
         if(res.status == 200 && res.isAllow){
            resolve(res)
         }else{
           reject(res.status)
         
         }
        }
      });
    })
    
  }
  async proceed(){
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    try{
      let result = await this.checkSetup();
      this.loading.dismiss().catch(() => { });
      if(result){
        this.isVarified = true;
      }
    }catch(e){
      console.log('please add sendbox account');
      this.isVarified = false;
      this.loading.dismiss().catch(() => { });
    }
    
  }
  changeType(val){
    if(this.selectedMember != {} && this.selectedMember != undefined && this.selectedMember !=""){
      console.log('its a test    ');
      this.selectedType = Type[val];
      switch(this.selectedType){
        case Type.type1 :{
          this.navCtrl.push('InitiatemandatePage',{
            memberInfo:this.selectedMember
          });
        }
      }
    }else{
      
    }
  }
  selectMember(info){
    this.selectedMember = info;
  }
}
enum Type{
  type1 = "initiate",
  type2 = "one-off",
  type3 = "recurring"
}