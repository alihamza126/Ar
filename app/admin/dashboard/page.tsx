// app/admin/dashboard/page.tsx
"use client"

import DashboardStats from '../../components/DashboardStats';
import RecentActivities from '../../components/RecentActivities';
import { Card, Row, Col } from 'antd';

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <DashboardStats />
      
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={16}>
          <Card title="Recent Book Issues">
            <RecentActivities type="borrows" limit={5} />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Pending Approvals">
            <RecentActivities type="events" status="pending" limit={5} />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="Overdue Books">
            <RecentActivities type="borrows" status="overdue" limit={10} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
