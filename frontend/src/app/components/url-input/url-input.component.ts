import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ButtonModule } from 'primeng/button';
import { AudioService } from '../../services/audio/audio.service';
import { AudioStateService } from '../../services/audio-state/audio-state.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-url-input',
  standalone: true,
  imports: [FormsModule, InputGroupAddonModule, InputGroupModule, ButtonModule],
  templateUrl: './url-input.component.html',
  styleUrl: './url-input.component.css'
})
export class UrlInputComponent {
  urlInput: string = '';
  isLoading: boolean = false;

  constructor(
    private audioService: AudioService,
    private audioStateService: AudioStateService
  ) {}

  async convertToAudio() {
    if (!this.urlInput) {
      Swal.fire({
        icon: 'warning',
        title: 'URL necessária',
        text: 'Por favor, insira uma URL.',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }
    
    this.isLoading = true;
    
    // Show loading SweetAlert
    const loadingAlert = Swal.fire({
      title: 'Convertendo...',
      html: 'Estamos transformando o conteúdo em áudio',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const blob = await this.audioService.convertUrlToAudio(this.urlInput).toPromise();
      if (blob) {
        const audioURL = URL.createObjectURL(blob);
        this.audioStateService.setAudioSource(audioURL);
        
        // Close loading and show success
        Swal.close();
        Swal.fire({
          icon: 'success',
          title: 'Conversão concluída!',
          text: 'O áudio está pronto para reprodução',
          confirmButtonColor: '#10b981',
          timer: 2000
        });
      } else {
        throw new Error('Failed to convert URL to audio: Blob is undefined.');
      }
    } catch (error: any) {
      // Close loading and show error
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Erro na conversão',
        text: error.message || 'Erro ao converter o artigo.',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      this.isLoading = false;
    }
  }
}