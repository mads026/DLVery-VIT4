import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InventoryProfile, UpdateProfileRequest, ChangePasswordRequest } from '../models/profile.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = `${environment.apiBaseUrl}/inventory/profile`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<InventoryProfile> {
    return this.http.get<InventoryProfile>(this.apiUrl);
  }

  updateProfile(request: UpdateProfileRequest): Observable<InventoryProfile> {
    return this.http.put<InventoryProfile>(this.apiUrl, request);
  }

  changePassword(request: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/change-password`, request);
  }
}
