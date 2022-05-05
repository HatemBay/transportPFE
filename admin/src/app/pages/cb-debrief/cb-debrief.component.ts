import { DatePipe } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { PickupService } from "src/app/services/pickup.service";

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

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private pickupService: PickupService
  ) {}

  ngOnInit(): void {
    this.columns = [
      { prop: "nomd", name: "Chauffeur" },
      { prop: "nbPackages", name: "Tous" },
      { prop: "createdAtSearch", name: "Date" },
    ];
    this.setDates();

    this.dateForm = this.fb.group({
      date: this.date,
    });

    this.dateForm.valueChanges.subscribe((data) =>
      this.onDateFormValueChange(data)
    );

    this.countPickups(this.date);

    this.getDataJson(null, null, null, null, null, this.date);
  }

  getDataJson(
    limit?: any,
    page?: any,
    sortBy?: any,
    sort?: any,
    search?: any,
    date?: any
  ) {
    this.pickupService
      .getPickups("true", limit, page, sortBy, sort, search, date, date)
      .subscribe((data) => {
        this.rows = this.temp = data;
      });
  }

  // count pickups
  countPickups(date) {
    this.pickupService.countPickups("true", date, date).subscribe((data) => {
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
    this.getDataJson(this.currentPageLimit, 1, null, null, val, this.date);
  }

  // When number of displayed elements changes
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

  // Data sorting
  onSort(event) {
    this.getDataJson(
      this.currentPageLimit,
      event.page,
      event.sorts[0].prop,
      event.newValue
    );
  }

  // When page changes
  onFooterPage(event) {
    this.changePage(event.page);
    this.getDataJson(
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
    this.getDataJson(null, null, null, null, null, this.date);
    this.countPickups(this.date);
  }

  public countEtat(row, etat) {
    var count = 0;
    row.packages.forEach((element) => {
      if (element.etat === etat) {
        count++;
      }
    });
    return count;
  }
}
