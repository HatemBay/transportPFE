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
import { DelegationService } from "src/app/services/delegation.service";
import { VilleService } from "src/app/services/ville.service";

@Component({
  selector: "app-gestion-delegation",
  templateUrl: "./gestion-delegation.component.html",
  styleUrls: ["./gestion-delegation.component.scss"],
})
export class GestionDelegationComponent implements OnInit {
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
  delegationForm: any;
  error: string = "none";
  villes: Object;
  val: string;

  constructor(
    private fb: FormBuilder,
    private delegationService: DelegationService,
    private villeService: VilleService,
    public modalService: NgbModal,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit(): void {
    this.columns = [
      { prop: "ville", name: "Ville" },
      { prop: "nom", name: "Délégation" },
    ];
    this.delegationForm = this.fb.group({
      nom: ["", Validators.required],
      villeId: ["", Validators.required],
    });

    this.getVilles();

    this.getDataJson();
    console.log(this.error != "none");
  }
  getVilles() {
    this.villeService.getVilles().subscribe((data) => {
      this.villes = data.data;
    });
  }

  get f() {
    return this.delegationForm.controls;
  }

  // get data from backend
  getDataJson(limit?: any, page?: any, sortBy?: any, sort?: any, search?: any) {
    this.delegationService
      .getDelegations(limit, page, sortBy, sort, search)
      .subscribe((data) => {
        this.rows = this.temp = data.data;
        this.count = data.length;
      });
  }

  updateFilter(event) {
    this.val = event.target.value.toLowerCase();
    this.getDataJson(this.currentPageLimit, 1, null, null, this.val);
  }

  // When number of displayed elements changes
  public onLimitChange(limit: any): void {
    this.changePageLimit(limit);
    this.table.limit = this.currentPageLimit;
    this.getDataJson(limit, null, null, null, this.val);
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
      event.newValue,
      this.val
    );
  }

  // When page changes
  onFooterPage(event) {
    this.changePage(event.page);
    this.getDataJson(this.currentPageLimit, event.page, null, null, this.val);
  }

  changePage(page: any) {
    this.currentPage = parseInt(page, 10);
  }

  addModal() {
    this.modalService.open(this.editModal);
  }

  closeModal(modal) {
    this.delegationForm.value.nom = this.delegationForm.value.nom.toLowerCase();

    console.log(this.delegationForm.value.nom);

    this.delegationService
      .createDelegation(this.delegationForm.value)
      .subscribe(
        (res) => {
          this.error = "none";
          this.delegationForm.reset();
          this.getDataJson();
          modal.close("Cross click");
        },
        (err) => {
          this.error = err.message;
        }
      );
  }

  dismissModal(modal) {
    this.delegationForm.reset();
    modal.dismiss("Cross click");
  }

  // delete delegation
  delete(data) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette delegation?")) {
      this.delegationService.deleteDelegation(data._id).subscribe(() => {
        console.log("delegation supprimée");
        this.success = true;
        this.getDataJson(null, null, null, null, this.val);
      });
    }
  }
}
