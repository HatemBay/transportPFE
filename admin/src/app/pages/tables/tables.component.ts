import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { PackageService } from "src/app/services/package.service";
import { ClientService } from "src/app/services/client.service";
import { NavigationExtras, Router } from "@angular/router";

@Component({
  selector: "app-tables",
  templateUrl: "./tables.component.html",
  styleUrls: ["./tables.component.scss"],
})
export class TablesComponent implements OnInit {
  @ViewChild(DatatableComponent) search: DatatableComponent;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild(alert) alert: any;

  success: boolean = false;

  public currentPageLimit: number = 10;
  public currentPage: number = 1;

  public readonly pageLimitOptions = [
    { value: 5 },
    { value: 10 },
    { value: 25 },
    { value: 50 },
    { value: 100 },
  ];

  temp: any = [];
  rows: any = [];
  selected: any = [];
  public columns: Array<object>;
  count: any;

  constructor(
    private packageService: PackageService,
    private clientService: ClientService,
    private router: Router
  ) {}
  ngOnInit(): void {
    // Initial columns, can be used for data list which is will be filtered
    this.columns = [
      { prop: "nomc", name: "Nom & Prénom" },
      { prop: "villec", name: "Ville" },
      { prop: "delegationc", name: "Délégation" },
      { prop: "adressec", name: "Adresse" },
      { prop: "codePostalec", name: "CodePostale" },
    ];

    this.countPackages();

    this.getDataJson();
    // this.findAll();
  }

  // get data from backend
  getDataJson(limit?: any, page?: any, sortBy?: any, sort?: any, search?:any) {
    // this.packageService
    //   .getFullPackages(limit, page, sortBy, sort, search)
    //   .subscribe((data) => {
    //     this.rows = this.temp = data;
    //     for (const item of this.rows) {
    //       item.c_remboursement = parseFloat(item.c_remboursement.toString()).toFixed(3);
    //       console.log(item.c_remboursement);
    //     }
    //   });
  }

  private countPackages() {
    this.packageService.countAllPackagesAdmin(null).subscribe((res) => {
      this.count = res.count;
    });
  }

  updateFilter(event) {
    if(event.target.value.length > 2){
      const val = event.target.value.toLowerCase();
      this.getDataJson(this.currentPageLimit, 1, null, null, val);
    }
    else {
      this.getDataJson(this.currentPageLimit, 1);
    }
    // // filter our data
    // const temp = this.temp.filter((item) => {
    //   // const keys = Object.keys(this.temp[0]);
    //   //search in columns
    //   return (
    //     item.CAB.toLowerCase().indexOf(val) !== -1 ||
    //     item.nom.toLowerCase().indexOf(val) !== -1 ||
    //     item.tel.toLowerCase().indexOf(val) !== -1 ||
    //     !val
    //   );
    // });

    // // update the rows
    // this.rows = temp;
    // Whenever the filter changes, always go back to the first page
    // this.search.offset = 0;
  }

  // TODO[Dmitry Teplov] wrap dynamic limit in a separate component.
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

  onSelect({ selected }) {
    console.log("Select Event", selected, this.selected);

    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  onSort(event) {
    console.log(event);
    console.log(event.sorts[0].prop);
    this.getDataJson(
      this.currentPageLimit,
      event.page,
      event.sorts[0].prop,
      event.newValue
    );
  }

  onFooterPage(event) {
    this.changePage(event.page);
    this.getDataJson(this.currentPageLimit, event.page);
  }

  changePage(page: any) {
    this.currentPage = parseInt(page, 10);
  }

  modify(data) {
    console.log(data.clientId);
    var navigationExtras: NavigationExtras = {
      queryParams: {
        packageId: data._id,
        clientId: data.clientId,
      },
    };
    console.log(navigationExtras.queryParams);

    this.router.navigate(["/modifier-colis"], navigationExtras);
  }

  delete(data) {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce colis?")) {
      this.packageService.deletePackage(data._id).subscribe(() => {
        console.log("package deleted");
      });
      this.clientService.deleteClient(data.clientId).subscribe(() => {
        console.log("client deleted");
        var temp = this.temp.filter(
          (item) => item.CAB.indexOf(data.CAB) === -1
        );
        // update the rows after delete
        this.rows = temp;
        // trigger to show alert
        this.success = true;
        // setTimeout(() => this.success = false, 3000)
      });
    }
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
}
