import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { AudioStateService } from '../../services/audio-state/audio-state.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-audio-player',
  standalone: true,
  imports: [ButtonModule, CommonModule],
  templateUrl: './audio-player.component.html',
  styleUrl: './audio-player.component.css'
})
export class AudioPlayerComponent implements OnInit, OnDestroy {
  @ViewChild('audioPlayer') audioPlayerRef!: ElementRef<HTMLAudioElement>;

  isPlaying = false;
  progress = 0;
  audioSource: string | null = null;
  isCollapsed = true;
  private audioSubscription: Subscription | null = null;

  articleTitle: string = ""
  articleAuthor: string = ""

  constructor(
    private audioStateService: AudioStateService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.audioStateService.title$.subscribe(title => this.articleTitle = title);
    this.audioStateService.author$.subscribe(author => this.articleAuthor = author);
    this.audioSubscription = this.audioStateService.audioSource$.subscribe(url => {
      if (url) {
        this.audioSource = url;
        this.isCollapsed = false;
        
        setTimeout(() => {
          if (this.audioPlayerRef && this.audioPlayerRef.nativeElement) {
            this.audioPlayerRef.nativeElement.src = url;
            this.audioPlayerRef.nativeElement.load();
            this.audioPlayerRef.nativeElement.play();
            this.isPlaying = true;
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  ngOnDestroy() {
    this.audioSubscription?.unsubscribe();
  }

  togglePlayer() {
    this.isCollapsed = !this.isCollapsed;
  }

  togglePlay() {
    const audio = this.audioPlayerRef.nativeElement;
    if (audio.paused) {
      audio.play();
      this.isPlaying = true;
    } else {
      audio.pause();
      this.isPlaying = false;
    }
  }

  rewind() {
    this.audioPlayerRef.nativeElement.currentTime -= 10;
  }

  forward() {
    this.audioPlayerRef.nativeElement.currentTime += 10;
  }

  updateProgress() {
    const audio = this.audioPlayerRef.nativeElement;
    this.progress = (audio.currentTime / audio.duration) * 100;

    const progressBar = document.getElementById('progressBar') as HTMLInputElement;
    if (progressBar) {
      progressBar.style.setProperty('--progress', `${this.progress}%`);
    }
  }

  seek(event: any) {
    const audio = this.audioPlayerRef.nativeElement;
    audio.currentTime = (event.target.value / 100) * audio.duration;
  }

  setDuration() {
    this.updateProgress();
  }
  
  get downloadUrl(): string {
    return this.audioSource || '';
  }
}