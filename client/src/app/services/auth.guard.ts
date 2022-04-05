import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthenticationService } from './authentication.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  // constructor(private authService: AuthService) {}

  // canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
  //   const currentUser = this.authService.currentUserValue;
  //   if (currentUser) {
  //     // logged in so return true
  //     return true;
  //   }

  //   // not logged in so redirect to login page with the return url
  //   this.authService.logout();
  //   return false;
  // }
  constructor(private auth: AuthenticationService, private router: Router) {}

  canActivate() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return false;
    }
    return true;
  }
}
