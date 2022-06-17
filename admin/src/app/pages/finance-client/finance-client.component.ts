import { DatePipe } from "@angular/common";
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, NavigationExtras, Router } from "@angular/router";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { map } from "rxjs";
import { FournisseurService } from "src/app/services/fournisseur.service";
import { PackageService } from "src/app/services/package.service";

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
  rows2: any = [];
  public columns: Array<object>;
  count: any;
  chauffeurs: any = [];
  fournisseurs: any = [];
  vehicules: any = [];
  fournisseur: any = [];
  fourn: any = [];
  packages: any = [];
  success: boolean = false;
  toPrint: boolean = false;

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
  val: string;

  constructor(
    private fb: FormBuilder,
    private fournisseurService: FournisseurService,
    private datePipe: DatePipe,
    private router: Router,
    private route: ActivatedRoute,
    private packageService: PackageService
  ) {
    this.fourn = this.route.snapshot.queryParamMap.get("fournisseur") || null;
    // console.log(JSON.parse(this.fourn));
  }

  ngOnInit(): void {
    this.columns = [{ prop: "createdAtSearch", name: "Date" }];

    this.fournisseursForm = this.fb.group({
      fournisseurs: ["", Validators.required],
    });

    this.initiateData();

    this.dateForm = this.fb.group({
      today: this.today,
      startDate: this.startDate,
    });

    this.dateForm.valueChanges.subscribe((data) =>
      this.onDateFormValueChange(data)
    );
  }

  get f() {
    return this.fournisseursForm.controls;
  }

  async initiateData() {
    this.setDates();
    this.fournisseurs = await this.getProviders();
    if (this.fourn !== null) {
      this.packages = await this.getPackagesByProvider(
        this.fourn,
        50,
        1,
        null,
        null,
        null
      );
      this.fournisseur = await this.getProvider(this.fourn);
      console.log("slm");

      console.log(this.packages);

      var livré = [];
      var annulé = [];
      for (let pack of this.packages) {
        if (pack.etat === "livré (espèce)" || pack.etat === "livré (chèque)") {
          livré = [...livré, pack];
        } else if (
          pack.etat === "annulé" //TODO: to be changed to 'retourné à l'expéditeur
        ) {
          annulé = [...annulé, pack];
        }
      }
      this.rows = livré;
      this.rows2 = annulé;
      // console.log(this.rows);
      // console.log(this.rows2);

      this.fournisseursForm.patchValue({ fournisseurs: this.fourn });
      this.toPrint = true;
    }
    // this.getPackagesByProvider(
    //   this.fournisseurs[0]._id,
    //   this.currentPageLimit,
    //   1,
    //   null,
    //   null,
    //   null
    // );
  }
  async getProvider(dournisseurId: string) {
    return await this.fournisseurService
      .getFournisseur(dournisseurId)
      .toPromise();
  }
  async getProviders() {
    return await this.fournisseurService
      .getFournisseurs()
      .pipe(
        map((data) => {
          return data.data;
        })
      )
      .toPromise();
  }

  //get packages from selected provider
  async getPackages() {
    this.toPrint = true;
    var navigationExtras: NavigationExtras = {
      queryParams: {
        fournisseur: this.fournisseursForm.value.fournisseurs,
      },
    };
    this.router.navigateByUrl("/", { skipLocationChange: true }).then(() => {
      this.router.navigate(["/finance-client"], navigationExtras);
    });
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
    return await this.packageService
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
      .pipe(
        map(async (data) => {
          var result: any = [];
          var packages: any = [];
          packages = data;
          for (let item of packages) {
            if (
              item.etat === "livré (espèce)" ||
              item.etat === "livré (chèque)" ||
              item.etat === "annulé" //TODO: to be changed to 'retourné à l'expéditeur
            ) {
              result = [...result, item];
            }
          }
          return result;
        })
      )
      .toPromise();
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

  print() {
    var navigationExtras: NavigationExtras = {
      queryParams: {
        fournisseur: this.fourn,
      },
    };

    const url = this.router.serializeUrl(
      this.router.createUrlTree(["/imprimer-finance"], navigationExtras)
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

  // save changes in credentials
  private onDateFormValueChange(data: any): void {
    this.today = data.today;
    this.startDate = data.startDate;
  }

  updateFilter(event) {
    this.val = event.target.value.toLowerCase();

    this.getPackagesByProvider(
      this.fournisseursForm.value.fournisseurs,
      this.currentPageLimit,
      1,
      null,
      null,
      this.val
    );
  }

  // When number of displayed elements changes
  public onLimitChange(limit: any): void {
    this.changePageLimit(limit);
    this.table.limit = this.currentPageLimit;
    this.getPackagesByProvider(
      this.fournisseursForm.value.fournisseurs,
      limit,
      null,
      null,
      null,
      this.val
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
      this.val,
      this.startDate,
      this.today
    );
    // this.countPackages(this.isAllocated, this.startDate, this.today);
  }
}
