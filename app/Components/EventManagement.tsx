// app/components/EventManagement.tsx
"use client"
import { Table, Button, Tag, Space, Modal, Form, Input, DatePicker, Select, message } from 'antd';
import { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

interface Event {
  _id: string;
  title: string;
  description: string;
  eventDate: string;
  eventType: string;
  status: string;
  approvedBy?: {
    username: string;
  };
}

const EventManagement = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/events');
      setEvents(res.data.data);
    } catch (error) {
      message.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await axios.patch(`/api/admin/events/${id}/approve`);
      message.success('Event approved successfully');
      fetchEvents();
    } catch (error) {
      message.error('Failed to approve event');
    }
  };
  const handleDelete = async (id: string) => {
    try {
      await axios.patch(`/api/admin/events/${id}/delete`);
      message.success('Event Deleted !');
      fetchEvents();
    } catch (error) {
      message.error('Failed to delete event');
    }
  };


  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await axios.post('/api/admin/events', {
        ...values,
        eventDate: values.eventDate.toISOString()
      });
      message.success('Event created successfully');
      setModalVisible(false);
      fetchEvents();
      form.resetFields();
    } catch (error) {
      message.error('Failed to create event');
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Type',
      dataIndex: 'eventType',
      key: 'eventType',
      render: (type: string) => (
        <Tag color={type === 'seminar' ? 'blue' : type === 'workshop' ? 'green' : 'orange'}>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'eventDate',
      key: 'date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'approved' ? 'green' : status === 'pending' ? 'orange' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Event) => (
        <Space size="middle">
          {record.status === 'pending' && (
            <Button type="link" onClick={() => handleApprove(record._id)}>
              Approve
            </Button>
          )}
        </Space>
      ),
    },
    {
      title: 'Delete',
      key: 'delete',
      render: (_: any, record: Event) => (
        <Space size="middle">
          <Button type="primary" onClick={() => handleDelete(record._id)}>
            Deleted
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setModalVisible(true)}>
          Create New Event
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={events}
        loading={loading}
        rowKey="_id"
      />

      <Modal
        title="Create New Event"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        okText="Create"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please input event title!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="eventType"
            label="Event Type"
            rules={[{ required: true, message: 'Please select event type!' }]}
          >
            <Select>
              <Select.Option value="seminar">Seminar</Select.Option>
              <Select.Option value="workshop">Workshop</Select.Option>
              <Select.Option value="other">Other</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="eventDate"
            label="Event Date"
            rules={[{ required: true, message: 'Please select event date!' }]}
          >
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EventManagement;
