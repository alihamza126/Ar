"use client"
import { useState, useEffect } from "react"
import { Table, Tag, Button, Space, Card, Empty, Tabs, Typography } from "antd"
import { BookOutlined, PlusOutlined } from "@ant-design/icons"
import axios from "axios"
import dayjs from "dayjs"
import BookSuggestionForm from "./BookSuggestionForm"

const { Title, Text } = Typography
const { TabPane } = Tabs

interface BookSuggestion {
  _id: string
  title: string
  author: string
  genre: string
  status: "pending" | "approved" | "rejected"
  priority: "low" | "medium" | "high"
  createdAt: string
  rejectionReason?: string
}

const TeacherBookSuggestions = () => {
  const [suggestions, setSuggestions] = useState<BookSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("list")

  const fetchSuggestions = async () => {
    setLoading(true)
    try {
      const res = await axios.get("/api/teacher/book-suggestion")
      setSuggestions(res.data.data)
    } catch (error) {
      console.error("Failed to fetch book suggestions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuggestions()
  }, [])

  const handleFormSuccess = () => {
    fetchSuggestions()
    setActiveTab("list")
  }

  const priorityColors = {
    low: "blue",
    medium: "orange",
    high: "red",
  }

  const statusColors = {
    pending: "gold",
    approved: "green",
    rejected: "red",
  }

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: "Author",
      dataIndex: "author",
      key: "author",
    },
    {
      title: "Genre",
      dataIndex: "genre",
      key: "genre",
      render: (genre: string) => <Tag>{genre}</Tag>,
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (priority: "low" | "medium" | "high") => (
        <Tag color={priorityColors[priority]}>{priority.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Date Suggested",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => dayjs(date).format("YYYY-MM-DD"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={statusColors[status as keyof typeof statusColors]}>{status.toUpperCase()}</Tag>
      ),
    },
  ]

  return (
    <Card
      title={
        <Space>
          <BookOutlined />
          <span>Book Suggestions</span>
        </Space>
      }
      extra={
        activeTab === "list" ? (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setActiveTab("new")}>
            New Suggestion
          </Button>
        ) : null
      }
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="My Suggestions" key="list">
          {suggestions.length === 0 ? (
            <Empty
              description={
                <Space direction="vertical" align="center">
                  <Text>You haven't made any book suggestions yet</Text>
                  <Button type="primary" onClick={() => setActiveTab("new")}>
                    Suggest a Book
                  </Button>
                </Space>
              }
            />
          ) : (
            <Table
              columns={columns}
              dataSource={suggestions}
              rowKey="_id"
              loading={loading}
              expandable={{
                expandedRowRender: (record) => (
                  <div style={{ margin: 0, padding: "12px 24px", backgroundColor: "#fafafa" }}>
                    <Title level={5}>Reason for Suggestion:</Title>
                    <p>{record.reason}</p>
                    {record.status === "rejected" && record.rejectionReason && (
                      <>
                        <Title level={5}>Reason for Rejection:</Title>
                        <p>{record.rejectionReason}</p>
                      </>
                    )}
                  </div>
                ),
              }}
            />
          )}
        </TabPane>
        <TabPane tab="New Suggestion" key="new">
          <BookSuggestionForm onSuccess={handleFormSuccess} />
        </TabPane>
      </Tabs>
    </Card>
  )
}

export default TeacherBookSuggestions
