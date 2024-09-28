import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule], // Add RouterTestingModule to mock routing
      providers: [
        {
          provide: ActivatedRoute, // Mock ActivatedRoute
          useValue: {
            params: of({}), // Provide a mock observable for params
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'client' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('client');
  });

  // it('should render title', () => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   fixture.detectChanges(); // Trigger change detection to update the DOM

  //   const compiled = fixture.nativeElement as HTMLElement;
  //   const h1Element = compiled.querySelector('h1');

  //   expect(h1Element?.textContent).toContain('Hello, client');
  // });
});
