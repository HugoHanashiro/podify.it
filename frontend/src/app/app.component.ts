import { Component } from '@angular/core';
import { AudioPlayerComponent } from './components/audio-player/audio-player.component';
import { UrlInputComponent } from './components/url-input/url-input.component';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AudioPlayerComponent, UrlInputComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'podify.it_angular';
}
