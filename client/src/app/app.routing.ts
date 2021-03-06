import { ForgotPasswordComponent } from "./pages/forgot-password/forgot-password.component";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BrowserModule } from "@angular/platform-browser";
import { Routes, RouterModule } from "@angular/router";

import { AdminLayoutComponent } from "./layouts/admin-layout/admin-layout.component";
import { LoginComponent } from "./pages/login/login.component";
import { AuthGuard } from "./services/auth.guard";
import { ImprimerComponent } from "./pages/imprimer/imprimer.component";
import { ImprimerPickupComponent } from "./pages/imprimer-pickup/imprimer-pickup.component";
import { ImprimerFinanceComponent } from "./pages/imprimer-finance/imprimer-finance.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "login",
    pathMatch: "full",
  },
  {
    path: "",
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        loadChildren: () =>
          import("src/app/layouts/admin-layout/admin-layout.module").then(
            (m) => m.AdminLayoutModule
          ),
      },
    ],
  },
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "imprimer-colis-gestion",
    canActivate: [AuthGuard],
    component: ImprimerComponent,
  },
  {
    path: "imprimer-colis",
    canActivate: [AuthGuard],
    component: ImprimerComponent,
  },
  {
    path: "imprimer-pickup",
    canActivate: [AuthGuard],
    component: ImprimerPickupComponent,
  },
  {
    path: "imprimer-finance",
    canActivate: [AuthGuard],
    component: ImprimerFinanceComponent,
  },
  { path: "mdp-oublie", component: ForgotPasswordComponent },
  {
    path: "**",
    redirectTo: "dashboard",
  },
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes, {
      useHash: false,
    }),
  ],
  exports: [],
})
export class AppRoutingModule {}
