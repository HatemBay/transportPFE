import { Component, OnInit, ViewChild } from "@angular/core";
import { NavigationExtras, Router } from "@angular/router";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { map } from "rxjs";
import { AuthenticationService } from "src/app/services/authentication.service";
import { FinanceService } from "src/app/services/finance.service";
import { PackageService } from "src/app/services/package.service";

@Component({
  selector: "app-finance",
  templateUrl: "./finance.component.html",
  styleUrls: ["./finance.component.scss"],
})
export class FinanceComponent implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent;

  success: any;
  public currentPageLimit: number = 10;
  public currentPage: number = 1;

  public readonly pageLimitOptions = [
    { value: 5 },
    { value: 10 },
    { value: 25 },
    { value: 50 },
    { value: 100 },
  ];
  selected: any = [];
  allPackages: any;
  stats: any = [
    {
      state: "retourné à l'expediteur",
      count: 0,
      icon: "fas fa-times",
      bgColor: "bg-danger",
    },
    {
      state: "livré - payé - espèce",
      count: 0,
      icon: "fas fa-dollar-sign",
      bgColor: "bg-success",
    },
    {
      state: "livré - payé - chèque",
      count: 0,
      icon: "fas fa-check-square",
      bgColor: "bg-success",
    },
  ];
  temp: any = [];
  rows: any = [];
  public columns: Array<object>;
  count: any;
  val: string;

  constructor(
    private packageService: PackageService,
    private financeService: FinanceService,
    private router: Router,
    private authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    // Initial columns, can be used for data list which is will be filtered
    this.columns = [
      { prop: "nom", name: "Nom & Prénom" },
      { prop: "ville", name: "Ville" },
      { prop: "delegation", name: "Délégation" },
      { prop: "adresse", name: "Adresse" },
      { prop: "codePostale", name: "CodePostale" },
    ];

    this.getStats();
    this.initiateData();
  }

  initiateData() {
    this.getFinances();
  }

  async getFinances() {
    return await this.financeService
      .getFinances(this.authService.getUserDetails()._id)
      .pipe(
        map((data) => {
          this.count = data.length;
          this.rows = data.data;
        })
      )
      .toPromise();
  }

  // redirects to printable facture
  toFacture(row) {
    var CABs = [];
    console.log(row.packages);
    for (var el of row.packages) {
      CABs.push(el.CAB);
    }

    // Create our query parameters object
    const queryParams: any = {};
    queryParams.CABs = JSON.stringify(CABs);
    queryParams.finance = row._id;
    queryParams.nb = row.financeNb;
    var navigationExtras: NavigationExtras = {
      queryParams,
    };
    console.log(navigationExtras.queryParams);

    const url = this.router.serializeUrl(
      this.router.createUrlTree(["/imprimer-finance"], navigationExtras)
    );

    const WindowPrt = window.open(
      url,
      "_blank",
      "left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0"
    );

    WindowPrt.setTimeout(function () {
      WindowPrt.focus();
      WindowPrt.print();
      // WindowPrt.close();
    }, 2000);
  }

  // get data from backend
  getDataJson(
    limit?: any,
    page?: any,
    sortBy?: any,
    sort?: any,
    search?: any,
    etat?: any
  ) {
    this.packageService
      .getFullPackages(limit, page, sortBy, sort, search, etat)
      .subscribe((data) => {
        this.rows = this.temp = data;
        for (const item of this.rows) {
          item.c_remboursement = parseFloat(
            item.c_remboursement.toString()
          ).toFixed(3);
          console.log(item.c_remboursement);
        }
      });
  }

  private countPackages() {
    this.packageService.countAllPackages().subscribe((res) => {
      this.count = res.count;
    });
  }

  // change number of elements to display
  public onLimitChange(limit: any): void {
    this.changePageLimit(limit);
    this.table.limit = this.currentPageLimit;
    this.getDataJson(limit, this.currentPage);
    // this.table.recalculate();
    setTimeout(() => {
      if (this.table.bodyComponent.temp.length <= 0) {
        // TODO[Dmitry Teplov] find a better way.
        // TODO[Dmitry Teplov] test with server-side paging.
        this.table.offset = Math.floor(
          (this.table.rowCount - 1) / this.table.limit
        );
        // this.table.offset = 0;
      }
    });
  }

  private changePageLimit(limit: any): void {
    this.currentPageLimit = parseInt(limit, 10);
  }

  updateFilter(event) {
    this.val = event.target.value.toLowerCase();
    if (event.target.value.length > 2) {
      this.getDataJson(this.currentPageLimit, 1, null, null, this.val);
    } else {
      this.getDataJson(this.currentPageLimit, 1, null, null, null);
    }
  }

  // preserve the ui presenting selected elements after changing pages
  getId(row) {
    return row._id;
  }

  onSelect({ selected }) {
    console.log("Select Event", selected, this.selected);

    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  onSort(event) {
    this.getDataJson(
      this.currentPageLimit,
      event.page,
      event.sorts[0].prop,
      event.newValue,
      this.val
    );
  }

  view(data) {
    console.log(data);
    var navigationExtras: NavigationExtras = {
      queryParams: {},
    };
    console.log(navigationExtras.queryParams);

    this.router.navigate(["/finance-f-h"], navigationExtras);
  }
    // returns card statistics
    public async getStats() {
      this.packageService.countAllPackages(null).subscribe((data) => {
        this.allPackages = data.count;
      });

      for await (let [key, val] of Object.entries(this.stats)) {
        await this.packageService
          .countAllPackages(this.stats[key].state)
          .pipe(
            map((data) => {
              // const objIndex = this.stats.findIndex(
              //   (obj) => obj.state === "pret"
              // );
              this.stats[key].count = data.count;
            })
          )
          .toPromise();
      }
    }
    getIcon(stat) {
      return stat.icon;
    }
    getColor(stat) {
      return stat.bgColor;
    }
}
