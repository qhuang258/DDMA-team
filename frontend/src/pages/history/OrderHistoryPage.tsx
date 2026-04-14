import { Badge, Button, Empty, Typography } from "antd";
import {
  ArrowRightOutlined,
  HistoryOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

type OrderStatus = "派送中" | "已交付" | "处理中" | "已取消";

interface OrderRow {
  id: string;
  date: string;
  status: OrderStatus;
  total: string;
  from: string;
  to: string;
}

const demoRows: OrderRow[] = [
  {
    id: "ORD-2026-001",
    date: "2026-03-20",
    status: "派送中",
    total: "$12.00",
    from: "SF SoMa Center",
    to: "123 Mission St",
  },
  {
    id: "ORD-2026-000",
    date: "2026-03-10",
    status: "已交付",
    total: "$9.50",
    from: "SF SoMa Center",
    to: "456 Market St",
  },
];

const STATUS_CONFIG: Record<OrderStatus, { status: "processing" | "success" | "warning" | "error" | "default"; label: string }> = {
  派送中: { status: "processing", label: "派送中" },
  已交付: { status: "success", label: "已交付" },
  处理中: { status: "warning", label: "处理中" },
  已取消: { status: "error", label: "已取消" },
};

export function OrderHistoryPage() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <Title level={2} style={{ margin: "0 0 4px", color: "#1A1D2E", letterSpacing: -0.5 }}>
            订单历史
          </Title>
          <Text type="secondary">查看所有历史配送记录</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/order")}
          style={{ borderRadius: 10 }}
        >
          新建订单
        </Button>
      </div>

      {/* Order list */}
      {demoRows.length === 0 ? (
        <Empty
          image={<HistoryOutlined style={{ fontSize: 64, color: "#C4CCDD" }} />}
          description={
            <span style={{ color: "#9CA3AF" }}>暂无订单记录</span>
          }
          style={{ padding: "60px 0" }}
        >
          <Button type="primary" onClick={() => navigate("/order")}>
            创建第一单
          </Button>
        </Empty>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {demoRows.map((row) => {
            const cfg = STATUS_CONFIG[row.status];
            return (
              <div
                key={row.id}
                style={{
                  background: "#fff",
                  border: "1.5px solid #E5EAFF",
                  borderRadius: 14,
                  padding: "18px 22px",
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  transition: "box-shadow 0.15s, border-color 0.15s",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.boxShadow = "0 4px 16px rgba(79,110,247,0.10)";
                  el.style.borderColor = "#C7D3FF";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.boxShadow = "none";
                  el.style.borderColor = "#E5EAFF";
                }}
              >
                {/* Left: ID + route */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#1A1D2E", marginBottom: 4 }}>
                    {row.id}
                  </div>
                  <div style={{ fontSize: 12, color: "#9CA3AF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {row.from} → {row.to}
                  </div>
                </div>

                {/* Middle: Status + date */}
                <div style={{ textAlign: "center", flexShrink: 0 }}>
                  <Badge status={cfg.status} text={<span style={{ fontSize: 13, fontWeight: 500 }}>{cfg.label}</span>} />
                  <div style={{ fontSize: 12, color: "#C4CCDD", marginTop: 2 }}>{row.date}</div>
                </div>

                {/* Right: Price + action */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: "#1A1D2E",
                      fontVariantNumeric: "tabular-nums",
                      letterSpacing: -0.5,
                    }}
                  >
                    {row.total}
                  </div>
                  <Button
                    type="text"
                    icon={<ArrowRightOutlined />}
                    iconPosition="end"
                    onClick={() => navigate(`/orders/${row.id}/tracking`)}
                    style={{ color: "#4F6EF7", fontWeight: 600, fontSize: 13, padding: "0 8px" }}
                  >
                    追踪
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
