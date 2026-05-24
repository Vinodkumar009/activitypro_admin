import { Storage } from '@ionic/storage';
import { IonicPage, AlertController, NavController, Events } from 'ionic-angular';
import { Component, ViewChild, Renderer2 } from '@angular/core';
import { ViewController, Platform, NavParams } from 'ionic-angular';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import gql from 'graphql-tag';
import { ParentClub } from '../../../shared/model/club.model';
import { GraphqlService } from '../../../services/graphql.service';
import { ThemeService } from '../../../services/theme.service';

@IonicPage()
@Component({
  selector: 'mailtomemberbyadmin-page',
  templateUrl: 'mailtomemberbyadmin.html',
  providers: [FirebaseService, CommonService]
})
export class MailToMemberByAdminPage {

  @ViewChild('messageInput') messageInput: any;
  @ViewChild('subjectInput') subjectInput: any;

  memberList = [];
  parentClubKey = "";
  sessionDetails: any;
  selectedClub = "";
  clubDetails: any;
  parentClubDetails: ParentClub;
  emailObj = {
    Message: "",
    Subject: ""
  }
  numberOfPeople = "0 People";
  navigateFrom = "";
  campDetails: any;
  module_obj: EmailModalForModule;
  isDarkTheme: boolean = true;

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public storage: Storage,
    private commonService: CommonService,
    private fb: FirebaseService,
    public platform: Platform,
    private params: NavParams,
    public viewCtrl: ViewController,
    private graphqlService: GraphqlService,
    private themeService: ThemeService,
    private renderer: Renderer2,
    public events: Events
  ) {
    this.module_obj = this.params.get("email_modal");
    if (this.module_obj.type == ModuleTypeForEmail.TERMSESSION || this.module_obj.type == ModuleTypeForEmail.MONTHLYSESSION) {
      this.emailObj.Message = "Dear All,";
      if (this.module_obj.email_users.length > 0) {
        this.numberOfPeople = this.module_obj.email_users.length + " recipients";
      }
    } else if (this.module_obj.type == ModuleTypeForEmail.WEEKLYSESSION) {
      if (this.module_obj.email_users.length > 0) {
        this.numberOfPeople = this.module_obj.email_users.length + " recipients"
      }
    } else if (this.module_obj.type == ModuleTypeForEmail.MEMBER) {
      if (this.module_obj.email_users.length > 0) {
        this.numberOfPeople = this.module_obj.email_users.length + " recipients"
        this.emailObj.Message = `Dear ${this.module_obj.email_users[0].MemberName},`;
      }
    } else if (this.module_obj.type == ModuleTypeForEmail.EVENTS) {
      this.emailObj.Message = "Dear All,";
      if (this.module_obj.email_users.length > 0) {
        this.numberOfPeople = this.module_obj.email_users.length + " recipients"
      }
    } else if (this.module_obj.type == ModuleTypeForEmail.ATTENDANCE) {
      if (this.module_obj.email_users.length > 0) {
        this.numberOfPeople = this.module_obj.email_users.length + " recipients";
      }
    } else if (this.module_obj.type == ModuleTypeForEmail.HOLIDAYCAMP) {
      this.campDetails = this.params.get("CampDetails");
      this.emailObj.Message = "Dear All,";
      if (this.module_obj.email_users.length > 0) {
        this.numberOfPeople = this.module_obj.email_users.length + " recipients";
      }
    } else if (this.module_obj.type == ModuleTypeForEmail.SCHOOLSESSION) {
      this.emailObj.Message = "Dear All,";
      if (this.module_obj.email_users.length > 0) {
        this.numberOfPeople = this.module_obj.email_users.length + " recipients";
      }
    } else if (this.module_obj.type == ModuleTypeForEmail.LEAGUE || this.module_obj.type == ModuleTypeForEmail.LEAGUE_TEAM) {
      this.emailObj.Message = "Dear All,";
      this.emailObj.Subject = this.module_obj.subject;
      if (this.module_obj.email_users.length > 0) {
        this.numberOfPeople = this.module_obj.email_users.length + " recipients";
      }
    }

    this.getParentclubDetails();
  }

  ionViewDidLoad() {
    // Enable native spellcheck on the inner textarea/input elements
    if (this.messageInput && this.messageInput._native) {
      this.messageInput._native.nativeElement.setAttribute('spellcheck', 'true');
    }
    if (this.subjectInput && this.subjectInput._native) {
      this.subjectInput._native.nativeElement.setAttribute('spellcheck', 'true');
    }
  }

  ionViewWillEnter() {
    this.loadTheme();
    this.themeService.isDarkTheme$.subscribe(isDark => {
      this.applyTheme(isDark);
    });
    this.events.subscribe('theme:changed', (isDark) => {
      this.applyTheme(isDark);
    });
  }

  ionViewWillLeave() {
    this.events.unsubscribe('theme:changed');
  }

  async loadTheme() {
    const isDarkTheme = await this.storage.get('dashboardTheme');
    const isDark = isDarkTheme !== null ? isDarkTheme : true;
    this.isDarkTheme = isDark;
    this.applyTheme(isDark);
  }

  applyTheme(isDark: boolean) {
    this.isDarkTheme = isDark;
    const el = document.querySelector('mailtomemberbyadmin-page');
    if (el) {
      isDark ? this.renderer.removeClass(el, 'light-theme')
             : this.renderer.addClass(el, 'light-theme');
    }
  }

  getParentclubDetails() {
    this.storage.get("postgre_parentclub").then((parentclub: ParentClub) => {
      if (parentclub != null) {
        this.parentClubDetails = parentclub;
        this.emailObj.Message += "\n\n\n\nKind Regards,\n" + this.parentClubDetails.ParentClubName + "\n";
      }
    })
  }

  sendEmails() {
    try {
      if (!this.parentClubDetails.ParentClubName || this.parentClubDetails.ParentClubName === "") {
        this.commonService.toastMessage("Parent club name is required", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        return;
      }
      if (!this.parentClubDetails.ParentClubAdminEmailID || this.parentClubDetails.ParentClubAdminEmailID === "") {
        this.commonService.toastMessage("Parent club admin email is required", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        return;
      }
      if (!this.emailObj.Subject.trim() || this.emailObj.Subject === "") {
        this.commonService.toastMessage("Email subject is required", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        return;
      }
      if (!this.emailObj.Message.trim() || this.emailObj.Message === "") {
        this.commonService.toastMessage("Email message is required", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        return;
      }
      if (this.module_obj.email_users.length == 0) {
        this.commonService.toastMessage("No recipients found", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        return;
      }

      const emailFormembers = {
        Members: [],
        ImagePath: this.parentClubDetails.ParentClubAppIconURL,
        FromEmail: "activitypro17@gmail.com",
        FromName: this.parentClubDetails.ParentClubName,
        ToEmail: this.parentClubDetails.ParentClubAdminEmailID,
        ToName: this.parentClubDetails.ParentClubName,
        CCName: this.parentClubDetails.ParentClubName,
        CCEmail: this.parentClubDetails.ParentClubAdminEmailID,
        Subject: this.emailObj.Subject,
        Message: this.emailObj.Message,
      }

      emailFormembers.Members = this.module_obj.email_users;

      const email_mutation = gql`
      mutation sendNotificationEmail($emailInput: EmailNotification!) {
        sendNotificationEmail(emailInput: $emailInput)
      }`

      const email_variable = { emailInput: emailFormembers };
      this.graphqlService.mutate(email_mutation, email_variable, 0).subscribe((response) => {
        this.commonService.toastMessage("Mail sent successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.emailObj.Message = "Dear All,\n\n\n\nSincerely Yours,\n" + this.parentClubDetails.ParentClubName + "\n" + this.parentClubDetails.ParentClubAdminEmailID;
        this.emailObj.Subject = "";
        this.navCtrl.pop();
      }, (err) => {
        this.commonService.hideLoader();
        this.commonService.toastMessage("Email sent failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      });

    } catch (ex) {
      console.log(JSON.stringify(ex));
      this.commonService.toastMessage("Error in sending email", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    }
  }

  validateEmail() {
    if (this.emailObj.Subject.trim() == "") {
      this.commonService.toastMessage("Please enter subject", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    }
    return true;
  }

  sendEmailToMembers() {
    if (this.validateEmail()) {
      let alert = this.alertCtrl.create({
        subTitle: 'Send email',
        message: 'Are you sure want to send email ?',
        buttons: [
          {
            text: "Don't send",
            role: 'cancel',
            handler: () => { }
          },
          {
            text: 'Send',
            handler: () => {
              this.sendEmails();
            }
          }
        ]
      });
      alert.present();
    }
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}


export class EmailModalForModule {
  module_info?: {
    module_id: string;
    module_booking_club_id: string
    module_booking_club_name: string;
    module_booking_coach_id: string;
    module_booking_coach_name: string;
    module_booking_name: string;
    module_booking_start_date: string;
    module_booking_end_date: string;
    module_booking_start_time: string;
  }
  email_users: EmailUsers[];
  type: number;
  subject?: string;
}

export class EmailUsers {
  IsChild: boolean
  ParentId: string
  MemberId: string
  MemberEmail: string
  MemberName: string
}

export enum ModuleTypeForEmail {
  TERMSESSION = 100,
  MONTHLYSESSION = 101,
  WEEKLYSESSION = 102,
  SCHOOLSESSION = 103,
  COURTBOOKING = 105,
  EVENTS = 106,
  ATTENDANCE = 107,
  MEMBER = 110,
  HOLIDAYCAMP = 500,
  LEAGUE = 600,
  LEAGUE_TEAM = 125
}

export enum ModuleReportTypeForEmail {
  TERMSESSION_REPORT = 100,
  MONTHLYSESSION_REPORT = 101,
  WEEKLYSESSION_REPORT = 102,
  SCHOOLSESSION_REPORT = 103,
  COURTBOOKING_REPORT = 105,
  MEMBERSHIP = 116
}
