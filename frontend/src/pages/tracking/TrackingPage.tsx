import { useEffect, useRef, useState } from "react";
import { Alert, Badge, Button, Card, QRCode, Spin, Typography } from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CarOutlined,
  CheckCircleOutlined,
  InboxOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import {
  AdvancedMarker,
  Map,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { getTracking, type TrackingState } from "../../api/client";

const { Title, Text } = Typography;

const STEPS = [
  { icon: <CalendarOutlined />, label: "Scheduled" },
  { icon: <CarOutlined />, label: "Heading To Pickup" },
  { icon: <InboxOutlined />, label: "Pickup In Progress" },
  { icon: <RocketOutlined />, label: "In Transit" },
  { icon: <CheckCircleOutlined />, label: "Delivered" },
];



function getStepIndex(status: string): number {
  switch (status) {
    case "PENDING":
      return 0;
    case "IN_TRANSIT":
      return 3;
    case "DELIVERED":
      return 4;
    default:
      return 0;
  }
}

// ── Marker styles ─────────────────────────────────────────────────────────────

const markerBase: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 36,
  height: 36,
  borderRadius: "50% 50% 50% 0",
  transform: "rotate(-45deg)",
  border: "2px solid #fff",
  boxShadow: "0 2px 6px rgba(0,0,0,0.30)",
  fontSize: 16,
};

const emojiStyle: React.CSSProperties = { transform: "rotate(45deg)" };

function StartMarker() {
  return (
    <div style={{ ...markerBase, background: "#10B981" }}>
      <span style={emojiStyle}>🏭</span>
    </div>
  );
}

function DestinationMarker() {
  return (
    <div style={{ ...markerBase, background: "#EF4444" }}>
      <span style={emojiStyle}>📦</span>
    </div>
  );
}

function VehicleMarker({ vehicleType }: { vehicleType: string }) {
  const emoji = vehicleType === "DRONE" ? "🚁" : "🤖";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "#4F6EF7",
        border: "2.5px solid #fff",
        boxShadow: "0 2px 8px rgba(79,110,247,0.45)",
        fontSize: 20,
      }}
    >
      {emoji}
    </div>
  );
}

// ── Polyline overlay (straight line start → destination) ─────────────────────

interface RouteOverlayProps {
  start: google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral;
}

function RouteOverlay({ start, destination }: RouteOverlayProps) {
  const map = useMap();
  const mapsLib = useMapsLibrary("maps");

  useEffect(() => {
    if (!map || !mapsLib) return;

    const polyline = new mapsLib.Polyline({
      path: [start, destination],
      strokeColor: "#4F6EF7",
      strokeOpacity: 0,
      strokeWeight: 3,
      icons: [
        {
          icon: { path: "M 0,-1 0,1", strokeOpacity: 0.7, scale: 3 },
          offset: "0",
          repeat: "16px",
        },
      ],
      map,
    });

    return () => polyline.setMap(null);
  }, [map, mapsLib, start.lat, start.lng, destination.lat, destination.lng]);

  return null;
}

// ── fitBounds on first load ───────────────────────────────────────────────────

interface FitBoundsProps {
  points: (google.maps.LatLngLiteral | null)[];
}

