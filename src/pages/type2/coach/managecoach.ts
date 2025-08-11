import { Component, ViewChild } from '@angular/core';
import { NavController, PopoverController, LoadingController, ActionSheetController, AlertController, FabContainer, ToastController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import { IonicPage } from 'ionic-angular';
import { File } from '@ionic-native/file';
import { Camera, PictureSourceType, CameraOptions } from '@ionic-native/camera';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { first } from "rxjs/operators";
import { GraphqlService } from '../../../services/graphql.service';

@IonicPage()
@Component({
  selector: 'managecoach-page',
  templateUrl: 'managecoach.html'
})

export class Type2ManageCoach {
  @ViewChild('fab') fab: FabContainer;
  themeType: number;
  venue: string = "";
  loading: any;
  game: string = "";
  coachList = [];
  allCoachList = [];
  parentClubKey: string;
  clubs = [];
  selectedVenuesAgainstCoach: any;
  clubDetailsObj = {
    "City": "",
    "ClubContactName": "",
    "ClubDescription": "",
    "ClubID": "",
    "ClubName": "",
    "ClubShortName": "",
    "ContactPhone": "",
    "FirstLineAddress": "",
    "ParentClubID": "",
    "PostCode": "",
    "State": "",
    "secondLineAddress": ""
  }
  coachDetailsObj = {
    "DBSNumber": "",
    "DOB": "",
    "EmailID": "",
    "FirstName": "",
    "LastName": "",
    "Level": "",
    "PhoneNumber": "",
    "Recognition": "",
    "Reg": "",
    "ShortDescription": ""
  }
  subAdminList: Array<any> = [];
  coachFirebase = []
  constructor(public comonService: CommonService,
    private apollo: Apollo,
     private camera: Camera,
     private file: File, 
     public actionSheetCtrl: ActionSheetController,
      public toastCtrl: ToastController,
       public alertCtrl: AlertController,
        public loadingCtrl: LoadingController, 
        //private storage: Storage, 
        public navCtrl: NavController,
         public sharedservice: SharedServices,
          public fb: FirebaseService, 
          public popoverCtrl: PopoverController,
          private graphqlService: GraphqlService,) {

    this.themeType = sharedservice.getThemeType();
    
  }

  ionViewWillEnter(){
    this.comonService.category.pipe(first()).subscribe((data) => {
      if (data == "coach_list") {
        this.parentClubKey = this.sharedservice.getParentclubKey();
        //this.getCoachList();
        this.getAllCoachList();
        this.getClubList();
        this.getSubAdmin();
      }
    });
  }

  async getAllCoachList() {
    try{
      this.comonService.showLoader('Please wait');
      // Fetch both GraphQL and Firebase data concurrently
      const [firebaseCoaches, postgreCoaches] = await Promise.all([
        this.getCoachListFromFirebase(),
        this.getCoachesFromPostgres()
      ]);
    
      // Merge the results
      this.allCoachList = this.mergeCoachData(firebaseCoaches, postgreCoaches);
      console.log(`coach_list:${this.allCoachList}`);
      this.comonService.hideLoader();
    }catch(error){
      this.comonService.hideLoader();
      this.comonService.toastMessage(error.message,2500,ToastMessageType.Error, ToastPlacement.Bottom);
    }
    
  }
  
  getCoachListFromFirebase(): Promise<any[]> {
    return new Promise((resolve, reject) => {
        try{
          this.fb.getAll(`/Coach/Type2/${this.parentClubKey}`).subscribe((data) => {
            const coaches = [];
            if (data.length > 0) {
              data.forEach((coach) => {
                if (coach.IsActive && coach.IsEnabled) {
                  // Assign default profile image if needed
                  if (!coach.ProfileImageUrl) {
                    coach.ProfileImageUrl = "https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815/o/Coach.png?alt=media&token=fb8a8046-35fd-4340-8015-02981deacba6";
                  }
      
                  // Convert nested Firebase objects into arrays (if present)
                  if (coach.IsVenueAssigned && coach.Club) {
                    coach.Club = this.comonService.convertFbObjectToArray(coach.Club);
                    coach.Club.forEach(club => {
                      if (club.Activity) {
                        club.Activity = this.comonService.convertFbObjectToArray(club.Activity);
                      }
                    });
                    if (coach.CoachingLevel) {
                      coach.CoachingLevelArr = this.comonService.convertFbObjectToArray(coach.CoachingLevel);
                    }
                  }
                  coaches.push(coach);
                }
              });
            }
            this.coachFirebase = coaches;
            resolve(coaches);
          }, (error) => {
            reject(error);
          });
        }catch(error){
          console.log(error);
          reject(error);
        }
      });
  }
    
  getCoachesFromPostgres(): Promise<any[]> {
      const CoachFetchInput = {
        parentclub: this.sharedservice.getPostgreParentClubId()
      };
      
      const coachQuery = gql`
        query fetchCoaches($coachFetchInput: CoachFetchInput!) {
          fetchCoaches(coachFetchInput: $coachFetchInput){
            Id,
            first_name,
            last_name,
            email_id,
            profile_image,
            coach_firebase_id
          }
        }
      `;
      
      return new Promise((resolve, reject) => {
        try{
          this.graphqlService.query(coachQuery, { coachFetchInput: CoachFetchInput }, 0)
          .subscribe((res: any) => {
            if (res.data.fetchCoaches) {
              resolve(res.data.fetchCoaches);
            } else {
              resolve([]);
            }
          }, (error) => {
            reject(error);
          });
        }catch(error){
          console.log(error);
          reject(error);
        }
      });
    
  }
  
  mergeCoachData(firebaseCoaches: any[], postgreCoaches: any[]): any[] {
    return postgreCoaches.map(postgreCoach => {
      const firebaseCoach = firebaseCoaches.find(c => c.$key === postgreCoach.coach_firebase_id);
      
      return {
        ...postgreCoach,
        FirstName: postgreCoach.first_name,
        LastName: postgreCoach.last_name,
        EmailID: postgreCoach.email_id,
        $key : postgreCoach.coach_firebase_id,
        ParentClubKey : this.parentClubKey , 
        ProfileImageUrl: postgreCoach.profile_image || "https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815/o/Coach.png?alt=media&token=fb8a8046-35fd-4340-8015-02981deacba6",
        Club: firebaseCoach && firebaseCoach.Club ? firebaseCoach.Club : "",
        CoachingLevelArr: firebaseCoach && firebaseCoach.CoachingLevelArr ? firebaseCoach.CoachingLevelArr : "",
      };
    });
  }

  
  
  
  getClubList() {
    this.fb.getAll("/Club/" + this.parentClubKey).subscribe((data) => {
      //this.clubs = data;
      for (let i = 0; i < data.length; i++) {
        if (data[i].IsActive && data[i].IsEnabled) {
          this.clubs.push(data[i]);
        }
      }
    });
    // this.loading.dismiss().catch(() => { });
  }
  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }
  addCoach() {
    this.navCtrl.push("Type2AddCoach");
    this.fab.close();
  }
  editCoach() {
    this.navCtrl.push("Type2EditCoach");
  }
  assignVenue(coach) {
    this.navCtrl.push("Type2VenueAssignCoach", { CoachInfo: coach });
  }

  selectVenue(selectedCoachKey) {
    let alert = this.alertCtrl.create();
    alert.setTitle('Select Venues');
    this.clubs.forEach((club) => {
      alert.addInput({
        type: 'checkbox',
        label: club.ClubName,
        value: club,
        checked: false
      });
    });
    alert.addButton('Cancel');
    alert.addButton({
      text: 'Save',
      handler: data => {
        let returnedKey;
        //let elementKey;
        data.forEach(element => {



          this.coachList.forEach(element => {
            if (selectedCoachKey == element.$key) {
              this.coachDetailsObj.DBSNumber = element.DBSNumber;
              this.coachDetailsObj.DOB = element.DOB;
              this.coachDetailsObj.EmailID = element.EmailID;
              this.coachDetailsObj.FirstName = element.FirstName;
              this.coachDetailsObj.LastName = element.LastName;
              this.coachDetailsObj.Level = element.Level;
              this.coachDetailsObj.PhoneNumber = element.PhoneNumber;
              this.coachDetailsObj.Recognition = element.Recognition;
              this.coachDetailsObj.Reg = element.Reg;
              this.coachDetailsObj.ShortDescription = element.ShortDescription;
            }
          });




          //elementKey = element.$key;
          this.clubDetailsObj.City = element.City;
          this.clubDetailsObj.ClubContactName = element.ClubContactName;
          this.clubDetailsObj.ClubDescription = element.ClubDescription;
          this.clubDetailsObj.ClubID = element.ClubID;
          this.clubDetailsObj.ClubName = element.ClubName;
          this.clubDetailsObj.ContactPhone = element.ContactPhone;
          this.clubDetailsObj.FirstLineAddress = element.FirstLineAddress;
          this.clubDetailsObj.ParentClubID = element.ParentClubID;
          this.clubDetailsObj.PostCode = element.PostCode;
          this.clubDetailsObj.State = element.State;
          this.clubDetailsObj.secondLineAddress = element.secondLineAddress;
          returnedKey = this.fb.saveReturningKey("/Coach/" + this.parentClubKey + "/" + selectedCoachKey + "/Club/" + element.$key, this.clubDetailsObj);


          if (returnedKey) {
            this.fb.saveReturningKey("/Club/" + this.parentClubKey + "/" + element.$key + "/Coach/" + selectedCoachKey, this.coachDetailsObj);
          }

        });


      }
    });
    alert.present();
  }
  getSubAdmin() {
    this.fb.getAllWithQuery("User/SubAdmin", { orderByKey: true }).subscribe((data) => {
      if (data.length > 0) {
        this.subAdminList = []
        data.forEach((subAdmin) => {
          if ((subAdmin.UserInfo) && (subAdmin.IsActive || subAdmin.IsActive === undefined)) {
            subAdmin.UserInfo = this.comonService.convertFbObjectToArray(subAdmin.UserInfo);
            if (subAdmin.Clubs != undefined && subAdmin.Clubs.length == undefined) {
              subAdmin.Clubs = this.comonService.convertFbObjectToArray(subAdmin.Clubs);
            }
            if (subAdmin.UserInfo[0]["ParentClubKey"] == this.parentClubKey) {
              this.subAdminList.push(subAdmin);
            }
          }
        })
      }
    })
  }
  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }

  presentActionSheet(item) { 
    const actionSheet = this.actionSheetCtrl.create({
      //  title: 'Send Report',
      buttons: [

        {
          text: 'Edit',
          handler: () => {
            this.goToEdit(item)
          }
        },
        {
          text: 'Assign Venue',
          handler: () => {
            item = this.coachFirebase.filter(coach => coach.$key == item.$key)[0]
            this.assignVenue(item)
          }
        },
        {
          text: 'Profile Picture',
          handler: () => {
            this.SelectProfImg(item)
          }
        },

        // {
        //   text: 'Level',
        //   handler: () => {
        //     item = this.coachFirebase.filter(coach => coach.$key == item.$key)[0]
        //     this.selectLevel(item)
        //   }
        // },

        {
          text: 'Delete',
          handler: () => {
            this.canRemoveCoach(item)
          }
        },


      ]
    });
    actionSheet.present();
  }
