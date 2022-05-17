import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthenticationService } from "src/app/services/authentication.service";

declare interface RouteInfo {
  path: string;
  title: string;
  icon?: string;
  class: string;
  roles: Array<string>;
  parent?: string;
  collapsable?: boolean;
}
export const ROUTES: RouteInfo[] = [
  {
    path: "/dashboard",
    title: "Dashboard",
    icon: "ni-tv-2 text-primary",
    class: "",
    roles: [],
    parent: "",
    collapsable: false,
  },
  {
    path: "/icons",
    title: "Icons",
    icon: "ni-planet text-blue",
    class: "",
    roles: [],
    parent: "",
    collapsable: false,
  },
  {
    path: "/colis-jour",
    title: "Colis de jour",
    icon: "ni-pin-3 text-orange",
    class: "",
    roles: [],
    parent: "",
    collapsable: false,
  },
  {
    path: "/user-profile",
    title: "User profile",
    icon: "ni-single-02 text-yellow",
    class: "",
    roles: [],
    parent: "",
    collapsable: false,
  },
  {
    path: "/gestion-colis",
    title: "Gestion de colis",
    icon: "ni-circle-08 text-pink",
    class: "",
    roles: [],
    parent: "",
    collapsable: false,
  },
  {
    path: "/recherche-av",
    title: "Recherche",
    icon: "ni-bullet-list-67 text-red",
    class: "",
    roles: [],
    parent: "",
    collapsable: false,
  },
  {
    path: "/carnet-adresses",
    title: "Carnet d'adresses",
    icon: "ni-key-25 text-info",
    class: "",
    roles: [],
    parent: "",
    collapsable: false,
  },
  {
    path: "/finance",
    title: "Finance",
    icon: "ni-circle-08 text-pink",
    class: "",
    roles: ["admin", "fourn"],
    parent: "",
    collapsable: false,
  },
  {
    path: "",
    title: "Gestion",
    icon: "ni-settings-gear-65 text-info",
    class: "",
    roles: [],
    parent: "",
    collapsable: true,
  },
  {
    path: "",
    title: "Chef de bureau",
    icon: "ni-settings-gear-65 text-info",
    class: "",
    roles: [],
    parent: "",
    collapsable: true,
  },
  {
    path: "/gestion-filiere",
    title: "Filière",
    class: "",
    roles: [],
    parent: "Gestion",
  },
  {
    path: "/gestion-personel",
    title: "Personel",
    class: "",
    roles: [],
    parent: "Gestion",
  },
  {
    path: "/gestion-client",
    title: "Client",
    class: "",
    roles: [],
    parent: "Gestion",
  },
  {
    path: "/gestion-vehicule",
    title: "Véhicule",
    class: "",
    roles: [],
    parent: "Gestion",
  },
  {
    path: "/gestion-ville",
    title: "Ville",
    class: "",
    roles: [],
    parent: "Gestion",
  },
  {
    path: "/gestion-delegation",
    title: "Délégation",
    class: "",
    roles: [],
    parent: "Gestion",
  },
  {
    path: "/pickup",
    title: "Pickup",
    class: "",
    roles: [],
    parent: "Chef de bureau",
  },
  {
    path: "/ramassage",
    title: "Ramassage",
    class: "",
    roles: [],
    parent: "Chef de bureau",
  },
  {
    path: "/collecte",
    title: "Collecté",
    class: "",
    roles: [],
    parent: "Chef de bureau",
  },
  {
    path: "/feuille-de-route",
    title: "Feuille de route",
    class: "",
    roles: [],
    parent: "Chef de bureau",
  },
  {
    path: "/debrief-list",
    title: "Debrief",
    class: "",
    roles: [],
    parent: "Chef de bureau",
  },
  {
    path: "/feuille-de-retour",
    title: "Feuille de retour",
    class: "",
    roles: [],
    parent: "Chef de bureau",
  },
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
