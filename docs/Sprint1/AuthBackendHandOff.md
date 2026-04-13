# Sprint 1 Auth Backend Hand-off

This note is for teammates continuing Sprint 1 backend/frontend work after `T-1.11`, `T-1.12`, `T-1.13b`, and `T-1.14a` are in place.

## What is already done

- `T-1.11`: auth-related DTO/service read-write paths are available
- `T-1.12`: OpenAPI baseline is frozen
- `T-1.13a`: `POST /api/v1/auth/register` (initiate — create pending user + OTP challenge)
- `T-1.13b`: `POST /api/v1/auth/register/complete`
- `T-1.14a`: `POST /api/v1/auth/login`
- `T-1.14b`: JWT verification + protected routes via `JwtAuthInterceptor`

## Fixed contract entry

- Source file: `backend/DeliveryManagement/src/main/resources/static/openapi/sprint1-baseline.yaml`
- Runtime URL: `http://localhost:8080/openapi/sprint1-baseline.yaml`

## Important implementation notes

- Global JSON naming is `snake_case`
- Request bodies should use fields like `challenge_id`, `otp_code`, `access_token`
- Password and OTP hash format is:
  - `sha256$<salt>$<sha256(salt:raw_value)>`
- JWT is currently issued in `JwtService` using HS256
- JWT verification / protected routes are not implemented yet; that is the remaining `T-1.14b`

## Local run command

```powershell
cd backend\DeliveryManagement
$env:DATABASE_USERNAME='qhuang258'
$env:DATABASE_PASSWORD='Simao@618255'
.\gradlew.bat bootRun --args="--spring.profiles.active=dev"
```

## Current working endpoints

### Initiate registration

- Method: `POST`
- Path: `/api/v1/auth/register`
- Request:

```json
{
  "email": "newuser@example.com",
  "phone": null,
  "password": "Test1234!",
  "full_name": "New User"
}
```

- Response (`201`):

```json
{
  "challenge_id": "<uuid>",
  "otp_code": "381924",
  "message": "OTP challenge created. Use the otp_code to complete registration."
}
```

> `email` and `phone` are both optional, but at least one must be provided.
> `otp_code` is returned in plaintext for dev/testing — production would send via email/SMS.

### Complete registration

- Method: `POST`
- Path: `/api/v1/auth/register/complete`
- Request:

```json
{
  "challenge_id": "<uuid from initiate>",
  "otp_code": "<otp_code from initiate>"
}
```

### Login

- Method: `POST`
- Path: `/api/v1/auth/login`
- Request:

```json
{
  "identifier": "alice@example.com",
  "password": "AlicePass123!"
}
```

### Get current user (protected)

- Method: `GET`
- Path: `/api/v1/auth/me`
- Header: `Authorization: Bearer <token>`

## Dev seed data for verification

- Login user:
  - `alice@example.com` / `AlicePass123!`
- Pending registration user:
  - `pending@example.com` / `PendingPass123!`
- Pending registration OTP challenge:
  - `challenge_id = b0000002-0000-0000-0000-000000000004`
  - `otp_code = 654321`

## Protected routes (require `Authorization: Bearer <token>`)

- `GET /api/v1/auth/me`
- `GET /api/v1/centers`
- `GET /api/v1/centers/{centerId}`
- `GET /api/v1/centers/{centerId}/vehicles`
- `GET /api/v1/vehicles/{vehicleId}`

## What frontend needs to know

- The contract is already frozen in the OpenAPI baseline file
- The backend currently supports:
  - login
  - complete register
- The request/response field naming is `snake_case`
