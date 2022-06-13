import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, NavigationExtras, Router } from "@angular/router";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import {
  map,
  of,
  ReplaySubject,
  Subject,
  switchMap,
  tap,
  lastValueFrom,
  delay,
  forkJoin,
} from "rxjs";
import { PackageService } from "src/app/services/package.service";
import { RoadmapService } from "src/app/services/roadmap.service";
import { UserService } from "src/app/services/user.service";

@Component({
  selector: "app-cb-feuille-route",
  templateUrl: "./cb-feuille-route.component.html",
  styleUrls: ["./cb-feuille-route.component.scss"],
})
export class CbFeuilleRouteComponent implements OnInit {
  @ViewChild(DatatableComponent) search: DatatableComponent;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild(alert) alert: any;
  @ViewChild("myEl") el: ElementRef;

  check: boolean = false;
  index: any = [];
  display: string = "default";
  chauffeurs: any = [];
  chauffeur: any = [];
  chauffeursForm: FormGroup;
  referenceForm: FormGroup;
  references: Array<number> = [];
  refs: any = [];
  packages: any = [];
  routePath: string;

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
  public columns: Array<object>;
  count: any;
  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private packageService: PackageService,
    private roadmapService: RoadmapService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.routePath = this.route.snapshot.routeConfig.path;
  }

  ngOnInit(): void {
    if (this.routePath === "feuille-de-route") {
      this.chauffeursForm = this.fb.group({
        chauffeurs: ["", Validators.required],
      });

      this.referenceForm = this.fb.group({
        references: ["", Validators.required],
      });
      this.getDrivers();
    } else {
      this.columns = [
        { prop: "roadmapNb", name: "N° bon de sortie" },
        { prop: "nbPackages", name: "Nbre de colis" },
        { prop: "nomd", name: "Chauffeur" },
        { prop: "createdAtSearch", name: "Date" },
      ];

      this.countRoadmaps();
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
    this.roadmapService
      .getRoadmaps(limit, page, sortBy, sort, search)
      .subscribe((data) => {
        this.rows = this.temp = data;
      });
  }

  // count roadmaps
  countRoadmaps() {
    this.roadmapService.countRoadmaps().subscribe((data) => {
      this.count = data.count;
    });
  }

  // get references() {
  //   return this.referenceForm.controls["references"] as FormArray;
  // }

  get f() {
    return this.referenceForm.controls;
  }

  getDrivers() {
    this.userService.getUsersByRole("chauffeur").subscribe((data) => {
      this.chauffeurs = data;
    });
  }

  //shows textarea for roadmap
  public show() {
    this.chauffeur = [];
    this.display = "block";
    const index: number = this.chauffeurs.findIndex(
      (x: any) => x._id === this.chauffeursForm.value.chauffeurs
    );
    this.chauffeur = this.chauffeurs.slice(index, index + 1);
  }

  async checkPackage(cab: any) {
    return await this.packageService
      .getPackageByCAB(cab)
      .pipe(
        map((data) => {
          if (data[0]) {
            return { value: true, etat: data[0].etat };
          } else {
            return { value: false };
          }
        })
      )
      .toPromise();
  }

  public async printRoadmap() {
    this.index = [];
    this.references = [];
    var references = this.referenceForm.value.references;
    this.refs = references.split("\n");

    // this.references = references.split("\n");

    // *testing phase
    for (let [index, element] of this.refs.entries()) {
      if (element.length > 0) {
        if (!isNaN(element) && element.length === 10) {
          const data = await this.checkPackage(element);
          if (data.value === true) {
            if (this.references.indexOf(parseInt(element)) !== -1) {
              this.index.push({
                index: index,
                error: "duplicateError",
                value: element,
                state: "",
              });
            }
            //TODO: to be changed to all states representing steps after 'en cours'
            else if (
              [
                "en cours",
                "livré (espèce)",
                "livré (chèque)",
                "annulé",
                "reporté",
              ].indexOf(data.etat) !== -1
            ) {
              this.index.push({
                index: index,
                error: "absurdError",
                value: element,
                state: data.etat,
              });
            } else {
              this.references.push(parseInt(element));
            }
          } else {
            this.index.push({
              index: index,
              error: "nonExistantError",
              value: element,
              state: "",
            });
          }
        } else {
          this.index.push({
            index: index,
            error: "falseError",
            value: element,
            state: "",
          });
        }
      }
    }

    //* index array represents erroneous data
    if (this.index.length === 0) {
      this.roadmapService
        .createRoadmap({
          driverId: this.chauffeur[0],
          packages: this.references,
        })
        .subscribe();
    }

    // Create our query parameters object
    const queryParams: any = {};
    queryParams.CABs = JSON.stringify(this.references);
    queryParams.errors = JSON.stringify(this.index);
    queryParams.type = "list";
    queryParams.nb = null;
    var navigationExtras: NavigationExtras = {
      queryParams,
    };
    console.log(navigationExtras.queryParams);

    const url = this.router.serializeUrl(
      this.router.createUrlTree(["/imprimer-roadmap"], navigationExtras)
    );

    const WindowPrt = window.open(
      url,
      "_blank",
      "left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0"
    );

    WindowPrt.setTimeout(() => {
      WindowPrt.focus();
      WindowPrt.print();
      if (this.index.length === 0) {
        location.reload();
      }
      // WindowPrt.close();
    }, 2000);
  }

  updateFilter(event) {
    var val = null;
    if (event.target.value.length > 2) val = event.target.value.toLowerCase();
    this.getRoadmapData(this.currentPageLimit, 1, null, null, val);
  }

  // When number of displayed elements changes
  public onLimitChange(limit: any): void {
    this.changePageLimit(limit);
    this.table.limit = this.currentPageLimit;
    this.getRoadmapData(limit);
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
    this.getRoadmapData(
      this.currentPageLimit,
      event.page,
      event.sorts[0].prop,
      event.newValue
    );
  }

  // When page changes
  onFooterPage(event) {
    this.changePage(event.page);
    this.getRoadmapData(this.currentPageLimit, event.page, null, null, null);
  }

  changePage(page: any) {
    this.currentPage = parseInt(page, 10);
  }

  // redirects to printable facture for pickup
  toFacture(row) {
    var CABs = [];
    console.log(row.packages);
    for (var el of row.packages) {
      CABs.push(el.CAB);
    }

    // Create our query parameters object
    const queryParams: any = {};
    queryParams.CABs = JSON.stringify(CABs);
    queryParams.errors = [];
    queryParams.type = "historique";
    queryParams.nb = row.roadmapNb;
    var navigationExtras: NavigationExtras = {
      queryParams,
    };
    console.log(navigationExtras.queryParams);

    const url = this.router.serializeUrl(
      this.router.createUrlTree(["/imprimer-roadmap"], navigationExtras)
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

  public logg(data) {
    console.log("data");
    console.log(data);
  }
}
