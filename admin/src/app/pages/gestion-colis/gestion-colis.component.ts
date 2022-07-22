import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { DatePipe } from "@angular/common";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { ClientService } from "src/app/services/client.service";
import { PackageService } from "src/app/services/package.service";
import { Clipboard } from "@angular/cdk/clipboard";
import { ExcelService } from "src/app/services/excel.service";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
@Component({
  selector: "app-gestion-colis",
  templateUrl: "./gestion-colis.component.html",
  styleUrls: ["./gestion-colis.component.scss"],
})
export class GestionColisComponent implements OnInit {
  @ViewChild(DatatableComponent) search: DatatableComponent;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild(alert) alert: any;
  @ViewChild("myEl") el: ElementRef;

  myDate = new Date();
  today: string;
  startDate: string;
  dateForm: FormGroup;

  success: boolean = false;

  public currentPageLimit: number = 10;
  public currentPage: number = 1;

  public readonly pageLimitOptions = [
    { value: 5 },
    { value: 10 },
    { value: 25 },
    { value: 50 },
    { value: 100 },
  ];

  printList = [
    { name: "Copy" },
    { name: "CSV" },
    { name: "Excel" },
    { name: "PDF" },
    { name: "Print" },
  ];

  headers = [
    { label: "Code à barre", key: "CAB" },
    { label: "Etat", key: "etat" },
    { label: "Expéditeur", key: "nomf" },
    { label: "Tél expéditeur", key: "telf" },
    { label: "Destinataire", key: "nomc" },
    { label: "Tél", key: "telc" },
    { label: "Tél2", key: "tel2c" },
    { label: "Ville", key: "villec" },
    { label: "Délegation", key: "delegationc" },
    { label: "Adresse", key: "adressec" },
    { label: "COD", key: "c_remboursement" },
    { label: "Date", key: "createdAtSearch" },
  ];
  temp: any = [];
  rows: any = [];
  slice: any = [];
  selected: any = [];
  public columns: Array<object>;
  count: any;
  init: boolean = false;
  val: string;
  edited: boolean = false;

  constructor(
    private fb: FormBuilder,
    private packageService: PackageService,
    private datePipe: DatePipe,
    private router: Router,
    private clipboard: Clipboard,
    private excelService: ExcelService,
    private route: ActivatedRoute
  ) {
    this.edited =
      JSON.parse(this.route.snapshot.queryParamMap.get("edited")) || false;
    this.success =
      JSON.parse(this.route.snapshot.queryParamMap.get("success")) || false;
  }
  ngOnInit(): void {
    this.columns = [
      { prop: "villec", name: "Ville" },
      { prop: "delegationc", name: "Délegation" },
      { prop: "adressec", name: "Adresse" },
    ];

    this.setDates();

    this.dateForm = this.fb.group({
      today: this.today,
      startDate: this.startDate,
    });

    this.dateForm.valueChanges.subscribe((data) =>
      this.onDateFormValueChange(data)
    );

    this.getDataJson();
  }

  // get data from backend
  getDataJson(
    limit?: any,
    page?: any,
    sortBy?: any,
    sort?: any,
    search?: any,
    startDate?: any,
    endDate?: any
  ) {
    if (this.init === false) {
      startDate = null;
      endDate = null;
    }
    this.packageService
      .getFullPackages(limit, page, sortBy, sort, search, startDate, endDate)
      .subscribe((data) => {
        this.rows = this.temp = data.data;
        this.count = data.length;
      });
  }

  // initiate our dates
  public setDates() {
    this.today = this.datePipe.transform(this.myDate, "yyyy-MM-dd");
    const thisDate = this.myDate.getDate();
    // this.myDate.setDate(this.myDate.getMonth() - 2);
    this.myDate.setMonth(this.myDate.getMonth() - 1);
    this.myDate.setDate(thisDate);

    this.startDate = this.datePipe.transform(this.myDate, "yyyy-MM-dd");
  }

  // save changes in credentials
  private onDateFormValueChange(data: any): void {
    this.today = data.today;
    this.startDate = data.startDate;
  }

  // filter data
  updateFilter(event) {
    var startDate = null;
    var endDate = null;
    if (this.init === true) {
      startDate = this.startDate;
      endDate = this.today;
    }
    this.val = event.target.value.toLowerCase();
    if (event.target.value.length > 2) {
      this.getDataJson(
        this.currentPageLimit,
        1,
        null,
        null,
        this.val,
        startDate,
        endDate
      );
    } else {
      this.getDataJson(
        this.currentPageLimit,
        1,
        null,
        null,
        null,
        startDate,
        endDate
      );
    }
  }

  // When number of displayed elements changes
  public onLimitChange(limit: any): void {
    var startDate = null;
    var endDate = null;
    if (this.init === true) {
      startDate = this.startDate;
      endDate = this.today;
    }
    this.changePageLimit(limit);
    this.table.limit = this.currentPageLimit;
    this.getDataJson(limit, 1, null, null, this.val, startDate, endDate);
    // this.table.recalculate();
    setTimeout(() => {
      if (this.table.bodyComponent.temp.length <= 0) {
        // TODO[Dmitry Teplov] find a better way.
        // TODO[Dmitry Teplov] test with server-side paging.
        this.table.offset = Math.floor(
          (this.table.rowCount - 1) / this.table.limit
        );
        // this.table.offset = 0;
      }
    });
  }

  private changePageLimit(limit: any): void {
    this.currentPageLimit = parseInt(limit, 10);
  }

  // onSelect({ selected }) {
  //   console.log("Select Event", selected, this.selected);

  //   this.selected.splice(0, this.selected.length);
  //   this.selected.push(...selected);
  // }

