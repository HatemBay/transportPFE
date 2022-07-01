import { DatePipe } from "@angular/common";
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { io } from "socket.io-client";
import { ClientService } from "src/app/services/client.service";
import { PackageService } from "src/app/services/package.service";

@Component({
  selector: "app-colis-jour",
  templateUrl: "./colis-jour.component.html",
  styleUrls: ["./colis-jour.component.scss"],
})
export class ColisJourComponent implements OnInit {
  @ViewChild(DatatableComponent) search: DatatableComponent;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild(alert) alert: any;

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

  myDate = new Date();
  temp: any = [];
  rows: any = [];
  selected: any = [];
  public columns: Array<object>;
  count: any;
  dateForm: FormGroup;
  date: string;
  val: string;
  private socket: any;
  moreData: boolean = false;

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private packageService: PackageService,
    private clientService: ClientService,
    private router: Router
  ) {
    this.socket = io("http://localhost:3000", { transports: ["websocket"] });
  }
  ngOnInit(): void {
    // Initial columns, can be used for data list which is will be filtered
    this.columns = [
      { prop: "villec", name: "Ville" },
      { prop: "delegationc", name: "Délégation" },
      { prop: "adressec", name: "Adresse" },
    ];
    this.setDates();

    this.dateForm = this.fb.group({
      date: this.date,
    });

    this.dateForm.valueChanges.subscribe((data) =>
      this.onDateFormValueChange(data)
    );

    this.getDataJson();
    this.socket.on("notification", (data) => {
      this.moreData = true;
      console.log(this.moreData);

    });
  }

  setDates() {
    this.date = this.datePipe.transform(this.myDate, "yyyy-MM-dd");
  }

  // get data from backend
  getDataJson(limit?: any, page?: any, sortBy?: any, sort?: any, search?: any) {
    this.packageService
      .getDailyPackages(limit, page, sortBy, sort, search, this.date)
      .subscribe((data) => {
        this.rows = this.temp = data.data;
        this.count = data.length;
      });
  }
  // save changes in credentials
  private onDateFormValueChange(data: any): void {
    this.date = data.date;
  }

  updateFilter(event) {
    this.val = event.target.value.toLowerCase();
    if (event.target.value.length > 2) {
      this.getDataJson(this.currentPageLimit, 1, null, null, this.val);
    } else {
      this.getDataJson(this.currentPageLimit, 1);
    }
  }

  // TODO[Dmitry Teplov] wrap dynamic limit in a separate component.
  public onLimitChange(limit: any): void {
    this.changePageLimit(limit);
    this.table.limit = this.currentPageLimit;
    this.getDataJson(limit, null, null, null, this.val);
    // this.table.recalculate();
    // setTimeout(() => {
    //   if (this.table.bodyComponent.temp.length <= 0) {
    //     // TODO[Dmitry Teplov] find a better way.
    //     // TODO[Dmitry Teplov] test with server-side paging.
    //     this.table.offset = Math.floor(
    //       (this.table.rowCount - 1) / this.table.limit
    //     );
    //     // this.table.offset = 0;
    //   }
    // });
  }

  private changePageLimit(limit: any): void {
    this.currentPageLimit = parseInt(limit, 10);
  }

  onSelect({ selected }) {
    console.log("Select Event", selected, this.selected);

    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  onSort(event) {
    console.log(event);
    console.log(event.sorts[0].prop);
    this.getDataJson(
      this.currentPageLimit,
      event.page,
      event.sorts[0].prop,
      event.newValue,
      this.val
    );
  }

  onFooterPage(event) {
    this.changePage(event.page);
    this.getDataJson(this.currentPageLimit, event.page, null, null, this.val);
  }

  changePage(page: any) {
    this.currentPage = parseInt(page, 10);
  }

  modify(data) {
    console.log(data.clientId);
    this.router.navigate(["/modifier-colis"]);
  }

  delete(data) {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce colis?")) {
      this.packageService.deletePackage(data._id).subscribe(() => {
        console.log("package deleted");
      });
      this.clientService.deleteClient(data.clientId).subscribe(() => {
        console.log("client deleted");
        var temp = this.temp.filter(
          (item) => item.CAB.indexOf(data.CAB) === -1
        );
        // update the rows after delete
        this.rows = temp;
        // trigger to show alert
        this.success = true;
        // setTimeout(() => this.success = false, 3000)
      });
    }
  }

  view(data) {
    console.log(data.clientId);
    this.router.navigate(["/modifier-colis"]);
  }

  update() {
    this.getDataJson();
  }
}
