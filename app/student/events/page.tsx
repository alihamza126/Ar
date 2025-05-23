'use client';
import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';

export interface StudentEvent {
  _id: string;
  title: string;
  description?: string;
  eventDate: string;
  eventType: string;
  status: string;
  createdBy: { username: string };
}

const statusColorMap: Record<string, string> = {
  pending: 'orange',
  reject: 'red',
  approved: 'green',
  cancelled: 'red',
};

export default function StudentEventsPage() {
  const [events, setEvents] = useState<StudentEvent[]>([]);

  const fetchEvents = async () => {
    try {
      const { data } = await axios.get<StudentEvent[]>('/api/student/events');
      setEvents(data);
    } catch (error) {
      console.error(error);
      message.error('Failed to load events');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const columns: ColumnsType<StudentEvent> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => text || '—',
    },
    {
      title: 'Date',
      dataIndex: 'eventDate',
      key: 'eventDate',
      render: (date) => new Date(date).toLocaleString(),
      sorter: (a, b) =>
        new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime(),
    },
    {
      title: 'Type',
      dataIndex: 'eventType',
      key: 'eventType',
      filters: [
        { text: 'Workshop', value: 'workshop' },
        { text: 'Seminar', value: 'seminar' },
        // add other types here
      ],
      onFilter: (value, record) => record.eventType === value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColorMap[status.toLowerCase()] || 'default'}>
          {status.toUpperCase()}
        </Tag>
      ),
      filters: Object.keys(statusColorMap).map((key) => ({
        text: key.charAt(0).toUpperCase() + key.slice(1),
        value: key,
      })),
      onFilter: (value, record) =>
        record.status.toLowerCase() === (value as string),
    },
    {
      title: 'Created By',
      dataIndex: ['createdBy', 'username'],
      key: 'createdBy',
    },
  ];

  return (
    <div style={{ maxWidth: 1280, margin: 'auto', padding: 24 }}>
      <Card title="Upcoming Events">
        <Table<StudentEvent>
          columns={columns}
          dataSource={events}
          rowKey="_id"
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
}
