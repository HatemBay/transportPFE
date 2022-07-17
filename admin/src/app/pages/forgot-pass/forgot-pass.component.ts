import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { NavigationExtras, Router } from "@angular/router";
import { AuthenticationService } from "src/app/services/authentication.service";

@Component({
  selector: "app-forgot-pass",
  templateUrl: "./forgot-pass.component.html",
  styleUrls: ["./forgot-pass.component.scss"],
})
export class ForgotPassComponent implements OnInit {
  emailForm: FormGroup;
  errorMessage: string;
  constructor(
    private auth: AuthenticationService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.emailForm = new FormGroup({
      email: new FormControl("", [
        Validators.required,

        Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"),
      ]),
    });
  }

  newPassword() {
    console.log(this.emailForm.get("email").value);
    this.errorMessage = "";
    this.auth
      .forgotPasswordUser({ email: this.emailForm.get("email").value })
      .subscribe(
        (res) => console.log("slmslm"),
        (err) => {
          if (typeof err.error === "string") {
            console.log(typeof err.message);
            this.errorMessage = err.error;
          } else {
            var navigationExtras: NavigationExtras = {
              queryParams: {
                passReset: true,
              },
            };
            console.log(navigationExtras.queryParams);
            this.router.navigate(["/login"], navigationExtras);
          }
        }
      );
  }
}
