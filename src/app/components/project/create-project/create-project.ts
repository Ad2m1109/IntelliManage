import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProjectService } from '../../../services/project.service';

@Component({
    selector: 'app-create-project',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './create-project.html',
    styleUrl: './create-project.css'
})
export class CreateProjectComponent {
    createForm: FormGroup;
    isLoading = false;
    error = '';

    constructor(
        private fb: FormBuilder,
        private projectService: ProjectService,
        public router: Router
    ) {
        this.createForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            description: ['', [Validators.required, Validators.minLength(10)]],
            priority: ['MEDIUM', Validators.required],
            startDate: [new Date().toISOString().split('T')[0], Validators.required]
        });
    }

    onSubmit() {
        if (this.createForm.valid) {
            this.isLoading = true;
            this.error = '';

            const payload = this.createForm.value;
            console.log('Creating project with payload:', payload);

            this.projectService.createProject(payload).subscribe({
                next: (response) => {
                    console.log('Project created successfully:', response);
                    // Only founders can create projects, so redirect to founder projects
                    this.router.navigate(['/founder/projects']);
                },
                error: (err) => {
                    console.error('Project creation failed:', err);
                    console.error('Error status:', err.status);
                    console.error('Error response:', err.error);
                    this.error = err.error?.message || 'Failed to create project. Please try again.';
                    this.isLoading = false;
                }
            });
        }
    }
}