function FitBoundsOnce({ points }: FitBoundsProps) {
  const map = useMap();
  const hasFit = useRef(false);

  useEffect(() => {
    if (hasFit.current || !map) return;
    const valid = points.filter(Boolean) as google.maps.LatLngLiteral[];
    if (valid.length < 2) return;

    const bounds = new google.maps.LatLngBounds();
    valid.forEach((p) => bounds.extend(p));
    map.fitBounds(bounds, 64);
    hasFit.current = true;
  }, [map, points]);

  return null;
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function TrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [tracking, setTracking] = useState<TrackingState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const fetchTracking = async () => {
      if (!orderId) {
        setError("Tracking order id is missing.");
        setLoading(false);
        return;
      }

      try {
        const data = await getTracking(orderId);
        setTracking(data);
        setError(null);
        if (data.status === "DELIVERED" && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } catch (fetchError) {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to load tracking right now.",
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchTracking();
    intervalRef.current = setInterval(() => {
      void fetchTracking();
    }, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [orderId]);

  const currentStep = tracking ? getStepIndex(tracking.status) : 0;
  const isDelivered = tracking?.status === "DELIVERED";
  const pin = tracking?.handoff_pin ?? sessionStorage.getItem("handoffPin") ?? "----";

  const vehiclePosition: google.maps.LatLngLiteral | null =
    tracking != null
      ? { lat: Number(tracking.sim_lat), lng: Number(tracking.sim_lng) }
      : null;

  const startPosition: google.maps.LatLngLiteral | null =
    tracking?.start_lat != null && tracking?.start_lng != null
      ? { lat: Number(tracking.start_lat), lng: Number(tracking.start_lng) }
      : null;

  const dropoffPosition: google.maps.LatLngLiteral | null =
    tracking?.dropoff_lat != null && tracking?.dropoff_lng != null
      ? { lat: Number(tracking.dropoff_lat), lng: Number(tracking.dropoff_lng) }
      : null;

  const defaultCenter = vehiclePosition ?? { lat: 37.7749, lng: -122.4194 };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <Spin size="large" tip="Loading tracking..." />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/history")}
          style={{ color: "#6B7280", padding: 0, marginBottom: 12 }}
        >
          Back To History
        </Button>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Title level={2} style={{ margin: 0, color: "#1A1D2E", letterSpacing: -0.5 }}>
            Live Tracking
          </Title>
          <Badge
            status={isDelivered ? "success" : "processing"}
            text={
              <Text
                style={{
                  fontSize: 13,
                  color: isDelivered ? "#10B981" : "#4F6EF7",
                  fontWeight: 600,
                }}
              >
                {isDelivered ? "Delivered" : "In Transit"}
              </Text>
            }
          />
        </div>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Order {orderId}
        </Text>
      </div>

      {error ? (
        <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />
      ) : null}

      {/* Map legend */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 8,
          fontSize: 12,
          color: "#6B7280",
          flexWrap: "wrap",
        }}
      >
        <span>🏭 <span style={{ color: "#10B981", fontWeight: 600 }}>Pickup center</span></span>
        <span>🤖/🚁 <span style={{ color: "#4F6EF7", fontWeight: 600 }}>Vehicle</span></span>
        <span>📦 <span style={{ color: "#EF4444", fontWeight: 600 }}>Destination</span></span>
      </div>

      <div
        style={{
          borderRadius: 16,
          overflow: "hidden",
          height: 320,
          marginBottom: 24,
        }}
      >
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={14}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapId="tracking-map"
        >
          {/* Auto-fit bounds on first load when all points are known */}
          <FitBoundsOnce points={[startPosition, vehiclePosition, dropoffPosition]} />

          {/* Dashed polyline from start → destination */}
          {startPosition && dropoffPosition && (
            <RouteOverlay start={startPosition} destination={dropoffPosition} />
          )}

          {/* Start marker — green */}
          {startPosition && (
            <AdvancedMarker position={startPosition} title="Pickup center">
              <StartMarker />
            </AdvancedMarker>
          )}

          {/* Destination marker — red */}
          {dropoffPosition && (
            <AdvancedMarker position={dropoffPosition} title="Destination">
              <DestinationMarker />
            </AdvancedMarker>
          )}

          {/* Vehicle marker — blue, updates every 3 s */}
          {vehiclePosition && (
            <AdvancedMarker position={vehiclePosition} title={tracking?.vehicle_type ?? "Vehicle"}>
              <VehicleMarker vehicleType={tracking?.vehicle_type ?? "ROBOT"} />
            </AdvancedMarker>
          )}
        </Map>
      </div>

      {isDelivered ? (
        <Alert
          message="Delivery complete. The parcel has arrived."
          type="success"
          showIcon
          style={{ marginBottom: 20, borderRadius: 12 }}
        />
      ) : null}

      <Card style={{ marginBottom: 20, borderRadius: 14 }} styles={{ body: { padding: "24px 28px" } }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0.8,
            color: "#9CA3AF",
            textTransform: "uppercase",
            marginBottom: 20,
          }}
        >
          Order Progress
        </div>
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          {STEPS.map((step, index) => {
            const isDone = index < currentStep;
            const isActive = index === currentStep;
            return (
              <div
                key={step.label}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  position: "relative",
                }}
              >
                {index < STEPS.length - 1 ? (
                  <div
                    style={{
                      position: "absolute",
                      top: 18,
                      left: "50%",
                      right: "-50%",
                      height: 2,
                      background: isDone ? "#4F6EF7" : "#E5EAFF",
                      zIndex: 0,
                    }}
                  />
                ) : null}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    zIndex: 1,
                    background: isDone ? "#4F6EF7" : isActive ? "#EEF2FF" : "#F4F6FD",
                    border: `2px solid ${isDone ? "#4F6EF7" : isActive ? "#4F6EF7" : "#E5EAFF"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: isDone ? "#fff" : isActive ? "#4F6EF7" : "#C4CCDD",
                    fontSize: 14,
                    boxShadow: isActive ? "0 0 0 4px rgba(79,110,247,0.15)" : "none",
                  }}
                >
                  {step.icon}
                </div>
                <Text
                  style={{
                    fontSize: 11,
                    marginTop: 8,
                    textAlign: "center",
                    color: isDone ? "#4F6EF7" : isActive ? "#1A1D2E" : "#C4CCDD",
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {step.label}
                </Text>
              </div>
            );
          })}
        </div>
      </Card>

      {!isDelivered && tracking ? (
        <Card style={{ marginBottom: 20, borderRadius: 14 }} styles={{ body: { padding: "16px 28px" } }}>
          <Text type="secondary">Estimated Arrival:</Text>
          <Text strong style={{ fontSize: 20, color: "#4F6EF7", marginLeft: 8 }}>
            ~{tracking.eta_minutes} min
          </Text>
        </Card>
      ) : null}

      <Card style={{ borderRadius: 14 }} styles={{ body: { padding: "24px 28px" } }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0.8,
            color: "#9CA3AF",
            textTransform: "uppercase",
            marginBottom: 20,
          }}
        >
          Unlock Verification
        </div>
        <div
          style={{
            display: "flex",
            gap: 32,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div>
            <Text type="secondary" style={{ fontSize: 13, display: "block", marginBottom: 8 }}>
              Pickup PIN
            </Text>
            <div
              style={{
                background: "#EEF2FF",
                borderRadius: 12,
                padding: "12px 20px",
                display: "inline-block",
                fontFamily: '"SF Mono", "Fira Code", "Courier New", monospace',
                fontSize: 36,
                fontWeight: 800,
                letterSpacing: 10,
                color: "#4F6EF7",
              }}
            >
              {pin}
            </div>
            <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 8 }}>
              Use this PIN to unlock the parcel compartment.
            </Text>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 13, display: "block", marginBottom: 8 }}>
              QR Unlock
            </Text>
            <div
              style={{
                border: "2px solid #E5EAFF",
                borderRadius: 12,
                padding: 8,
                display: "inline-block",
              }}
            >
              <QRCode value={`UNLOCK:${orderId}:${pin}`} size={100} bordered={false} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
