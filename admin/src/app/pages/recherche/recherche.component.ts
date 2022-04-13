import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { PackageService } from "src/app/services/package.service";
import { ClientService } from "src/app/services/client.service";
import { ActivatedRoute, NavigationExtras, Router } from "@angular/router";
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
} from "@angular/forms";
import { startWith } from "rxjs";
import { AuthenticationService } from "src/app/services/authentication.service";

@Component({
  selector: "app-recherche",
  templateUrl: "./recherche.component.html",
  styleUrls: ["./recherche.component.scss"],
})
export class RechercheComponent implements OnInit {
  packageData: any = [];
  searchForm: FormGroup;
  searchData: any;
  modifData: any;
  packageCAB: any;
  packageTel: any;
  packageNom: any;
  packageAdresse: any;
  packageDelegation: any;
  packageAction: any = false;
  clientId: any;
  routePath: any;
  nextClicked = false;
  checkIds: boolean = false;
  package: any = [];
  submit: boolean = false;

  constructor(
    private fb: FormBuilder,
    public client: ClientService,
    private pack: PackageService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.routePath = this.route.snapshot.routeConfig.path;

    this.packageCAB = this.route.snapshot.queryParamMap.get("CAB");
    this.packageTel = this.route.snapshot.queryParamMap.get("tel");
    this.packageNom = this.route.snapshot.queryParamMap.get("nom");
    this.packageAdresse = this.route.snapshot.queryParamMap.get("adresse");
    this.packageDelegation =
      this.route.snapshot.queryParamMap.get("delegation");
  }

  ngOnInit() {
    if (this.route.snapshot.queryParamMap.get("action")) {
      this.packageAction = true;
    }

    if (this.routePath == "recherche" || this.routePath == "recherche-av-sub") {
      this.getActors(
        this.packageCAB,
        this.packageTel,
        this.packageNom,
        this.packageAdresse,
        this.packageDelegation
      );
    }
    if (this.routePath == "recherche-av") {
      this.searchForm = this.fb.group({
        CAB: "",
        tel: "",
        nom: "",
        adresse: "",
        delegation: "",
      });
    }
  }

  get f() {
    return this.searchForm.controls;
  }

  //************************ GENERAL ************************
  getActors(CAB?: any, tel?: any, nom?: any, adresse?: any, delegation?: any) {
    this.pack
      .getSearchPackages(CAB, tel, nom, adresse, delegation)
      .subscribe((data) => {
        this.packageData = data;
      });
  }
  //************************ GENERAL ************************
  //************************ PATH = RECHERCHE ************************

  //************************ PATH = RECHERCHE ************************
  //************************ PATH = RECHERCHE-AV ************************
  public getPackage() {
    this.pack.getSearchPackages(this.packageCAB).subscribe((data) => {
      this.package = data[0];
      console.log("data:");
      console.log(data);

      console.log("package:");
      console.log(this.package);
    });
  }

  onSearchFormValueChanges(data: any): void {
    this.searchData.CAB = data.CAB;
  }

  onSubmit() {
    var navigationExtras: NavigationExtras = {
      queryParams: {
        CAB: this.searchForm.value.CAB,
        tel: this.searchForm.value.tel,
        nom: this.searchForm.value.nom,
        adresse: this.searchForm.value.adresse,
        delegation: this.searchForm.value.delegation,
        action: true,
      },
    };
    this.router.navigate(["/recherche-av-sub"], navigationExtras);
  }

  //************************ PATH = RECHERCHE-AV ************************
}
