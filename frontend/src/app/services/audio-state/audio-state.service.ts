// audio-state.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AudioStateService {
  private audioSourceSubject = new BehaviorSubject<string | null>(null);
  
  audioSource$: Observable<string | null> = this.audioSourceSubject.asObservable();
  
  setAudioSource(url: string | null) {
    this.audioSourceSubject.next(url);
  }
}