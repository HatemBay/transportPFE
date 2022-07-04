import { PackageService } from "src/app/services/package.service";
import { FournisseurService } from "src/app/services/fournisseur.service";
import { Component, OnInit } from "@angular/core";
import { map } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { FinanceService } from "src/app/services/finance.service";

@Component({
  selector: "app-imprimer-finance",
  templateUrl: "./imprimer-finance.component.html",
  styleUrls: ["./imprimer-finance.component.scss"],
})
export class ImprimerFinanceComponent implements OnInit {
  rows: any = [];
  rows2: any = [];
  fournisseur: any = [];
  fourn: any = [];
  packages: any = [];
  CABs: string;
  nb: any;
  financeNb: number;

  constructor(
    private fournisseurService: FournisseurService,
    private financeService: FinanceService,
    private packageService: PackageService,
    private route: ActivatedRoute
  ) {
    this.fourn = this.route.snapshot.queryParamMap.get("fournisseurId");
    this.CABs = this.route.snapshot.queryParamMap.get("CABs");
    this.nb = this.route.snapshot.queryParamMap.get("nb");
  }

  ngOnInit(): void {
    if (this.nb && this.nb !== null) {
      this.initiateData();
    } else {
      const packageCABs = JSON.parse(this.CABs);

      packageCABs.forEach((element) => {
        this.getPackageData(element);
        // TODO: change state after feuille-retour allocation
        // this.changeState(element);
      });
      if (!JSON.parse(this.nb)) this.getLastFinanceNb();
      else this.financeNb = this.nb;
    }
  }

  async initiateData() {
    this.packages = await this.getPackagesByProvider(
      this.fourn,
      50,
      1,
      null,
      null,
      null
    );
    this.fournisseur = await this.getProvider(this.fourn);
    console.log("slm");

    console.log(this.packages);

    var livré = [];
    var annulé = [];
    for (let pack of this.packages) {
      if (pack.etat === "livré (espèce)" || pack.etat === "livré (chèque)") {
        livré = [...livré, pack];
      } else if (
        pack.etat === "annulé" //TODO: to be changed to 'retourné à l'expéditeur
      ) {
        annulé = [...annulé, pack];
      }
    }
    this.rows = livré;
    this.rows2 = annulé;
  }

  async getProvider(fournisseurId: string) {
    return await this.fournisseurService
      .getFournisseur(fournisseurId)
      .toPromise();
  }

  getPackageData(element: any) {
    this.packageService.getFullPackageByCAB(element).subscribe((data) => {
      this.packages.push(data[0]);
      console.log(data[0]);
    });
  }

  getLastFinanceNb() {
    this.financeService.getLastFinanceNb().subscribe((data) => {
      console.log("data");
      console.log(data);
      this.financeNb = data;
    });
  }

  async getPackagesByProvider(
    id: any,
    limit?: any,
    page?: any,
    sortBy?: any,
    sort?: any,
    search?: any,
    startDate?: any,
    endDate?: any
  ) {
    return await this.packageService
      .getPackageByProvider(
        "finance-client",
        id,
        limit,
        page,
        sortBy,
        sort,
        search,
        startDate,
        endDate
      )
      .pipe(
        map(async (data) => {
          var result: any = [];
          var packages: any = [];
          packages = data.data;
          for (let item of packages) {
            if (
              item.etat === "livré (espèce)" ||
              item.etat === "livré (chèque)" ||
              item.etat === "annulé" //TODO: to be changed to 'retourné à l'expéditeur
            ) {
              result = [...result, item];
            }
          }
          return result;
        })
      )
      .toPromise();
  }
}