  // checkbox selection
  onSelect(event) {
    console.log("Select Event", event);
    this.selected = event.selected;

    console.log(this.selected[0]._id);
  }

  // Data sorting
  onSort(event) {
    var startDate = null;
    var endDate = null;
    if (this.init === true) {
      startDate = this.startDate;
      endDate = this.today;
    }
    this.getDataJson(
      this.currentPageLimit,
      event.page,
      event.sorts[0].prop,
      event.newValue,
      this.val,
      startDate,
      endDate
    );
  }

  // When page changes
  onFooterPage(event) {
    var startDate = null;
    var endDate = null;
    if (this.init === true) {
      startDate = this.startDate;
      endDate = this.today;
    }
    this.changePage(event.page);
    this.getDataJson(
      this.currentPageLimit,
      event.page,
      null,
      null,
      this.val,
      startDate,
      endDate
    );
  }

  changePage(page: any) {
    this.currentPage = parseInt(page, 10);
  }

  modify(data) {
    var navigationExtras: NavigationExtras = {
      queryParams: {
        packageId: data._id,
        clientId: data.clientId,
      },
    };
    console.log(navigationExtras.queryParams);

    this.router.navigate(["/modifier-colis"], navigationExtras);
  }

  delete(data) {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce colis?")) {
      this.packageService.deletePackage(data._id).subscribe(() => {
        console.log("package deleted");
      });
    }
  }

  copyToClipboard() {
    this.slice = this.selected.map((obj) => {
      return {
        "Code à barre": obj.CAB,
        Etat: obj.etat,
        Expéditeur: obj.nomf,
        "Tél expéditeur": obj.telf,
        Destinataire: obj.nomc,
        Tél: obj.telc,
        Tél2: obj.tel2c,
        Ville: obj.villec,
        Délegation: obj.delegationc,
        Adresse: obj.adressec,
        COD: obj.c_remboursement,
        Date: obj.createdAtSearch,
      };
    });
    //TODO: make this a html organised code
    this.clipboard.copy(JSON.stringify(this.slice, null, 2));
  }

  exportToExcel() {
    this.slice = this.selected.map((obj) => {
      return {
        "Code à barre": obj.CAB,
        Etat: obj.etat,
        Expéditeur: obj.nomf,
        "Tél expéditeur": obj.telf,
        Destinataire: obj.nomc,
        Tél: obj.telc,
        Tél2: obj.tel2c,
        Ville: obj.villec,
        Délegation: obj.delegationc,
        Adresse: obj.adressec,
        COD: obj.c_remboursement,
        Date: obj.createdAtSearch,
      };
    });
    this.excelService.exportAsExcelFile(this.slice, "sample");
  }

  exportToPdf() {
    this.slice = this.selected.map((obj) => {
      return {
        "Code à barre": obj.CAB,
        Etat: obj.etat,
        Expéditeur: obj.nomf,
        "Tél expéditeur": obj.telf,
        Destinataire: obj.nomc,
        Tél: obj.telc,
        Tél2: obj.tel2c,
        Ville: obj.villec,
        Délegation: obj.delegationc,
        Adresse: obj.adressec,
        COD: obj.c_remboursement,
        Date: obj.createdAtSearch,
      };
    });

    console.log(this.slice);

    var keys = [];
    var keys2 = [];

    for (var key in this.slice[0]) {
      keys.push(key);
    }
    keys2.push(keys);
    var values = [];
    this.slice.forEach((element) => {
      var line = [];
      for (var key in element) {
        line.push(element[key]);
      }
      values.push(line);
    });

    var doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    doc.setFontSize(18);
    doc.text("Colis Express - Gestion de colis", 400, 8, { align: "center" });
    doc.setFontSize(11);
    doc.setTextColor(100);

    autoTable(doc, {
      head: keys2,
      body: values,
      theme: "plain",
      styles: { halign: "center" },
      headStyles: { fillColor: [124, 95, 240] },
      alternateRowStyles: { fillColor: [231, 215, 252] },
      tableLineColor: [124, 95, 240],
      tableLineWidth: 0.1,
    });

    // below line for Open PDF document in new tab
    doc.output("dataurlnewwindow");

    // below line for Download PDF document
    doc.save("colis.pdf");
  }

  // print selecetd elements
  print() {
    let ids = [];
    for (var el of this.selected) {
      ids.push(el._id);
    }
    console.log(ids);

    // Create our query parameters object
    const queryParams: any = {};
    queryParams.packages = JSON.stringify(ids);
    var navigationExtras: NavigationExtras = {
      queryParams,
    };
    console.log(navigationExtras.queryParams);

    // const url = this.router.serializeUrl(
    //   this.router.createUrlTree(["/imprimer-colis"], navigationExtras)
    // );

    const printContent = document.getElementById("hidden");

    const WindowPrt = window.open(
      "",
      "",
      "left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0"
    );
    WindowPrt.document.write(printContent.innerHTML);
    WindowPrt.document.close();
    WindowPrt.setTimeout(function () {
      WindowPrt.focus();
      WindowPrt.print();
      // WindowPrt.close();
    }, 1000);
  }

  details(row) {
    var navigationExtras: NavigationExtras = {
      queryParams: {
        CAB: row.CAB,
      },
    };
    this.router.navigate(["/recherche"], navigationExtras);
  }

  update() {
    //dates are set when the view is initiated so when table search is implemented it will use those values regardless of initiating date periods search
    //so we need to use a variable that checks if the time periods search has been initiated at least once
    this.init = true;

    this.getDataJson(
      null,
      null,
      null,
      null,
      this.val,
      this.startDate,
      this.today
    );
  }
}
