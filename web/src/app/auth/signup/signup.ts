import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { authStorage } from '../auth-storage';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class SignupComponent {
  private readonly apiUrl: string = '/api/auth/register';

  form = {
    name: '',
    email: '',
    password: '',
  };

  statusMessage = '';

  constructor(private readonly http: HttpClient) {}

  submit() {
    this.statusMessage = '';

    this.http.post<{ accessToken?: string }>(this.apiUrl, this.form).subscribe({
      next: (response) => {
        this.statusMessage = 'Account created successfully.';
        this.form = { name: '', email: '', password: '' };
        if (response?.accessToken) {
          authStorage.setToken(response.accessToken);
          window.location.assign('/tasks');
        }
      },
      error: () => {
        this.statusMessage = 'Failed to create account. Try again.';
      },
    });
  }
}
