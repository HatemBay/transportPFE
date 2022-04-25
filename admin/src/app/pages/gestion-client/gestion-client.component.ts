import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import { NgbModal, NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { ClientService } from "src/app/services/client.service";
import { DelegationService } from "src/app/services/delegation.service";
import { VilleService } from "src/app/services/ville.service";

@Component({
  selector: "app-gestion-client",
  templateUrl: "./gestion-client.component.html",
  styleUrls: ["./gestion-client.component.scss"],
})
export class GestionClientComponent implements OnInit {
  @ViewChild("editModal") editModal: TemplateRef<any>;
  @ViewChild(DatatableComponent) search: DatatableComponent;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild(alert) alert: any;

  success: boolean = false;
  temp: any = [];
  rows: any = [];
  public columns: Array<object>;
  count: any;

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
  routePath: string;
  clientForm: any;
  clientModifyForm: any;
  clientId: any;
  error: string;
  villeId: any;
  villes: Object;
  delegations: Object;

  constructor(
    private clientService: ClientService,
    private villeService: VilleService,
    private delegationService: DelegationService,
    public modalService: NgbModal,
    public activeModal: NgbActiveModal,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.routePath = this.route.snapshot.routeConfig.path;

    this.clientId = this.route.snapshot.queryParamMap.get("Id");
  }

  ngOnInit(): void {
    if (this.routePath == "gestion-client") {
      this.columns = [
        { prop: "nom", name: "Nom & Prénom" },
        { prop: "ville", name: "Ville" },
        { prop: "delegation", name: "Délégation" },
        { prop: "adresse", name: "Adresse" },
      ];

      this.clientForm = this.fb.group({
        nom: ["", Validators.required],
        tel: [
          "",
          [
            Validators.required,
            Validators.min(10000000),
            Validators.max(99999999),
          ],
        ],
        email: "",
        ville: ["", Validators.required],
        delegation: ["", Validators.required],
        adresse: ["", Validators.required],
      });

      this.countClients();

      this.getDataJson();
      // this.findAll();
    } else {
      this.clientModifyForm = this.fb.group({
        nom: ["", Validators.required],
        tel: [
          "",
          [
            Validators.required,
            Validators.min(10000000),
            Validators.max(99999999),
          ],
        ],
        email: "",
        ville: ["", Validators.required],
        delegation: ["", Validators.required],
        adresse: ["", Validators.required],
      });
      this.clientService.getClient(this.clientId).subscribe((data) => {
        console.log("data");
        console.log(data);
        this.clientModifyForm.patchValue({
          nom: data[0].nom,
          tel: data[0].tel,
          email: data[0].email,
          ville: data[0].villeId,
          delegation: data[0].delegationId,
          adresse: data[0].adresse,
        });
        this.getDelegations(data[0].villeId);
      });

      this.getVilles();
    }
  }
  getDelegations(villeId: any) {
    this.delegationService.getDelegationsByVille(villeId).subscribe((data) => {
      this.delegations = data;
    });
  }
  getVilles() {
    this.villeService.getVilles().subscribe((data) => {
      this.villes = data;
    });
  }

  get f() {
    return this.clientForm.controls;
  }

  get g() {
    return this.clientModifyForm.controls;
  }

  // get our data from backend
  getDataJson(limit?: any, page?: any, sortBy?: any, sort?: any, search?: any) {
    this.clientService
      .getClients(limit, page, sortBy, sort, search)
      .subscribe((data) => {
        this.rows = this.temp = data;
      });
  }

  updateFilter(event) {
    if (event.target.value.length > 2) {
      const val = event.target.value.toLowerCase();
      this.getDataJson(this.currentPageLimit, 1, null, null, val);
    } else {
      this.getDataJson(this.currentPageLimit, 1, null, null, null);
    }
  }

  // change number of elements to display
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

  private countClients() {
    this.clientService.countAllClients().subscribe((res) => {
      this.count = res.count;
      console.log(this.count);
    });
  }

  onFooterPage(event) {
    this.changePage(event.page);
    this.getDataJson(this.currentPageLimit, event.page);
  }

  changePage(page: any) {
    this.currentPage = parseInt(page, 10);
  }

  onSelect({ selected }) {
    console.log("Select Event", selected, this.selected);

    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  // data sorting
  onSort(event) {
    this.getDataJson(
      this.currentPageLimit,
      event.page,
      event.sorts[0].prop,
      event.newValue
    );
  }

  addModal() {
    this.modalService.open(this.editModal);
  }

  closeModal(modal) {
    this.clientForm.value.nom = this.clientForm.value.nom.toLowerCase();

    console.log(this.clientForm.value);

    this.clientService.createClient(this.clientForm.value).subscribe(
      (res) => {
        this.error = "none";
        this.clientForm.reset();
        this.getDataJson();
        modal.close("Cross click");
      },
      (err) => {
        this.error = err.message;
      }
    );
  }

  dismissModal(modal) {
    this.clientForm.reset();
    modal.dismiss("Cross click");
  }

  // view client details
  // view(data) {
  //   console.log(data.clientId);
  //   var navigationExtras: NavigationExtras = {
  //     queryParams: {
  //       packageId: data._id,
  //     },
  //   };
  //   console.log(navigationExtras.queryParams);

  //   this.router.navigate(["/modifier-colis"], navigationExtras);
  // }

  // delete client
  delete(data) {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce client?")) {
      this.clientService.deleteClient(data._id).subscribe(() => {
        console.log("utilisateur supprimé");
        this.getDataJson();
      });
    }
  }

  // edit client
  modify(data) {
    var navigationExtras: NavigationExtras = {
      queryParams: {
        Id: data._id,
      },
    };
    console.log(navigationExtras.queryParams);

    this.router.navigate(["/modifier-client"], navigationExtras);
  }

  // confirm client modification
  save() {
    console.log(this.clientModifyForm.value);
    this.clientService
      .updateClient(this.clientId, this.clientModifyForm.value)
      .subscribe((data) => {
        console.log(data);
        this.router.navigate(["/gestion-client"]);
      });
  }
}
