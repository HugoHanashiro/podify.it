// audio.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  constructor(private http: HttpClient) { }

  urlEndpoint: string = `http://127.0.0.1:5000`

  extractArticle(url: string) {
    return this.http.post<{ title: string; author: string; article: string }>(
      `${this.urlEndpoint}/extract`,
      { url }
    );
  }

  convertToAudio(articleText: string) {
    return this.http.post(`${this.urlEndpoint}/audio`, { text: articleText }, { responseType: 'blob' });
  }
}