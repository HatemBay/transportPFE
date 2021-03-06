import { Component, OnInit, ViewChild } from "@angular/core";
import { NavigationExtras, Router } from "@angular/router";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { forkJoin, map, subscribeOn } from "rxjs";
import { ClientService } from "src/app/services/client.service";
import { PackageService } from "src/app/services/package.service";

@Component({
  selector: "app-carnet-adresse",
  templateUrl: "./carnet-adresse.component.html",
  styleUrls: ["./carnet-adresse.component.scss"],
})
export class CarnetAdresseComponent implements OnInit {
  @ViewChild(DatatableComponent) search: DatatableComponent;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild(alert) alert: any;

  success: boolean = false;
  temp: any = [];
  rows: any = [];
  public columns: Array<object>;
  count: any;
  val: string;

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
  constructor(
    private clientService: ClientService,
    private packageService: PackageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initial columns, can be used for data list which is will be filtered
    this.columns = [
      { prop: "nom", name: "Nom & Prénom" },
      { prop: "ville", name: "Ville" },
      { prop: "delegation", name: "Délégation" },
      { prop: "adresse", name: "Adresse" },
      { prop: "codePostale", name: "CodePostale" },
      { prop: "nbPackages", name: "Nb. colis" },
    ];

    this.getDataJson();
    this.getStats();
    // this.findAll();
  }

  getDataJson(limit?: any, page?: any, sortBy?: any, sort?: any, search?: any) {
    this.clientService
      .getClients(limit, page, sortBy, sort, search)
      .subscribe((data) => {
        this.rows = this.temp = data.data;
        this.count = data.length;
      });
  }

  updateFilter(event) {
    this.val = event.target.value.toLowerCase();
    if (event.target.value.length > 2) {
      this.getDataJson(this.currentPageLimit, 1, null, null, this.val);
    } else {
      this.getDataJson(this.currentPageLimit, 1, null, null, null);
    }
  }

  // change number of elements to display
  public onLimitChange(limit: any): void {
    this.changePageLimit(limit);
    this.table.limit = this.currentPageLimit;
    this.getDataJson(limit, null, null, null, this.val);
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

  onFooterPage(event) {
    this.changePage(event.page);
    this.getDataJson(this.currentPageLimit, event.page, null, null, this.val);
  }

  changePage(page: any) {
    this.currentPage = parseInt(page, 10);
  }

  view(data) {
    console.log(data.clientId);
    var navigationExtras: NavigationExtras = {
      queryParams: {
        packageId: data._id,
      },
    };
    console.log(navigationExtras.queryParams);

    this.router.navigate(["/modifier-colis"], navigationExtras);
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

  // countPack(data) {
  //   var query = this.packageService.countByClient(data);
  //   var source = forkJoin(query);
  //   source.subscribe((data) => {return data});
  // }

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
