import { ClientService } from "./../../services/client.service";
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, NavigationExtras, Router } from "@angular/router";
import { map } from "rxjs/operators";
import { AuthenticationService } from "src/app/services/authentication.service";
import { PackageService, IPackage } from "src/app/services/package.service";
import { DelegationService } from "src/app/services/delegation.service";
import { VilleService } from "src/app/services/ville.service";
import { HistoriqueService } from "src/app/services/historique.service";
// import {  } from "@smarthtmlelements/smart-elements"

@Component({
  selector: "app-nouveau-colis",
  templateUrl: "./nouveau-colis.component.html",
  styleUrls: ["./nouveau-colis.component.scss"],
})
export class NouveauColisComponent implements OnInit {
  packageForm: FormGroup;
  clients: any = [];
  modifData: any;
  packageId: any;
  clientId: any;
  packageState: string;
  routePath: any;
  nextClicked = false;
  checkIds: boolean = false;
  error: string = "none";
  package: any = [];
  historique: any = [];
  submit: boolean = false;
  villes: Object;
  delegations: Object;
  historic: any = [
    { state: "nouveau", viewState: "Colis créé le " },
    { state: "pret", viewState: "Colis pret le " },
    {
      state: "en cours de ramassage",
      viewState: "Attribué pour ramassage ramassage le ",
    },
    { state: "collecté", viewState: "Collecté" },
    { state: "ramassé par livreur", viewState: "Rammasé par livreur le " },
    { state: "en cours", viewState: "En cours" },
    { state: "reporté", viewState: "Reporté" },
    { state: "livré (espèce)", viewState: "Livré le " },
    { state: "livré (chèque)", viewState: "Livré le " },
    { state: "annulé", viewState: "Annulé le " },
    { state: "payé", viewState: "Payé le " },
    { state: "en cours de retour", viewState: "Attribué pour retour le " },
    { state: "retourné", viewState: "Retourné à " },
    { state: "retourné à l'expediteur", viewState: "Retourné à " },
    { state: "livré - payé - espèce", viewState: "Livré - payé - espèce " },
    { state: "livré - payé - chèque", viewState: "Livré - payé - chèque " },
    { state: "modifié par admin", viewState: "Modifié par admin le" },
  ];

  constructor(
    private fb: FormBuilder,
    public clientService: ClientService,
    private packageService: PackageService,
    private historiqueService: HistoriqueService,
    private delegationService: DelegationService,
    private villeService: VilleService,
    private auth: AuthenticationService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.routePath = this.route.snapshot.routeConfig.path;

    this.packageId = this.route.snapshot.queryParamMap.get("packageId");
    this.clientId = this.route.snapshot.queryParamMap.get("clientId");
  }

  async ngOnInit(): Promise<void> {
    if (
      this.routePath == "nouveau-colis" ||
      this.routePath == "modifier-colis"
    ) {
      this.getVilles();
      this.packageForm = this.fb.group({
        tel: [
          ,
          [
            Validators.required,
            Validators.min(10000000),
            Validators.max(99999999),
          ],
        ],
        nom: ["", Validators.required],
        villeId: ["", Validators.required],
        delegationId: ["", Validators.required],
        adresse: ["", Validators.required],
        codePostale: "",
        tel2: "",

        c_remboursement: ["", Validators.required],
        service: ["", Validators.required],
        libelle: ["", Validators.required],
        volume: ["", Validators.required],
        poids: "",
        pieces: "",
        remarque: "",
      });

      this.onChanges();
      if (this.routePath == "modifier-colis") {
        await this.checkPackage();

        if (this.checkData() && this.packageState == "nouveau") {
          this.getActors();
          // this.clientData = this.datacl[0]
        }
      }
    }
    if (this.routePath == "details-colis") {
      await this.getPackage();
      this.getHistorique();
    }
  }
  get f() {
    return this.packageForm.controls;
  }

