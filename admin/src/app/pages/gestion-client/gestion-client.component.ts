import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import { NgbModal, NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { DelegationService } from "src/app/services/delegation.service";
import { FournisseurService } from "src/app/services/fournisseur.service";
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

  DEFAULT_PASSWORD = "123456";

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
  error = "none";
  villeId: any;
  villes: Object;
  delegations: Object;
  val: string;

  constructor(
    private fournisseurService: FournisseurService,
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
    this.getVilles();

    if (this.routePath == "gestion-client") {
      this.columns = [
        { prop: "adresse", name: "Adresse" },
        { prop: "fraisLivraison", name: "Frais de livraison" },
        { prop: "fraisRetour", name: "Frais de retour" },
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
        email: [
          "",
          [
            Validators.required,
            Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"),
          ],
        ],
        villeId: ["", Validators.required],
        delegationId: ["", Validators.required],
        adresse: ["", Validators.required],
        codePostale: ["", Validators.required],
        fraisLivraison: ["", Validators.required],
        fraisRetour: ["", Validators.required],
      });

      //detect changes in form controls
      this.onChanges();

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
        email: [
          "",
          [
            Validators.required,
            Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"),
          ],
        ],
        villeId: ["", Validators.required],
        delegationId: ["", Validators.required],
        adresse: ["", Validators.required],
        codePostale: ["", Validators.required],
        fraisLivraison: ["", Validators.required],
        fraisRetour: ["", Validators.required],
      });
      this.fournisseurService
        .getFournisseur(this.clientId)
        .subscribe((data) => {
          console.log("data");
          console.log(data);
          this.clientModifyForm.patchValue({
            nom: data[0].nom,
            tel: data[0].tel,
            email: data[0].email,
            villeId: data[0].villeId,
            delegationId: data[0].delegationId,
            adresse: data[0].adresse,
            codePostale: data[0].codePostale,
            fraisLivraison: data[0].fraisLivraison,
            fraisRetour: data[0].fraisRetour,
          });
        });
      //detect changes in form controls
      this.onChangesModify();
    }
  }

  show() {
    console.log(this.clientForm.value);
  }

  onChanges(): void {
    this.clientForm.get("tel").valueChanges.subscribe((val) => {
      this.error = "none";
    });
    this.clientForm.get("villeId").valueChanges.subscribe((val) => {
      if (val !== null) {
        this.getDelegations(val);
      }
    });
  }
  onChangesModify(): void {
    this.clientModifyForm.get("tel").valueChanges.subscribe((val) => {
      this.error = "none";
    });
    this.clientModifyForm.get("villeId").valueChanges.subscribe((val) => {
      this.getDelegations(val);
    });
  }

  getDelegations(villeId: any) {
    this.delegationService.getDelegationsByVille(villeId).subscribe((data) => {
      this.delegations = data;
    });
  }
  getVilles() {
    this.villeService.getVilles().subscribe((data) => {
      this.villes = data.data;
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
    this.fournisseurService
      .getFournisseurs(limit, page, sortBy, sort, search)
      .subscribe((data) => {
        this.rows = this.temp = data.data;
        this.count = data.length;
      });
  }

  updateFilter(event) {
    this.val = event.target.value.toLowerCase();
    if (event.target.value.length > 2) {
      this.getDataJson(this.currentPageLimit, 1, null, null, this.val);
    } else {
      this.getDataJson(this.currentPageLimit, 1, null, null, null);
    }
  }

  // change number of elements to display
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

  onFooterPage(event) {
    this.changePage(event.page);
    this.getDataJson(this.currentPageLimit, event.page, null, null, this.val);
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
      event.newValue,
      this.val
    );
  }

  addModal() {
    this.modalService.open(this.editModal);
  }

  async closeModal(modal) {
    this.clientForm.value.nom = this.clientForm.value.nom.toLowerCase();
    this.clientForm.value.password = this.DEFAULT_PASSWORD;

    console.log(this.clientForm.value);

    this.fournisseurService.createFournisseur(this.clientForm.value).subscribe(
      (res) => {
        this.error = "none";
        this.clientForm.reset();
        this.delegations = [];
        this.getDataJson();
        modal.close("Cross click");
      },
      (err) => {
        this.error = err.message;
      }
    );
  }

  dismissModal(modal) {
    console.log("sqdqdqs");

    this.clientForm.reset();
    this.delegations = [];
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
      this.fournisseurService.deleteFournisseur(data._id).subscribe(() => {
        console.log("utilisateur supprimé");
        this.getDataJson(null, null, null, null, this.val);
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
    this.fournisseurService
      .updateFournisseur(this.clientId, this.clientModifyForm.value)
      .subscribe(
        (data) => {
          console.log(data);
          this.router.navigate(["/gestion-client"]);
        },
        (err) => {
          this.error = err.message;
        }
      );
  }

  //SHOW DEFAULT PASSWORD
  showDefaultPassword() {
    alert("Mot de passe par défaut est: " + this.DEFAULT_PASSWORD);
  }
}
