import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LoginComponent } from './login.component';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';

class MockAuthService {
  login(email: string, password: string) {
    if (email === 'test@example.com' && password === 'password123') {
      return of({ user: { email: 'test@example.com', roles: ['User'] } });
    } else {
      return throwError({ message: 'Invalid email or password' });
    }
  }
}

class MockUserService {
  requestUserCreation() {
    return of({ message: 'Request submitted' });
  }
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;
  let userService: UserService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: UserService, useClass: MockUserService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    userService = TestBed.inject(UserService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should login successfully with valid credentials', () => {
    spyOn(authService, 'login').and.callThrough();
    spyOn(router, 'navigate');

    component.email = 'test@example.com';
    component.password = 'password123';
    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(localStorage.getItem('user')).toContain('test@example.com');
  });

  it('should show error message with invalid credentials', () => {
    spyOn(authService, 'login').and.callThrough();

    component.email = 'wrong@example.com';
    component.password = 'wrongpassword';
    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith('wrong@example.com', 'wrongpassword');
    expect(component.errorMessage).toBe('Invalid email or password');
  });

  it('should request account creation successfully', () => {
    spyOn(userService, 'requestUserCreation').and.callThrough();

    component.requestAccount();

    expect(userService.requestUserCreation).toHaveBeenCalled();
    expect(component.requestMessage).toBe(
      'account request has been sent to the SuperAdmin. Please wait for approval.'
    );
  });

  it('should show error message when account creation fails', () => {
    spyOn(userService, 'requestUserCreation').and.returnValue(throwError({ message: 'Failed' }));

    component.requestAccount();

    expect(userService.requestUserCreation).toHaveBeenCalled();
    expect(component.requestMessage).toBe(
      'failed to request account creation. Please try again later.'
    );
  });
});
