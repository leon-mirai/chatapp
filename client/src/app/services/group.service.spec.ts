import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing'; 
import { GroupService } from './group.service';

describe('GroupService', () => {
  let service: GroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [GroupService, AuthService]
    });
    service = TestBed.inject(GroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
