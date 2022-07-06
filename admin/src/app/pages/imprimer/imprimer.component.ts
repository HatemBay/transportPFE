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
  pickup: any = [];
  package: any;
  packageId: string;

  constructor(
    private route: ActivatedRoute,
    private packageService: PackageService
  ) {
    this.packageId = this.route.snapshot.queryParamMap.get("packageId");
  }

  ngOnInit(): void {
    this.getPackageData(this.packageId);
  }

  getPackageData(element: any) {
    this.packageService.getPackage(element).subscribe((data) => {
      this.package = data[0];
    });
  }

  g(packages) {
    console.log(packages);
  }

  getDate() {
    return new Date();
  }
}
