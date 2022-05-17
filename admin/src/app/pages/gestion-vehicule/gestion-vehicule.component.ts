import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import {
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router, NavigationExtras } from "@angular/router";
import { NgbModal, NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { UserService } from "src/app/services/user.service";
import { VehiculeService } from "src/app/services/vehicule.service";
import { DomSanitizer } from "@angular/platform-browser";
import { DatePipe } from "@angular/common";

@Component({
  selector: "app-gestion-vehicule",
  templateUrl: "./gestion-vehicule.component.html",
  styleUrls: ["./gestion-vehicule.component.scss"],
})
export class GestionVehiculeComponent implements OnInit {
  @ViewChild("editModal") editModal: TemplateRef<any>;
  @ViewChild(DatatableComponent) search: DatatableComponent;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild(alert) alert: any;
  @ViewChild("myEl") el: ElementRef;

  success: boolean = false;
  formData: FormData;
  file: File;
  now = new Date();

  public currentPageLimit: number = 10;
  public currentPage: number = 1;

  public readonly pageLimitOptions = [
    { value: 5 },
    { value: 10 },
    { value: 25 },
    { value: 50 },
    { value: 100 },
  ];

  thisChauffeur: any = {};
  temp: any = [];
  rows: any = [];
  selected: any = [];
  public columns: Array<object>;
  count: any;
  vehiculeForm: any;
  vehiculeModifyForm: any;
  error: any = "none";
  chauffeurs: Object;
  routePath: any;
  vehiculeId: string;
  images: any = [];
  image: any;
  filePath: string;
  fileName: string;
  changed: boolean = false;
  regExSerie: any;

  constructor(
    private fb: FormBuilder,
    private vehiculeService: VehiculeService,
    private userService: UserService,
    public modalService: NgbModal,
    public activeModal: NgbActiveModal,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private datePipe: DatePipe
  ) {
    this.routePath = this.route.snapshot.routeConfig.path;

    this.vehiculeId = this.route.snapshot.queryParamMap.get("Id");
    this.regExSerie = /^[0-9]{1,3} *[A-Z]{2} *[0-9]{1,4}$/;
  }

  ngOnInit(): void {
    if (this.routePath == "gestion-vehicule") {
      this.columns = [
        { prop: "nomc", name: "Chauffeur" },
        { prop: "serie", name: "Serie" },
        { prop: "modele", name: "Modele" },
      ];

      this.vehiculeForm = this.fb.group({
        img: [null],
        chauffeurId: ["", Validators.required],
        serie: [
          "",
          [
            Validators.required,
            Validators.pattern("^[0-9]{1,3} *[A-Z]{2} *[0-9]{1,4}"),
          ],
        ],
        modele: ["", Validators.required],
        assurance: ["", Validators.required],
        dateCirculation: ["", Validators.required],
        imageCarteGrise: ["", Validators.required],
        dateVisite: ["", Validators.required],
        kilometrage: ["", Validators.required],
      });

      this.countUsers();

      this.getDataJson();
      // console.log(this.error != "none");
    } else {
      this.getChauffeur(this.vehiculeId);

      this.vehiculeModifyForm = this.fb.group({
        img: [null],
        chauffeurId: [null, Validators.required],
        serie: ["", Validators.required],
        modele: ["", Validators.required],
        assurance: ["", Validators.required],
        dateCirculation: ["", Validators.required],
        imageCarteGrise: ["", Validators.required],
        dateVisite: ["", Validators.required],
        kilometrage: ["", Validators.required],
      });

      this.vehiculeService.getVehicule(this.vehiculeId).subscribe((data) => {
        console.log("ds");

        console.log(data.dateCirculation);
        // rendering image data into readable format
        var newData = btoa(
          data.imageCarteGrise.data.data.reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );

        this.image = this.sanitizer.bypassSecurityTrustResourceUrl(
          "data:" + data.imageCarteGrise.contentType + ";base64," + newData
        );

        var dateCirculation = new Date(data.dateCirculation);
        var dateVisite = new Date(data.dateVisite);

        this.vehiculeModifyForm.patchValue({
          chauffeurId: data.chauffeurId,
          serie: data.serie,
          modele: data.modele,
          assurance: data.assurance,
          dateCirculation: this.datePipe.transform(
            dateCirculation,
            "yyyy-MM-dd"
          ),
          // imageCarteGrise: data.imageCarteGrise,
          dateVisite: this.datePipe.transform(dateVisite, "yyyy-MM-dd"),
          kilometrage: data.kilometrage,
        });
      });
    }
    this.getChauffeurs();
  }

  get f() {
    return this.vehiculeForm.controls;
  }

  get g() {
    return this.vehiculeModifyForm.controls;
  }

  getChauffeurs() {
    this.userService.getUsersByRole('chauffeur').subscribe((data) => {
      this.chauffeurs = data;
    });
  }
  getChauffeur(id) {
    this.vehiculeService.getVehicule(id).subscribe((data) => {
      // console.log("chauffeur data");
      console.log(data);
      this.userService.getUser(data.chauffeurId).subscribe((data2) => {
        this.thisChauffeur = data2;
        console.log(this.thisChauffeur);
      });
    });
  }

  // get data from backend
  getDataJson(limit?: any, page?: any, sortBy?: any, sort?: any, search?: any) {
    this.vehiculeService
      .getVehicules(limit, page, sortBy, sort, search)
      .subscribe((data) => {
        data.forEach((element) => {
          // rendering image data into readable format
          this.images.push(
            this.sanitizer.bypassSecurityTrustResourceUrl(
              "data:" +
                element.imageCarteGrise.contentType +
                ";base64," +
                element.imageCarteGrise.data.toString("base64")
            )
          );
        });
        // console.log(this.images);

        this.rows = this.temp = data;

        console.log(data);
      });
  }

  // count users
  countUsers() {
    this.vehiculeService.countVehicules().subscribe((data) => {
      this.count = data.count;
    });
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    this.getDataJson(this.currentPageLimit, 1, null, null, val);
  }

  // When number of displayed elements changes
  public onLimitChange(limit: any): void {
    this.changePageLimit(limit);
    this.table.limit = this.currentPageLimit;
    this.getDataJson(limit, this.currentPage);
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
      this.currentPageLimit,
      event.page,
      event.sorts[0].prop,
      event.newValue
    );
  }

  // When page changes
  onFooterPage(event) {
    this.changePage(event.page);
    this.getDataJson(this.currentPageLimit, event.page);
  }

  changePage(page: any) {
    this.currentPage = parseInt(page, 10);
  }

  addModal() {
    this.modalService.open(this.editModal);
  }

  // saves file for api send + sets file name for alt + displays image on select
  onFileSelected(event) {
    this.file = event.target.files[0];

    // const file = (event.target as HTMLInputElement).files[0];
    if (this.file) {
      this.fileName = this.file.name;
    }

    this.vehiculeModifyForm.patchValue({
      img: this.file,
    });

    this.vehiculeModifyForm.get("img").updateValueAndValidity();

    const reader = new FileReader();
    reader.onload = () => {
      this.filePath = reader.result as string;
      this.changed = true;
    };

    if (this.file) {
      reader.readAsDataURL(this.file);
    } else {
      this.filePath = "";
    }
  }

  closeModal(modal) {
    // console.log(this.vehiculeForm.value);

    const file = this.vehiculeForm.value;
    if (this.file) {
      const fd = new FormData();
      fd.append("form", JSON.stringify(file));
      fd.append("CG", this.file);
      this.formData = fd;
      // console.log(this.formData);
    }

    // modal.close("Cross click");
    this.vehiculeService.createVehicule(this.formData).subscribe(
      (res) => {
        this.error = "none";
        this.vehiculeForm.reset();
        this.getDataJson();
        this.getChauffeurs();
        modal.close("Cross click");
      },
      (err) => {
        this.error = err.message;
      }
    );
  }

  dismissModal(modal) {
    this.vehiculeForm.reset();
    modal.dismiss("Cross click");
  }

  // delete user
  delete(data) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette véhicule?")) {
      this.vehiculeService.deleteVehicule(data._id).subscribe(() => {
        console.log("véhicule supprimée");
        this.getDataJson();
        this.getChauffeurs();
      });
    }
  }

  // edit user
  modify(data) {
    var navigationExtras: NavigationExtras = {
      queryParams: {
        Id: data._id,
      },
    };
    console.log(navigationExtras.queryParams);

    this.router.navigate(["/modifier-vehicule"], navigationExtras);
  }

  // confirm user modification
  save() {
    const file = this.vehiculeModifyForm.value;
    const fd = new FormData();

    if (this.file) {
      fd.append("form", JSON.stringify(file));
      fd.append("CG", this.file);
      this.formData = fd;
      // console.log(this.formData);
    } else {
      fd.append("form", JSON.stringify(file));
      this.formData = fd;
    }

    var diffchauff = null;
    console.log(this.vehiculeModifyForm.value);
    if (this.vehiculeModifyForm.value.chauffeurId != this.thisChauffeur._id) {
      diffchauff = this.vehiculeModifyForm.value.chauffeurId;
    }
    this.vehiculeService
      .updateVehicule(this.vehiculeId, this.formData, diffchauff)
      .subscribe((data) => {
        console.log(data);
        this.router.navigate(["/gestion-vehicule"]);
      });
  }

  public getRowIndex(row: any): number {
    return this.table.bodyComponent.getRowIndex(row); // row being data object passed into the template
  }
}
