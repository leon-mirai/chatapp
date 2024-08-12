import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        const userData = JSON.stringify(response.user)
        sessionStorage.setItem("user", userData)
        this.router.navigate(['/dashboard']);
      },
      error: (error) => console.error('Login failed', error),
      complete: () => console.log('Login process completed'),
    });
    // this.authService.login(this.email, this.password).subscribe(
    //   response=>{
    //     console.log("Login successful", response);
    //   },
    //   error => {
    //     console.error('Login failed', error);
    //   }
    // )
  }
}
