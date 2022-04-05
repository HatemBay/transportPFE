import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from "@angular/router";
import { Observable } from "rxjs";
import { AuthenticationService } from "./authentication.service";

@Injectable({
  providedIn: "root",
})
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthenticationService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
      return this.isAuthorized(route)
  }

  isAuthorized(route: ActivatedRouteSnapshot): boolean {
    var roles = ["d"];
    // const role = this.auth.getUserDetails().role;
    // roles.push(role);
    const expectedRoles = route.data.expectedRoles;
    const rolesMatches = roles.findIndex(
      (role) => expectedRoles.indexOf(role) !== -1
    );
    return rolesMatches >= 0;
  }
}
