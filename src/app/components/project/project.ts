import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './project.html',
  styleUrl: './project.css',
})
export class ProjectComponent implements OnInit {
  projects: Project[] = [];
  roleBasePath: string = '';
  isFounder = false;
  isLoading = false;

  constructor(
    private projectService: ProjectService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    const userRole = this.authService.getUserRole();
    this.roleBasePath = userRole === 'FOUNDER' ? '/founder' : '/employee';
    this.isFounder = userRole === 'FOUNDER';

    this.projectService.getProjects().subscribe({
      next: (data) => {
        this.projects = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load projects', err);
        this.isLoading = false;
      }
    });
  }

  navigateToProject(projectId: number) {
    this.router.navigate([`${this.roleBasePath}/projects`, projectId, 'dashboard']);
  }
}