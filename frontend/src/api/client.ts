const BASE_URL = "http://localhost:8080";

interface RequestOptions extends Omit<RequestInit, "body" | "headers"> {
  headers?: HeadersInit;
  body?: BodyInit | null;
}

interface ErrorResponse {
  code?: string;
  message?: string;
  details?: Record<string, unknown>;
  trace_id?: string | null;
}

interface ApiError extends Error {
  code?: string;
  details?: Record<string, unknown>;
  traceId?: string | null;
  status?: number;
}

export interface SendOtpRequest {
  full_name: string;
  email?: string;
  phone?: string;
  password: string;
}

export interface SendOtpResponse {
  challenge_id: string;
  otp_code: string;
  message: string;
}

export interface CompleteRegistrationRequest {
  challenge_id: string;
  otp_code: string;
}

export interface AppUserSummary {
  id: string;
  email?: string | null;
  phone?: string | null;
  full_name?: string | null;
  guest: boolean;
}

export interface RegistrationResponse {
  user: AppUserSummary;
  message: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: AppUserSummary;
}

export interface DeliveryCenter {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address_line?: string | null;
  service_area_geo?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
}

export type VehicleType = "DRONE" | "ROBOT";
export type PackageSizeTier = "S" | "M" | "L";

export interface FleetVehicle {
  id: string;
  center_id: string;
  vehicle_type: VehicleType;
  available: boolean;
  external_device_id?: string | null;
  telemetry_hint?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
}

export interface CreateOrderRequest {
  center_id: string;
  pickup_address: string;
  pickup_lat?: number | null;
  pickup_lng?: number | null;
  dropoff_address: string;
  dropoff_lat?: number | null;
  dropoff_lng?: number | null;
}

export interface CreateOrderResponse {
  order_id: string;
  status: string;
  created_at: string;
}

export interface CreateParcelRequest {
  size_tier: PackageSizeTier;
  weight_kg: number;
  fragile: boolean;
  delivery_notes?: string | null;
}

export interface CreateParcelResponse {
  parcel_id: string;
  order_id: string;
  size_tier: PackageSizeTier;
  weight_kg: number;
}

function buildAuthHeaders(token?: string): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(
  url: string,
  options: RequestOptions = {},
): Promise<T> {
  const token = window.sessionStorage.getItem("access_token") ?? undefined;
  const response = await fetch(BASE_URL + url, {
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(token),
      ...(options.headers ?? {}),
    },
    ...options,
  });

  const text = await response.text();

  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const errorBody =
      data && typeof data === "object" ? (data as ErrorResponse) : null;
    const error = new Error(
      errorBody?.message ||
        (typeof data === "string" && data) ||
        "Request failed",
    ) as ApiError;

    error.code = errorBody?.code;
    error.details = errorBody?.details;
    error.traceId = errorBody?.trace_id ?? null;
    error.status = response.status;

    throw error;
  }

  return data as T;
}

// ================== AUTH ==================

export function sendOtp(body: SendOtpRequest): Promise<SendOtpResponse> {
  return request<SendOtpResponse>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function register(
  body: CompleteRegistrationRequest,
): Promise<RegistrationResponse> {
  return request<RegistrationResponse>("/api/v1/auth/register/complete", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function login(body: LoginRequest): Promise<LoginResponse> {
  return request<LoginResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getMe(): Promise<AppUserSummary> {
  return request<AppUserSummary>("/api/v1/auth/me", {
    method: "GET",
  });
}

// ================== USER PROFILE (F8) ==================

// F8
// BEFORE: no profile update function existed in client.ts.
// AFTER:  UpdateProfileRequest type + updateProfile() calling PUT /api/v1/users/me.
//         Only fullName and phone are sent; email is omitted because the backend
//         intentionally ignores it to keep email immutable.

export interface UpdateProfileRequest {
  full_name: string;
  phone: string;
}

export function updateProfile(body: UpdateProfileRequest): Promise<AppUserSummary> {
  return request<AppUserSummary>("/api/v1/users/me", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

// ================== CENTER ==================

export function fetchCenters(): Promise<DeliveryCenter[]> {
  return request<DeliveryCenter[]>("/api/v1/centers", {
    method: "GET",
  });
}

export function fetchCenterDetail(centerId: string): Promise<DeliveryCenter> {
  return request<DeliveryCenter>(`/api/v1/centers/${centerId}`, {
    method: "GET",
  });
}

// ================== VEHICLE ==================

export function fetchVehicles(centerId: string): Promise<FleetVehicle[]> {
  return request<FleetVehicle[]>(`/api/v1/centers/${centerId}/vehicles`, {
    method: "GET",
  });
}

export function fetchVehicleDetail(vehicleId: string): Promise<FleetVehicle> {
  return request<FleetVehicle>(`/api/v1/vehicles/${vehicleId}`, {
    method: "GET",
  });
}

// ================== VALIDATION ==================

export interface AddressValidateRequest {
  address: string;
  lat?: number;
  lng?: number;
}

export interface AddressValidateResponse {
  valid: boolean;
  message: string;
}

export function validateAddress(
  body: AddressValidateRequest,
): Promise<AddressValidateResponse> {
  return request<AddressValidateResponse>("/api/v1/validate/address", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ================== ORDER ==================

export function createOrder(
  body: CreateOrderRequest,
): Promise<CreateOrderResponse> {
  return request<CreateOrderResponse>("/api/v1/orders", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function addParcel(
  orderId: string,
  body: CreateParcelRequest,
): Promise<CreateParcelResponse> {
  return request<CreateParcelResponse>(`/api/v1/orders/${orderId}/parcels`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export interface PayOrderRequest {
  vehicle_type: string;
  price_usd: number;
  eta_minutes: number;
}

export interface PayOrderResponse {
  order_id: string;
  handoff_pin: string;
  vehicle_type: string;
  eta_minutes: number;
  total_amount: number;
  currency: string;
}

export function payOrder(
  orderId: string,
  body: PayOrderRequest,
): Promise<PayOrderResponse> {
  return request<PayOrderResponse>(`/api/v1/orders/${orderId}/pay`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export type OrderStatus = "PENDING" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";

export interface OrderSummary {
  order_id: string;
  status: OrderStatus;
  dropoff_summary: string;
  vehicle_type_chosen: string | null;
  total_amount: number;
  currency: string;
  created_at: string;
}

export function getMyOrders(): Promise<OrderSummary[]> {
  return request<OrderSummary[]>("/api/v1/orders/me", {
    method: "GET",
  });
}
// ================== TRACKING ==================

export interface TrackingState {
  order_id: string;
  status: "PENDING" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
  vehicle_type: string;
  handoff_pin?: string | null;
  sim_lat: number;
  sim_lng: number;
  sim_heading_deg: number;
  eta_minutes: number;
  start_lat?: number | null;
  start_lng?: number | null;
  dropoff_lat?: number | null;
  dropoff_lng?: number | null;
}

export function getTracking(orderId: string): Promise<TrackingState> {
  return request<TrackingState>(`/api/v1/orders/${orderId}/tracking`, {
    method: "GET",
  });
}
