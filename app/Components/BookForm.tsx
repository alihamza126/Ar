"use client"
import { useState, useEffect } from 'react';
import { Form, Input, Modal, InputNumber, message } from 'antd';
import axios from 'axios';
import { Book } from '@interfaces/Book';

interface BookFormProps {
  visible: boolean;
  onClose: () => void;
  book?: Book | null;
  refreshData: () => void;
}

const BookForm = ({ visible, onClose, book, refreshData }: BookFormProps) => {
  const [bookForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false); // Add mounted state
  useEffect(() => {
    setMounted(true); // Set mounted to true when component mounts
    return () => setMounted(false); // Cleanup
  }, []);
  useEffect(() => {
    if (visible && mounted) { // Only set fields when mounted and visible
      if (book) {
        bookForm.setFieldsValue(book);
      } else {
        bookForm.resetFields();
        bookForm.setFieldsValue({
          publicationYear: new Date().getFullYear()
        });
      }
    }
  }, [book, bookForm, visible, mounted]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (book) {
        await axios.patch(`/api/admin/book/${book._id}`, values);
        message.success('Book updated successfully');
      } else {
        await axios.post('/api/admin/book/create', values);
        message.success('Book created successfully');
      }
      refreshData();
      onClose();
    } catch (error) {
      console.log(error)
      message.error('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={book ? 'Edit Book' : 'Create New Book'}
      open={visible}
      onCancel={() => {
        bookForm.resetFields();
        onClose();
      }}
      onOk={() => bookForm.submit()}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form
        form={bookForm}
        layout="vertical"
        onFinish={handleSubmit}
        // initialValues={{
        //   publicationYear: new Date().getFullYear()
        // }}
        preserve={false}
      >
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: 'Please enter title' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Author"
          name="author"
          rules={[{ required: true, message: 'Please enter author' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="ISBN"
          name="isbn"
          rules={[{ required: true, message: 'Please enter ISBN' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Genre"
          name="genre"
          rules={[{ required: true, message: 'Please enter genre' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Publication Year"
          name="publicationYear"
          rules={[{ required: true, message: 'Please enter publication year' }]}
        >
          <InputNumber min={1900} max={new Date().getFullYear()} />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BookForm;
