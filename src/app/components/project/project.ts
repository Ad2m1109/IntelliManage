import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './project.html',
  styleUrl: './project.css',
})
export class ProjectComponent implements OnInit {
  projects: any[] = [];
  roleBasePath: string = '';
  isFounder = false;

  constructor(
    private projectService: ProjectService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Determine role-based path
    const userRole = this.authService.getUserRole();
    this.roleBasePath = userRole === 'FOUNDER' ? '/founder' : '/employee';
    this.isFounder = userRole === 'FOUNDER';

    this.projectService.getProjects().subscribe(data => {
      this.projects = data;
    });
  }

  navigateToProject(projectId: number) {
    this.router.navigate([`${this.roleBasePath}/projects`, projectId, 'tasks']);
  }
}
