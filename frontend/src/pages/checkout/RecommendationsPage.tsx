import { Button, Col, Row, Spin, Typography } from "antd";
import {
  CheckCircleFilled,
  ClockCircleOutlined,
  RobotOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchVehicles } from "../../api/client";

const { Title, Text } = Typography;

type VehicleKey = "robot" | "drone";

const VEHICLES = [
  {
    key: "robot" as VehicleKey,
    name: "地面机器人",
    desc: "全天候自动驾驶，适合日常包裹",
    eta: "~45 分钟",
    price: "$12.00",
    gradient: "linear-gradient(135deg, #3B5BDB 0%, #7C3AED 100%)",
    iconColor: "#fff",
    badge: "⭐ 最佳性价比",
    badgeBg: "#F59E0B",
    icon: <RobotOutlined style={{ fontSize: 52, color: "#fff" }} />,
  },
  {
    key: "drone" as VehicleKey,
    name: "无人机",
    desc: "空中直线飞行，速度快但限载重",
    eta: "~28 分钟",
    price: "$18.00",
    gradient: "linear-gradient(135deg, #059669 0%, #0EA5E9 100%)",
    iconColor: "#fff",
    badge: "⚡ 最快送达",
    badgeBg: "#10B981",
    icon: <SendOutlined style={{ fontSize: 48, color: "#fff", transform: "rotate(-45deg)" }} />,
  },
];

function loadJson<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function RecommendationsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selected, setSelected] = useState<VehicleKey>("robot");
  const [availableTypes, setAvailableTypes] = useState<Set<string>>(new Set(["ROBOT", "DRONE"]));
  const [vehiclesLoading, setVehiclesLoading] = useState(true);

  const draft = loadJson<{ centerId?: string }>("order_draft");
  const centerId = draft?.centerId ?? searchParams.get("centerId");

  useEffect(() => {
    if (!centerId) {
      setVehiclesLoading(false);
      return;
    }
    fetchVehicles(centerId)
      .then((vehicles) => {
        const available = new Set(
          vehicles.filter((v) => v.available).map((v) => v.vehicle_type as string),
        );
        setAvailableTypes(available);
      })
      .catch(() => {
        // silently keep both enabled on error
      })
      .finally(() => setVehiclesLoading(false));
  }, [centerId]);

  // If the currently selected type becomes unavailable, switch to first available
  useEffect(() => {
    if (!availableTypes.has(selected.toUpperCase())) {
      const fallback = VEHICLES.find((v) => availableTypes.has(v.key.toUpperCase()));
      if (fallback) setSelected(fallback.key);
    }
  }, [availableTypes]);

  const handleSelect = () => {
    const vehicle = VEHICLES.find((v) => v.key === selected)!;
    const orderId = searchParams.get("orderId");
    sessionStorage.setItem(
      "plan_choice",
      JSON.stringify({
        vehicleType: vehicle.key.toUpperCase(),
        priceUsd: parseFloat(vehicle.price.replace("$", "")),
        etaMinutes: parseInt(vehicle.eta.replace(/\D/g, ""), 10),
      }),
    );
    if (orderId) {
      navigate(`/checkout?orderId=${encodeURIComponent(orderId)}`);
    } else {
      navigate("/checkout");
    }
  };

  const noVehiclesAvailable = VEHICLES.every((v) => !availableTypes.has(v.key.toUpperCase()));

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ margin: "0 0 4px", color: "#1A1D2E", letterSpacing: -0.5 }}>
          选择配送方式
        </Title>
        <Text type="secondary">根据您的包裹和地址，为您推荐以下方案</Text>
      </div>

      {/* Vehicle cards */}
      <Spin spinning={vehiclesLoading}>
        <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
          {VEHICLES.map((v) => {
            const isSelected = selected === v.key;
            const isDisabled = !availableTypes.has(v.key.toUpperCase());
            return (
              <Col xs={24} sm={12} key={v.key}>
                <div
                  onClick={() => {
                    if (!isDisabled) setSelected(v.key);
                  }}
                  style={{
                    border: `2.5px solid ${isSelected && !isDisabled ? "#4F6EF7" : "#E5EAFF"}`,
                    borderRadius: 18,
                    overflow: "hidden",
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    background: "#fff",
                    transition: "all 0.2s ease",
                    boxShadow:
                      isSelected && !isDisabled
                        ? "0 8px 32px rgba(79,110,247,0.18)"
                        : "0 2px 8px rgba(0,0,0,0.06)",
                    transform: isSelected && !isDisabled ? "translateY(-2px)" : "none",
                    position: "relative",
                    opacity: isDisabled ? 0.45 : 1,
                  }}
                >
                  {/* Badge */}
                  <div
                    style={{
                      position: "absolute",
                      top: 14,
                      right: 14,
                      background: isDisabled ? "#9CA3AF" : v.badgeBg,
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: 20,
                      letterSpacing: 0.3,
                      zIndex: 2,
                    }}
                  >
                    {isDisabled ? "⚠ 暂不可用" : v.badge}
                  </div>

                  {/* Selected checkmark */}
                  {isSelected && !isDisabled && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 16,
                        right: 16,
                        zIndex: 2,
                      }}
                    >
                      <CheckCircleFilled style={{ fontSize: 22, color: "#4F6EF7" }} />
                    </div>
                  )}

                  {/* Gradient illustration area */}
                  <div
                    style={{
                      background: v.gradient,
                      height: 140,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    {/* Decorative circles */}
                    <div style={{ position: "absolute", width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.08)", top: -20, left: -20 }} />
                    <div style={{ position: "absolute", width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.06)", bottom: -10, right: 30 }} />
                    {v.icon}
                  </div>

                  {/* Info area */}
                  <div style={{ padding: "20px 22px 24px" }}>
                    <Title level={4} style={{ margin: "0 0 4px", color: "#1A1D2E" }}>
                      {v.name}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 13, display: "block", marginBottom: 20 }}>
                      {v.desc}
                    </Text>

                    {/* ETA + Price row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 2 }}>
                          预计时间
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <ClockCircleOutlined style={{ color: "#6B7280", fontSize: 13 }} />
                          <span style={{ fontSize: 16, fontWeight: 600, color: "#374151" }}>{v.eta}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 2 }}>
                          配送费
                        </div>
                        <div
                          style={{
                            fontSize: 28,
                            fontWeight: 800,
                            color: isSelected && !isDisabled ? "#4F6EF7" : "#1A1D2E",
                            letterSpacing: -1,
                            fontVariantNumeric: "tabular-nums",
                            transition: "color 0.2s",
                          }}
                        >
                          {v.price}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      </Spin>

      {/* CTA */}
      <Button
        type="primary"
        size="large"
        onClick={handleSelect}
        disabled={vehiclesLoading || noVehiclesAvailable}
        style={{
          borderRadius: 12,
          height: 52,
          paddingInline: 40,
          fontSize: 16,
          fontWeight: 600,
          boxShadow: "0 4px 16px rgba(79,110,247,0.3)",
        }}
      >
        {noVehiclesAvailable ? "当前站点暂无可用车辆" : "确认选择并继续结账 →"}
      </Button>
    </div>
  );
}
