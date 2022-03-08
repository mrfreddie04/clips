import { Component, ContentChildren, AfterContentInit, QueryList } from '@angular/core';
import { TabComponent } from './../tab/tab.component';

@Component({
  selector: 'app-tabs-container',
  templateUrl: './tabs-container.component.html',
  styleUrls: ['./tabs-container.component.css']
})
export class TabsContainerComponent implements AfterContentInit {
  @ContentChildren(TabComponent) tabs: QueryList<TabComponent> = new QueryList<TabComponent>();
  //@ContentChildren(TabComponent) tabs?: QueryList<TabComponent>;

  constructor() { }

  ngAfterContentInit(): void {
    const activeTabs = this.tabs.filter(tab => tab.active);
    if(!activeTabs || activeTabs.length === 0)
      this.setActiveTab(this.tabs.first);
    else if(activeTabs.length > 0)  
      this.setActiveTab(activeTabs[0]);

    // if(!this.tabs.find( tab => tab.active) ) {
    //   this.tabs.first.active = true;
    // }
    // this.tabs.filter(tab => tab.active).slice(1).forEach( tab => tab.active = false);
  }

  // public setTab(e: MouseEvent, tab: TabComponent): void {
  //   e.preventDefault();
  //   this.setActiveTab(tab);
  // }

  public setActiveTab(activeTab: TabComponent): boolean {
    this.tabs.forEach( (tab) => {
      tab.active = false;
    });
    activeTab.active = true;
    return false;
  }
}
