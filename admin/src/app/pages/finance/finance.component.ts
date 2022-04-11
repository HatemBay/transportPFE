import { Component, OnInit, ViewChild } from "@angular/core";
import { NavigationExtras, Router } from "@angular/router";
import { DatatableComponent } from "@swimlane/ngx-datatable";
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

  temp: any = [];
  rows: any = [];
  public columns: Array<object>;
  count: any;

  constructor(private packageService: PackageService, private router: Router) {}

  ngOnInit(): void {
    // Initial columns, can be used for data list which is will be filtered
    this.columns = [
      { prop: "nom", name: "Nom & Prénom" },
      { prop: "ville", name: "Ville" },
      { prop: "delegation", name: "Délégation" },
      { prop: "adresse", name: "Adresse" },
      { prop: "codePostale", name: "CodePostale" },
    ];

    this.countPackages();

    this.getDataJson();
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
    this.packageService.countAllPackagesAdmin().subscribe((res) => {
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
    if (event.target.value.length > 2) {
      const val = event.target.value.toLowerCase();
      this.getDataJson(this.currentPageLimit, 1, null, null, val);
    } else {
      this.getDataJson(this.currentPageLimit, 1, null, null, null);
    }
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
      event.newValue
    );
  }

  view(data) {
    console.log(data);
    var navigationExtras: NavigationExtras = {
      queryParams: {
      },
    };
    console.log(navigationExtras.queryParams);

    this.router.navigate(["/finance-f-h"], navigationExtras);
  }
}
