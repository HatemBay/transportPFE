import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { SharedRoutingModule } from "./shared-routing.module";
import { SharedComponent } from "./components/shared/shared.component";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { DatatableComponent } from './components/datatable/datatable.component';

@NgModule({
  declarations: [SharedComponent, DatatableComponent],
  imports: [CommonModule, SharedRoutingModule, NgxDatatableModule],
  exports: [SharedComponent],
})
export class SharedModule {}
