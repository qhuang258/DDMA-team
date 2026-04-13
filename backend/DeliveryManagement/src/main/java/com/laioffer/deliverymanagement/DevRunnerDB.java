package com.laioffer.deliverymanagement;

import com.laioffer.deliverymanagement.entity.AppUserEntity;
import com.laioffer.deliverymanagement.entity.DeliveryCenterEntity;
import com.laioffer.deliverymanagement.entity.FleetVehicleEntity;
import com.laioffer.deliverymanagement.entity.Jsonb;
import com.laioffer.deliverymanagement.entity.OrderEntity;
import com.laioffer.deliverymanagement.entity.OrderParcelEntity;
import com.laioffer.deliverymanagement.entity.OtpChallengeEntity;
import com.laioffer.deliverymanagement.entity.PaymentEntity;
import com.laioffer.deliverymanagement.repository.AppUserRepository;
import com.laioffer.deliverymanagement.repository.DeliveryCenterRepository;
import com.laioffer.deliverymanagement.repository.FleetVehicleRepository;
import com.laioffer.deliverymanagement.repository.OrderParcelRepository;
import com.laioffer.deliverymanagement.repository.OrderRepository;
import com.laioffer.deliverymanagement.repository.OtpChallengeRepository;
import com.laioffer.deliverymanagement.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Component
@Profile("dev")
public class DevRunnerDB implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DevRunnerDB.class);

    // Seed UUIDs from database-init.sql
    private static final UUID ALICE_ID       = UUID.fromString("a0000001-0000-0000-0000-000000000001");
    private static final UUID SOMA_CENTER_ID = UUID.fromString("c0000003-0000-0000-0000-000000000001");
    private static final UUID FIRST_ORDER_ID = UUID.fromString("e0000005-0000-0000-0000-000000000001");

    private final AppUserRepository        appUserRepository;
    private final OtpChallengeRepository   otpChallengeRepository;
    private final DeliveryCenterRepository deliveryCenterRepository;
    private final FleetVehicleRepository   fleetVehicleRepository;
    private final OrderRepository          orderRepository;
    private final OrderParcelRepository    orderParcelRepository;
    private final PaymentRepository        paymentRepository;

    public DevRunnerDB(
            AppUserRepository appUserRepository,
            OtpChallengeRepository otpChallengeRepository,
            DeliveryCenterRepository deliveryCenterRepository,
            FleetVehicleRepository fleetVehicleRepository,
            OrderRepository orderRepository,
            OrderParcelRepository orderParcelRepository,
            PaymentRepository paymentRepository
    ) {
        this.appUserRepository        = appUserRepository;
        this.otpChallengeRepository   = otpChallengeRepository;
        this.deliveryCenterRepository = deliveryCenterRepository;
        this.fleetVehicleRepository   = fleetVehicleRepository;
        this.orderRepository          = orderRepository;
        this.orderParcelRepository    = orderParcelRepository;
        this.paymentRepository        = paymentRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        log.info("=== DevRunnerDB: repository read/write verification ===");
        runReadPhase();
        runWritePhase();
        log.info("=== DevRunnerDB: done ===");
    }

    // ------------------------------------------------------------------
    // Phase 1: READ — verify seed data is visible through repositories
    // ------------------------------------------------------------------
    private void runReadPhase() {
        log.info("--- READ phase ---");

        // findAll() for all 7 tables
        var users    = appUserRepository.findAll();
        var otps     = otpChallengeRepository.findAll();
        var centers  = deliveryCenterRepository.findAll();
        var vehicles = fleetVehicleRepository.findAll();
        var orders   = orderRepository.findAll();
        var parcels  = orderParcelRepository.findAll();
        var payments = paymentRepository.findAll();

        log.info("app_user         count={},  firstId={}",
                users.size(),    users.isEmpty()    ? null : users.get(0).id());
        log.info("otp_challenge    count={}",  otps.size());
        log.info("delivery_center  count={},  firstName={}",
                centers.size(),  centers.isEmpty()  ? null : centers.get(0).name());
        log.info("fleet_vehicle    count={}",  vehicles.size());
        log.info("orders           count={},  firstStatus={}",
                orders.size(),   orders.isEmpty()   ? null : orders.get(0).status());
        log.info("order_parcel     count={}",  parcels.size());
        log.info("payment          count={}",  payments.size());

        // Custom derived queries
        log.info("findByEmail(alice@example.com)          present={}",
                appUserRepository.findByEmail("alice@example.com").isPresent());
        log.info("findByEmailOrPhone(alice@example.com)   present={}",
                appUserRepository.findByEmailOrPhone("alice@example.com").isPresent());

        log.info("findByUserId(aliceId)                   otpCount={}",
                otpChallengeRepository.findByUserId(ALICE_ID).size());
        log.info("findLatestByUserId(aliceId)             present={}",
                otpChallengeRepository.findLatestByUserId(ALICE_ID).isPresent());
        log.info("findLatestActiveByUserId(aliceId)       present={}",
                otpChallengeRepository.findLatestActiveByUserId(ALICE_ID).isPresent());

        log.info("findByCenterId(somaId)                  vehicleCount={}",
                fleetVehicleRepository.findByCenterId(SOMA_CENTER_ID).size());
        log.info("findByUserId(aliceId)                   orderCount={}",
                orderRepository.findByUserId(ALICE_ID).size());

        log.info("findByOrderId(firstOrderId) parcel={}  payment={}",
                orderParcelRepository.findByOrderId(FIRST_ORDER_ID).isPresent(),
                paymentRepository.findByOrderId(FIRST_ORDER_ID).isPresent());
    }

    // ------------------------------------------------------------------
    // Phase 2: WRITE — create one instance of every entity, verify UUID
    //          read-back, then test @Modifying queries
    // ------------------------------------------------------------------
    private void runWritePhase() {
        log.info("--- WRITE phase ---");

        String rand = UUID.randomUUID().toString().replace("-", "").substring(0, 10);
        OffsetDateTime now = OffsetDateTime.now();

        // 1. AppUser (no FK deps)
        AppUserEntity savedUser = appUserRepository.save(new AppUserEntity(
                null,
                "devrun-" + rand + "@test.com",
                "+1800" + rand.substring(0, 7),
                "$2a$10$devrunnerpasswordhash",
                "DevRunner User",
                true,
                now, now, 0,
                null
        ));
        log.info("created AppUser         id={}  email={}", savedUser.id(), savedUser.email());

        // 2. DeliveryCenter (no FK deps)
        DeliveryCenterEntity savedCenter = deliveryCenterRepository.save(new DeliveryCenterEntity(
                null,
                "DevRunner Center",
                new BigDecimal("37.7749"),
                new BigDecimal("-122.4194"),
                "1 Test St, San Francisco, CA",
                Jsonb.of("{\"type\":\"Polygon\",\"coordinates\":[]}"),
                null
        ));
        log.info("created DeliveryCenter  id={}  name={}", savedCenter.id(), savedCenter.name());

        // 3. FleetVehicle (FK: centerId)
        FleetVehicleEntity savedVehicle = fleetVehicleRepository.save(new FleetVehicleEntity(
                null,
                savedCenter.id(),
                "DRONE",
                true,
                "DRN-TEST-" + rand.substring(0, 4),
                null,
                null
        ));
        log.info("created FleetVehicle    id={}  type={}", savedVehicle.id(), savedVehicle.vehicleType());

        // 4. OtpChallenge (FK: userId)
        OtpChallengeEntity savedOtp = otpChallengeRepository.save(new OtpChallengeEntity(
                null,
                savedUser.id(),
                "EMAIL",
                "$2a$10$devrunnerotphash",
                now.plusMinutes(15),
                false,
                (short) 0,
                now
        ));
        log.info("created OtpChallenge    id={}  channel={}", savedOtp.id(), savedOtp.channel());

        // 5. Order (FK: userId, centerId; fleetVehicleId nullable for PENDING)
        OrderEntity savedOrder = orderRepository.save(new OrderEntity(
                null,
                savedUser.id(),
                savedCenter.id(),
                null,                     // fleetVehicleId — nullable for PENDING orders
                "PENDING",
                "DRONE",
                "1 Pickup Ave",
                "2 Dropoff Blvd",
                null,                     // handoffPin — assigned later
                null,                     // estimatedMinutes
                new BigDecimal("9.99"),
                "USD",
                null, null, null, null,   // sim fields
                null, null,               // planSnapshot, trackingState
                now, now, 0,
                null
        ));
        log.info("created Order           id={}  status={}", savedOrder.id(), savedOrder.status());

        // 6. OrderParcel (FK: orderId)
        OrderParcelEntity savedParcel = orderParcelRepository.save(new OrderParcelEntity(
                null,
                savedOrder.id(),
                "M",
                new BigDecimal("1.200"),
                false,
                null,
                Jsonb.of("{\"lengthCm\":20,\"widthCm\":15,\"heightCm\":10}"),
                null
        ));
        log.info("created OrderParcel     id={}  sizeTier={}", savedParcel.id(), savedParcel.sizeTier());

        // 7. Payment (FK: orderId; idempotencyKey must be unique)
        PaymentEntity savedPayment = paymentRepository.save(new PaymentEntity(
                null,
                savedOrder.id(),
                "pi_devrun_" + rand,
                "PENDING",
                new BigDecimal("9.99"),
                "USD",
                "idem-" + rand,
                now, now,
                Jsonb.of("{}")
        ));
        log.info("created Payment         id={}  status={}", savedPayment.id(), savedPayment.status());

        // ------------------------------------------------------------------
        // @Modifying query tests
        // ------------------------------------------------------------------

        // incrementAttemptCount → re-fetch → expect attemptCount = 1
        otpChallengeRepository.incrementAttemptCount(savedOtp.id());
        short attemptCount = otpChallengeRepository.findById(savedOtp.id())
                .map(OtpChallengeEntity::attemptCount)
                .orElse((short) -1);
        log.info("incrementAttemptCount   → attemptCount={}  {}", attemptCount, attemptCount == 1 ? "OK" : "FAIL");

        // markConsumed → expect rows affected = 1
        int consumedRows = otpChallengeRepository.markConsumed(savedOtp.id());
        log.info("markConsumed            → rowsAffected={}  {}", consumedRows, consumedRows == 1 ? "OK" : "FAIL");

        // activateUser → re-fetch → expect guest = false
        appUserRepository.activateUser(savedUser.id());
        boolean isGuest = appUserRepository.findById(savedUser.id())
                .map(AppUserEntity::guest)
                .orElse(true);
        log.info("activateUser            → guest={}    {}", isGuest, !isGuest ? "OK" : "FAIL");
    }
}
