import { map } from "rxjs/operators";
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { FournisseurService } from "src/app/services/fournisseur.service";
import { PackageService } from "src/app/services/package.service";
import { UserService } from "src/app/services/user.service";
import { DatatableComponent } from "@swimlane/ngx-datatable";

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

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private fournisseurService: FournisseurService,
    private packageService: PackageService
  ) {
    this.routePath = this.route.snapshot.routeConfig.path;
  }

  ngOnInit(): void {
    if (this.routePath === "feuille-de-retour") {
      this.columns = [
        { prop: "CAB", name: "Code à barre" },
        { prop: "nbPackages", name: "Etat" },
        { prop: "nomd", name: "Nom & prénom" },
        { prop: "villec", name: "Ville" },
        { prop: "c_remboursement", name: "COD" },
        { prop: "createdAtSearch", name: "Date" },
      ];

      this.fournisseursForm = this.fb.group({
        fournisseurs: ["", Validators.required],
      });

      this.chauffeursForm = this.fb.group({
        chauffeurs: ["", Validators.required],
      });
      this.initiateData();
    } else {
      this.columns = [
        { prop: "roadmapNb", name: "N° bon de sortie" },
        { prop: "nbPackages", name: "Nbre de colis" },
        { prop: "nomd", name: "Chauffeur" },
        { prop: "createdAtSearch", name: "Date" },
      ];

      // this.countRoadmaps();
      // this.getRoadmapData();
    }
  }

  async initiateData() {
    this.fournisseurs = await this.getProviders();
    console.log(this.fournisseurs);
    // this.getPackagesByProvider(
    //   this.fournisseurs[0]._id,
    //   this.currentPageLimit,
    //   1,
    //   null,
    //   null,
    //   null
    // );
  }

  get f() {
    return this.fournisseursForm.controls;
  }

  //get packages from selected provider
  getPackages() {
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
    const val = event.target.value.toLowerCase();
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
    console.log(this.fournisseursForm.value.fournisseurs);
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

  async getProviders() {
    return await this.fournisseurService
      .getFournisseurs()
      .pipe(
        map((data) => {
          return data;
        })
      )
      .toPromise();
  }

  getPackagesByProvider(
    id: any,
    limit?: any,
    page?: any,
    sortBy?: any,
    sort?: any,
    search?: any
  ) {
    this.packageService
      .getPackageByProvider(id, limit, page, sortBy, sort, search)
      .subscribe((data) => {
        var result: any = [];
        var packages: any = [];
        packages = data;
        for (let item of packages) {
          if (item.etat === "annulé" || item.etat === "reporté") {
            result = [...result, item];
          }
        }
        console.log(result);

        this.rows = this.temp = result;
      });
  }
}
