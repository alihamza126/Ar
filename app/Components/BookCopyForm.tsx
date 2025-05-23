"use client"
import { useState, useEffect } from 'react';
import { Form, Input, Modal, Select, message } from 'antd';
import axios from 'axios';
import { BookCopy } from '@interfaces/BookCopy';

interface BookCopyFormProps {
  visible: boolean;
  onClose: () => void;
  bookCopy?: BookCopy | null;
  refreshData: () => void;
}

interface Book {
  _id: string;
  title: string;
}

interface BookCopyFormValues {
  book: string;
  status: 'available' | 'issued' | 'maintenance';
  location?: string;
  notes?: string;
}

const BookCopyForm = ({ visible, onClose, bookCopy, refreshData }: BookCopyFormProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get('/api/admin/book', {
          params: { limit: 1000 }
        });
        setBooks(response.data.data);
      } catch (error) {
        console.log(error)
        message.error('Failed to fetch books');
      }
    };

    if (mounted) {
      fetchBooks();
    }
  }, [mounted]);

  useEffect(() => {
    if (visible && mounted) {
      if (bookCopy) {
        form.setFieldsValue({
          ...bookCopy,
          book: bookCopy.book._id
        });
      } else {
        form.resetFields();
      }
    }
  }, [bookCopy, form, visible, mounted]);

  const handleSubmit = async (values: BookCopyFormValues) => {
    setLoading(true);
    try {
      if (bookCopy) {
        await axios.patch(`/api/admin/bookcopy/${bookCopy._id}`, values);
        message.success('Book copy updated successfully');
      } else {
        await axios.post('/api/admin/bookcopy/create', values);
        message.success('Book copy created successfully');
      }
      refreshData();
      onClose();
    } catch (error) {
      console.error('Error submitting book copy:', error);
      message.error('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={bookCopy ? 'Edit Book Copy' : 'Create New Book Copy'}
      open={visible}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={() => form.submit()}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        preserve={false}
      >
        <Form.Item
          label="Book"
          name="book"
          rules={[{ required: true, message: 'Please select a book' }]}
        >
          <Select
            showSearch
            optionFilterProp="label"
            options={books.map(book => ({
              value: book._id,
              label: book.title
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Barcode"
          name="barcode"
          rules={[{ required: true, message: 'Please enter barcode' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Status"
          name="status"
          rules={[{ required: true, message: 'Please select status' }]}
        >
          <Select
            options={[
              { value: 'available', label: 'Available' },
              { value: 'issued', label: 'Issued' },
              { value: 'reserved', label: 'Reserved' },
              { value: 'damaged', label: 'Damaged' },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Location"
          name="location"
          rules={[{ required: true, message: 'Please enter location' }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BookCopyForm;
