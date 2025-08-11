import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser'
import { FirebaseService } from '../../../services/firebase.service';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Videos } from './models/videolisting.dto';
/**
 * Generated class for the ShowvideofromlistPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-showvideofromlist',
  templateUrl: 'showvideofromlist.html',
})
export class ShowvideofromlistPage {
  @ViewChild(Slides) slides: Slides;
  activityName: any = "";
  VideoType: any = "";
  map = new Map();
  msg = "Check out the latest video from ";
  shareInfo: any = "";
  HeaderInfo: Videos
  HeaderInfoTemp: Videos;
  VideoMenuListTemp: Videos | null = null;;
  VideoMenuList: Videos | null = null;;

  url: any = "";
  timeInterval = "";
  constructor(public socialSharing: SocialSharing, public fb: FirebaseService, private dom: DomSanitizer, public navCtrl: NavController, public navParams: NavParams) {
    this.HeaderInfo = this.navParams.get('vidInfo');
    this.HeaderInfoTemp = this.navParams.get('vidInfoTemp');
    this.activityName = this.HeaderInfo.associated_activity;
    this.url = this.safe(this.HeaderInfo.unsanitized_video_url);
    // this.getVideoMenuList();

  }
  safe(url) {
    return this.dom.bypassSecurityTrustResourceUrl(url);
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad ShowvideofromlistPage');
  }
  // getVideoMenuList(){
  //   this.fb.getAllWithQuery("Videos/"+this.HeaderInfo.parentclub_key,{orderByKey:true}).subscribe((data)=>{
  //     this.VideoMenuList=[];
  //     this.VideoMenuListTemp = [];
  //     for(let i=0; i < data.length;i++){

  //       if(data[i].IsActive == true && data[i].$key != this.HeaderInfo.id){
  //         this.VideoMenuListTemp.push(data[i]);
  //         data[i].VideoURL = this.safe(this.transform(data[i].VideoURL));
  //         this.VideoMenuList.push(data[i]);
  //       }
  //     }
  //   });
  // }
  transform(url) {
    // copy video url = uhttps://youtu.be/8-XTJ23QKzA
    //  copy video at current time = https://youtu.be/8-XTJ23QKzA?t=12
    // https://www.youtube.com/embed/8-XTJ23QKzA

    //........................................


    // facebook  = 'https://www.facebook.com/AmazingThingsAnimal/videos/638367449833824/?t=5'
    // facebook embeded = 'http://www.facebook.com/video/embed?video_id=10152463995718183'



    //..........................................
    this.VideoType = "";
    let checkURL = url.split('//');
    let checkPlatformList = checkURL[1].split('/');
    if (checkPlatformList[0] == "www.facebook.com") {

      let spliID = url.split("/");
      let ID = spliID[spliID.length - 2];
      this.map.set("http://www.facebook.com/video/embed?video_id=" + ID, "facebook");
      return "http://www.facebook.com/video/embed?video_id=" + ID
    } else if (checkPlatformList[0] == "youtu.be" || checkPlatformList[0] == "www.youtube.com") {
      console.log('it is youtube video')

      let tempURL = "https://www.youtube.com/embed/";
      let splitURL = url.split('/');
      let splitURL2 = url.split('?');
      if (splitURL2.length > 1) {
        let splitURL3 = splitURL2[0].split('/');
        tempURL = tempURL + splitURL3[splitURL.length - 1];
        this.map.set(tempURL, "youtube");
        return tempURL;
      } else {
        tempURL = tempURL + splitURL[splitURL.length - 1];
        this.map.set(tempURL, "youtube");
        return tempURL;
      }
    } else {
      return url;
    }




  }

  getTime(numericValue) {
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
    let time = 0;
    let totalTimeInMiliSec = new Date().getTime() - new Date(value).getTime();
    if (totalTimeInMiliSec >= 0 && totalTimeInMiliSec < 60000) {

      time = totalTimeInMiliSec / 1000;
      if (Math.floor(time) <= 1) {
        this.timeInterval = Math.floor(time) + " sec";
      } else {
        this.timeInterval = Math.floor(time) + " secs";
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
        this.timeInterval = Math.floor(time) + " yr";
      } else {
        this.timeInterval = Math.floor(time) + " yrs";
      }
    }
    return this.timeInterval;

  }

  slideChanged() {
    let currentIndex = this.slides.getActiveIndex();
    if (currentIndex < this.slides.length()) {

      if (currentIndex == 0) {
        this.activityName = this.HeaderInfo.associated_activity;
      } else {
        this.activityName = this.VideoMenuList[currentIndex - 1].AssociatedActivity;
      }
    }

  }
  close() {

    let modal = document.getElementById('myModal4');
    modal.style.display = "none";
  }
  closeModal() {
    let modal2 = document.getElementById('myModal4');
    if (event.target == modal2) {
      modal2.style.display = "none";
    }

  }

  shareViaWhatsApp() {
    let data = this.msg + this.shareInfo.ParentClubName + "\n" + "\n" + this.shareInfo.VideoTitle + "\n" + "\n" + "\n" + this.shareInfo.VideoDescription
    let x = "";
    if (this.shareInfo.VideoURL.changingThisBreaksApplicationSecurity == undefined) {
      x = this.shareInfo.VideoURL;
    } else {
      x = this.shareInfo.VideoURL.changingThisBreaksApplicationSecurity;
    }
    this.fb.getAllWithQuery("Videos/" + this.HeaderInfo.parentclub_key, { orderByKey: true, equalTo: this.shareInfo.$key }).subscribe((temp) => {
      x = temp[0].VideoURL;
      this.socialSharing.shareViaWhatsApp(data, "", "\n\n" + x);
    });
  }
  shareViaFacebook() {
    this.socialSharing.shareViaFacebook("#" + this.shareInfo.ParentClubName + "\n\n" + this.shareInfo.VideoTitle, this.getThumbnail(this.shareInfo.VideoURL), this.shareInfo.VideoURL);
  }
  shareViaEmail() {
    this.socialSharing.shareViaEmail(this.msg + " " + this.shareInfo.ParentClubName + "\n" + "\n" + this.shareInfo.VideoDescription, this.shareInfo.VideoTitle, [], [], [], this.getThumbnail(this.shareInfo.VideoURL));
  }
  shareViaTwitter() {
    let data = "#" + this.shareInfo.ParentClubName + "\n\n" + this.shareInfo.VideoTitle;
    this.socialSharing.shareViaTwitter(data, this.getThumbnail(this.shareInfo.VideoURL), this.shareInfo.VideoURL);
  }
  shareViaInstagram() {
    this.socialSharing.shareViaInstagram("#" + this.shareInfo.ParentClubName + "\n\n" + this.shareInfo.VideoTitle, this.getThumbnail(this.shareInfo.VideoURL))
  }
  getThumbnail(vidURL) {
    //let k = vidURL.$key
    // vidURL : https://www.youtube.com/embed/8-XTJ23QKzA
    // need   :"http://img.youtube.com/vi/" + videoID +"/0.jpg";

    // facebook need = ''"https://graph.facebook.com/VIDEO_ID/picture" 
    // facebook URL = 'http://www.facebook.com/video/embed?video_id=10152463995718183'

    //ßvidURL = vidURL.changingThisBreaksApplicationSecurity;
    if (vidURL.changingThisBreaksApplicationSecurity == undefined) {

    } else {
      vidURL = vidURL.changingThisBreaksApplicationSecurity;
    }
    if (this.map.get(vidURL) == "youtube") {
      let splitURL = vidURL.split("/");
      let ID = splitURL[splitURL.length - 1];
      return "http://img.youtube.com/vi/" + ID + "/0.jpg"

    } else if (this.map.get(vidURL) == "facebook") {
      let splitURL = vidURL.split("=");
      let ID = splitURL[splitURL.length - 1];
      return "https://graph.facebook.com/" + ID + "/picture"
    } else {
      return "https://multimedia.europarl.europa.eu/o/europarltv-theme/images/europarltv/media-default-thumbnail-url-video.png";
    }

  }
  showShare() {
    let modal = document.getElementById('myModal4');
    modal.style.display = "block";
    let num = this.slides.getActiveIndex();
    if (num == 0) {
      this.shareInfo = this.HeaderInfoTemp;

    } else {
      this.shareInfo = this.VideoMenuList[num - 1];
    }
  }

}
