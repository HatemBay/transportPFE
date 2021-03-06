import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { PackageService } from "src/app/services/package.service";
import { ActivatedRoute, NavigationExtras, Router } from "@angular/router";
import { FormGroup, FormBuilder } from "@angular/forms";
import { VilleService } from "src/app/services/ville.service";
import { ClientService } from "src/app/services/client.service";
import { AuthenticationService } from "src/app/services/authentication.service";
import { HistoriqueService } from "src/app/services/historique.service";

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
  packageVille: any;
  packageAction: any = false;
  clientId: any;
  routePath: any;
  role: any;
  nextClicked = false;
  checkIds: boolean = false;
  package: any = [];
  villes: any = [];
  submit: boolean = false;
  historic: any = [
    { state: "nouveau", viewState: "Colis créé le " },
    { state: "pret", viewState: "Colis pret le " },
    {
      state: "en cours de ramassage",
      viewState: "Attribué pour ramassage le ",
    },
    { state: "collecté", viewState: "Collecté" },
    { state: "ramassé par livreur", viewState: "Rammasé par livreur le " },
    { state: "en cours", viewState: "En cours de livraison le " },
    { state: "reporté", viewState: "Reporté le " },
    { state: "livré (espèce)", viewState: "Livré le " },
    { state: "livré (chèque)", viewState: "Livré le " },
    { state: "annulé", viewState: "Annulé le " },
    { state: "payé", viewState: "Payé le " },
    { state: "en cours de retour", viewState: "Attribué pour retour le " },
    { state: "retourné", viewState: "Retourné à " },
    { state: "retourné à l'expediteur", viewState: "Retour définitif le " },
    { state: "livré - payé - espèce", viewState: "Livré - payé - espèce " },
    { state: "livré - payé - chèque", viewState: "Livré - payé - chèque " },
    { state: "modifié par admin", viewState: "Modifié par admin le" },
  ];

  constructor(
    private fb: FormBuilder,
    private packageService: PackageService,
    private historiqueService: HistoriqueService,
    private villeService: VilleService,
    private authService: AuthenticationService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.routePath = this.route.snapshot.routeConfig.path;

    this.packageCAB = this.route.snapshot.queryParamMap.get("CAB");
    this.packageTel = this.route.snapshot.queryParamMap.get("tel");
    this.packageNom = this.route.snapshot.queryParamMap.get("nom");
    this.packageAdresse = this.route.snapshot.queryParamMap.get("adresse");
    this.packageVille = this.route.snapshot.queryParamMap.get("villeId");
    this.role = this.authService.getUserDetails().role;
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
        this.packageVille
      );
    }
    if (this.routePath == "recherche-av") {
      this.getVilles();
      this.searchForm = this.fb.group({
        CAB: "",
        tel: "",
        nom: "",
        adresse: "",
        villeId: "",
      });
    }
  }

  get f() {
    return this.searchForm.controls;
  }

  //************************ GENERAL ************************
  getActors(
    CAB?: any,
    tel?: any,
    nom?: any,
    adresse?: any,
    ville?: any,
    delegation?: any
  ) {
    this.packageService
      .getSearchPackages(CAB, tel, nom, adresse, ville)
      .subscribe((data) => {
        console.log('searchPack');
        console.log(data);

        this.packageData = data;
      });
  }

  public getIndex(historique) {
    var index = this.historic.findIndex((p) => p.state == historique?.action);
    return index;
  }

  public deleteState(historique) {
    if (
      confirm("Êtes-vous sûr de vouloir supprimer cet état de l'historique?")
    ) {
      this.historiqueService.deleteHistorique(historique._id).subscribe(() => {
        this.getActors(
          this.packageCAB,
          this.packageTel,
          this.packageNom,
          this.packageAdresse,
          this.packageVille
        );
      });
    }
  }
  //************************ GENERAL ************************
  //************************ PATH = RECHERCHE ************************
  modifyPackage(pack) {
    var navigationExtras: NavigationExtras = {
      queryParams: {
        packageId: pack._id,
        clientId: pack.clientId,
      },
    };
    this.router.navigate(["/modifier-colis"], navigationExtras);
  }

  printPackage(pack) {
    console.log(pack._id);

    var navigationExtras: NavigationExtras = {
      queryParams: {
        packageId: pack._id,
      },
    };
    const url = this.router.serializeUrl(
      this.router.createUrlTree(["/imprimer-colis"], navigationExtras)
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
    }, 1000);
  }

  // delete package
  delete(data) {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce colis?")) {
      this.packageService.deletePackage(data._id).subscribe(() => {
        console.log("package deleted");
      });
      var navigationExtras: NavigationExtras = {
        queryParams: {
          success: true,
        },
      };
      this.router.navigate(["/gestion-colis"], navigationExtras);
    }
  }

  calculateAttempts(historique) {
    var counter = 0;
    historique.forEach((element) => {
      if (element.action == "en cours") counter += 1;
    });
    return counter;
  }

  //************************ PATH = RECHERCHE ************************
  //************************ PATH = RECHERCHE-AV ************************
  public getPackage() {
    this.packageService.getSearchPackages(this.packageCAB).subscribe((data) => {
      this.package = data[0];
    });
  }

  getVilles() {
    this.villeService.getVilles().subscribe((data) => {
      this.villes = data.data;
    });
  }

  onSearchFormValueChanges(data: any): void {
    this.searchData.CAB = data.CAB;
  }

  search() {
    console.log(this.searchForm.value);

    var navigationExtras: NavigationExtras = {
      queryParams: {
        CAB: this.searchForm.value.CAB,
        tel: this.searchForm.value.tel,
        nom: this.searchForm.value.nom,
        adresse: this.searchForm.value.adresse,
        villeId: this.searchForm.value.villeId,
        action: true,
      },
    };
    this.router.navigate(["/recherche-av-sub"], navigationExtras);
  }

  //************************ PATH = RECHERCHE-AV ************************
}
