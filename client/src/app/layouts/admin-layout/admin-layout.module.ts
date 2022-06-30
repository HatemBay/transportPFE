import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { ClipboardModule } from "ngx-clipboard";

import { AdminLayoutRoutes } from "./admin-layout.routing";
import { DashboardComponent } from "../../pages/dashboard/dashboard.component";
import { IconsComponent } from "../../pages/icons/icons.component";
import { NouveauColisComponent } from "../../pages/nouveau-colis/nouveau-colis.component";
import { UserProfileComponent } from "../../pages/user-profile/user-profile.component";
import { ListeColisComponent } from "../../pages/liste-colis/liste-colis.component";
import { NgbActiveModal, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { CarnetAdresseComponent } from "src/app/pages/carnet-adresse/carnet-adresse.component";
import { GestionColisComponent } from "src/app/pages/gestion-colis/gestion-colis.component";
import { FinanceComponent } from "src/app/pages/finance/finance.component";
import { ExcelComponent } from "src/app/pages/excel/excel.component";
import { DechargeComponent } from "../../pages/decharge/decharge.component";
import { FileExcelService } from "src/app/services/file-excel.service";

// import { ToastrModule } from 'ngx-toastr';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    HttpClientModule,
    NgbModule,
    ClipboardModule,
    ReactiveFormsModule,
    NgxDatatableModule,
  ],
  declarations: [
    DashboardComponent,
    UserProfileComponent,
    ListeColisComponent,
    IconsComponent,
    NouveauColisComponent,
    CarnetAdresseComponent,
    GestionColisComponent,
    FinanceComponent,
    ExcelComponent,
    DechargeComponent,
  ],
  providers: [NgbActiveModal, FileExcelService],
})
export class AdminLayoutModule {}
