import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';  // Import UserService
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';  // To store error messages
  requestMessage: string = '';  // To store request messages

  constructor(
    private authService: AuthService,
    private userService: UserService,  // Inject UserService
    private router: Router
  ) {}

  // Method to handle login form submission
  onSubmit() {
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        const userData = JSON.stringify(response.user);
        localStorage.setItem('user', userData);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Login failed', error);
        this.errorMessage = 'Login failed. Please check your credentials and try again.';
      },
      complete: () => console.log('Login process completed'),
    });
  }

  // Method to handle user account request
  requestAccount() {
    this.userService.requestUserCreation().subscribe({
      next: (response) => {
        console.log('Account request successful', response);
        this.requestMessage = 'Account request has been sent to the SuperAdmin. Please wait for approval.';
      },
      error: (error) => {
        console.error('Account request failed', error);
        this.requestMessage = 'Failed to request account creation. Please try again later.';
      },
    });
  }
}
