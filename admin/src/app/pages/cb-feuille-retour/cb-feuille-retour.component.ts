import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { PackageService } from "src/app/services/package.service";
import { UserService } from "src/app/services/user.service";

@Component({
  selector: "app-cb-feuille-retour",
  templateUrl: "./cb-feuille-retour.component.html",
  styleUrls: ["./cb-feuille-retour.component.scss"],
})
export class CbFeuilleRetourComponent implements OnInit {
  routePath: string;
  fournisseursForm: FormGroup;
  chauffeursForm: FormGroup;

  temp: any = [];
  rows: any = [];
  public columns: Array<object>;
  count: any;
  chauffeurs: any = [];
  fournisseurs: any = [];
  fournisseur: any;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private userService: UserService,
    private packageService: PackageService
  ) {
    this.routePath = this.route.snapshot.routeConfig.path;
  }

  ngOnInit(): void {
    if (this.routePath === "feuille-de-retour") {
      this.columns = [
        { prop: "roadmapNb", name: "Code à barre" },
        { prop: "nbPackages", name: "Etat" },
        { prop: "nomd", name: "Nom & prénom" },
        { prop: "villec", name: "Ville" },
        { prop: "c_remboursement", name: "COD" },
        { prop: "createdAtSearch", name: "Date" },
      ];

      this.fournisseursForm = this.fb.group({
        fournisseurs: ["", Validators.required],
      });

      this.chauffeursForm = this.fb.group({
        chauffeurs: ["", Validators.required],
      });
      this.getProviders();
      this.getChauffeurs();
      this.getPackagesByProvider(this.fournisseurs[0]._id);
    } else {
      this.columns = [
        { prop: "roadmapNb", name: "N° bon de sortie" },
        { prop: "nbPackages", name: "Nbre de colis" },
        { prop: "nomd", name: "Chauffeur" },
        { prop: "createdAtSearch", name: "Date" },
      ];

      // this.countRoadmaps();
      // this.getRoadmapData();
    }
  }

  get f() {
    return this.fournisseursForm.controls;
  }

  getChauffeurs() {
    this.userService.getUsersByRole("chauffeur").subscribe((data) => {
      this.chauffeurs = data;
    });
  }
  getProviders() {
    this.userService.getUsersByRole("fournisseur").subscribe((data) => {
      this.fournisseurs = data;
    });
  }
  getPackagesByProvider(id: any) {
    this.packageService.getPackageByProvider(id).subscribe((data) => {
      this.rows = this.temp = data;
    });
  }
}
