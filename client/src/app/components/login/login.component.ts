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
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms ease-in', style({ opacity: 1 })),
      ]),
    ]),
    trigger('shake', [
      transition(':enter', []), // No animation on enter
      transition('* => *', [
        animate('500ms', keyframes([
          style({ transform: 'translateX(0)' }),
          style({ transform: 'translateX(-10px)' }),
          style({ transform: 'translateX(10px)' }),
          style({ transform: 'translateX(-10px)' }),
          style({ transform: 'translateX(10px)' }),
          style({ transform: 'translateX(0)' }),
        ])),
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
        // The shake animation will trigger when errorMessage changes
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
