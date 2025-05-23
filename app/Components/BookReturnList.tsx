// app/components/BookReturnList.tsx
"use client"
import { Table, Button, Tag, Modal, Descriptions, message, Spin, Input, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

interface BorrowRecord {
  _id: string;
  user: {
    username: string;
  };
  bookCopy: {
    barcode: string;
    book: {
      title: string;
    };
  };
  issueDate: string;
  dueDate: string;
  status: string;
}

const BookReturnList = () => {
  const [borrows, setBorrows] = useState<BorrowRecord[]>([]);
  const [filteredBorrows, setFilteredBorrows] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBorrow, setSelectedBorrow] = useState<BorrowRecord | null>(null);
  const [fineAmount, setFineAmount] = useState(0);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const fetchBorrows = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/admin/borrows', { params: { status: 'active' } });
        setBorrows(res.data.data);
        setFilteredBorrows(res.data.data);
      } catch (error) {
        message.error('Failed to fetch borrow records');
      } finally {
        setLoading(false);
      }
    };
    fetchBorrows();
  }, []);

  useEffect(() => {
    const filtered = borrows.filter(borrow => 
      borrow.user.username.toLowerCase().includes(searchText.toLowerCase()) ||
      borrow.bookCopy.book.title.toLowerCase().includes(searchText.toLowerCase()) ||
      borrow.bookCopy.barcode.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredBorrows(filtered);
  }, [searchText, borrows]);

  const calculateFine = (dueDate: string) => {
    console.log('dueDate => ',dueDate)
    const today = dayjs();
    const due = dayjs(dueDate);
    console.log('today.isAfter(due) => ',today.isAfter(due))
    if (today.isAfter(due)) {
      const daysLate = today.diff(due, 'day');
      console.log('daysLate => ',daysLate)
      return Math.min(daysLate * 5, 50); // $5 per day, max $50
    }
    return 0;
  };

  const handleReturn = async () => {
    if (!selectedBorrow) return;
    
    try {
      setLoading(true);
      await axios.post(`/api/admin/borrows/${selectedBorrow._id}/return`, { 
        fineAmount: fineAmount > 0 ? fineAmount : undefined 
      });
      message.success('Book returned successfully');
      setSelectedBorrow(null);
      
      // Refresh data
      const res = await axios.get('/api/admin/borrows', { params: { status: 'active' } });
      setBorrows(res.data.data);
      setFilteredBorrows(res.data.data);
    } catch (error) {
      message.error('Failed to return book');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Book Title',
      dataIndex: ['bookCopy', 'book', 'title'],
      key: 'title'
    },
    {
      title: 'Barcode',
      dataIndex: ['bookCopy', 'barcode'],
      key: 'barcode'
    },
    {
      title: 'Borrowed By',
      dataIndex: ['user', 'username'],
      key: 'user'
    },
    {
      title: 'Issue Date',
      dataIndex: 'issueDate',
      key: 'issueDate',
      render: (date: string) => dayjs(date).format('MMM D, YYYY')
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => {
        const isOverdue = dayjs().isAfter(dayjs(date));
        return (
          <Tag color={isOverdue ? 'red' : 'green'}>
            {dayjs(date).format('MMM D, YYYY')}
            {isOverdue && ' (Overdue)'}
          </Tag>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: BorrowRecord) => (
        <Button 
          type="primary" 
          onClick={() => {
            setSelectedBorrow(record);
            setFineAmount(calculateFine(record.dueDate));
          }}
        >
          Return
        </Button>
      )
    }
  ];

  return (
    <Spin spinning={loading}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Input
          placeholder="Search by book title, barcode, or user"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 400, marginBottom: 16 }}
        />

        <Table
          columns={columns}
          dataSource={filteredBorrows}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title="Return Book"
          open={!!selectedBorrow}
          onCancel={() => setSelectedBorrow(null)}
          onOk={handleReturn}
          confirmLoading={loading}
        >
          {selectedBorrow && (
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Book Title">
                {selectedBorrow.bookCopy.book.title}
              </Descriptions.Item>
              <Descriptions.Item label="Barcode">
                {selectedBorrow.bookCopy.barcode}
              </Descriptions.Item>
              <Descriptions.Item label="Borrowed By">
                {selectedBorrow.user.username}
              </Descriptions.Item>
              <Descriptions.Item label="Due Date">
                {dayjs(selectedBorrow.dueDate).format('MMM D, YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Days Overdue">
                {Math.max(0, dayjs().diff(dayjs(selectedBorrow.dueDate), 'day'))}
              </Descriptions.Item>
              <Descriptions.Item label="Fine Amount">
                <Tag color={fineAmount > 0 ? 'red' : 'green'}>
                  ${fineAmount}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </Space>
    </Spin>
  );
};

export default BookReturnList;
