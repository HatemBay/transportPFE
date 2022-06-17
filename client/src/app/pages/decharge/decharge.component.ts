import { PackageService } from "src/app/services/package.service";
import { Component, OnInit, ViewChild } from "@angular/core";
import { NavigationExtras, Router } from "@angular/router";
import { DatatableComponent } from "@swimlane/ngx-datatable";

@Component({
  selector: "app-decharge",
  templateUrl: "./decharge.component.html",
  styleUrls: ["./decharge.component.scss"],
})
export class DechargeComponent implements OnInit {
  @ViewChild(DatatableComponent) search: DatatableComponent;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild(alert) alert: any;

  public currentPageLimit: number = 10;
  public currentPage: number = 1;

  public readonly pageLimitOptions = [
    { value: 5 },
    { value: 10 },
    { value: 25 },
    { value: 50 },
    { value: 100 },
  ];

  packages: any = [];
  rows: any = [];
  selected: any = [];
  public columns: Array<object>;
  printable: boolean = false;
  val: string;
  constructor(private packageService: PackageService, private router: Router) {}

  ngOnInit(): void {
    this.initiateData();
  }

  async initiateData() {
    this.rows = await this.getPackages();
    console.log(this.rows);
  }

  async getPackages(
    limit?: any,
    page?: any,
    sortBy?: any,
    sort?: string,
    search?: string
  ) {
    return await this.packageService
      .getFullPackages("pickup", limit, page, sortBy, sort, search)
      .toPromise();
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
      this.router.createUrlTree(["/imprimer-pickup"], navigationExtras)
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

  // dynamic search (triggers after inserting 3 characters)
  updateFilter(event) {
      this.val = event.target.value.toLowerCase();
      if (event.target.value.length > 2) {
      this.getPackages(this.currentPageLimit, 1, null, null, this.val);
    } else {
      this.getPackages(this.currentPageLimit, 1);
    }
  }

  // updates list based on table length
  public onLimitChange(limit: any): void {
    this.changePageLimit(limit);
    this.table.limit = this.currentPageLimit;
    this.getPackages(limit, null, null, null, this.val);
  }

  // changes number of elements to display
  private changePageLimit(limit: any): void {
    this.currentPageLimit = parseInt(limit, 10);
  }

  // elements sorting
  onSort(event) {
    console.log(event);
    console.log(event.sorts[0].prop);
    this.getPackages(
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
    this.getPackages(this.currentPageLimit, event.page, null, null, this.val);
  }

  // change pages in footer
  changePage(page: any) {
    this.currentPage = parseInt(page, 10);
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
}
