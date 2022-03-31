import { ChangeDetectorRef, Component, Input } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
  AuthenticationService,
  TokenPayload,
} from "../../services/authentication.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable, Subscription } from "rxjs";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent {
  credentials: TokenPayload = {
    email: "",
    password: "",
  };
  returnUrl: string;
  loginForm: FormGroup;
  hasError: boolean;
  errorMessage: string;

  constructor(
    private fb: FormBuilder,
    private auth: AuthenticationService,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    //redirection if user is authenticated
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['dashboard']);
    }
    this.loginForm = this.fb.group({
      email: ["", Validators.required],
      password: ["", Validators.required],
    });
    this.errorMessage = "";
    this.loginForm.valueChanges.subscribe((data) =>
      this.onLoginFormValueChange(data)
    );
  }

  // save changes in credentials
  private onLoginFormValueChange(data: any): void {
    this.credentials.email = data.email;
    this.credentials.password = data.password;
  }

  login() {
    this.hasError = false;

    this.auth.login(this.credentials).subscribe(
      () => {
        console.log("success");
        this.router.navigate(['/dashboard']);
      },
      (err) => {
        this.hasError = true;
        this.errorMessage = err.error;
        this.cdRef.detectChanges();
        console.error(err);
      }
    );
  }
}
