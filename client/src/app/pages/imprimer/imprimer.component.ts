import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { PackageService } from "src/app/services/package.service";

@Component({
  selector: "app-imprimer",
  templateUrl: "./imprimer.component.html",
  styleUrls: ["./imprimer.component.scss"],
})
export class ImprimerComponent implements OnInit {
  package: any = [];
  packageIds: Array<String>;
  routePath: string;
  constructor(private pack: PackageService, private route: ActivatedRoute) {
    this.routePath = this.route.snapshot.routeConfig.path;

    const packages = this.route.snapshot.queryParamMap.get("packages");
    if (packages === null) {
      this.packageIds = new Array<string>();
    } else {
      this.packageIds = JSON.parse(packages);
    }
  }

  ngOnInit(): void {
    for (var el of this.packageIds) {
      this.getPackage(el);
    }
    for (var el2 of this.package)
      el2.c_remboursement = parseFloat(el2.c_remboursement.toString()).toFixed(
        3
      );

    console.log(this.package);

    // this.getPackage(element);
  }

  // get package and relative class information
  getPackage(element) {
    this.pack.getFullPackage(element).subscribe((data) => {
      console.log(data);

      this.package.push(data[0]);
    });
  }
}
