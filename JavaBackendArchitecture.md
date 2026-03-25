# Java 后端分层架构与数据库 ER（自治配送）

本文档记录团队在选定 **Java（Spring Boot）+ PostgreSQL** 后的**目标后端结构**，与先前 **OnlineOrder** 类项目（Controller → Service → Repository）保持一致，便于快速对齐分工与包结构。领域需求来源：[ProductBacklog.md](ProductBacklog.md)。

---

## 1. 团队决议摘要

- **运行时**：Java，建议 **Spring Boot** 作为 Web 与依赖注入容器。
- **主库**：**PostgreSQL**；服务区域与距离计算可采用 **PostGIS** 几何列，或在应用层用规则/经纬度实现（与 [BackendTechStackDiscussion.md](BackendTechStackDiscussion.md) 一致）。
- **分层约定**：HTTP 入口仅落在 **Controller**；业务规则与编排落在 **Service**；持久化仅通过 **Repository** 访问数据库。
- **外部系统**：支付、地图、天气、推送、对象存储等与业务服务协作，**不**下沉到 Repository 层直接调用。

---

## 2. 分层架构图（Controller → Service → Repository → PostgreSQL）

下图**刻意做粗粒度抽象**，对齐先前 **OnlineOrder** 示意图：每层只有少数「大块」组件；**Customer** 一侧同时承担**身份与认证**（类似示例里 `CustomerController` / `CustomerService` 与安全组件的关系）。具体类名可在实现时再拆分包内私有组件，**不必**与下图一一对应。

```mermaid
flowchart LR
  %% Client
  CLIENT[Web / Mobile Client]

  %% Application
  APP[DeliveryPlanningApplication]

  %% Controllers
  subgraph CL[Controller Layer]
    AC[AuthController]
    ODC[OrderController]
    PLC[PlanController]
    TRC[TrackingController]
    PYC[PaymentController]
    ADC[AdminController]
  end

  %% Services
  subgraph SL[Service Layer]
    AUS[AuthService]
    ODS[OrderService]
    PLS[PlanningService]
    TRS[TrackingService]
    PYS[PaymentService]
    ADS[AdminService]
    NS[NotificationService]
  end

  %% Repositories
  subgraph RL[Repository Layer]
    UR[UserRepository]
    ORR[OrderRepository]
    PR[PlanRepository]
    RR[RouteRepository]
    RSR[RouteStopRepository]
    VR[VehicleRepository]
    PYR[PaymentRepository]
    CR[PromoCodeRepository]
  end

  %% Security / Config
  subgraph CFG[Security / Config]
    SFC[SecurityFilterChain]
    UDM[UserDetailsService]
    PE[PasswordEncoder]
    CFGC[AppConfig]
  end

  %% Database
  subgraph DB[Persistence]
    PG[(PostgreSQL)]
    GIS[(PostGIS)]
    REDIS[(Redis)]
    OBJ[(S3 / MinIO)]
  end

  %% External APIs
  subgraph EXT[External Integrations]
    MAP[Map / Geocoding API]
    STRIPE[Stripe API]
    PUSH[Push Service]
    WEATHER[Weather API]
  end

  %% Entry
  CLIENT --> AC
  CLIENT --> ODC
  CLIENT --> PLC
  CLIENT --> TRC
  CLIENT --> PYC
  CLIENT --> ADC

  APP --> CL

  %% Controller -> Service
  AC --> AUS
  ODC --> ODS
  PLC --> PLS
  TRC --> TRS
  PYC --> PYS
  ADC --> ADS

  %% Service collaborations
  ODS --> PLS
  ODS --> PYS
  ODS --> NS
  TRS --> NS
  ADS --> ODS

  %% Service -> Repository
  AUS --> UR
  ODS --> ORR
  ODS --> VR
  ODS --> CR
  PLS --> PR
  PLS --> RR
  PLS --> RSR
  TRS --> ORR
  TRS --> RR
  PYS --> PYR
  ADS --> UR
  ADS --> ORR

  %% Repository -> DB
  UR --> PG
  ORR --> PG
  PR --> PG
  RR --> PG
  RSR --> PG
  VR --> PG
  PYR --> PG
  CR --> PG
  PG --> GIS

  %% Service -> Cache / Object Storage / External
  TRS --> REDIS
  AUS --> REDIS
  ODS --> OBJ
  PLS --> MAP
  PLS --> WEATHER
  PYS --> STRIPE
  NS --> PUSH

  %% Security wiring
  SFC --> CFGC
  UDM --> CFGC
  PE --> CFGC
  AUS --> UDM
  AUS --> PE

flowchart TB
  subgraph controllers [Controller layer]
    CustomerController[CustomerController]
    DeliveryController[DeliveryController]
    OrderController[OrderController]
  end

  subgraph services [Service layer]
    CustomerService[CustomerService]
    DeliveryService[DeliveryService]
    OrderService[OrderService]
  end

  subgraph repositories [Repository layer]
    UserRepository[UserRepository]
    OtpChallengeRepository[OtpChallengeRepository]
    OAuthLinkRepository[OAuthLinkRepository]
    SavedAddressRepository[SavedAddressRepository]
    DeliveryCenterRepository[DeliveryCenterRepository]
    FleetVehicleRepository[FleetVehicleRepository]
    OrderRepository[OrderRepository]
    OrderParcelRepository[OrderParcelRepository]
    PaymentRepository[PaymentRepository]
    PromoCodeRepository[PromoCodeRepository]
    OrderPromoRepository[OrderPromoRepository]
    TrackingEventRepository[TrackingEventRepository]
    DeliveryProofRepository[DeliveryProofRepository]
    RatingRepository[RatingRepository]
    SupportTicketRepository[SupportTicketRepository]
  end

  postgresDb[(PostgreSQL)]

  subgraph securityConfig [Security and configuration]
    SecurityFilterChain[SecurityFilterChain]
    UserDetailsManager[UserDetailsManager]
    PasswordEncoderBean[PasswordEncoder]
    AppConfig[AppConfig]
    DevRunner[DevRunner]
  end

  CustomerController --> CustomerService
  DeliveryController --> DeliveryService
  OrderController --> OrderService

  CustomerService --> UserRepository
  CustomerService --> OtpChallengeRepository
  CustomerService --> OAuthLinkRepository

  DeliveryService --> SavedAddressRepository
  DeliveryService --> DeliveryCenterRepository
  DeliveryService --> FleetVehicleRepository

  OrderService --> OrderRepository
  OrderService --> OrderParcelRepository
  OrderService --> PaymentRepository
  OrderService --> PromoCodeRepository
  OrderService --> OrderPromoRepository
  OrderService --> TrackingEventRepository
  OrderService --> DeliveryProofRepository
  OrderService --> RatingRepository
  OrderService --> SupportTicketRepository

  UserRepository --> postgresDb
  OtpChallengeRepository --> postgresDb
  OAuthLinkRepository --> postgresDb
  SavedAddressRepository --> postgresDb
  DeliveryCenterRepository --> postgresDb
  FleetVehicleRepository --> postgresDb
  OrderRepository --> postgresDb
  OrderParcelRepository --> postgresDb
  PaymentRepository --> postgresDb
  PromoCodeRepository --> postgresDb
  OrderPromoRepository --> postgresDb
  TrackingEventRepository --> postgresDb
  DeliveryProofRepository --> postgresDb
  RatingRepository --> postgresDb
  SupportTicketRepository --> postgresDb

  CustomerService --> UserDetailsManager
  CustomerService --> PasswordEncoderBean
  SecurityFilterChain --> AppConfig
  UserDetailsManager --> AppConfig
  PasswordEncoderBean --> AppConfig
  AppConfig --> DevRunner
  DevRunner --> DeliveryCenterRepository
  DevRunner --> FleetVehicleRepository
```

