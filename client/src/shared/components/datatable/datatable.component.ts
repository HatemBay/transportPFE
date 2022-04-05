import { Component, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.css']
})
export class DatatableComponent implements OnInit {

  @Input() name: string;
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

  temp: any = [];
  rows: any = [];
  selected: any = [];
  public columns: Array<object>;
  count: any;
  constructor() { }

  ngOnInit(): void {

  }

  // // get data from backend
  // getDataJson(limit?: any, page?: any, sortBy?: any, sort?: any, search?: any) {
  //   this.packageService
  //     .getFullPackages(limit, page, sortBy, sort, search)
  //     .subscribe((data) => {
  //       this.rows = this.temp = data;
  //       for (const item of this.rows) {
  //         item.c_remboursement = parseFloat(
  //           item.c_remboursement.toString()
  //         ).toFixed(3);
  //         console.log(item.c_remboursement);
  //       }
  //     });
  // }

  // // count all packages
  // private countPackages() {
  //   this.packageService.countAllPackages(null).subscribe((res) => {
  //     this.count = res.count;
  //   });
  // }

  // // dynamic search (triggers after inserting 3 characters)
  // updateFilter(event) {
  //   if (event.target.value.length > 2) {
  //     const val = event.target.value.toLowerCase();
  //     this.getDataJson(this.currentPageLimit, 1, null, null, val);
  //   } else {
  //     this.getDataJson(this.currentPageLimit, 1);
  //   }
  // }

  // // updates list based on table length
  // public onLimitChange(limit: any): void {
  //   this.changePageLimit(limit);
  //   this.table.limit = this.currentPageLimit;
  //   this.getDataJson(limit, this.currentPage);
  // }

  // // changes number of elements to display
  // private changePageLimit(limit: any): void {
  //   this.currentPageLimit = parseInt(limit, 10);
  // }

  // // elements sorting
  // onSort(event) {
  //   console.log(event);
  //   console.log(event.sorts[0].prop);
  //   this.getDataJson(
  //     this.currentPageLimit,
  //     event.page,
  //     event.sorts[0].prop,
  //     event.newValue
  //   );
  // }
}
