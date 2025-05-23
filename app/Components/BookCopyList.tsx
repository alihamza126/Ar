"use client"
import { useState, useEffect, useCallback } from 'react';
import { Table, Input, Button, Space, Card, Row, Col, Tag, message, Select } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { TablePaginationConfig, SorterResult, FilterValue } from 'antd/es/table/interface';
import axios from 'axios';
import { BookCopy } from '@/interfaces/BookCopy';
import BookCopyForm from './BookCopyForm';
// import dynamic from '@node_modules/next/dynamic';
// const BookCopyForm = dynamic(() => import('./BookCopyForm'), { 
//   ssr: false 
// });


interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: string;
  sortOrder?: string;
  search?: string;
}

const BookCopyList = () => {
  const [data, setData] = useState<BookCopy[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
    },
    sortField: 'barcode',
    sortOrder: 'ascend',
  });
  const [searchText, setSearchText] = useState('');
  const [selectedBookCopy, setSelectedBookCopy] = useState<BookCopy | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const statusColors = {
    available: 'green',
    issued: 'volcano',
    reserved: 'geekblue',
    damaged: 'red'
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: tableParams.pagination?.current,
        limit: tableParams.pagination?.pageSize,
        sort: tableParams.sortField,
        order: tableParams.sortOrder,
        search: searchText,
        status: statusFilter
      };

      const response = await axios.get('/api/admin/bookcopy', { params });
      
      setData(response.data.data);
      setTableParams({
        ...tableParams,
        pagination: {
          ...tableParams.pagination,
          total: response.data.pagination.total,
        },
      });
    } catch (error) {
      console.error('Error fetching book copies:', error);
      message.error('Failed to fetch book copies');
    } finally {
      setLoading(false);
    }
  }, [tableParams.pagination?.current, tableParams.pagination?.pageSize, tableParams.sortField, tableParams.sortOrder, searchText, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<BookCopy> | SorterResult<BookCopy>[]
  ) => {
    const sortField = Array.isArray(sorter) 
      ? sorter[0]?.field?.toString() 
      : sorter?.field?.toString();
    
    const sortOrder = Array.isArray(sorter)
      ? sorter[0]?.order?.toString()
      : sorter?.order?.toString();
  
    setTableParams(prev => ({
      ...prev,
      pagination,
      sortField,
      sortOrder,
    }));
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setTableParams({
      ...tableParams,
      pagination: {
        ...tableParams.pagination,
        current: 1,
      },
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/admin/bookcopy/${id}`);
      message.success('Book copy deleted successfully');
      fetchData();
    } catch (error) {
      console.log(error)
      message.error('Failed to delete book copy');
    }
  };

  const columns = [
    {
      title: 'Barcode',
      dataIndex: 'barcode',
      key: 'barcode',
      sorter: true,
    },
    {
      title: 'Book Title',
      dataIndex: ['book', 'title'],
      key: 'book.title',
      sorter: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status as keyof typeof statusColors]}>
          {status.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Available', value: 'available' },
        { text: 'Issued', value: 'issued' },
        { text: 'Reserved', value: 'reserved' },
        { text: 'Damaged', value: 'damaged' },
      ],
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text: any, record: BookCopy) => (
        
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => {
              setSelectedBookCopy(record);
              setFormVisible(true);
            }}
          />
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record._id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Book Copies Management"
      extra={
        <Button 
          type="primary" 
          onClick={() => {
            setSelectedBookCopy(null);
            setFormVisible(true);
          }}
        >
          Add New Book Copy
        </Button>
      }
    >
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Input
            placeholder="Search by barcode or book title"
            prefix={<SearchOutlined />}
            allowClear
            onChange={(e) => handleSearch(e.target.value)}
          />
        </Col>
        <Col span={8}>
          <Select
            placeholder="Filter by status"
            allowClear
            style={{ width: '100%' }}
            onChange={(value) => setStatusFilter(value)}
            options={[
              { value: 'available', label: 'Available' },
              { value: 'issued', label: 'Issued' },
              { value: 'reserved', label: 'Reserved' },
              { value: 'damaged', label: 'Damaged' },
            ]}
          />
        </Col>
      </Row>

      <Table
        columns={columns}
        rowKey={(record) => record._id}
        dataSource={data}
        pagination={tableParams.pagination}
        loading={loading}
        onChange={handleTableChange}
        scroll={{ x: true }}
      />

      <BookCopyForm
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        bookCopy={selectedBookCopy}
        refreshData={fetchData}
      />
    </Card>
  );
};

export default BookCopyList;
