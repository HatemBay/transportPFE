import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthenticationService } from "src/app/services/authentication.service";
import { FournisseurService } from "src/app/services/fournisseur.service";

@Component({
  selector: "app-user-profile",
  templateUrl: "./user-profile.component.html",
  styleUrls: ["./user-profile.component.scss"],
})
export class UserProfileComponent implements OnInit {
  passwordResetForm: FormGroup;
  userInfo: any;
  passReset = false;
  errorOldPass = "";
  errorNewPass = "";

  constructor(
    public auth: AuthenticationService,
    private fournisseurService: FournisseurService,
    private fb: FormBuilder
  ) {
    this.userInfo = this.auth.getUserDetails();
  }

  ngOnInit() {
    console.log(this.auth.getUserDetails());
    this.passwordResetForm = this.fb.group({
      oldPassword: ["", Validators.required],
      newPassword: ["", Validators.required],
    });
  }

  changePassword() {
    this.errorOldPass = "";
    this.errorNewPass = "";
    console.log(this.passwordResetForm.value);
    if (
      this.passwordResetForm.value.oldPassword ===
      this.passwordResetForm.value.newPassword
    ) {
      this.errorNewPass = "veuillez insérer un mot de passe différent";
    }
    this.fournisseurService
      .changePassword(this.userInfo._id, this.passwordResetForm.value)
      .subscribe(
        (data) => {
          console.log(data);
          this.passReset = true;
        },
        (err) => {
          console.log(err);
          if (err.message.indexOf("Veuillez insérer") !== -1) {
            this.errorNewPass = "veuillez insérer un mot de passe différent";
          } else {
            this.errorOldPass = err.message;
          }
        }
      );
  }
}
