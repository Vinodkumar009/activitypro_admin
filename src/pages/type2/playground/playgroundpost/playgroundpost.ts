import { Component } from "@angular/core";
import { IonicPage,LoadingController,NavController,NavParams,PopoverController,} from "ionic-angular";
import { CommonService,ToastMessageType,ToastPlacement,} from "../../../../services/common.service";
import { FirebaseService } from "../../../../services/firebase.service";
import { SharedServices } from "../../../services/sharedservice";
import { Storage } from "@ionic/storage";
import gql from "graphql-tag";
import { Apollo } from "apollo-angular";
import { PlayGroundFeedModel } from "../models/post.model";
import { Camera } from "@ionic-native/camera";
import { ImagePicker, ImagePickerOptions } from "@ionic-native/image-picker";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { e } from "@angular/core/src/render3";
import { BadgeTransactionModel } from "../../profilebadges/models/badges.model";
import { GetUserBadgesInput } from "../../profilebadges/profilebadges";

/**
 * Generated class for the PlaygroundpostPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-playgroundpost",
  templateUrl: "playgroundpost.html",
  providers: [ImagePicker, Camera],
})
export class PlaygroundpostPage {
  imgUrls = [];
  presigned_urls = [];
  showFullImage: boolean = false;
  full_view_img: string;
  badges: BadgeTransactionModel[] = [];
  playInput: createPlayGroundFeedInput = {
    ParentClubKey: "",
    MemberKey: "",
    feedText: "",
    feedImageUrl: "",
    AppType: 0,
    Category: "",
    feedImages: [
      {
        image_url: "",
        image_sequence: 0,
      },
    ],
  };
  saveFeeds: PlayGroundFeedModel;
  feedId: string = "";
  getUserBadgesInput = {
    MemberKey:"",
    ParentClubKey: "",
    AppType: 0,
  };
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private apollo: Apollo,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public fb: FirebaseService,
    public sharedservice: SharedServices,
    public popoverCtrl: PopoverController,
    public http: HttpClient,
    private imagePicker: ImagePicker
  ) {}

  ionViewDidLoad() {}
  ionViewWillEnter() {
    console.log("ionViewDidLoad PlaygroundpostPage");
    // this.feedId = this.navParams.get("slectedFeedId");
    // this.playInput.ParentClubKey = this.navParams.get("selectedParentCubKey");
    // this.playInput.MemberKey = this.navParams.get("selectedMemberKey");
    // this.playInput.feedImageUrl = this.navParams.get("selectedImageUrl");
    // this.playInput.feedText = this.navParams.get("selectedFeedText");
    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.playInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
        this.getUserBadgesInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
        this.playInput.MemberKey = val.$key;
        this.getUserBadgesInput.MemberKey = val.$key;
        this.fetchBadges();
      }
    });
  }
  fetchBadges = () => {
    const badgesQuery = gql`
      query getAllBadgeCategoriesForParentClub($badgeInput: GetBadgeCategories!) {
        getAllBadgeCategoriesForParentClub(badgeInput: $badgeInput) {
          id
          description
          badge_category
        }
      }
    `;
    this.apollo
      .query({
        query: badgesQuery,
        fetchPolicy: "no-cache",
        variables: {
          badgeInput: this.getUserBadgesInput,
        },
      })
      .subscribe(
        ({ data }) => {
         
          this.badges = data["getAllBadgeCategoriesForParentClub"];
          console.table(this.badges);
        },
        (err) => {
          // this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage("Failed to fetch badges",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }
      );
  };
  deleteImage(img_index: number) {
    this.imgUrls.splice(img_index, 1);
  }
  getRandomString() {
    return this.commonService.randomString(
      6,
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    );
  }
  showFullViewImage(img_index: number) {
    this.full_view_img = this.imgUrls[img_index].file_uri;
    this.showFullImage = true;
  }

  async chooseGalleryImages() {
    const options: ImagePickerOptions = {
      maximumImagesCount: 5,
      //width:200,
      //height:200,
      quality: 80,
      outputType: 1,
    };
    // window.imagePicker.OutputType.FILE_URI (0) or
    // window.imagePicker.OutputType.BASE64_STRING (1)

    this.imagePicker.getPictures(options).then(
      async (results) => {
        try {
          results.forEach(async (base64_uri, index) => {
            if (this.imgUrls.length < 5) {
              const image_url = base64_uri.split(/[\s/]+/);
              const image_name = image_url[image_url.length - 1];
              const base64Response = await fetch(
                "data:image/jpeg;base64," + base64_uri
              );
              //console.log(`after fetch:${JSON.stringify(base64Response)}`);
              const parseUrl = `${this.playInput.ParentClubKey}/${image_name.charAt(0)}${image_name.charAt(1)}${this.getRandomString()}.jpeg`;
              console.log("%curlllll" + parseUrl,'color:green');
              this.getSignedUrl(parseUrl).then(async (res) => {
                console.log(`%csignedname:${res[0].name},'color:green'`);
                console.log(`%csignedurl:${res[0].url},'color:blue'`);
                this.imgUrls.push({
                  file_uri: `data:image/jpeg;base64,${base64_uri}`,
                  base64_uri: base64Response,
                  img_name: res[0].name,
                  signed_url: res[0].url,
                });
              });
            } else {
              this.commonService.toastMessage("Cannot upload morethan 5",2500,ToastMessageType.Error,ToastPlacement.Bottom);
            }
          });
        } catch (err) {
          //this.commonService.toastMessage("Error in upload",2500,ToastMessageType.Error,ToastPlacement.Bottom);
          console.log(JSON.stringify(err));
        }
      },
      (err) => {
        //this.commonService.toastMessage("Error in upload",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        console.log("%cimagepicker plugin issue",'color:red');
        console.log(JSON.stringify(err));
      }
    );
  }

  //validations for post creation
  validatePost(){
    if(!this.playInput.Category){
      this.commonService.toastMessage("Please select category",2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }else if(this.playInput.feedText =='' && this.imgUrls.length == 0){
      this.commonService.toastMessage("Please enter feed text or upload images",2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }else{
      return true;
    }
  }

  //uploading photos
  async uploadPhotos() {
    if(this.validatePost()){
      try {
        this.commonService.showLoader("Please wait");
        if(this.imgUrls.length > 0){
          this.imgUrls.forEach(async (img, index) => {
            //for s3 u have to convert base64 into blob, So below Converting a base64 string to a blob in JavaScript
            let img_index = index;
            this.presigned_urls.push({
              image_url: img.img_name,
              image_sequence: img_index++,
            });
            console.log("%chek=looooooooooo" + img.img_name,'color:blue');
            let upload_Res = await this.putUrl(
              await img.base64_uri.blob(),img.signed_url).catch(() => {
              this.commonService.hideLoader();
            });
    
            //alert(`${index}:${this.imgUrls.length-1}`)
            if (index == this.imgUrls.length - 1) {
              //alert(`inside`);
              this.createPost();
            }
          });
        }else{
          this.createPost();
        }
        
      } catch (err) {
        this.commonService.hideLoader();
        //alert(JSON.stringify(err));
        this.commonService.toastMessage("Images upload failed",2500,ToastMessageType.Error,ToastPlacement.Bottom      );
      }
    }
  }

  createPost() {
    this.playInput.feedImages = this.presigned_urls;
    console.table(this.playInput);
    this.apollo
      .mutate({
        mutation: gql`
          mutation createPlaygroundFeedUser(
            $playgroundInput: createPlayGroundFeedInput!
          ) {
            createPlaygroundFeedUser(playgroundInput: $playgroundInput) {
              id
              feedText
              urlLink
              imageUrl
              commentsCount
              likesCount
              apptype
              postedbyid
              images {
                image_url
                image_sequence
              }
              postBy {
                FirstName
              }
            }
          }
        `,
        variables: { playgroundInput: this.playInput },
      })
      .subscribe(
        ({ data }) => {
          this.commonService.hideLoader();
          this.commonService.toastMessage("Posted successfully",2500,ToastMessageType.Success,ToastPlacement.Bottom);
          this.saveFeeds = data["createPlaygroundFeedUser"];
          console.log("%cCreateFeed data" + data["createPlaygroundFeedUser"],'color:green');
          this.navCtrl.pop().then(() => this.navCtrl.pop());
        },
        (err) => {
          this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage("Post creation failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }
      );
  }

  getSignedUrl(imageUrl: any) {
    console.log(this.sharedservice.getPresignedURL());
    return new Promise((resolve, reject) => {
      this.http
        .post(`${this.sharedservice.getPresignedURL()}`, {
          name: "playground",
          type: "IMAGE",
          files: [imageUrl],
        })
        .subscribe(
          (res: any) => {
            if (res) {
              console.log(res);
              resolve(res);
            }
          },
          (err) => {
            console.log(`%csignederr:${JSON.stringify(err)},'color:red'`);
            reject(err);
          }
        );
    });
  }

  putUrl(data, url) {
    return new Promise((resolve, reject) => {
      // const options = this.prepareOptions();
      const thisRef = this;
      let headers = new HttpHeaders();
      headers = headers.append("Content-Type", "image/jpeg");
      this.http.put(url, data, { headers }).subscribe(
        (res: any) => {
          resolve(res);
        },
        (err) => {
          reject(err);
        }
      );
    });
  }
}

export class createPlayGroundFeedInput {
  ParentClubKey: string;
  MemberKey: string;
  feedText: string;
  feedImageUrl: string;
  AppType: number;
  Category: string;
  feedImages: PlayGroundFeedImageInsert[];
}

export class PlayGroundFeedImageInsert {
  image_url: string;
  image_sequence: number;
}
