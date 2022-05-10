import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, NavigationExtras } from "@angular/router";
import { DatatableComponent } from "@swimlane/ngx-datatable";
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

  error: boolean = false;
  index: Array<number> = [];
  display: string = "default";
  display2: string = "default";
  chauffeurs: any = [];
  chauffeur: any = [];
  chauffeursForm: FormGroup;
  referenceForm: FormGroup;
  references: Array<number> = [];
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
      this.getDataJson();
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

  getDataJson() {
    this.userService.getChauffeurs().subscribe((data) => {
      this.chauffeurs = data;
    });
  }

  getPackageData(element: any) {
    this.packageService.getFullPackageByCAB(element).subscribe((data) => {
      this.packages.push(data[0]);
    });
  }

  // checkPackage(id: any) {
  //   this.packageService.getPackageByCAB(id).subscribe((data) => {
  //     if (data[0].CAB) this.references.push(data[0].CAB);
  //   });
  // }

  public show() {
    this.display = "block";
    this.chauffeur = this.chauffeurs.slice(
      this.chauffeurs.findIndex(
        (x) => x._id === this.chauffeursForm.value.chauffeurs
      ),
      1
    );
    console.log(this.chauffeur);
  }

  public printRoadmap() {
    // this.index = [];
    var references = this.referenceForm.value.references;
    this.references = references.split("\n");
    this.roadmapService
      .createRoadmap({ driverId: this.chauffeur[0], packages: this.references })
      .subscribe((data) => {});
    // console.log(refs);
    // refs.forEach((element) => {
    //   if (!isNaN(element) && element.length === 10) {
    //     this.checkPackage(element);
    //   } else {
    //     this.error = true;
    //     this.index.push(refs.indexOf(element));
    //   }
    // });

    console.log(this.references);
    this.references.forEach((element) => {
      this.getPackageData(element);
    });

    const printContent = document.getElementById("hiddenRoadmapPrint");

    const WindowPrt = window.open(
      "",
      "",
      "left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0"
    );
    WindowPrt.setTimeout(() => {
      WindowPrt.document.write(printContent.innerHTML);
      WindowPrt.document.close();
    }, 1000);

    WindowPrt.setTimeout(function () {
      WindowPrt.focus();
      WindowPrt.print();
      // WindowPrt.close();
    }, 1000);

    this.references = [];
    this.packages = [];
  }

  // print selecetd elements

  public showRetour() {
    this.display2 = "block";
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
    this.getRoadmapData(limit, this.currentPage);
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
    var ids = [];
    console.log(row.packages);
    for (var el of row.packages) {
      ids.push(el.CAB);
    }

    ids.forEach((element) => {
      this.getPackageData(element);
    });

    const printContent = document.getElementById("hiddenRoadmapHistoric");

    const WindowPrt = window.open(
      "",
      "",
      "left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0"
    );
    WindowPrt.setTimeout(() => {
      WindowPrt.document.write(printContent.innerHTML);
      WindowPrt.document.close();
    }, 1000);

    WindowPrt.setTimeout(function () {
      WindowPrt.focus();
      WindowPrt.print();
      // WindowPrt.close();
    }, 1000);

    this.references = [];
    this.packages = [];
  }
}
