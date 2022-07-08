import { DatePipe } from "@angular/common";
import { ChangeDetectorRef, Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import Chart from "chart.js";
import { map } from "rxjs";
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
  public dataLabels: any;
  public salesChartData: any;
  public salesChartLabels: any;
  public ordersChartData: any;
  public ordersChartLabels: any;
  public salesChart: any;
  public ordersChart: any;
  public clicked: boolean = true;
  public clicked1: boolean = false;
  myDate = new Date();
  today: string;
  startDate: string;
  dateD: string;
  dateF: Date;
  dateForm: FormGroup;
  allPackages: any;
  data: any[];
  nouveau: any;
  collecte: any;
  enCours: any;
  annule: any;
  paye: any;
  livre: any;
  statsWeek: Array<number>;
  statsYear: Array<number>;
  deliveryRates: Array<number>;
  villes: Array<string>;
  topProvidersStats: any[];
  months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "June",
    "July",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];
  classColors = [];
  daysOfTheWeek: any = [];

  constructor(
    private fb: FormBuilder,
    private packageService: PackageService,
    private datePipe: DatePipe,
    private cdRef: ChangeDetectorRef
  ) {
    this.classColors = [
      "bg-gradient-danger",
      "bg-gradient-success",
      "bg-gradient-primary",
      "bg-gradient-info",
      "bg-gradient-warning",
      "bg-gradient-secondary",
    ];
  }

  ngOnInit() {
    this.initiateStatData();
  }

  async initiateStatData() {
    this.setDates();

    this.getStats(null, null);

    this.dateForm = this.fb.group({
      today: this.today,
      startDate: this.startDate,
    });

    this.dateForm.valueChanges.subscribe((data) =>
      this.onDateFormValueChange(data)
    );

    this.statsWeek = await this.getStatsWeek();
    this.statsYear = await this.getStatsYear();
    await this.getStatsDeliveryRate();
    await this.getStatsTopProviders();

    console.log(this.deliveryRates);
    console.log(this.villes);

    this.setLabelsForStats();

    this.datasets = [this.statsYear, this.statsWeek];
    this.dataLabels = [this.months, this.daysOfTheWeek];

    this.salesChartData = this.datasets[0];
    this.salesChartLabels = this.dataLabels[0];

    var chartOrders = document.getElementById("chart-orders");

    parseOptions(Chart, chartOptions());

    this.ordersChart = new Chart(chartOrders, {
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
    this.updateSalesChartOptions();
    this.updateOrdersChartOptions();
  }

  //sets a table of months to display in chart
  setLabelsForStats() {
    var monthIndex = new Date().getMonth();

    const splice = this.months.splice(monthIndex);
    for (var element of splice.reverse()) {
      this.months.unshift(element);
    }
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();

    this.daysOfTheWeek.push(day + "/" + month);
    for (var i = 0; i < 6; i++) {
      date = new Date(year, month - 1, day - 1);
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var day = date.getDate();
      this.daysOfTheWeek.push(day + "/" + month);
    }
    this.daysOfTheWeek = this.daysOfTheWeek.reverse();
  }

  // save changes in credentials
  private onDateFormValueChange(data: any): void {
    this.today = data.today;
    this.startDate = data.startDate;
  }

  public updateSalesChartOptions() {
    this.salesChart.data.datasets[0].data = this.salesChartData;
    this.salesChart.data.labels = this.salesChartLabels;
    this.salesChart.update();
  }

  public updateOrdersChartOptions() {
    this.ordersChart.data.datasets[0].data = this.deliveryRates;
    this.ordersChart.data.labels = this.villes;
    this.ordersChart.update();
  }

  public async getStatsWeek() {
    return await this.packageService.statsWeek().toPromise();
  }
  public async getStatsYear() {
    return await this.packageService.statsYear().toPromise();
  }
  public async getStatsDeliveryRate() {
    return await this.packageService
      .statsDeliveryRate()
      .pipe(
        map((data) => {
          this.villes = [...data.map((item) => item.ville)];
          this.deliveryRates = [...data.map((item) => item.rate)];
        })
      )
      .toPromise();
  }
  public async getStatsTopProviders() {
    return await this.packageService
      .statsTopProviders()
      .pipe(
        map((data) => {
          this.topProvidersStats = data;
        })
      )
      .toPromise();
  }

  // returns statistics
  public async getStats(startDate, endDate) {
    await this.packageService
      .countAllPackagesAdmin(null, startDate, endDate)
      .pipe(
        map((data) => {
          this.allPackages = data.count;
        })
      )
      .toPromise();

    this.nouveau = this.data.filter((item) => item.etat != "nouveau");

    this.packageService
      .countAllPackagesAdmin("nouveau", startDate, endDate)
      .subscribe((data) => {
        this.nouveau = data.count;
      });
    this.packageService
      .countAllPackagesAdmin("collecté", startDate, endDate)
      .subscribe((data) => {
        this.collecte = data.count;
      });
    this.packageService
      .countAllPackagesAdmin("en cours", startDate, endDate)
      .subscribe((data) => {
        this.enCours = data.count;
      });
    this.packageService
      .countAllPackagesAdmin("annulé", startDate, endDate)
      .subscribe((data) => {
        this.annule = data.count;
      });
    this.packageService
      .countAllPackagesAdmin("payé", startDate, endDate)
      .subscribe((data) => {
        this.paye = data.count;
      });
    this.packageService
      .countAllPackagesAdmin("livré", startDate, endDate)
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

  getRates(stat: any): any {
    let styles = {
      width: stat.rate + "%",
    };
    return styles;
  }
  getClass(i: number): string {
    var index = this.adjustLength(i);
    return this.classColors[index];
  }

  adjustLength(i: number): number {
    if (i > this.classColors.length) {
      i = i - this.classColors.length;
      return this.adjustLength(i);
    }
    return i;
  }
}
