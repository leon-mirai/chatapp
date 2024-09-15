import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service'; // Import AuthService
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  selectedFile: File | null = null;
  uploadSuccess: boolean = false;
  user: User | null = null; // Store the current user

  constructor(private authService: AuthService, private userService: UserService) {}

  ngOnInit(): void {
    // Retrieve the current user from AuthService
    this.user = this.authService.getUser();
    
    if (this.user) {
      console.log('User found in local storage:', this.user);
    } else {
      console.error('No user found in local storage');
    }
  }

  // Handle file selection
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      console.log('File selected:', this.selectedFile);
    }
  }

  onUpload(event: Event): void {
    event.preventDefault(); // Prevent the default form submission behavior
    console.log('Upload button clicked');

    if (!this.selectedFile || !this.user) {
      console.log('No file selected or user not set');
      return;
    }

    // Log file data for debugging
    console.log('Selected file:', this.selectedFile);

    // Call the upload service
    this.userService
      .uploadProfilePicture(this.user._id, this.selectedFile)
      .subscribe({
        next: (response: any) => {
          console.log('Upload successful:', response);
          this.uploadSuccess = true;
          if (this.user) {
            this.user.profilePic = response.filePath; // Update user's profile picture
          }
        },
        error: (err) => {
          console.error('Upload failed', err);
          this.uploadSuccess = false;
        },
      });
  }
}
