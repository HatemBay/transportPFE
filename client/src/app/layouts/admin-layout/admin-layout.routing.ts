import { Routes } from "@angular/router";

import { DashboardComponent } from "../../pages/dashboard/dashboard.component";
import { IconsComponent } from "../../pages/icons/icons.component";
import { NouveauColisComponent } from "../../pages/nouveau-colis/nouveau-colis.component";
import { UserProfileComponent } from "../../pages/user-profile/user-profile.component";
import { ListeColisComponent } from "../../pages/liste-colis/liste-colis.component";
import { CarnetAdresseComponent } from "src/app/pages/carnet-adresse/carnet-adresse.component";
import { GestionColisComponent } from "src/app/pages/gestion-colis/gestion-colis.component";
import { FinanceComponent } from "src/app/pages/finance/finance.component";
import { ExcelComponent } from "src/app/pages/excel/excel.component";
import { DechargeComponent } from "src/app/pages/decharge/decharge.component";

export const AdminLayoutRoutes: Routes = [
  { path: "dashboard", component: DashboardComponent },
  { path: "user-profile", component: UserProfileComponent },
  { path: "liste-colis", component: ListeColisComponent },
  { path: "icons", component: IconsComponent },
  { path: "nouveau-colis", component: NouveauColisComponent },
  { path: "modifier-colis", component: NouveauColisComponent },
  { path: "details-colis", component: NouveauColisComponent },
  { path: "carnet-adresses", component: CarnetAdresseComponent },
  { path: "gestion-colis", component: GestionColisComponent },
  { path: "finance", component: FinanceComponent },
  { path: "finance-f-h", component: FinanceComponent },
  { path: "import-excel", component: ExcelComponent },
  { path: "decharge", component: DechargeComponent },
];
