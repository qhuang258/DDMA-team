import { App as AntApp, Button, Form, Input, Steps, Typography } from "antd";
import { CarOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { register, sendOtp } from "../../api/client";

type StepOneValues = {
  name: string;
  identifier: string;
  password: string;
};

type StepTwoValues = {
  otp: string;
};

export function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [stepOneData, setStepOneData] = useState<StepOneValues | null>(null);
  const { message, notification } = AntApp.useApp();

  const handleSendOtp = async (values: StepOneValues) => {
    try {
      setLoading(true);

      const res = await sendOtp({
        full_name: values.name,
        email: values.identifier,
        password: values.password,
      });

      if (!res?.challenge_id) {
        throw new Error("sendOtp 接口没有返回 challenge_id。请检查后端是否已重启。");
      }

      setChallengeId(String(res.challenge_id));
      setStepOneData(values);
      setStep(1);

      notification.open({
        type: "warning",
        message: "开发模式 — OTP 验证码",
        description: (
          <span>
            您的验证码为：
            <strong
              style={{
                fontSize: 22,
                letterSpacing: 6,
                display: "inline-block",
                margin: "4px 0",
              }}
            >
              {res.otp_code}
            </strong>
            <br />
            <span style={{ color: "#888", fontSize: 12 }}>
              （此弹窗仅在开发阶段出现，生产环境将发送至邮箱/手机）
            </span>
          </span>
        ),
        placement: "top",
        duration: 30,
      });

      message.success("验证码已生成，请查看页面顶部弹窗。");
    } catch (error) {
      if (error instanceof Error) {
        const apiError = error as Error & { code?: string };
        if (apiError.code === "EMAIL_TAKEN") {
          message.error("该邮箱已被注册，请直接登录或更换邮箱。");
        } else if (apiError.code === "PHONE_TAKEN") {
          message.error("该手机号已被注册，请直接登录或更换手机号。");
        } else {
          message.error(error.message || "发送验证码失败");
        }
      } else {
        message.error("发送验证码失败");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegister = async (values: StepTwoValues) => {
    if (!stepOneData || !challengeId) {
      message.error("缺少注册信息，请重新发送验证码。");
      setStep(0);
      return;
    }

    try {
      setLoading(true);
      await register({ challenge_id: challengeId, otp_code: values.otp });
      message.success("注册成功，请登录。");
      navigate("/login");
    } catch (error) {
      message.error(error instanceof Error ? error.message : "注册失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #EEF2FF 0%, #F8F9FE 60%, #FFFFFF 100%)",
        padding: 24,
      }}
    >
      <div
        style={{
          width: 460,
          background: "#FFFFFF",
          borderRadius: 16,
          padding: "40px 40px 32px",
          boxShadow:
            "0 4px 24px rgba(79,110,247,0.10), 0 1px 4px rgba(0,0,0,0.05)",
        }}
      >
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
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
            创建账户
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: 14 }}>
            只需两步，即可开始使用自治配送
          </Typography.Text>
        </div>

        <Steps
          size="small"
          current={step}
          items={[{ title: "基本信息" }, { title: "OTP 验证" }]}
          style={{ marginBottom: 28 }}
        />

        {step === 0 ? (
          <Form layout="vertical" onFinish={handleSendOtp}>
            <Form.Item
              label="姓名"
              name="name"
              rules={[{ required: true, message: "请输入姓名" }]}
            >
              <Input size="large" placeholder="请输入您的姓名" />
            </Form.Item>
            <Form.Item
              label="邮箱或手机"
              name="identifier"
              rules={[{ required: true, message: "请输入邮箱或手机" }]}
            >
              <Input size="large" placeholder="user@example.com 或 +14155550101" />
            </Form.Item>
            <Form.Item
              label="密码"
              name="password"
              rules={[{ required: true, message: "请输入密码" }]}
            >
              <Input.Password size="large" placeholder="请设置密码" />
            </Form.Item>
            <Form.Item style={{ marginTop: 8 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
              >
                发送验证码
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <Form layout="vertical" onFinish={handleCompleteRegister}>
            <Form.Item
              label="验证码"
              name="otp"
              rules={[{ required: true, message: "请输入验证码" }]}
              style={{ marginBottom: 24 }}
            >
              <Input.OTP length={6} />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              style={{ marginBottom: 8 }}
            >
              完成注册
            </Button>
            <Button type="text" onClick={() => setStep(0)} block>
              ← 返回上一步
            </Button>
          </Form>
        )}

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
            已有账户？{" "}
            <Link to="/login" style={{ color: "#4F6EF7", fontWeight: 500 }}>
              去登录
            </Link>
          </Typography.Text>
        </div>
      </div>
    </div>
  );
}
