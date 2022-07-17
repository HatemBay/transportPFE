import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
}
export const ROUTES: RouteInfo[] = [
  {
    path: "/dashboard",
    title: "Dashboard",
    icon: "ni-tv-2 text-primary",
    class: "",
  },
  // { path: "/icons", title: "Icons", icon: "ni-planet text-blue", class: "" },
  {
    path: "/nouveau-colis",
    title: "Créer un colis",
    icon: "ni-pin-3 text-orange",
    class: "",
  },
  {
    path: "/import-excel",
    title: "Importation excel",
    icon: "ni-pin-3 text-orange",
    class: "",
  },
  {
    path: "/user-profile",
    title: "Mon profil",
    icon: "ni-single-02 text-yellow",
    class: "",
  },
  {
    path: "/liste-colis",
    title: "Liste de colis",
    icon: "ni-bullet-list-67 text-red",
    class: "",
  },
  {
    path: "/carnet-adresses",
    title: "Carnet d'adresses",
    icon: "ni-key-25 text-info",
    class: "",
  },
  {
    path: "/finance",
    title: "Finance",
    icon: "ni-circle-08 text-pink",
    class: "",
  },
  {
    path: "/gestion-colis",
    title: "Gestion de colis",
    icon: "ni-circle-08 text-pink",
    class: "",
  },
  {
    path: "/decharge",
    title: "Décharge",
    icon: "ni-circle-08 text-pink",
    class: "",
  },
  // Hidden items (used to display their title in ui)
  {
    path: "/details-colis",
    title: "Details colis",
    icon: "ni-single-02 text-yellow",
    class: "d-none",
  },
  {
    path: "/modifier-colis",
    title: "Modifier colis",
    icon: "ni-single-02 text-yellow",
    class: "d-none",
  },
  {
    path: "/finance-f-h",
    title: "Historique",
    icon: "ni-single-02 text-yellow",
    class: "d-none",
  },
];

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent implements OnInit {
  public menuItems: any[];
  public isCollapsed = true;

  constructor(private router: Router) {}

  ngOnInit() {
    this.menuItems = ROUTES.filter((menuItem) => menuItem);
    this.router.events.subscribe((event) => {
      this.isCollapsed = true;
    });
  }
}
