import { TestBed } from '@angular/core/testing';
import { GroupService } from './group.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { Group } from '../models/group.model';
import { CreateGroup } from '../models/create-group.model';

describe('GroupService', () => {
  let service: GroupService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GroupService, AuthService],
    });
    service = TestBed.inject(GroupService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all groups', () => {
    const mockGroups: Group[] = [
      { _id: '1', name: 'Test Group 1', members: [], admins: [], channels: [], joinRequests: [] },
      { _id: '2', name: 'Test Group 2', members: [], admins: [], channels: [], joinRequests: [] }
    ];

    service.getAllGroups().subscribe(groups => {
      expect(groups.length).toBe(2);
      expect(groups).toEqual(mockGroups);
    });

    const req = httpMock.expectOne(service['apiUrl']);
    expect(req.request.method).toBe('GET');
    req.flush(mockGroups);
  });

  it('should get groups by user ID', () => {
    const userId = '123';
    const mockGroups: Group[] = [
      { _id: '1', name: 'Test Group 1', members: [userId], admins: [], channels: [], joinRequests: [] }
    ];

    service.getGroups(userId).subscribe(groups => {
      expect(groups.length).toBe(1);
      expect(groups).toEqual(mockGroups);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}?userId=${userId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockGroups);
  });

  it('should get a group by ID', () => {
    const groupId = '1';
    const mockGroup: Group = {
      _id: '1',
      name: 'Test Group 1',
      members: [],
      admins: [],
      channels: [],
      joinRequests: []
    };

    service.getGroupById(groupId).subscribe(group => {
      expect(group).toEqual(mockGroup);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/${groupId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockGroup);
  });

  it('should add a group', () => {
    const newGroup: CreateGroup = {
      name: 'New Group',
      admins: [],
      members: [],
      channels: [],
      joinRequests: []
    };

    const mockResponse: Group = { _id: '3', ...newGroup };

    service.addGroup(newGroup).subscribe(group => {
      expect(group).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(service['apiUrl']);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newGroup);
    req.flush(mockResponse);
  });

  it('should request to join a group', () => {
    const groupId = '1';
    const userId = '123';
    const mockResponse = { success: true };

    service.requestToJoinGroup(groupId, userId).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/${groupId}/request-join`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ userId });
    req.flush(mockResponse);
  });

  it('should approve a join request', () => {
    const groupId = '1';
    const userId = '123';
    const mockResponse = { success: true };

    service.approveRequest(groupId, userId).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/${groupId}/approve-join`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ userId });
    req.flush(mockResponse);
  });

  it('should reject a join request', () => {
    const groupId = '1';
    const userId = '123';
    const mockResponse = { success: true };

    service.rejectRequest(groupId, userId).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/${groupId}/reject-join`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ userId });
    req.flush(mockResponse);
  });

  it('should delete a group by ID', () => {
    const groupId = '1';
    const mockResponse = { success: true };

    service.deleteGroup(groupId).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/${groupId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });

  it('should remove a user from a group', () => {
    const groupId = '1';
    const userId = '123';
    const mockResponse = { success: true };

    service.removeUserFromGroup(groupId, userId).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/${groupId}/members/${userId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });

  it('should check if a user is a member of a group', () => {
    const groupId = '1';
    const userId = '123';
    const mockGroup: Group = {
      _id: groupId,
      name: 'Test Group 1',
      members: [userId],
      admins: [],
      channels: [],
      joinRequests: []
    };

    service.isMember(groupId, userId).subscribe(isMember => {
      expect(isMember).toBeTrue();
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/${groupId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockGroup);
  });

  it('should check if a user is an admin of a group', () => {
    const groupId = '1';
    const userId = '123';
    const mockGroup: Group = {
      _id: groupId,
      name: 'Test Group 1',
      members: [],
      admins: [userId],
      channels: [],
      joinRequests: []
    };

    service.isUserAdminOfGroup(groupId, userId).subscribe(isAdmin => {
      expect(isAdmin).toBeTrue();
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/${groupId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockGroup);
  });
});
