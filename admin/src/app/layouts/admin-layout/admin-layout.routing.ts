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
import { GestionFiliereComponent } from "src/app/pages/gestion-filiere/gestion-filiere.component";
import { GestionPersonelComponent } from "src/app/pages/gestion-personel/gestion-personel.component";
import { GestionClientComponent } from "src/app/pages/gestion-client/gestion-client.component";
import { GestionVehiculeComponent } from "src/app/pages/gestion-vehicule/gestion-vehicule.component";
import { GestionDelegationComponent } from "src/app/pages/gestion-delegation/gestion-delegation.component";
import { GestionVilleComponent } from "src/app/pages/gestion-ville/gestion-ville.component";
import { CbPickupsComponent } from "src/app/pages/cb-pickups/cb-pickups.component";
import { CbRamassageComponent } from "src/app/pages/cb-ramassage/cb-ramassage.component";
import { CbCollecteComponent } from "src/app/pages/cb-collecte/cb-collecte.component";
import { CbFeuilleRouteComponent } from "src/app/pages/cb-feuille-route/cb-feuille-route.component";
import { CbFeuilleRetourComponent } from "src/app/pages/cb-feuille-retour/cb-feuille-retour.component";
import { CbDebriefComponent } from "src/app/pages/cb-debrief/cb-debrief.component";

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
  { path: "gestion-client", component: GestionClientComponent },
  { path: "modifier-client", component: GestionClientComponent },
  { path: "gestion-vehicule", component: GestionVehiculeComponent },
  { path: "modifier-vehicule", component: GestionVehiculeComponent },
  { path: "gestion-ville", component: GestionVilleComponent },
  { path: "gestion-delegation", component: GestionDelegationComponent },
  { path: "pickup", component: CbPickupsComponent },
  { path: "pickup-historique", component: CbPickupsComponent },
  { path: "ramassage", component: CbRamassageComponent },
  { path: "collecte", component: CbCollecteComponent },
  { path: "feuille-de-route", component: CbFeuilleRouteComponent },
  { path: "feuille-de-route-historique", component: CbFeuilleRouteComponent },
  { path: "feuille-de-retour", component: CbFeuilleRetourComponent },
  { path: "debrief-list", component: CbDebriefComponent },
  { path: "debrief-bilan", component: CbDebriefComponent },
  { path: "debrief-detaillé", component: CbDebriefComponent },

  {
    path: "gestion-colis",
    component: GestionColisComponent,
    canActivate: [RoleGuard],
    data: {
      expectedRoles: ["admin"],
    },
  },
  { path: "finance", component: FinanceComponent },
  { path: "finance-f-h", component: FinanceComponent },
];
