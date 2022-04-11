import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
  HttpParams,
} from "@angular/common/http";
import { AuthenticationService } from "./authentication.service";

export interface IPackage {
  c_remboursement?: number;
  service?: string;
  libelle?: string;
  volume?: string;
  poids?: number;
  pieces?: number;
  remarque?: string;
  fournisseurId?: string;
  clientId?: string;
}

@Injectable({
  providedIn: "root",
})
export class PackageService {
  baseUri: string = "http://localhost:3000/api/packages";
  headers = new HttpHeaders({
    Authorization: `Bearer ${localStorage.getItem("mean-token")!}`,
  }).set("Content-Type", "application/json");
  constructor(private http: HttpClient, private auth: AuthenticationService) {}

  // Create package
  createPackage(data: any): Observable<any> {
    const url = `${this.baseUri}`;
    return this.http
      .post(url, data, { headers: this.headers })
      .pipe(catchError(this.errorMgmt));
  }

  // Get all packages
  getPackages() {
    const url = `${this.baseUri}`;
    return this.http.get(url, { headers: this.headers }); //if error try removing/adding header
  }

  // Get all packages with all foreign info
  getFullPackage(id: any) {
    const url = `${this.baseUri}/all-info/${id}`;
    return this.http.get(url, { headers: this.headers }); //if error try removing/adding header
  }

  // Get all packages with all foreign info
  getFullPackages(
    limit?: any,
    page?: any,
    sortBy?: any,
    sort?: any,
    search?: any,
    startDate?: any,
    endDate?: any
  ) {
    const url = `${this.baseUri}/all-info-period/admin`;
    var queryParams = new HttpParams();
    queryParams = queryParams.append("limit", limit);
    queryParams = queryParams.append("page", page);
    if (sortBy) {
      queryParams = queryParams.append("sortBy", sortBy);
    }
    if (sort) {
      queryParams = queryParams.append("sort", sort);
    }
    if (search) {
      queryParams = queryParams.append("search", search);
    }
    if (startDate) {
      queryParams = queryParams.append("startDate", startDate);
    }
    if (endDate) {
      queryParams = queryParams.append("endDate", endDate);
    }
    return this.http.get(url, { headers: this.headers, params: queryParams }); //if error try removing/adding header
  }

  getDailyPackages(
    limit?: any,
    page?: any,
    sortBy?: any,
    sort?: any,
    search?: any,
    date?: any
  ) {
    const url = `${this.baseUri}/all-info-daily/admin`;
    var queryParams = new HttpParams();
    queryParams = queryParams.append("limit", limit);
    queryParams = queryParams.append("page", page);
    if (sortBy) {
      queryParams = queryParams.append("sortBy", sortBy);
    }
    if (sort) {
      queryParams = queryParams.append("sort", sort);
    }
    if (search) {
      queryParams = queryParams.append("search", search);
    }
    if (date) {
      queryParams = queryParams.append("date", date);
    }
    return this.http.get(url, { headers: this.headers, params: queryParams }); //if error try removing/adding header
  }

  // Get package
  getPackage(id: any): Observable<any> {
    const url = `${this.baseUri}/${id}`;
    return this.http.get(url, { headers: this.headers }).pipe(
      // map((res: Response) => {
      map((res: any) => {
        return res || {};
      }),
      catchError(this.errorMgmt)
    );
  }

  // Update package
  updatePackage(id: any, data: any): Observable<any> {
    let url = `${this.baseUri}/${id}`;
    return this.http
      .put(url, data, { headers: this.headers })
      .pipe(catchError(this.errorMgmt));
  }

  // Delete package
  deletePackage(id: any): Observable<any> {
    let url = `${this.baseUri}/${id}`;
    return this.http
      .delete(url, { headers: this.headers })
      .pipe(catchError(this.errorMgmt));
  }

  // Count packages
  countAllPackagesAdmin(
    etat?: any,
    startDate?: any,
    endDate?: any,
  ): Observable<any> {
    let url = `${this.baseUri}/count/all-period`;
    var queryParams = new HttpParams();
    if (etat) {
      queryParams = queryParams.append("etat", etat || "");
    }
    if (startDate) {
      startDate = queryParams.append("startDate", startDate || "");
    }
    if (endDate) {
      queryParams = queryParams.append("endDate", endDate || "");
    }

    return this.http
      .get(url, { headers: this.headers, params: queryParams })
      .pipe(
        map((res: any) => {
          return res || {};
        }),
        catchError(this.errorMgmt)
      );
  }

    // Count packages
    countAllPackagesAdminDaily(date?: any): Observable<any> {
      let url = `${this.baseUri}/count/all-daily`;
      var queryParams = new HttpParams();
      if (date) {
        queryParams = queryParams.append("date", date || "");
      }

      return this.http
        .get(url, { headers: this.headers, params: queryParams })
        .pipe(
          map((res: any) => {
            return res || {};
          }),
          catchError(this.errorMgmt)
        );
    }

  // Count packages for a client
  // not working
  countByClient(id: any): Observable<any> {
    let url = `${this.baseUri}/count/${id}`;
    return this.http.get(url, { headers: this.headers }).pipe(
      map((res: any) => {
        return res || {};
      }),
      catchError(this.errorMgmt)
    );
  }

  // Error handling
  errorMgmt(error: HttpErrorResponse) {
    let errorMessage = "";
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(errorMessage);
  }
}
