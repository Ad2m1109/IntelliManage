import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface MenuItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent implements OnInit {
  menuItems: MenuItem[] = [];
  roleBasePath: string = '';

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.buildMenuByRole();
  }

  buildMenuByRole() {
    const userRole = this.authService.getUserRole();

    if (userRole === 'FOUNDER') {
      this.roleBasePath = '/founder';
      this.menuItems = [
        { label: 'Projects', route: `${this.roleBasePath}/projects`, icon: '📁' },
      ];
    } else if (userRole === 'EMPLOYEE') {
      this.roleBasePath = '/employee';
      this.menuItems = [
        { label: 'Invitations', route: `${this.roleBasePath}/invitations`, icon: '✉️' },
        { label: 'Projects', route: `${this.roleBasePath}/projects`, icon: '📁' },
      ];
    }
  }
}
