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

  constructor(
    private route: ActivatedRoute,
    private pickupService: PickupService,
    private packageService: PackageService,
    private auth: AuthenticationService
  ) {
    const packages = this.route.snapshot.queryParamMap.get("packages");
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
    this.createPickup(this.packages, this.auth.getUserDetails()._id);
  }

  createPickup(packages: any, id: string) {
    this.pickupService
      .createPickup({ packages: packages, fournisseurId: id })
      .subscribe(() => {
        for (let element of packages) {
          this.packageService
            .updatePackage(element._id, { etat: "pret" })
            .subscribe();
        }
        console.log("created");

      });
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
