'use client';
import { useEffect, useState } from 'react';
import { Card, Col, Row, Spin, message } from 'antd';
import {
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';

const StudentDashboardPage = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentSummary = async () => {
      try {
        const res = await axios.get('/api/student/summary');
        setStats(res.data.data);
      } catch (err) {
        message.error('Failed to load student dashboard summary');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentSummary();
  }, []);

  const dataCards = [
    {
      title: 'Borrowed Books',
      icon: <BookOutlined style={{ fontSize: 24, color: '#fa8c16' }} />,
      value: stats?.borrowedBooks ?? 0
    },
    {
      title: 'Reserved Books',
      icon: <ClockCircleOutlined style={{ fontSize: 24, color: '#722ed1' }} />,
      value: stats?.reservedBooks ?? 0
    },
    {
      title: 'Student Name',
      icon: <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
      value: stats?.studentDetails?.username ?? "N/A"
    },
    {
      title: 'Student Email',
      icon: <CheckCircleOutlined style={{ fontSize:16, color: '#52c41a' }} />,
      value: stats?.studentDetails?.email ?? "N/A"
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Student Dashboard</h1>

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
                    <div style={{ fontSize: 18, fontWeight: 600 ,marginTop:8 }}>{card.value}</div>
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

export default StudentDashboardPage;
