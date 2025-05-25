// audio-state.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AudioStateService {
  private audioSourceSubject = new BehaviorSubject<string | null>(null);
  private titleSubject = new BehaviorSubject<string>('');
  private authorSubject = new BehaviorSubject<string>('');

  title$ = this.titleSubject.asObservable();
  author$ = this.authorSubject.asObservable();
  audioSource$: Observable<string | null> = this.audioSourceSubject.asObservable();

  setTitle(title: string) {
    this.titleSubject.next(title);
  }

  setAuthor(author: string) {
    this.authorSubject.next(author);
  }

  setAudioSource(url: string | null) {
    this.audioSourceSubject.next(url);
  }
}