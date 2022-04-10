import { Routes } from "@angular/router";

import { DashboardComponent } from "../../pages/dashboard/dashboard.component";
import { IconsComponent } from "../../pages/icons/icons.component";
import { ColisJourComponent } from "../../pages/colis-jour/colis-jour.component";
import { UserProfileComponent } from "../../pages/user-profile/user-profile.component";
import { TablesComponent } from "../../pages/tables/tables.component";
import { CarnetAdresseComponent } from "src/app/pages/carnet-adresse/carnet-adresse.component";
import { GestionColisComponent } from "src/app/pages/gestion-colis/gestion-colis.component";
import { FinanceComponent } from "src/app/pages/finance/finance.component";
import { ImprimerComponent } from "src/app/pages/imprimer/imprimer.component";
import { RoleGuard } from "src/app/services/role.guard";

export const AdminLayoutRoutes: Routes = [
  { path: "dashboard", component: DashboardComponent },
  { path: "colis-jour", component: ColisJourComponent },
  { path: "user-profile", component: UserProfileComponent },
  { path: "tables", component: TablesComponent },
  { path: "icons", component: IconsComponent },
  { path: "modifier-colis", component: ColisJourComponent },
  { path: "carnet-adresses", component: CarnetAdresseComponent },
  {
    path: "gestion-colis",
    component: GestionColisComponent,
    canActivate: [RoleGuard],
    data: {
      expectedRoles: ['admin']
    }
  },
  { path: "finance", component: FinanceComponent },
  { path: "finance-f-h", component: FinanceComponent },
];
