import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { PackageService } from "src/app/services/package.service";
import { PickupService } from "src/app/services/pickup.service";

@Component({
  selector: "app-imprimer",
  templateUrl: "./imprimer.component.html",
  styleUrls: ["./imprimer.component.scss"],
})
export class ImprimerComponent implements OnInit {
  routePath: string;
  pickup: any = [];
  packages: any = [];
  pickupId: string;
  constructor(
    private route: ActivatedRoute,
    private pickupService: PickupService,
    private packageService: PackageService
  ) {
    this.routePath = this.route.snapshot.routeConfig.path;
    this.pickupId = this.route.snapshot.queryParamMap.get("id");
  }

  ngOnInit(): void {
    const packageIds = JSON.parse(
      this.route.snapshot.queryParamMap.get("packages")
    );

    this.getDataJson(this.pickupId);

    packageIds.forEach((element) => {
      console.log(element);

      this.getPackageData(element);
    });
  }

  getDataJson(pickupId: string) {
    this.pickupService.getPickup(pickupId).subscribe((data) => {
      this.pickup = data[0];
    });
  }

  getPackageData(element: any) {
    this.packageService.getPackage(element).subscribe((data) => {
      this.packages.push(data[0]);
    });
  }

  g(packages) {
    console.log(packages);

  }
}
