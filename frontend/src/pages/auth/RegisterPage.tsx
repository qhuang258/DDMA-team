import { Button, Card, Form, Input, Steps, Typography, message, notification } from "antd";
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
  const [messageApi, contextHolder] = message.useMessage();
  const [notificationApi, notificationHolder] = notification.useNotification();

  const handleSendOtp = async (values: StepOneValues) => {
    try {
      setLoading(true);

      const res = await sendOtp({
        full_name: values.name,
        email: values.identifier,
        password: values.password,
      });

      if (!res?.challenge_id) {
        throw new Error(
          "sendOtp 接口没有返回 challenge_id。请检查后端是否已重启。",
        );
      }

      setChallengeId(String(res.challenge_id));
      setStepOneData(values);
      setStep(1);

      notificationApi.open({
        type: "warning",
        message: "开发模式 — OTP 验证码",
        description: (
          <span>
            您的验证码为：
            <strong style={{ fontSize: 22, letterSpacing: 6, display: "inline-block", margin: "4px 0" }}>
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

      messageApi.success("验证码已生成，请查看页面顶部弹窗。");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "发送验证码失败";
      messageApi.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegister = async (values: StepTwoValues) => {
    if (!stepOneData) {
      messageApi.error("请先填写基本信息并发送验证码。");
      setStep(0);
      return;
    }

    try {
      setLoading(true);

      if (!challengeId) {
        messageApi.error("缺少 challenge_id，请重新发送验证码。");
        setStep(0);
        return;
      }

      await register({
        challenge_id: challengeId,
        otp_code: values.otp,
      });

      messageApi.success("注册成功，请登录。");
      navigate("/login");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "注册失败";
      messageApi.error(errorMessage);
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
        padding: 24,
        background: "#f0f2f5",
      }}
    >
      {contextHolder}
      {notificationHolder}
      <Card style={{ width: 440 }} title="注册">
        <Steps
          size="small"
          current={step}
          items={[{ title: "基本信息" }, { title: "OTP 验证" }]}
          style={{ marginBottom: 24 }}
        />
        {step === 0 ? (
          <Form layout="vertical" onFinish={handleSendOtp}>
            <Typography.Paragraph type="secondary">
              占位：UI-AUTH-01，对接 US-1.1 注册与 OTP。
            </Typography.Paragraph>
            <Form.Item
              label="姓名"
              name="name"
              rules={[{ required: true, message: "请输入姓名" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="邮箱或手机"
              name="identifier"
              rules={[{ required: true, message: "请输入邮箱或手机" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="密码"
              name="password"
              rules={[{ required: true, message: "请输入密码" }]}
            >
              <Input.Password />
            </Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              发送验证码
            </Button>
          </Form>
        ) : (
          <Form layout="vertical" onFinish={handleCompleteRegister}>
            <Form.Item
              label="验证码"
              name="otp"
              rules={[{ required: true, message: "请输入验证码" }]}
            >
              <Input.OTP length={6} />
            </Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              完成注册
            </Button>
            <Button type="link" onClick={() => setStep(0)} block>
              返回上一步
            </Button>
          </Form>
        )}
        <div style={{ marginTop: 16 }}>
          <Link to="/login">已有账户？去登录</Link>
        </div>
      </Card>
    </div>
  );
}
