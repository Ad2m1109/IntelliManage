import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Project } from '../models/project.model';

@Injectable({
    providedIn: 'root'
})
export class ProjectStateService {
    private selectedProjectSubject = new BehaviorSubject<Project | null>(null);
    selectedProject$ = this.selectedProjectSubject.asObservable();

    constructor() { }

    setSelectedProject(project: Project) {
        this.selectedProjectSubject.next(project);
    }

    clearSelectedProject() {
        this.selectedProjectSubject.next(null);
    }

    getCurrentProject(): Project | null {
        return this.selectedProjectSubject.value;
    }
}
