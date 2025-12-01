import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent {
  user: any;
  projects: any[] = [];
  isFounder = false;

  constructor(
    private authService: AuthService,
    private projectService: ProjectService
  ) { }

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    this.isFounder = this.authService.isFounder();
    this.loadProjects();
  }

  loadProjects() {
    this.projectService.getProjects().subscribe({
      next: (data) => {
        this.projects = data;
      },
      error: (err) => console.error('Error fetching projects', err)
    });
  }
}
