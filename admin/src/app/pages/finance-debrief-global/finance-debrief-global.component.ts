import { PackageService } from "src/app/services/package.service";
import { DatePipe } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { RoadmapService } from "src/app/services/roadmap.service";
import { map } from "rxjs";
import { UserService } from "src/app/services/user.service";
import { NavigationExtras, Router } from "@angular/router";

@Component({
  selector: "app-finance-debrief-global",
  templateUrl: "./finance-debrief-global.component.html",
  styleUrls: ["./finance-debrief-global.component.scss"],
})
export class FinanceDebriefGlobalComponent implements OnInit {
  @ViewChild(DatatableComponent) search: DatatableComponent;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild(DatatableComponent) table2: DatatableComponent;
  @ViewChild(alert) alert: any;

  temp: any = [];
  total: any = {
    nbPackages: 0,
    livréEspece: 0,
    livréCheque: 0,
    reporté: 0,
    annulé: 0,
  };
  rows: any = [];
  rows2: any = [];
  roadmaps: any = {};
  drivers: any = {};
  count: number;
  public columns: Array<object>;
  public columns2: Array<object>;
  public currentPageLimit: number = 10;
  public currentPage: number = 1;
  val: string = "";

  public readonly pageLimitOptions = [
    { value: 5 },
    { value: 10 },
    { value: 25 },
    { value: 50 },
    { value: 100 },
  ];

  myDate = new Date();
  today: string;
  startDate: string;
  dateForm: FormGroup;

  display: string = "default";

  constructor(
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private roadmapService: RoadmapService,
    private userService: UserService,
    private packageService: PackageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.columns = [
      { prop: "nomd", name: "Chauffeur" },
      { prop: "nbPackages", name: "Tous" },
      { prop: "createdAtSearch", name: "Date" },
    ];

    this.columns2 = [
      { prop: "tout", name: "Chauffeur" },
      { prop: "nbPackages", name: "Tous" },
      { prop: "createdAtSearch", name: "Date" },
    ];

    this.setDates();

    this.dateForm = this.fb.group({
      today: this.today,
      startDate: this.startDate,
    });

    this.dateForm.valueChanges.subscribe((data) =>
      this.onDateFormValueChange(data)
    );
  }

  // initiate our dates
  public setDates() {
    this.today = this.datePipe.transform(this.myDate, "yyyy-MM-dd");
    const thisDate = this.myDate.getDate();
    // this.myDate.setDate(this.myDate.getMonth() - 2);
    this.myDate.setMonth(this.myDate.getMonth() - 1);
    this.myDate.setDate(thisDate);

    this.startDate = this.datePipe.transform(this.myDate, "yyyy-MM-dd");
  }

  // save changes in credentials
  private onDateFormValueChange(data: any): void {
    this.today = data.today;
    this.startDate = data.startDate;
  }

  async getDrivers(startDate, today) {
    this.drivers = await this.userService
      .getUsersByRole("chauffeur")
      .toPromise();
    console.log(this.drivers);
  }

  async countPackages(etat: any, startDate: any, today: any, driverId: any) {
    return await this.packageService
      .countAllPackagesAdmin(etat, startDate, today, driverId)
      .pipe(
        map((data) => {
          return data.count;
        })
      )
      .toPromise();
  }

  async rowData() {
    var res = [];
    for await (let driver of this.drivers) {
      var row: any = {
        driverId: null,
        nomd: "",
        nbPackages: 0,
        livréEspece: 0,
        livréCheque: 0,
        reporté: 0,
        annulé: 0,
      };
      console.log(driver.nom);

      row.nomd = driver.nom;
      row.driverId = driver._id;
      console.log(row.nomd);
      var roadmaps: any = await this.getRoadmaps(
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        driver.nom,
        "nl"
      );
      console.log("roadmaps");
      console.log(roadmaps);

      for (let roadmap of roadmaps) {
        row.nbPackages += roadmap.nbPackages;
        for (let pack of roadmap.packages) {
          if (pack.etat == "livré (espèce)") {
            row.livréEspece += 1;
          } else if (pack.etat == "livré (chèque)") {
            row.livréCheque += 1;
          } else if (pack.etat == "reporté") {
            row.reporté += 1;
          } else if (pack.etat == "annulé") {
            row.annulé += 1;
          }
        }
      }
      // row.nbPackages = roadmap.;

      // row.nbPackages = await this.countPackages(
      //   null,
      //   this.startDate,
      //   this.today,
      //   driver._id
      // );
      // row.livréEspece = await this.countPackages(
      //   "livré (espèce)",
      //   this.startDate,
      //   this.today,
      //   driver._id
      // );
      // row.livréCheque = await this.countPackages(
      //   "livré (chèque)",
      //   this.startDate,
      //   this.today,
      //   driver._id
      // );
      // row.reporté = await this.countPackages(
      //   "reporté",
      //   this.startDate,
      //   this.today,
      //   driver._id
      // );
      // row.annulé = await this.countPackages(
      //   "annulé",
      //   this.startDate,
      //   this.today,
      //   driver._id
      // );
      res.push(row);
    }

    return res;
  }

