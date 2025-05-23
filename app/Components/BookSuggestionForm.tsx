"use client"
import { useState } from "react"
import { Form, Input, Button, Select, DatePicker, Upload, message, Card, Typography, Space } from "antd"
import { UploadOutlined, BookOutlined } from "@ant-design/icons"
import axios from "axios"
import type { UploadFile } from "antd/es/upload/interface"

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

interface BookSuggestionFormProps {
  onSuccess?: () => void
}

const BookSuggestionForm = ({ onSuccess }: BookSuggestionFormProps) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [fileList, setFileList] = useState<UploadFile[]>([])

  const onFinish = async (values: any) => {
    setLoading(true)
    try {
      // Format the data
      const formData = {
        ...values,
        publicationYear: values.publicationYear?.year(),
        coverImage: fileList.length > 0 ? fileList[0].thumbUrl : null,
      }

      await axios.post("/api/teacher/book-suggestion", formData)
      message.success("Book suggestion submitted successfully!")
      form.resetFields()
      setFileList([])

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error submitting book suggestion:", error)
      message.error("Failed to submit book suggestion. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e
    }
    return e?.fileList
  }

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith("image/")
    if (!isImage) {
      message.error("You can only upload image files!")
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error("Image must be smaller than 2MB!")
    }
    return false // Prevent actual upload
  }

  const handleChange = ({ fileList }: { fileList: UploadFile[] }) => {
    setFileList(fileList)
  }

  return (
    <Card
      title={
        <Space>
          <BookOutlined />
          <span>Suggest a Book</span>
        </Space>
      }
      bordered={true}
    >
      <Title level={5} style={{ marginBottom: 20 }}>
        Help us improve our library collection by suggesting books you'd like to see added.
      </Title>

      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ priority: "medium" }}>
        <Form.Item name="title" label="Book Title" rules={[{ required: true, message: "Please enter the book title" }]}>
          <Input placeholder="Enter the book title" />
        </Form.Item>

        <Form.Item name="author" label="Author" rules={[{ required: true, message: "Please enter the author name" }]}>
          <Input placeholder="Enter the author name" />
        </Form.Item>

        <Form.Item name="isbn" label="ISBN (if known)">
          <Input placeholder="Enter ISBN if you know it" />
        </Form.Item>

        <Form.Item name="genre" label="Genre" rules={[{ required: true, message: "Please select a genre" }]}>
          <Select placeholder="Select a genre">
            <Option value="fiction">Fiction</Option>
            <Option value="non-fiction">Non-Fiction</Option>
            <Option value="science">Science</Option>
            <Option value="technology">Technology</Option>
            <Option value="history">History</Option>
            <Option value="biography">Biography</Option>
            <Option value="education">Education</Option>
            <Option value="reference">Reference</Option>
            <Option value="other">Other</Option>
          </Select>
        </Form.Item>

        <Form.Item name="publicationYear" label="Publication Year (if known)">
          <DatePicker picker="year" placeholder="Select year" />
        </Form.Item>

        <Form.Item name="priority" label="Priority">
          <Select>
            <Option value="low">Low</Option>
            <Option value="medium">Medium</Option>
            <Option value="high">High</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="reason"
          label="Reason for Suggestion"
          rules={[{ required: true, message: "Please provide a reason for your suggestion" }]}
        >
          <TextArea rows={4} placeholder="Why do you think this book would be a valuable addition to our library?" />
        </Form.Item>

        <Form.Item
          name="coverImage"
          label="Cover Image (optional)"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload
            listType="picture"
            beforeUpload={beforeUpload}
            fileList={fileList}
            onChange={handleChange}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Upload Cover Image</Button>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Submit Suggestion
          </Button>
        </Form.Item>
      </Form>

      <Text type="secondary">
        Note: All suggestions will be reviewed by the library administration. You'll be notified when your suggestion is
        processed.
      </Text>
    </Card>
  )
}

export default BookSuggestionForm
