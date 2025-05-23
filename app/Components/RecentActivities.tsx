// app/components/RecentActivities.tsx
"use client"
import { Table, Tag } from 'antd';
import { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

interface Book {
  title: string;
}

interface User {
  username: string;
}

interface BookCopy {
  book: Book;
  barcode: string;
}

interface BorrowActivity {
  _id: string;
  bookCopy: BookCopy;
  user: User;
  dueDate: string;
  status: 'active' | 'overdue' | 'returned';
}

interface EventActivity {
  _id: string;
  title: string;
  eventType: string;
  eventDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

type ActivityData = BorrowActivity | EventActivity;

interface RecentActivitiesProps {
  type: 'borrows' | 'events';
  status?: string;
  limit?: number;
}

const RecentActivities = ({ type, status, limit = 5 }: RecentActivitiesProps) => {
  const [data, setData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params: { limit: number; status?: string } = { limit };
        if (status) params.status = status;
        
        const res = await axios.get(`/api/admin/${type}`, { params });
        setData(res.data.data);
      } catch (error) {
        console.error(`Failed to fetch ${type}:`, error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [type, status, limit]);

  const borrowColumns = [
    { title: 'Book', dataIndex: ['bookCopy', 'book', 'title'] },
    { title: 'User', dataIndex: ['user', 'username'] },
    { 
      title: 'Due Date', 
      dataIndex: 'dueDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY')
    },
    { 
      title: 'Status', 
      dataIndex: 'status',
      render: (status: 'active' | 'overdue' | 'returned') => (
        <Tag color={status === 'active' ? 'blue' : status === 'overdue' ? 'red' : 'green'}>
          {status.toUpperCase()}
        </Tag>
      )
    }
  ];

  const eventColumns = [
    { title: 'Title', dataIndex: 'title' },
    { title: 'Type', dataIndex: 'eventType' },
    { 
      title: 'Date', 
      dataIndex: 'eventDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY')
    },
    { 
      title: 'Status', 
      dataIndex: 'status',
      render: (status: 'pending' | 'approved' | 'rejected') => (
        <Tag color={status === 'pending' ? 'orange' : status === 'approved' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      )
    }
  ];

  return (
    <Table<ActivityData>
      columns={type === 'borrows' ? borrowColumns : eventColumns}
      dataSource={data}
      loading={loading}
      rowKey="_id"
      pagination={false}
      size="small"
    />
  );
};

export default RecentActivities;
