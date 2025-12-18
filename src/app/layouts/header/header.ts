import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule], // Add FormsModule here
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent implements OnInit {
  user: any;
  userRole: string = '';
  searchTerm: string = ''; // Property to hold the search input value

  @Output() searchEvent = new EventEmitter<string>(); // Event emitter for search term

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
    this.searchEvent.emit(this.searchTerm); // Emit the current search term
  }
}
