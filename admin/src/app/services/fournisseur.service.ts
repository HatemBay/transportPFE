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
export class FournisseurService {
  userId: any;
  baseUri: string = "http://localhost:3000/api/fournisseurs";

  headers = new HttpHeaders({
    Authorization: `Bearer ${localStorage.getItem("mean-token")!}`,
  }).set("Content-Type", "application/json");
  constructor(private http: HttpClient, private auth: AuthenticationService) {
    this.userId = this.auth.getUserDetails()._id;
    // console.log(localStorage.getItem("mean-token")!);
  }

  // Create fournisseur
  createFournisseur(data: any): Observable<any> {
    const url = `${this.baseUri}`;
    return this.http
      .post(url, data, { headers: this.headers })
      .pipe(catchError(this.errorMgmt));
  }
  // Get all fournisseurs
  getFournisseurs(limit?: any, page?: any, sortBy?: any, sort?: any, search?: any): Observable<any> {
    const url = `${this.baseUri}/`;
    var queryParams = new HttpParams();
    queryParams = queryParams.append("limit", limit);
    queryParams = queryParams.append("page", page);
    if (sortBy) {
      queryParams = queryParams.append("sortBy", sortBy || "");
    }
    if (sort) {
      queryParams = queryParams.append("sort", sort || "");
    }
    if (search) {
      queryParams = queryParams.append("search", search || "");
    }
    return this.http.get(url, { headers: this.headers, params: queryParams }); //if error try removing/adding header
  }

  // Get fournisseur
  getFournisseur(id: any): Observable<any> {
    const url = `${this.baseUri}/${id}`;
    return this.http.get(url, { headers: this.headers }).pipe(
      // map((res: Response) => {
      map((res: any) => {
        return res || {};
      }),
      catchError(this.errorMgmt)
    );
  }

  // Update fournisseur
  updateFournisseur(id: any, data: any): Observable<any> {
    let url = `${this.baseUri}/${id}`;
    return this.http
      .put(url, data, { headers: this.headers })
      .pipe(catchError(this.errorMgmt));
  }
  // Delete fournisseur
  deleteFournisseur(id: any): Observable<any> {
    let url = `${this.baseUri}/${id}`;
    return this.http
      .delete(url, { headers: this.headers })
      .pipe(catchError(this.errorMgmt));
  }
  // Count fournisseurs
  countAllFournisseurs(): Observable<any> {
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
    let errorMessage = "";
    if (error.error instanceof ErrorEvent) {
      // Get fournisseur-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(errorMessage);
  }
}
