import { BrowserModule } from "@angular/platform-browser";
import { ErrorHandler, NgModule } from "@angular/core";
import { IonicApp, IonicErrorHandler, IonicModule } from "ionic-angular";
import { SplashScreen } from "@ionic-native/splash-screen";
import { StatusBar } from "@ionic-native/status-bar";
import { GoogleAnalytics } from "@ionic-native/google-analytics";
import { MyApp } from "./app.component";
import { AngularFireModule } from "angularfire2";
import {
  AngularFireDatabaseModule,
  AngularFireDatabase,
} from "angularfire2/database";
import { IonicStorageModule } from "@ionic/storage";
import { HttpClientModule } from "@angular/common/http";
import { Market } from "@ionic-native/market";
import { AppVersion } from "@ionic-native/app-version";
import { AndroidPermissions } from "@ionic-native/android-permissions";
import { OneSignal } from "@ionic-native/onesignal";
import { Device } from "@ionic-native/device";
import { ApolloModule } from "apollo-angular";
import { SharedServices } from "../pages/services/sharedservice";
import { APOLLO_OPTIONS } from "apollo-angular";
import { HttpLink,HttpLinkModule } from "apollo-angular-link-http";
import { environment as devEnvironment } from '../environments/environment';
import { environment as prodEnvironment } from '../environments/environment.prod';
import { createApollo } from "./apollo.config";
import { LanguageService } from "../services/language.service";
import { GraphqlService } from "../services/graphql.service";
import { CommonService } from "../services/common.service";
import { CommonLeagueService } from "../pages/type2/league/commonleague.service";
  
       

@NgModule({
  declarations: [
    MyApp,
  ],
  imports: [
    BrowserModule,
    //CacheModule.forRoot(),
    IonicModule.forRoot(
      MyApp,
      //{ scrollAssist: false, autoFocusAssist: false }
    ),
    ApolloModule,
    HttpLinkModule,
    AngularFireModule.initializeApp(prodEnvironment.production ? prodEnvironment.firebaseConfig:devEnvironment.firebaseConfig),
    AngularFireDatabaseModule,
    HttpClientModule,
    IonicStorageModule.forRoot(),
  ],
  bootstrap: [IonicApp],

  entryComponents: [
    MyApp,
    // HomePage
  ],
  providers: [
    GoogleAnalytics,
    StatusBar,
    SplashScreen,
    AngularFireDatabase,
    Market,
    AppVersion,
    AndroidPermissions,
    OneSignal,
    Device,
    SharedServices,
    LanguageService,
    GraphqlService,
    CommonService,
    CommonLeagueService,
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink],
    },
    { provide: ErrorHandler, useClass: IonicErrorHandler },
  ],
})
export class AppModule {}
