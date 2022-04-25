import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthenticationService } from "src/app/services/authentication.service";

declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
  roles: Array<string>;
}
export const ROUTES: RouteInfo[] = [
  {
    path: "/dashboard",
    title: "Dashboard",
    icon: "ni-tv-2 text-primary",
    class: "",
    roles: [],
  },
  { path: "/icons", title: "Icons", icon: "ni-planet text-blue", class: "", roles: [] },
  {
    path: "/colis-jour",
    title: "Colis de jour",
    icon: "ni-pin-3 text-orange",
    class: "",
    roles: [],
  },
  {
    path: "/user-profile",
    title: "User profile",
    icon: "ni-single-02 text-yellow",
    class: "",
    roles: [],
  },
  {
    path: "/gestion-colis",
    title: "Gestion de colis",
    icon: "ni-circle-08 text-pink",
    class: "",
    roles: [],
  },
  {
    path: "/recherche-av",
    title: "Recherche",
    icon: "ni-bullet-list-67 text-red",
    class: "",
    roles: [],
  },
  {
    path: "/carnet-adresses",
    title: "Carnet d'adresses",
    icon: "ni-key-25 text-info",
    class: "",
    roles: [],
  },
  {
    path: "/finance",
    title: "Finance",
    icon: "ni-circle-08 text-pink",
    class: "",
    roles: ["admin", "fourn"],
  }

];

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent implements OnInit {
  public menuItems: any[];
  public isCBCollapsed = false;
  public isGCollapsed = false;
  public isCollapsed = false;
  role: any;

  constructor(private router: Router, private auth: AuthenticationService) {
    this.role = this.auth.getUserDetails().role;
  }

  ngOnInit() {
    this.menuItems = ROUTES.filter((menuItem) => menuItem);
    this.router.events.subscribe((event) => {
      this.isCollapsed = true;
    });
  }

}
