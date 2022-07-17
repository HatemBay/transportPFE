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
  // Update fournisseur
  updateFournisseur(id: any, data: any): Observable<any> {
    let url = `${this.baseUri}/${id}`;
    return this.http
      .put(url, data, { headers: this.headers })
      .pipe(catchError(this.errorMgmt));
  }
  changePassword(id: any, data: any): Observable<any> {
    let url = `${this.baseUri}/new-password/${id}`;
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
  // errorMgmt(error: HttpErrorResponse) {
  //   let errorMessage = "";
  //   if (error.error instanceof ErrorEvent) {
  //     // Get fournisseur-side error
  //     errorMessage = error.error.message;
  //   } else {
  //     // Get server-side error
  //     errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
  //   }
  //   console.log(errorMessage);
  //   return throwError(errorMessage);
  // }

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
