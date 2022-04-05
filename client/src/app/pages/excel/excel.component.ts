import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-excel",
  templateUrl: "./excel.component.html",
  styleUrls: ["./excel.component.scss"],
})
export class ExcelComponent implements OnInit {
  myFile: any;
  fileName = "";
  formData: FormData;
  constructor(private http: HttpClient) {}

  ngOnInit(): void {}

  onFileSelected(event) {
    const file: File = event.target.files[0];

    if (file) {
      const formData = new FormData();
      this.fileName = file.name;
      formData.append("thumbnail", file);
      console.log(formData);

      const upload$ = this.http.post("http://localhost:3000/api/thumbnail-upload", formData);
      upload$.subscribe();
    }
  }

  upload() {
    const upload$ = this.http.post("/api/thumbnail-upload", this.formData);
    upload$.subscribe();
  }
}
