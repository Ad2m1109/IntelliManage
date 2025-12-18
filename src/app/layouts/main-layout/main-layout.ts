import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header';
import { SidebarComponent } from '../sidebar/sidebar';
import { AuthService } from '../../services/auth.service';
import { SearchService } from '../../services/search.service'; // Import SearchService

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayoutComponent implements OnInit {
  userRole: string = '';

  constructor(
    private authService: AuthService,
    private searchService: SearchService // Inject SearchService
  ) { }

  ngOnInit() {
    this.userRole = this.authService.getUserRole() || '';
  }

  handleSearch(searchTerm: string) {
    this.searchService.setSearchTerm(searchTerm); // Update the search term in the service
  }
}
