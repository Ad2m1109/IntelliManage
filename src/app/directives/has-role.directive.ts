import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Directive({
    selector: '[appHasRole]',
    standalone: true
})
export class HasRoleDirective implements OnInit {
    @Input() appHasRole: string | string[] = [];
    private isVisible = false;

    constructor(
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.updateView();
    }

    private updateView() {
        const userRole = this.authService.getUserRole();
        if (!userRole) {
            this.viewContainer.clear();
            return;
        }

        const allowedRoles = Array.isArray(this.appHasRole) ? this.appHasRole : [this.appHasRole];
        const shouldBeVisible = allowedRoles.includes(userRole);

        if (shouldBeVisible && !this.isVisible) {
            this.viewContainer.createEmbeddedView(this.templateRef);
            this.isVisible = true;
        } else if (!shouldBeVisible && this.isVisible) {
            this.viewContainer.clear();
            this.isVisible = false;
        }
    }
}
