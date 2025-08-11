import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
import { ToastController } from 'ionic-angular';
import { FirebaseService } from '../../../services/firebase.service';
import { Slides } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing';
import { NewsAndPhotoResult, NewsImageReturnType } from './input_output_model/news_photos.dto';

/**
 * Generated class for the ShoweventsandnewsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-showeventsandnews',
  templateUrl: 'showeventsandnews.html',
})

export class ShoweventsandnewsPage {
@ViewChild(Slides) slides: Slides;

headerName:any ="";
shareInfo:any="";
imgInfo:NewsAndPhotoResult ;
timeInterval:any="";
imageMenuList:any=[];
images:NewsImageReturnType[]
msg = "Check out the latest news from";
  constructor(public socialSharing: SocialSharing,public fb: FirebaseService,private toastCtrl: ToastController,public commonService:CommonService,public navCtrl: NavController, public navParams: NavParams) {
    this.imgInfo = this.navParams.get("imgInfo");
    this.headerName = this.imgInfo.category_name;

    console.log("Image information data is:",JSON.stringify(this.imgInfo));

    if(this.imgInfo.images != undefined){
      if(this.imgInfo.images.length == undefined){
      //  this.imgInfo.OtherImages = this.commonService.convertFbObjectToArray(this.imgInfo.OtherImages);
     
      }
    }
    
   // this.getVideoMenuList();
  }
  // getVideoMenuList(){
  //   this.fb.getAllWithQuery("News&Events/"+this.imgInfo.ParentClubKey,{orderByChild:"IsActive",equalTo:true}).subscribe((data)=>{
  //     this.imageMenuList=[];
  //     for(let i=0; i < data.length;i++){
  //       // && data[i].IsHeadLine == false
  //       if(data[i].$key != this.imgInfo.$key){
  //         data[i].OtherImages = this.commonService.convertFbObjectToArray(data[i].OtherImages);
  //         this.imageMenuList.push(data[i]);
  //       }
  //     }
  //   });
  // }
  ionViewDidLoad() {
    console.log('ionViewDidLoad ShoweventsandnewsPage');
   
    
  }
  getTime(numericValue){
    //let time = new Date().getTime() - new Date(value).getTime();
   // time = time / (1000*60*60*24);
   //  return time;
 
 
    //let dt1 = new Date();
     //let dt =  new Date(time);
     // let min = dt.getMinutes();
     // let hour = dt.getHours();
     // if(hour > 0){
     //   return hour+" "+'hours'+min+" min";
     // }else{
     //   return min+" "+"min"
     // }
     const value = parseFloat(numericValue);
     this.timeInterval = "";
     let time=0;
     let totalTimeInMiliSec = new Date().getTime() - new Date(value).getTime();
     if (totalTimeInMiliSec >= 0 && totalTimeInMiliSec < 60000) {
     
     time = totalTimeInMiliSec / 1000;
     if (Math.floor(time) <= 1) {
       this.timeInterval = Math.floor(time) + " sec";
     } else {
       this.timeInterval= Math.floor(time) + " secs";
     }
     }
     else if (totalTimeInMiliSec >= 60000 && totalTimeInMiliSec < 3600000) {
     time = totalTimeInMiliSec / 60000;
     if (Math.floor(time) <= 1) {
       this.timeInterval = Math.floor(time) + " min";
     } else {
       this.timeInterval = Math.floor(time) + " mins";
     }
     }
     else if (totalTimeInMiliSec >= 3600000 && totalTimeInMiliSec < 86400000) {
     
     time = totalTimeInMiliSec / 3600000;
     
     if (Math.floor(time) <= 1) {
     
       this.timeInterval = Math.floor(time) + " hr";
     } else {
       this.timeInterval = Math.floor(time) + " hrs";
     }
     }  
     else if (totalTimeInMiliSec >= 86400000 && totalTimeInMiliSec < 2678400000) {   
     time = totalTimeInMiliSec / 86400000;
     if (Math.floor(time) <= 1) {
       this.timeInterval = Math.floor(time) + " day";
     } else {
       this.timeInterval = Math.floor(time) + " days";
     }
     }
     else if (totalTimeInMiliSec >= 2678400000 && totalTimeInMiliSec < 31536000000) {
     time = totalTimeInMiliSec / 2678400000;
     if (Math.floor(time) <= 1) {
       this.timeInterval = Math.floor(time) + " month";
     } else {
       this.timeInterval = Math.floor(time) + " months";
     }
     } else if (totalTimeInMiliSec >= 31536000000) {
     time = totalTimeInMiliSec / 31536000000;
     if (Math.floor(time) <= 1) {
       this. timeInterval = Math.floor(time) + " yr";
     } else {
       this.timeInterval = Math.floor(time) + " yrs";
     }
     }
     return this.timeInterval;
 
   }
   showShare(){
    let modal = document.getElementById('myModal1');
    modal.style.display = "block";
    let num = this.slides.getActiveIndex();
    if(num == 0){
      this.shareInfo = this.imgInfo;
    }else{
      this.shareInfo = this.imageMenuList[num-1];
    }
   }

   closeModal(){
    let modal2 = document.getElementById('myModal1');
    if(event.target == modal2){
      modal2.style.display = "none";
    }
   
  }
  
  close(){

    let modal = document.getElementById('myModal1');
    modal.style.display = "none";
  }
    shareViaWhatsApp(){
      let data = this.msg+this.shareInfo.ParentClubName +"\n"+"\n"+this.shareInfo.ImageTitle+"\n"+"\n"+"\n"+this.shareInfo.ImageDescription
     this.socialSharing.shareViaWhatsApp(data,this.shareInfo.ImageURL,"");
     //console.log(data);
    }
    shareViaFacebook(){
      this.socialSharing.shareViaFacebook("#"+this.shareInfo.ParentClubName+"\n\n"+this.shareInfo.ImageTitle, this.shareInfo.ImageURL,"");
    }
    shareViaEmail(){
      this.socialSharing.shareViaEmail(this.msg+" "+this.shareInfo.ParentClubName +"\n"+"\n"+this.shareInfo.ImageDescription, this.shareInfo.ImageTitle, [], [], [],this.shareInfo.ImageURL);
    }
    shareViaTwitter(){
      let data = "#"+this.shareInfo.ParentClubName+"\n\n"+this.shareInfo.ImageTitle;
      this.socialSharing.shareViaTwitter(data,this.shareInfo.ImageURL,"");
    }
    shareViaInstagram(){
      this.socialSharing.shareViaInstagram("#"+this.shareInfo.ParentClubName+"\n\n"+this.shareInfo.ImageTitle, this.shareInfo.ImageURL)
    }
    slideChanged() {
      let currentIndex = this.slides.getActiveIndex();
     if(currentIndex < this.slides.length()){
     
      if(currentIndex == 0){
        this.headerName = this.imgInfo.category_name;
      }else{
        this.headerName = this.imageMenuList[currentIndex-1].CategoryName;
      }
     }
     
    }
     
    
}
