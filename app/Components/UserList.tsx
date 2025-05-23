// app/components/UserList.tsx
"use client"
import { Table, Button, Tag, Space, Input, Card, Popconfirm, message } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import axios from 'axios';
import UserForm from './UserForm';


interface User {
  _id: string;
  username: string;
  email: string;
  role: {
    name: string;
  };
  status: string;
}

const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formVisible, setFormVisible] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = searchText ? { search: searchText } : {};
      const response = await axios.get('/api/admin/user', { params });
      setUsers(response.data.data);
    } catch (error) {
      message.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchText]);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/admin/user/${id}`);
      message.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      message.error('Failed to delete user');
    }
  };

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: ['role', 'name'],
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'red' : role === 'librarian' ? 'blue' : 'green'}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => {
              setSelectedUser(record);
              setFormVisible(true);
            }}
          />
          <Popconfirm
            title="Are you sure to delete this user?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="User Management"
      extra={
        <Button 
          type="primary" 
          onClick={() => {
            setSelectedUser(null);
            setFormVisible(true);
          }}
        >
          Add New User
        </Button>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search by username or email"
          prefix={<SearchOutlined />}
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={users}
        loading={loading}
        rowKey="_id"
        scroll={{ x: true }}
      />

      <UserForm
        visible={formVisible}
        onClose={() => {
          setFormVisible(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        refreshData={fetchUsers}
      />
    </Card>
  );
};

export default UserList;
