import { Component } from '@angular/core';
import { Pipe } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, ActionSheetController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import { SocialSharing } from '@ionic-native/social-sharing';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { Video } from '../../Model/VideoSection';
import { SharedServices } from '../../services/sharedservice';
import gql from 'graphql-tag';
import { GraphqlService } from '../../../services/graphql.service';
import { Videos, VideosInput_V2 } from './models/videolisting.dto';
import { first } from "rxjs/operators";
// import { Video } from '../../../model/VideoSection';

/**
 * Generated class for the VideomenueslistingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-videomenueslisting',
  templateUrl: 'videomenueslisting.html',
})
//@Pipe({ name: 'safe' })
export class VideomenueslistingPage {
  shareInfo: Videos;
  videoObj = new Video();
  activityList: any = [];
  // VideoMenuList: any = [];
  selectedActivity: any = "";
  // HeaderInfo: any = {};
  HeaderInfoTemp: Videos | null = null;
  VideoMenuListTemp: Videos = {} as Videos;

  URL: any = "";
  test: string;
  timeInterval: any = "";
  VideoType: any = "";
  videoType: any = {};
  tempKey: any = "";
  map = new Map();
  msg = "Check out the latest video from ";
  // headerUrl: any = "";

  postgre_parentclub: string;


  healineUpDate: HealineUpdateInput = {
    id: '',
    ParentClubId: ''
  }

  input: VideoEnableDisableInput = {
    id: '',
    is_enable: false
  }

  videosInput: VideosInput_V2 = {
    user_postgre_metadata: {
      UserParentClubId: ''
    },

    user_device_metadata: {
      UserAppType: 0,
      UserActionType: 0,
      UserDeviceType: 0
    }
  };

  parentClubKey: any = "";
  clubKeys: any = [];
  mlist: any = [];
  tokenList: any = [];
  deviceTokens: any = [];
  //videoOption:VideoOptions;
  videos: Videos[] = [];
  VideoMenuList: Videos[] = [];
  //HeaderInfo: Videos = {};
  HeaderInfo: Videos | null = null;

  headerUrl:SafeResourceUrl = '';
  // headerInfo: Videos;
  //  headerInfoTemp: Videos;

  videoMenuListTemp: Videos[];
  videoMenuList: Videos[];

  constructor(public sharedservice: SharedServices,
    public alertCtrl: AlertController, 
    private graphqlService: GraphqlService, 
    public socialSharing: SocialSharing, 
    private dom: DomSanitizer, 
    public actionSheetCtrl: ActionSheetController, 
    public commonService: CommonService, 
    public fb: FirebaseService,
   // private storage: Storage,
    public navCtrl: NavController,
    public navParams: NavParams, 
    private sharedService: SharedServices) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad VideomenueslistingPage');
  }

  ionViewWillEnter(){
    this.postgre_parentclub = this.sharedService.getPostgreParentClubId();
    this.commonService.category.pipe(first()).subscribe((data) => {
      if(data == "refresh_videos"){
        this.videoObj.CreatedBy = this.sharedService.getParentclubKey();
        this.videoObj.ParentClubKey = this.sharedService.getParentclubKey();
        this.videosInput.user_postgre_metadata.UserParentClubId = this.postgre_parentclub;
        this.getVideoList();
      }
    })
  }

  
  getFilterItems(event) {
    // this.fb.getAllWithQuery("Videos/"+this.videoObj.ParentClubKey,{orderByChild:'AssociatedActivity',equalTo:this.selectedActivity});
  }
  
  checkInclusion(word: string): boolean {
    let x: boolean = false;
    for (let i = 0; i < this.activityList.length; i++) {
      if (this.activityList[i].Key.trim().toLowerCase() == word.trim().toLowerCase()) {
        x = true;
        break;
      } else {
        x = false;
      }

    }
    return x;
  }

  
  goTocreatepage() {
    this.navCtrl.push('CreatevideomenuPage');
  }
  transform(url) {
    // copy video url = uhttps://youtu.be/8-XTJ23QKzA
    //  copy video at current time = https://youtu.be/8-XTJ23QKzA?t=12
    // https://www.youtube.com/embed/8-XTJ23QKzA

    //........................................


    // facebook  = 'https://www.facebook.com/AmazingThingsAnimal/videos/638367449833824/?t=5'
    // facebook embeded = 'http://www.facebook.com/video/embed?video_id=10152463995718183'



    //..........................................
    if (!url) {
      return url; // or handle the case when url is undefined
    }

    this.VideoType = "";
    let checkURL = url.split('//');
    //let checkPlatformList = checkURL[1].split('/');
    const checkPlatformList = new URL(url).hostname.split('.').slice(-2).join('.');

    if (checkPlatformList === "facebook.com") {
      const videoID = url.split('/').pop();
      const embedURL = `https://www.facebook.com/video/embed?video_id=${videoID}`;
      return embedURL;
    } else if (checkPlatformList === "youtu.be") {
      const videoID = url.split('/').pop();
      const embedURL = `https://www.youtube.com/embed/${videoID}`;
      return embedURL;
    } else if (checkPlatformList === "youtube.com") {
      const urlParams = new URLSearchParams(new URL(url).search);
      const videoID = urlParams.get('v');
      if (videoID) {
        const embedURL = `https://www.youtube.com/embed/${videoID}`;
        return embedURL;
      }
    }
    return url; // Return the original URL if no match
  }


  getTime(timestamp: string) {
    this.timeInterval = "";
  let time = 0;

  // Create a date object from the numeric value (timestamp in milliseconds)
  const createdAt = new Date(Number(timestamp));

  // Get the current time in milliseconds
  const currentTime = new Date().getTime();

  // Adjust for the time zone offset of the created date
  const timeZoneOffset = createdAt.getTimezoneOffset() * 60000;
  const localCreatedTime = createdAt.getTime() - timeZoneOffset;

  // Calculate the time difference in milliseconds
  let totalTimeInMiliSec = currentTime - localCreatedTime;

  // Define time intervals
  const sec = 1000;
  const min = 60 * sec;
  const hr = 60 * min;
  const day = 24 * hr;
  const month = 30 * day; // Approximate
  const year = 365 * day; // Approximate

  // Determine the appropriate time interval
  if (totalTimeInMiliSec < min) {
    time = totalTimeInMiliSec / sec;
    this.timeInterval = `${Math.floor(time)} sec${Math.floor(time) !== 1 ? 's' : ''}`;
  } else if (totalTimeInMiliSec < hr) {
    time = totalTimeInMiliSec / min;
    this.timeInterval = `${Math.floor(time)} min${Math.floor(time) !== 1 ? 's' : ''}`;
  } else if (totalTimeInMiliSec < day) {
    time = totalTimeInMiliSec / hr;
    this.timeInterval = `${Math.floor(time)} hr${Math.floor(time) !== 1 ? 's' : ''}`;
  } else if (totalTimeInMiliSec < month) {
    time = totalTimeInMiliSec / day;
    this.timeInterval = `${Math.floor(time)} day${Math.floor(time) !== 1 ? 's' : ''}`;
  } else if (totalTimeInMiliSec < year) {
    time = totalTimeInMiliSec / month;
    this.timeInterval = `${Math.floor(time)} month${Math.floor(time) !== 1 ? 's' : ''}`;
  } else {
    time = totalTimeInMiliSec / year;
    this.timeInterval = `${Math.floor(time)} yr${Math.floor(time) !== 1 ? 's' : ''}`;
  }

  return this.timeInterval;
  }
  
 
  goToShowVideo(vid: Videos) {
    this.navCtrl.push('ShowvideofromlistPage', {
      vidInfo: vid,
      vidInfoTemp: this.shareInfo
    });
  }

  getThumbnail(vidURL) {
    let k = vidURL.$key
    if (this.map.get(vidURL) == "youtube") {
      let splitURL = vidURL.split("/");
      let ID = splitURL[splitURL.length - 1];
      return `https://img.youtube.com/vi/${ID}/0.jpg`
    } else if (this.map.get(vidURL) == "facebook") {
      let splitURL = vidURL.split("=");
      let ID = splitURL[splitURL.length - 1];
      //return "https://graph.facebook.com/"+ID+"/picture"
      return "https://multimedia.europarl.europa.eu/o/europarltv-theme/images/europarltv/media-default-thumbnail-url-video.png";
    } else {
      return "https://multimedia.europarl.europa.eu/o/europarltv-theme/images/europarltv/media-default-thumbnail-url-video.png";
    }
  }

  showActionSheet(vidInfo: Videos, index) {
    if (index == -1) {
      this.shareInfo = this.HeaderInfoTemp;
    } else {
      this.shareInfo = this.VideoMenuListTemp[index];
    }
    
    let alert_options:{title:string,message:string,buttons:any[]} = {
      title: '',
      message:'',
      buttons: []
    };
  
     alert_options.buttons.push(
          {
            text: 'Play',
            handler: () => {
              this.goToShowVideo(vidInfo);
            }
          }, {
            text: 'Edit',
            handler: () => {
              this.navCtrl.push('EditvideoPage', {
                vidInfo: JSON.parse(JSON.stringify(vidInfo)), parentclubKey: this.videoObj.ParentClubKey
              });
            }
          },{
            text: vidInfo.is_enable ? 'Disable':'Enable',
            handler: () => {
              this.videoEnableOrDisable(vidInfo);
            }
          },{
            text: 'Delete',
            handler: () => {
              let prompt = this.alertCtrl.create({
                message: "Are you sure you want to delete the video?",
                buttons: [
                  {
                    text: 'No',
                    handler: () => {
                      
                    }
                  },
                  {
                    text: 'Yes',
                    // handler: data => {
                    //     this.cancelWeeklySession(Session);
                    // }
                    handler: data => {
                      this.deleteVideo(vidInfo)
                    }
                  }
                ]
              });
              prompt.present();
            }
          },{
            text: 'Cancel',
            role: 'cancel',
            handler: () => {

            }
          })
        
      
      if(vidInfo.is_enable){
        alert_options.buttons.push({
          text: 'Make HeadLine',
          handler: () => {
            this.updateHeadline(vidInfo);
          }
        })
      }
      const actionSheet = this.actionSheetCtrl.create(alert_options);
      actionSheet.present(); 

  }
  

  closeModal() {
    let modal = document.getElementById('myModal2');
    if (event.target == modal) {
      modal.style.display = "none";
    }

  }
  
  close() {
    let modal = document.getElementById('myModal2');
    modal.style.display = "none";
  }

  shareViaWhatsApp() {
    let data = this.msg + this.shareInfo.parentclub_name + "\n" + "\n" + this.shareInfo.parentclub_name + "\n" + "\n" + "\n" + this.shareInfo.video_description
    let x = "";
    // if (this.shareInfo.VideoURL.changingThisBreaksApplicationSecurity == undefined) {
    //   x = this.shareInfo.VideoURL;
    // } else {
    //   x = this.shareInfo.VideoURL.changingThisBreaksApplicationSecurity;
    // }
    this.fb.getAllWithQuery("Videos/" + this.HeaderInfo.parentclub_key, { orderByKey: true, equalTo: this.shareInfo.id }).subscribe((temp) => {
      x = temp[0].VideoURL;
      this.socialSharing.shareViaWhatsApp(data, "", "\n\n" + x);
    });
  }
  shareViaFacebook() {
    this.socialSharing.shareViaFacebook("#" + this.shareInfo.parentclub_name + "\n\n" + this.shareInfo.video_title, this.shareInfo.video_url, this.shareInfo.video_url);
  }
  shareViaEmail() {
    this.socialSharing.shareViaEmail(this.msg + " " + this.shareInfo.parentclub_name + "\n" + "\n" + this.shareInfo.video_description + "\n" + this.shareInfo.video_url, this.shareInfo.video_title, [], [], []);
  }
  shareViaTwitter() {
    let data = "#" + this.shareInfo.parentclub_name + "\n\n" + this.shareInfo.video_title;
    this.socialSharing.shareViaTwitter(data, this.shareInfo.video_url, this.shareInfo.video_url);
  }
  shareViaInstagram() {
    this.socialSharing.shareViaInstagram("#" + this.shareInfo.parentclub_name + "\n\n" + this.shareInfo.video_title, this.shareInfo.video_url)
  }






  sendNotification() {
    // let notificationDetailsObj = this.notificationObj;
    this.parentClubKey = this.shareInfo.parentclub_key;

    let pc = {
      CreatedTime: "", Message: '', SendBy: '', ComposeOn: '', Purpose: '', sendByRole: "", Status: "Unread", SessionName: '',
      Member: []
    };
    pc.SendBy = "Admin";
    pc.sendByRole = "Admin";
    pc.Purpose = "Info";
    pc.Message = "Check out the latest video from " + this.shareInfo.parentclub_name + "\n" + this.shareInfo.video_title;
    pc.SessionName = "";
    pc.CreatedTime = new Date().toString();
    pc.ComposeOn = new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();



    let memberObject = {
      CreatedTime: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate(),
      Message: "Check out the latest video from " + this.shareInfo.parentclub_name + "\n" + this.shareInfo.video_title,
      SendBy: 'Admin',
      ComposeOn: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate(),
      Purpose: 'Info',
      SessionName: "",
      sendByRole: "Admin",
      Status: "Unread",
      Admin: []
    };

    for (let i = 0; i < this.mlist.length; i++) {
      pc.Member.push({
        Name: this.mlist[i].FirstName + " " + this.mlist[i].LastName,
        Key: this.mlist[i].Key,
        ClubKey: this.mlist[i].ClubKey,
        SignedUpType: 1
      });
    }



    this.fb.saveReturningKey("Notification/ParentClub/" + this.parentClubKey + "/Session/ComposeNotification/", pc);

    for (let i = 0; i < this.mlist.length; i++) {
      memberObject.SendBy = "Admin";
      memberObject.sendByRole = "Admin";
      memberObject.Purpose = "";
      //  memberObject.SessionName = this.notificationObj.SessionName;
      memberObject.CreatedTime = new Date().toString();
      memberObject.ComposeOn = new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();
      memberObject.Status = "Unread";

      memberObject.Admin[0] = { Key: this.parentClubKey };
      this.fb.saveReturningKey("Notification/Member/" + this.parentClubKey + "/" + this.mlist[i].ClubKey + "/" + this.mlist[i].Key + "/Session/Notification/", memberObject);
    }


    let url = this.sharedservice.getEmailUrl();
    let pKey = this.sharedservice.getParentclubKey();
    let message = "Check out the latest video from " + this.shareInfo.parentclub_name + "\n" + this.shareInfo.video_title;
    this.fb.CallToApiForNotification({ URL: url, DeviceTokens: this.deviceTokens, Message: message, Subject: "Notification", ParentclubKey: pKey });

  }


  getVideoList() {
    //this.commonService.showLoader("Please Wait...")
    // console.log("after calling other getvideo function entering into list function and carrying value for ${this.videoMenuList} and ${ this.videos} ", JSON.stringify(this.videoMenuList), JSON.stringify(this.videos))
    const videoMenuList = gql`
    query  getAllVideos($videosinput: VideosInput_V2!){
      getAllVideos(videosinput:$videosinput){
        headline{
          id
          created_at
          created_by
          updated_at
          is_active
          associated_activity
          is_headline
          is_enable
          video_description
          video_tag
          video_title
          video_url
          thumbnail
          is_show_applus
          is_show_member
          unsanitized_video_url
          parentClub{
           Id
           ParentClubName
           FireBaseId
         }
         activity{
            Id
           FirebaseActivityKey
           ActivityName
       }
        }

        videoList{
          id
     
          created_at
          created_by
          updated_at
          is_active
          associated_activity
          is_headline
          is_enable
          video_description
          video_tag
          video_title
          video_url
          thumbnail
          is_show_applus
          is_show_member
          unsanitized_video_url
          parentClub{
           Id
           ParentClubName
           FireBaseId
         }
         activity{
            Id
           FirebaseActivityKey
           ActivityName
       }
        }

    }
  }
    `;
    this.graphqlService.query(videoMenuList, { videosinput: this.videosInput }, 0).subscribe((data: any) => {
      try{
        //this.commonService.hideLoader()
        this.videoMenuList = []
        //this.videoMenuListTemp = []
        let { headline, videoList } = data.data.getAllVideos;
        // Handle the headline video
        if (headline) {
          console.log("Headline video found:", JSON.stringify(headline));
          this.HeaderInfo = headline;
          this.HeaderInfo["created_at"] = this.getTime(this.HeaderInfo.created_at);
          this.HeaderInfo.video_url = this.transform(this.HeaderInfo.video_url);
          this.headerUrl = this.dom.bypassSecurityTrustResourceUrl(this.HeaderInfo.video_url);
          // setTimeout(() => {
          //   this.headerUrl = this.dom.bypassSecurityTrustResourceUrl(this.HeaderInfo.video_url);
          // },1000)
          
        }else {
          // If no headline video, set HeaderInfo to null
          this.HeaderInfo = null;
        }


        videoList = videoList.map((video)=>{
          video.created_at = this.getTime(video.created_at);
          //video.video_url = this.transform(video.video_url);
          return video;
        })
        this.VideoMenuList = videoList.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

        console.log('VideoMenuList:', this.VideoMenuList);
        console.log('HeaderInfo:', this.HeaderInfo);
      }catch(error){
        console.log("error in catch",error)
      }
      
    },
      (error) => {
        //this.commonService.hideLoader();
        console.error("Error in fetching:", error);
        if (error.graphQLErrors) {
          console.error("GraphQL Errors:", error.graphQLErrors);
          for (const gqlError of error.graphQLErrors) {
            console.error("Error Message:", gqlError.message);
            console.error("Error Extensions:", gqlError.extensions);
          }
        }
        if (error.networkError) {
          console.error("Network Error:", error.networkError);
        }

      }
    )
  }

  deleteVideo(vidInfo: Videos) {
    try {
      // Set the headers (optional)
      const delete_video = gql`
        mutation deleteVideo($videoInput: String!) {
          deleteVideo(videoInput: $videoInput) 
            
        }`;

      const delete_video_variable = { videoInput: vidInfo.id };

      this.graphqlService.mutate(
        delete_video,
        delete_video_variable,
        0
      ).subscribe((response) => {
        const message = "Video deleted successfully";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.getVideoList();
      }, (err) => {
        // Handle GraphQL mutation error
        console.error("GraphQL mutation error:", err);
        this.commonService.toastMessage("Session deletion failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      });

    } catch (error) {
      console.error("An error occurred:", error);
    }
  }



  updateHeadline(vidInfo) {
    try {
      const headlineUpdate = {
        id: vidInfo.id,
        ParentClubId: this.postgre_parentclub
      };

      const updateHeadlineMutation = gql`
        mutation updateVideoHeadline($videoInput: HealineUpdateInput!) {
          updateVideoHeadline(videoInput: $videoInput)
        }
      `;

      const variables = { videoInput: headlineUpdate };

      this.graphqlService.mutate(updateHeadlineMutation, variables, 0)
        .subscribe(
          () => {
            const message = "Video headline successfully updated.";
            this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
            if (this.HeaderInfo && this.HeaderInfo.id === vidInfo.id) {
              this.HeaderInfo = null;
            }
            console.log("Headline update successful. Refreshing video list...");
            this.getVideoList();
          },
          (err) => {
            console.error("GraphQL mutation error:", err);
            this.commonService.toastMessage("Failed to update video headline.", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          }
        );
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }



  videoEnableOrDisable(vidInfo) {
    try {
      this.input.is_enable = !vidInfo.is_enable;
      this.input.id = vidInfo.id;
      const enable_video = gql`
     
      mutation enableDisableVideo($videoInput: VideoEnableDisableInput!){
       enableDisableVideo(videoInput:$videoInput)
      }
      `;
      const update_status = { videoInput: this.input }
      this.graphqlService.mutate(
        enable_video,
        update_status,
        0
      ).subscribe((response) => {
        const message = vidInfo.is_enable ? "Video disabled successfully" : "Video enabled successfully";;
        this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.getVideoList();
      }, (err) => {
        // Handle GraphQL mutation error
        console.error("GraphQL mutation error:", err);
        const message = vidInfo.is_enable ? "Video disable failed" : "Video enable failed";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      });
    } catch (error) {
      console.log("An error occured:", error)
    }
  }

  ionViewWillLeave(){
    //this.commonService.updateCategory("");
  }

}

export class HealineUpdateInput {
  id: string
  ParentClubId: string
}

export class VideoEnableDisableInput {
  id: string
  is_enable: boolean
}