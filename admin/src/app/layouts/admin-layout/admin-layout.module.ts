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
import { GestionClientComponent } from '../../pages/gestion-client/gestion-client.component';
import { GestionVehiculeComponent } from '../../pages/gestion-vehicule/gestion-vehicule.component';
import { GestionVilleComponent } from '../../pages/gestion-ville/gestion-ville.component';
import { GestionDelegationComponent } from '../../pages/gestion-delegation/gestion-delegation.component';
import { CbPickupsComponent } from '../../pages/cb-pickups/cb-pickups.component';
import { CbRamassageComponent } from '../../pages/cb-ramassage/cb-ramassage.component';
import { CbCollecteComponent } from '../../pages/cb-collecte/cb-collecte.component';
import { CbFeuilleRouteComponent } from '../../pages/cb-feuille-route/cb-feuille-route.component';
import { CbFeuilleRetourComponent } from '../../pages/cb-feuille-retour/cb-feuille-retour.component';
import { NgxBarcodeModule } from "ngx-barcode";
import { CbDebriefComponent } from '../../pages/cb-debrief/cb-debrief.component';
import { ModifierColisComponent } from '../../pages/modifier-colis/modifier-colis.component';


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
    NgxBarcodeModule,
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
    GestionClientComponent,
    GestionVehiculeComponent,
    GestionVilleComponent,
    GestionDelegationComponent,
    CbPickupsComponent,
    CbRamassageComponent,
    CbCollecteComponent,
    CbFeuilleRouteComponent,
    CbFeuilleRetourComponent,
    CbDebriefComponent,
    ModifierColisComponent,
  ],
  providers: [NgbActiveModal],
})
export class AdminLayoutModule {}
