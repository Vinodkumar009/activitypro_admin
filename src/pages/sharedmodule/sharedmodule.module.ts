import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PaymentgatewaysetupPage } from "../type2/paymentgatewaysetup/paymentgatewaysetup";
import { CommentForEmptinessPage } from "../type2/commentforemptiness/commentforemptiness";
import { MatchPage } from "../type2/match/match";
import { IonicPageModule } from 'ionic-angular';
import { LeagueteamlistingPage } from "../type2/league/leagueteamlisting/leagueteamlisting";
import { MatchladderPage } from "../type2/match/matchladder/matchladder";
import { MatchhistoryPage } from "../type2/match/matchhistory/matchhistory";
@NgModule({
  declarations: [PaymentgatewaysetupPage, CommentForEmptinessPage,
    LeagueteamlistingPage,
    MatchPage,
    MatchladderPage,
    MatchhistoryPage
  ],
  exports: [PaymentgatewaysetupPage, CommentForEmptinessPage,
    LeagueteamlistingPage,
    MatchPage,MatchladderPage,MatchhistoryPage
  ],
  imports: [IonicPageModule,CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SharedmoduleModule {}
