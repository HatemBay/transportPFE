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
import { FormGroup, FormBuilder } from "@angular/forms";
import { HistoriqueService } from "src/app/services/historique.service";
import { VilleService } from "src/app/services/ville.service";

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
  villes: any = [];
  submit: boolean = false;
  historic: any = [
    { state: "nouveau", viewState: "Colis créé le " },
    { state: "pret", viewState: "Colis modifié le " },
    { state: "collecté", viewState: "Collecté" },
    { state: "ramassé par livreur", viewState: "Rammasé par livreur le " },
    { state: "en cours", viewState: "En cours" },
    { state: "reporté", viewState: "Reporté" },
    { state: "livré (espèce)", viewState: "Livré le " },
    { state: "livré (chèque)", viewState: "Livré le " },
    { state: "annulé", viewState: "Annulé le " },
    { state: "payé", viewState: "Payé le " },
  ];

  constructor(
    private fb: FormBuilder,
    public client: ClientService,
    private pack: PackageService,
    private historiqueService: HistoriqueService,
    private villeService: VilleService,
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
  getActors(CAB?: any, tel?: any, nom?: any, adresse?: any, delegation?: any) {
    this.pack
      .getSearchPackages(CAB, tel, nom, adresse, delegation)
      .subscribe((data) => {
        this.packageData = data;
      });
  }


  public getIndex(historic, historique) {
    var index = historic.findIndex((p) => p.state == historique?.action);
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
          this.packageDelegation
        );
      });
    }
  }
  //************************ GENERAL ************************
  //************************ PATH = RECHERCHE ************************

  //************************ PATH = RECHERCHE ************************
  //************************ PATH = RECHERCHE-AV ************************
  public getPackage() {
    this.pack.getSearchPackages(this.packageCAB).subscribe((data) => {
      this.package = data[0];
    });
  }

  getVilles() {
    this.villeService.getVilles().subscribe(data => {
      this.villes = data.data;
    })
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
        villeId: this.searchForm.value.villeId,
        action: true,
      },
    };
    this.router.navigate(["/recherche-av-sub"], navigationExtras);
  }

  //************************ PATH = RECHERCHE-AV ************************
}
