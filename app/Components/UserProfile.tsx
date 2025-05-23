// app/components/UserProfile.tsx
"use client"
import { Card, Descriptions, Form, Input, Button, Select, Tag, Avatar, message, Tabs, Table } from 'antd';
import { UserOutlined, EditOutlined, LockOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

interface UserData {
  _id: string;
  username: string;
  email: string;
  image?: string;
  role: {
    _id: string;
    name: string;
  };
  status: string;
  createdAt: string;
  borrows?: Array<{
    _id: string;
    bookCopy: {
      book: {
        title: string;
      };
      barcode: string;
    };
    issueDate: string;
    dueDate: string;
    status: string;
  }>;
  fines?: Array<{
    _id: string;
    amount: number;
    status: string;
    borrow: {
      bookCopy: {
        book: {
          title: string;
        };
      };
    };
  }>;
}

const UserProfile = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/profile');
        setUser(res.data);
        form.setFieldsValue({
          email: res.data.email,
          username: res.data.username
        });
      } catch (error) {
        message.error('Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [form]);

  const handleProfileUpdate = async (values: any) => {
    try {
      await axios.patch('/api/profile', values);
      message.success('Profile updated successfully');
      // Refresh user data
      const res = await axios.get('/api/profile');
      setUser(res.data);
    } catch (error) {
      message.error('Failed to update profile');
    }
  };

  const handlePasswordChange = async (values: any) => {
    try {
      await axios.patch('/api/profile', values);
      message.success('Password changed successfully');
      form.setFieldsValue({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      message.error('Failed to change password');
    }
  };

  if (!user) return <div>Loading...</div>;

  const isAdmin = user.role.name === 'admin';
  const isLibrarian = user.role.name === 'teacher';
  const isStudent = user.role.name === 'student';

  const tabItems = [
    {
      key: 'profile',
      label: 'Profile',
      children: (
        <div className="profile-section">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
            <Avatar 
              size={64} 
              src={user.image} 
              icon={<UserOutlined />} 
              style={{ marginRight: 16 }}
            />
            <div>
              <h2>{user.username}</h2>
              <Tag color={user.status === 'active' ? 'green' : 'red'}>
                {user.status.toUpperCase()}
              </Tag>
              <Tag color="blue">{user.role.name.toUpperCase()}</Tag>
            </div>
          </div>

          <Descriptions bordered column={1}>
            <Descriptions.Item label="Username">{user.username}</Descriptions.Item>
            <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
            <Descriptions.Item label="Member Since">
              {dayjs(user.createdAt).format('MMMM D, YYYY')}
            </Descriptions.Item>
          </Descriptions>

          <Card title="Update Profile" style={{ marginTop: 24 }}>
            <Form form={form} onFinish={handleProfileUpdate} layout="vertical">
              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true, message: 'Please input your username!' }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email!' }
                ]}
              >
                <Input />
              </Form.Item>
              <Button type="primary" htmlType="submit" icon={<EditOutlined />}>
                Update Profile
              </Button>
            </Form>
          </Card>
        </div>
      )
    },
    {
      key: 'security',
      label: 'Security',
      children: (
        <Card title="Change Password">
          <Form onFinish={handlePasswordChange} layout="vertical">
            <Form.Item
              name="currentPassword"
              label="Current Password"
              rules={[{ required: true, message: 'Please input your current password!' }]}
            >
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>
            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[{ required: true, message: 'Please input your new password!' }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="Confirm New Password"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Please confirm your new password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject('The two passwords do not match!');
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Button type="primary" htmlType="submit" icon={<LockOutlined />}>
              Change Password
            </Button>
          </Form>
        </Card>
      )
    }
  ];

  if (isStudent) {
    tabItems.push({
      key: 'borrows',
      label: 'My Borrows',
      children: (
        <Card title="My Borrowed Books">
          {user.borrows?.length ? (
            <Table
              columns={[
                { title: 'Book', dataIndex: ['bookCopy', 'book', 'title'] },
                { title: 'Barcode', dataIndex: ['bookCopy', 'barcode'] },
                { 
                  title: 'Issued Date', 
                  dataIndex: 'issueDate',
                  render: date => dayjs(date).format('MMM D, YYYY')
                },
                { 
                  title: 'Due Date', 
                  dataIndex: 'dueDate',
                  render: date => dayjs(date).format('MMM D, YYYY')
                },
                { 
                  title: 'Status', 
                  dataIndex: 'status',
                  render: status => (
                    <Tag color={status === 'active' ? 'blue' : status === 'overdue' ? 'red' : 'green'}>
                      {status.toUpperCase()}
                    </Tag>
                  )
                }
              ]}
              dataSource={user.borrows}
              rowKey="_id"
            />
          ) : (
            <p>You have no borrowed books</p>
          )}
        </Card>
      )
    });

    tabItems.push({
      key: 'fines',
      label: 'My Fines',
      children: (
        <Card title="My Fines">
          {user.fines?.length ? (
            <Table
              columns={[
                { title: 'Book', dataIndex: ['borrow', 'bookCopy', 'book', 'title'] },
                { title: 'Amount', dataIndex: 'amount', render: amt => `$${amt}` },
                { 
                  title: 'Status', 
                  dataIndex: 'status',
                  render: status => (
                    <Tag color={status === 'paid' ? 'green' : 'red'}>
                      {status.toUpperCase()}
                    </Tag>
                  )
                }
              ]}
              dataSource={user.fines}
              rowKey="_id"
            />
          ) : (
            <p>You have no fines</p>
          )}
        </Card>
      )
    });
  }

  if (isAdmin || isLibrarian) {
    tabItems.push({
      key: 'actions',
      label: isAdmin ? 'Admin Actions' : 'Librarian Actions',
      children: (
        <Card title={isAdmin ? 'Admin Tools' : 'Librarian Tools'}>
          {isAdmin && (
            <div style={{ display: 'flex', gap: 16 }}>
              <Button type="primary">Manage Users</Button>
              <Button>System Settings</Button>
            </div>
          )}
          {(isAdmin || isLibrarian) && (
            <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
              <Button type="primary">Issue Books</Button>
              <Button>Process Returns</Button>
              <Button>Manage Fines</Button>
            </div>
          )}
        </Card>
      )
    });
  }

  return (
    <div className="user-profile">
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab} 
        items={tabItems}
        tabPosition="left"
      />
    </div>
  );
};

export default UserProfile;
