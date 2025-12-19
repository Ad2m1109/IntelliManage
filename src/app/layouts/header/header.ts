import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model'; // Import User

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent implements OnInit {
  user: User | null;
  userRole: string = '';
  searchTerm: string = '';

  @Output() searchEvent = new EventEmitter<string>();

  constructor(private authService: AuthService) {
    this.user = this.authService.getCurrentUser();
  }

  ngOnInit() {
    this.userRole = this.authService.getUserRole() || '';
  }

  logout() {
    this.authService.logout();
  }

  onSearch() {
    this.searchEvent.emit(this.searchTerm);
  }
}
