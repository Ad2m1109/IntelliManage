import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ProjectStateService } from '../../../services/project-state.service';
import { Project } from '../../../models/project.model';
import { Sprint } from '../../../models/sprint.model';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { ProjectService } from '../../../services/project.service';

interface DashboardStats {
    overallProgress: number;
    activeSprint: Sprint | null;
    taskDistribution: { [key: string]: number };
    blockedTasks: number;
    overdueTasks: number;
    allSprints: Sprint[];
}

@Component({
    selector: 'app-project-dashboard',
    standalone: true,
    imports: [CommonModule, DatePipe], // Add DatePipe to imports
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
        overdueTasks: 0,
        allSprints: []
    };
    loading = true;
    private projectSub: Subscription | null = null;

    // Timeline properties
    minDate: Date = new Date();
    maxDate: Date = new Date();
    timelineWidthDays: number = 1;
    timelineContainerWidthPx: number = 800; // Placeholder: adjust based on actual CSS container width

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
                this.calculateTimelineDates(); // Calculate min/max dates for timeline
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading dashboard data', err);
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

    private calculateTimelineDates(): void {
        if (!this.stats.allSprints || this.stats.allSprints.length === 0) {
            this.minDate = new Date();
            this.maxDate = new Date();
            this.timelineWidthDays = 1;
            return;
        }

        // Find the earliest start date and latest end date among all sprints
        let min = new Date(this.stats.allSprints[0].startDate!);
        let max = new Date(this.stats.allSprints[0].endDate!);

        this.stats.allSprints.forEach(sprint => {
            const start = new Date(sprint.startDate!);
            const end = new Date(sprint.endDate!);

            if (start.getTime() < min.getTime()) {
                min = start;
            }
            if (end.getTime() > max.getTime()) {
                max = end;
            }
        });

        this.minDate = min;
        this.maxDate = max;
        this.timelineWidthDays = (this.maxDate.getTime() - this.minDate.getTime()) / (1000 * 60 * 60 * 24) + 1; // +1 to include both start and end day
    }

    getSprintPosition(sprint: Sprint): string {
        const sprintStartDate = new Date(sprint.startDate!);
        const daysFromMin = (sprintStartDate.getTime() - this.minDate.getTime()) / (1000 * 60 * 60 * 24);
        const position = (daysFromMin / this.timelineWidthDays) * 100;
        return `${position}%`;
    }

    getSprintWidth(sprint: Sprint): string {
        const sprintStartDate = new Date(sprint.startDate!);
        const sprintEndDate = new Date(sprint.endDate!);
        const sprintDurationDays = (sprintEndDate.getTime() - sprintStartDate.getTime()) / (1000 * 60 * 60 * 24) + 1;
        const width = (sprintDurationDays / this.timelineWidthDays) * 100;
        return `${width}%`;
    }

    getCurrentDatePosition(): string {
        const now = new Date();
        const daysFromMin = (now.getTime() - this.minDate.getTime()) / (1000 * 60 * 60 * 24);
        const position = (daysFromMin / this.timelineWidthDays) * 100;
        return `${position}%`;
    }
}
