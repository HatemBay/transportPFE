import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

export interface UserDetails {
  _id: string;
  email: string;
  nom: string;
  role: string;
  ville: string;
  delegation: string;
  adresse: string;
  codePostale: number;
  pic: string; // for future profile picture
  tel: number;
  exp: number;
  iat: number;
}

interface TokenResponse {
  token: string;
}

export interface TokenPayload {
  email: string;
  password: string;
  nom?: string;
  role?: string;
  ville?: string;
  delegation?: string;
  adresse?: string;
  codePostale?: number;
  tel?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  //private fields
  private token: string;

  //public fields
  isLoading$: Observable<boolean>;
  isLoadingSubject: BehaviorSubject<boolean>;

  constructor(private http: HttpClient, private router: Router) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.isLoading$ = this.isLoadingSubject.asObservable();
  }

  private saveToken(token: string): void {
    localStorage.setItem('mean-token', token);
    this.token = token;
  }

  private getToken(): string {
    if (!this.token) {
      this.token = localStorage.getItem('mean-token')!;
    }
    return this.token;
  }

  public logout(): void {
    this.token = '';
    window.localStorage.removeItem('mean-token');
    this.router.navigateByUrl('/login');
  }

  public getUserDetails(): UserDetails | null {
    const token = this.getToken();
    let payload;
    if (token) {
      payload = token.split('.')[1];
      payload = window.atob(payload);
      // console.log(JSON.parse(payload));

      return JSON.parse(payload);
    } else {
      return null;
    }
  }

  public isLoggedIn(): boolean {
    const user = this.getUserDetails();
    if (user && user.role) {
      return user.exp > Date.now() / 1000;
    } else {
      return false;
    }
  }

  private request(
    method: 'post' | 'get',
    type: 'login-user' | 'register',
    user?: TokenPayload
  ): Observable<any> {
    let base: Observable<any>;

    if (method === 'post') {
      base = this.http.post(`http://localhost:3000/api/${type}`, user);
    } else {
      base = this.http.get(`/api/${type}`, {
        headers: { Authorization: `Bearer ${this.getToken()}` },
      });
    }
    // console.log("base:" + user?.email);

    const request = base.pipe(
      map((data: TokenResponse): any => {
        if (data.token) {
          this.saveToken(data.token);
        }
        return data;
      })
    );

    return request;
  }

  public register(user: TokenPayload): Observable<any> {
    this.isLoadingSubject.next(true);
    return this.request('post', 'register', user).pipe(
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  public login(user: TokenPayload): Observable<any> {
    this.isLoadingSubject.next(true);
    return this.request('post', 'login-user', user).pipe(
      finalize(() => this.isLoadingSubject.next(false))
    );

  }

  // public profile(): Observable<any> {
  //   return this.request('get', 'profile');
  // }
}
