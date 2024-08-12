import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  constructor(private router: Router) {}
  displayUsername: string = '';
  displayBirthdate: string = '';
  displayAge: number = 0;
  displayEmail: string = '';
  displayPassword: string = '';
  displayValid: boolean = false;

  editUsername: string = '';
  editBirthdate: string = '';
  editAge: number = 0;
  editEmail: string = '';
  editPassword: string = '';
  editValid: boolean = false;

  ngOnInit(): void {
    const userString = sessionStorage.getItem('user');
    if (userString != null) {
      const user = JSON.parse(userString);
      // initialise display data with sesionstorage
      this.displayUsername = user.username;
      this.displayBirthdate = user.birthdate;
      this.displayAge = user.age;
      this.displayEmail = user.email;
      this.displayPassword = user.password;
      this.displayValid = user.valid;

      // initialise edit data
      this.editUsername = user.username;
      this.editBirthdate = user.birthdate;
      this.editAge = user.age;
      this.editEmail = user.email;
      this.editPassword = user.password;
      this.editValid = user.valid;
    } else {
      this.router.navigate(['/']);
    }
  }


  onSubmit() {
    // update display with edited data
    this.displayUsername = this.editUsername;
    this.displayBirthdate = this.editBirthdate;
    this.displayAge = this.editAge;
    this.displayEmail = this.editEmail;
    this.displayPassword = this.editPassword;
    this.displayValid = this.editValid;

    // Save updated data to sessionStorage
    const updatedUser = {
      username: this.displayUsername,
      birthdate: this.displayBirthdate,
      age: this.displayAge,
      email: this.displayEmail,
      password: this.displayPassword,
      valid: this.displayValid,
    };
    sessionStorage.setItem('user', JSON.stringify(updatedUser));
    alert('Profile updated successfully');
  }





  // username: string = '';
  // birthdate: string = '';
  // age: number = 0;
  // email: string = '';
  // password: string = '';
  // valid: boolean = false;

  // ngOnInit(): void {
  //   console.log('hi');

  //   const userString = sessionStorage.getItem('user');
  //   if (userString != null) {
  //     const user = JSON.parse(userString);
  //     this.username = user.username;
  //     this.birthdate = user.birthdate;
  //     this.age = user.age;
  //     this.email = user.email;
  //     this.password = user.password;
  //     this.valid = user.valid;
  //   } else {
  //     // window.location.href = 'login';
  //     this.router.navigate(['/'])
  //   }
  // }

  // onSubmit() {
  //   const updatedUser = {
  //     username: this.username,
  //     birthdate: this.birthdate,
  //     age: this.age,
  //     email: this.email,
  //     password: this.password,
  //     valid: this.valid,
  //   };
  //   sessionStorage.setItem('user', JSON.stringify(updatedUser));
  //   alert('Profile updated successfully');
  // }
  
}
