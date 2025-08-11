import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class EventDetailsService {
  constructor(private http: HttpClient) {}

  getEventDetails(eventId: string): Observable<any> {
    return this.http.get(`/api/event-details/${eventId}`);
  }

  getTickets(eventId: string): Observable<any> {
    return this.http.get(`/api/event-tickets/${eventId}`);
  }

  updateEventDetails(eventId: string, payload: any): Observable<any> {
    return this.http.put(`/api/event-details/${eventId}`, payload);
  }

  // Add more methods based on the functionality in the original file.
}
