import { Button, Card, Col, Row, Typography } from 'antd';
import {
  RocketOutlined,
  EnvironmentOutlined,
  SafetyCertificateOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const features = [
  {
    icon: <RocketOutlined style={{ fontSize: 24, color: '#4F6EF7' }} />,
    title: '极速配送',
    desc: '自动驾驶机器人 & 无人机，最快 28 分钟送达',
  },
  {
    icon: <EnvironmentOutlined style={{ fontSize: 24, color: '#10B981' }} />,
    title: '全程可视',
    desc: '实时追踪配送位置，订单状态一目了然',
  },
  {
    icon: <SafetyCertificateOutlined style={{ fontSize: 24, color: '#F59E0B' }} />,
    title: '安全保障',
    desc: '全程加密传输，包裹安全有保障',
  },
];

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #4F6EF7 0%, #3B5BDB 100%)',
          borderRadius: 16,
          padding: '48px 40px',
          marginBottom: 32,
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decoration */}
        <div
          style={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -60,
            right: 80,
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
          }}
        />

        <Title
          level={1}
          style={{
            color: '#fff',
            margin: '0 0 12px',
            fontSize: 36,
            fontWeight: 700,
            letterSpacing: -1,
          }}
        >
          智能自治配送
        </Title>
        <Paragraph
          style={{
            color: 'rgba(255,255,255,0.80)',
            fontSize: 16,
            marginBottom: 32,
            maxWidth: 480,
          }}
        >
          通过自动驾驶机器人与无人机，实现城市内快速、安全、低碳的包裹配送。
        </Paragraph>
        <Button
          type="default"
          size="large"
          icon={<ArrowRightOutlined />}
          iconPosition="end"
          onClick={() => navigate('/order')}
          style={{
            background: '#fff',
            color: '#4F6EF7',
            border: 'none',
            fontWeight: 600,
            borderRadius: 10,
            height: 44,
            paddingInline: 24,
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          }}
        >
          立即下单
        </Button>
      </div>

      {/* Feature Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        {features.map((f) => (
          <Col xs={24} sm={8} key={f.title}>
            <Card
              style={{ height: '100%' }}
              styles={{ body: { padding: '24px' } }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  background: '#F4F6FD',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                {f.icon}
              </div>
              <Title level={5} style={{ margin: '0 0 6px', color: '#1A1D2E' }}>
                {f.title}
              </Title>
              <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.6 }}>
                {f.desc}
              </Text>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Quick links */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card
            hoverable
            onClick={() => navigate('/history')}
            style={{ cursor: 'pointer' }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Title level={5} style={{ margin: '0 0 4px', color: '#1A1D2E' }}>
                  订单历史
                </Title>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  查看所有历史配送记录
                </Text>
              </div>
              <ArrowRightOutlined style={{ color: '#6B7280', fontSize: 16 }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card
            hoverable
            onClick={() => navigate('/profile')}
            style={{ cursor: 'pointer' }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Title level={5} style={{ margin: '0 0 4px', color: '#1A1D2E' }}>
                  个人资料
                </Title>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  管理账户信息与偏好设置
                </Text>
              </div>
              <ArrowRightOutlined style={{ color: '#6B7280', fontSize: 16 }} />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
