import {
  Alert,
  Button,
  Col,
  InputNumber,
  Row,
  Select,
  Spin,
  Steps,
  Switch,
  Typography,
  Input,
} from "antd";
import {
  EnvironmentFilled,
  EnvironmentOutlined,
  InboxOutlined,
  CheckCircleFilled,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchCenters } from "../../api/client";

const { Title, Text } = Typography;

const PACKAGE_SIZES = [
  {
    key: "S",
    label: "小号",
    sublabel: "文件 · 小礼品",
    maxWeight: "3 kg",
    dims: "28 × 20 × 15 cm",
    iconSize: 32,
  },
  {
    key: "M",
    label: "中号",
    sublabel: "日用品 · 衣物",
    maxWeight: "10 kg",
    dims: "40 × 30 × 20 cm",
    iconSize: 40,
  },
  {
    key: "L",
    label: "大号",
    sublabel: "家电 · 大件包裹",
    maxWeight: "25 kg",
    dims: "60 × 40 × 40 cm",
    iconSize: 48,
  },
];

type PackageSize = "S" | "M" | "L";

export function OrderWizardPage() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  // Centers
  const [centers, setCenters] = useState<{ label: string; value: string }[]>([]);
  const [selectedCenterId, setSelectedCenterId] = useState<string | undefined>();
  const [loadingCenters, setLoadingCenters] = useState(false);
  const [centersError, setCentersError] = useState<string | null>(null);

  // Address
  const [pickupAddress, setPickupAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  // Package
  const [packageSize, setPackageSize] = useState<PackageSize>("M");
  const [weight, setWeight] = useState<number>(1);
  const [fragile, setFragile] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoadingCenters(true);
        const data = await fetchCenters();
        if (cancelled) return;
        const opts = data.map((c) => ({ label: c.name, value: c.id }));
        setCenters(opts);
        if (opts.length > 0) setSelectedCenterId((v) => v ?? opts[0].value);
      } catch (err) {
        if (!cancelled) setCentersError(err instanceof Error ? err.message : "加载失败");
      } finally {
        if (!cancelled) setLoadingCenters(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // ── Step content ──────────────────────────────────────────────
  const stepAddress = (
    <div style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.8, color: "#9CA3AF", textTransform: "uppercase" }}>
          配送中心
        </Text>
        <div style={{ marginTop: 8 }}>
          {loadingCenters ? (
            <Spin size="small" />
          ) : centersError ? (
            <Alert type="error" showIcon message={centersError} />
          ) : (
            <Select
              size="large"
              style={{ width: "100%" }}
              placeholder="请选择配送中心"
              options={centers}
              value={selectedCenterId}
              onChange={setSelectedCenterId}
            />
          )}
        </div>
      </div>

      {[
        {
          label: "取货地址",
          placeholder: "输入取货地址（将接入 Google Places）",
          value: pickupAddress,
          onChange: setPickupAddress,
          icon: <EnvironmentFilled style={{ color: "#4F6EF7", fontSize: 18 }} />,
          accentColor: "#4F6EF7",
        },
        {
          label: "送货地址",
          placeholder: "输入送货地址（将接入 Google Places）",
          value: deliveryAddress,
          onChange: setDeliveryAddress,
          icon: <EnvironmentOutlined style={{ color: "#10B981", fontSize: 18 }} />,
          accentColor: "#10B981",
        },
      ].map(({ label, placeholder, value, onChange, icon, accentColor }) => (
        <div key={label} style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.8, color: "#9CA3AF", textTransform: "uppercase" }}>
            {label}
          </Text>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 8,
              background: "#fff",
              border: `2px solid ${value ? accentColor : "#E5EAFF"}`,
              borderRadius: 12,
              padding: "10px 16px",
              transition: "border-color 0.2s",
            }}
          >
            {icon}
            <Input
              bordered={false}
              size="large"
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              style={{ padding: 0, fontSize: 15, flex: 1 }}
            />
          </div>
        </div>
      ))}
    </div>
  );

  const stepPackage = (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 28 }}>
        {PACKAGE_SIZES.map((pkg) => {
          const selected = packageSize === pkg.key;
          return (
            <Col xs={24} sm={8} key={pkg.key}>
              <div
                onClick={() => setPackageSize(pkg.key as PackageSize)}
                style={{
                  border: `2px solid ${selected ? "#4F6EF7" : "#E5EAFF"}`,
                  borderRadius: 14,
                  padding: "24px 20px",
                  cursor: "pointer",
                  background: selected ? "#EEF2FF" : "#fff",
                  transition: "all 0.18s ease",
                  position: "relative",
                  textAlign: "center",
                  userSelect: "none",
                }}
              >
                {selected && (
                  <CheckCircleFilled
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      color: "#4F6EF7",
                      fontSize: 18,
                    }}
                  />
                )}
                <InboxOutlined
                  style={{
                    fontSize: pkg.iconSize,
                    color: selected ? "#4F6EF7" : "#C4CCDD",
                    marginBottom: 12,
                    display: "block",
                    transition: "color 0.18s",
                  }}
                />
                <div style={{ fontWeight: 700, fontSize: 18, color: "#1A1D2E", marginBottom: 2 }}>
                  {pkg.label}
                </div>
                <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 12 }}>
                  {pkg.sublabel}
                </div>
                <div
                  style={{
                    background: selected ? "rgba(79,110,247,0.08)" : "#F4F6FD",
                    borderRadius: 8,
                    padding: "6px 10px",
                  }}
                >
                  <div style={{ fontSize: 11, color: "#6B7280" }}>最大 {pkg.maxWeight}</div>
                  <div style={{ fontSize: 11, color: "#6B7280" }}>{pkg.dims}</div>
                </div>
              </div>
            </Col>
          );
        })}
      </Row>

      <div style={{ maxWidth: 380, display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <Text style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.8, color: "#9CA3AF", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
            实际重量 (kg)
          </Text>
          <InputNumber
            min={0.1}
            max={50}
            step={0.1}
            value={weight}
            onChange={(v) => setWeight(v ?? 1)}
            size="large"
            style={{ width: "100%", borderRadius: 10 }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", border: "2px solid #E5EAFF", borderRadius: 12, padding: "14px 16px" }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: "#1A1D2E" }}>易碎物品</div>
            <div style={{ fontSize: 12, color: "#9CA3AF" }}>需要轻拿轻放</div>
          </div>
          <Switch checked={fragile} onChange={setFragile} />
        </div>
      </div>
    </div>
  );

  const selectedPkg = PACKAGE_SIZES.find((p) => p.key === packageSize)!;

  const stepReview = (
    <div style={{ maxWidth: 520 }}>
      <div style={{ background: "#F4F6FD", borderRadius: 14, padding: 24, marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.8, color: "#9CA3AF", textTransform: "uppercase", marginBottom: 16 }}>
          订单摘要
        </div>
        {[
          { label: "配送中心", value: centers.find((c) => c.value === selectedCenterId)?.label ?? "—" },
          { label: "取货地址", value: pickupAddress || "（未填写）" },
          { label: "送货地址", value: deliveryAddress || "（未填写）" },
          { label: "包裹尺寸", value: `${selectedPkg.label}（${selectedPkg.dims}）` },
          { label: "实际重量", value: `${weight} kg` },
          { label: "易碎物品", value: fragile ? "是" : "否" },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>{label}</Text>
            <Text strong style={{ fontSize: 13, textAlign: "right", maxWidth: 280 }}>{value}</Text>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#10B981", fontSize: 13 }}>
        <ThunderboltOutlined />
        <span>准备好了！点击下方按钮查看最优配送方案。</span>
      </div>
    </div>
  );

  const steps = [
    { title: "地址", content: stepAddress },
    { title: "包裹", content: stepPackage },
    { title: "确认", content: stepReview },
  ];

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ margin: "0 0 4px", color: "#1A1D2E", letterSpacing: -0.5 }}>
          创建新订单
        </Title>
        <Text type="secondary">填写配送信息，获取最优自动驾驶方案</Text>
      </div>

      {/* Steps indicator */}
      <Steps
        current={current}
        items={steps.map((s) => ({ title: s.title }))}
        style={{ marginBottom: 36, maxWidth: 500 }}
      />

      {/* Step content */}
      <div style={{ minHeight: 280, marginBottom: 36 }}>
        {steps[current].content}
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 560, paddingTop: 20, borderTop: "1px solid #E5EAFF" }}>
        {current > 0 ? (
          <Button icon={<ArrowLeftOutlined />} size="large" onClick={() => setCurrent((c) => c - 1)} style={{ borderRadius: 10 }}>
            上一步
          </Button>
        ) : (
          <div />
        )}
        {current < steps.length - 1 ? (
          <Button
            type="primary"
            size="large"
            iconPosition="end"
            icon={<ArrowRightOutlined />}
            onClick={() => setCurrent((c) => c + 1)}
            style={{ borderRadius: 10, paddingInline: 28 }}
          >
            下一步
          </Button>
        ) : (
          <Button
            type="primary"
            size="large"
            iconPosition="end"
            icon={<ArrowRightOutlined />}
            onClick={() => navigate("/recommendations")}
            style={{ borderRadius: 10, paddingInline: 28 }}
          >
            查看交付选项
          </Button>
        )}
      </div>
    </div>
  );
}
