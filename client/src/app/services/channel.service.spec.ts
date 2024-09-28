import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing'; 
import { ChannelService } from './channel.service';

describe('ChannelService', () => {
  let service: ChannelService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [ChannelService, AuthService]
    });
    service = TestBed.inject(ChannelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