  //shows debrief
  async update(
    limit: number,
    page: number,
    sortBy: string,
    sort: string,
    search: string,
    startDate: string,
    today: string
  ) {
    this.display = "block";

    this.total = {
      nbPackages: 0,
      livréEspece: 0,
      livréCheque: 0,
      reporté: 0,
      annulé: 0,
    };

    // this.getRoadmaps();
    // this.rows = await this.getRoadmaps(
    //   limit,
    //   page,
    //   sortBy,
    //   sort,
    //   search,
    //   startDate,
    //   today
    // );

    await this.getDrivers(startDate, today);

    this.rows = await this.rowData();

    this.count = this.drivers.length + 1;

    for (let row of this.rows) {
      this.total.nbPackages += row.nbPackages;
      this.total.livréEspece += row.livréEspece;
      this.total.livréCheque += row.livréCheque;
      this.total.reporté += row.reporté;
      this.total.annulé += row.annulé;

      // for (let pack of row.packages) {
      //   if (pack.etat === "livré (espèce)") {
      //     this.total.livréEspece++;
      //   }
      //   if (pack.etat === "livré (chèque)") {
      //     this.total.livréCheque++;
      //   }
      //   if (pack.etat === "reporté") {
      //     this.total.livréCheque++;
      //   }
      //   if (pack.etat === "annulé") {
      //     this.total.annulé++;
      //   }
      // }
    }
    console.log(this.rows);
    await this.rows.unshift(this.total);
    console.log(this.rows);
    // this.rows = [...this.total, this.rows];
  }

  //get roadmap list (promise)
  async getRoadmaps(
    limit: number,
    page: number,
    sortBy: string,
    sort: string,
    search: string,
    startDate: string,
    today: string,
    driver?: any,
    noLimit?: any
  ) {
    return await this.roadmapService
      .getRoadmaps(
        limit,
        page,
        sortBy,
        sort,
        search,
        startDate,
        today,
        driver,
        noLimit
      )
      .pipe(
        map((data) => {
          return data.data;
        })
      )
      .toPromise();
  }

  //get roadmap list
  // getRoadmaps(
  //   limit?: any,
  //   page?: any,
  //   sortBy?: any,
  //   sort?: any,
  //   search?: any,
  //   startDate?: any,
  //   today?: any
  // ) {
  //   this.roadmapService
  //     .getRoadmaps(limit, page, sortBy, sort, search, startDate, today)
  //     .subscribe((data) => {
  //       this.rows = this.temp = data;
  //     });
  // }

  public countEtat(row, etat) {
    var count = 0;
    row.packages?.forEach((element) => {
      if (element.etat === etat) {
        count++;
      }
    });
    return count;
  }

  details(row) {
    var navigationExtras: NavigationExtras = {
      queryParams: {
        startDate: this.startDate,
        today: this.today,
        driver: row.nomd,
        driverId: row.driverId,
      },
    };
    this.router.navigate(["/debrief-detail"], navigationExtras);
  }

  // ********* ngx datatable *********

  async updateFilter(event) {
    this.val = event.target.value.toLowerCase();
    await this.update(
      this.currentPageLimit,
      1,
      null,
      null,
      this.val,
      this.startDate,
      this.today
    );
  }

  // When number of displayed elements changes
  public async onLimitChange(limit: any): Promise<void> {
    this.changePageLimit(limit);
    this.table.limit = this.currentPageLimit + 1;
    await this.update(
      limit,
      1,
      null,
      null,
      this.val,
      this.startDate,
      this.today
    );

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
  async onSort(event) {
    await this.update(
      this.currentPageLimit,
      event.page,
      event.sorts[0].prop,
      event.newValue,
      this.val,
      this.startDate,
      this.today
    );
  }

  // When page changes
  async onFooterPage(event) {
    this.changePage(event.page);
    await this.update(
      this.currentPageLimit,
      event.page,
      null,
      null,
      this.val,
      this.startDate,
      this.today
    );
  }

  changePage(page: any) {
    this.currentPage = parseInt(page, 10);
  }

  getRowClass(row) {
    return { "important-row": !row.nomd };
  }
}
