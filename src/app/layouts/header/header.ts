import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent implements OnInit {
  user: any;
  userRole: string = '';

  constructor(private authService: AuthService) {
    this.user = this.authService.getCurrentUser();
  }

  ngOnInit() {
    this.userRole = this.authService.getUserRole() || '';
  }

  logout() {
    this.authService.logout();
  }
}
