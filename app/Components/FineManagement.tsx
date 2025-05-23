// app/components/FineManagement.tsx
"use client"
import { Table, Button, Tag, Badge, Space, Card, Typography, Input, DatePicker, Select, message } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface Fine {
  _id: string;
  user: {
    _id: string;
    username: string;
  };
  borrow: {
    _id: string;
    bookCopy: {
      book: {
        title: string;
      };
    };
    dueDate: string;
  };
  amount: number;
  status: string;
  createdAt: string;
  paidDate?: string;
}

type DateRangeType = [Dayjs | null, Dayjs | null] | null;

const FineManagement = () => {
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    status: undefined as string | undefined,
    search: '',
    dateRange: null as DateRangeType
  });

  const fetchFines = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        status: filters.status,
        search: filters.search,
        startDate: filters.dateRange?.[0]?.toISOString(),
        endDate: filters.dateRange?.[1]?.toISOString()
      };

      const response = await axios.get('/api/admin/fine', { params });
      setFines(response.data.data);
      setPagination({
        ...pagination,
        total: response.data.pagination.total
      });
    } catch (error) {
      message.error('Failed to fetch fines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, [pagination.current, filters]);

  const handleStatusChange = async (id: string) => {
    try {
      await axios.post(`/api/admin/fine/${id}/pay`);
      message.success('Fine marked as paid');
      fetchFines();
    } catch (error) {
      message.error('Failed to update fine status');
    }
  };

  const handleDateRangeChange: RangePickerProps['onChange'] = (dates) => {
    setFilters({
      ...filters,
      dateRange: dates
    });
  };

  const columns = [
    {
      title: 'User',
      dataIndex: ['user', 'username'],
      key: 'user'
    },
    {
      title: 'Book',
      dataIndex: ['borrow', 'bookCopy', 'book', 'title'],
      key: 'book'
    },
    {
      title: 'Due Date',
      dataIndex: ['borrow', 'dueDate'],
      key: 'dueDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <Text strong>${amount.toFixed(2)}</Text>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'paid' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Fine) => (
        <Space>
          {record.status === 'unpaid' && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleStatusChange(record._id)}
            >
              Mark as Paid
            </Button>
          )}
          <Button size="small">Details</Button>
        </Space>
      )
    }
  ];

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          Fine Management
          <Badge
            count={fines.filter(f => f.status === 'unpaid').length}
            style={{ backgroundColor: '#f5222d', marginLeft: 8 }}
          />
        </Title>
        <div>
          <Button type="primary">Generate Report</Button>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Input.Group compact style={{ display: 'flex' }}>
          <Input
            placeholder="Search by user or book"
            style={{ width: '40%' }}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <Select
            placeholder="Filter by status"
            style={{ width: '25%' }}
            allowClear
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value })}
            options={[
              { value: 'paid', label: 'Paid' },
              { value: 'unpaid', label: 'Unpaid' }
            ]}
          />
          <RangePicker
            style={{ width: '35%' }}
            onChange={handleDateRangeChange}
          />
        </Input.Group>
      </div>

      <Table
        columns={columns}
        dataSource={fines}
        loading={loading}
        rowKey="_id"
        pagination={{
          ...pagination,
          showSizeChanger: true,
          onChange: (page, pageSize) => {
            setPagination({ ...pagination, current: page, pageSize });
          }
        }}
        scroll={{ x: true }}
      />
    </Card>
  );
};

export default FineManagement;
