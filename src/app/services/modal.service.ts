import { Injectable } from '@angular/core';

interface IModal {
  id: string;
  visible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modals: IModal[] = [];

  constructor() { }

  public isModalOpen(id: string): boolean {
    return !!this.modals.find( m => m.id === id)?.visible;
  }

  public toggleModal(id: string): void {
    const modal = this.modals.find( m => m.id === id );
    if(modal) modal.visible = !modal.visible; 
  }

  public register(id: string) {
    this.modals.push({id, visible:false});
  }

  public unregister(id: string) {
    this.modals = this.modals.filter(modal => modal.id !== id);
  }  
}
