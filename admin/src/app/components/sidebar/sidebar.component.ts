import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthenticationService } from "src/app/services/authentication.service";
import { io } from "socket.io-client";
import { PackageService } from "src/app/services/package.service";
import { map } from "rxjs/internal/operators/map";
import { PickupService } from "src/app/services/pickup.service";

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
  // Hidden items (used to display their title in ui)
  {
    path: "/modifier-personel",
    title: "Modifier personel",
    icon: "ni-single-02 text-yellow",
    class: "d-none",
    roles: [],
    parent: "Gestion",
  },
  {
    path: "/modifier-client",
    title: "Modifier client",
    icon: "ni-single-02 text-yellow",
    class: "d-none",
    roles: [],
    parent: "Gestion",
  },
  {
    path: "/modifier-vehicule",
    title: "Modifier vehicule",
    icon: "ni-single-02 text-yellow",
    class: "d-none",
    roles: [],
    parent: "Gestion",
  },
  {
    path: "/feuille-de-retour-historique",
    title: "feuille de retourHistorique",
    icon: "ni-single-02 text-yellow",
    class: "d-none",
    roles: [],
    parent: "Chef de bureau",
  },
  {
    path: "/pickup-historique",
    title: "Pickup/ historique",
    icon: "ni-single-02 text-yellow",
    class: "d-none",
    roles: [],
    parent: "Chef de bureau",
  },
  //----------
  {
    path: "/dashboard",
    title: "Dashboard",
    icon: "ni-tv-2 text-primary",
    class: "",
    roles: ["admin", "financier", "commercial", "chef bureau"],
    parent: "",
    collapsable: false,
  },
  // {
  //   path: "/icons",
  //   title: "Icons",
  //   icon: "ni-planet text-blue",
  //   class: "",
  //   roles: [],
  //   parent: "",
  //   collapsable: false,
  // },
  {
    path: "/colis-jour",
    title: "Colis de jour",
    icon: "ni-pin-3 text-orange",
    class: "",
    roles: ["admin", "financier", "commercial", "chef bureau"],
    parent: "",
    collapsable: false,
  },
  {
    path: "/user-profile",
    title: "Mon profil",
    icon: "ni-single-02 text-yellow",
    class: "",
    roles: ["admin", "financier", "commercial", "chef bureau"],
    parent: "",
    collapsable: false,
  },
  {
    path: "/gestion-colis",
    title: "Gestion de colis",
    icon: "ni-circle-08 text-pink",
    class: "",
    roles: ["admin", "financier", "commercial", "chef bureau"],
    parent: "",
    collapsable: false,
  },
  {
    path: "/recherche-av",
    title: "Recherche",
    icon: "ni-bullet-list-67 text-red",
    class: "",
    roles: ["admin", "financier", "commercial", "chef bureau"],
    parent: "",
    collapsable: false,
  },
  // {
  //   path: "/carnet-adresses",
  //   title: "Carnet d'adresses",
  //   icon: "ni-key-25 text-info",
  //   class: "",
  //   roles: [],
  //   parent: "",
  //   collapsable: false,
  // },
  //* gestion
  {
    path: "",
    title: "Gestion",
    icon: "ni-settings-gear-65 text-info",
    class: "",
    roles: ["admin", "commercial"],
    parent: "",
    collapsable: true,
  },
  {
    path: "/gestion-filiere",
    title: "Fili??re",
    class: "",
    roles: ["admin"],
    parent: "Gestion",
  },
  {
    path: "/gestion-personel",
    title: "Personel",
    class: "",
    roles: ["admin"],
    parent: "Gestion",
  },
  {
    path: "/gestion-client",
    title: "Client",
    class: "",
    roles: ["admin", "commercial"],
    parent: "Gestion",
  },
  {
    path: "/gestion-vehicule",
    title: "V??hicule",
    class: "",
    roles: ["admin"],
    parent: "Gestion",
  },
  {
    path: "/gestion-ville",
    title: "Ville",
    class: "",
    roles: ["admin"],
    parent: "Gestion",
  },
  {
    path: "/gestion-delegation",
    title: "D??l??gation",
    class: "",
    roles: ["admin"],
    parent: "Gestion",
  },
  //* chef de bureau
  {
    path: "",
    title: "Chef de bureau",
    icon: "ni-settings-gear-65 text-info",
    class: "",
    roles: ["admin", "chef bureau"],
    parent: "",
    collapsable: true,
  },

  {
    path: "/pickup",
    title: "Pickup",
    class: "",
    roles: ["admin", "chef bureau"],
    parent: "Chef de bureau",
  },
  {
    path: "/ramassage",
    title: "Ramassage",
    class: "",
    roles: ["admin", "chef bureau"],
    parent: "Chef de bureau",
  },
  {
    path: "/collecte",
    title: "Collect??",
    class: "",
    roles: ["admin", "chef bureau"],
    parent: "Chef de bureau",
  },
  {
    path: "/feuille-de-route",
    title: "Feuille de route",
    class: "",
    roles: ["admin", "chef bureau"],
    parent: "Chef de bureau",
  },
  {
    path: "/debrief-list",
    title: "Debrief",
    class: "",
    roles: ["admin", "chef bureau"],
    parent: "Chef de bureau",
  },
  {
    path: "/feuille-de-retour",
    title: "Feuille de retour",
    class: "",
    roles: ["admin", "chef bureau"],
    parent: "Chef de bureau",
  },
  //* finance
  {
    path: "/finance",
    title: "Finance",
    icon: "ni-circle-08 text-pink",
    class: "",
    roles: ["admin", "financier"],
    parent: "",
    collapsable: true,
  },
  {
    path: "/finance-client",
    title: "Client",
    class: "",
    roles: ["admin", "financier"],
    parent: "Finance",
  },
  {
    path: "/debrief-global",
    title: "Debrief global",
    class: "",
    roles: ["admin", "financier"],
    parent: "Finance",
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
  public isFCollapsed = false;
  public isCollapsed = false;

  private socket: any;
  public data: any;

  role: string;
  packageCount: any;
  test = [];

  constructor(
    private router: Router,
    private auth: AuthenticationService,
    private packageService: PackageService,
    private pickupService: PickupService
  ) {
    // role management
    this.role = this.auth.getUserDetails().role;
    console.log(this.role);
    // Connect Socket with server URL
    this.socket = io("http://localhost:3000", { transports: ["websocket"] });
  }

  async ngOnInit(): Promise<void> {
    this.menuItems = ROUTES.filter((menuItem) => menuItem);
    console.log(typeof this.menuItems[4].roles[0]);
    // for (let item of this.menuItems[4].roles) {
    //   this.test.push(item);
    // }
    this.test = this.menuItems[4].roles as Array<string>;
    console.log(this.test.indexOf("financier"));

    // console.log( this.menuItems[4].roles.indexOF('financier'));

    this.router.events.subscribe((event) => {
      this.isCollapsed = true;
    });
    this.packageCount = await this.countTodayPackages();
    console.log(this.packageCount);
    this.socket.on("notification", (data) => {
      this.packageCount = data.count;
    });
  }

  checkRole(data) {
    const roles = data as Array<string>;
    return roles.indexOf(this.role) !== -1;
  }

  async countTodayPackages() {
    return await this.pickupService
      .notify()
      .pipe(
        map((data) => {
          return data.count;
        })
      )
      .toPromise();
  }
}
