import { Routes } from "@angular/router";

import { DashboardComponent } from "../../pages/dashboard/dashboard.component";
import { IconsComponent } from "../../pages/icons/icons.component";
import { ColisJourComponent } from "../../pages/colis-jour/colis-jour.component";
import { UserProfileComponent } from "../../pages/user-profile/user-profile.component";
import { RechercheComponent } from "../../pages/recherche/recherche.component";
import { CarnetAdresseComponent } from "src/app/pages/carnet-adresse/carnet-adresse.component";
import { GestionColisComponent } from "src/app/pages/gestion-colis/gestion-colis.component";
import { FinanceComponent } from "src/app/pages/finance/finance.component";
import { RoleGuard } from "src/app/services/role.guard";
import { GestionFiliereComponent } from 'src/app/pages/gestion-filiere/gestion-filiere.component';
import { GestionPersonelComponent } from 'src/app/pages/gestion-personel/gestion-personel.component';



export const AdminLayoutRoutes: Routes = [
  { path: "dashboard", component: DashboardComponent },
  { path: "colis-jour", component: ColisJourComponent },
  { path: "user-profile", component: UserProfileComponent },
  { path: "recherche", component: RechercheComponent },
  { path: "recherche-av", component: RechercheComponent },
  { path: "recherche-av-sub", component: RechercheComponent },
  { path: "icons", component: IconsComponent },
  { path: "modifier-colis", component: ColisJourComponent },
  { path: "carnet-adresses", component: CarnetAdresseComponent },
  { path: "gestion-filiere", component: GestionFiliereComponent },
  { path: "gestion-personel", component: GestionPersonelComponent },
  { path: "modifier-personel", component: GestionPersonelComponent },

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
