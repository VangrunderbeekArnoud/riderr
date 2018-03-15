import { Component } from '@angular/core';
import { UberAPI } from "../../services/uber.services";

@Component({
  selector: 'page-history',
  templateUrl: 'history.html',
})
export class HistoryPage {

  history: Array<any>;
  total: number;
  count: number;

  constructor(private uberApi: UberAPI) { }

  ngAfterViewInit() {
    this.uberApi.getHistory().subscribe((data) => {
      let d = data.json();
      this.history = d.history;
      this.total = d.count;
      this.count = d.history.length;
      this.uberApi.hideLoader();
    }, (err) => {
      console.log(err);
      this.uberApi.hideLoader();
    });
  }

}