  onChanges(): void {
    this.packageForm.get("villeId").valueChanges.subscribe((val) => {
      if (val !== null) this.getDelegations(val);
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

  //************************ PATH = NOUVEAU-COLIS / MODIFIER-COLIS ************************
  getActors() {
    this.packageService.getFullPackage(this.packageId).subscribe((data) => {
      if (
        data[0].clientId == this.clientId &&
        data[0].fournisseurId == this.auth.getUserDetails()._id
      ) {
        this.packageForm.patchValue({
          tel: data[0].telc,
          nom: data[0].nomc,
          villeId: data[0].villeId,
          delegationId: data[0].delegationId,
          adresse: data[0].adressec,
          codePostale: data[0].codePostalec,
          tel2: data[0].tel2c,
          c_remboursement: data[0].c_remboursement,
          service: data[0].service,
          libelle: data[0].libelle,
          volume: data[0].volume,
          poids: data[0].poids,
          pieces: data[0].pieces,
          remarque: data[0].remarque,
        });
        this.checkIds = true;
        console.log("slmslmslmmmmmm");

        console.log(this.packageForm.value);
      } else {
        console.log("wrong data");
        console.log(data[0]);
      }
    });
  }

  // validate(): void {
  //   this.clientService.createClient(this.clientData);
  //   this.packageService.createPackage(this.packageData);
  // }

  save() {
    this.submit = true;
    this.packageForm.value.fournisseurId = this.auth.getUserDetails()._id;

    //TODO: improve code by using promises (should significantly shorten the code)
    this.clientService
      .getClientByPhone(this.packageForm.value.tel)
      .subscribe((result) => {
        if (result == []) {
          this.clientService
            .createClient(JSON.stringify(this.packageForm.value))
            .subscribe(
              (res) => {
                this.clientService
                  .getClientByPhone(res.tel)
                  .subscribe((result2) => {
                    this.packageForm.value.clientId = result2[0]._id;
                    this.packageService
                      .createPackage(JSON.stringify(this.packageForm.value))
                      .subscribe(() => {
                        var added: boolean = true;
                        console.log("created");
                        var navigationExtras: NavigationExtras = {
                          queryParams: {
                            added,
                          },
                        };
                        this.router.navigate(
                          ["/liste-colis"],
                          navigationExtras
                        );
                      });
                  });
              },
              (err) => {
                this.error = err.message.error;
                const client = err.message.object;

                if (this.error.indexOf("tel_1") !== -1) {
                  this.clientService
                    .getClientByPhone(client.tel)
                    .subscribe((result) => {
                      // *if we're gonna test the other fields while we entered the phone number
                      if (
                        //*add ville & delegation tests after settling them
                        this.packageForm.value.nom == result[0].nom &&
                        this.packageForm.value.adresse == result[0].adresse &&
                        this.packageForm.value.codePostale ==
                          result[0].codePostale &&
                        this.packageForm.value.tel2 == result[0].tel2
                      ) {
                        this.packageForm.value.clientId = result[0]._id;
                        this.packageService
                          .createPackage(JSON.stringify(this.packageForm.value))
                          .subscribe(() => {
                            var added: boolean = true;
                            console.log("created");
                            var navigationExtras: NavigationExtras = {
                              queryParams: {
                                added,
                              },
                            };
                            this.router.navigate(
                              ["/liste-colis"],
                              navigationExtras
                            );
                          });
                      } else {
                        this.error =
                          "les autres champs ne sont pas identiques avec ce client";
                        console.log(this.error);
                      }
                    });
                }
              }
            );
        } else {
          this.clientService
            .createClient(JSON.stringify(this.packageForm.value))
            .subscribe(
              (result) => {
                this.packageForm.value.clientId = result._id;
                this.packageService
                  .createPackage(JSON.stringify(this.packageForm.value))
                  .subscribe(() => {
                    var added: boolean = true;
                    console.log("created");
                    var navigationExtras: NavigationExtras = {
                      queryParams: {
                        added,
                      },
                    };
                    this.router.navigate(["/liste-colis"], navigationExtras);
                  });
              },
              (err) => {
                this.error = err.message.error;
                const client = err.message.object;

                if (this.error.indexOf("tel_1") !== -1) {
                  this.clientService
                    .getClientByPhone(client.tel)
                    .subscribe((result) => {
                      console.log(result[0]);

                      // *if we're gonna test the other fields while we entered the phone number
                      if (
                        //*add ville & delegation tests after settling them
                        this.packageForm.value.nom == result[0].nom &&
                        this.packageForm.value.adresse == result[0].adresse &&
                        this.packageForm.value.codePostale ==
                          result[0].codePostale &&
                        this.packageForm.value.tel2 == result[0].tel2
                      ) {
                        this.packageForm.value.clientId = result[0]._id;
                        this.packageService
                          .createPackage(JSON.stringify(this.packageForm.value))
                          .subscribe(() => {
                            var added: boolean = true;
                            console.log("created");
                            var navigationExtras: NavigationExtras = {
                              queryParams: {
                                added,
                              },
                            };
                            this.router.navigate(
                              ["/liste-colis"],
                              navigationExtras
                            );
                          });
                      } else {
                        this.error =
                          "les autres champs ne sont pas identiques avec ce client";
                        console.log(this.error);
                      }
                    });
                }
              }
            );
        }
      });
  }

  update() {
    this.submit = true;
    this.packageForm.value.fournisseurId = this.auth.getUserDetails()._id;

    this.clientService
      .updateClient(this.clientId, JSON.stringify(this.packageForm.value))
      .subscribe((res) => {
        this.packageForm.value.clientId = this.clientId;
        console.log("client updated");

        console.log(this.packageForm.value);

        this.packageService
          .updatePackage(this.packageId, JSON.stringify(this.packageForm.value))
          .subscribe(
            (res) => {
              console.log("package updated");

              var edited: boolean = true;
              var navigationExtras: NavigationExtras = {
                queryParams: {
                  edited,
                },
              };
              this.router.navigate(["/liste-colis"], navigationExtras);
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
  async checkPackage() {
    this.packageState = await this.packageService
      .getPackage(this.packageId)
      .pipe(
        map((data) => {
          return data.etat;
        })
      )
      .toPromise();
  }

  async checkData(): Promise<boolean> {
    return this.packageId && this.clientId;
  }

  //************************ PATH = NOUVEAU-COLIS / MODIFIER-COLIS ************************
  //************************ PATH = DETAILS-COLIS ************************
  public async getPackage() {
    return await this.packageService
      .getFullPackage(this.packageId)
      .pipe(
        map((data) => {
          this.package = data[0];
        })
      )
      .toPromise();
  }

  public getHistorique() {
    this.historiqueService
      .getHistoriqueByPackageId(this.packageId)
      .subscribe((data) => {
        this.historique = data;
      });
  }

  public getIndex(historique) {
    var index = this.historic.findIndex((p) => p.state == historique?.action);
    return index;
  }

  //************************ PATH = DETAILS-COLIS ************************

  //*test
  searchPhones(event) {
    if (event.target.value.length > 2) {
      this.clientService
        .getClients(null, null, null, null, event.target.value, "tels")
        .subscribe((data) => {
          this.clients = data.data;
        });
    }
  }

  importClient(event) {
    for (const element of this.clients) {
      if (element.tel == event.target.value) {
        this.packageForm.patchValue({
          tel: element.tel,
          nom: element.nom,
          villeId: element.villeId,
          delegationId: element.delegationId,
          adresse: element.adresse,
          codePostale: element.codePostale,
          tel2: element.tel2,
        });
        break;
      }
      //* the next code will clear other inputs when another phone number is selecetd
      // else {
      //   this.packageForm.patchValue({
      //     nom: null,
      //     villeId: null,
      //     delegationId: null,
      //     adresse: null,
      //     codePostale: null,
      //     tel2: null,
      //   });
      // }
    }
  }
}
