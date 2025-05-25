import { TestBed } from '@angular/core/testing';

import { AudioStateService } from './audio-state.service';

describe('AudioStateService', () => {
  let service: AudioStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AudioStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
