import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { NavigationExtras, Router } from "@angular/router";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { saveAs } from "file-saver";
import { map } from "rxjs";
import { AuthenticationService } from "src/app/services/authentication.service";
import { DelegationService } from "src/app/services/delegation.service";
import { FileExcelService } from "src/app/services/file-excel.service";
import { PackageService } from "src/app/services/package.service";

@Component({
  selector: "app-excel",
  templateUrl: "./excel.component.html",
  styleUrls: ["./excel.component.scss"],
})
export class ExcelComponent implements OnInit {
  @ViewChild("editModal") editModal: TemplateRef<any>;

  myFile: any;
  fileName = "";
  formData: FormData;
  errors: any = {};
  display: string = "default";
  delegations: string[] = [];
  excelData: any = [];
  errs: any;
  constructor(
    private auth: AuthenticationService,
    private packageService: PackageService,
    private delegationService: DelegationService,
    private router: Router,
    private fileExcelService: FileExcelService
  ) {}

  ngOnInit(): void {
    this.initiateData();
  }

  async initiateData() {
    this.delegations = await this.delegationService
      .getDelegations()
      .pipe(
        map((data) => {
          var delegations = [];
          for (let el of data.data) {
            delegations.push(el.nom);
          }
          return delegations;
        })
      )
      .toPromise();
    console.log(this.delegations);
  }

  onFileSelected(event) {
    this.errors = {};
    this.excelData = [];
    const file: File = event.target.files[0];
    this.fileExcelService
      .convertExcelToJson(event.target.files[0])
      .then((res) => {
        const jsonData = JSON.parse(JSON.stringify(res));

        // console.log(data);
        for (let row of jsonData) {
          if (row.Etat) {
            this.excelData.push(row);
          }
          if (!row.Tél) break;
        }

        console.log(this.excelData);

        this.excelData.forEach((row, index) => {
          //TODO: test on nom & prenom
          if (
            row.Etat in
            [
              "nouveau",
              "pret",
              "ramassé par livreur",
              "collecté",
              "en cours",
              "livré (espèce)",
              "livré (chèque)",
              "annulé",
              "reporté",
            ]
          ) {
            console.log("slm");
          } else {
            console.log("was");
            this.errors["ligne" + (index + 1)] =
              row.Etat + " is not a valid enum value for path `etat`";
          }

          if (!(row.Tél.toString().length === 8 && !isNaN(row.Tél))) {
            this.errors["ligne" + (index + 1)] =
              "numéro de téléphone incorrect";
          }

          console.log(row.délegation.toString().toLowerCase());

          console.log(
            this.delegations.indexOf(
              row.délegation.toString().toLowerCase()
            ) === -1
          );

          if (
            this.delegations.indexOf(
              row.délegation.toString().toLowerCase()
            ) === -1
          ) {
            this.errors["ligne " + (index + 1) + " (delegation)"] =
              "Délegation non existante";
          }
        });
        this.display = "block";
      });

    if (file) {
      const fd = new FormData();
      this.fileName = file.name;
      fd.append("excel", file);
      this.formData = fd;
      // console.log(fd);
    }
  }

  redirect() {
    this.router.navigate(["/liste-colis"]);
  }

  upload() {
    // if (this.formData) {
    this.packageService
      .uploadExcel(this.auth.getUserDetails()._id, this.formData)
      .subscribe(
        (res) => {
          // console.log(res);

          console.log("slm");

          var added: boolean = true;
          var navigationExtras: NavigationExtras = {
            queryParams: {
              added,
            },
          };
          this.errors = res;
          this.router.navigate(["/liste-colis"], navigationExtras);
        },
        (err) => {
          console.log("slmslm");
          this.errors = err.message;

          Object.keys(this.errors).forEach((element) => {
            console.log("e");

            console.log(element);
            console.log(this.errors[element]);
            console.log("sss");
          });
          console.log(typeof this.errors);
          console.log(typeof this.errs);
          console.log(this.errs.length);
        }
      );
    // }
  }

  download(url) {
    saveAs(url, "importExcel.xls");
  }
}
