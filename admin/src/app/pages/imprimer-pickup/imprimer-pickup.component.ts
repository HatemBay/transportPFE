import { map } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import { PickupService } from "src/app/services/pickup.service";
import { PackageService } from "src/app/services/package.service";
import { AuthenticationService } from "src/app/services/authentication.service";

@Component({
  selector: "app-imprimer-pickup",
  templateUrl: "./imprimer-pickup.component.html",
  styleUrls: ["./imprimer-pickup.component.scss"],
})
export class ImprimerPickupComponent implements OnInit {
  packageIds: Array<String>;
  packages: any = [];
  pickupNb: any;

  constructor(
    private route: ActivatedRoute,
    private packageService: PackageService
  ) {
    const packages = this.route.snapshot.queryParamMap.get("packages");
    this.pickupNb = this.route.snapshot.queryParamMap.get("nb");
    this.packageIds = JSON.parse(packages);
  }

  ngOnInit(): void {
    this.initiateData();
  }

  async initiateData() {
    for (var el of this.packageIds) {
      this.packages.push(await this.getPackage(el));
    }
    console.log(this.packages);
  }

  // get package and relative class information
  async getPackage(element) {
    return await this.packageService
      .getPackage(element)
      .pipe(
        map((data) => {
          console.log("packageData");
          console.log(data);

          return data[0];
        })
      )
      .toPromise();
  }
}
