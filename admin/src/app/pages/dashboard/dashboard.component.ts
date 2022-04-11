import { DatePipe } from "@angular/common";
import { ChangeDetectorRef, Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import Chart from "chart.js";
import { PackageService } from "src/app/services/package.service";
// core components
import {
  chartOptions,
  parseOptions,
  chartExample1,
  chartExample2,
} from "../../variables/charts";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  public datasets: any;
  public data: any;
  public salesChart;
  public clicked: boolean = true;
  public clicked1: boolean = false;
  myDate = new Date();
  today: string;
  startDate: string;
  dateD: string;
  dateF: Date;
  dateForm: FormGroup;
  allPackages: any;
  nouveau: any;
  collecte: any;
  enCours: any;
  annule: any;
  paye: any;
  livre: any;

  constructor(
    private fb: FormBuilder,
    private packageService: PackageService,
    private datePipe: DatePipe,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.datasets = [
      [0, 20, 10, 30, 15, 40, 20, 70, 70],
      [0, 20, 5, 25, 10, 30, 15, 40, 40],
    ];
    this.data = this.datasets[0];

    var chartOrders = document.getElementById("chart-orders");

    parseOptions(Chart, chartOptions());

    var ordersChart = new Chart(chartOrders, {
      type: "bar",
      options: chartExample2.options,
      data: chartExample2.data,
    });

    var chartSales = document.getElementById("chart-sales");

    this.salesChart = new Chart(chartSales, {
      type: "line",
      options: chartExample1.options,
      data: chartExample1.data,
    });

    this.setDates();

    this.getStats(null, null);

    this.dateForm = this.fb.group({
      today: this.today,
      startDate: this.startDate,
    });

    this.dateForm.valueChanges.subscribe((data) =>
      this.onDateFormValueChange(data)
    );
  }

  // save changes in credentials
  private onDateFormValueChange(data: any): void {
    this.today = data.today;
    this.startDate = data.startDate;
  }

  public updateOptions() {
    this.salesChart.data.datasets[0].data = this.data;
    this.salesChart.update();
  }

  // returns statistics
  public getStats(startDate, endDate) {
    this.packageService
      .countAllPackagesAdmin(
        null,
        startDate,
        endDate,
      )
      .subscribe((data) => {
        this.allPackages = data.count;
      });
    this.packageService
      .countAllPackagesAdmin(
        "nouveau",
        startDate,
        endDate,
      )
      .subscribe((data) => {
        this.nouveau = data.count;
      });
    this.packageService
      .countAllPackagesAdmin(
        "collecté",
        startDate,
        endDate,
      )
      .subscribe((data) => {
        this.collecte = data.count;
      });
    this.packageService
      .countAllPackagesAdmin(
        "en cours",
        startDate,
        endDate,
      )
      .subscribe((data) => {
        this.enCours = data.count;
      });
    this.packageService
      .countAllPackagesAdmin(
        "annulé",
        startDate,
        endDate,
      )
      .subscribe((data) => {
        this.annule = data.count;
      });
    this.packageService
      .countAllPackagesAdmin(
        "payé",
        startDate,
        endDate,
      )
      .subscribe((data) => {
        this.paye = data.count;
      });
    this.packageService
      .countAllPackagesAdmin(
        "livré",
        startDate,
        endDate,
      )
      .subscribe((data) => {
        this.livre = data.count;
      });
  }

  public setDates() {
    this.today = this.datePipe.transform(this.myDate, "yyyy-MM-dd");
    const thisDate = this.myDate.getDate();
    this.myDate.setDate(this.myDate.getMonth() - 2);
    this.myDate.setDate(thisDate);

    this.startDate = this.datePipe.transform(this.myDate, "yyyy-MM-dd");
  }

  search() {
    this.getStats(this.startDate, this.today);
  }
}
