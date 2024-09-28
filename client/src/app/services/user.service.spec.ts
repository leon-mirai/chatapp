import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { AuthService } from './auth.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { User } from '../models/user.model';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [UserService, AuthService],
    }).compileComponents();
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return a null if no user ID is set', () => {
    expect(service.getCurrentUserId()).toBeNull();
  });

  it("should return the current user's ID when set", () => {
    (service as any).currentUserId = '1234';

    expect(service.getCurrentUserId()).toBe('1234');
  });

  it("should send a POST request to upload the user's profile picture", () => {
    const userId = '1234';
    const mockFile = new File(['dummy content'], 'profile-pic.png', {
      type: 'image/png',
    });

    service.uploadProfilePicture(userId, mockFile).subscribe();

    const req = httpMock.expectOne(
      `${service['apiUrl']}/${userId}/upload-profile-pic`
    );
    expect(req.request.method).toBe('POST');

    const formData = req.request.body as FormData;
    expect(formData.has('profilePic')).toBeTruthy();
    expect(formData.get('profilePic')).toEqual(mockFile);

    req.flush({});
  });

  it('should upload an image and return the image URL', () => {
    const mockImageData = new FormData();
    const mockResponse = { imageUrl: 'http://mock-url.com/image.png' };

    service.uploadImage(mockImageData).subscribe((response) => {
      expect(response.imageUrl).toBe(mockResponse.imageUrl);
    });

    const req = httpMock.expectOne('/api/upload-chat-image');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockImageData);

    req.flush(mockResponse); // Simulate response
  });

  it('should fetch all users from the backend', () => {
    const mockUsers: User[] = [
      {
        _id: '1',
        username: 'User1',
        email: 'user1@test.com',
        roles: ['ChatUser'],
        groups: [],
        password: '',
        valid: true,
      },
      {
        _id: '2',
        username: 'User2',
        email: 'user2@test.com',
        roles: ['ChatUser'],
        groups: [],
        password: '',
        valid: true,
      },
    ];

    service.getUsers().subscribe((users) => {
      expect(users.length).toBe(2);
      expect(users).toEqual(mockUsers);
    });

    const req = httpMock.expectOne(service['apiUrl']);
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });

  it('should fetch a specific user by ID from the backend', () => {
    const mockUser: User = {
      _id: '1',
      username: 'User1',
      email: 'user1@test.com',
      roles: ['ChatUser'],
      groups: [],
      password: '',
      valid: true,
    };

    service.getUserById('1').subscribe((user) => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });

  it('should request user creation by posting user data', () => {
    const mockResponse = { success: true };

    spyOn(service as any, 'generateId').and.returnValue('ABCD');

    service.requestUserCreation().subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(service['apiUrl']);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      id: 'ABCD',
      username: '',
      email: '',
      roles: ['ChatUser'],
      groups: [],
      password: '123',
      valid: false,
    });
    req.flush(mockResponse);
  });

  it('should complete user registration with updated details', () => {
    const mockResponse = { success: true };

    service
      .completeRegistration('1', 'UpdatedUser', 'updateduser@test.com')
      .subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

    const req = httpMock.expectOne(
      `${service['apiUrl']}/1/complete-registration`
    );
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({
      username: 'UpdatedUser',
      email: 'updateduser@test.com',
      valid: true,
    });
    req.flush(mockResponse);
  });

  it('should update a user with given details', () => {
    const mockUser: User = {
      _id: '1',
      username: 'User1',
      email: 'user1@test.com',
      roles: ['ChatUser'],
      groups: [],
      password: '',
      valid: true,
    };
    const mockResponse = { success: true };

    service.updateUser(mockUser).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockUser);
    req.flush(mockResponse);
  });

  it('should self-delete user by ID', () => {
    const mockResponse = { success: true };

    service.selfDelete('1').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });

  it('should delete a user by SuperAdmin', () => {
    const mockResponse = { success: true };

    service.deleteUser('1').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`/api/users/1/delete-user`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });

  it('should allow user to leave a group', () => {
    const mockResponse = { success: true };
  
    service.leaveGroup('1', '101').subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
  
    const req = httpMock.expectOne(`${service['apiUrl']}/1/groups/101/leave`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
  
  it('should promote a user to a new role', () => {
    const mockResponse = { success: true };
  
    service.promoteUser('1', 'GroupAdmin').subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
  
    const req = httpMock.expectOne(`${service['apiUrl']}/1/promote`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ newRole: 'GroupAdmin' });
    req.flush(mockResponse);
  });
  
});
