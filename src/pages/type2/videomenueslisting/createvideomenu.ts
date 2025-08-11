import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { CommonService, ToastPlacement, ToastMessageType } from '../../../services/common.service';
import { Video } from '../../Model/VideoSection';
import { ModalController } from 'ionic-angular';
import { VideoCreationInput, VideoInput } from './models/videocreation.dto';
import gql from 'graphql-tag';
import { GraphqlService } from '../../../services/graphql.service';
import { SharedServices } from '../../services/sharedservice';



/**
 * Generated class for the CreatevideomenuPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-createvideomenu',
  templateUrl: 'createvideomenu.html',
})
export class CreatevideomenuPage {
  LangObj: any = {};//by vinod
  videoObj = new Video();
  activityList: any = []; 2
  selectedActivity: any = {};
  key: any = "";
  VideoList: any = [];
  activity: string;
  postgre_parentclub: string;
  videoData: VideoInput = {
    is_headline: false,
    video_description: '',
    video_tag: '',
    video_title: '',
    video_url: '',
    thumbnail: '',
    is_show_applus: false,
    is_show_member: false,
    unsanitized_video_url: '',
    is_enable: true,
    parentclub_id: '',
    activity_id: ''
  }
  videoInput: VideoCreationInput = {
    AppType: 0,
    ActionType: 0,
    DeviceType: 0,
    video: this.videoData
  }


  VideoType: any = "";
  map = new Map();

  constructor(public events: Events, 
    public modalCtrl: ModalController, 
    private sharedservice: SharedServices,
    private sharedService: SharedServices, 
    private graphqlService: GraphqlService, 
    public commonService: CommonService,
    public storage: Storage, public navCtrl: NavController, 
    public navParams: NavParams) {
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.videoObj.CreatedBy = "Admin"
        this.videoObj.CreaterKey = this.sharedService.getPostgreParentClubId();
        this.videoObj.ParentClubName = val.Name;
        this.videoObj.ParentClubKey = this.sharedService.getParentclubKey();
        this.postgre_parentclub = this.sharedService.getPostgreParentClubId();
        this.videoInput.video.parentclub_id = this.postgre_parentclub;
        // this.videoInput.MemberKey = val.$key;
        this.getActivityList();
      }
    });
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad CreatevideomenuPage');
    this.getLanguage();
    this.events.subscribe('language', (res) => {
      this.getLanguage();
    });
  }
  getLanguage() {
    this.storage.get("language").then((res) => {
      console.log(res["data"]);
      this.LangObj = res.data;
    })
  }
  // getClubList() {
  //   this.fb.getAll('Activity/' + this.videoObj.ParentClubKey).subscribe((data) => {
  //     for (let i = 0; i < data.length; i++) {
  //       let data2 = this.commonService.convertFbObjectToArray(data[i]);
  //       for (let j = 0; j < data2.length; j++) {
  //         if (!this.checkInclusion(data2[j].Key)) {
  //           this.activityList.push(data2[j]);
  //         }
  //       }
  //     }

  //     this.selectedActivity = this.activityList[0].ActivityName;
  //     this.activity = this.activityList[0].Key;
  //   });

  // }
  getActivityList() { 
    const club_activity_input = {
       ParentClubKey:this.sharedService.getParentclubKey(),
       AppType:0, //0-Admin
       DeviceType:this.sharedService.getPlatform() == "android" ? 1 : 2 //1-android,2-IOS
     }
       const clubs_activity_query = gql`
       query getAllActiviesByParentClub($input_obj: CommonInputTypeDefs_V3!){
         getAllActiviesByParentClub(venueDetailsInput:$input_obj){
           ActivityCode
           ActivityName
           ActivityImageURL
           FirebaseActivityKey
           ActivityKey
         }
       }
       `;
       this.graphqlService.query(clubs_activity_query,{input_obj:club_activity_input},0)
         .subscribe((res: any) => {
           if(res.data.getAllActiviesByParentClub.length > 0){
             this.activityList = res.data.getAllActiviesByParentClub;
             this.selectedActivity = this.activityList[0].ActivityKey;;
           }else{  
             this.commonService.toastMessage("No activities found",2500,ToastMessageType.Error)
           }
         },
        (error) => {
         this.commonService.toastMessage("Activities fetch failed",2500,ToastMessageType.Error);
             console.error("Error in fetching:", error);
            // Handle the error here, you can display an error message or take appropriate action.
         }) 
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

  handleActivityChange() {
    // Here you can perform any necessary actions when the activity changes
    console.log('Selected activity:', this.selectedActivity);
    // You can include further logic or directly use this.selectedActivity in your API request
  }

  resetVideo() {
    this.videoObj = new Video();
    this.navCtrl.pop();
  }
  

  validateVideoUrl(videoUrl: string): Boolean {
    let ishttpurl = videoUrl.split(":")[0];
    if (ishttpurl != "https") {
      return false;
    }
    return true;
  }

  validate() {
    if (this.videoData.video_url == "") {
      this.commonService.toastMessage("Enter Image URL", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    } else if (!this.validateVideoUrl(this.videoData.video_url)) {
      let msg = "Please enter the url with https only";
      this.commonService.toastMessage(msg, 3000, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    }
    else if (this.videoData.video_title == "") {
      this.commonService.toastMessage("Enter Title", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    } else {
      return true;
    }
  }
  focusedOnTextArea() {
    console.log("asdfsdf");
    let modal = this.modalCtrl.create("TextareamodalcontrollerPage", { callback: this.getData1, Description: this.videoData.video_description });
    modal.present();

  }


  getData1 = data => {
    return new Promise((resolve, reject) => {
      this.videoData.video_description = data;
      resolve('')

    });
  };

  showToaster() {
    let InfoMessage = `URL from Facebook or YouTube. Right click on the video ‘Copy video URL at current time’ and paste here.`
    this.commonService.toastMessage(InfoMessage, 2500, ToastMessageType.Info, ToastPlacement.Bottom);
  }

  capitalizeEachWord(text: string): string {
    if (!text) return text;
    return text.replace(/\b\w/g, char => char.toUpperCase());
  }

  async addNewVideos() {
    try{
      this.commonService.showLoader("Please wait")
      this.videoInput.DeviceType = this.sharedservice.getPlatform() == "android" ? 1 : 2 //1-android,2-IOS
      this.videoData.video_title = this.capitalizeEachWord(this.videoData.video_title);
      this.videoData.video_tag = this.capitalizeEachWord(this.videoData.video_tag);
      this.videoData.video_description = this.capitalizeEachWord(this.videoData.video_description);
      this.videoData.unsanitized_video_url = await this.transform(this.videoData.video_url);
      this.videoData.activity_id = await this.getActivityIdsByFirebaseKeys(this.selectedActivity)
      this.videoData.thumbnail = await this.getVideoThumbnail(this.videoData.video_url);
     // console.log("input giving for add videos", JSON.stringify(this.videoInput))
      if (this.validate()) {
        const addVideos = gql`
             mutation addVideos($videoInput: VideoCreationInput!){
              addVideos(videoInput: $videoInput){
                video_title
            }
         }
        `;
        const mutationVariable = { videoInput: this.videoInput }
        this.graphqlService.mutate(
          addVideos,
          mutationVariable,
          0
        ).subscribe((response) => {
          this.commonService.hideLoader();
          const message = "successfully Saved";
          this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
          this.commonService.updateCategory("refresh_videos");
          this.navCtrl.pop();
        }, (err) => {
          this.commonService.hideLoader();
          //  this.commonService.toastMessage("video creation  failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          console.error("GraphQL mutation error:", err);
          if (err.error && err.error.errors) {
            const errorMessage = err.error.errors[0].message;
            this.commonService.toastMessage(errorMessage, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          } else {
            this.commonService.toastMessage("video creation failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          }
        });
      }
    }catch(err){
      this.commonService.hideLoader();
      this.commonService.toastMessage("video creation failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    }
  }

  async getVideoThumbnail(videoUrl) {
    let thumbnailUrl;
    // Check if the URL is from YouTube
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      thumbnailUrl = await this.getYoutubeThumbnail(videoUrl);
    }
    // Check if the URL is from Facebook
    else if (videoUrl.includes('facebook.com')) {
      thumbnailUrl = this.getFacebookVideoThumbnail(videoUrl);
    }
    // If the URL is neither from YouTube nor Facebook
    else {
      throw new Error('Unsupported video URL');
    }
    return thumbnailUrl;
  }

  // Function to get YouTube video thumbnail
  async getYoutubeThumbnail(videoUrl) {
   
    if (!videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be')) {
      throw new Error('Invalid YouTube video URL');
    }

    const videoIdMatch = videoUrl.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (!videoIdMatch) {
      throw new Error('Invalid YouTube video URL');
    }

    const videoId = videoIdMatch[1];
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }

  // Function to get Facebook video thumbnail
  getFacebookVideoThumbnail(videoUrl) {
    const match = videoUrl.match(/facebook.com\/(?:video.php\?v=|.*\/videos\/)([0-9]+)/);
    if (match && match[1]) {
      const videoId = match[1];
      return `https://graph.facebook.com/${videoId}/picture`;
    } else {
      throw new Error('Invalid Facebook video URL');
    }
  }

 

  transform(url) {
    
    if (!url) {
      return url; // or handle the case when url is undefined
    }
    this.VideoType = "";
    let checkURL = url.split('//');
    let checkPlatformList = checkURL[1].split('/');
    if (checkPlatformList[0] == "www.facebook.com") {

      let spliID = url.split("/");
      let ID = spliID[spliID.length - 2];
      //return url;
      this.map.set("http://www.facebook.com/video/embed?video_id=" + ID, "facebook");
      return "http://www.facebook.com/video/embed?video_id=" + ID
    } else if (checkPlatformList[0] == "youtu.be") {


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

  getActivityIdsByFirebaseKeys(activity_ids): Promise<any> {
    return new Promise((res, rej) => {
      const activity_query = gql`
      query getActivityByFirebaseIds($activityIds: [String!]) {
        getActivityByFirebaseIds(activityIds: $activityIds){
          Id
          FirebaseActivityKey
          ActivityCode
          ActivityName
        }  
      }`
      const activity_query_variables = { activityIds: activity_ids };
      this.graphqlService.query(
        activity_query,
        activity_query_variables,
        0
      ).subscribe((response) => {
        res(response.data["getActivityByFirebaseIds"][0]["Id"]);
      }, (err) => {
        rej(err);
      });
    })
  }
}

