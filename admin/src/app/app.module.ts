import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { RouterModule } from "@angular/router";

import { AppComponent } from "./app.component";
import { AdminLayoutComponent } from "./layouts/admin-layout/admin-layout.component";
import { AuthLayoutComponent } from "./layouts/auth-layout/auth-layout.component";

import { NgbActiveModal, NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { AppRoutingModule } from "./app.routing";
import { ComponentsModule } from "./components/components.module";
import { LoginComponent } from "./pages/login/login.component";
import { DatePipe } from "@angular/common";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { ImprimerComponent } from "./pages/imprimer/imprimer.component";
import { NgxBarcodeModule } from "ngx-barcode";
import { ImprimerRoadmapComponent } from "./pages/imprimer-roadmap/imprimer-roadmap.component";
import { SafePipe } from "./safe.pipe";
import { ImprimerFinanceComponent } from "./pages/imprimer-finance/imprimer-finance.component";
import { ImprimerFeuilleRetourComponent } from "./pages/imprimer-feuille-retour/imprimer-feuille-retour.component";

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
    NgxDatatableModule,
    NgxBarcodeModule,
  ],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    AuthLayoutComponent,
    LoginComponent,
    ImprimerComponent,
    ImprimerRoadmapComponent,
    ImprimerFeuilleRetourComponent,
    SafePipe,
    ImprimerFinanceComponent,
  ],
  providers: [DatePipe, NgbActiveModal],
  bootstrap: [AppComponent],
})
export class AppModule {}
