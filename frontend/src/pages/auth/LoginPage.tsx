import { App as AntApp, Button, Form, Input, Typography } from "antd";
import { CarOutlined } from "@ant-design/icons";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { login as loginApi, type LoginRequest } from "@/api/client";

type LocationState = { from?: { pathname: string } };

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const { message } = AntApp.useApp();
  const from = (location.state as LocationState | null)?.from?.pathname ?? "/";

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #EEF2FF 0%, #F8F9FE 60%, #FFFFFF 100%)",
        padding: 24,
      }}
    >
      <div
        style={{
          width: 420,
          background: "#FFFFFF",
          borderRadius: 16,
          padding: "40px 40px 32px",
          boxShadow:
            "0 4px 24px rgba(79,110,247,0.10), 0 1px 4px rgba(0,0,0,0.05)",
        }}
      >
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 54,
              height: 54,
              background: "#EEF2FF",
              borderRadius: 14,
              marginBottom: 16,
            }}
          >
            <CarOutlined style={{ fontSize: 28, color: "#4F6EF7" }} />
          </div>
          <Typography.Title
            level={3}
            style={{ margin: 0, color: "#1A1D2E", letterSpacing: -0.5 }}
          >
            欢迎回来
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: 14 }}>
            登录继续使用自治配送服务
          </Typography.Text>
        </div>

        <Form<LoginRequest>
          layout="vertical"
          onFinish={async (values) => {
            try {
              const response = await loginApi(values);
              login({ token: response.access_token, user: response.user });
              message.success("登录成功");
              navigate(from, { replace: true });
            } catch (error) {
              const err = error as Error;
              message.error(err.message || "登录失败，请重试");
            }
          }}
        >
          <Form.Item
            label="邮箱或手机"
            name="identifier"
            rules={[{ required: true, message: "请输入邮箱或手机" }]}
          >
            <Input
              size="large"
              placeholder="user@example.com 或 +14155550101"
            />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
            style={{ marginBottom: 8 }}
          >
            <Input.Password size="large" placeholder="请输入密码" />
          </Form.Item>
          <Form.Item style={{ marginTop: 16 }}>
            <Button type="primary" htmlType="submit" block size="large">
              登录
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center", marginTop: 4 }}>
          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
            没有账户？{" "}
            <Link to="/register" style={{ color: "#4F6EF7", fontWeight: 500 }}>
              立即注册
            </Link>
          </Typography.Text>
        </div>
      </div>
    </div>
  );
}
