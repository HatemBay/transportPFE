import { VehiculeService } from "src/app/services/vehicule.service";
import { map } from "rxjs/operators";
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, NavigationExtras, Router } from "@angular/router";
import { FournisseurService } from "src/app/services/fournisseur.service";
import { PackageService } from "src/app/services/package.service";
import { UserService } from "src/app/services/user.service";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { FeuilleRetourService } from "src/app/services/feuille-retour.service";

@Component({
  selector: "app-cb-feuille-retour",
  templateUrl: "./cb-feuille-retour.component.html",
  styleUrls: ["./cb-feuille-retour.component.scss"],
})
export class CbFeuilleRetourComponent implements OnInit {
  @ViewChild(DatatableComponent) search: DatatableComponent;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild(alert) alert: any;
  @ViewChild("myEl") el: ElementRef;

  routePath: string;
  fournisseursForm: FormGroup;
  chauffeursForm: FormGroup;

  temp: any = [];
  rows: any = [];
  public columns: Array<object>;
  count: any;
  chauffeurs: any = [];
  fournisseurs: any = [];
  vehicules: any = [];
  fournisseur: any = [];

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
  printable: boolean = false;
  success: boolean = false;
  val: string;

  constructor(
    private fb: FormBuilder,
    private fournisseurService: FournisseurService,
    private vehiculeService: VehiculeService,
    private userService: UserService,
    private packageService: PackageService,
    private feuilleRetourService: FeuilleRetourService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.routePath = this.route.snapshot.routeConfig.path;
  }

  ngOnInit(): void {
    if (this.routePath === "feuille-de-retour") {
      this.columns = [{ prop: "createdAtSearch", name: "Date" }];

      this.fournisseursForm = this.fb.group({
        fournisseurs: ["", Validators.required],
      });

      this.chauffeursForm = this.fb.group({
        driverId: ["", Validators.required],
        // TODO: to be added
        // vehicules: ["", Validators.required],
      });

      this.initiateData();
    } else {
      this.columns = [
        { prop: "feuilleRetourNb", name: "N° bon de sortie" },
        { prop: "nbPackages", name: "Nbre de colis" },
        { prop: "nomd", name: "Chauffeur" },
        { prop: "createdAtSearch", name: "Date" },
      ];

      this.getRoadmapData();
    }
  }

  getRoadmapData(
    limit?: any,
    page?: any,
    sortBy?: any,
    sort?: any,
    search?: any
  ) {
    this.feuilleRetourService
      .getFeuilleRetours(limit, page, sortBy, sort, search)
      .subscribe((data) => {
        this.rows = this.temp = data.data;
        this.count = data.length;
      });
  }

  updateFilterHistorique(event) {
    this.val = event.target.value.toLowerCase();

    this.getRoadmapData(this.currentPageLimit, 1, null, null, this.val);
  }

  onSortHistorique(event) {
    this.getRoadmapData(
      this.currentPageLimit,
      event.page,
      event.sorts[0].prop,
      event.newValue,
      this.val
    );
  }

  // When number of displayed elements changes
  public onLimitChangeHistorique(limit: any): void {
    this.changePageLimit(limit);
    this.table.limit = this.currentPageLimit;
    this.getRoadmapData(limit, null, null, null, this.val);
  }

  // When page changes
  onFooterPageHistorique(event) {
    this.changePage(event.page);
    this.getRoadmapData(
      this.currentPageLimit,
      event.page,
      null,
      null,
      this.val
    );
  }

  async initiateData() {
    this.fournisseurs = await this.getProviders();
    this.chauffeurs = await this.getDrivers();
    this.vehicules = await this.getVehicles();
  }

  get f() {
    return this.fournisseursForm.controls;
  }

  get g() {
    return this.chauffeursForm.controls;
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

  onSort(event) {
    // console.log(this.fournisseursForm.value.fournisseurs);
    this.getPackagesByProvider(
      this.fournisseursForm.value.fournisseurs,
      this.currentPageLimit,
      event.page,
      event.sorts[0].prop,
      event.newValue,
      this.val
    );
  }

  // When page changes
  onFooterPage(event) {
    this.changePage(event.page);
    this.getPackagesByProvider(
      this.fournisseursForm.value.fournisseurs,
      this.currentPageLimit,
      event.page,
      null,
      null,
      this.val
    );
  }

  changePage(page: any) {
    this.currentPage = parseInt(page, 10);
  }

  async getDrivers(): Promise<any> {
    return await this.userService
      .getUsersByRole("chauffeur")
      .pipe(
        map((data) => {
          return data;
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

  async getVehicles() {
    return await this.vehiculeService
      .getVehicules()
      .pipe(
        map((data) => {
          return data.data;
        })
      )
      .toPromise();
  }

  async getPackagesByProvider(
    id: any,
    limit?: any,
    page?: any,
    sortBy?: any,
    sort?: any,
    search?: any
  ) {
    this.packageService
      .getPackageByProvider(
        "feuille-de-retour",
        id,
        limit,
        page,
        sortBy,
        sort,
        search
      )
      .subscribe(async (data) => {
        var result: any = [];
        var packages: any = [];
        packages = data.data;
        for (let item of packages) {
          if (item.etat === "annulé") {
            result = [...result, item];
          }
        }

        this.rows = this.temp = result;
        this.count = data.length;
      });
  }

  // preserve the ui presenting selected elements after changing pages
  getId(row) {
    return row._id;
  }

  // checkbox selection
  onSelect(event) {
    // console.log("Select Event", event);
    this.selected = event.selected;
    if (this.selected.length > 0) {
      this.printable = true;
    } else {
      this.printable = false;
    }

    // console.log(this.selected[0]._id);
  }

  printNew() {
    console.log(this.g.driverId.value);

    this.feuilleRetourService
      .createFeuilleRetour({
        driverId: this.g.driverId.value,
        packages: this.selected,
      })
      .subscribe(
        () => {
          this.success = true;
        },
        (err) => {
          console.log(err);
        }
      );

    var CABs: Array<number> = [];
    for (var el of this.selected) {
      CABs.push(el.CAB);
    }

    // Create our query parameters object
    const queryParams: any = {};
    queryParams.CABs = JSON.stringify(CABs);
    var navigationExtras: NavigationExtras = {
      queryParams,
    };
    console.log(navigationExtras.queryParams);

    const url = this.router.serializeUrl(
      this.router.createUrlTree(["/imprimer-feuille-retour"], navigationExtras)
    );

    const WindowPrt = window.open(
      url,
      "_blank",
      "left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0"
    );

    WindowPrt.setTimeout(function () {
      WindowPrt.focus();
      WindowPrt.print();
      location.reload();
      // WindowPrt.close();
    }, 1000);
    this.getPackages();
  }

  // redirects to printable facture
  toFacture(row) {
    var CABs = [];
    console.log(row.packages);
    for (var el of row.packages) {
      CABs.push(el.CAB);
    }

    // Create our query parameters object
    const queryParams: any = {};
    queryParams.CABs = JSON.stringify(CABs);
    queryParams.type = "historique";
    queryParams.nb = row.feuilleRetourNb;
    var navigationExtras: NavigationExtras = {
      queryParams,
    };
    console.log(navigationExtras.queryParams);

    const url = this.router.serializeUrl(
      this.router.createUrlTree(["/imprimer-feuille-retour"], navigationExtras)
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
}
