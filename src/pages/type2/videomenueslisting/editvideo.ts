import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { CommonService, ToastPlacement, ToastMessageType } from '../../../services/common.service';
import { FirebaseService } from '../../../services/firebase.service';
//import { Video } from '../../Model/VideoSection';
import { Videos } from './models/videolisting.dto';
import { GraphqlService } from '../../../services/graphql.service';
import gql from 'graphql-tag';
import { VideoUpdate } from './models/videoedit.dto';
import { SharedServices } from '../../services/sharedservice';

/**
 * Generated class for the EditvideoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-editvideo',
  templateUrl: 'editvideo.html',
})
export class EditvideoPage {
  videoObj: Videos;
  activityList: any = [];
  selectedActivity: any = "";
  parentclubKey: string;
  //vidObj = new Video();
  activityKey: string;

  selectedActivityName: string;

  videoUpdate: VideoUpdate = {
    ParentClubKey: '',
    ClubKey: '',
    MemberKey: '',
    AppType: 0,
    ActionType: 0,
    DeviceType: 0,
    Id: '',
    activityKey: '',
    is_headline: false,
    video_description: '',
    video_tag: '',
    video_title: '',
    video_url: '',
    thumbnail: '',
    associated_activity: '',
    is_show_applus: false,
    is_show_member: false,
    unsanitized_video_url: '',
    parentclub_id: '',
    activity_id: ''
  }
  VideoType: any = "";
  map = new Map();
  constructor(public commonService: CommonService, public fb: FirebaseService, public navCtrl: NavController, public navParams: NavParams,
    private graphqlService: GraphqlService,
    private sharedService: SharedServices, ) {
    this.videoObj = this.navParams.get('vidInfo');

    console.log("video obj data is:", JSON.stringify(this.videoObj));
    this.videoObj.video_url = this.videoObj.video_url;
    this.videoObj.is_show_applus = this.videoObj.is_show_applus || false;
    this.videoObj.is_show_member = this.videoObj.is_show_member || false;
    this.parentclubKey = this.navParams.get('parentclubKey')
    this.getActivityList();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditvideoPage');
  }
  getClubList() {
    this.fb.getAll('Activity/' + this.videoObj.parentClub.FireBaseId).subscribe((data) => {
      for (let i = 0; i < data.length; i++) {
        let data2 = this.commonService.convertFbObjectToArray(data[i]);
        for (let j = 0; j < data2.length; j++) {
          if (!this.checkInclusion(data2[j].Key)) {
            this.activityList.push(data2[j]);
          }
        }
      }
      this.selectedActivity = this.videoObj.activity.FirebaseActivityKey;
    });

  }

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
             this.selectedActivity = this.videoObj.activity.FirebaseActivityKey;
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

  getSelectedActivityName() {
    const selectedActivity = this.activityList.find(activity => activity.Key === this.selectedActivity);
    if (selectedActivity) {
      this.selectedActivityName = selectedActivity.ActivityName;
      // Now you can pass this.selectedActivityName to your API
    }
  }

  capitalizeEachWord(text: string): string {
    if (!text) return text;
    return text.replace(/\b\w/g, char => char.toUpperCase());
  }

  async UpdateVideo() {
    try{
      this.videoUpdate.Id = this.videoObj.id;
      this.videoUpdate.thumbnail = this.videoObj.thumbnail;
      this.videoUpdate.unsanitized_video_url = this.videoObj.unsanitized_video_url;
      this.videoUpdate.video_description = this.capitalizeEachWord(this.videoObj.video_description);
      this.videoUpdate.video_tag = this.capitalizeEachWord(this.videoObj.video_tag);
      this.videoUpdate.video_title = this.capitalizeEachWord(this.videoObj.video_title);
      this.videoUpdate.video_url = this.videoObj.video_url;
      this.videoUpdate.is_headline = this.videoObj.is_headline;
      this.videoUpdate.ParentClubKey = this.videoObj.parentClub.FireBaseId;
      this.videoUpdate.thumbnail=await this.getVideoThumbnail(this.videoObj.video_url);
      this.videoUpdate.is_show_applus = this.videoObj.is_show_applus;
      this.videoUpdate.is_show_member = this.videoObj.is_show_member;
      this.videoUpdate.unsanitized_video_url = await this.transform(this.videoObj.video_url);
      this.videoUpdate.activity_id = await this.getActivityIdsByFirebaseKeys(this.selectedActivity)

      const editVidMutation = gql`
        mutation updateVideo($updateVideo: VideoUpdate!) {
          updateVideo(updateVideo: $updateVideo)
        }`;
        const editMutationVariable = { updateVideo: this.videoUpdate };
        this.graphqlService.mutate(
          editVidMutation,
          editMutationVariable,
          0
        ).subscribe(
          (response) => {
            this.commonService.toastMessage("Successfully Updated", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
            this.commonService.updateCategory("refresh_videos");
            this.navCtrl.pop();
          },
          (err) => {
            console.error("GraphQL mutation error:", err);
            this.commonService.toastMessage("Video update failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          }
        );
    }catch(err){
      this.commonService.toastMessage("Video update failed", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
    }
  }

  cancel() {
    this.navCtrl.pop();
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
  
    //..........................................
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


