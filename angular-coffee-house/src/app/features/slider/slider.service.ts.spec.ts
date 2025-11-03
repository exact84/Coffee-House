import { TestBed } from '@angular/core/testing';

import { SliderServiceTs } from './slider.service.ts';

describe('SliderServiceTs', () => {
  let service: SliderServiceTs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SliderServiceTs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
