import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { GroupService } from '../../services/group.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // Import to support HttpClient in services

// Mock Router
class MockRouter {
  navigate() {}
}

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // Provide HttpClientTestingModule to mock HttpClient
      providers: [
        GroupService,  // Provide GroupService
        AuthService,   // Provide AuthService
        UserService,   // Provide UserService
        { provide: Router, useClass: MockRouter }, // Mock router
        provideHttpClientTesting() // Provide the new method for HttpClientTesting
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
