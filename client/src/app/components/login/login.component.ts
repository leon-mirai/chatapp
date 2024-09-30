import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  trigger,
  state,
  style,
  transition,
  animate,
  keyframes,
} from '@angular/animations';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [
    // fade in 
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate(
          '1500ms ease-in-out',
          style({ opacity: 1, transform: 'scale(1)' })
        ),
      ]),
    ]),
    // shaking
    trigger('shake', [
      transition(':enter', []),
      transition('* => *', [
        animate(
          '1000ms ease-in-out',
          keyframes([
            style({ transform: 'translateX(0)', offset: 0 }),
            style({ transform: 'translateX(-20px)', offset: 0.1 }),
            style({ transform: 'translateX(20px)', offset: 0.2 }),
            style({ transform: 'translateX(-15px)', offset: 0.3 }),
            style({ transform: 'translateX(15px)', offset: 0.4 }),
            style({ transform: 'translateX(-10px)', offset: 0.5 }),
            style({ transform: 'translateX(10px)', offset: 0.6 }),
            style({ transform: 'translateX(-5px)', offset: 0.7 }),
            style({ transform: 'translateX(5px)', offset: 0.8 }),
            style({ transform: 'translateX(0)', offset: 1 }),
          ])
        ),
      ]),
    ]),
    // slide-In 
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(50%)', opacity: 0 }),
        animate(
          '1200ms cubic-bezier(0.25, 0.8, 0.25, 1)',
          style({ transform: 'translateY(0)', opacity: 1 })
        ),
      ]),
    ]),
  ],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  requestMessage: string = '';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  onSubmit() {
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        const userData = JSON.stringify(response.user);
        localStorage.setItem('user', userData);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Invalid email or password.', error);
        this.errorMessage = 'Invalid email or password';
        // the shake animation will trigger when errorMessage changes
      },
      complete: () => console.log('Login process completed'),
    });
  }

  requestAccount() {
    this.userService.requestUserCreation().subscribe({
      next: (response) => {
        console.log('Account request successful', response);
        this.requestMessage =
          'Account request has been sent to the SuperAdmin. Please wait for approval.';
      },
      error: (error) => {
        console.error('Account request failed', error);
        this.requestMessage =
          'Failed to request account creation. Please try again later.';
      },
    });
  }
}
