import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, ModalController } from 'ionic-angular';
import { Image } from '../../Model/ImageSection';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import { ActionSheetController } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import { SharedServices } from '../../services/sharedservice';
import { GetNewsAndPhoto, NewsAndPhotoResult } from './input_output_model/news_photos.dto';
import gql from 'graphql-tag';
import { GraphqlService } from '../../../services/graphql.service';
import { first } from "rxjs/operators";
/**
 * Generated class for the EventsandnewsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-eventsandnews',
  templateUrl: 'eventsandnews.html',
})
export class EventsandnewsPage {
  searchType: any = 'all';
  parentClubKey: any = "";
  headerImage: NewsAndPhotoResult | null = null;
  imgList: NewsAndPhotoResult[] = [];
  timeInterval: any = "";
  key: any = "";
  shareInfo: any = "";
  msg = "Check out the latest news from";


  clubKeys: any = [];
  mlist: any = [];
  tokenList: any = [];
  deviceTokens: any = [];

  newsResult: NewsAndPhotoResult[];
  new_photos_input: GetNewsAndPhoto = {
    ParentClubKey: '',
    ClubKey: '',
    MemberKey: '',
    AppType: 0,
    ActionType: 0,
    DeviceType: 0,
    postGresInput: {
      PostgresParentclubId: ''
    }
  }
  constructor(public sharedservice: SharedServices,
     private graphqlService: GraphqlService, 
     public commonService: CommonService, 
    public modalCtrl: ModalController,
    public socialSharing: SocialSharing, 
    public toastCtrl: ToastController, 
    public actionSheetCtrl: ActionSheetController, 
    public fb: FirebaseService, private storage: Storage, 
    public navCtrl: NavController, public navParams: NavParams) {
    
  }

  ionViewWillEnter() {
    this.commonService.category.pipe(first()).subscribe((data) => {
      if(data == "refresh_news"){
        this.storage.get('userObj').then((val) => {
          val = JSON.parse(val);
          if (val.$key != "") {
            this.parentClubKey = val.UserInfo[0].ParentClubKey;
          }
        });
        this.getVideoList();
      }
    })
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
  
  
  
  ionViewDidLoad() {
    console.log('ionViewDidLoad EventsandnewsPage');
  }
  goTocreatepage() {
    this.navCtrl.push('CreateventsandnewsPage');
  }
  goToShoweventsandnewsPage(imageItem:NewsAndPhotoResult) {
    this.navCtrl.push('ShoweventsandnewsPage', {
      imgInfo: imageItem
    });
  }
  checkHeader(): boolean {
    if (this.headerImage == undefined) {
      return false;
    } else {
      return true;
    }
  }
  checkOther() {
    // if(this.imgList == []){
    //   return false;
    // }else{
    //   return true;
    // }
  }
  showActionSheet(imgInfo: NewsAndPhotoResult) {
    this.shareInfo = {};
    this.shareInfo = imgInfo;
    let alert_options:{title:string,message:string,buttons:any[]} = {
      title: '',
      message:'',
      buttons: []
    };
  
    alert_options.buttons.push(
          {
            text: 'View',
            handler: () => {
              this.goToShoweventsandnewsPage(imgInfo);
            }
          }, {
            text: 'Edit',
            handler: () => {
              this.navCtrl.push('EditeventandnewsPage', {
                imgInfo: JSON.parse(JSON.stringify(imgInfo))
              });
            }
          }, 
            
          // {
          //   text: 'Notify',
          //   handler: () => {
          //     this.navCtrl.push("NotifcationfornewsandeventandvediosPage", { ImageInfo: imgInfo, ShareInfo: this.shareInfo });
          //   }
          // }, 
          // {
          //   text: 'Share',
          //   handler: () => {
          //     this.shareInfo = imgInfo;
          //     let modal = document.getElementById('myModal');
          //     modal.style.display = "block";
          //     //this.presentProfileModal(imgInfo);
          //   }
          // },
          {
            text: imgInfo.is_enable ? "Disable":"Enable",
            // handler: () => {
            //   this.fb.update(imgInfo.$key, "News&Events/" + imgInfo.ParentClubKey, { IsEnable: false });
            // }
            handler: () => {
              this.imageEnableOrDisable(imgInfo)
            }

          }, {
            text: 'Delete',
            handler: () => {
              this.deleteVideo(imgInfo);
            }
          }, {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          }
        ) 

      if(!imgInfo.is_headline && imgInfo.is_enable){
          //alert_options.title = "Medical Condition"
          //alert_options.message = subscription_info.user.MedicalCondition
          alert_options.buttons.push({
              text: 'Make HeadLine',
              handler: () => {
                this.updateHeadline(imgInfo);
              }
            }) 
      }
      const actionSheet = this.actionSheetCtrl.create(alert_options);
      actionSheet.present();    
  }
 
  shareReferralCode(imgInfo) {
    this.socialSharing.share(imgInfo.ImageDescription, imgInfo.ImageTitle, imgInfo.ImageURL, imgInfo.ImageURL).then(function (result) {
      console.log(result);
    }, function (err) {

      // An error occurred. Show a message to the user

    });

  }
  presentProfileModal(imgInfo) {
    let profileModal = this.modalCtrl.create("SharedmodalPage", { info: imgInfo });
    profileModal.present();
  }



  closeModal() {
    let modal = document.getElementById('myModal');
    if (event.target == modal) {
      modal.style.display = "none";
    }
    //switch()
  }

  close() {
    let modal = document.getElementById('myModal');
    modal.style.display = "none";
  }
  shareViaWhatsApp() {
    let data = this.msg + this.shareInfo.ParentClub.ParentClubName + "\n" + "\n" + this.shareInfo.image_title + "\n" + "\n" + "\n" + this.shareInfo.image_description
    this.socialSharing.shareViaWhatsApp(data, this.shareInfo.image_url, "");
    //console.log(data);
  }
  shareViaFacebook() {
    this.socialSharing.shareViaFacebook("#" + this.shareInfo.ParentClub.ParentClubName + "\n" + "\n" + this.shareInfo.image_title, "", this.shareInfo.image_url);
  }
  shareViaEmail() {
    //this.socialSharing.shareViaEmail(this.msg + " " + this.shareInfo.ParentClub.ParentClubName + "\n" + "\n" + this.shareInfo.image_description, this.shareInfo.image_title, [], [], [], this.shareInfo.image_url);
    this.socialSharing.shareViaEmail(this.msg + " " + this.shareInfo.ParentClub.ParentClubName + "\n" + "\n" + this.shareInfo.image_description,"ActivityPro17@gmail.com", [], [], [], this.shareInfo.image_url);
  }
  shareViaTwitter() {
    let data = "#" + this.shareInfo.ParentClub.ParentClubName + "\n" + "\n" + this.shareInfo.image_title;
    this.socialSharing.shareViaTwitter(data, "", this.shareInfo.image_url);
  }
  shareViaInstagram() {
    this.socialSharing.shareViaInstagram("#" + this.shareInfo.ParentClub.ParentClubName + "\n" + "\n" + this.shareInfo.image_title, this.shareInfo.image_url)
  }
  sendNotification() {
    // let notificationDetailsObj = this.notificationObj;
    this.parentClubKey = this.shareInfo.ParentClubKey;

    let pc = {
      CreatedTime: "", Message: '', SendBy: '', ComposeOn: '', Purpose: '', sendByRole: "", Status: "Unread", SessionName: '',
      Member: []
    };
    pc.SendBy = "Admin";
    pc.sendByRole = "Admin";
    pc.Purpose = "Info";
    pc.Message = "Check out the latest Events from " + this.shareInfo.ParentClubName + "\n" + this.shareInfo.ImageTitle;
    pc.SessionName = "";
    pc.CreatedTime = new Date().toString();
    pc.ComposeOn = new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();



    let memberObject = {
      CreatedTime: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate(),
      Message: "Check out the latest Events from " + this.shareInfo.ParentClubName + "\n" + this.shareInfo.ImageTitle,
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
    let message = "Check out the latest Events from " + this.shareInfo.ParentClubName + "\n" + this.shareInfo.ImageTitle;
    this.fb.CallToApiForNotification({ URL: url, DeviceTokens: this.deviceTokens, Message: message, Subject: "Notification", ParentclubKey: pKey });



  }
  getKeys(data2) {
    this.clubKeys = [];
    for (let i = 0; i < data2.length; i++) {
      // this.clubKeys.push(data[i].$key);

      data2[i] = this.commonService.convertFbObjectToArray(data2[i]);

      for (let j = 0; j < data2[i].length; j++) {
        if (data2[i][j].IsActive == true && data2[i][j].IsChild == false) {
          this.mlist.push(data2[i][j]);
        }
      }

    }

    let x = this.fb.getAllWithQuery("DeviceToken/Member/" + this.shareInfo.ParentClubKey, { orderByKey: true }).subscribe((data) => {
      // console.log(data);
      for (let i = 0; i < data.length; i++) {
        data[i] = this.commonService.convertFbObjectToArray(data[i]);
        for (let j = 0; j < data[i].length; j++) {
          if (data[i][j].Key == "Token") {
            data[i][j] = this.commonService.convertFbObjectToArray1(data[i][j])
            for (let l = 0; l < data[i][j].length - 1; l++) {
              // this.deviceTokens.push(data[i][j][l].DeviceToken);
              this.deviceTokens.push({ MobileDeviceId: data[i][j][l].DeviceToken, ConsumerID: "", PlatformArn: "" });
            }
          } else {
            data[i][j].Token = this.commonService.convertFbObjectToArray(data[i][j].Token);
            for (let k = 0; k < data[i][j].Token.length; k++) {
              // this.deviceTokens.push(data[i][j].Token[k].DeviceToken);
              this.deviceTokens.push({ MobileDeviceId: data[i][j].Token[k].DeviceToken, ConsumerID: "", PlatformArn: "" });
            }
          }
        }
      }
      this.sendNotification();
      x.unsubscribe();
    });
  }


  getVideoList() {
    console.log("listing api called");
    this.commonService.showLoader("Please Wait...")
    this.new_photos_input.postGresInput.PostgresParentclubId = this.sharedservice.getPostgreParentClubId();
    const news_query = gql`
        query  getNewsAndPhoto($newsPhotos: GetNewsAndPhoto!){
          getNewsAndPhoto(newsPhotos:$newsPhotos){ 
           headline{
            id
            is_active
            created_at
            created_by
            updated_at
            image_caption
            image_description
            image_url
            is_headline
            is_enable
            associated_activity
            category_name
            image_tag
            image_title
            is_show_applus
            is_show_member
            ParentClub{
              Id
              FireBaseId
              ParentClubName
            }
            Activity{
              ActivityName
              FirebaseActivityKey
              Id
            }
            images {
              id
              created_at
              created_by
              updated_at
              is_active
              is_enable
              image_caption
              image_description
              image_tag
              image_title
              image_url
              sequence_no
              }
           }
           newsphotosList{
            id
            is_active
            created_at
            created_by
            updated_at
            image_caption
            image_description
            image_url
            is_headline
            is_enable
            associated_activity
            category_name
            image_tag
            image_title
            is_show_applus
            is_show_member
            ParentClub{
              Id
              FireBaseId
              ParentClubName
            }
            Activity{
              ActivityName
              FirebaseActivityKey
              Id
            }
            images {
              id
              created_at
              created_by
              updated_at
              is_active
              is_enable
              image_caption
              image_description
              image_tag
              image_title
              image_url
              sequence_no
              }
         
           }
         
        }
      }
        `;
    this.graphqlService.query(news_query, { newsPhotos: this.new_photos_input }, 0).subscribe((res: any) => {
        this.commonService.hideLoader();
        this.imgList = [];
        this.headerImage = res.data.getNewsAndPhoto.headline;
        if(this.headerImage){
          this.headerImage["created_at"] = this.getTime(this.headerImage.created_at);
        }
        console.log("header image is:",JSON.stringify(this.headerImage));
        this.imgList = res.data.getNewsAndPhoto.newsphotosList.map(news => {
          if(news.is_active && !news.is_headLine){
            news.created_at = this.getTime(news.created_at);
            return news;
          }
        });
        console.log("image list is:",JSON.stringify(this.imgList));
      },
      (error) => {
        this.commonService.hideLoader();
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

  deleteVideo(imgInfo: NewsAndPhotoResult) {
    try {
      // Set the headers (optional)
      const delete_image = gql`
        mutation cancelNewsPhotos($newPhotosInput: String!) {
          cancelNewsPhotos(newPhotosInput: $newPhotosInput) 
            
        }`;

      const delete_img_variable = { newPhotosInput: imgInfo.id };

      this.graphqlService.mutate(
        delete_image,
        delete_img_variable,
        0
      ).subscribe((response) => {
        const message = "Deleted successfully";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.getVideoList();
      }, (err) => {
        // Handle GraphQL mutation error
        console.error("GraphQL mutation error:", err);
        this.commonService.toastMessage("Deletion  failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      });

    } catch (error) {

      console.error("An error occurred:", error);

    }
  }

  updateHeadline(imgInfo: NewsAndPhotoResult) {
    try {
      const headlineUpdate = {
        id: imgInfo.id,
        parentClubId: this.sharedservice.getPostgreParentClubId()
      };

      const updateHeadlineMutation = gql`
        mutation updateNewsPhotosHeadline($healineUpdateInput: UpdateHeadlineDto!) {
          updateNewsPhotosHeadline(healineUpdateInput: $healineUpdateInput)
        }
      `;

      const variables = { healineUpdateInput: headlineUpdate };

      this.graphqlService.mutate(updateHeadlineMutation, variables, 0)
        .subscribe(
          () => {
            const message = "Headline successfully updated.";
            this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
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

  imageEnableOrDisable(imgInfo: NewsAndPhotoResult) {
    try {
      const input = {
        id: imgInfo.id,
        is_enable: imgInfo.is_enable ? false:true
      }

      const enable_video = gql`
     
      mutation enableDisableImage($imageInput: EnableDisableInput!){
        enableDisableImage(imageInput:$imageInput)
      }
      `;
      const update_status = { imageInput: input }
      this.graphqlService.mutate(
        enable_video,
        update_status,
        0
      ).subscribe((response) => {
        const message = imgInfo.is_enable ? "Image disabled successfully" : "Image enabled successfully";;
        this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.getVideoList();

      }, (err) => {
        // Handle GraphQL mutation error
        console.error("GraphQL mutation error:", err);
        this.commonService.toastMessage("Status Changed failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      });

    } catch (error) {
      console.log("An error occured:", error)
    }
  }

  ionViewWillLeave(){
    this.commonService.updateCategory("");
  }

}





