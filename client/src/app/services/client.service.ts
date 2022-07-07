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

export interface IClient {
  nom?: string;
  ville?: string;
  delegation?: string;
  adresse?: string;
  codePostale?: number;
  fournisseurId?: string;
  tel?: number;
  tel2?: number;
}

@Injectable({
  providedIn: "root",
})
export class ClientService {
  userId: any;
  baseUri: string = "http://localhost:3000/api/clients";
  headers = new HttpHeaders({
    Authorization: `Bearer ${localStorage.getItem("mean-token")!}`,
  }).set("Content-Type", "application/json");
  constructor(private http: HttpClient, private auth: AuthenticationService) {
    this.userId = this.auth.getUserDetails()._id;
  }

  // Create client
  createClient(data: any): Observable<any> {
    const url = `${this.baseUri}`;
    return this.http
      .post(url, data, { headers: this.headers })
      .pipe(catchError(this.errorMgmt));
  }

  getClients(
    limit?: any,
    page?: any,
    sortBy?: any,
    sort?: any,
    search?: any,
    tels?: any
  ): Observable<any> {
    const url = `${this.baseUri}/all`;
    var queryParams = new HttpParams();
    queryParams = queryParams.append("fid", this.userId);
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
    if (tels) {
      queryParams = queryParams.append("tels", tels);
    }
    return this.http.get(url, { headers: this.headers, params: queryParams }); //if error try removing/adding header
  }

  // Get client
  getClient(id: any): Observable<any> {
    const url = `${this.baseUri}/${id}`;
    return this.http.get(url, { headers: this.headers }).pipe(
      // map((res: Response) => {
      map((res: any) => {
        return res || {};
      }),
      catchError(this.errorMgmt)
    );
  }

  // Get client by phone number
  getClientByPhone(tel: any): Observable<any> {
    const url = `${this.baseUri}/tel/${tel}`;
    return this.http
      .get(url, { headers: this.headers })
      .pipe(catchError(this.errorMgmt));
  }
  // Update client
  updateClient(id: any, data: any): Observable<any> {
    let url = `${this.baseUri}/${id}`;
    return this.http
      .put(url, data, { headers: this.headers })
      .pipe(catchError(this.errorMgmt));
  }
  // Delete client
  deleteClient(id: any): Observable<any> {
    let url = `${this.baseUri}/${id}`;
    return this.http
      .delete(url, { headers: this.headers })
      .pipe(catchError(this.errorMgmt));
  }
  // Count clients
  countAllClients(): Observable<any> {
    let url = `${this.baseUri}/count/all/${this.userId}`;
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
