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
  fournisseur: any = [];
  finance: any = [];
  fourn: any = [];
  packages: any = [];
  paye: any = [];
  retourne: any = [];
  type: string;
  nb: any;
  financeNb: number;
  frais: any;
  financeId: any;
  CABs: any;
  date: any;

  constructor(
    private fournisseurService: FournisseurService,
    private financeService: FinanceService,
    private packageService: PackageService,
    private route: ActivatedRoute
  ) {
    this.financeId = this.route.snapshot.queryParamMap.get("financeId");
    this.fourn = this.route.snapshot.queryParamMap.get("fournisseurId");
    this.type = this.route.snapshot.queryParamMap.get("type");
    this.CABs = this.route.snapshot.queryParamMap.get("CABs");
    this.nb = this.route.snapshot.queryParamMap.get("nb");
    this.frais = JSON.parse(this.route.snapshot.queryParamMap.get("frais"));
    console.log(this.frais);

  }

  ngOnInit(): void {
    if (this.type === "historique") {
      this.initiateDataForExistingFinance();
    } else {
      this.initiateDataForNewFinance();
    }
  }

  async initiateDataForNewFinance() {
    this.date = new Date();
    this.fournisseur = await this.getProvider(this.fourn);
    const packageCABs = JSON.parse(this.CABs);

    packageCABs.forEach(async (element) => {
      const pack = await this.getPackageData(element);

      if (pack.etat == "livré (espèce)") {
        this.paye.push(pack);
        this.changeState(element, "livré - payé - espèce");
      } else if (pack.etat == "livré (chèque)") {
        this.paye.push(pack);
        this.changeState(element, "livré - payé - chèque");
      } else if (pack.etat == "retourné") {
        this.retourne.push(pack);
        this.changeState(element, "retourné à l'expediteur");
      }
    });
    if (!JSON.parse(this.nb)) this.getLastFinanceNb();
    else this.financeNb = this.nb;
  }

  async initiateDataForExistingFinance() {
    this.fournisseur = await this.getProvider(this.fourn);
    this.finance = await this.getFinance();
    for (let el of this.finance.packages) {
      this.packages.push(await this.getPackageData(el.CAB));
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

  async getProvider(fournisseurId: string) {
    return await this.fournisseurService
      .getFournisseur(fournisseurId)
      .pipe(
        map((data) => {
          return data[0];
        })
      )
      .toPromise();
  }

  async getPackageData(element: any) {
    return await this.packageService
      .getFullPackageByCAB(element)
      .pipe(
        map((data) => {
          return data[0];
        })
      )
      .toPromise();
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
              item.etat === "retourné"
            ) {
              result = [...result, item];
            }
          }
          return result;
        })
      )
      .toPromise();
  }

  public changeState(element: any, state: string) {
    this.packageService
      .updatePackageByCAB(element, { etat: state })
      .subscribe();
  }
}
