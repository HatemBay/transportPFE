import { map } from "rxjs/operators";
import { DatePipe } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";
import { ActivatedRoute, NavigationExtras, Router } from "@angular/router";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { RoadmapService } from "src/app/services/roadmap.service";
import { ClientService } from "src/app/services/client.service";
import { PackageService } from "src/app/services/package.service";

@Component({
  selector: "app-cb-debrief",
  templateUrl: "./cb-debrief.component.html",
  styleUrls: ["./cb-debrief.component.scss"],
})
export class CbDebriefComponent implements OnInit {
  @ViewChild(DatatableComponent) search: DatatableComponent;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild(alert) alert: any;

  dateForm: FormGroup;
  date: any;
  myDate = new Date();
  temp: any = [];
  rows: any = [];
  public columns: Array<object>;
  routePath: string;
  roadmapId: any;

  public currentPageLimit: number = 10;
  public currentPage: number = 1;

  public readonly pageLimitOptions = [
    { value: 5 },
    { value: 10 },
    { value: 25 },
    { value: 50 },
    { value: 100 },
  ];
  count: number;
  roadmap: any = {};
  clients: any = [];
  packages: any = [];
  totalEspece: number;
  totalAutre: number;
  total: number;
  dateSave: any;

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private roadmapService: RoadmapService,
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private packageService: PackageService
  ) {
    this.routePath = this.route.snapshot.routeConfig.path;
    this.roadmapId = this.route.snapshot.queryParamMap.get("id");
    // saves the search date
    this.dateSave = this.route.snapshot.queryParamMap.get("date") || null;
    if (this.dateSave) {
      this.date = this.dateSave;
    }

  }

  ngOnInit(): void {
    if (this.routePath == "debrief-list") {
      this.columns = [
        { prop: "nomd", name: "Chauffeur" },
        { prop: "nbPackages", name: "Tous" },
        { prop: "createdAtSearch", name: "Date" },
      ];
      if (!this.dateSave) {
        this.setDates();
      }

      this.dateForm = this.fb.group({
        date: this.date,
      });

      this.dateForm.valueChanges.subscribe((data) =>
        this.onDateFormValueChange(data)
      );

      this.countRoadmaps(this.date);

      this.getRoadmaps(null, null, null, null, null, this.date);
    } else {
      this.initiateData();
    }
  }

  // initiates ui in bilan and 'debrief détaillé' pages
  async initiateData() {
    this.totalEspece = 0;
    this.totalAutre = 0;
    this.total = 0;
    this.roadmap = await this.getRoadmap(this.roadmapId);

    for (let element of this.roadmap.packages) {
      const client = await this.getClientByPackageId(element._id);
      element.client = client;
      if (element.etat == "livré (espèce)") {
        console.log(typeof element.c_remboursement);

        this.totalEspece += parseInt(element.c_remboursement);
        console.log(this.totalEspece);
      } else if (element.etat == "livré (Chèque)") {
        this.totalAutre += parseInt(element.c_remboursement);
        console.log(this.totalAutre);
      }
    }
    this.total = this.totalEspece + this.totalAutre;
  }

  //get roadmap list
  getRoadmaps(
    limit?: any,
    page?: any,
    sortBy?: any,
    sort?: any,
    search?: any,
    date?: any
  ) {
    this.roadmapService
      .getRoadmaps(limit, page, sortBy, sort, search, date, date)
      .subscribe((data) => {
        this.rows = this.temp = data;
      });
  }

  //get one roadmap
  async getRoadmap(id) {
    return await this.roadmapService
      .getRoadmap(id)
      .pipe(
        map((data) => {
          return data[0];
        })
      )
      .toPromise();
  }

  getClientName(id) {
    this.clientService.getClient(id).subscribe((data) => {});
    // return await this.packageService
    //   .getPackageByCAB(cab)
    //   .pipe(
    //     map((data) => {
    //       if (data[0]) {
    //         return true;
    //       } else {
    //         return false;
    //       }
    //     })
    //   )
    //   .toPromise();
  }

  // count pickups
  countRoadmaps(date) {
    this.roadmapService.countRoadmaps(date, date).subscribe((data) => {
      this.count = data.count;
    });
  }

  get f() {
    return this.dateForm.controls;
  }

  setDates() {
    this.date = this.datePipe.transform(this.myDate, "yyyy-MM-dd");
  }

  // save changes in credentials
  private onDateFormValueChange(data: any): void {
    this.date = data.date;
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    this.getRoadmaps(this.currentPageLimit, 1, null, null, val, this.date);
  }

  // When number of displayed elements changes
  public onLimitChange(limit: any): void {
    this.changePageLimit(limit);
    this.table.limit = this.currentPageLimit;
    this.getRoadmaps(limit, this.currentPage);
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

  // Data sorting
  onSort(event) {
    this.getRoadmaps(
      this.currentPageLimit,
      event.page,
      event.sorts[0].prop,
      event.newValue
    );
  }

  // When page changes
  onFooterPage(event) {
    this.changePage(event.page);
    this.getRoadmaps(
      this.currentPageLimit,
      event.page,
      null,
      null,
      null,
      this.date
    );
  }

  changePage(page: any) {
    this.currentPage = parseInt(page, 10);
  }

  update() {
    var navigationExtras: NavigationExtras = {
      queryParams: {
        date: this.date,
      },
    };
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
      this.router.navigate(["/debrief-list"], navigationExtras);
  });
    // this.router.navigate(["/debrief-list"], navigationExtras);
    // this.getRoadmaps(null, null, null, null, null, this.date);
    // this.countRoadmaps(this.date);
  }

  public countEtat(row, etat) {
    var count = 0;
    row.packages?.forEach((element) => {
      if (element.etat === etat) {
        count++;
      }
    });
    return count;
  }

  bilan(row) {
    var navigationExtras: NavigationExtras = {
      queryParams: {
        id: row._id,
      },
    };
    this.router.navigate(["/debrief-bilan"], navigationExtras);
  }

  details(row) {
    var navigationExtras: NavigationExtras = {
      queryParams: {
        id: row._id,
      },
    };
    this.router.navigate(["/debrief-detaillé"], navigationExtras);
  }

  public logg(data) {
    console.log("data");
    console.log(data);
  }

  /*********************** BILAN ********************** */
  changeState(element: any, state: string) {
    this.packageService
      .updatePackageByCAB(element, { etat: state })
      .subscribe(async () => {
        //reset state for package in ui
        this.initiateData();
      });
  }

  async getClientByPackageId(id) {
    return await this.packageService
      .getPackage(id)
      .pipe(
        map((data) => {
          return data[0].nomc;
        })
      )
      .toPromise();
  }
  /*********************** BILAN ********************** */
}