//Uploading Image By Vinod Starts Here
async SelectProfImg(item) {
  const actionSheet = await this.actionSheetCtrl.create({
    //header: 'Choose File',
    buttons: [{
      text: 'Camera',
      role: 'destructive',
      icon: 'ios-camera',
      handler: () => {
        console.log('clicked');
        this.CaptureImage(this.camera.PictureSourceType.CAMERA,item);
      }
    }, {
      text: 'Gallery',
      icon: 'ios-image',
      handler: () => {
        console.log('Share clicked');
        this.CaptureImage(this.camera.PictureSourceType.PHOTOLIBRARY,item);
      }
    }, {
      text: 'Cancel',
      icon: 'close',
      role: 'cancel',
      handler: () => {
        console.log('Cancel clicked');
      }
    }
    ]
  });
  await actionSheet.present();
}
async CaptureImage(sourceType: PictureSourceType,item:any) {
  const options: CameraOptions = {
    quality: 80,
    sourceType: sourceType,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    correctOrientation: true,
  }
  try {
    this.camera.getPicture(options).then((img_data)=>{
      this.loading = this.loadingCtrl.create({
        content: 'Profile updating...'
     });
     this.loading.present();
      let imgObj = {};
      const image_url = img_data.startsWith('data:image/jpeg;base64,') ? img_data : `data:image/jpeg;base64,${img_data}`; // Use raw base64 data without prefix
      imgObj["url"] = image_url
      imgObj["upload_type"] = 'coach'
      imgObj["coach_name"] = item.FirstName;
      imgObj["club_name"] = item.ParentClubKey;
      this.fb.uploadPhoto(imgObj).then((url)=>{
        // console.log(photo url:${url});
        this.loading.dismiss();
        this.updateProgImg(item,url);
      }).catch((err)=>{
        this.loading.dismiss();
        let message = "Profile update failed";
        this.comonService.toastMessage(message,2500,ToastMessageType.Error,ToastPlacement.Bottom);
      })
    });
  } catch (e) {
    console.log(e.message);
    let message = "Profile update failed";
    this.comonService.toastMessage(message,2500,ToastMessageType.Error,ToastPlacement.Bottom);
  }
}


