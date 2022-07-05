import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { map, switchMap } from "rxjs";
import { AuthenticationService } from "src/app/services/authentication.service";
import { FinanceService } from "src/app/services/finance.service";
import { PackageService } from "src/app/services/package.service";

@Component({
  selector: "app-imprimer-finance",
  templateUrl: "./imprimer-finance.component.html",
  styleUrls: ["./imprimer-finance.component.scss"],
})
export class ImprimerFinanceComponent implements OnInit {
  rows: any = [];
  rowsLivre: any = [];
  rowsAnnule: any = [];
  packages: any = [];
  finance: any = [];
  CABs: string;
  nb: any;
  financeNb: number;
  financeId: any;
  fournisseur: any;

  constructor(
    private financeService: FinanceService,
    private packageService: PackageService,
    private route: ActivatedRoute,
    private authService: AuthenticationService
  ) {
    this.CABs = this.route.snapshot.queryParamMap.get("CABs");
    this.nb = this.route.snapshot.queryParamMap.get("nb");
    this.financeId = this.route.snapshot.queryParamMap.get("finance");
    this.fournisseur = this.authService.getUserDetails();
    this.financeNb = this.nb;
  }

  ngOnInit(): void {
    this.initiateData();
  }

  async initiateData() {
    this.finance = await this.getFinance();
    for (let el of this.finance.packages) {
      this.packages.push(await this.getPackage(el._id));
    }
  }

  async getFinance() {
    return await this.financeService
      .getFinance(this.financeId)
      .pipe(
        map((data) => {
          return data[0];
        })
      )
      .toPromise();
  }

  // get package and relative class information
  async getPackage(element) {
    return await this.packageService
      .getFullPackage(element)
      .pipe(
        map((data) => {
          return data[0];
        })
      )
      .toPromise();
  }
}
