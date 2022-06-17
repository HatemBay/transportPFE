import {
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, NavigationExtras, Router } from "@angular/router";
import { NgbModal, NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { AuthenticationService } from "src/app/services/authentication.service";
import { FiliereService } from "src/app/services/filiere.service";
import { UserService } from "src/app/services/user.service";

@Component({
  selector: "app-gestion-personel",
  templateUrl: "./gestion-personel.component.html",
  styleUrls: ["./gestion-personel.component.scss"],
})
export class GestionPersonelComponent implements OnInit {
  @ViewChild("editModal") editModal: TemplateRef<any>;
  @ViewChild(DatatableComponent) search: DatatableComponent;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild(alert) alert: any;
  @ViewChild("myEl") el: ElementRef;

  DEFAULT_PASSWORD: string = "123456";

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
  userForm: any;
  userModifyForm: any;
  error: any = "none";
  filieres: Object;
  routePath: any;
  userId: string;
  val: string;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private filiereService: FiliereService,
    public modalService: NgbModal,
    public activeModal: NgbActiveModal,
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthenticationService
  ) {
    this.routePath = this.route.snapshot.routeConfig.path;

    this.userId = this.route.snapshot.queryParamMap.get("Id");
  }

  ngOnInit(): void {
    if (this.routePath == "gestion-personel") {
      this.columns = [
        { prop: "nomf", name: "Filière" },
        { prop: "role", name: "Type" },
        { prop: "nom", name: "Nom & prénom" },
        { prop: "tel", name: "Téléphone" },
        { prop: "createdAtSearch", name: "Date" },
      ];

      this.userForm = this.fb.group({
        filiereId: ["", Validators.required],
        role: ["", Validators.required],
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
      });

      this.getDataJson();
      this.getFilieres();
      // adding super admin control protection => && this.userId != this.auth.getUserDetails()._id
    } else if (this.routePath == "modifier-personel") {
      this.userModifyForm = this.fb.group({
        role: ["", Validators.required],
        nom: ["", Validators.required],
        tel: [
          "",
          [
            Validators.required,
            Validators.min(10000000),
            Validators.max(99999999),
          ],
        ],
        password: ["", Validators.required],
        email: "",
      });
      this.userService.getUser(this.userId).subscribe((data) => {
        console.log(data);

        this.userModifyForm.patchValue({
          role: data.role,
          nom: data.nom,
          tel: data.tel,
          password: data.password,
          email: data.email,
        });
      });
    }
  }

  get f() {
    return this.userForm.controls;
  }

  get g() {
    return this.userModifyForm.controls;
  }

  getFilieres() {
    this.filiereService.getFilieres().subscribe((data) => {
      this.filieres = data;
      console.log(data);
    });
  }

  // get data from backend
  getDataJson(limit?: any, page?: any, sortBy?: any, sort?: any, search?: any) {
    this.userService
      .getUsers(limit, page, sortBy, sort, search)
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
    this.userForm.value.nom = this.userForm.value.nom.toLowerCase();
    this.userForm.value.password = this.DEFAULT_PASSWORD;

    console.log(this.userForm.value);

    this.userService.createUser(this.userForm.value).subscribe(
      () => {
        this.error = "none";
        this.userForm.reset();
        this.getDataJson();
        modal.close("Cross click");
      },
      (err) => {
        this.error = err.message;
        console.log(typeof this.error);

        console.log(this.error);
      }
    );
  }

  dismissModal(modal) {
    this.userForm.reset();
    modal.dismiss("Cross click");
  }

  // delete user
  delete(data) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur?")) {
      this.userService.deleteUser(data._id).subscribe(() => {
        console.log("utilisateur supprimé");
        this.getDataJson(null, null, null, null, this.val);
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

    this.router.navigate(["/modifier-personel"], navigationExtras);
  }

  // confirm user modification
  save() {
    console.log(this.userModifyForm.value);
    this.userService
      .updateUser(this.userId, this.userModifyForm.value)
      .subscribe((data) => {
        console.log(data);
        this.router.navigate(["/gestion-personel"]);
      });
  }

  //SHOW DEFAULT PASSWORD
  showDefaultPassword() {
    alert("Mot de passe par défaut est: " + this.DEFAULT_PASSWORD);
  }
}
