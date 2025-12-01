import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectStateService } from '../../../services/project-state.service';
import { AiService, AiAnalysis } from '../../../services/ai.service';

@Component({
    selector: 'app-project-ai-analysis',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './ai-analysis.html',
    styleUrl: './ai-analysis.css'
})
export class ProjectAiAnalysisComponent implements OnInit {
    analyses: AiAnalysis[] = [];
    loading = false;

    constructor(
        private projectState: ProjectStateService,
        private aiService: AiService
    ) { }

    ngOnInit() {
        this.projectState.selectedProject$.subscribe(project => {
            if (project) {
                this.loadAnalysis(project.id);
            }
        });
    }

    loadAnalysis(projectId: number) {
        this.loading = true;
        this.aiService.getProjectAnalysis(projectId).subscribe({
            next: (data) => {
                this.analyses = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading AI analysis', err);
                this.loading = false;
            }
        });
    }
}
