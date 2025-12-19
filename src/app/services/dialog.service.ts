import { Injectable, Type } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface DialogData {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  // For custom components
  component?: Type<any>;
  componentData?: any;
}

export interface DialogRef {
  close: (result?: any) => void;
  afterClosed: Observable<any>;
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private dialogSubject = new BehaviorSubject<DialogData | null>(null);
  public dialog$ = this.dialogSubject.asObservable();

  private currentDialogRef: { closeSubject: BehaviorSubject<any> } | null = null;

  constructor() { }

  open(data: DialogData): DialogRef {
    const closeSubject = new BehaviorSubject<any>(undefined);
    this.currentDialogRef = { closeSubject };

    this.dialogSubject.next(data);

    return {
      close: (result?: any) => this.close(result),
      afterClosed: closeSubject.asObservable()
    };
  }

  close(result?: any) {
    if (this.currentDialogRef) {
      this.currentDialogRef.closeSubject.next(result);
      this.currentDialogRef.closeSubject.complete();
      this.currentDialogRef = null;
    }
    this.dialogSubject.next(null);
  }
}
