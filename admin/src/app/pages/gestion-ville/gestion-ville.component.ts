import {
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { NgbModal, NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { VilleService } from "src/app/services/ville.service";

@Component({
  selector: "app-gestion-ville",
  templateUrl: "./gestion-ville.component.html",
  styleUrls: ["./gestion-ville.component.scss"],
})
export class GestionVilleComponent implements OnInit {
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
  villeForm: any;
  error: string = "none";
  constructor(
    private fb: FormBuilder,
    private villeService: VilleService,
    public modalService: NgbModal,
    public activeModal: NgbActiveModal
  ) {
    console.log(localStorage.getItem("mean-token"));
  }

  ngOnInit(): void {
    this.columns = [
      { prop: "nom", name: "Nom & Prénom" },
      { prop: "etat", name: "Etat" },
    ];
    this.villeForm = this.fb.group({
      nom: ["", Validators.required]
    });

    this.countVilles();

    this.getDataJson();
    console.log(this.error != "none");
  }

  get f() {
    return this.villeForm.controls;
  }

  // get data from backend
  getDataJson(limit?: any, page?: any, sortBy?: any, sort?: any, search?: any) {
    this.villeService
      .getVilles(limit, page, sortBy, sort, search)
      .subscribe((data) => {
        this.rows = this.temp = data;
      });
  }

  // count villes
  countVilles() {
    this.villeService.countVilles().subscribe((data) => {
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
    this.getDataJson(limit);
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
    this.villeForm.value.nom = this.villeForm.value.nom.toLowerCase();

    console.log(this.villeForm.value.nom);

    this.villeService.createVille(this.villeForm.value).subscribe(
      (res) => {
        this.error = "none";
        this.villeForm.reset();
        this.getDataJson();
        modal.close("Cross click");
      },
      (err) => {
        this.error = err.message;
      }
    );
  }

  dismissModal(modal) {
    this.villeForm.reset();
    modal.dismiss("Cross click");
  }

  // change ville state
  changeState(ville) {
    this.villeService.changeState(ville._id).subscribe((res) => {
      this.getDataJson();
    });
  }
}
