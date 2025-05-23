// app/components/UserForm.tsx
"use client"
import { Modal, Form, Input, Select, message } from 'antd';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface UserFormProps {
  visible: boolean;
  onClose: () => void;
  user?: any;
  refreshData: () => void;
}

interface Role {
  _id: string;
  name: string;
}

const UserForm = ({ visible, onClose, user, refreshData }: UserFormProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get('/api/admin/role');
        setRoles(response.data.data);
      } catch (error) {
        message.error('Failed to fetch roles');
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    if (visible) {
      if (user) {
        form.setFieldsValue({
          ...user,
          role: user.role._id
        });
      } else {
        form.resetFields();
      }
    }
  }, [user, form, visible]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (user) {
        await axios.patch(`/api/admin/user/${user._id}`, values);
        message.success('User updated successfully');
      } else {
        await axios.post('/api/admin/user', values);
        message.success('User created successfully');
      }
      refreshData();
      onClose();
    } catch (error) {
      message.error('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={user ? 'Edit User' : 'Create New User'}
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: 'Please input username!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please input email!' },
            { type: 'email', message: 'Please enter a valid email!' }
          ]}
        >
          <Input />
        </Form.Item>

        {!user && (
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please input password!' }]}
          >
            <Input.Password />
          </Form.Item>
        )}

        <Form.Item
          name="role"
          label="Role"
          rules={[{ required: true, message: 'Please select role!' }]}
        >
          <Select
            options={roles.map(role => ({
              value: role._id,
              label: role.name.toUpperCase()
            }))}
          />
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          initialValue="active"
          rules={[{ required: true }]}
        >
          <Select
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserForm;
