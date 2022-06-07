import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { FeuilleRetourService } from "src/app/services/feuille-retour.service";
import { PackageService } from "src/app/services/package.service";
import { RoadmapService } from "src/app/services/roadmap.service";

@Component({
  selector: "app-imprimer-feuille-retour",
  templateUrl: "./imprimer-feuille-retour.component.html",
  styleUrls: ["./imprimer-feuille-retour.component.scss"],
})
export class ImprimerFeuilleRetourComponent implements OnInit {
  CABs: string;
  nb: any;
  feuilleRetourNb: any;
  packages: any = [];

  constructor(
    private route: ActivatedRoute,
    private feuilleRetourService: FeuilleRetourService,
    private packageService: PackageService
  ) {
    this.CABs = this.route.snapshot.queryParamMap.get("CABs");

    console.log(this.CABs);
  }

  ngOnInit(): void {
    const packageCABs = JSON.parse(this.CABs);

    // if (typeof packageCABs === "string") {
    packageCABs.forEach((element) => {
      this.getPackageData(element);
      // this.changeState(element);
    });
    this.getLastFeuilleRetourNb();
  }

  getPackageData(element: any) {
    this.packageService.getFullPackageByCAB(element).subscribe((data) => {
      this.packages.push(data[0]);
    });
  }

  getLastFeuilleRetourNb() {
    this.feuilleRetourService.getLastFeuilleRetourNb().subscribe((data) => {
      console.log("data");
      console.log(data);
      this.feuilleRetourNb = data;
    });
  }
}
