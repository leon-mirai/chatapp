import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing'; // To mock the router
import { Router } from '@angular/router';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule, // Provides HttpClient mock
        RouterTestingModule // Mocks the router for navigation in the service
      ],
      providers: [AuthService],
    }).compileComponents();

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify(); // Verifies that no outstanding HTTP calls are made
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send a login request', () => {
    const mockResponse = { token: 'abc123', user: { _id: '123', email: 'test@example.com' } };

    service.login('test@example.com', 'password123').subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/auth');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@example.com', password: 'password123' });
    req.flush(mockResponse); 
  });

  it('should return true when user is logged in', () => {
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify({ _id: '123', email: 'test@example.com' }));
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('should return false when user is not logged in', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('should logout the user and navigate to home', () => {
    const spyNavigate = spyOn(router, 'navigate');
    spyOn(localStorage, 'removeItem');
    
    service.logout();
    
    expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    expect(spyNavigate).toHaveBeenCalledWith(['/']);
  });

  it('should return the current user from localStorage', () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(mockUser));

    const user = service.getUser();
    expect(user?._id).toBe('123');
    expect(user?.email).toBe('test@example.com');
  });

  it('should return null if no user is in localStorage', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);

    const user = service.getUser();
    expect(user).toBeNull();
  });

  it('should correctly identify a SuperAdmin', () => {
    const mockUser = { roles: ['SuperAdmin'] };
    service['currentUser'] = mockUser as any;
    expect(service.isSuperAdmin()).toBeTrue();
  });

  it('should correctly identify a GroupAdmin', () => {
    const mockUser = { roles: ['GroupAdmin'] };
    service['currentUser'] = mockUser as any;
    expect(service.isGroupAdmin()).toBeTrue();
  });

  it('should correctly identify a ChatUser', () => {
    const mockUser = { roles: ['ChatUser'] };
    service['currentUser'] = mockUser as any;
    expect(service.isChatUser()).toBeTrue();
  });
});
