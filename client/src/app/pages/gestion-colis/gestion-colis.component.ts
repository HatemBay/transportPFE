import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { DatePipe } from "@angular/common";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Router, NavigationExtras } from "@angular/router";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { ClientService } from "src/app/services/client.service";
import { PackageService } from "src/app/services/package.service";

@Component({
  selector: "app-gestion-colis",
  templateUrl: "./gestion-colis.component.html",
  styleUrls: ["./gestion-colis.component.scss"],
})
export class GestionColisComponent implements OnInit {
  @ViewChild(DatatableComponent) search: DatatableComponent;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild(alert) alert: any;
  @ViewChild("myEl") el: ElementRef;

  myDate = new Date();
  today: string;
  startDate: string;
  dateD: string;
  dateF: Date;
  dateForm: FormGroup;
  val: string;

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

  etat = [
    { name: "Tous les colis", value: "", active: true },
    { name: "Collecté", value: "collecté", active: false },
    { name: "En cours", value: "en cours", active: false },
    { name: "Reporté", value: "reporté", active: false },
    { name: "Livré", value: "livré", active: false },
    { name: "Annulé", value: "annulé", active: false },
    { name: "Payé", value: "payé", active: false },
  ];
  temp: any = [];
  rows: any = [];
  selected: any = [];
  public columns: Array<object>;
  count: any;
  init: boolean = false;

  constructor(
    private fb: FormBuilder,
    private packageService: PackageService,
    private clientService: ClientService,
    private datePipe: DatePipe,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.columns = [
      { prop: "nomc", name: "Nom & Prénom" },
      { prop: "villec", name: "Ville" },
      { prop: "c_remboursement", name: "COD" },
    ];

    this.setDates();

    this.dateForm = this.fb.group({
      today: this.today,
      startDate: this.startDate,
    });

    this.dateForm.valueChanges.subscribe((data) =>
      this.onDateFormValueChange(data)
    );

    this.countPackages();

    this.getDataJson();
    // this.findAll();
  }

  // get data from backend
  getDataJson(
    limit?: any,
    page?: any,
    sortBy?: any,
    sort?: any,
    search?: any,
    etat?: any,
    startDate?: any,
    endDate?: any
  ) {
    // if date search is initialized
    if (this.init === true) {
      this.packageService
        .getFullPackages(
          null,
          limit,
          page,
          sortBy,
          sort,
          search,
          etat,
          startDate,
          endDate
        )
        .subscribe((data) => {
          this.rows = this.temp = data;
          for (const item of this.rows) {
            item.c_remboursement = parseFloat(
              item.c_remboursement.toString()
            ).toFixed(3);
            // console.log(item.c_remboursement);
          }
        });
    } else {
      this.packageService
        .getFullPackages(null, limit, page, sortBy, sort, search, etat)
        .subscribe((data) => {
          this.rows = this.temp = data;
          for (const item of this.rows) {
            item.c_remboursement = parseFloat(
              item.c_remboursement.toString()
            ).toFixed(3);
          }
        });
    }
  }

  // initiate the dates from last month to today
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

  // count packages depending on package state
  private countPackages(startDate?: any, endDate?: any) {
    var state = null;

    for (const element of this.etat) {
      if (element.active) {
        state = element.value;
      }
    }
    this.packageService
      .countAllPackages(state, startDate, endDate)
      .subscribe((res) => {
        this.count = res.count;
      });
  }

  // dynamic search (triggers after inserting 3 characters)
  updateFilter(event) {
    var state = null;

    for (const element of this.etat) {
      if (element.active) {
        state = element.value;
      }
    }
    if (event.target.value.length > 2) {
      this.val = event.target.value.toLowerCase();
      this.getDataJson(
        this.currentPageLimit,
        1,
        null,
        null,
        this.val,
        state,
        this.startDate,
        this.today
      );
    } else {
      this.getDataJson(
        this.currentPageLimit,
        1,
        null,
        null,
        null,
        state,
        this.startDate,
        this.today
      );
    }
  }

  // updates list based on table length
  public onLimitChange(limit: any): void {
    var state = null;

    for (const element of this.etat) {
      if (element.active) {
        state = element.value;
      }
    }
    this.changePageLimit(limit);
    this.table.limit = this.currentPageLimit;
    this.getDataJson(
      limit,
      1,
      null,
      null,
      this.val,
      state,
      this.startDate,
      this.today
    );
  }

  // changes number of elements to display
  private changePageLimit(limit: any): void {
    this.currentPageLimit = parseInt(limit, 10);
  }

  // elements sorting
  onSort(event) {
    var state = null;

    for (const element of this.etat) {
      if (element.active) {
        state = element.value;
      }
    }
    console.log(event);
    console.log(event.sorts[0].prop);
    this.getDataJson(
      this.currentPageLimit,
      event.page,
      event.sorts[0].prop,
      event.newValue,
      this.val,
      state,
      this.startDate,
      this.today
    );
  }

  // change data based on page selected
  onFooterPage(event) {
    var state = null;

    for (const element of this.etat) {
      if (element.active) {
        state = element.value;
      }
    }
    this.changePage(event.page);
    console.log(event.page);

    this.getDataJson(
      this.currentPageLimit,
      event.page,
      null,
      null,
      this.val,
      state,
      this.startDate,
      this.today
    );
  }

  // changes pages in footer
  changePage(page: any) {
    this.currentPage = parseInt(page, 10);
  }

  // delete package
  delete(data) {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce colis?")) {
      this.packageService.deletePackage(data._id).subscribe(() => {
        console.log("package deleted");
      });
      this.clientService.deleteClient(data.clientId).subscribe(() => {
        //TODO: compare the efficency of this method with making api calls (on large data)
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

  // redirect to a printable page
  print(data) {
    console.log(data.clientId);
    const ids = [data._id];
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

  // state filter
  searchValue(data) {
    for (let i = 0; i < this.etat.length; i++) {
      this.etat[i].active = false;
    }
    data.active = !data.active;
    console.log(data.active);

    this.getDataJson(
      this.currentPageLimit,
      1,
      null,
      null,
      this.val,
      data.value,
      this.startDate,
      this.today
    );
    this.countPackages();
  }

  update() {
    //dates are set when the view is initiated so when table search is implemented it will use those values regardless of initiating date periods search
    //so we need to use a variable that checks if the time periods search has been initiated at least once
    this.init = true;

    var state = null;

    for (const element of this.etat) {
      if (element.active) {
        state = element.value;
      }
    }
    this.getDataJson(
      null,
      null,
      null,
      null,
      this.val,
      state,
      this.startDate,
      this.today
    );

    this.countPackages(this.startDate, this.today);
  }
}
