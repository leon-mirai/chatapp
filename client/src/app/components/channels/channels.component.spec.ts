import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from '../../services/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ChannelsComponent } from './channels.component';

describe('ChannelsComponent', () => {
  let component: ChannelsComponent;
  let fixture: ComponentFixture<ChannelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ChannelsComponent,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [ChannelsComponent, AuthService]
    }).compileComponents();

    fixture = TestBed.createComponent(ChannelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
