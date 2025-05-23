"use client"
import { useState, useEffect } from "react"
import { Table, Tag, Button, Space, Card, Tooltip, Modal, message, Input, Select, Typography } from "antd"
import {
  CheckOutlined,
  CloseOutlined,
  SearchOutlined,
  BookOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons"
import axios from "axios"
import dayjs from "dayjs"

const { Title } = Typography
const { Option } = Select
const { confirm } = Modal

interface BookSuggestion {
  _id: string
  title: string
  author: string
  isbn?: string
  genre: string
  publicationYear?: number
  reason: string
  status: "pending" | "approved" | "rejected"
  priority: "low" | "medium" | "high"
  suggestedBy: {
    _id: string
    username: string
  }
  createdAt: string
}

const BookSuggestionList = () => {
  const [suggestions, setSuggestions] = useState<BookSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [rejectionReason, setRejectionReason] = useState("")
  const [rejectModalVisible, setRejectModalVisible] = useState(false)
  const [currentSuggestion, setCurrentSuggestion] = useState<string | null>(null)

  const fetchSuggestions = async () => {
    setLoading(true)
    try {
      const res = await axios.get("/api/admin/book-suggestions", {
        params: { status: statusFilter },
      })
      setSuggestions(res.data.data)
    } catch (error) {
      console.error("Failed to fetch book suggestions:", error)
      message.error("Failed to load book suggestions")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuggestions()
  }, [statusFilter])

  const handleApprove = (id: string) => {
    confirm({
      title: "Are you sure you want to approve this suggestion?",
      icon: <ExclamationCircleOutlined />,
      content: "This will mark the suggestion as approved and notify the teacher.",
      onOk: async () => {
        try {
          await axios.patch(`/api/admin/book-suggestions/${id}/approve`)
          message.success("Suggestion approved successfully")
          fetchSuggestions()
        } catch (error) {
          console.error("Failed to approve suggestion:", error)
          message.error("Failed to approve suggestion")
        }
      },
    })
  }

  const showRejectModal = (id: string) => {
    setCurrentSuggestion(id)
    setRejectModalVisible(true)
  }

  const handleReject = async () => {
    if (!currentSuggestion) return

    try {
      await axios.patch(`/api/admin/book-suggestions/${currentSuggestion}/reject`, {
        reason: rejectionReason,
      })
      message.success("Suggestion rejected")
      setRejectModalVisible(false)
      setRejectionReason("")
      fetchSuggestions()
    } catch (error) {
      console.error("Failed to reject suggestion:", error)
      message.error("Failed to reject suggestion")
    }
  }

  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      suggestion.title.toLowerCase().includes(searchText.toLowerCase()) ||
      suggestion.author.toLowerCase().includes(searchText.toLowerCase()) ||
      (suggestion.isbn && suggestion.isbn.includes(searchText)),
  )

  const priorityColors = {
    low: "blue",
    medium: "orange",
    high: "red",
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
      title: "Suggested By",
      dataIndex: ["suggestedBy", "username"],
      key: "suggestedBy",
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => dayjs(date).format("YYYY-MM-DD"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "approved" ? "green" : status === "rejected" ? "red" : "gold"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: BookSuggestion) =>
        record.status === "pending" ? (
          <Space>
            <Tooltip title="Approve">
              <Button type="primary" icon={<CheckOutlined />} size="small" onClick={() => handleApprove(record._id)} />
            </Tooltip>
            <Tooltip title="Reject">
              <Button danger icon={<CloseOutlined />} size="small" onClick={() => showRejectModal(record._id)} />
            </Tooltip>
          </Space>
        ) : (
          <Tag color={record.status === "approved" ? "green" : "red"}>
            {record.status === "approved" ? "Approved" : "Rejected"}
          </Tag>
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
    >
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
        <Input
          placeholder="Search by title, author or ISBN"
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
        <Select
          placeholder="Filter by status"
          style={{ width: 150 }}
          onChange={(value) => setStatusFilter(value)}
          allowClear
          value={statusFilter}
        >
          <Option value="pending">Pending</Option>
          <Option value="approved">Approved</Option>
          <Option value="rejected">Rejected</Option>
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={filteredSuggestions}
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

      <Modal
        title="Reject Book Suggestion"
        open={rejectModalVisible}
        onOk={handleReject}
        onCancel={() => {
          setRejectModalVisible(false)
          setRejectionReason("")
        }}
        okText="Reject"
        cancelText="Cancel"
      >
        <p>Please provide a reason for rejecting this book suggestion:</p>
        <Input.TextArea
          rows={4}
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="Enter reason for rejection"
        />
      </Modal>
    </Card>
  )
}

export default BookSuggestionList
