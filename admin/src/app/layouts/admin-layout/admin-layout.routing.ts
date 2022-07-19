import { Routes } from "@angular/router";

import { DashboardComponent } from "../../pages/dashboard/dashboard.component";
import { IconsComponent } from "../../pages/icons/icons.component";
import { ColisJourComponent } from "../../pages/colis-jour/colis-jour.component";
import { UserProfileComponent } from "../../pages/user-profile/user-profile.component";
import { RechercheComponent } from "../../pages/recherche/recherche.component";
import { CarnetAdresseComponent } from "src/app/pages/carnet-adresse/carnet-adresse.component";
import { GestionColisComponent } from "src/app/pages/gestion-colis/gestion-colis.component";
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
import { ModifierColisComponent } from "src/app/pages/modifier-colis/modifier-colis.component";
import { FinanceClientComponent } from "src/app/pages/finance-client/finance-client.component";
import { FinanceDebriefGlobalComponent } from "src/app/pages/finance-debrief-global/finance-debrief-global.component";
import { AuthGuard } from "src/app/services/auth.guard";

export const AdminLayoutRoutes: Routes = [
  {
    path: "dashboard",
    canActivate: [AuthGuard],
    component: DashboardComponent,
  },
  {
    path: "colis-jour",
    canActivate: [AuthGuard],
    component: ColisJourComponent,
  },
  {
    path: "user-profile",
    canActivate: [AuthGuard],
    component: UserProfileComponent,
  },
  {
    path: "recherche",
    canActivate: [AuthGuard],
    component: RechercheComponent,
  },
  {
    path: "recherche-av",
    canActivate: [AuthGuard],
    component: RechercheComponent,
  },
  {
    path: "recherche-av-sub",
    canActivate: [AuthGuard],
    component: RechercheComponent,
  },
  //TODO: remove
  {
    path: "icons",
    canActivate: [AuthGuard],
    component: IconsComponent,
  },
  //TODO: remove
  {
    path: "carnet-adresses",
    canActivate: [AuthGuard, RoleGuard],
    data: {
      expectedRoles: ["admin"],
    },
    component: CarnetAdresseComponent,
  },
  {
    path: "gestion-filiere",
    canActivate: [AuthGuard, RoleGuard],
    data: {
      expectedRoles: ["admin"],
    },
    component: GestionFiliereComponent,
  },
  {
    path: "gestion-personel",
    canActivate: [AuthGuard, RoleGuard],
    data: {
      expectedRoles: ["admin"],
    },
    component: GestionPersonelComponent,
  },
  {
    path: "modifier-personel",
    canActivate: [AuthGuard, RoleGuard],
    data: {
      expectedRoles: ["admin"],
    },
    component: GestionPersonelComponent,
  },
  {
    path: "gestion-client",
    canActivate: [AuthGuard, RoleGuard],
    data: {
      expectedRoles: ["admin", "commercial"],
    },
    component: GestionClientComponent,
  },
  {
    path: "modifier-client",
    canActivate: [AuthGuard, RoleGuard],
    data: {
      expectedRoles: ["admin", "commercial"],
    },
    component: GestionClientComponent,
  },
  {
    path: "gestion-vehicule",
    canActivate: [AuthGuard, RoleGuard],
    data: {
      expectedRoles: ["admin"],
    },
    component: GestionVehiculeComponent,
  },
  {
    path: "modifier-vehicule",
    canActivate: [AuthGuard, RoleGuard],
    data: {
      expectedRoles: ["admin"],
    },
    component: GestionVehiculeComponent,
  },
  {
    path: "gestion-ville",
    canActivate: [AuthGuard, RoleGuard],
    data: {
      expectedRoles: ["admin"],
    },
    component: GestionVilleComponent,
  },
  {
    path: "gestion-delegation",
    canActivate: [AuthGuard, RoleGuard],
    data: {
      expectedRoles: ["admin"],
    },
    component: GestionDelegationComponent,
  },
  {
    path: "pickup",
    canActivate: [AuthGuard, RoleGuard],
    data: {
      expectedRoles: ["admin", "chef bureau"],
    },
    component: CbPickupsComponent,
  },
  {
    path: "pickup-historique",
    canActivate: [AuthGuard, RoleGuard],
    data: {
      expectedRoles: ["admin", "chef bureau"],
    },
    component: CbPickupsComponent,
  },
  {
    path: "ramassage",
    canActivate: [AuthGuard, RoleGuard],
    data: {
      expectedRoles: ["admin", "chef bureau"],
    },
    component: CbRamassageComponent,
  },
  {
    path: "collecte",
    canActivate: [AuthGuard, RoleGuard],
    data: {
      expectedRoles: ["admin", "chef bureau"],
    },
    component: CbCollecteComponent,
  },
  {
    path: "feuille-de-route",
    canActivate: [AuthGuard, RoleGuard],
    data: {
      expectedRoles: ["admin", "chef bureau"],
    },
    component: CbFeuilleRouteComponent,
  },
  {
    path: "feuille-de-route-historique",
    canActivate: [AuthGuard, RoleGuard],
    data: {
      expectedRoles: ["admin", "chef bureau"],
    },
    component: CbFeuilleRouteComponent,
  },
  {
    path: "feuille-de-retour",
    canActivate: [AuthGuard, RoleGuard],
    data: {
      expectedRoles: ["admin", "chef bureau"],
    },
    component: CbFeuilleRetourComponent,
  },
  {
    path: "feuille-de-retour-historique",
    canActivate: [AuthGuard, RoleGuard],
    data: {
      expectedRoles: ["admin", "chef bureau"],
    },
    component: CbFeuilleRetourComponent,
  },
  {
    path: "debrief-list",
    canActivate: [AuthGuard, RoleGuard],
    data: {
      expectedRoles: ["admin", "chef bureau"],
    },
    component: CbDebriefComponent,
  },
  {
    path: "debrief-bilan",
    canActivate: [AuthGuard, RoleGuard],
    data: {
      expectedRoles: ["admin", "chef bureau"],
    },
    component: CbDebriefComponent,
  },
  {
    path: "debrief-detail",
    canActivate: [AuthGuard, RoleGuard],
    data: {
      expectedRoles: ["admin", "chef bureau"],
    },
    component: CbDebriefComponent,
  },
  {
    path: "debrief-detaillé",
    canActivate: [AuthGuard, RoleGuard],
    data: {
      expectedRoles: ["admin", "chef bureau"],
    },
    component: CbDebriefComponent,
  },
  {
    path: "finance-client",
    canActivate: [AuthGuard, RoleGuard],
    data: {
      expectedRoles: ["admin", "financier"],
    },
    component: FinanceClientComponent,
  },
  {
    path: "finance-client-print",
    canActivate: [AuthGuard, RoleGuard],
    data: {
      expectedRoles: ["admin", "financier"],
    },
    component: FinanceClientComponent,
  },
  {
    path: "debrief-global",
    canActivate: [AuthGuard, RoleGuard],
    data: {
      expectedRoles: ["admin", "financier"],
    },
    component: FinanceDebriefGlobalComponent,
  },
  {
    path: "modifier-colis",
    canActivate: [AuthGuard, RoleGuard],
    data: {
      expectedRoles: ["admin"],
    },
    component: ModifierColisComponent,
  },

  {
    path: "gestion-colis",
    component: GestionColisComponent,
    canActivate: [AuthGuard],
  },
];
