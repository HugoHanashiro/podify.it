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
  isCollapsed = false;
  private audioSubscription: Subscription | null = null;

  constructor(
    private audioStateService: AudioStateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.audioSubscription = this.audioStateService.audioSource$.subscribe(url => {
      if (url) {
        this.audioSource = url;
        
        // Show the player when new audio is loaded
        this.isCollapsed = false;
       
        // Need to wait for ViewChild to be initialized
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

    this.audioStateService.setAudioSource('assets/bad_apple_enhanced.mp3');
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
    
    // Update CSS custom property for WebKit browsers
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

  // Safe getter for download URL
  get downloadUrl(): string {
    return this.audioSource || '';
  }
}