import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { ClipboardModule } from "ngx-clipboard";

import { AdminLayoutRoutes } from "./admin-layout.routing";
import { DashboardComponent } from "../../pages/dashboard/dashboard.component";
import { IconsComponent } from "../../pages/icons/icons.component";
import { ColisJourComponent } from "../../pages/colis-jour/colis-jour.component";
import { UserProfileComponent } from "../../pages/user-profile/user-profile.component";
import { RechercheComponent } from "../../pages/recherche/recherche.component";
import { NgbActiveModal, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { CarnetAdresseComponent } from "src/app/pages/carnet-adresse/carnet-adresse.component";
import { GestionColisComponent } from "src/app/pages/gestion-colis/gestion-colis.component";
import { FinanceComponent } from "src/app/pages/finance/finance.component";
import { CsvModule } from "@ctrl/ngx-csv";
import { GestionFiliereComponent } from "src/app/pages/gestion-filiere/gestion-filiere.component";
import { GestionPersonelComponent } from 'src/app/pages/gestion-personel/gestion-personel.component';


// import { NgxPrintModule } from 'ngx-print';

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
    CsvModule,
  ],
  declarations: [
    DashboardComponent,
    UserProfileComponent,
    RechercheComponent,
    IconsComponent,
    ColisJourComponent,
    CarnetAdresseComponent,
    GestionColisComponent,
    FinanceComponent,
    GestionFiliereComponent,
    GestionPersonelComponent,
  ],
  providers: [NgbActiveModal],
})
export class AdminLayoutModule {}
