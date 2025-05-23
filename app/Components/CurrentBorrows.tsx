"use client"
import { Table, Tag, Button, Space, Modal, Input, message, Tooltip, Avatar } from "antd"
import { BookOutlined, ClockCircleOutlined, WarningOutlined, StarOutlined } from "@ant-design/icons"
import { useEffect, useState } from "react"
import axios from "axios"
import dayjs from "dayjs"

interface Book {
  title: string
  author?: string
}

interface BookCopy {
  barcode: string
  book: Book
}

interface Borrow {
  _id: string
  bookCopy: BookCopy
  issueDate: string
  dueDate: string
  status: "active" | "returned" | "overdue"
}

const CurrentBorrows = () => {
  const [borrows, setBorrows] = useState<Borrow[]>([])
  const [loading, setLoading] = useState(false)
  const [reviewModalVisible, setReviewModalVisible] = useState(false)
  const [selectedBorrow, setSelectedBorrow] = useState<Borrow | null>(null)
  const [reviewText, setReviewText] = useState("")
  const [rating, setRating] = useState(0)

  useEffect(() => {
    const fetchBorrows = async () => {
      setLoading(true)
      try {
        const res = await axios.get("/api/student/borrow")
        setBorrows(res.data.data)
      } catch (error) {
        console.error("Failed to fetch borrows:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchBorrows()
  }, [])

  const handleReviewSubmit = async () => {
    if (!selectedBorrow) return

    try {
      // This would typically send the review to an API endpoint
      // await axios.post('/api/reviews', {
      //   borrowId: selectedBorrow._id,
      //   bookId: selectedBorrow.bookCopy.book._id,
      //   rating,
      //   review: reviewText
      // });

      message.success("Review submitted successfully!")
      setReviewModalVisible(false)
      setReviewText("")
      setRating(0)
    } catch (error) {
      message.error("Failed to submit review")
    }
  }

  const showReviewModal = (borrow: Borrow) => {
    setSelectedBorrow(borrow)
    setReviewModalVisible(true)
  }

  const columns = [
    {
      title: "Book",
      key: "book",
      render: (record: Borrow) => (
        <Space>
          <Avatar shape="square" size={40} icon={<BookOutlined />} style={{ backgroundColor: "#1890ff" }} />
          <span>{record.bookCopy.book.title}</span>
        </Space>
      ),
    },
    {
      title: "Barcode",
      dataIndex: ["bookCopy", "barcode"],
      key: "barcode",
    },
    {
      title: "Issued Date",
      dataIndex: "issueDate",
      key: "issueDate",
      render: (date: string) => dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date: string) => dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: Borrow) => {
        const isOverdue = dayjs().isAfter(dayjs(record.dueDate)) && status === "active"
        return (
          <Tag
            color={isOverdue ? "red" : status === "active" ? "blue" : "green"}
            icon={isOverdue ? <WarningOutlined /> : undefined}
          >
            {isOverdue ? "OVERDUE" : status.toUpperCase()}
          </Tag>
        )
      },
    },
    {
      title: "Days Remaining",
      key: "daysLeft",
      render: (_: unknown, record: Borrow) => {
        if (record.status !== "active") return "-"
        const days = dayjs(record.dueDate).diff(dayjs(), "day")
        return (
          <Tag
            color={days < 0 ? "red" : days < 3 ? "orange" : "green"}
            icon={days < 0 ? <ClockCircleOutlined /> : undefined}
          >
            {days < 0 ? `${Math.abs(days)} days overdue` : `${days} days`}
          </Tag>
        )
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Borrow) => (
        <Space>
          <Tooltip title="Write a Review">
            <Button type="primary" icon={<StarOutlined />} size="small" onClick={() => showReviewModal(record)}>
              Review
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <>
      <Table columns={columns} dataSource={borrows} loading={loading} rowKey="_id" pagination={{ pageSize: 10 }} />

      <Modal
        title="Write a Review"
        open={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        onOk={handleReviewSubmit}
        okText="Submit Review"
      >
        {selectedBorrow && (
          <>
            <p>
              <strong>Book:</strong> {selectedBorrow.bookCopy.book.title}
            </p>
            <div style={{ margin: "16px 0" }}>
              <p>
                <strong>Rating:</strong>
              </p>
              <StarOutlined
                style={{ fontSize: 24, color: rating >= 1 ? "#faad14" : "#d9d9d9", cursor: "pointer" }}
                onClick={() => setRating(1)}
              />
              <StarOutlined
                style={{ fontSize: 24, color: rating >= 2 ? "#faad14" : "#d9d9d9", cursor: "pointer" }}
                onClick={() => setRating(2)}
              />
              <StarOutlined
                style={{ fontSize: 24, color: rating >= 3 ? "#faad14" : "#d9d9d9", cursor: "pointer" }}
                onClick={() => setRating(3)}
              />
              <StarOutlined
                style={{ fontSize: 24, color: rating >= 4 ? "#faad14" : "#d9d9d9", cursor: "pointer" }}
                onClick={() => setRating(4)}
              />
              <StarOutlined
                style={{ fontSize: 24, color: rating >= 5 ? "#faad14" : "#d9d9d9", cursor: "pointer" }}
                onClick={() => setRating(5)}
              />
            </div>
            <div style={{ margin: "16px 0" }}>
              <p>
                <strong>Your Review:</strong>
              </p>
              <Input.TextArea
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your thoughts about this book..."
              />
            </div>
          </>
        )}
      </Modal>
    </>
  )
}

export default CurrentBorrows
