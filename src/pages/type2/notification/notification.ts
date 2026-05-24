import { Component } from '@angular/core';
import { NavController, Platform, ViewController, IonicPage, Events } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import { Storage } from '@ionic/storage';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import { HttpService } from '../../../services/http.service';
import { Clipboard } from '@ionic-native/clipboard';
import { AppType } from '../../../shared/constants/module.constants';
import { API } from '../../../shared/constants/api_constants';
import { ThemeService } from '../../../services/theme.service';
import { Subscription } from 'rxjs/Subscription';
import {
    INotification,
    IGetNotificationsInput,
    IGetNotificationsResponse,
    IDeleteNotificationInput,
    IDeleteNotificationResponse
} from '../../../shared/model/notification.model';

@IonicPage()
@Component({
    selector: 'notification-page',
    templateUrl: 'notification.html'
})
export class Type2notification {
    themeType: number;
    isAndroid: boolean = false;
    notifications: INotification[] = [];
    blockIndex: number = -1;
    loading: boolean = false;
    nextCursor: string = null;
    isDarkTheme: boolean = true;
    isRippling: boolean = false;
    private themeSub: Subscription;

    constructor(
        private clipboard: Clipboard,
        public viewController: ViewController,
        public commonService: CommonService,
        public navCtrl: NavController,
        public sharedservice: SharedServices,
        public popoverCtrl: PopoverController,
        private httpService: HttpService,
        private storage: Storage,
        private themeService: ThemeService,
        public events: Events,
        platform: Platform
    ) {
        this.themeType = sharedservice.getThemeType();
        this.isAndroid = platform.is('android');
    }

    ionViewDidLoad() {
    }

    ionViewDidEnter() {
        this.loadTheme();
        this.themeSub = this.themeService.isDarkTheme$.subscribe(isDark => {
            this.isDarkTheme = isDark;
            this.applyTheme(isDark);
        });
        this.events.subscribe('theme:changed', (isDark) => {
            this.isDarkTheme = isDark;
            this.applyTheme(isDark);
        });

        this.notifications = [];
        this.nextCursor = null;
        this.fetchNotifications();
    }

    ionViewWillLeave() {
        if (this.themeSub && !this.themeSub.closed) {
            this.themeSub.unsubscribe();
        }
        this.events.unsubscribe('theme:changed');
    }

    private buildPayload(cursor?: string): IGetNotificationsInput {
        const payload: IGetNotificationsInput = {
            parentclub_id: this.sharedservice.getPostgreParentClubId() || '',
            club_id: '',
            activity_id: '',
            member_id: '',
            action_type: 1,
            device_type: this.sharedservice.getPlatform() === 'android' ? 1 : 2,
            app_type: AppType.ADMIN_NEW,
            device_id: 'string',
            updated_by: '',
            user_id: this.sharedservice.getLoggedInUserId() || ''
        };
        if (cursor) payload.cursor = cursor;
        return payload;
    }

    fetchNotifications() {
        this.loading = true;
        this.httpService.post<IGetNotificationsResponse>(API.GET_NOTIFICATIONS, this.buildPayload(this.nextCursor)).subscribe(
            (res) => {
                this.loading = false;
                if (res && res.data) {
                    this.notifications = this.notifications.concat(res.data.notifications || []);
                    this.nextCursor = res.data.next_cursor || null;
                }
            },
            (err) => {
                this.loading = false;
                this.commonService.toastMessage('Failed to load notifications', 2500, ToastMessageType.Error);
            }
        );
    }

    loadMore(infiniteScroll: any) {
        if (!this.nextCursor) {
            infiniteScroll.complete();
            return;
        }
        this.httpService.post<IGetNotificationsResponse>(API.GET_NOTIFICATIONS, this.buildPayload(this.nextCursor)).subscribe(
            (res) => {
                infiniteScroll.complete();
                if (res && res.data) {
                    this.notifications = this.notifications.concat(res.data.notifications || []);
                    this.nextCursor = res.data.next_cursor || null;
                }
            },
            (err) => {
                infiniteScroll.complete();
                this.commonService.toastMessage('Failed to load notifications', 2500, ToastMessageType.Error);
            }
        );
    }

    deleteNotification(item: INotification, index: number) {
        const payload: IDeleteNotificationInput = {
            parentclub_id: this.sharedservice.getPostgreParentClubId() || '',
            club_id: '',
            activity_id: '',
            member_id: '',
            action_type: 0,
            device_type: this.sharedservice.getPlatform() === 'android' ? 1 : 2,
            app_type: AppType.ADMIN_NEW,
            device_id: 'string',
            updated_by: '',
            notification_id: item.id
        };

        this.notifications.splice(index, 1);
        this.isRippling = false;

        setTimeout(() => {
            this.isRippling = true;
            setTimeout(() => { this.isRippling = false; }, 1200);
        }, 30);

        this.httpService.post<IDeleteNotificationResponse>(API.DELETE_NOTIFICATION, payload).subscribe(
            (res: IDeleteNotificationResponse) => {
                this.commonService.toastMessage(res.message, 2000, ToastMessageType.Success);
            },
            () => {
                this.notifications.splice(index, 0, item);
                this.commonService.toastMessage('Failed to delete notification', 2500, ToastMessageType.Error);
            }
        );
    }

    showAlert(item: INotification) {
        this.navCtrl.push("NotificationDetails", { "NotificationDetail": item });
    }

    showBlock(event: any, index: number) {
        if (event && event.target && event.target.closest('.copy-btn')) return;
        this.blockIndex = (this.blockIndex === index) ? -1 : index;
    }

    copy(data: string) {
        if (navigator['clipboard']) {
            navigator['clipboard'].writeText(data);
        } else {
            this.clipboard.copy(data);
        }
        this.commonService.toastMessage('📋 Copied to clipboard', 2000, ToastMessageType.Success, ToastPlacement.Top);
    }

    cancel() {
        this.navCtrl.pop();
    }

    goToDashboardMenuPage() {
        this.navCtrl.setRoot("Dashboard");
    }

    presentPopover(myEvent) {
        let popover = this.popoverCtrl.create("PopoverPage");
        popover.present({ ev: myEvent });
    }

    isNegativeNotification(header: string): boolean {
        return header ? header.includes('❌') : false;
    }

    private loadTheme(): void {
        this.storage.get('dashboardTheme').then((isDarkTheme) => {
            const isDark = isDarkTheme !== null ? isDarkTheme : true;
            this.isDarkTheme = isDark;
            this.applyTheme(isDark);
        });
    }

    private applyTheme(isDark: boolean): void {
        const el = document.querySelector('notification-page');
        if (el) {
            isDark ? el.classList.remove('light-theme') : el.classList.add('light-theme');
        }
    }
}