// updating prof image
updateProgImg(item:any,url:any){
  this.fb.update(item.$key, "Coach/Type2/" + item.ParentClubKey, { ProfileImageUrl: url })
  item.ProfileImageUrl = url;
  this.updateImgaePostgres(item.Id, url);
  this.getAllCoachList();
  let message = "Profile image updated successfully";
  this.comonService.toastMessage(message,2500,ToastMessageType.Success,ToastPlacement.Bottom);
}
updateImgaePostgres(id, url) {
    const data = {
      Id: id,
      profile_image: url
    }
    const mutation = gql`mutation updateCoachDeatils($coachUpdateInput:CoachUpdateModel!){
      updateCoachDeatils(coachUpdateInput:$coachUpdateInput)
    }`;
    
    this.graphqlService.mutate(mutation, {coachUpdateInput:data}, 0)
      .subscribe(({ data }) => {
        console.log('Coach updated successfully:', data);
      }, (err) => {
        console.error(JSON.stringify(err));
        console.log('Error updating coach:', err);
      })
  }

  async canRemoveCoach(coach){
    try{
      const coach_term_sessions:ICoachSessions[] = await this.getCoachTermSessions(coach.Id);
      const coach_monthly_sessions:ICoachSessions[] = await this.getCoachMonthlySessions(coach.Id);
      if((coach_term_sessions.length > 0 && coach_term_sessions[0] && +coach_term_sessions[0].sessions > 0) || (coach_monthly_sessions.length > 0 && coach_monthly_sessions[0] && +coach_monthly_sessions[0].sessions > 0)){
        let sub_title = `${coach.FirstName} ${coach.LastName} is already part of `;
  
        if (coach_term_sessions[0] && +coach_term_sessions[0].sessions > 0) {
          sub_title += `${coach_term_sessions[0].sessions} term session(s) and `;
        }
        
        if (coach_monthly_sessions[0] && +coach_monthly_sessions[0].sessions > 0) {
          sub_title += `${coach_monthly_sessions[0].sessions} monthly session(s).`;
        }
        
        sub_title += 'Please remove from those sessions and delete the coach.';
      
        const alert = this.alertCtrl.create({
          title: 'Remove Coach',
          subTitle: sub_title,
          buttons: ['OK']
        });
        alert.present();
      }else{
        this.removeCoach(coach)
      }
    }catch(err){
      console.log(err);
    }
  }


  async getCoachTermSessions(coachId:string): Promise<ICoachSessions[]> {
    return new Promise((res,rej)=>{
      try{
        const templateQuery = gql`
        query getCoachSessionSummary($coachSummaryInput: SessionSummaryInput!) {
          getCoachSessionSummary(coachSessionSummaryInput: $coachSummaryInput){
            id
            first_name
            last_name
            total_hours
            sessions
          }
        }
      `;
    
        this.graphqlService.query(templateQuery, {
          coachSummaryInput: {ParentClubKey:this.parentClubKey,Date:new Date(),coach_id:coachId}
        }, 0)
        .subscribe((session_summary) => res(session_summary["data"]["getCoachSessionSummary"]));
      }catch(err){
        rej(err);
      }
    });
  }

  async getCoachMonthlySessions(coachId:string): Promise<ICoachSessions[]> {
    return new Promise((res,rej)=>{
      try{
        const templateQuery = gql`
        query getMontlyCoachSessionSummary($coachSummaryInput: MonthlySessionSummaryInput!) {
          getMontlyCoachSessionSummary(coachSessionSummaryInput: $coachSummaryInput){
            id
            first_name
            last_name
            total_hours
            sessions
          }
        }
      `;
        
        this.graphqlService.query(templateQuery, {
          coachSummaryInput: {ParentClubKey:this.parentClubKey,Date:new Date(),coach_id:coachId}
        }, 0)
        .subscribe((session_summary) => res(session_summary["data"]["getMontlyCoachSessionSummary"]));
      }catch(err){
        rej(err);
      }
    })
  }

  removeCoach(item) {
    let confirm = this.alertCtrl.create({
      title: 'Delete Coach',
      message: 'Are you sure? ',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {

            //console.log('Disagree clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.deleteCoach(item)
            //console.log('Agree clicked');
          }
        }
      ]
    });
    confirm.present();
  }

  deleteCoach(item) {
    console.log(item)
    this.fb.update(item.$key, "User/Coach",{IsActive: false});
    this.fb.update(item.$key, "Coach/Type2/" + item.ParentClubKey, { IsActive: false })
    //this.fb.getAllWithQuery("Club/Type2/" + item.ParentClubKey +"/"+ club.ClubKey +"/Coach"")
    const firebaseItem = this.coachFirebase.filter(coach => coach.$key == item.$key)[0]
    try{
      firebaseItem.Club.forEach(club => {
        this.fb.update(item.$key, "Club/Type2/" + item.ParentClubKey + "/" + club.ClubKey + "/Coach", { IsActive: false })
      });
      this.comonService.convertFbObjectToArray(firebaseItem.Activity).forEach(activity => {
        firebaseItem.Club.forEach(club => {
          this.fb.update(item.$key, "Activity/" + item.ParentClubKey + "/" + club.ClubKey + "/" + activity.Key + "/Coach", { IsActive: false })
        });
  
      });
    }catch(e){

    }

    this.deletecoachFromPostgres(item)

  }

  deletecoachFromPostgres(item){
    const data = {
      id: item.Id
    }
    const mutation = gql`mutation deleteCoachDeatils($coachDeleteInput:CoachFetchInput!){
      deleteCoachDeatils(coachDeleteInput:$coachDeleteInput)
    }`;
    
    this.graphqlService.mutate(mutation, {coachDeleteInput:data}, 0)
      .subscribe(({ data }) => {
        this.getAllCoachList();
        this.comonService.toastMessage('Coach deleted...', 2000,  ToastMessageType.Success)
      }, (err) => {
        console.log(JSON.stringify(err));
      })      
  }
  presentActionSheetOtherUser(item) {
    const actionSheet = this.actionSheetCtrl.create({
      //  title: 'Send Report',
      buttons: [
        {
          text: 'Edit',
          handler: () => {
            //this.goToEdit(item)
            console.log(`subadmins:${JSON.stringify(item)}`);
            this.navCtrl.push("EditothermemberPage", {
              userInfo: item
            });
          }
        },
        {
          text: 'Delete',
          handler: () => {
            this.comonService.commonAlter('Delete Team', 'Are you sure', ()=>{
              this.fb.update(item.$key, "User/SubAdmin",{IsActive: false})
              this.comonService.toastMessage('Profile deleted successfully...', 2500);
            })
            
          }
        },

      ]
    });
    actionSheet.present();
  }


  selectLevel(item) {
    this.navCtrl.push("Type2SelectCoachLevel", { CoachInfo: item });
  }

  goToEdit(info) {
    this.navCtrl.push("Type2EditCoach", {
      coachInfo: info
    });
  }
  addSubAdmin() {
    this.navCtrl.push('AddsubadminPage');
    this.fab.close();
  }
  goToSubAdminEdit(obj) {
    this.navCtrl.push('SubadminEditPage', {
      userObj: obj
    })
  }

  ionViewWillLeave(){
    this.comonService.updateCategory("");
  }

}


export interface ICoachSessions{
  id:string;
  first_name:string;
  last_name:string;
  total_hours:string;
  sessions:string;
}