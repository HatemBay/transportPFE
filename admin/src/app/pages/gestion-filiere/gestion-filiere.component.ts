import {
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { FiliereService } from "src/app/services/filiere.service";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: "app-gestion-filiere",
  templateUrl: "./gestion-filiere.component.html",
  styleUrls: ["./gestion-filiere.component.scss"],
})
export class GestionFiliereComponent implements OnInit {
  @ViewChild("editModal") editModal: TemplateRef<any>;
  @ViewChild(DatatableComponent) search: DatatableComponent;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild(alert) alert: any;
  @ViewChild("myEl") el: ElementRef;

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
  filiereForm: any;
  error: any = "none";
  constructor(
    private fb: FormBuilder,
    private filiereService: FiliereService,
    public modalService: NgbModal,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit(): void {
    this.columns = [
      { prop: "nom", name: "Nom & Prénom" },
      { prop: "adresse", name: "Ville" },
    ];
    this.filiereForm = this.fb.group({
      nom: ["", Validators.required],
      adresse: ["", Validators.required],
    });

    this.countFilieres();

    this.getDataJson();
    console.log(this.error != "none");
  }

  get f() {
    return this.filiereForm.controls;
  }

  // get data from backend
  getDataJson(limit?: any, page?: any, sortBy?: any, sort?: any, search?: any) {
    this.filiereService
      .getFilieres(limit, page, sortBy, sort, search)
      .subscribe((data) => {
        this.rows = this.temp = data;
      });
  }

  // count branches
  countFilieres() {
    this.filiereService.countFilieres().subscribe((data) => {
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

  closeModal(modal) {
    this.filiereForm.value.nom = this.filiereForm.value.nom.toLowerCase();

    console.log(this.filiereForm.value.nom);

    this.filiereService.createFiliere(this.filiereForm.value).subscribe(
      (res) => {
        this.error = "none";
        this.filiereForm.reset();
        this.getDataJson();
        modal.close("Cross click");
      },
      (err) => {
        this.error = err.message;
      }
    );
  }

  dismissModal(modal) {
    this.filiereForm.reset();
    modal.dismiss("Cross click");
  }

  // delete filiere
  delete(data) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette filière?")) {
      this.filiereService.deleteFiliere(data._id).subscribe(() => {
        console.log("filiere supprimée");
        this.getDataJson();
      });
    }
  }
}
