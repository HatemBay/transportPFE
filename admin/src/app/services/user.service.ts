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
export class UserService {
  baseUri: string = "http://localhost:3000/api/users";
  headers = new HttpHeaders({
    Authorization: `Bearer ${localStorage.getItem("mean-token")!}`,
  }).set("Content-Type", "application/json");
  constructor(private http: HttpClient) {}

  // Create user
  createUser(data: any): Observable<any> {
    const url = `${this.baseUri}`;
    return this.http
      .post(url, data, { headers: this.headers })
      .pipe(catchError(this.errorMgmt));
  }

  // Get all users
  getUsers(
    limit?: any,
    page?: any,
    sortBy?: any,
    sort?: any,
    search?: any
  ): Observable<any> {
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
    const url = `${this.baseUri}`;
    return this.http.get(url, { headers: this.headers, params: queryParams });
  }

  // Get users by role
  // temporarily: get drivers with no vehicules
  getUsersByRole(): Observable<any> {
    const url = `${this.baseUri}/role/chauffeur`;
    return this.http.get(url, { headers: this.headers });
  }

  // Get all drivers
  getChauffeurs(): Observable<any> {
    const url = `${this.baseUri}/role/chauffeur/all`;
    return this.http.get(url, { headers: this.headers });
  }

  // Get user
  getUser(id: any): Observable<any> {
    const url = `${this.baseUri}/${id}`;
    return this.http.get(url, { headers: this.headers }).pipe(
      // map((res: Response) => {
      map((res: any) => {
        return res || {};
      }),
      catchError(this.errorMgmt)
    );
  }

  // Update user
  updateUser(id: any, data: any, cid?: any): Observable<any> {
    let url = `${this.baseUri}/${id}`;
    return this.http
      .put(url, data, { headers: this.headers })
      .pipe(catchError(this.errorMgmt));
  }

  // Delete user
  deleteUser(id: any): Observable<any> {
    let url = `${this.baseUri}/${id}`;
    return this.http
      .delete(url, { headers: this.headers })
      .pipe(catchError(this.errorMgmt));
  }

  // Count users
  countUsers(): Observable<any> {
    let url = `${this.baseUri}/count/all`;

    return this.http.get(url, { headers: this.headers }).pipe(
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
