import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class SignupComponent {
  private readonly apiUrl: string = 'api/auth/register';

  form = {
    name: '',
    email: '',
    password: '',
  };

  statusMessage = '';

  constructor(private readonly http: HttpClient) {}

  submit() {
    this.statusMessage = '';

    this.http.post(this.apiUrl, this.form).subscribe({
      next: () => {
        this.statusMessage = 'Account created successfully.';
        this.form = { name: '', email: '', password: '' };
      },
      error: () => {
        this.statusMessage = 'Failed to create account. Try again.';
      },
    });
  }
}
