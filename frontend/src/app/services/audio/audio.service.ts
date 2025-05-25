// audio.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  constructor(private http: HttpClient) {}

  urlEndpoint: string = `http://127.0.0.1:5000`

  convertUrlToAudio(url: string): Observable<Blob> {
    return this.http.post(`${this.urlEndpoint}/convert`, { url }, {
      responseType: 'blob'
    });
  }
}