import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { GroupService } from '../../services/group.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Group } from '../../models/group.model';

class MockRouter {
  navigate() {}
}

class MockGroupService {
  getGroups(userId: string) {
    return of([
      { _id: '1', name: 'Test Group', members: [userId], admins: [userId] },
    ]);
  }

  getAllGroups() {
    return of([{ _id: '2', name: 'Available Group', members: [] }]); // Mock available group data
  }

  addGroup(group: Group) {
    return of(group);
  }

  deleteGroup(groupId: string) {
    return of({});
  }

  requestToJoinGroup(groupId: string, userId: string) {
    return of({});
  }
}

class MockUserService {
  getUsers() {
    return of([{ _id: '1', username: 'Test User', valid: true }]); // Mock user data
  }

  deleteUser(userId: string) {
    return of({});
  }

  leaveGroup(userId: string, groupId: string) {
    return of({});
  }

  completeRegistration(userId: string, username: string, email: string) {
    return of({});
  }

  promoteUser(userId: string, newRole: string) {
    return of({ message: 'User promoted' });
  }
}

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let groupService: GroupService;
  let authService: AuthService;
  let userService: UserService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, DashboardComponent],
      providers: [
        { provide: GroupService, useClass: MockGroupService },
        { provide: UserService, useClass: MockUserService },
        { provide: Router, useClass: MockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    groupService = TestBed.inject(GroupService);
    authService = TestBed.inject(AuthService);
    userService = TestBed.inject(UserService);
    router = TestBed.inject(Router);
  });

  it('should create the dashboard component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should promote a user', () => {
    spyOn(userService, 'promoteUser').and.callThrough();
    component.promotionUserId = '1';
    component.promotionRole = 'SuperAdmin';
    component.promoteUser();
    expect(userService.promoteUser).toHaveBeenCalledWith('1', 'SuperAdmin');
  });
});