### 2.1 各层职责（抽象块与产品史诗的对应关系）

| 组件 | 掌管范围（可再在内部分文件/私有类） |
|------|--------------------------------------|
| **CustomerController → CustomerService** | **账户与认证**：注册、登录、OTP、OAuth（P1）、资料维护（史诗 1）；与 **UserDetailsManager**、**PasswordEncoder** 协作完成安全链路（对齐 OnlineOrder 示例）。 |
| **DeliveryController → DeliveryService** | **下单前与空间侧**：地址与保存地址、服务区域校验、包裹约束与推荐引擎用到的中心/车队/报价逻辑（史诗 2、3、4）；地图与天气等外部 API 由该服务编排。 |
| **OrderController → OrderService** | **订单全生命周期**：摘要与确认、促销码、Stripe 支付与 Webhook、订单历史；以及履约与售后——跟踪与 PIN、交付照片、评分与工单（史诗 5、6、7）。支付与 Webhook 在图上不单独画 Controller，由 **OrderController** 暴露相关路由即可。 |
| **Repository** | 仍按表/聚合根拆分，便于测试与替换；**Service 少、Repository 多**是常见做法（与示例中多仓储一致）。 |
| **Security / Config** | **SecurityFilterChain**、**UserDetailsManager**、**PasswordEncoder** 汇入 **AppConfig**；**DevRunner** 负责开发期种子（如三中心与模拟车辆），风格对齐示例图。 |

---

## 3. 与外部系统的边界（文字约定）

| 外部能力 | 典型集成点 | 说明 |
|----------|------------|------|
| **Stripe** | `OrderService`（由 `OrderController` 暴露 REST 与 Webhook 路由） | 支付意图、Webhook 签名校验、幂等；金额以服务端为准。 |
| **地图 / 地理编码** | `DeliveryService` | 自动完成可在前端；服务端负责持久化与围栏校验（US-2.2）。 |
| **天气 API** | `DeliveryService` 内客户端（P2） | 影响无人机可选性（US-4.4）。 |
| **推送 FCM/APNs** | `OrderService` 内通知逻辑（P1） | 接近触发（US-6.3）。 |
| **对象存储** | `OrderService`（交付证明子流程） | 照片预签名 URL，库中仅存 URL（US-6.4）。 |

---

## 4. 数据库 ER 图（概念模型）

