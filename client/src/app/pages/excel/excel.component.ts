import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { NavigationExtras, Router } from "@angular/router";
import { saveAs } from "file-saver";
import { AuthenticationService } from "src/app/services/authentication.service";
import { PackageService } from "src/app/services/package.service";

@Component({
  selector: "app-excel",
  templateUrl: "./excel.component.html",
  styleUrls: ["./excel.component.scss"],
})
export class ExcelComponent implements OnInit {
  myFile: any;
  fileName = "";
  formData: FormData;
  constructor(
    private auth: AuthenticationService,
    private packageService: PackageService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  onFileSelected(event) {
    const file: File = event.target.files[0];

    if (file) {
      const fd = new FormData();
      this.fileName = file.name;
      fd.append("excel", file);
      this.formData = fd;
      console.log(this.formData);
    }
  }

  upload() {
    // if (this.formData) {
      this.packageService
        .uploadExcel(this.auth.getUserDetails()._id, this.formData)
        .subscribe(
          (res) => {
            console.log("slm");

            var added: boolean = true;
            var navigationExtras: NavigationExtras = {
              queryParams: {
                added,
              },
            };
            this.router.navigate(["/liste-colis"], navigationExtras);
          },
          (err) => {
            console.log("slmslm");

            console.log(err.message);
          }
        );
    // }
  }

  download(url) {
    saveAs(url, "importExcel.xls");
  }
}
