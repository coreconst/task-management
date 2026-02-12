import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { authStorage } from '../auth-storage';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  private readonly apiUrl = '/api/auth/login';

  form = {
    email: '',
    password: '',
  };

  statusMessage = '';
  statusTone: 'success' | 'error' | '' = '';

  constructor(private readonly http: HttpClient) {}

  submit() {
    this.statusMessage = '';
    this.statusTone = '';

    this.http.post<{ accessToken?: string }>(this.apiUrl, this.form).subscribe({
      next: (response) => {
        this.statusMessage = 'Logged in successfully.';
        this.statusTone = 'success';
        this.form = { email: '', password: '' };
        if (response?.accessToken) {
          authStorage.setToken(response.accessToken);
          window.location.assign('/tasks');
        }
      },
      error: (err) => {
        this.statusMessage = typeof err?.error?.message === 'string'
          ? err.error.message
          : 'Failed to log in. Check your credentials.';
        this.statusTone = 'error';
      },
    });
  }
}
