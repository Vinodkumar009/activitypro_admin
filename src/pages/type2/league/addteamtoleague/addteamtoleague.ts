import { Component } from '@angular/core';
import gql from "graphql-tag";
import {
  IonicPage,
  LoadingController,
  NavController,
  NavParams,
} from "ionic-angular";

import { Storage } from "@ionic/storage";
import { first } from "rxjs/operators";
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { FirebaseService } from '../../../../services/firebase.service';
import { SharedServices } from '../../../services/sharedservice';
import { TeamsForParentClubModel } from '../models/team.model';
import { LeagueParticipantModel, LeaguesForParentClubModel } from '../models/league.model';
import { GraphqlService } from '../../../../services/graphql.service';


/**
 * Generated class for the AddteamtoleaguePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-addteamtoleague',
  templateUrl: 'addteamtoleague.html',
})
export class AddteamtoleaguePage {

  teamsForParentClub: TeamsForParentClubModel[] = [];
  filteredteams: TeamsForParentClubModel[] = [];
  parentClubKey:string;
 
  teamactivityDetail:TeamactivityDetail={
    ParentClubKey: '',
    MemberKey: '',
    AppType: 0,
    ActionType: 0,
    activityCode: ''
  }

  leagueParticipant:LeagueParticipantInput={
    ParentClubKey: '',
    MemberKey: '',
    AppType: 0,
    ActionType: 0,
    DeviceType: 0,
    leagueId: '',
    parentclubteamIds: [""],
    userIds: [""],
    groups: 0
  }
  existingteam:LeagueParticipantModel[];
  league:LeaguesForParentClubModel;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public fb: FirebaseService,
    public sharedservice: SharedServices,
    private graphqlService: GraphqlService,
  ) {  
    this.existingteam=this.navParams.get("existingteam")

    this.league=this.navParams.get("league");
    this.commonService.category.pipe(first()).subscribe((data) => {
      console.log(data);
      if (data == "teamlist") {
        this.storage.get("userObj").then((val) => {
          val = JSON.parse(val);
          if (val.$key != "") {
            this.parentClubKey =
            val.UserInfo[0].ParentClubKey;
            this.teamactivityDetail.ParentClubKey=
            val.UserInfo[0].ParentClubKey;
            this.teamactivityDetail.MemberKey=
            val.$key;
             this.teamactivityDetail.activityCode=String(this.league.activity.ActivityCode);
            // console.log(this.league.activity.ActivityCode);
            this.leagueParticipant.ParentClubKey= val.UserInfo[0].ParentClubKey;
            this.leagueParticipant.MemberKey=val.$key;
            this.leagueParticipant.groups=0;
           
            this.leagueParticipant.leagueId=this.league.id;
            this.leagueParticipant.DeviceType=0;
          }

          // this.getTeamsForParentClub();
         this.getTeam()

          //  this.getMatches();
        });
      }
    });
  }

  //teamselection

  selectTeams(team){
    for(let i=0;i<this.leagueParticipant.parentclubteamIds.length;i++){
      this.leagueParticipant.parentclubteamIds.push(team.id);
      this.leagueParticipant.userIds.push("");
    };
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddteamtoleaguePage');
  }

  getTeam() {
    this.commonService.showLoader("Fetching Staff...");
    const userQuery = gql`
      query getTeamsasActivity($activityDetails: TeamactivityDetail!) {
        getTeamsasActivity(activityDetails: $activityDetails) {
                  id
                  created_at
                  created_by
                  updated_at
                  is_active
                  activity{
                     ActivityCode
                     ActivityName
                  }
                  venueKey
                  venueType
                  ageGroup
                  teamName
                  teamStatus
                  teamVisibility
                  teamDescription
                  parentClub{
                    FireBaseId
                    ParentClubName
                  }
                  teamStatus
                  parentClubKey
                  venue{
                    VenueName
                  }
                
                }
      }
    `;
    this.graphqlService.query(userQuery,{activityDetails: this.teamactivityDetail},0).subscribe(({ data }) => {
          console.log(
            "teams data" + JSON.stringify(data["getTeamsasActivity"])
          );
          // this.staff = JSON.parse(JSON.stringify(data["getTeamsasActivity"]))
          this.teamsForParentClub = data["getTeamsasActivity"] as TeamsForParentClubModel[];
          if(this.teamsForParentClub.length > 0){
            for(let i=0; i < this.teamsForParentClub.length; i++){
              this.teamsForParentClub[i]["isSelect"] = false;
              this.teamsForParentClub[i]["isAlreadExisted"] = false;
            }
          }
          this.filteredteams = JSON.parse(JSON.stringify(this.teamsForParentClub));
          console.log("Getting Staff Data", this.teamsForParentClub);
          // this.filteredStaff = JSON.parse(JSON.stringify(this.staff));
          this.commonService.hideLoader();
        },
        (err) => {
          console.log(JSON.stringify(err));
          this.commonService.toastMessage("failed to fetch teams",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        })
  }

  

  //mutation for add team to a league
  saveTeam = async()=>{
    const add_participants = gql`
    mutation  addParticipantToLeague($leagueParticipant: LeagueParticipantInput!){
       addParticipantToLeague(leagueParticipant:$leagueParticipant){
       id
       league{
         venueKey
         venueType
         league_visibility
         league_name
         venue{
          VenueName
           LocationType
           ParentClubKey
           ClubKey
         }
         parentClub{
           FireBaseId
         }
       }
       parentclubteam{
         teamName
         activity {
           ActivityCode
           ActivityName
           }
           venueKey
           venueType
       }
      }

    }`
    this.graphqlService.mutate(add_participants,{ leagueParticipant: this.leagueParticipant },0).subscribe(({ data }) => {
        this.commonService.hideLoader();
        console.log("Teams data" + data["addParticipantToLeague"]);
        this.commonService.toastMessage("Participants added successfully",2500,ToastMessageType.Success,ToastPlacement.Bottom);
        // this.viewCtrl.dismiss({ canRefreshData: true });

        console.log("Teams data" + data["addParticipantToLeague"]);
        this.commonService.updateCategory("leagueteamlisting");
        this.navCtrl.pop();
      },
      (err) => {
          this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage("Participants Addition failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
       })
  }
}
export class ParentClubTeamFetchInput {
  ParentClubKey: string;
  MemberKey: string;
  AppType: Number;
  ActionType: Number;
}

export class TeamactivityDetail {
  ParentClubKey: string
  MemberKey: string
  AppType: number
  ActionType: number
  activityCode: string
}

export class LeagueParticipantInput {
  ParentClubKey: string
  MemberKey: string
  AppType: number
  ActionType: number
  DeviceType: number
  leagueId: string
  parentclubteamIds: [string]
  userIds: [string]
  groups: number
}