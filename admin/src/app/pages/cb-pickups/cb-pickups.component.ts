import { DatePipe } from "@angular/common";
import {
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, NavigationExtras, Router } from "@angular/router";
import { NgbModal, NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { PickupService } from "src/app/services/pickup.service";
import { UserService } from "src/app/services/user.service";

@Component({
  selector: "app-cb-pickups",
  templateUrl: "./cb-pickups.component.html",
  styleUrls: ["./cb-pickups.component.scss"],
})
export class CbPickupsComponent implements OnInit {
  @ViewChild(DatatableComponent) search: DatatableComponent;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild(alert) alert: any;
  @ViewChild("myEl") el: ElementRef;

  myDate = new Date();
  today: string;
  startDate: string;
  dateForm: FormGroup;
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
  pickupForm: FormGroup;
  error: any = "none";
  chauffeurs: any;
  init: boolean = false;
  isAllocated: string = "false";
  routePath: string;
  constructor(
    private fb: FormBuilder,
    private pickupService: PickupService,
    private userService: UserService,
    public modalService: NgbModal,
    public activeModal: NgbActiveModal,
    private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe
  ) {
    this.routePath = this.route.snapshot.routeConfig.path;
  }

  ngOnInit(): void {
    this.columns = [
      { prop: "nbPackages", name: "Nbre de colis" },
      { prop: "createdAtSearch", name: "Date" },
    ];
    this.pickupForm = this.fb.group({
      driverId: ["", Validators.required],
    });

    this.countPickups();
    this.getChauffeurs();

    if (this.routePath == "pickup") {
      this.getDataJson(this.isAllocated);
    } else {
      this.isAllocated = "true";
      this.setDates();

      this.dateForm = this.fb.group({
        today: this.today,
        startDate: this.startDate,
      });

      this.dateForm.valueChanges.subscribe((data) =>
        this.onDateFormValueChange(data)
      );
      this.getDataJson(this.isAllocated);
    }
  }

  get f() {
    return this.pickupForm.controls;
  }

  // get data from backend
  getDataJson(
    isAllocated?: any,
    limit?: any,
    page?: any,
    sortBy?: any,
    sort?: any,
    search?: any,
    startDate?: any,
    endDate?: any
  ) {
    if (this.init === false) {
      startDate = null;
      endDate = null;
    }
    this.pickupService
      .getPickups(
        isAllocated,
        limit,
        page,
        sortBy,
        sort,
        search,
        startDate,
        endDate
      )
      .subscribe((data) => {
        this.rows = this.temp = data;
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

  // get drivers
  getChauffeurs() {
    this.userService.getUsersByRole('chauffeur').subscribe((data) => {
      this.chauffeurs = data;
    });
  }

  // count pickups
  countPickups(isAllocated?, startDate?, endDate?) {
    this.pickupService.countPickups(isAllocated, startDate, endDate).subscribe((data) => {
      this.count = data.count;
    });
  }

  updateFilter(event) {
    var startDate = null;
    var endDate = null;
    if (this.init === true) {
      startDate = this.startDate;
      endDate = this.today;
    }
    var val = null;
    if (event.target.value.length > 2) val = event.target.value.toLowerCase();
    this.getDataJson(
      this.isAllocated,
      this.currentPageLimit,
      1,
      null,
      null,
      val,
      startDate,
      endDate
    );
  }

  // When number of displayed elements changes
  public onLimitChange(limit: any): void {
    this.changePageLimit(limit);
    this.table.limit = this.currentPageLimit;
    this.getDataJson(this.isAllocated, limit);
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
      this.isAllocated,
      this.currentPageLimit,
      event.page,
      event.sorts[0].prop,
      event.newValue
    );
  }

  // When page changes
  onFooterPage(event) {
    var startDate = null;
    var endDate = null;
    if (this.init === true) {
      startDate = this.startDate;
      endDate = this.today;
    }
    this.changePage(event.page);
    this.getDataJson(
      this.isAllocated,
      this.currentPageLimit,
      event.page,
      null,
      null,
      null,
      startDate,
      endDate
    );
  }

  changePage(page: any) {
    this.currentPage = parseInt(page, 10);
  }

  // allocate driver to pickup
  allocateDriver(row) {
    // console.log(row._id);
    this.pickupService
      .updatePickup(row._id, this.pickupForm.value)
      .subscribe((data) => {
        this.getDataJson(this.isAllocated);
        this.success = true;
      });
  }

  // redirects to printable facture for pickup
  toFacture(row) {
    var ids = [];
    console.log(row.packages);
    for (var el of row.packages) {
      ids.push(el);
    }

    // Create our query parameters object
    const queryParams: any = {};
    queryParams.packages = JSON.stringify(ids);
    queryParams.id = row._id;
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
    }, 2000);
  }

  update() {
    //dates are set when the view is initiated so when table search is implemented it will use those values regardless of initiating date periods search
    //so we need to use a variable that checks if the time periods search has been initiated at least once
    this.init = true;
    this.getDataJson(
      this.isAllocated,
      null,
      null,
      null,
      null,
      null,
      this.startDate,
      this.today
    );
    this.countPickups(this.isAllocated, this.startDate, this.today);
  }
}
