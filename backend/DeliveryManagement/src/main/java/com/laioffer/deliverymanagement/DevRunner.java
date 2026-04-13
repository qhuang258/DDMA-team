//package com.laioffer.deliverymanagement;
//
//import com.laioffer.deliverymanagement.dto.AppUserDto;
//import com.laioffer.deliverymanagement.dto.DeliveryCenterDto;
//import com.laioffer.deliverymanagement.dto.OrderDto;
//import com.laioffer.deliverymanagement.dto.OtpChallengeDto;
//import com.laioffer.deliverymanagement.service.AppUserService;
//import com.laioffer.deliverymanagement.service.DeliveryCenterService;
//import com.laioffer.deliverymanagement.service.FleetVehicleService;
//import com.laioffer.deliverymanagement.service.OrderParcelService;
//import com.laioffer.deliverymanagement.service.OrderService;
//import com.laioffer.deliverymanagement.service.OtpChallengeService;
//import com.laioffer.deliverymanagement.service.PaymentService;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.boot.ApplicationArguments;
//import org.springframework.boot.ApplicationRunner;
//import org.springframework.context.annotation.Profile;
//import org.springframework.stereotype.Component;
//
//import java.time.OffsetDateTime;
//import java.util.UUID;
//
//@Component
//@Profile("dev")
//public class DevRunner implements ApplicationRunner {
//
//    private static final Logger logger = LoggerFactory.getLogger(DevRunner.class);
//
//    private final AppUserService appUserService;
//    private final OtpChallengeService otpChallengeService;
//    private final DeliveryCenterService deliveryCenterService;
//    private final FleetVehicleService fleetVehicleService;
//    private final OrderService orderService;
//    private final OrderParcelService orderParcelService;
//    private final PaymentService paymentService;
//
//    public DevRunner(
//            AppUserService appUserService,
//            OtpChallengeService otpChallengeService,
//            DeliveryCenterService deliveryCenterService,
//            FleetVehicleService fleetVehicleService,
//            OrderService orderService,
//            OrderParcelService orderParcelService,
//            PaymentService paymentService
//    ) {
//        this.appUserService = appUserService;
//        this.otpChallengeService = otpChallengeService;
//        this.deliveryCenterService = deliveryCenterService;
//        this.fleetVehicleService = fleetVehicleService;
//        this.orderService = orderService;
//        this.orderParcelService = orderParcelService;
//        this.paymentService = paymentService;
//    }
//
//    @Override
//    public void run(ApplicationArguments args) {
//        logger.info("Starting DTO + Service + database verification...");
//
//        AppUserDto firstUser = appUserService.findAll().stream().findFirst().orElse(null);
//        DeliveryCenterDto firstCenter = deliveryCenterService.findAll().stream().findFirst().orElse(null);
//        OrderDto firstOrder = orderService.findAll().stream().findFirst().orElse(null);
//
//        logger.info("app_user count={}, sampleUserId={}, sampleUserEmail={}, sampleGuest={}",
//                appUserService.count(),
//                firstUser == null ? null : firstUser.id(),
//                firstUser == null ? null : firstUser.email(),
//                firstUser == null ? null : firstUser.guest());
//        logger.info("otp_challenge count={}", otpChallengeService.count());
//        logger.info("delivery_center count={}, sampleCenterId={}, sampleCenterName={}",
//                deliveryCenterService.count(),
//                firstCenter == null ? null : firstCenter.id(),
//                firstCenter == null ? null : firstCenter.name());
//        logger.info("fleet_vehicle count={}", fleetVehicleService.count());
//        logger.info("orders count={}, sampleOrderId={}, sampleStatus={}, sampleAmount={}",
//                orderService.count(),
//                firstOrder == null ? null : firstOrder.id(),
//                firstOrder == null ? null : firstOrder.status(),
//                firstOrder == null ? null : firstOrder.totalAmount());
//        logger.info("order_parcel count={}", orderParcelService.count());
//        logger.info("payment count={}", paymentService.count());
//
//        if (firstUser != null) {
//            logger.info("User relation check: userId={} -> otpCount={}, orderCount={}",
//                    firstUser.id(),
//                    otpChallengeService.findByUserId(firstUser.id()).size(),
//                    orderService.findByUserId(firstUser.id()).size());
//        }
//
//        runAuthReadWriteVerification();
//
//        if (firstCenter != null) {
//            logger.info("Center relation check: centerId={} -> vehicleCount={}",
//                    firstCenter.id(),
//                    fleetVehicleService.findByCenterId(firstCenter.id()).size());
//        }
//
//        if (firstOrder != null) {
//            logger.info("Order relation check: orderId={} -> parcelPresent={}, paymentPresent={}",
//                    firstOrder.id(),
//                    orderParcelService.findByOrderId(firstOrder.id()).isPresent(),
//                    paymentService.findByOrderId(firstOrder.id()).isPresent());
//        }
//
//        logger.info("DTO + Service + database verification finished.");
//    }
//
//    private void runAuthReadWriteVerification() {
//        String verificationSuffix = UUID.randomUUID().toString().replace("-", "");
//        String verificationEmail = "t111+" + verificationSuffix.substring(0, 12) + "@example.com";
//        String verificationPhone = "+1999" + verificationSuffix.substring(0, 8);
//
//        AppUserDto verificationUser = appUserService.createUser(
//                verificationEmail,
//                verificationPhone,
//                "$2a$10$t111verificationpasswordhash",
//                "T1.11 Verification User",
//                false,
//                "{\"source\":\"dev-runner\",\"scope\":\"t1.11\"}"
//        );
//
//        OtpChallengeDto verificationChallenge = otpChallengeService.createChallenge(
//                verificationUser.id(),
//                "EMAIL",
//                "$2a$10$t111verificationotphash",
//                OffsetDateTime.now().plusMinutes(15)
//        );
//
//        boolean userFoundByEmail = appUserService.findByEmail(verificationEmail).isPresent();
//        boolean userFoundByPhone = appUserService.findByPhone(verificationPhone).isPresent();
//        boolean userFoundByEither = appUserService.findByEmailOrPhone(verificationEmail).isPresent()
//                && appUserService.findByEmailOrPhone(verificationPhone).isPresent();
//        boolean latestOtpPresent = otpChallengeService.findLatestByUserId(verificationUser.id())
//                .map(otp -> otp.id().equals(verificationChallenge.id()))
//                .orElse(false);
//        boolean activeOtpPresent = otpChallengeService.findLatestActiveByUserId(verificationUser.id()).isPresent();
//        short incrementedAttemptCount = otpChallengeService.incrementAttemptCount(verificationChallenge.id())
//                .map(OtpChallengeDto::attemptCount)
//                .orElse((short) -1);
//        boolean challengeConsumed = otpChallengeService.markConsumed(verificationChallenge.id());
//
//        logger.info(
//                "Auth read/write check: createdUserId={}, userFoundByEmail={}, userFoundByPhone={}, userFoundByEither={}, latestOtpPresent={}, activeOtpPresent={}, incrementedAttemptCount={}, challengeConsumed={}",
//                verificationUser.id(),
//                userFoundByEmail,
//                userFoundByPhone,
//                userFoundByEither,
//                latestOtpPresent,
//                activeOtpPresent,
//                incrementedAttemptCount,
//                challengeConsumed
//        );
//    }
//}
