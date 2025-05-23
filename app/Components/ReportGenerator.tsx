// app/components/ReportGenerator.tsx
"use client"
import { Card, Form, DatePicker, Button, Select, Table, Space, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface ReportGeneratorProps {
  type: 'books' | 'users' | 'transactions' | 'fines';
}

const ReportGenerator = ({ type }: ReportGeneratorProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);

  const generateReport = async (values: any) => {
    setLoading(true);
    try {
      const params = {
        startDate: values.dateRange?.[0]?.toISOString(),
        endDate: values.dateRange?.[1]?.toISOString(),
        ...(values.status && { status: values.status })
      };

      const res = await axios.get(`/api/admin/reports/${type}`, { params });
      setReportData(res.data.data);
      
      // Dynamically set columns based on report type
      setColumns(getColumnsForType(type));
      
      message.success('Report generated successfully');
    } catch (error) {
      message.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    // Implement CSV/PDF download logic
    message.info('Export functionality will be implemented here');
  };

  const getColumnsForType = (reportType: string) => {
    const commonColumns = [
      { title: 'ID', dataIndex: '_id', key: 'id' },
      { title: 'Created Date', dataIndex: 'createdAt', key: 'createdAt', 
        render: (date: string) => dayjs(date).format('YYYY-MM-DD') }
    ];

    switch(reportType) {
      case 'books':
        return [
          ...commonColumns,
          { title: 'Title', dataIndex: 'title', key: 'title' },
          { title: 'Author', dataIndex: 'author', key: 'author' },
          { title: 'ISBN', dataIndex: 'isbn', key: 'isbn' },
          { title: 'Status', dataIndex: 'status', key: 'status' }
        ];
      case 'users':
        return [
          ...commonColumns,
          { title: 'Username', dataIndex: 'username', key: 'username' },
          { title: 'Email', dataIndex: 'email', key: 'email' },
          { title: 'Role', dataIndex: ['role', 'name'], key: 'role' },
          { title: 'Status', dataIndex: 'status', key: 'status' }
        ];
      case 'transactions':
        return [
          ...commonColumns,
          { title: 'User', dataIndex: ['user', 'username'], key: 'user' },
          { title: 'Book', dataIndex: ['bookCopy', 'book', 'title'], key: 'book' },
          { title: 'Status', dataIndex: 'status', key: 'status' },
          { title: 'Due Date', dataIndex: 'dueDate', key: 'dueDate',
            render: (date: string) => dayjs(date).format('YYYY-MM-DD') }
        ];
      case 'fines':
        return [
          ...commonColumns,
          { title: 'User', dataIndex: ['user', 'username'], key: 'user' },
          { title: 'Amount', dataIndex: 'amount', key: 'amount' },
          { title: 'Status', dataIndex: 'status', key: 'status' }
        ];
      default:
        return commonColumns;
    }
  };

  const getStatusOptions = () => {
    switch(type) {
      case 'books':
        return ['available', 'issued', 'reserved', 'damaged'];
      case 'users':
        return ['active', 'inactive', 'suspended'];
      case 'transactions':
        return ['active', 'returned', 'overdue'];
      case 'fines':
        return ['paid', 'unpaid'];
      default:
        return [];
    }
  };

  return (
    <Card title={`${type.charAt(0).toUpperCase() + type.slice(1)} Report`}>
      <Form form={form} onFinish={generateReport} layout="vertical">
        <Form.Item label="Date Range" name="dateRange">
          <RangePicker style={{ width: '100%' }} />
        </Form.Item>
        
        {getStatusOptions().length > 0 && (
          <Form.Item label="Status" name="status">
            <Select placeholder="Select status">
              {getStatusOptions().map(status => (
                <Option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}
        
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              Generate Report
            </Button>
            <Button 
              icon={<DownloadOutlined />} 
              onClick={downloadReport}
              disabled={reportData.length === 0}
            >
              Export
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {reportData.length > 0 && (
        <Table
          columns={columns}
          dataSource={reportData}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          style={{ marginTop: 20 }}
        />
      )}
    </Card>
  );
};

export default ReportGenerator;
