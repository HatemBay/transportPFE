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
    roles: ["fourn"],
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
  //* gestion
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
  //* chef de bureau
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
  //* finance
  {
    path: "/finance",
    title: "Finance",
    icon: "ni-circle-08 text-pink",
    class: "",
    roles: ["fourn"],
    parent: "",
    collapsable: true,
  },
  {
    path: "/finance-client",
    title: "Client",
    class: "",
    roles: ["fourn"],
    parent: "Finance",
  },
  {
    path: "/debrief-global",
    title: "Debrief global",
    class: "",
    roles: [],
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
    private packageService: PackageService
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
    console.log( this.test.indexOf('financier'));

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
    return roles.indexOf(this.role) !== -1
  }

  async countTodayPackages() {
    return await this.packageService
      .notify()
      .pipe(
        map((data) => {
          return data.count;
        })
      )
      .toPromise();
  }
}
