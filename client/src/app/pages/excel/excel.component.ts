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
  errors: any = [];
  errors2: any = [];
  errs: any;
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
          this.errors = err.message;

          Object.keys(this.errors).forEach(element => {
            console.log(element);
            console.log(this.errors[element]);
            console.log("sss");
            this.errors2[element] = this.errors[element];
          });
          console.log(typeof this.errors);
          this.errs = Object.keys(this.errors2)
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
