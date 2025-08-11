import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import gql from 'graphql-tag';
import { GraphqlService } from '../../../../services/graphql.service';
import { Storage } from '@ionic/storage';
import { SharedServices } from '../../../services/sharedservice';
import { FirebaseService } from '../../../../services/firebase.service';
import { LeagueParticipantModel } from '../models/league.model';

/**
 * Generated class for the TournamentmailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-tournamentmail',
  templateUrl: 'tournamentmail.html',
})
export class TournamentmailPage {

  emailObj = {
    Message: "",
    Subject: ""
  }

  numberOfPeople = "1 People";

  parentClubKey = "";

  parentClubName: any;

  parentClubDetails: any;

  members: LeagueParticipantModel

  emailNotification: EmailNotification = {
    Members: [],
    ImagePath: '',
    FromEmail: '',
    ToEmail: '',
    CCName: '',
    CCEmail: '',
    Subject: '',
    Message: '',
    ToName: '',
    FromName: '',
    ReplyTo: '',
    ParentClubId: '',
    Source: 0,
    Priority: 0,
    Type: 0,
    UserInfoType: 0,
    Module: ''
  }

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController,
    public commonService: CommonService, private graphqlService: GraphqlService,
    private sharedService: SharedServices, public storage: Storage,
    public fb: FirebaseService,) {
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      this.parentClubName = val.Name;

      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        this.getParentclubDetails();
      }

      this.members = this.navParams.get("member")

     // this.numberOfPeople = this.members.length + " Recipients"

      console.log("members to send the email", this.members);

    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TournamentmailPage');
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
  dummyMembers = [
    {
      ParentId: "1d81d8d9-5e7f-4276-8b1f-678f77385937",
      MemberName: "Debanjan Sumar",
      MemberEmail: "junesumar0106@gmail.com",
      MemberId: "1d81d8d9-5e7f-4276-8b1f-678f77385937"
    },
    // {
    //   ParentId: "2d92e9e8-6f8e-4385-9c1e-789g88496074",
    //   MemberName: "Jane Smith",
    //   MemberEmail: "jane.smith@example.com",
    //   IsChild: false,
    //   MemberId: "2d92e9e8-6f8e-4385-9c1e-789g88496074"
    // },
    // {
    //   ParentId: "3a83f7f6-9d7c-4564-8b2d-345e45236628",
    //   MemberName: "Alice Johnson",
    //   MemberEmail: "alice.johnson@example.com",
    //   IsChild: true,
    //   MemberId: "3a83f7f6-9d7c-4564-8b2d-345e45236628"
    // }
  ];

  getParentclubDetails() {
    this.fb.getAllWithQuery("ParentClub/Type2/", { orderByKey: true, equalTo: this.parentClubKey }).subscribe((data) => {
      if (data.length > 0) {
        this.parentClubDetails = data[0];
        // this.emailObj.Message += "\n\n\n\nKind Regards,\n" + this.parentClubDetails.ParentClubName + "\n" + "Ph:" + this.parentClubDetails.ContactPhone;
        // this.emailObj.Message = "Dear All,\n\n\n\n\nKind Regards,\n" + this.parentClubDetails.ParentClubName + "\n" + "Ph:" + this.parentClubDetails.ContactPhone;
        // this.emailObj.Subject = "";
      }
    })
  }

  async sendEmailToMembers() {
    console.log("email api is calling");
    try {

      // Prepare EmailNotification object
      this.emailNotification.Subject = this.emailObj.Subject;
      this.emailNotification.Message = this.emailObj.Message;

      let obj={
        ParentId: this.members.participant_details.parent_id,
        MemberName:this. members.participant_name,
        MemberEmail:this. members.participant_details.contact_email,

        MemberId:this. members.id
      }
      this.emailNotification.Members.push(obj);

      // Iterate over received members and populate EmailNotification.Members array
      // const members: any[] = this.navParams.get('members'); // Assuming you're receiving the members data through NavParams
      
      // this.emailNotification.Members = this.members.map(member => ({
      //   ParentId: member.participant_details.parent_id,
      //   MemberName: member.participant_name,
      //   MemberEmail: member.participant_details.email,

      //   MemberId: member.id
      // }));


      this.emailNotification.ImagePath = this.parentClubDetails.ParentClubAppIconURL,
      this.emailNotification.FromEmail = "activitypro17@gmail.com"
      this.emailNotification.FromName = this.parentClubDetails.ParentClubName,
      this.emailNotification.ToEmail = this.parentClubDetails.ParentClubAdminEmailID,
      this.emailNotification.ToName = this.parentClubDetails.ParentClubName
      this.emailNotification.CCName = this.parentClubDetails.ParentClubName
      this.emailNotification.CCEmail = this.parentClubDetails.ParentClubAdminEmailID,
      this.emailNotification.Subject = this.emailObj.Subject
      this.emailNotification.Message = this.emailObj.Message;
      this.commonService.showLoader("Please wait");
      const createSession = gql`
      mutation sendNotificationEmail($emailInput: EmailNotification!){
        sendNotificationEmail(emailInput:$emailInput)

        
      }
      
      
      `;
      const mutationVariable = { emailInput: this.emailNotification }
      await this.graphqlService.mutate(createSession, mutationVariable, 0).toPromise();
      this.commonService.hideLoader();
      const message = "Email send successfully";
      this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
      this.navCtrl.pop();

    } catch (error) {
      this.commonService.hideLoader();
    }
  }

}

export class EmailNotification {
  // user_postgre_metadata: UserPostgreMetadataField
  // user_firebase_metadata: UserFirebaseMetadataField
  // user_device_metadata: UserDeviceMetadataField
  Members: EmailNotififyMembers[]
  ImagePath: string
  FromEmail: string
  ToEmail: string
  CCName: string
  CCEmail: string
  Subject: string
  Message: string
  ToName: string
  FromName: string
  ReplyTo: string
  ParentClubId: string
  Source: number
  Priority: number
  Type: number
  UserInfoType: number
  Module: string
}

export class EmailNotififyMembers {
  ParentId: string
  MemberName: string
  MemberEmail: string
  // IsChild: boolean
  MemberId: string
}