import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { AuthenticationService } from "src/app/services/authentication.service";
import { PackageService } from "src/app/services/package.service";

@Component({
  selector: "app-cb-collecte",
  templateUrl: "./cb-collecte.component.html",
  styleUrls: ["./cb-collecte.component.scss"],
})
export class CbCollecteComponent implements OnInit {
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
  references: Array<number> = [];
  public columns: Array<object>;
  count: any;
  init: boolean = false;
  referenceForm: any;
  val: string;

  constructor(
    private fb: FormBuilder,
    private packageService: PackageService,
    private authService: AuthenticationService,
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

    this.getDataJson(null, null, null, null, null, this.references);
  }

  get f() {
    return this.referenceForm.controls;
  }

  // get data from backend
  getDataJson(
    limit?: any,
    page?: any,
    sortBy?: any,
    sort?: any,
    search?: any,
    reference?: any
  ) {
    this.packageService
      .getFullPackages(limit, page, sortBy, sort, search, null, null, reference)
      .subscribe((data) => {
        const len = this.rows.length;
        this.rows = this.temp = data;
        if (this.rows.length === len) this.references.splice(-1);
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
    this.val = event.target.value.toLowerCase();
    this.getDataJson(this.currentPageLimit, 1, null, null, this.val);
  }

  // When number of displayed elements changes
  public onLimitChange(limit: any): void {
    this.changePageLimit(limit);
    this.table.limit = this.currentPageLimit;
    this.getDataJson(limit, 1, null, null, this.val);
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
    // if enter is pressed
    if (event.keyCode === 13) {
      // alert('you just pressed the enter key');
      if (this.references.indexOf(this.f.reference.value) !== -1) {
        alert(this.f.reference.value + ": colis existe déjà !!!");
        return this.f.reference.setValue("");
      }
      this.references.push(this.f.reference.value);
      this.getDataJson(null, null, null, null, this.val, this.references);
      this.f.reference.setValue("");
    }
  }

  public changeState() {
    this.references.forEach((element) => {
      this.packageService
        .updatePackageByCAB(element, { etat: "collecté", userId: this.authService.getUserDetails()._id }) //* userId has no use for now
        .subscribe(() => {
          // clear references
          this.references = [];
          this.getDataJson(null, null, null, null, null, this.references);
        });
    });
  }
}
