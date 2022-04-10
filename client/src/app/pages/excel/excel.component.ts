import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { NavigationExtras, Router } from "@angular/router";
import { saveAs } from "file-saver";
import { AuthenticationService } from "src/app/services/authentication.service";

@Component({
  selector: "app-excel",
  templateUrl: "./excel.component.html",
  styleUrls: ["./excel.component.scss"],
})
export class ExcelComponent implements OnInit {
  myFile: any;
  fileName = "";
  formData: FormData;
  dlName: any;
  constructor(
    private http: HttpClient,
    private auth: AuthenticationService,
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
    if (this.formData) {
      const upload$ = this.http.post(
        `http://localhost:3000/api/excel-upload/${
          this.auth.getUserDetails()._id
        }`,
        this.formData
      );
      upload$.subscribe();
      var added: boolean = true;
      var navigationExtras: NavigationExtras = {
        queryParams: {
          added,
        },
      };
      this.router.navigate(["/liste-colis"], navigationExtras);
    }
  }

  download(url) {
    saveAs(url, "importExcel.xls");
  }
}
