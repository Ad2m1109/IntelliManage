import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { Project } from '../../models/project.model';
import { SearchService } from '../../services/search.service'; // Import SearchService
import { Subscription } from 'rxjs'; // Import Subscription

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './project.html',
  styleUrl: './project.css',
})
export class ProjectComponent implements OnInit, OnDestroy { // Implement OnDestroy
  allProjects: Project[] = []; // Store all projects
  filteredProjects: Project[] = []; // Store filtered projects
  roleBasePath: string = '';
  isFounder = false;
  isLoading = false;
  private searchSubscription: Subscription = new Subscription(); // To manage subscription

  constructor(
    private projectService: ProjectService,
    private authService: AuthService,
    private router: Router,
    private searchService: SearchService // Inject SearchService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    const userRole = this.authService.getUserRole();
    this.roleBasePath = userRole === 'FOUNDER' ? '/founder' : '/employee';
    this.isFounder = userRole === 'FOUNDER';

    this.projectService.getProjects().subscribe({
      next: (data) => {
        this.allProjects = data;
        this.filteredProjects = data; // Initialize filtered projects with all projects
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load projects', err);
        this.isLoading = false;
      }
    });

    // Subscribe to search term changes
    this.searchSubscription = this.searchService.searchTerm$.subscribe(term => {
      this.filterProjects(term);
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe(); // Unsubscribe to prevent memory leaks
  }

  filterProjects(searchTerm: string): void {
    if (!searchTerm) {
      this.filteredProjects = this.allProjects; // If no search term, show all projects
      return;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    this.filteredProjects = this.allProjects.filter(project =>
      project.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      project.description.toLowerCase().includes(lowerCaseSearchTerm)
      // Add more fields to search if needed
    );
  }

  navigateToProject(projectId: number) {
    this.router.navigate([`${this.roleBasePath}/projects`, projectId, 'dashboard']);
  }
}