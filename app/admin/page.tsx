'use client';
import { useEffect, useState } from 'react';
import { Card, Col, Row, Spin, message } from 'antd';
import {
  BookOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';

const DashboardPage = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get('/api/admin/dashboard');
        setStats(res.data.data);
      } catch (err) {
        message.error('Failed to load dashboard summary');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const dataCards = [
    {
      title: 'Total Users',
      icon: <UserOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
      value: stats?.totalUsers ?? 0
    },
    {
      title: 'Active Users',
      icon: <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
      value: stats?.activeUsers ?? 0
    },
    {
      title: 'Total Books',
      icon: <BookOutlined style={{ fontSize: 24, color: '#fa8c16' }} />,
      value: stats?.totalBooks ?? 0
    },
    {
      title: 'Reserved Books',
      icon: <ClockCircleOutlined style={{ fontSize: 24, color: '#722ed1' }} />,
      value: stats?.reservedBooks ?? 0
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Admin Dashboard</h1>

      {loading ? (
        <Spin size="large" />
      ) : (
        <Row gutter={[24, 24]}>
          {dataCards.map(card => (
            <Col xs={24} sm={12} md={6} key={card.title}>
              <Card hoverable>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {card.icon}
                  <div>
                    <div style={{ fontSize: 16 }}>{card.title}</div>
                    <div style={{ fontSize: 22, fontWeight: 600 }}>{card.value}</div>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default DashboardPage;
