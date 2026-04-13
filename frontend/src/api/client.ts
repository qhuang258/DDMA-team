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

export interface FleetVehicle {
  id: string;
  center_id: string;
  vehicle_type: VehicleType;
  available: boolean;
  external_device_id?: string | null;
  telemetry_hint?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
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
