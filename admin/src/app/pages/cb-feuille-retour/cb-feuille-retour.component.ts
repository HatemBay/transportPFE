import { VehiculeService } from "src/app/services/vehicule.service";
import { map } from "rxjs/operators";
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
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

  constructor(
    private fb: FormBuilder,
    private fournisseurService: FournisseurService,
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

    this.chauffeursForm = this.fb.group({
      driverId: ["", Validators.required],
      // TODO: to be added
      // vehicules: ["", Validators.required],
    });

    this.initiateData();
  }

  async initiateData() {
    this.fournisseurs = await this.getProviders();
    this.chauffeurs = await this.getDrivers();
    this.vehicules = await this.getVehicles();
    console.log(this.fournisseurs);
    console.log(this.chauffeurs);
    console.log(this.vehicules);
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
    this.selected = event.selected;
    if (this.selected.length > 0) {
      this.printable = true;
    } else {
      this.printable = false;
    }

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

  async getDrivers(): Promise<any> {
    return await this.userService.getUsersByRole("chauffeur").toPromise();
  }

  async getProviders() {
    return await this.fournisseurService.getFournisseurs().toPromise();
  }

  async getVehicles() {
    return await this.vehiculeService.getVehicules().toPromise();
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
      .getPackageByProvider('feuille-de-retour', id, limit, page, sortBy, sort, search)
      .subscribe(async (data) => {
        var result: any = [];
        var packages: any = [];
        console.log('1');
        console.log(result);
        packages = data;
        for (let item of packages) {
          if (item.etat === "annulé" || item.etat === "reporté") {
            result = [...result, item];
          }
        }
        console.log('2');
        console.log(result);

        this.rows = this.temp = result;
      });
  }

  // allocate driver to return paper
  allocate() {
    console.log(this.selected[0]);

    this.feuilleRetourService
      .createFeuilleRetour({
        driverId: this.g.driverId.value,
        packages: this.selected,
      })
      .subscribe(() => {
        this.success = true;
      });
  }
}
