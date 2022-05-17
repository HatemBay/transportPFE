import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { PackageService } from "src/app/services/package.service";
import { PickupService } from "src/app/services/pickup.service";
import { RoadmapService } from "src/app/services/roadmap.service";

@Component({
  selector: "app-imprimer-roadmap",
  templateUrl: "./imprimer-roadmap.component.html",
  styleUrls: ["./imprimer-roadmap.component.scss"],
})
export class ImprimerRoadmapComponent implements OnInit {
  routePath: string;
  pickup: any = [];
  packages: any = [];
  CABs: string;
  index: any = [];
  errors: string;
  roadmapNb: any;
  nb: string;
  constructor(
    private route: ActivatedRoute,
    private roadmapService: RoadmapService,
    private packageService: PackageService
  ) {
    this.routePath = this.route.snapshot.routeConfig.path;
    this.CABs = this.route.snapshot.queryParamMap.get("CABs");
    this.errors = this.route.snapshot.queryParamMap.get("errors");
    this.nb = this.route.snapshot.queryParamMap.get("nb");
    this.index = JSON.parse(this.errors) || [];
    console.log(this.errors);
    console.log(this.index);
  }

  ngOnInit(): void {
    const packageCABs = JSON.parse(this.CABs);

    console.log(packageCABs);
    console.log("packageCABs");

    packageCABs.forEach((element) => {
      this.getPackageData(element);
      if (this.index.length === 0) {
        this.changeState(element);
      }
    });
    if (!JSON.parse(this.nb)) this.getLastRoadmapNb();
    else this.roadmapNb = this.nb;
  }

  getLastRoadmapNb() {
    this.roadmapService.getLastRoadmapNb().subscribe((data) => {
      this.roadmapNb = data;
    });
  }

  getPackageData(element: any) {
    this.packageService.getFullPackageByCAB(element).subscribe((data) => {
      this.packages.push(data[0]);
    });
  }

  public changeState(element: any) {
    this.packageService
      .updatePackageByCAB(element, { etat: "en cours" })
      .subscribe();
  }

  g(packages) {
    console.log(packages);
  }
}
