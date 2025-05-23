// app/components/BookIssueForm.tsx
"use client"
import { Form, Select, DatePicker, Button, message, Spin } from 'antd';
import { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

interface BookCopy {
  _id: string;
  barcode: string;
  book: {
    title: string;
  };
}

interface User {
  _id: string;
  username: string;
}

interface BookIssueFormValues {
  bookCopy: string;
  user: string;
  dueDate: dayjs.Dayjs;
}

const BookIssueForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [availableCopies, setAvailableCopies] = useState<BookCopy[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [copiesRes, usersRes] = await Promise.all([
          axios.get('/api/admin/bookcopy', { params: { status: 'available' } }),
          axios.get('/api/admin/user')
        ]);
        console.log(copiesRes, usersRes);
        setAvailableCopies(copiesRes.data.data);
        setUsers(usersRes.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (values: BookIssueFormValues) => {
    try {
      setLoading(true);
      await axios.post('/api/admin/borrows', {
        bookCopy: values.bookCopy,
        user: values.user,
        dueDate: values.dueDate
      });
      message.success('Book issued successfully');
      form.resetFields();

      // Refresh available copies
      const res = await axios.get('/api/admin/bookcopy', { params: { status: 'available' } });
      setAvailableCopies(res.data.data);
    } catch (error) {
      console.error('Error issuing book:', error);
      message.error('Failed to issue book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
        style={{ maxWidth: 600 }}
      >
        <Form.Item
          name="user"
          label="Select User"
          rules={[{ required: true, message: 'Please select a user' }]}
        >
          <Select
            showSearch
            optionFilterProp="children"
            placeholder="Search users"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={users.map(user => ({
              value: user._id,
              label: user.username
            }))}
          />
        </Form.Item>

        <Form.Item
          name="bookCopy"
          label="Select Book Copy"
          rules={[{ required: true, message: 'Please select a book copy' }]}
        >
          <Select
            showSearch
            optionFilterProp="children"
            placeholder="Search available books"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={availableCopies.map(copy => ({
              value: copy._id,
              label: `${copy.book.title} (${copy.barcode})`
            }))}
          />
        </Form.Item>

        <Form.Item
          name="dueDate"
          label="Due Date"
          rules={[{ required: true, message: 'Please select due date' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            disabledDate={(current) => {
              return current && current < dayjs().endOf('day');
            }}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Issue Book
          </Button>
        </Form.Item>
      </Form>
    </Spin>
  );
};

export default BookIssueForm;
