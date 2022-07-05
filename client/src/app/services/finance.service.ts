import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
  HttpParams,
} from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class FinanceService {
  baseUri: string = "http://localhost:3000/api/finance";
  headers = new HttpHeaders({
    Authorization: `Bearer ${localStorage.getItem("mean-token")!}`,
  }).set("Content-Type", "application/json");
  constructor(private http: HttpClient) {}

  // Create return sheet
  createFinance(data: any): Observable<any> {
    const url = `${this.baseUri}`;
    return this.http
      .post(url, data, { headers: this.headers })
      .pipe(catchError(this.errorMgmt));
  }

  // Get return sheet
  getFinance(id: any): Observable<any> {
    const url = `${this.baseUri}/${id}`;
    return this.http.get(url, { headers: this.headers }); //if error try removing/adding header
  }

  // Get all return sheets with all foreign info
  getFinances(
    fournisseurId: any,
    limit?: any,
    page?: any,
    sortBy?: any,
    sort?: any,
    search?: any,
    startDate?: any,
    endDate?: any
  ): Observable<any> {
    const url = `${this.baseUri}`;
    var queryParams = new HttpParams();
    queryParams = queryParams.append("fournisseurId", fournisseurId);
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

  // Update return sheet
  updateFinance(id: any, data: any): Observable<any> {
    let url = `${this.baseUri}/${id}`;
    return this.http
      .put(url, data, { headers: this.headers })
      .pipe(catchError(this.errorMgmt));
  }

  // Delete return sheet
  deleteFinance(id: any): Observable<any> {
    let url = `${this.baseUri}/${id}`;
    return this.http
      .delete(url, { headers: this.headers })
      .pipe(catchError(this.errorMgmt));
  }

  // Count return sheets
  countFinances(startDate?: any, endDate?: any): Observable<any> {
    let url = `${this.baseUri}/count/all`;
    var queryParams = new HttpParams();
    if (startDate) {
      queryParams = queryParams.append("startDate", startDate);
    }
    if (endDate) {
      queryParams = queryParams.append("endDate", endDate);
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

  // Get last finance number
  getLastFinanceNb(): Observable<any> {
    const url = `${this.baseUri}/nb/last`;
    return this.http.get(url, { headers: this.headers }); //if error try removing/adding header
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
