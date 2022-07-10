import { element } from "protractor";
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
  stats: any = [
    {
      state: "pret",
      count: 0,
      icon: "fas fa-plus-circle",
      bgColor: "bg-warning",
    },
    {
      state: "en cours de ramassage",
      count: 0,
      icon: "fas fa-user",
      bgColor: "bg-danger",
    },
    {
      state: "ramassé par livreur",
      count: 0,
      icon: "fas fa-user",
      bgColor: "bg-warning",
    },
    {
      state: "collecté",
      count: 0,
      icon: "fas fa-box",
      bgColor: "bg-warning",
    },
    {
      state: "en cours",
      count: 0,
      icon: "fas fa-shipping-fast",
      bgColor: "bg-yellow",
    },
    {
      state: "livré (espèce)",
      count: 0,
      icon: "fas fa-check",
      bgColor: "bg-yellow",
    },
    {
      state: "livré (chèque)",
      count: 0,
      icon: "fas fa-check",
      bgColor: "bg-yellow",
    },
    {
      state: "reporté",
      count: 0,
      icon: "fas fa-undo-alt",
      bgColor: "bg-yellow",
    },
    { state: "annulé", count: 0, icon: "fas fa-times", bgColor: "bg-yellow" },
    {
      state: "retourné",
      count: 0,
      icon: "fas fa-check-circle",
      bgColor: "bg-yellow",
    },
    {
      state: "hidden",
      count: 0,
      icon: "fas fa-times",
      bgColor: "bg-danger",
    },
    {
      state: "retourné à l'expediteur",
      count: 0,
      icon: "fas fa-times",
      bgColor: "bg-danger",
    },
    {
      state: "livré - payé - espèce",
      count: 0,
      icon: "fas fa-dollar-sign",
      bgColor: "bg-success",
    },
    {
      state: "livré - payé - chèque",
      count: 0,
      icon: "fas fa-check-square",
      bgColor: "bg-success",
    },
  ];
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

  // save changes in credentials
  private onDateFormValueChange(data: any): void {
    this.today = data.today;
    this.startDate = data.startDate;
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

    await this.packageService
      .countAllPackagesAdmin("pret", startDate, endDate)
      .pipe(
        map((data) => {
          const objIndex = this.stats.findIndex((obj) => obj.state === "pret");
          this.stats[objIndex].count = data.count;
          console.log(this.stats[objIndex]);
        })
      )
      .toPromise();

    this.packageService
      .countAllPackagesAdmin("en cours de ramassage", startDate, endDate)
      .pipe(
        map((data) => {
          const objIndex = this.stats.findIndex(
            (obj) => obj.state === "en cours de ramassage"
          );
          this.stats[objIndex].count = data.count;
          console.log(this.stats[objIndex]);
        })
      )
      .toPromise();

    console.log("2");
    console.log(this.stats);
    this.packageService
      .countAllPackagesAdmin("ramassé par livreur", startDate, endDate)
      .pipe(
        map((data) => {
          const objIndex = this.stats.findIndex(
            (obj) => obj.state === "ramassé par livreur"
          );
          this.stats[objIndex].count = data.count;
          console.log(this.stats[objIndex]);
        })
      )
      .toPromise();

    this.packageService
      .countAllPackagesAdmin("collecté", startDate, endDate)
      .subscribe((data) => {
        const objIndex = this.stats.findIndex(
          (obj) => obj.state === "collecté"
        );
        this.stats[objIndex].count = data.count;
      });
    this.packageService
      .countAllPackagesAdmin("en cours", startDate, endDate)
      .subscribe((data) => {
        const objIndex = this.stats.findIndex(
          (obj) => obj.state === "en cours"
        );
        this.stats[objIndex].count = data.count;
      });
    this.packageService
      .countAllPackagesAdmin("livré (espèce)", startDate, endDate)
      .subscribe((data) => {
        const objIndex = this.stats.findIndex(
          (obj) => obj.state === "livré (espèce)"
        );
        this.stats[objIndex].count = data.count;
      });
    this.packageService
      .countAllPackagesAdmin("livré (chèque)", startDate, endDate)
      .subscribe((data) => {
        const objIndex = this.stats.findIndex(
          (obj) => obj.state === "livré (chèque)"
        );
        this.stats[objIndex].count = data.count;
      });
    this.packageService
      .countAllPackagesAdmin("reporté", startDate, endDate)
      .subscribe((data) => {
        const objIndex = this.stats.findIndex((obj) => obj.state === "reporté");
        this.stats[objIndex].count = data.count;
      });
    console.log("8");
    console.log(this.stats);
    this.packageService
      .countAllPackagesAdmin("annulé", startDate, endDate)
      .subscribe((data) => {
        const objIndex = this.stats.findIndex((obj) => obj.state === "annulé");
        this.stats[objIndex].count = data.count;
      });
    this.packageService
      .countAllPackagesAdmin("retourné", startDate, endDate)
      .subscribe((data) => {
        const objIndex = this.stats.findIndex(
          (obj) => obj.state === "retourné"
        );
        this.stats[objIndex].count = data.count;
      });
    this.packageService
      .countAllPackagesAdmin("retourné à l'expediteur", startDate, endDate)
      .subscribe((data) => {
        const objIndex = this.stats.findIndex(
          (obj) => obj.state === "retourné à l'expediteur"
        );
        this.stats[objIndex].count = data.count;
      });
    this.packageService
      .countAllPackagesAdmin("livré - payé - chèque", startDate, endDate)
      .subscribe((data) => {
        const objIndex = this.stats.findIndex(
          (obj) => obj.state === "livré - payé - chèque"
        );
        this.stats[objIndex].count = data.count;
      });
    this.packageService
      .countAllPackagesAdmin("livré - payé - espèce", startDate, endDate)
      .subscribe((data) => {
        const objIndex = this.stats.findIndex(
          (obj) => obj.state === "livré - payé - espèce"
        );
        this.stats[objIndex].count = data.count;
      });

    console.log(this.stats);
  }

  public setDates() {
    this.today = this.datePipe.transform(this.myDate, "yyyy-MM-dd");
    const thisDate = this.myDate.getDate();
    this.myDate.setMonth(this.myDate.getMonth() - 1);
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

  getIcon(stat) {
    return stat.icon;
  }
  getColor(stat) {
    return stat.bgColor;
  }
}
