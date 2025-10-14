import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DeliveryAgentProfile {
  id?: number;
  email?: string;
  displayName?: string; // Customizable display name (shown as "Name" in UI)
  phoneNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  dateOfBirth?: string;
  licenseNumber?: string;
  licenseExpiryDate?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  bankAccountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  profilePictureUrl?: string;
  isProfileComplete?: boolean;
  isAvailable?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryAgentProfileService {
  private readonly API_URL = `${environment.apiBaseUrl}/delivery-agent/profile`;

  constructor(private http: HttpClient) { }

  getProfile(): Observable<DeliveryAgentProfile> {
    return this.http.get<DeliveryAgentProfile>(this.API_URL);
  }

  createOrUpdateProfile(profile: DeliveryAgentProfile): Observable<DeliveryAgentProfile> {
    return this.http.post<DeliveryAgentProfile>(this.API_URL, profile);
  }

  isProfileComplete(): Observable<boolean> {
    return this.http.get<boolean>(`${this.API_URL}/complete`);
  }
}
