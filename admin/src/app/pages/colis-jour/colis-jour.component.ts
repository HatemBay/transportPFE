import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { async, firstValueFrom, lastValueFrom } from "rxjs";
import { startWith, map } from "rxjs/operators";
import { AuthenticationService } from "src/app/services/authentication.service";
import { ClientService, IClient } from "src/app/services/client.service";
import { PackageService, IPackage } from "src/app/services/package.service";

@Component({
  selector: "app-colis-jour",
  templateUrl: "./colis-jour.component.html",
  styleUrls: ["./colis-jour.component.scss"],
})
export class ColisJourComponent implements OnInit {
  public clientData: IClient = {};
  packageData: IPackage = {};
  packageForm: FormGroup;
  modifData: any;
  packageId: any;
  clientId: any;
  routePath: any;
  nextClicked = false;
  checkIds: boolean = false;
  package: any = [];

  constructor(
    private fb: FormBuilder,
    public client: ClientService,
    private pack: PackageService,
    private auth: AuthenticationService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.routePath = this.route.snapshot.routeConfig.path;

    this.packageId = this.route.snapshot.queryParamMap.get("packageId");
    this.clientId = this.route.snapshot.queryParamMap.get("clientId");
  }

  ngOnInit() {
    if (this.routePath == "nouveau-colis") {
      if (this.checkData()) {
        this.getActors();
        // this.clientData = this.datacl[0]
      }

      this.packageForm = this.fb.group({
        tel: [this.clientData.tel, Validators.required],
        nom: [this.clientData.nom, Validators.required],
        ville: [this.clientData.ville, Validators.required],
        delegation: [this.clientData.delegation, Validators.required],
        adresse: [this.clientData.adresse, Validators.required],
        codePostale: this.clientData.codePostale,
        tel2: this.clientData.tel2,

        c_remboursement: [
          this.packageData.c_remboursement,
          Validators.required,
        ],
        service: [this.packageData.service, Validators.required],
        libelle: [this.packageData.libelle, Validators.required],
        volume: [this.packageData.volume, Validators.required],
        poids: this.packageData.poids,
        pieces: this.packageData.pieces,
        remarque: this.packageData.remarque,
      });

      this.packageForm.valueChanges
        .pipe(startWith(this.packageForm.value))
        .subscribe((data) => this.onPackageFormValueChanges(data));
    }
    if (this.routePath == "modifier-colis") {

      this.getPackage();
    }
  }

  //************************ PATH = NOUVEAU-COLIS ************************
  getActors() {
    this.pack.getPackage(this.packageId).subscribe((data) => {
      if (
        data.clientId == this.clientId &&
        data.fournisseurId == this.auth.getUserDetails()._id
      ) {
        this.packageData = data;
        console.log("s");
        console.log(this.packageData);
        this.client.getClient(this.clientId).subscribe((data) => {
          this.clientData = data;
          console.log("s");
          console.log(this.clientData);
        });
        this.checkIds = true;
      } else {
        console.log("wrong data");
      }
    });
  }

  onPackageFormValueChanges(data: any): void {
    this.clientData.tel = data.tel || this.clientData.tel;
    this.clientData.nom = data.nom || this.clientData.nom;
    this.clientData.ville = data.ville || this.clientData.ville;
    this.clientData.delegation = data.delegation || this.clientData.delegation;
    this.clientData.adresse = data.adresse || this.clientData.adresse;
    this.clientData.codePostale =
      data.codePostale || this.clientData.codePostale;
    this.clientData.tel2 = data.tel2 || this.clientData.tel2;

    this.packageData.c_remboursement =
      data.c_remboursement || this.packageData.c_remboursement;
    this.packageData.service = data.service || this.packageData.service;
    this.packageData.libelle = data.libelle || this.packageData.libelle;
    this.packageData.volume = data.volume || this.packageData.volume;
    this.packageData.poids = data.poids || this.packageData.poids;
    this.packageData.pieces = data.pieces || this.packageData.pieces;
    this.packageData.remarque = data.remarque || this.packageData.remarque;
    this.packageData.fournisseurId =
      this.auth.getUserDetails()._id || this.packageData.fournisseurId;
  }

  validate(): void {
    this.client.createClient(this.clientData);
    this.pack.createPackage(this.packageData);
  }

  save() {
    this.client.createClient(this.clientData).subscribe(
      (res) => {
        // console.log(res);
        this.client.getClientByPhone(res.tel).subscribe(
          (result) => {
            // console.log(result[0]._id);
            this.packageData.clientId = result[0]._id;
            this.pack.createPackage(this.packageData).subscribe(
              (res) => {
                // console.log(res);
                console.log("created");
                this.router.navigate(["/tables"]);
              },
              (error) => {
                console.log(error);
              }
            );
          },
          (err) => {
            console.log(err);
          }
        );
      },
      (err) => {
        console.log(err);
      }
    );
  }

  update() {
    console.log(this.clientData);

    this.client
      .updateClient(this.clientId, this.clientData)
      .subscribe((res) => {
        // console.log(res);
        this.packageData.clientId = this.clientId;
        this.pack.updatePackage(this.packageId, this.packageData).subscribe(
          (res) => {
            // console.log(res);
            this.router.navigate(["/tables"]);
          },
          (error) => {
            console.log(error);
          }
        );
      });
    (err) => {
      console.log(err);
    };
  }

  public onSubmit(): void {
    if (this.nextClicked) {
      this.update();
    } else {
      this.save();
    }
  }

  public onPreviousClick(): void {
    this.nextClicked = true;
  }

  public onNextClick(): void {
    this.nextClicked = false;
  }

  checkData(): boolean {
    return this.packageId && this.clientId;
  }

  //************************ PATH = NOUVEAU-COLIS ************************
  //************************ PATH = MODIFIER-COLIS ************************
  public getPackage() {
    this.pack.getFullPackage(this.packageId).subscribe((data) => {
      this.package = data[0];
      console.log("data:");
      console.log(data);

      console.log("package:");
      console.log(this.package);

    })
  }

  //************************ PATH = MODIFIER-COLIS ************************
}
