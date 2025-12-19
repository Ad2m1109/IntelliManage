import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectStateService } from '../../../services/project-state.service';
import { Project } from '../../../models/project.model';
import { Sprint } from '../../../models/sprint.model'; // Import Sprint
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { ProjectService } from '../../../services/project.service';

interface DashboardStats {
    overallProgress: number;
    activeSprint: Sprint | null;
    taskDistribution: { [key: string]: number };
    blockedTasks: number;
    overdueTasks: number;
}

@Component({
    selector: 'app-project-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.css'
})
export class ProjectDashboardComponent implements OnInit, OnDestroy {
    project: Project | null = null;
    userRole: string = '';
    stats: DashboardStats = {
        overallProgress: 0,
        activeSprint: null,
        taskDistribution: {},
        blockedTasks: 0,
        overdueTasks: 0
    };
    loading = true;
    private projectSub: Subscription | null = null;

    constructor(
        private projectState: ProjectStateService,
        private authService: AuthService,
        private projectService: ProjectService
    ) { }

    ngOnInit() {
        this.userRole = this.authService.getUserRole() || '';
        this.projectSub = this.projectState.selectedProject$.subscribe(project => {
            if (project) {
                this.project = project;
                this.loadDashboardData();
            }
        });
    }

    loadDashboardData() {
        if (!this.project) return;

        this.loading = true;
        this.projectService.getDashboardData(this.project.id).subscribe({
            next: (data) => {
                this.stats = data;
                this.loading = false;
            },
            error: (err) => {
                /* Handle error */ // Consider a notification service
                this.loading = false;
            }
        });
    }

    ngOnDestroy() {
        if (this.projectSub) {
            this.projectSub.unsubscribe();
        }
    }

    getTaskDistributionKeys() {
        return Object.keys(this.stats.taskDistribution);
    }
}
