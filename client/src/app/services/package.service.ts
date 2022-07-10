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
  userId: any;
  baseUri: string = "http://localhost:3000/api/packages";
  headers = new HttpHeaders({
    Authorization: `Bearer ${localStorage.getItem("mean-token")!}`,
  }).set("Content-Type", "application/json");
  constructor(private http: HttpClient, private auth: AuthenticationService) {
    this.userId = this.auth.getUserDetails()._id;
  }

  // Create package
  createPackage(data: any): Observable<any> {
    const url = `${this.baseUri}`;
    return this.http
      .post(url, data, { headers: this.headers })
      .pipe(catchError(this.errorMgmt));
  }

  //upload package and client details as excel
  uploadExcel(id: any, data: any): Observable<any> {
    const url = `http://localhost:3000/api/excel-upload/${id}`;
    return this.http.post(url, data).pipe(catchError(this.errorMgmt));
  }

  // Get all packages
  getPackages(): Observable<any> {
    const url = `${this.baseUri}`;
    return this.http.get(url, { headers: this.headers }); //if error try removing/adding header
  }

  // Get all packages with all foreign info (by provider id)
  getFullPackage(id: any): Observable<any> {
    const url = `${this.baseUri}/all-info/${id}/${this.userId}`;
    return this.http.get(url, { headers: this.headers }); //if error try removing/adding header
  }

  // Get all packages with all foreign info
  getFullPackages(
    type: any,
    limit?: any,
    page?: any,
    sortBy?: any,
    sort?: any,
    search?: any,
    etat?: any,
    startDate?: any,
    endDate?: any
  ): Observable<any> {
    const url = `${this.baseUri}/all-info/${this.userId}`;
    var queryParams = new HttpParams();
    queryParams = queryParams.append("limit", limit);
    queryParams = queryParams.append("page", page);
    if (type) {
      queryParams = queryParams.append("type", type);
    }
    if (sortBy) {
      queryParams = queryParams.append("sortBy", sortBy);
    }
    if (sort) {
      queryParams = queryParams.append("sort", sort);
    }
    if (search) {
      queryParams = queryParams.append("search", search);
    }
    if (etat) {
      queryParams = queryParams.append("etat", etat);
    }
    if (startDate) {
      queryParams = queryParams.append("startDate", startDate);
    }
    if (endDate) {
      queryParams = queryParams.append("endDate", endDate);
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

  countAllPackages(
    etat?: any,
    startDate?: any,
    endDate?: any
  ): Observable<any> {
    let url = `${this.baseUri}/count/all-period`;
    var queryParams = new HttpParams();
    if (etat) {
      queryParams = queryParams.append("etat", etat);
    }
    if (startDate) {
      queryParams = queryParams.append("startDate", startDate);
    }
    if (endDate) {
      queryParams = queryParams.append("endDate", endDate);
    }
    queryParams = queryParams.append("fournisseurId", this.userId);

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

  // get package count daily over a week
  statsWeek(): Observable<any> {
    let url = `${this.baseUri}/count/over-week`;
    var queryParams = new HttpParams();
    queryParams = queryParams.append("fournisseurId", this.userId);
    return this.http.get(url, { headers: this.headers }).pipe(
      map((res: any) => {
        return res || {};
      }),
      catchError(this.errorMgmt)
    );
  }

  // get package count monthly over a year
  statsYear(): Observable<any> {
    let url = `${this.baseUri}/count/over-year`;
    var queryParams = new HttpParams();
    queryParams = queryParams.append("fournisseurId", this.userId);
    return this.http.get(url, { headers: this.headers }).pipe(
      map((res: any) => {
        return res || {};
      }),
      catchError(this.errorMgmt)
    );
  }

  statsDeliveryRate(number?: any): Observable<any> {
    let url = `${this.baseUri}/count/delivery-rate`;
    var queryParams = new HttpParams();
    if (number) {
      queryParams = queryParams.append("number", number || "");
    }
    queryParams = queryParams.append("fournisseurId", this.userId);
    return this.http
      .get(url, { headers: this.headers, params: queryParams })
      .pipe(
        map((res: any) => {
          return res || {};
        }),
        catchError(this.errorMgmt)
      );
  }

  // Error handling
  errorMgmt(error: HttpErrorResponse) {
    let errorMessage;
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = { message: error.message };
    } else {
      // Get server-side error
      errorMessage = { code: error.status, message: error.error };
    }
    console.log(errorMessage);
    return throwError(errorMessage);
  }
}
