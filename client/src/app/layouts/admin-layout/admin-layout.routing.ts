import { Routes } from "@angular/router";

import { DashboardComponent } from "../../pages/dashboard/dashboard.component";
import { IconsComponent } from "../../pages/icons/icons.component";
import { MapsComponent } from "../../pages/maps/maps.component";
import { UserProfileComponent } from "../../pages/user-profile/user-profile.component";
import { TablesComponent } from "../../pages/tables/tables.component";
import { CarnetAdresseComponent } from "src/app/pages/carnet-adresse/carnet-adresse.component";
import { GestionColisComponent } from "src/app/pages/gestion-colis/gestion-colis.component";
import { FinanceComponent } from "src/app/pages/finance/finance.component";
import { ImprimerComponent } from "src/app/pages/imprimer/imprimer.component";

export const AdminLayoutRoutes: Routes = [
  { path: "dashboard", component: DashboardComponent },
  { path: "user-profile", component: UserProfileComponent },
  { path: "tables", component: TablesComponent },
  { path: "icons", component: IconsComponent },
  { path: "nouveau-colis", component: MapsComponent },
  { path: "modifier-colis", component: MapsComponent },
  { path: "details-colis", component: MapsComponent },
  { path: "carnet-adresses", component: CarnetAdresseComponent },
  { path: "gestion-colis", component: GestionColisComponent },
  { path: "finance", component: FinanceComponent },
  { path: "finance-f-h", component: FinanceComponent },
];
