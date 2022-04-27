import { DatePipe } from "@angular/common";
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { ClientService } from "src/app/services/client.service";
import { PackageService } from "src/app/services/package.service";

@Component({
  selector: "app-cb-ramassage",
  templateUrl: "./cb-ramassage.component.html",
  styleUrls: ["./cb-ramassage.component.scss"],
})
export class CbRamassageComponent implements OnInit {
  @ViewChild(DatatableComponent) search: DatatableComponent;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild(alert) alert: any;
  @ViewChild("myEl") el: ElementRef;

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
  slice: any = [];
  selected: any = [];
  public columns: Array<object>;
  count: any;
  init: boolean = false;
  referenceForm: any;

  constructor(
    private fb: FormBuilder,
    private packageService: PackageService,
    private clientService: ClientService,
    private datePipe: DatePipe,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.columns = [
      { prop: "villec", name: "Ville" },
      { prop: "delegationc", name: "Délegation" },
      { prop: "adressec", name: "Adresse" },
      { prop: "c_remboursement", name: "COD" },
    ];

    this.referenceForm = this.fb.group({
      reference: ["", Validators.required],
    });
    this.getDataJson();
  }

  get f() {
    return this.referenceForm.controls;
  }

  // get data from backend
  getDataJson(limit?: any, page?: any, sortBy?: any, sort?: any, search?: any, reference?: any) {
    this.packageService
      .getFullPackages(limit, page, sortBy, sort, search, null, null, reference)
      .subscribe((data) => {
        this.rows = this.temp = data;
        for (const item of this.rows) {
          item.c_remboursement = parseFloat(
            item.c_remboursement.toString()
          ).toFixed(3);
          // console.log(item.c_remboursement);
        }
      });
  }

  // Data sorting
  onSort(event) {
    this.getDataJson(
      this.currentPageLimit,
      event.page,
      event.sorts[0].prop,
      event.newValue,
      null
    );
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    this.getDataJson(this.currentPageLimit, 1, null, null, val);
  }

  // When number of displayed elements changes
  public onLimitChange(limit: any): void {
    this.changePageLimit(limit);
    this.table.limit = this.currentPageLimit;
    this.getDataJson(limit, this.currentPage, null, null, null);
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

  public submitRef(event) {
    if (event.keyCode === 13) {
      alert('you just pressed the enter key');
      // rest of your code
    }
  }
}
