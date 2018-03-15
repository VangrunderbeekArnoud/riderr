import { Component } from '@angular/core';
import { UberAPI } from "../../services/uber.services";

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  private profile;

  constructor(private uberApi: UberAPI) { }

  ngAfterViewInit() {
    this.uberApi.getMe().subscribe((data) => {
      this.profile = data.json();
      this.uberApi.hideLoader();
    }, (err) => {
      console.log(err);
      this.uberApi.hideLoader();
    })
  }

}
