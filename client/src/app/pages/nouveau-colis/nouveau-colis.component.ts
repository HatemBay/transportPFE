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
import { async, firstValueFrom, lastValueFrom } from "rxjs";
import { startWith, map } from "rxjs/operators";
import { AuthenticationService } from "src/app/services/authentication.service";
import { PackageService, IPackage } from "src/app/services/package.service";
import { DelegationService } from "src/app/services/delegation.service";
import { VilleService } from "src/app/services/ville.service";
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
  submit: boolean = false;
  villes: Object;
  delegations: Object;

  constructor(
    private fb: FormBuilder,
    public clientService: ClientService,
    private packageService: PackageService,
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
          "",
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
          console.log("in");

          this.getActors();
          // this.clientData = this.datacl[0]
        }
      }
    }
    if (this.routePath == "details-colis") {
      this.getPackage();
    }
  }
  get f() {
    return this.packageForm.controls;
  }

  onChanges(): void {
    this.packageForm.get("villeId").valueChanges.subscribe((val) => {
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

  //************************ PATH = NOUVEAU-COLIS / MODIFIER-COLIS ************************
  getActors() {
    this.packageService.getFullPackage(this.packageId).subscribe((data) => {
      if (
        data[0].clientId == this.clientId &&
        data[0].fournisseurId == this.auth.getUserDetails()._id
      ) {
        console.log("data3");
        console.log(data[0]);

        this.packageForm.patchValue({
          tel: data[0].telc,
          nom: data[0].nomc,
          villeId: data[0].villeId,
          delegationId: data[0].delegationId,
          adresse: data[0].adressec,
          codePostale: data[0].codepostalc,
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
        console.log("result");
        console.log(result[0]._id);
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
                console.log(this.error);
                console.log(err.message.object);

                if (this.error.indexOf("tel_1") !== -1) {
                  this.clientService
                    .getClientByPhone(client.tel)
                    .subscribe((result) => {
                      // *if we're gonna test the other fields while we entered the phone number
                      console.log("ehe");
                      if (
                        //*add ville & delegation tests after settling them
                        this.packageForm.value.nom == result[0].nom &&
                        this.packageForm.value.adresse == result[0].adresse &&
                        this.packageForm.value.codePostale ==
                          result[0].codepostal &&
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
              (res) => {
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
                    this.router.navigate(["/liste-colis"], navigationExtras);
                  });
              },
              (err) => {
                this.error = err.message.error;
                const client = err.message.object;
                console.log(this.error);
                console.log(err.message.object);

                if (this.error.indexOf("tel_1") !== -1) {
                  this.clientService
                    .getClientByPhone(client.tel)
                    .subscribe((result) => {
                      // *if we're gonna test the other fields while we entered the phone number
                      console.log("ehe");
                      if (
                        //*add ville & delegation tests after settling them
                        this.packageForm.value.nom == result[0].nom &&
                        this.packageForm.value.adresse == result[0].adresse &&
                        this.packageForm.value.codePostale ==
                          result[0].codepostal &&
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
    console.log(this.packageForm.value);
    console.log(JSON.stringify(this.packageForm.value));

    this.clientService
      .updateClient(this.clientId, JSON.stringify(this.packageForm.value))
      .subscribe((res) => {
        // console.log(res);
        this.packageForm.value.clientId = this.clientId;
        console.log("client updated");

        this.packageService
          .updatePackage(this.packageId, JSON.stringify(this.packageForm.value))
          .subscribe(
            (res) => {
              // console.log(res);
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
    console.log(this.packageState);
  }

  async checkData(): Promise<boolean> {
    return this.packageId && this.clientId;
  }

  //************************ PATH = NOUVEAU-COLIS / MODIFIER-COLIS ************************
  //************************ PATH = DETAILS-COLIS ************************
  public getPackage() {
    this.packageService.getFullPackage(this.packageId).subscribe((data) => {
      this.package = data[0];
      console.log("data:");
      console.log(data);

      console.log("package:");
      console.log(this.package);
    });
  }

  //************************ PATH = DETAILS-COLIS ************************

  //*test
  searchPhones(event) {
    if (event.target.value.length > 2) {
      this.clientService
        .getClients(null, null, null, null, event.target.value, "tels")
        .subscribe((data) => {
          console.log(data);

          this.clients = data;
        });
    }
  }

  importClient(event) {
    console.log("event");
    console.log(event.target.value);
    var id;
    this.clients.forEach((element) => {
      if (element.tel == event.target.value) {
        id = element._id;
        console.log(element);

        this.packageForm.patchValue({
          tel: element.tel,
          nom: element.nom,
          villeId: element.villeId,
          delegationId: element.delegationId,
          adresse: element.adresse,
          codePostale: element.codepostal,
          tel2: element.tel2,
        });
      }
    });
    // this.clientService.getClient(id).subscribe((data) => {
    //   console.log("data");
    //   console.log(data[0]);

    //   this.packageForm.patchValue({
    //     tel: data[0].telc,
    //     nom: data[0].nomc,
    //     ville: data[0].villec,
    //     delegation: data[0].delegationc,
    //     adresse: data[0].adressec,
    //     codePostale: data[0].codepostalc,
    //     tel2: data[0].tel2c,
    //   });
    // });
  }
}
