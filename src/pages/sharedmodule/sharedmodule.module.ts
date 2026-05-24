import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatchPage } from "../type2/match/match";
import { IonicPageModule } from 'ionic-angular';
import { MatchladderPage } from "../type2/match/matchladder/matchladder";
import { MatchhistoryPage } from "../type2/match/matchhistory/matchhistory";
import { LeagueteamlistingPage } from "../type2/league/leagueteamlisting/leagueteamlisting";
import { SharedComponentsModule } from '../../shared/components/shared-components.module';
import { PaymentgatewaysetupPage } from "../type2/paymentgatewaysetup/paymentgatewaysetup";
import { CommentForEmptinessPage } from "../type2/commentforemptiness/commentforemptiness";

@NgModule({
  declarations: [PaymentgatewaysetupPage, CommentForEmptinessPage,
    MatchPage, MatchladderPage, MatchhistoryPage, LeagueteamlistingPage],
  exports: [PaymentgatewaysetupPage, CommentForEmptinessPage,
    MatchPage, MatchladderPage, MatchhistoryPage, LeagueteamlistingPage],
  imports: [IonicPageModule, CommonModule, SharedComponentsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SharedmoduleModule { }
