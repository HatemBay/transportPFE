import { Component, OnInit, ViewChild } from "@angular/core";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { PackageService } from "src/app/services/package.service";
import { ClientService } from "src/app/services/client.service";
import { ActivatedRoute, NavigationExtras, Router } from "@angular/router";

@Component({
  selector: "app-tables",
  templateUrl: "./liste-colis.component.html",
  styleUrls: ["./liste-colis.component.scss"],
})
export class ListeColisComponent implements OnInit {
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
  printable: boolean = false;
  added: boolean;
  edited: boolean;
  val: string;

  constructor(
    private packageService: PackageService,
    private clientService: ClientService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.added = Boolean(this.route.snapshot.queryParamMap.get("added"));
    this.edited = Boolean(this.route.snapshot.queryParamMap.get("edited"));
    // TODO: remove
    console.log(localStorage.getItem("mean-token"));
  }
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
    console.log(this.temp[0]);
  }

  // get data from backend
  getDataJson(limit?: any, page?: any, sortBy?: any, sort?: any, search?: any) {
    this.packageService
      .getFullPackages(null, limit, page, sortBy, sort, search)
      .subscribe((data) => {
        this.rows = this.temp = data;
        console.log("data");

        console.log(data);
        // console.log(this.temp);

        for (const item of this.rows) {
          item.c_remboursement = parseFloat(
            item.c_remboursement.toString()
          ).toFixed(3);
          console.log(item.c_remboursement);
        }
      });
  }

  // count all packages
  private countPackages() {
    this.packageService.countAllPackages(null).subscribe((res) => {
      this.count = res.count;
    });
  }

  // dynamic search (triggers after inserting 3 characters)
  updateFilter(event) {
    if (event.target.value.length > 2) {
      this.val = event.target.value.toLowerCase();
      this.getDataJson(this.currentPageLimit, 1, null, null, this.val);
    } else {
      this.getDataJson(this.currentPageLimit, 1);
    }
  }

  // updates list based on table length
  public onLimitChange(limit: any): void {
    this.changePageLimit(limit);
    this.table.limit = this.currentPageLimit;
    this.getDataJson(limit, null, null, null, this.val);
  }

  // changes number of elements to display
  private changePageLimit(limit: any): void {
    this.currentPageLimit = parseInt(limit, 10);
  }

  // elements sorting
  onSort(event) {
    console.log(event);
    console.log(event.sorts[0].prop);
    this.getDataJson(
      this.currentPageLimit,
      event.page,
      event.sorts[0].prop,
      event.newValue,
      this.val
    );
  }

  // change data based on page selected
  onFooterPage(event) {
    this.changePage(event.page);
    this.getDataJson(this.currentPageLimit, event.page, null, null, this.val);
  }

  // change pages in footer
  changePage(page: any) {
    this.currentPage = parseInt(page, 10);
  }

  // update package
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

  // delete package
  delete(data) {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce colis?")) {
      this.packageService.deletePackage(data._id).subscribe(() => {
        console.log("package deleted");
      });
      this.clientService.deleteClient(data.clientId).subscribe(() => {
        console.log("client deleted");

        var temp = this.temp.filter(
          (item) => item._id !== data._id
          // (item) => item.CAB.indexOf(data.CAB) === -1
        );
        // update the rows after delete
        this.rows = temp;
        // trigger to show alert
        this.success = true;
        // setTimeout(() => this.success = false, 3000)
      });
    }
  }

  // view more information
  view(data) {
    console.log(data.clientId);
    var navigationExtras: NavigationExtras = {
      queryParams: {
        packageId: data._id,
      },
    };
    console.log(navigationExtras.queryParams);

    this.router.navigate(["/details-colis"], navigationExtras);
  }

  // checkbox selection
  onSelect(event) {
    // console.log("Select Event", event);

    this.selected = event.selected;
    if (this.selected.length > 0) {
      this.printable = true;
    } else {
      this.printable = false;
    }

    // console.log(this.selected[0]._id);
  }

  // print selecetd elements
  print() {
    var ids = [];
    for (var el of this.selected) {
      ids.push(el._id);
    }

    // Create our query parameters object
    const queryParams: any = {};
    queryParams.packages = JSON.stringify(ids);
    var navigationExtras: NavigationExtras = {
      queryParams,
    };
    console.log(navigationExtras.queryParams);

    const url = this.router.serializeUrl(
      this.router.createUrlTree(["/imprimer-colis"], navigationExtras)
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
    }, 1000);
  }
}
