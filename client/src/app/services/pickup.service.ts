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

@Injectable({
  providedIn: "root",
})
export class PickupService {
  userId: any;
  baseUri: string = "http://localhost:3000/api/pickups";
  headers = new HttpHeaders({
    Authorization: `Bearer ${localStorage.getItem("mean-token")!}`,
  }).set("Content-Type", "application/json");
  constructor(private http: HttpClient, private auth: AuthenticationService) {
    this.userId = this.auth.getUserDetails()._id;
  }

  // Create pickup
  createPickup(data: any): Observable<any> {
    const url = `${this.baseUri}`;
    return this.http
      .post(url, data, { headers: this.headers })
      .pipe(catchError(this.errorMgmt));
  }

  // Get pickup
  getPickup(id: any) {
    const url = `${this.baseUri}/${id}`;
    return this.http.get(url, { headers: this.headers }); //if error try removing/adding header
  }

  // Get all pickups with all foreign info
  getPickups(
    isAllocated?: any,
    limit?: any,
    page?: any,
    sortBy?: any,
    sort?: any,
    search?: any,
    startDate?: any,
    endDate?: any
  ) {
    const url = `${this.baseUri}`;
    var queryParams = new HttpParams();
    if (isAllocated) {
      queryParams = queryParams.append("isAllocated", isAllocated);
    }
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

  // Update pickup
  updatePickup(id: any, data: any): Observable<any> {
    let url = `${this.baseUri}/${id}`;
    return this.http
      .put(url, data, { headers: this.headers })
      .pipe(catchError(this.errorMgmt));
  }

  // Delete pickup
  deletePickup(id: any): Observable<any> {
    let url = `${this.baseUri}/${id}`;
    return this.http
      .delete(url, { headers: this.headers })
      .pipe(catchError(this.errorMgmt));
  }

  // Count pickups
  countPickups(
    isAllocated?: any,
    startDate?: any,
    endDate?: any
  ): Observable<any> {
    let url = `${this.baseUri}/count/all`;
    var queryParams = new HttpParams();
    if (isAllocated) {
      queryParams = queryParams.append("isAllocated", isAllocated);
    }
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
