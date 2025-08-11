import { Component } from '@angular/core';
import { LoadingController, NavController, NavParams } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../../services/firebase.service';
// import { Dashboard } from './../../dashboard/dashboard';
import { Storage } from '@ionic/storage'
import { IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { HttpClient } from '@angular/common/http';
import moment from 'moment';
import { Apollo, QueryRef } from 'apollo-angular';
import { HttpLink } from 'apollo-angular-link-http'
import gql from 'graphql-tag';
// import { UserChallengeModel } from '../../assignmembertochallenge/assignchallenge/assignchallenge';
// import { TemplateModel } from '../../challenge-template/model/challenge_templatemodel';

@IonicPage()
@Component({
  selector: 'sessionplayerstochallenge-page',
  templateUrl: 'sessionplayerstochallenge.html'
})

export class SessionPlayerstoChallenge {
  themeType: number;
  parentClubKey: any;
  clubKey: any;
  CoachKey: any;
  SessionKey: any;
  rewardAPIData = {

    PaymentTrainsactionID: "",
    Refference: "",
    ParentClubKey: "",
    ClubKey: "",
    Transactionby: "",
    TransactionDate: "",
    Members:[]
  }
  members: {
    TotalPoints: 0,
    BonusPoints: 0,
    BonusType: "",
    ActualAmount: 0,
    TypeCode: 0,
    PrimaryMemberKey: "",
    TypeName: "",
    MemberKeys: "", // comma separated memberkeys
    Comments: "",
  }
  TypeList = [
    {
      DisplayName: 'Term Group Session',
      Name: 'TermGroupSession',
      Code: 100
    },
    {
      DisplayName: 'Monthly Session',
      Name: 'MonthlySession',
      Code: 101
    },
    {
      DisplayName: 'Weekly Session',
      Name: 'WeeklySession',
      Code: 102
    },
  ]
   

  SessionDetials: any;
  Member: any;
  currencyDetails: any;
  loading: any;
  loyaltySetup = {};
  sessionType = '';
  user: any;
  nestUrl: any;
  isReview = false;
  coachInfo: any;
  clubName: any;
  UserChallenges: any[];
  Templates: any[];
  selectedType = true;
  templatesFetched = false;
  nextClicked = ''
  SelectedMember: any;
  selectedTeplates: any[];
  constructor(public fb: FirebaseService, storage: Storage,
    public cm: CommonService, public navParams: NavParams,
    public navCtrl: NavController, public sharedservice: SharedServices,
    public popoverCtrl: PopoverController,
    public http: HttpClient, public loadingCtrl: LoadingController,
    private apollo: Apollo, private httpLink: HttpLink, ) {

    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      this.user = val
      for (let club of val.UserInfo)
        if (val.$key != "") {
          this.themeType = sharedservice.getThemeType();
          this.SessionDetials = navParams.get('sessionDetails');
          this.clubName = this.navParams.get("clubName");   
          const coach$Obs = this.fb.getAllWithQuery(`Coach/Type2/${this.SessionDetials.ParentClubKey}`, { orderByKey: true, equalTo: this.SessionDetials.CoachKey }).subscribe((data: any) => {
            coach$Obs.unsubscribe();
            this.coachInfo = data[0];
          })
          this.sessionType = this.TypeList.filter(type => type.Code == +this.SessionDetials.PaymentOption)[0].Name
          this.Member = this.cm.convertFbObjectToArray(this.SessionDetials.Member).filter(member => member.IsActive)
          this.Member.forEach(member => {
            member['IsSelect'] = false
          });
          this.nestUrl = sharedservice.getnestURL()
       
          
        }
    })

    storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);
    
    }).catch(error => {
    });

  }

  ionViewWillEnter(){
    this.nextClicked = ''
    this.templatesFetched = false
    this.selectedType = true
  }
  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }

  gotoChallenge(){
    if (this.selectedType)
      this.navCtrl.push('AssignChallenge', {parentClubKey:this.SessionDetials.ParentClubKey ,members:this.Member})
    else if(!this.selectedType && this.nextClicked == '' && !this.templatesFetched){
      this.SelectedMember = this.Member.filter(member => member.IsSelect)
      this.getTemplates()
    }
    else if(!this.selectedType && this.nextClicked == '' && this.templatesFetched){
      this.nextClicked = "next"
      this.selectedTeplates = this.Templates.filter(template => template['IsSelect'])
    }
     
      
  }

  assignTemplate() {
    throw new Error('Method not implemented.');
  }

  getTemplates= () => {
    this.cm.showLoader("Fetching templates");
    //const parentClub = "78c25502-a302-4276-9460-2114db73de03";
    // const activity = "1001";
    //123456
    const templateQuery = gql`
    query getTemplateByParentClubAndActivity($parentClubKey:String!,$activityKey:String) {
      getTemplateByParentClubAndActivity(parentClubKey:$parentClubKey,activityKey:$activityKey){
        Id
        TemplateName
        AgeGroupStart
        AgeGroupEnd
        
        Challenge{
          Id
          ChallengeName
          ChallengsImageURL
          Levels{
            LevelName
            LevelChallenge
            LevelSequence
            Points
            ApprovalDetails{
              ApprovedBy
            }
          }
        }

      }
    }
  `;
 this.apollo
  .query({
    query: templateQuery,  
    fetchPolicy: 'network-only',
    variables: {
      parentClubKey:this.SessionDetials.ParentClubKey,
      activityKey:""
    },
  })
  .subscribe(({data}) => {
    console.log('templateses data' + data["getTemplateByParentClubAndActivity"]);
    this.templatesFetched = true
    this.cm.hideLoader();
    //this.commonService.toastMessage("Templates fetched",2500,ToastMessageType.Success,ToastPlacement.Bottom);
    this.Templates = data["getTemplateByParentClubAndActivity"] ;
    this.Templates.forEach(template => {
      template['IsSelect'] = false
    })
    console.log('templates data' + JSON.stringify(this.Templates));
  },(err)=>{
    this.cm.hideLoader();
    console.log(JSON.stringify(err));
    this.cm.toastMessage("Templates fetch failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
  });

  }

  changeType(val) {
    this.selectedType = val;
    if(val){
      this.templatesFetched = false
     // this.getTemplates()  
    }
     
  }

  addmin(starTime: string, min): string {
    min = parseInt(min);
    let result: string = "";
    let startHour = parseInt(starTime.split(":")[0]);
    let startMin = parseInt(starTime.split(":")[1]);
    let res = startMin + min;
    if (res >= 60) {
        let temp: any = res - 60;
        if (String(temp).length == 1) {
            temp = 0 + "" + temp;
        }
        if (startHour == 24) {
            return '01' + ":" + temp;
        } else {
            ++startHour;
            return startHour + ":" + temp;
        }
    } else {
        return startHour + ":" + res;
    }

}


}
