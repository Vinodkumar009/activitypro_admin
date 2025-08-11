import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import gql from "graphql-tag";
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { Apollo, QueryRef } from 'apollo-angular';
import moment from 'moment';
import { first } from "rxjs/operators";
import { Storage } from "@ionic/storage";
import { LeaguesForParentClubModel } from '../models/league.model';
import { TeamsForParentClubModel } from '../models/team.model';

/**
 * Generated class for the ListofleaguePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-listofleague',
  templateUrl: 'listofleague.html',
})
export class ListofleaguePage {

  leagueFetchInput:LeagueFetchInput= {
    ParentClubKey: "",
    MemberKey: "",
    AppType: 0,
    ActionType: 0
    };
    ParentClubTeamFetchInput: ParentClubTeamFetchInput = {
      ParentClubKey: "",
      MemberKey: "",
      AppType: 0,
      ActionType: 0,
    };
  leagues:LeaguesForParentClubModel[]= [];
  filteredLeagues:LeaguesForParentClubModel[]= [];
  teamsForParentClub: TeamsForParentClubModel[] = [];
  today = moment().format("DD-MM-YYYY");
  Today: number = 0;
  searchInput="";
  leaguesForParentClub:LeaguesForParentClubModel[]=[];
  LeagueFetchInput: LeagueFetchInput = {
    ParentClubKey: "",
    MemberKey: "",
    AppType: 0,
    ActionType: 0,
  };

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public commonService: CommonService,
    private apollo: Apollo,
    public storage: Storage,) {
      this.commonService.category.pipe(first()).subscribe((data) => {
        if (data == "leaguelist") {
          this.storage.get("userObj").then((val) => {
            val = JSON.parse(val);
            if (val.$key != "") {
              this.leagueFetchInput.ParentClubKey =
                val.UserInfo[0].ParentClubKey;     
            }
           // this.getLeagues(); 
           this.getLeaguesForParentClub();
           this.getTeamsForParentClub();
          });
        }
      });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ListofleaguePage');
  }

  ionViewWillEnter() {
    console.log("LeaguelistingPage");
    this.leagueFetchInput.ParentClubKey = this.navParams.get(
      "selectedParentClubKey"
    ); 
    }

  // gotoDashboard() {
  //   this.navCtrl.push("Dashboard");
  // }

  // gotoLeaguedetailsPage(league) {
  //   this.navCtrl.push("LeaguedetailsPage", {
  //     league:league,
  //   });
  // }

  //getting Leagues
//   getLeagues=()=>{
//     this.commonService.showLoader("Fetching Leagues..")

//     const leaguesQuery=gql`
//     query getLeaguesForParentClub($ParentClubDetails: LeagueFetchInput!) {
//       getLeaguesForParentClub(ParentClubDetails: $ParentClubDetails))
//       {
//         id
//         created_at
//         is_active
//         league_name
//         activity{
//           ActivityName
//          }
//         league_type
//         league_category
//         league_ageGroup
//         league_logoURL
//         league_description
//         start_date
//         end_date
//         venueKey
//         Venue{
//         VenueName
//         }
//       }
//     }
//   `;
//   this.apollo
//   .query({
//     query: leaguesQuery,
//     fetchPolicy: 'network-only',
//     variables: {
//       ParentClubDetails:this.leagueFetchInput,
//     },
//   })
//   .subscribe(
//     ({ data }) => {
//       console.log("leagues data"+data["getLeaguesForParentClub"]);
//       this.commonService.hideLoader();
//       this.leagues=data["getLeaguesForParentClub"];
//       //this.filteredLeagues=JSON.parse(JSON.stringify(this.leagues));
  
//     },(err)=>{
//   this.commonService.hideLoader();
//   console.log(JSON.stringify(err));
//   this.commonService.toastMessage("League fetch failed",2500,ToastMessageType.Error,ToastPlacement.Bottom)
//   }   
//   )
// }

getLeaguesForParentClub = () => {
  this.commonService.showLoader("Fetching Leagues..")
  const leaguesforparentclubQuery = gql`
    query getLeaguesForParentClub($ParentClubDetails: LeagueFetchInput!) {
      getLeaguesForParentClub(ParentClubDetails: $ParentClubDetails) {
        id
        message
        created_at
        created_by
        updated_at
        is_active
        league_name
        activity {
          ActivityName
        }
        league_type
        league_category
        league_ageGroup
        league_logoURL
        league_description
        start_date
        end_date
        venueKey
        Venue{
          VenueName
        }
      }
    }
  `;
  this.apollo
    .query({
      query: leaguesforparentclubQuery,
      fetchPolicy: "network-only",
      variables: {
        ParentClubDetails:this.LeagueFetchInput
      },
    })
    .subscribe(({ data }) => {
      console.log(
        "leaguesforparentclub data" +
          JSON.stringify(data["getLeaguesForParentClub"])
      );
      this.leaguesForParentClub= data["getLeaguesForParentClub"];
    });
  (err) => {
    // this.commonService.hideLoader();
    console.log(JSON.stringify(err));
    this.commonService.toastMessage(
      "Failed to fetch Leagues",
      2500,
      ToastMessageType.Error,
      ToastPlacement.Bottom
    );
  };
};

getTeamsForParentClub = () => {
  const teamsforparentclubQuery = gql`
    query getTeamsForParentClub($TeamDetails: ParentClubTeamFetchInput!) {
      getTeamsForParentClub(TeamDetails: $TeamDetails) {
        id
        created_at
        created_by
        updated_at
        is_active
        activity {
          ActivityName
        }
        ageGroup
        teamName
        teamStatus
        teamDescription
      }
    }
  `;
  this.apollo
    .query({
      query: teamsforparentclubQuery,
      fetchPolicy: "network-only",
      variables: {
        TeamDetails: this.ParentClubTeamFetchInput,
      },
    })
    .subscribe(({ data }) => {
      console.log(
        "teamsforparentclub data" +
          JSON.stringify(data["getTeamsForParentClub"])
      );
      this.teamsForParentClub = data["getTeamsForParentClub"];
    });
  (err) => {
    // this.commonService.hideLoader();
    console.log(JSON.stringify(err));
    this.commonService.toastMessage(
      "Failed to fetch Teams",
      2500,
      ToastMessageType.Error,
      ToastPlacement.Bottom
    );
  };
};


}

export class LeagueFetchInput {
  ParentClubKey: string
  MemberKey: string
  AppType: number
  ActionType: number
  }

  export class ParentClubTeamFetchInput {
    ParentClubKey: string;
    MemberKey: string;
    AppType: Number;
    ActionType: Number;
  }