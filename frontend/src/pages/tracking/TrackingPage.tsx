import { useEffect, useRef, useState } from "react";
import { Badge, Button, Card, QRCode, Typography, Spin, Alert } from "antd";
import {
  CalendarOutlined,
  CarOutlined,
  CheckCircleOutlined,
  InboxOutlined,
  RocketOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { getTracking, TrackingState } from "../../api/client";

const { Title, Text } = Typography;

const STEPS = [
  { icon: <CalendarOutlined />, label: "已调度" },
  { icon: <CarOutlined />, label: "前往取货" },
  { icon: <InboxOutlined />, label: "取货中" },
  { icon: <RocketOutlined />, label: "派送中" },
  { icon: <CheckCircleOutlined />, label: "已交付" },
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

export function TrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [tracking, setTracking] = useState<TrackingState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchTracking = async () => {
    if (!orderId) return;
    try {
      const data = await getTracking(orderId);
      setTracking(data);
      setError(null);
      // 送达后停止轮询
      if (data.status === "DELIVERED") {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "追踪失败，请稍后重试";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
    intervalRef.current = setInterval(fetchTracking, 3000);
    // 页面卸载时清除定时器
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [orderId]);

  const currentStep = tracking ? getStepIndex(tracking.status) : 0;
  const isDelivered = tracking?.status === "DELIVERED";
  const pin = tracking?.orderId
    ? (sessionStorage.getItem("handoffPin") ?? "----")
    : "----";

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <Spin size="large" tip="加载追踪信息..." />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/history")}
          style={{ color: "#6B7280", padding: 0, marginBottom: 12 }}
        >
          返回历史
        </Button>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Title
            level={2}
            style={{ margin: 0, color: "#1A1D2E", letterSpacing: -0.5 }}
          >
            实时追踪
          </Title>
          {isDelivered ? (
            <Badge
              status="success"
              text={
                <Text
                  style={{ fontSize: 13, color: "#10B981", fontWeight: 600 }}
                >
                  已送达
                </Text>
              }
            />
          ) : (
            <Badge
              status="processing"
              text={
                <Text
                  style={{ fontSize: 13, color: "#4F6EF7", fontWeight: 600 }}
                >
                  派送中
                </Text>
              }
            />
          )}
        </div>
        <Text type="secondary" style={{ fontSize: 13 }}>
          订单 {orderId}
        </Text>
      </div>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Map placeholder */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #0F1724 0%, #1A2540 50%, #0F2744 100%)",
          borderRadius: 16,
          height: 300,
          marginBottom: 24,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(79,110,247,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(79,110,247,0.08) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "45%",
            left: 0,
            right: 0,
            height: 2,
            background: "rgba(79,110,247,0.15)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "30%",
            top: 0,
            bottom: 0,
            width: 2,
            background: "rgba(79,110,247,0.12)",
          }}
        />

        {/* 目的地标记 */}
        <div
          style={{
            position: "absolute",
            top: "38%",
            left: "62%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              background: "#10B981",
              borderRadius: "50%",
              border: "2px solid #fff",
              boxShadow: "0 0 0 4px rgba(16,185,129,0.25)",
            }}
          />
        </div>

        {/* 车辆位置点 */}
        {!isDelivered && (
          <div
            style={{
              position: "absolute",
              top: "58%",
              left: "40%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                background: "#4F6EF7",
                borderRadius: "50%",
                border: "2.5px solid #fff",
                position: "relative",
                zIndex: 2,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "rgba(79,110,247,0.25)",
                animation: "mapPulse 1.8s ease-out infinite",
              }}
            />
          </div>
        )}

        {/* 左上角信息 */}
        <div
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            background: "rgba(255,255,255,0.10)",
            backdropFilter: "blur(8px)",
            borderRadius: 10,
            padding: "8px 14px",
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 12,
              fontWeight: 600,
              display: "block",
            }}
          >
            {orderId}
          </Text>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              marginTop: 2,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: isDelivered ? "#10B981" : "#4F6EF7",
              }}
            />
            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>
              {tracking?.vehicleType === "DRONE" ? "无人机" : "机器人"} ·{" "}
              {isDelivered ? "已送达" : "派送中"}
            </Text>
          </div>
        </div>

        {/* ETA */}
        <div
          style={{
            position: "absolute",
            bottom: 16,
            right: 16,
            background: isDelivered ? "#10B981" : "#4F6EF7",
            borderRadius: 10,
            padding: "8px 14px",
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 12,
              display: "block",
              opacity: 0.8,
            }}
          >
            {isDelivered ? "已完成" : "预计到达"}
          </Text>
          <Text
            style={{
              color: "#fff",
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: -0.5,
            }}
          >
            {isDelivered ? "✓" : `~${tracking?.etaMinutes ?? "--"} min`}
          </Text>
        </div>
      </div>

      {/* 送达提示 */}
      {isDelivered && (
        <Alert
          message="配送完成！包裹已送达目的地。"
          type="success"
          showIcon
          style={{ marginBottom: 20, borderRadius: 12 }}
        />
      )}

      {/* 进度步骤 */}
      <Card
        style={{ marginBottom: 20, borderRadius: 14 }}
        styles={{ body: { padding: "24px 28px" } }}
      >
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
          订单进度
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
          {STEPS.map((step, i) => {
            const isDone = i < currentStep;
            const isActive = i === currentStep;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  position: "relative",
                }}
              >
                {i < STEPS.length - 1 && (
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
                )}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    zIndex: 1,
                    background: isDone
                      ? "#4F6EF7"
                      : isActive
                        ? "#EEF2FF"
                        : "#F4F6FD",
                    border: `2px solid ${isDone ? "#4F6EF7" : isActive ? "#4F6EF7" : "#E5EAFF"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: isDone ? "#fff" : isActive ? "#4F6EF7" : "#C4CCDD",
                    fontSize: 14,
                    boxShadow: isActive
                      ? "0 0 0 4px rgba(79,110,247,0.15)"
                      : "none",
                  }}
                >
                  {step.icon}
                </div>
                <Text
                  style={{
                    fontSize: 11,
                    marginTop: 8,
                    textAlign: "center",
                    color: isDone
                      ? "#4F6EF7"
                      : isActive
                        ? "#1A1D2E"
                        : "#C4CCDD",
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

      {/* PIN + QR */}
      <Card
        style={{ borderRadius: 14 }}
        styles={{ body: { padding: "24px 28px" } }}
      >
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
          解锁验证
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
            <Text
              type="secondary"
              style={{ fontSize: 13, display: "block", marginBottom: 8 }}
            >
              取货 PIN 码
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
            <Text
              type="secondary"
              style={{ fontSize: 12, display: "block", marginTop: 8 }}
            >
              告知机器人此 PIN 码以解锁包裹仓门
            </Text>
          </div>
          <div>
            <Text
              type="secondary"
              style={{ fontSize: 13, display: "block", marginBottom: 8 }}
            >
              扫码解锁
            </Text>
            <div
              style={{
                border: "2px solid #E5EAFF",
                borderRadius: 12,
                padding: 8,
                display: "inline-block",
              }}
            >
              <QRCode
                value={`UNLOCK:${orderId}:${pin}`}
                size={100}
                bordered={false}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
