import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProjectStateService } from '../../services/project-state.service';
import { Project } from '../../models/project.model';
import { Subscription } from 'rxjs';

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
  selectedProject: Project | null = null;
  private projectSub: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private projectState: ProjectStateService
  ) { }

  ngOnInit() {
    this.projectSub = this.projectState.selectedProject$.subscribe(project => {
      this.selectedProject = project;
      this.buildMenu();
    });
  }

  buildMenu() {
    const userRole = this.authService.getUserRole();
    this.roleBasePath = userRole === 'FOUNDER' ? '/founder' : '/employee';

    if (this.selectedProject) {
      this.menuItems = [
        { label: 'Dashboard', route: `${this.roleBasePath}/projects/${this.selectedProject.id}/dashboard`, icon: '📊' },
        { label: 'Tasks', route: `${this.roleBasePath}/projects/${this.selectedProject.id}/tasks`, icon: '📋' },
        { label: 'Sprints', route: `${this.roleBasePath}/projects/${this.selectedProject.id}/sprints`, icon: '🏃' },
        { label: 'Members', route: `${this.roleBasePath}/projects/${this.selectedProject.id}/members`, icon: '👥' },
        { label: 'AI Analyst', route: `${this.roleBasePath}/projects/${this.selectedProject.id}/ai-analyst`, icon: '🤖' },
        { label: 'Back to Projects', route: `${this.roleBasePath}/projects`, icon: '⬅️' },
      ];
    } else {
      if (userRole === 'FOUNDER') {
        this.menuItems = [
          { label: 'Projects', route: `${this.roleBasePath}/projects`, icon: '📁' },
        ];
      } else if (userRole === 'EMPLOYEE') {
        this.menuItems = [
          { label: 'Invitations', route: `${this.roleBasePath}/invitations`, icon: '✉️' },
          { label: 'Projects', route: `${this.roleBasePath}/projects`, icon: '📁' },
        ];
      }
    }
  }

  ngOnDestroy() {
    if (this.projectSub) {
      this.projectSub.unsubscribe();
    }
  }
}
