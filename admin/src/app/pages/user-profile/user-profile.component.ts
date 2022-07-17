import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthenticationService } from "src/app/services/authentication.service";

@Component({
  selector: "app-user-profile",
  templateUrl: "./user-profile.component.html",
  styleUrls: ["./user-profile.component.scss"],
})
export class UserProfileComponent implements OnInit {
  passwordResetForm: FormGroup;
  constructor(public auth: AuthenticationService, private fb: FormBuilder) {}

  ngOnInit() {
    console.log(this.auth.getUserDetails());
    this.passwordResetForm = this.fb.group({
      oldPassword: ["", Validators.required],
      newPassword: ["", Validators.required],
    });
  }

  changePassword() {
    console.log(this.passwordResetForm.value);
  }
}
