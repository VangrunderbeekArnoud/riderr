import { Component } from '@angular/core';
import { UberAPI } from "../../services/uber.services";

@Component({
  selector: 'page-payment-methods',
  templateUrl: 'payment-methods.html',
})
export class PaymentMethodsPage {

  payment_methods;

  constructor(private uberApi: UberAPI) { }

  ngAfterViewInit() {
    this.uberApi.getPaymentMethods().subscribe((data) => {
      this.payment_methods = data.json().payment_methods;
      this.uberApi.hideLoader();
    }, (err) => {
      console.log(err);
      this.uberApi.hideLoader();
    })
  }

}
