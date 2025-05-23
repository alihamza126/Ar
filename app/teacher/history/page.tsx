"use client"
import { Card, Table, Tag, Avatar, Space, Statistic, Row, Col } from "antd"
import { BookOutlined, CalendarOutlined, HistoryOutlined } from "@ant-design/icons"
import { useState, useEffect } from "react"
import axios from "axios"
import dayjs from "dayjs"

interface BorrowHistory {
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
  returnDate?: string
  dueDate: string
  status: string
}

export default function TeacherHistoryPage() {
  const [history, setHistory] = useState<BorrowHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalBorrowed: 0,
    currentlyBorrowed: 0,
    overdue: 0,
  })

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)
      try {
        const res = await axios.get("/api/teacher/borrow-history")
        setHistory(res.data.data)

        // Calculate stats
        const total = res.data.data.length
        const current = res.data.data.filter((item: BorrowHistory) => item.status === "active").length
        const overdue = res.data.data.filter(
          (item: BorrowHistory) => item.status === "active" && dayjs().isAfter(dayjs(item.dueDate)),
        ).length

        setStats({
          totalBorrowed: total,
          currentlyBorrowed: current,
          overdue: overdue,
        })
      } catch (error) {
        console.error("Failed to fetch borrowing history:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  const columns = [
    {
      title: "Book",
      key: "book",
      render: (record: BorrowHistory) => (
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
      render: (date: string) => dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date: string) => dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: "Return Date",
      dataIndex: "returnDate",
      key: "returnDate",
      render: (date: string) => (date ? dayjs(date).format("DD MMM YYYY") : "-"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: BorrowHistory) => {
        const isOverdue = status === "active" && dayjs().isAfter(dayjs(record.dueDate))
        return (
          <Tag color={isOverdue ? "red" : status === "active" ? "blue" : "green"}>
            {isOverdue ? "OVERDUE" : status.toUpperCase()}
          </Tag>
        )
      },
    },
  ]

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic title="Total Books Borrowed" value={stats.totalBorrowed} prefix={<BookOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Currently Borrowed" value={stats.currentlyBorrowed} prefix={<CalendarOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Overdue Books"
              value={stats.overdue}
              prefix={<HistoryOutlined />}
              valueStyle={{ color: stats.overdue > 0 ? "#cf1322" : "#3f8600" }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <Space>
            <HistoryOutlined />
            <span>Borrowing History</span>
          </Space>
        }
      >
        <Table columns={columns} dataSource={history} loading={loading} rowKey="_id" pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  )
}
