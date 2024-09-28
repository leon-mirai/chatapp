import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupsComponent } from './groups.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { GroupService } from '../../services/group.service'; // Adjust path as needed
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('GroupsComponent', () => {
  let component: GroupsComponent;
  let fixture: ComponentFixture<GroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupsComponent, HttpClientTestingModule], // Add HttpClientTestingModule
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}), // Mock the params observable
          },
        },
        GroupService, // Include GroupService
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
