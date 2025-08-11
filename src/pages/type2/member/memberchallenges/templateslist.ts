import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../../services/firebase.service';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular-link-http'
import gql from 'graphql-tag';
//import { TemplateModel } from '../../challenge-template/model/challenge_templatemodel';

/**
 * Generated class for the ChallengeslistPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-templateslist',
  templateUrl: 'templateslist.html',
})
export class Templateslist {
  Challenges:Array<any> = [];
  selectedActivity = "";
  SelectedTemplates = [];
  UnmutatedChallenges = []
  parentClubKey:string = "";
  Templates:TemplateModel[];
  activityList = [];
  MemberKey:string;
  constructor(public navCtrl: NavController, private viewCtrl:ViewController, public fb: FirebaseService, public navParams: NavParams,public storage: Storage, private apollo: Apollo, private httpLink: HttpLink,public commonService: CommonService,) {
    //let data  = this.navParams.get("challenges");
    this.MemberKey = this.navParams.get("MemberKey");
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        this.getActivityList();
      }
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChallengeslistPage');
  }

  //getting activities
  getActivityList() {
    this.fb.getAll("/Activity/" + this.parentClubKey).subscribe((data) => {
      if (data.length > 0) {

        this.activityList = [];
        for (let j = 0; j < data.length; j++) {
          let ActivityList = this.commonService.convertFbObjectToArray(data[j]);
          for (let k = 0; k < ActivityList.length; k++) {
            let flag = true;
            for (let i = 0; i < this.activityList.length; i++) {
              if (ActivityList[k].IsEnable) {
                if (ActivityList[k].Key == this.activityList[i].Key) {
                  flag = false;
                  break;
                }
              }
            }
            if (flag && ActivityList[k].Key && ActivityList[k].Key!=undefined && ActivityList[k].ActivityName) {
              this.activityList.push(ActivityList[k]);
              this.selectedActivity = this.activityList[0].Key;
              flag = false;
            }
          }

        }
        this.getTemplates();
      }
    });
    
  }

  
  //getting Templates
  getTemplates= () => {
    this.commonService.showLoader("Fetching Templates");
    //const parentClub = "78c25502-a302-4276-9460-2114db73de03";
    // const activity = "1001";
    //123456
    const templateQuery = gql`
    query getTemplateByParentClubAndActivity($parentClub:String!,$activity:String!) {
      getTemplateByParentClubAndActivity(parentClubKey:$parentClub,activityKey:$activity){
        Id
        TemplateName
        AgeGroupStart
        AgeGroupEnd
        
        Challenge{
          Id
          ChallengeName
          ChallengsImageURL
          ParentClub{
            FireBaseId
          }
          Activity{
            ActivityCode
          }
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
      parentClub:this.parentClubKey,
      activity:this.selectedActivity
    },
  })
  .subscribe(({data}) => {
    console.log('templateses data' + data["getTemplateByParentClubAndActivity"]);
    this.commonService.hideLoader();
    //this.commonService.toastMessage("Templates fetched",2500,ToastMessageType.Success,ToastPlacement.Bottom);
    this.Templates = data["getTemplateByParentClubAndActivity"] as TemplateModel[];
    this.Templates.forEach((template) => {
      template["isSelect"] = false;
      template["isAlreadySelected"] = false;
    })
    console.log('templates data' + JSON.stringify(this.Templates));
  },(err)=>{
    this.commonService.hideLoader();
    console.log(JSON.stringify(err));
    this.commonService.toastMessage("Templates fetch failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
  });

  }



  Assign(){
    this.commonService.showLoader("");
    for(let templateInd = 0;templateInd < this.SelectedTemplates.length;templateInd++){
      
      this.apollo
        .mutate({
          mutation: gql`mutation($userId:String!,$templateId:String!){
            assignTemplatesToUser(userId:$userId,templateId:$templateId)
          }`,
          variables: { 
            userId:this.MemberKey,
            templateId:this.SelectedTemplates[templateInd].Id,
           },
        })
        .subscribe(({ data }) => {
          console.log('assign data' + data["assignTemplatesToUser"]);
        }, (err) => {
          //this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage("Template assign failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        });
    }
    this.commonService.hideLoader();
    this.commonService.toastMessage("Template assigned successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
    this.navCtrl.pop();
    this.navCtrl.pop();
  }

  
  selectTemplate(template:any){
    if(template.isSelect){
      this.SelectedTemplates.push(template);
    }
  }


}

class TemplateModel {
  Id: string;
  TemplateName: string;
  AgeGroupStart: number;
  AgeGroupEnd: number;
  Challenge: ChallengeModel[];
}

class ChallengeModel {
  Id: string;
  ChallengeName: string;
  Description: string;
  ChallengsImageURL: string;
  ChallengeCategory:number;
  // AgeFrom: number;
  // AgeTo: number;:
  Activity: ActivityModel;
  ParentClub: ParentClubModel;
  FireBaseId: string;
  Levels: Levelmodel[];
}
class ParentClubModel {
  Id: string;
}

class ActivityModel {
  Id: string;
  ActivityCode: string;
  FirebaseActivityKey:string;
}

class Levelmodel {
  LevelName: string;
  //Description: string;
  LevelChallenge: number;
  //ImageUrl: string;
  Points: number;
  ApprovedBy: string;
  //ApprovedBy:Approval;
}
class Approval {
  ApprovedBy: string;
}