以下为 **PostgreSQL 概念模型**，字段可在实现阶段微调；地理信息可用 `latitude` / `longitude` 或 PostGIS `geometry`。

```mermaid
erDiagram
  AppUser {
    uuid id
    string email
    string phone
    string passwordHash
    string fullName
    boolean guest
    timestamptz createdAt
  }

  OtpChallenge {
    uuid id
    uuid userId
    string channel
    string codeHash
    timestamptz expiresAt
    boolean consumed
  }

  OAuthLink {
    uuid id
    uuid userId
    string provider
    string providerSubject
  }

  SavedAddress {
    uuid id
    uuid userId
    string label
    string formattedLine
    decimal latitude
    decimal longitude
    boolean inServiceArea
  }

  DeliveryCenter {
    uuid id
    string name
    decimal latitude
    decimal longitude
    string addressLine
  }

  FleetVehicle {
    uuid id
    uuid centerId
    string vehicleType
    boolean available
    string externalDeviceId
  }

  Order {
    uuid id
    uuid userId
    uuid centerId
    string status
    string vehicleTypeChosen
    string pickupSummary
    string dropoffSummary
    string handoffPin
    int estimatedMinutes
    decimal totalAmount
    string currency
    timestamptz createdAt
  }

  OrderParcel {
    uuid id
    uuid orderId
    string sizeTier
    decimal weightKg
    boolean fragile
    string deliveryNotes
  }

  Payment {
    uuid id
    uuid orderId
    string stripePaymentIntentId
    string status
    decimal amount
    string currency
    timestamptz updatedAt
  }

  PromoCode {
    uuid id
    string code
    string discountType
    decimal discountValue
    timestamptz validFrom
    timestamptz validTo
    boolean active
  }

  OrderPromoApplication {
    uuid id
    uuid orderId
    uuid promoCodeId
    decimal discountApplied
  }

  TrackingEvent {
    uuid id
    uuid orderId
    decimal latitude
    decimal longitude
    timestamptz recordedAt
  }

  DeliveryProof {
    uuid id
    uuid orderId
    string photoUrl
    timestamptz capturedAt
  }

  Rating {
    uuid id
    uuid orderId
    uuid userId
    int stars
    timestamptz createdAt
  }

  SupportTicket {
    uuid id
    uuid orderId
    uuid userId
    string category
    string description
    string status
    timestamptz createdAt
  }

  AppUser ||--o{ SavedAddress : owns
  AppUser ||--o{ Order : places
  AppUser ||--o{ OtpChallenge : requests
  AppUser ||--o{ OAuthLink : links
  DeliveryCenter ||--o{ FleetVehicle : stations
  DeliveryCenter ||--o{ Order : fulfills
  Order ||--|| OrderParcel : line
  Order ||--o| Payment : settles
  Order ||--o{ TrackingEvent : trail
  Order ||--o| DeliveryProof : proves
  Order ||--o| Rating : scores
  Order ||--o{ SupportTicket : escalates
  PromoCode ||--o{ OrderPromoApplication : usedBy
  Order ||--o{ OrderPromoApplication : applies
```

### 4.1 实体字段概要（实现对照）

| 实体 | 主键 / 外键 | 关键业务字段 |
|------|-------------|----------------|
| **AppUser** | `id`；`email`/`phone` 唯一 | `passwordHash`（访客可空）、`guest` |
| **OtpChallenge** | `id`；可选关联注册用户 | `codeHash`、`expiresAt`、`consumed` |
| **OAuthLink** | `id`；`userId` → AppUser | `provider`、`providerSubject` |
| **SavedAddress** | `id`；`userId` → AppUser | `latitude`/`longitude`、`inServiceArea` |
| **DeliveryCenter** | `id` | 三中心种子；坐标用于 US-4.1 |
| **FleetVehicle** | `id`；`centerId` → DeliveryCenter | `vehicleType`、`available`（US-4.3） |
| **Order** | `id`；`userId` 可空；`centerId` | `status`、`vehicleTypeChosen`、`handoffPin`（US-6.2）、`totalAmount` |
| **OrderParcel** | `id`；`orderId` 1:1 | `sizeTier`、`weightKg`、`fragile`、`deliveryNotes` |
| **Payment** | `id`；`orderId` 1:1 | `stripePaymentIntentId`、`status` |
| **PromoCode** | `id`；`code` 唯一 | 折扣类型与区间（US-5.3） |
| **OrderPromoApplication** | `orderId` + `promoCodeId` | `discountApplied` |
| **TrackingEvent** | `id`；`orderId` | 轨迹点序列（US-6.1） |
| **DeliveryProof** | `orderId` 1:1 | `photoUrl`（US-6.4） |
| **Rating** | `orderId` 1:1 | `stars`（US-7.2） |
| **SupportTicket** | `id`；`orderId`、`userId` | `category`、`description`（US-7.3） |

---

## 5. 修订记录

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0 | 2026-03-24 | 初稿：Spring 分层图 + PostgreSQL ER 与字段概要 |
| 1.1 | 2026-03-24 | 架构图抽象为 3 Controller / 3 Service；Customer 统管认证与账户；Security 块对齐 UserDetailsManager + AppConfig + DevRunner |
