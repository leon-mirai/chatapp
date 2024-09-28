import { TestBed } from '@angular/core/testing';
import { AuthGuardService } from './auth-guard.service';
import { AuthService } from './auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('AuthGuardService', () => {
  let service: AuthGuardService;
  let authService: AuthService;
  let router: Router;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthGuardService, AuthService],
    });

    service = TestBed.inject(AuthGuardService);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);

    spyOn(router, 'navigate'); 
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should allow activation if the user is logged in', () => {
    spyOn(authService, 'isLoggedIn').and.returnValue(true); 

    const canActivateResult = service.canActivate();

    expect(canActivateResult).toBe(true); 
    expect(router.navigate).not.toHaveBeenCalled(); 
  });

  it('should prevent activation and navigate to "/" if the user is not logged in', () => {
    spyOn(authService, 'isLoggedIn').and.returnValue(false); 

    const canActivateResult = service.canActivate();

    expect(canActivateResult).toBe(false); 
    expect(router.navigate).toHaveBeenCalledWith(['/']); 
  });
});
