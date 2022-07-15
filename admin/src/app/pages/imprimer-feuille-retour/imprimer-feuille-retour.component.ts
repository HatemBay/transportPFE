import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { map } from "rxjs";
import { FeuilleRetourService } from "src/app/services/feuille-retour.service";
import { HistoriqueService } from "src/app/services/historique.service";
import { PackageService } from "src/app/services/package.service";
import { RoadmapService } from "src/app/services/roadmap.service";

@Component({
  selector: "app-imprimer-feuille-retour",
  templateUrl: "./imprimer-feuille-retour.component.html",
  styleUrls: ["./imprimer-feuille-retour.component.scss"],
})
export class ImprimerFeuilleRetourComponent implements OnInit {
  routePath: string;
  CABs: string;
  nb: any;
  feuilleRetourNb: any;

  packages: any = [];

  constructor(
    private route: ActivatedRoute,
    private feuilleRetourService: FeuilleRetourService,
    private packageService: PackageService,
    private historiqueService: HistoriqueService
  ) {
    this.routePath = this.route.snapshot.routeConfig.path;
    this.CABs = this.route.snapshot.queryParamMap.get("CABs");
    this.nb = this.route.snapshot.queryParamMap.get("nb");

    console.log(this.CABs);
  }

  async ngOnInit() {
    const packageCABs = JSON.parse(this.CABs);

    // for await (let element of packageCABs) {
    //   await this.getPackageData(element);
    // }
    // for await (let element of this.packages) {
    //   await this.changeState(element._id);
    // }

    packageCABs.forEach((element) => {
      this.getPackageData(element);
      this.changeState(element);
    });

    if (!JSON.parse(this.nb)) this.getLastFeuilleRetourNb();
    else this.feuilleRetourNb = this.nb;
  }

  async getPackageData(element: any) {
    return await this.packageService
      .getFullPackageByCAB(element)
      .pipe(
        map((data) => {
          this.packages.push(data[0]);
          console.log(data[0]);
        })
      )
      .toPromise();
  }

  getLastFeuilleRetourNb() {
    this.feuilleRetourService.getLastFeuilleRetourNb().subscribe((data) => {
      console.log("data");
      console.log(data);
      this.feuilleRetourNb = data;
    });
  }

  // public async recordHistorique(element: string) {
  //   const date = new Date();
  //   return await this.historiqueService
  //     .createHistorique({
  //       action: "retourné",
  //       date: date,
  //       packageId: element,
  //     })
  //     .toPromise();
  // }

  public changeState(element: any) {
    this.packageService
      .updatePackageByCAB(element, { etat: "en cours de retour" })
      .subscribe();
  }
}
