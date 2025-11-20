import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { SharedServices } from '../pages/services/sharedservice';
import { AppType } from '../shared/constants/module.constants';
import { API } from '../shared/constants/api_constants';
import { Observable } from 'rxjs';

@Injectable()
export class ParentClubService {
  constructor(
    private httpService: HttpService,
    private sharedService: SharedServices
  ) {}

  getParentClubDetails(type:number,parentclub_id:string): Observable<any> {
    const input = {
      clubId: '',
      activityId: '',
      memberId: this.sharedService.getLoggedInUserId(),
      action_type: 1,
      device_type: this.sharedService.getPlatform() === 'android' ? 1 : 2,
      app_type: AppType.ADMIN_NEW,
      device_id: this.sharedService.getDeviceId() || 'unknown',
      updated_by: this.sharedService.getLoggedInUserId(),
      load_relations: false
    };

    if(type === 2) {
      input['parentclub_id'] = parentclub_id;
      input['parentclubId'] = parentclub_id;
    }else{
      input['firebase_id'] = parentclub_id
    }

    return this.httpService.post(`${API.GET_PARENTCLUB_DETS}`, input);
  }
}
