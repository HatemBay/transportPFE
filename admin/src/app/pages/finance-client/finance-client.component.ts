import { DatePipe } from "@angular/common";
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
  ActivatedRoute,
  NavigationExtras,
  NavigationStart,
  Router,
} from "@angular/router";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { map } from "rxjs";
import { FinanceService } from "src/app/services/finance.service";
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
  rowsFinance: any = [];
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
  init: boolean = false;
  financeNb: number = 1;
  totalCOD: number = 0;
  totalFraisLivraison: number = 0;
  totalHorsFrais: number = 0;
  totalLivraison: number = 0;
  totalRetour: number = 0;
  date: any;
  display: string = "block";
  display2: string = "default";
  public currentPageLimit: number = 10;
  public currentPage: number = 1;

  public readonly pageLimitOptions = [
    { value: 5 },
    { value: 10 },
    { value: 25 },
    { value: 50 },
    { value: 100 },
  ];
  selected: any = [];
  val: string;

  constructor(
    private fb: FormBuilder,
    private fournisseurService: FournisseurService,
    private financeService: FinanceService,
    private datePipe: DatePipe,
    private router: Router,
    private route: ActivatedRoute,
    private packageService: PackageService
  ) {
    this.date = new Date();

    this.fourn = this.route.snapshot.queryParamMap.get("fournisseur") || null;
    this.toPrint = JSON.parse(this.route.snapshot.queryParamMap.get("toPrint")) || false;
  }

  ngOnInit(): void {
    // this.columns = [{ prop: "createdAtSearch", name: "Date" }];

    this.fournisseursForm = this.fb.group({
      fournisseurs: ["", Validators.required],
    });



    this.getLastFinanceNb();

    this.setDates();
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

  async getFinancesData(
    limit?: any,
    page?: any,
    sortBy?: any,
    sort?: any,
    search?: any,
    startDate?: any,
    endDate?: any
  ) {
    this.rowsFinance = await this.getFinances(
      limit,
      page,
      sortBy,
      sort,
      search,
      startDate,
      endDate
    );
  }

  async initiateData() {
    this.fournisseurs = await this.getProviders();
    if (this.fourn !== null) {
      this.packages = await this.getPackagesByProvider(
        this.fourn,
        50, //TODO: change
        1,
        null,
        null,
        null
      );
      this.fournisseur = await this.getProvider(this.fourn) || null;
      for (let pack of this.packages) {
        this.totalCOD += pack.c_remboursement;
      }

      var livré = [];
      var retourné = [];

      for (let pack of this.packages) {
        if (pack.etat === "livré (espèce)" || pack.etat === "livré (chèque)") {
          this.totalLivraison += this.fournisseur[0].fraisLivraison;
          livré = [...livré, pack];
        } else if (pack.etat === "retourné") {
          this.totalRetour += this.fournisseur[0].fraisRetour;
          retourné = [...retourné, pack];
        }
      }
      this.totalFraisLivraison = this.totalLivraison + this.totalRetour;
      this.totalHorsFrais = this.totalCOD - this.totalFraisLivraison;
      this.rows = livré;
      this.rows2 = retourné;

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
      .pipe(
        map((data) => {
          return data[0];
        })
      )
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

  async getFinances(
    limit?: any,
    page?: any,
    sortBy?: any,
    sort?: any,
    search?: any,
    startDate?: any,
    endDate?: any
  ) {
    return await this.financeService
      .getFinances(limit, page, sortBy, sort, search, startDate, endDate)
      .pipe(
        map((data) => {
          return data.data;
        })
      )
      .toPromise();
  }

  //get packages from selected provider
  async getPackages() {
    this.display = "default";
    this.display2 = "block";
    this.toPrint = true;
    this.initiateData();
    this.fourn = this.fournisseursForm.value.fournisseurs;
    var navigationExtras: NavigationExtras = {
      queryParams: {
        fournisseur: this.fournisseursForm.value.fournisseurs,
        toPrint: this.toPrint,
      },
    };
    // this.router.navigateByUrl("/", { skipLocationChange: true }).then(() => {
    this.router.navigate(["/finance-client-print"], navigationExtras);
    // });
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
          packages = data.data;
          for (let item of packages) {
            if (
              item.etat === "livré (espèce)" ||
              item.etat === "livré (chèque)" ||
              item.etat === "retourné"
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

  // save changes in credentials
  private onDateFormValueChange(data: any): void {
    this.today = data.today;
    this.startDate = data.startDate;
  }

  updateFilter(event) {
    var startDate = null;
    var endDate = null;
    if (this.init === true) {
      startDate = this.startDate;
      endDate = this.today;
    }
    this.val = event.target.value.toLowerCase();

    this.getFinancesData(
      this.currentPageLimit,
      1,
      null,
      null,
      this.val,
      startDate,
      endDate
    );
  }

  // When number of displayed elements changes
  public onLimitChange(limit: any): void {
    var startDate = null;
    var endDate = null;
    if (this.init === true) {
      startDate = this.startDate;
      endDate = this.today;
    }
    this.changePageLimit(limit);
    this.table.limit = this.currentPageLimit;
    this.getFinancesData(limit, null, null, null, this.val, startDate, endDate);
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
    if (this.init) {
      this.getFinancesData(
        this.currentPageLimit,
        event.page,
        event.sorts[0].prop,
        event.newValue,
        this.val,
        this.startDate,
        this.today
      );
    } else {
      this.getFinancesData(
        this.currentPageLimit,
        event.page,
        event.sorts[0].prop,
        event.newValue,
        this.val
      );
    }
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
    this.getFinancesData(
      this.currentPageLimit,
      event.page,
      null,
      null,
      this.val,
      startDate,
      endDate
    );
  }

  changePage(page: any) {
    this.currentPage = parseInt(page, 10);
  }

  update() {
    //dates are set when the view is initiated so when table search is implemented it will use those values regardless of initiating date periods search
    //so we need to use a variable that checks if the time periods search has been initiated at least once
    this.init = true;
    this.getFinancesData(
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

  // redirects to printable facture
  toFacture(row) {
    var CABs = [];
    for (var el of row.packages) {
      CABs.push(el.CAB);
    }

    // Create our query parameters object
    const queryParams: any = {};
    queryParams.CABs = JSON.stringify(CABs);
    queryParams.type = "historique";
    queryParams.nb = row.financeNb;
    queryParams.fournisseurId = row.fournisseurId;
    queryParams.financeId = row._id;
    var navigationExtras: NavigationExtras = {
      queryParams,
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
    }, 2000);
  }

  printNewFinance() {
    this.financeService
      .createFinance({
        fournisseurId: this.f.fournisseurs.value,
        fraisLivraison: this.totalLivraison,
        fraisRetour: this.totalRetour,
        totalCOD: this.totalCOD,
        totalFraisLivraison: this.totalFraisLivraison,
        totalHorsFrais: this.totalHorsFrais,
        packages: this.packages,
      })
      .subscribe(() => {
        this.success = true;
      });

    var CABs: Array<number> = [];
    for (var el of this.packages) {
      CABs.push(el.CAB);
    }

    // Create our query parameters object
    const queryParams: any = {};
    queryParams.type = "new";
    queryParams.CABs = JSON.stringify(CABs);
    queryParams.fournisseurId = this.f.fournisseurs.value;
    const frais = {
      fraisLivraison: this.totalLivraison,
      fraisRetour: this.totalRetour,
      totalCOD: this.totalCOD,
      totalFraisLivraison: this.totalFraisLivraison,
      totalHorsFrais: this.totalHorsFrais,
    };
    queryParams.frais = JSON.stringify(frais);

    var navigationExtras: NavigationExtras = {
      queryParams,
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

    this.router.navigate(["/finance-client"]);
    location.reload();
  }

  getLastFinanceNb() {
    this.financeService.getLastFinanceNb().subscribe((data) => {
      this.financeNb = data;
    });
  }
}
