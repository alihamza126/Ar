"use client"
import { Card, Table, Tag, Rate, Avatar, Space, Empty } from "antd"
import { BookOutlined, CalendarOutlined } from "@ant-design/icons"
import { useState, useEffect } from "react"
import axios from "axios"
import dayjs from "dayjs"

interface ReadingHistory {
  _id: string
  bookCopy: {
    book: {
      title: string
      author: string
      genre: string
    }
    barcode: string
  }
  issueDate: string
  returnDate: string
  status: string
}

export default function ReadingHistoryPage() {
  const [history, setHistory] = useState<ReadingHistory[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)
      try {
        const res = await axios.get("/api/student/reading-history")
        setHistory(res.data.data)
      } catch (error) {
        console.error("Failed to fetch reading history:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  const getRandomRating = () => {
    return Math.floor(Math.random() * 5) + 1
  }

  const columns = [
    {
      title: "Book",
      key: "book",
      render: (record: ReadingHistory) => (
        <Space>
          <Avatar shape="square" size={40} icon={<BookOutlined />} style={{ backgroundColor: "#1890ff" }} />
          <div>
            <div style={{ fontWeight: "bold" }}>{record.bookCopy.book.title}</div>
            <div style={{ color: "#666" }}>{record.bookCopy.book.author}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Genre",
      dataIndex: ["bookCopy", "book", "genre"],
      key: "genre",
      render: (genre: string) => <Tag color="blue">{genre}</Tag>,
    },
    {
      title: "Borrowed Date",
      dataIndex: "issueDate",
      key: "issueDate",
      render: (date: string) => (
        <Space>
          <CalendarOutlined />
          {dayjs(date).format("DD MMM YYYY")}
        </Space>
      ),
    },
    {
      title: "Returned Date",
      dataIndex: "returnDate",
      key: "returnDate",
      render: (date: string) => (
        <Space>
          <CalendarOutlined />
          {dayjs(date).format("DD MMM YYYY")}
        </Space>
      ),
    },
    {
      title: "My Rating",
      key: "rating",
      render: () => <Rate disabled defaultValue={getRandomRating()} />,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <Tag color={status === "returned" ? "green" : "blue"}>{status.toUpperCase()}</Tag>,
    },
  ]

  return (
    <Card
      title={
        <Space>
          <BookOutlined />
          <span>My Reading History</span>
        </Space>
      }
    >
      {history.length === 0 ? (
        <Empty description="No reading history yet. Start borrowing books to build your reading journey!" />
      ) : (
        <Table columns={columns} dataSource={history} loading={loading} rowKey="_id" pagination={{ pageSize: 10 }} />
      )}
    </Card>
  )
}
