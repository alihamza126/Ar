"use client"

import React from 'react';
import { useSession } from 'next-auth/react';
import { Card, Avatar, Typography, Divider, Descriptions, Tabs, Row, Col, Button, Space, Skeleton } from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  IdcardOutlined, 
  EditOutlined, 
  LockOutlined, 
  SettingOutlined 
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../layout';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ProfilePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      
        <Card>
          <Skeleton avatar active paragraph={{ rows: 4 }} />
        </Card>
      
    );
  }

  if (status === "unauthenticated") {
    router.push('/login');
    return null;
  }

  const user = session?.user;

  return (
      <Row gutter={[24, 24]}>
        <Col xs={24} md={24} lg={8}>
          <Card className="profile-card">
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <Avatar 
                src={user?.image || "/api/placeholder/120/120"} 
                size={120} 
                alt={user?.name || "User"}
              />
              <Title level={3} style={{ marginTop: '16px', marginBottom: '4px' }}>{user?.name}</Title>
              <Text type="secondary">{user?.role?.name || "Student"}</Text>
            </div>
            
            <Divider />
            
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Space>
                  <MailOutlined />
                  <Text strong>Email:</Text>
                </Space>
                <div style={{ marginLeft: '24px' }}>{user?.email}</div>
              </div>
              
              <div>
                <Space>
                  <IdcardOutlined />
                  <Text strong>User ID:</Text>
                </Space>
                <div style={{ marginLeft: '24px' }}>{user?.id}</div>
              </div>
              
              <div>
                <Space>
                  <UserOutlined />
                  <Text strong>Role:</Text>
                </Space>
                <div style={{ marginLeft: '24px' }}>
                  {user?.role?.name?.charAt(0).toUpperCase() + user?.role?.name?.slice(1) || "Student"}
                </div>
              </div>
            </Space>
            
            <Divider />
            
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                icon={<EditOutlined />} 
                block
                onClick={() => router.push('/profile')}
              >
                Edit Profile
              </Button>
              <Button 
                icon={<LockOutlined />} 
                block
                onClick={() => router.push('/profile?tab=security')}
              >
                Security Settings
              </Button>
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} md={24} lg={16}>
          <Card>
            <Tabs defaultActiveKey="account">
              <TabPane tab="Account Details" key="account">
                <Descriptions bordered column={{ xs: 1, sm: 2 }} layout="vertical">
                  <Descriptions.Item label="Full Name">{user?.name}</Descriptions.Item>
                  <Descriptions.Item label="Email">{user?.email}</Descriptions.Item>
                  <Descriptions.Item label="User ID">{user?.id}</Descriptions.Item>
                  <Descriptions.Item label="Role">
                    {user?.role?.name?.charAt(0).toUpperCase() + user?.role?.name?.slice(1) || "Student"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Role ID">{user?.roleId?.toString()}</Descriptions.Item>
                  <Descriptions.Item label="Account Status">
                    <Text type="success">Active</Text>
                  </Descriptions.Item>
                </Descriptions>

                <div style={{ marginTop: '24px' }}>
                  <Title level={4}>Role Permissions</Title>
                  <Text>
                    {user?.role?.name === 'admin' ? 
                      'Administrative access with full system permissions. Can manage users, courses, and system settings.' : 
                      'Student access with permissions to view courses, assignments, grades, and personal information.'}
                  </Text>
                </div>
              </TabPane>
              
              <TabPane tab="Academic Information" key="academic">
                <div style={{ padding: '20px 0' }}>
                  <Text>Academic information will be displayed here. This section can include:</Text>
                  <ul>
                    <li>Current program/major</li>
                    <li>Academic advisor</li>
                    <li>Enrollment status</li>
                    <li>Year/semester</li>
                    <li>Academic standing</li>
                    <li>Credit hours completed</li>
                  </ul>
                  <Text>This section would typically be populated from your academic database.</Text>
                </div>
              </TabPane>
              
              <TabPane tab="Activity" key="activity">
                <div style={{ padding: '20px 0' }}>
                  <Text>Recent account activity will be displayed here. This section can include:</Text>
                  <ul>
                    <li>Recent logins</li>
                    <li>Course access</li>
                    <li>Assignment submissions</li>
                    <li>Forum posts</li>
                    <li>System notifications</li>
                  </ul>
                  <Text>This section would typically be populated from your activity tracking system.</Text>
                </div>
              </TabPane>
              
              <TabPane tab="Settings" key="settings">
                <div style={{ padding: '20px 0', textAlign: 'center' }}>
                  <Button 
                    type="primary" 
                    icon={<SettingOutlined />}
                    onClick={() => router.push('/profile?tab=settings')}
                    size="large"
                  >
                    Go to Full Settings Page
                  </Button>
                </div>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
  );
};

export default ProfilePage;
