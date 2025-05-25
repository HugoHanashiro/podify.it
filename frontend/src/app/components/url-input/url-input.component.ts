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
  ) { }

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

    const loadingAlert = Swal.fire({
      title: 'Convertendo...',
      html: 'Extraindo o conteúdo da URL',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      // Step 1: Extract article from URL
      const extractResponse = await this.audioService.extractArticle(this.urlInput).toPromise();
      const articleText = extractResponse?.article;

      if (!articleText) {
        throw new Error('Não foi possível extrair o conteúdo do artigo.');
      }
      Swal.update({
        html: 'Conteúdo extraído com sucesso! Gerando o áudio...'
      });

      // Step 2: Convert extracted text to audio
      const blob = await this.audioService.convertToAudio(articleText).toPromise();
      if (!blob) {
        throw new Error('Falha ao converter o conteúdo em áudio.');
      }

      const audioURL = URL.createObjectURL(blob);
      this.audioStateService.setAudioSource(audioURL);

      Swal.close();
      Swal.fire({
        icon: 'success',
        title: 'Conversão concluída!',
        text: 'O áudio está pronto para reprodução',
        confirmButtonColor: '#10b981',
        timer: 2000
      });
    } catch (error: any) {
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: error.message || 'Erro ao converter o artigo.',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      this.isLoading = false;
    }
  }
}
