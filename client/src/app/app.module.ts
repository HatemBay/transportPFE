import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { RouterModule } from "@angular/router";

import { AppComponent } from "./app.component";
import { AdminLayoutComponent } from "./layouts/admin-layout/admin-layout.component";
import { AuthLayoutComponent } from "./layouts/auth-layout/auth-layout.component";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { AppRoutingModule } from "./app.routing";
import { ComponentsModule } from "./components/components.module";
import { LoginComponent } from "./pages/login/login.component";
import { DatePipe } from "@angular/common";
import { ImprimerComponent } from "./pages/imprimer/imprimer.component";
import { NgxBarcodeModule } from "ngx-barcode";
import { ImprimerPickupComponent } from "./pages/imprimer-pickup/imprimer-pickup.component";
import { ImprimerFinanceComponent } from "./pages/imprimer-finance/imprimer-finance.component";

@NgModule({
  imports: [
    ReactiveFormsModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ComponentsModule,
    NgbModule,
    RouterModule,
    AppRoutingModule,
    NgxBarcodeModule,
  ],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    AuthLayoutComponent,
    LoginComponent,
    ImprimerComponent,
    ImprimerPickupComponent,
    ImprimerFinanceComponent,
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent],
})
export class AppModule {}
