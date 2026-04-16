import {
  Alert,
  Button,
  Card,
  Col,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Spin,
  Steps,
  Switch,
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckCircleFilled,
  EnvironmentFilled,
  EnvironmentOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addParcel,
  createOrder,
  fetchCenters,
  type DeliveryCenter,
  type PackageSizeTier,
} from "../../api/client";

const { Title, Text } = Typography;

const ORDER_DRAFT_STORAGE_KEY = "order_draft";

const PACKAGE_OPTIONS: Array<{
  key: PackageSizeTier;
  label: string;
  description: string;
  maxWeight: number;
  dimensions: string;
  iconSize: number;
}> = [
  {
    key: "S",
    label: "Small",
    description: "Documents and compact items",
    maxWeight: 3,
    dimensions: "28 x 20 x 15 cm",
    iconSize: 30,
  },
  {
    key: "M",
    label: "Medium",
    description: "Daily goods and apparel",
    maxWeight: 10,
    dimensions: "40 x 30 x 20 cm",
    iconSize: 38,
  },
  {
    key: "L",
    label: "Large",
    description: "Bulkier packages",
    maxWeight: 25,
    dimensions: "60 x 40 x 40 cm",
    iconSize: 46,
  },
];

type CenterOption = {
  label: string;
  value: string;
  latitude: number;
  longitude: number;
  addressLine?: string | null;
};

