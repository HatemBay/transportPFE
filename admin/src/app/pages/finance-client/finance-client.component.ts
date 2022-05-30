import { DatePipe } from "@angular/common";
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { FeuilleRetourService } from "src/app/services/feuille-retour.service";
import { FournisseurService } from "src/app/services/fournisseur.service";
import { PackageService } from "src/app/services/package.service";
import { UserService } from "src/app/services/user.service";
import { VehiculeService } from "src/app/services/vehicule.service";

@Component({
  selector: "app-finance-client",
  templateUrl: "./finance-client.component.html",
  styleUrls: ["./finance-client.component.scss"],
})
export class FinanceClientComponent implements OnInit {
  @ViewChild(DatatableComponent) search: DatatableComponent;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild(alert) alert: any;
  @ViewChild("myEl") el: ElementRef;

  routePath: string;
  fournisseursForm: FormGroup;
  chauffeursForm: FormGroup;
  dateForm: FormGroup;
  today: string;
  startDate: string;
  myDate = new Date();

  temp: any = [];
  rows: any = [];
  public columns: Array<object>;
  count: any;
  chauffeurs: any = [];
  fournisseurs: any = [];
  vehicules: any = [];
  fournisseur: any = [];
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
  display: string = "default";
  selected: any = [];
  constructor(
    private fb: FormBuilder,
    private fournisseurService: FournisseurService,
    private datePipe: DatePipe,
    private vehiculeService: VehiculeService,
    private userService: UserService,
    private packageService: PackageService,
    private feuilleRetourService: FeuilleRetourService
  ) {}

  ngOnInit(): void {
    this.columns = [{ prop: "createdAtSearch", name: "Date" }];

    this.fournisseursForm = this.fb.group({
      fournisseurs: ["", Validators.required],
    });

    this.setDates();

    this.dateForm = this.fb.group({
      today: this.today,
      startDate: this.startDate,
    });

    this.dateForm.valueChanges.subscribe((data) =>
      this.onDateFormValueChange(data)
    );
  }

  //get packages from selected provider
  async getPackages() {
    this.display = "block";
    this.getPackagesByProvider(
      this.fournisseursForm.value.fournisseurs,
      this.currentPageLimit,
      1,
      null,
      null,
      null
    );
  }

  async getPackagesByProvider(
    id: any,
    limit?: any,
    page?: any,
    sortBy?: any,
    sort?: any,
    search?: any,
    startDate?: any,
    endDate?: any
  ) {
    this.packageService
      .getPackageByProvider(
        "finance-client",
        id,
        limit,
        page,
        sortBy,
        sort,
        search,
        startDate,
        endDate
      )
      .subscribe(async (data) => {
        var result: any = [];
        var packages: any = [];
        packages = data;
        for (let item of packages) {
          if (
            item.etat === "livré (espèce)" ||
            item.etat === "livré (chèque)"
          ) {
            result = [...result, item];
          }
        }

        this.rows = this.temp = result;
      });
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

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    console.log(val);

    this.getPackagesByProvider(
      this.fournisseursForm.value.fournisseurs,
      this.currentPageLimit,
      1,
      null,
      null,
      val
    );
  }

  // When number of displayed elements changes
  public onLimitChange(limit: any): void {
    this.changePageLimit(limit);
    this.table.limit = this.currentPageLimit;
    this.getPackagesByProvider(
      this.fournisseursForm.value.fournisseurs,
      limit,
      this.currentPage
    );
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
    // console.log(this.fournisseursForm.value.fournisseurs);
    this.getPackagesByProvider(
      this.fournisseursForm.value.fournisseurs,
      this.currentPageLimit,
      event.page,
      event.sorts[0].prop,
      event.newValue
    );
  }

  // checkbox selection
  onSelect(event) {
    // console.log("Select Event", event);
    // this.selected = event.selected;
    // if (this.selected.length > 0) {
    //   this.printable = true;
    // } else {
    //   this.printable = false;
    // }
    // console.log(this.selected[0]._id);
  }

  // When page changes
  onFooterPage(event) {
    this.changePage(event.page);
    this.getPackagesByProvider(
      this.fournisseursForm.value.fournisseurs,
      this.currentPageLimit,
      event.page
    );
  }

  changePage(page: any) {
    this.currentPage = parseInt(page, 10);
  }

  update() {
    //dates are set when the view is initiated so when table search is implemented it will use those values regardless of initiating date periods search
    //so we need to use a variable that checks if the time periods search has been initiated at least once
    // this.init = true;
    this.getPackagesByProvider(
      this.fournisseursForm.value.fournisseurs,
      null,
      null,
      null,
      null,
      null,
      this.startDate,
      this.today
    );
    // this.countPackages(this.isAllocated, this.startDate, this.today);
  }
}
