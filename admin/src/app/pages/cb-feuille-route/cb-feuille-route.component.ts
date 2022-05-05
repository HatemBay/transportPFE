import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NavigationExtras } from "@angular/router";
import { PackageService } from "src/app/services/package.service";
import { UserService } from "src/app/services/user.service";

@Component({
  selector: "app-cb-feuille-route",
  templateUrl: "./cb-feuille-route.component.html",
  styleUrls: ["./cb-feuille-route.component.scss"],
})
export class CbFeuilleRouteComponent implements OnInit {
  error: boolean = false;
  index: Array<number> = [];
  display: string = "default";
  display2: string = "default";
  chauffeurs: any = [];
  chauffeur: any = [];
  chauffeursForm: FormGroup;
  referenceForm: FormGroup;
  references: Array<number> = [];
  packages: any = [];

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private packageService: PackageService
  ) {}

  ngOnInit(): void {
    this.chauffeursForm = this.fb.group({
      chauffeurs: ["", Validators.required],
    });

    this.referenceForm = this.fb.group({
      references: ["", Validators.required],
    });
    this.getDataJson();
  }

  // get references() {
  //   return this.referenceForm.controls["references"] as FormArray;
  // }

  get f() {
    return this.referenceForm.controls;
  }

  getDataJson() {
    this.userService.getChauffeurs().subscribe((data) => {
      this.chauffeurs = data;
    });
  }

  getPackageData(element: any) {
    this.packageService.getFullPackageByCAB(element).subscribe((data) => {
      this.packages.push(data[0]);
    });
  }

  // checkPackage(id: any) {
  //   this.packageService.getPackageByCAB(id).subscribe((data) => {
  //     if (data[0].CAB) this.references.push(data[0].CAB);
  //   });
  // }

  public show() {
    this.display = "block";
    this.chauffeur = this.chauffeurs.slice(
      this.chauffeurs.findIndex(
        (x) => x._id === this.chauffeursForm.value.chauffeurs
      ),
      1
    );
    console.log(this.chauffeur);
  }

  public printRoadmap() {
    // this.index = [];
    var references = this.referenceForm.value.references;
    this.references = references.split("\n");
    // console.log(refs);
    // refs.forEach((element) => {
    //   if (!isNaN(element) && element.length === 10) {
    //     this.checkPackage(element);
    //   } else {
    //     this.error = true;
    //     this.index.push(refs.indexOf(element));
    //   }
    // });

    console.log(this.references);
    this.references.forEach((element) => {
      this.getPackageData(element);
    });

    const printContent = document.getElementById("hidden");

    const WindowPrt = window.open(
      "",
      "",
      "left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0"
    );
    WindowPrt.setTimeout(() => {
      WindowPrt.document.write(printContent.innerHTML);
      WindowPrt.document.close();
    }, 1000);

    WindowPrt.setTimeout(function () {
      WindowPrt.focus();
      WindowPrt.print();
      // WindowPrt.close();
    }, 1000);

    this.references = [];
    this.packages = [];
  }

  // print selecetd elements

  public showRetour() {
    this.display2 = "block";
  }
}
