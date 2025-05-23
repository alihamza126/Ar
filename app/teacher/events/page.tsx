// app/events/page.tsx
"use client";
import React, { useEffect, useState } from 'react';
import { Card, Form, Input, DatePicker, Select, Button, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';

const { TextArea } = Input;
const { Option } = Select;

interface EventItem {
  _id: string;
  title: string;
  description?: string;
  eventDate: string;
  eventType: string;
  status: string;
  createdBy: { username: string };
}

export default function EventsPage() {
  const [form] = Form.useForm();
  const [events, setEvents] = useState<EventItem[]>([]);

  const fetchEvents = async () => {
    try {
      const res = await axios.get('/api/teacher/events');
      setEvents(res.data);
    } catch {
      message.error('Failed to load events');
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const onFinish = async (values: any) => {
    try {
      await axios.post('/api/teacher/events', {
        title: values.title,
        description: values.description,
        eventDate: values.eventDate.toISOString(),
        eventType: values.eventType,
      });
      message.success('Event created'); form.resetFields(); fetchEvents();
    } catch {
      message.error('Failed to create event');
    }
  };

  const columns: ColumnsType<EventItem> = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Date', dataIndex: 'eventDate', key: 'eventDate', render: d => new Date(d).toLocaleString() },
    { title: 'Type', dataIndex: 'eventType', key: 'eventType' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: s => <Tag color={s === 'approved'? 'green': s === 'pending'? 'orange':'red'}>{s.toUpperCase()}</Tag> },
    { title: 'Created By', dataIndex: ['createdBy','username'], key: 'createdBy' },
  ];

  return (
    <div style={{ maxWidth: 1280, margin: 'auto', padding: 24 }}>
      <Card title="Create Event" style={{ marginBottom: 24 }}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="Description"><TextArea rows={3} /></Form.Item>
          <Form.Item name="eventDate" label="Event Date" rules={[{ required: true }]}><DatePicker showTime style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="eventType" label="Event Type" rules={[{ required: true }]}>
            <Select placeholder="Select type"><Option value="seminar">Seminar</Option><Option value="workshop">Workshop</Option><Option value="other">Other</Option></Select>
          </Form.Item>
          <Form.Item><Button type="primary" htmlType="submit">Create Event</Button></Form.Item>
        </Form>
      </Card>
      <Card title="Events List">
        <Table columns={columns} dataSource={events} rowKey="_id" />
      </Card>
    </div>
  );
}