function toCenterOption(center: DeliveryCenter): CenterOption {
  return {
    label: center.name,
    value: center.id,
    latitude: center.latitude,
    longitude: center.longitude,
    addressLine: center.address_line,
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Unable to submit the order right now.";
}

export function OrderWizardPage() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  const [centers, setCenters] = useState<CenterOption[]>([]);
  const [selectedCenterId, setSelectedCenterId] = useState<string>();
  const [loadingCenters, setLoadingCenters] = useState(false);
  const [centersError, setCentersError] = useState<string | null>(null);

  const [pickupAddress, setPickupAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [packageSize, setPackageSize] = useState<PackageSizeTier>("M");
  const [weight, setWeight] = useState<number>(1);
  const [fragile, setFragile] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadCenters = async () => {
      try {
        setLoadingCenters(true);
        setCentersError(null);

        const result = await fetchCenters();
        if (cancelled) {
          return;
        }

        const options = result.map(toCenterOption);
        setCenters(options);
        if (options.length > 0) {
          setSelectedCenterId((currentValue) => currentValue ?? options[0].value);
        }
      } catch (error) {
        if (!cancelled) {
          setCentersError(getErrorMessage(error));
        }
      } finally {
        if (!cancelled) {
          setLoadingCenters(false);
        }
      }
    };

    void loadCenters();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedCenter = useMemo(
    () => centers.find((center) => center.value === selectedCenterId),
    [centers, selectedCenterId],
  );

  const selectedPackage = useMemo(
    () => PACKAGE_OPTIONS.find((option) => option.key === packageSize) ?? PACKAGE_OPTIONS[1],
    [packageSize],
  );

  useEffect(() => {
    if (weight > selectedPackage.maxWeight) {
      setWeight(selectedPackage.maxWeight);
    }
  }, [selectedPackage.maxWeight, weight]);

  const canContinueFromAddress =
    !!selectedCenterId && pickupAddress.trim().length > 0 && deliveryAddress.trim().length > 0;
  const canSubmit = canContinueFromAddress && weight > 0 && weight <= selectedPackage.maxWeight;

  const handleNext = () => {
    if (current === 0 && !canContinueFromAddress) {
      return;
    }
    setCurrent((step) => step + 1);
  };

  const handleSubmit = async () => {
    if (!selectedCenterId || !selectedCenter) {
      setSubmitError("Please select a delivery center.");
      return;
    }

    if (!canSubmit) {
      setSubmitError("Please complete the order details before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const order = await createOrder({
        center_id: selectedCenterId,
        pickup_address: pickupAddress.trim(),
        pickup_lat: selectedCenter.latitude,
        pickup_lng: selectedCenter.longitude,
        dropoff_address: deliveryAddress.trim(),
      });

      const parcel = await addParcel(order.order_id, {
        size_tier: packageSize,
        weight_kg: weight,
        fragile,
        delivery_notes: null,
      });

      window.sessionStorage.setItem(
        ORDER_DRAFT_STORAGE_KEY,
        JSON.stringify({
          orderId: order.order_id,
          centerId: selectedCenterId,
          centerName: selectedCenter.label,
          centerAddress: selectedCenter.addressLine ?? null,
          pickupAddress: pickupAddress.trim(),
          pickupLat: selectedCenter.latitude,
          pickupLng: selectedCenter.longitude,
          dropoffAddress: deliveryAddress.trim(),
          dropoffLat: null,
          dropoffLng: null,
          parcel: {
            parcelId: parcel.parcel_id,
            sizeTier: packageSize,
            weightKg: weight,
            fragile,
          },
        }),
      );

      navigate(`/recommendations?orderId=${encodeURIComponent(order.order_id)}`);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const addressStep = (
    <Space direction="vertical" size={20} style={{ width: "100%", maxWidth: 620 }}>
      <div>
        <Text strong style={{ display: "block", marginBottom: 8 }}>
          Delivery center
        </Text>
        {loadingCenters ? (
          <Spin />
        ) : centersError ? (
          <Alert type="error" showIcon message={centersError} />
        ) : (
          <Select
            size="large"
            style={{ width: "100%" }}
            placeholder="Select a delivery center"
            options={centers}
            value={selectedCenterId}
            onChange={setSelectedCenterId}
          />
        )}
      </div>

      <Card bordered={false} style={{ background: "#F7F9FF" }}>
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <div>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              Pickup address
            </Text>
            <Input
              size="large"
              prefix={<EnvironmentFilled style={{ color: "#4F6EF7" }} />}
              placeholder="Enter the pickup address"
              value={pickupAddress}
              onChange={(event) => setPickupAddress(event.target.value)}
            />
          </div>

          <div>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              Dropoff address
            </Text>
            <Input
              size="large"
              prefix={<EnvironmentOutlined style={{ color: "#10B981" }} />}
              placeholder="Enter the dropoff address"
              value={deliveryAddress}
              onChange={(event) => setDeliveryAddress(event.target.value)}
            />
          </div>

          {selectedCenter?.addressLine ? (
            <Alert
              type="info"
              showIcon
              message={`Selected center address: ${selectedCenter.addressLine}`}
            />
          ) : null}
        </Space>
      </Card>
    </Space>
  );

  const packageStep = (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <Row gutter={[16, 16]}>
        {PACKAGE_OPTIONS.map((option) => {
          const selected = packageSize === option.key;
          return (
            <Col xs={24} sm={8} key={option.key}>
              <Card
                hoverable
                onClick={() => setPackageSize(option.key)}
                style={{
                  borderColor: selected ? "#4F6EF7" : "#E5EAFF",
                  background: selected ? "#EEF2FF" : "#FFFFFF",
                }}
              >
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  <InboxOutlined
                    style={{
                      fontSize: option.iconSize,
                      color: selected ? "#4F6EF7" : "#9CA3AF",
                    }}
                  />
                  <div>
                    <Text strong>{option.label}</Text>
                    {selected ? (
                      <CheckCircleFilled style={{ color: "#4F6EF7", marginLeft: 8 }} />
                    ) : null}
                  </div>
                  <Text type="secondary">{option.description}</Text>
                  <Text type="secondary">{`Up to ${option.maxWeight} kg`}</Text>
                  <Text type="secondary">{option.dimensions}</Text>
                </Space>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            Weight (kg)
          </Text>
          <InputNumber
            min={0.1}
            max={selectedPackage.maxWeight}
            step={0.1}
            value={weight}
            onChange={(value) => setWeight(value ?? 1)}
            size="large"
            style={{ width: "100%" }}
          />
          <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
            {`Current limit for ${selectedPackage.label}: ${selectedPackage.maxWeight} kg`}
          </Text>
        </Col>
        <Col xs={24} md={12}>
          <Card size="small" style={{ height: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <Text strong>Fragile item</Text>
                <Text type="secondary" style={{ display: "block" }}>
                  Extra care is required during delivery.
                </Text>
              </div>
              <Switch checked={fragile} onChange={setFragile} />
            </div>
          </Card>
        </Col>
      </Row>
    </Space>
  );

  const reviewStep = (
    <Space direction="vertical" size={16} style={{ width: "100%", maxWidth: 620 }}>
      <Card bordered={false} style={{ background: "#F7F9FF" }}>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Title level={4} style={{ margin: 0 }}>
            Order review
          </Title>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
            <Text type="secondary">Delivery center</Text>
            <Text strong>{selectedCenter?.label ?? "-"}</Text>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
            <Text type="secondary">Pickup</Text>
            <Text strong style={{ textAlign: "right" }}>
              {pickupAddress || "-"}
            </Text>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
            <Text type="secondary">Dropoff</Text>
            <Text strong style={{ textAlign: "right" }}>
              {deliveryAddress || "-"}
            </Text>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
            <Text type="secondary">Package</Text>
            <Text strong>{selectedPackage.label}</Text>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
            <Text type="secondary">Weight</Text>
            <Text strong>{`${weight} kg`}</Text>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
            <Text type="secondary">Fragile</Text>
            <Text strong>{fragile ? "Yes" : "No"}</Text>
          </div>
        </Space>
      </Card>

      {submitError ? <Alert type="error" showIcon message={submitError} /> : null}
    </Space>
  );

  const steps = [
    { title: "Address", content: addressStep },
    { title: "Package", content: packageStep },
    { title: "Review", content: reviewStep },
  ];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          Create a delivery order
        </Title>
        <Text type="secondary">
          Submit the address and package details first, then continue to plan selection.
        </Text>
      </div>

      <Steps
        current={current}
        items={steps.map((step) => ({ title: step.title }))}
        style={{ maxWidth: 560, marginBottom: 32 }}
      />

      <div style={{ minHeight: 320, marginBottom: 32 }}>{steps[current].content}</div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          borderTop: "1px solid #E5EAFF",
          paddingTop: 20,
          maxWidth: 620,
        }}
      >
        {current > 0 ? (
          <Button icon={<ArrowLeftOutlined />} size="large" onClick={() => setCurrent((step) => step - 1)}>
            Back
          </Button>
        ) : (
          <div />
        )}

        {current < steps.length - 1 ? (
          <Button
            type="primary"
            icon={<ArrowRightOutlined />}
            iconPosition="end"
            size="large"
            onClick={handleNext}
            disabled={current === 0 && !canContinueFromAddress}
          >
            Next
          </Button>
        ) : (
          <Button
            type="primary"
            icon={<ArrowRightOutlined />}
            iconPosition="end"
            size="large"
            loading={submitting}
            onClick={() => void handleSubmit()}
            disabled={!canSubmit}
          >
            View delivery options
          </Button>
        )}
      </div>
    </div>
  );
}
