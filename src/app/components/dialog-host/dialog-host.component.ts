import { Component, OnInit, OnDestroy, ViewChild, ViewContainerRef, ComponentRef, Type, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService, DialogData } from '../../services/dialog.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dialog-host',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog-host.component.html',
  styleUrl: './dialog-host.component.css'
})
export class DialogHostComponent implements OnInit, OnDestroy {
  @ViewChild('dialogContent', { read: ViewContainerRef }) dialogContentRef!: ViewContainerRef;

  showDialog = false;
  dialogData: DialogData | null = null;
  private dialogSubscription!: Subscription;
  private componentRef: ComponentRef<any> | null = null;

  constructor(
    private dialogService: DialogService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.dialogSubscription = this.dialogService.dialog$.subscribe(data => {
      if (data) {
        this.dialogData = data;
        this.showDialog = true;
        this.cdr.detectChanges(); // Ensure view is updated so dialogContentRef is available
        if (data.component) {
          this.loadDynamicComponent(data.component, data.componentData);
        }
      } else {
        this.closeDialog();
      }
    });
  }

  ngOnDestroy(): void {
    this.dialogSubscription.unsubscribe();
    this.clearDynamicComponent();
  }

  loadDynamicComponent(componentType: Type<any>, componentData: any): void {
    this.clearDynamicComponent();
    this.componentRef = this.dialogContentRef.createComponent(componentType);
    if (componentData) {
      Object.assign(this.componentRef.instance, componentData);
    }
    // Assuming custom dialog components will emit a 'close' event
    if (this.componentRef.instance.closeDialog) {
      this.componentRef.instance.closeDialog.subscribe((result: any) => {
        this.dialogService.close(result);
      });
    }
  }

  clearDynamicComponent(): void {
    if (this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = null;
    }
    if (this.dialogContentRef) {
      this.dialogContentRef.clear();
    }
  }

  closeDialog(): void {
    this.showDialog = false;
    this.dialogData = null;
    this.clearDynamicComponent();
    this.dialogService.close(); // Ensure service state is cleared
  }

  // For simple confirm/prompt dialogs without a custom component
  confirm(): void {
    this.dialogService.close(true);
  }

  cancel(): void {
    this.dialogService.close(false);
  }
}
