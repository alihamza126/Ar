"use client"
import { Row, Col, Statistic, Card, Spin, Progress } from "antd"
import { useEffect, useState } from "react"
import axios from "axios"
import {
  BookOutlined,
  UserOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  CalendarOutlined,
  WarningOutlined,
} from "@ant-design/icons"

interface DashboardStatsProps {
  userRole?: string
}

const DashboardStats = ({ userRole = "admin" }: DashboardStatsProps) => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    issuedBooks: 0,
    totalUsers: 0,
    pendingEvents: 0,
    unpaidFines: 0,
    pendingSuggestions: 0,
    overdueBooks: 0,
    totalBorrows: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const endpoint = userRole === "admin" ? "/api/admin/stats" : "/api/student/summary"

        const res = await axios.get(endpoint)
        setStats({
          ...stats,
          ...res.data,
        })
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [userRole])

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <Spin size="large" />
      </div>
    )
  }

  // Calculate availability percentage
  const availabilityPercentage = stats.totalBooks > 0 ? Math.round((stats.availableBooks / stats.totalBooks) * 100) : 0

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={8} lg={6}>
        <Card hoverable>
          <Statistic
            title="Total Books"
            value={stats.totalBooks}
            prefix={<BookOutlined style={{ color: "#1890ff" }} />}
          />
          {userRole === "admin" && (
            <div style={{ marginTop: 10 }}>
              <Progress
                percent={availabilityPercentage}
                size="small"
                status="active"
                format={() => `${stats.availableBooks} available`}
              />
            </div>
          )}
        </Card>
      </Col>

      {userRole === "admin" && (
        <>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card hoverable>
              <Statistic
                title="Total Users"
                value={stats.totalUsers}
                prefix={<UserOutlined style={{ color: "#52c41a" }} />}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Card hoverable>
              <Statistic
                title="Pending Events"
                value={stats.pendingEvents}
                prefix={<CalendarOutlined style={{ color: "#faad14" }} />}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Card hoverable>
              <Statistic
                title="Unpaid Fines"
                value={stats.unpaidFines}
                precision={2}
                prefix={<DollarOutlined style={{ color: "#f5222d" }} />}
                suffix="$"
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Card hoverable>
              <Statistic
                title="Pending Suggestions"
                value={stats.pendingSuggestions}
                prefix={<BookOutlined style={{ color: "#722ed1" }} />}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Card hoverable>
              <Statistic
                title="Overdue Books"
                value={stats.overdueBooks}
                prefix={<WarningOutlined style={{ color: "#ff4d4f" }} />}
              />
            </Card>
          </Col>
        </>
      )}

      {userRole !== "admin" && (
        <>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card hoverable>
              <Statistic
                title="Borrowed Books"
                value={stats.borrowedBooks || 0}
                prefix={<BookOutlined style={{ color: "#fa8c16" }} />}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Card hoverable>
              <Statistic
                title="Reserved Books"
                value={stats.reservedBooks || 0}
                prefix={<CheckCircleOutlined style={{ color: "#722ed1" }} />}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Card hoverable>
              <Statistic
                title="Overdue Books"
                value={stats.overdueBooks || 0}
                prefix={<WarningOutlined style={{ color: "#ff4d4f" }} />}
              />
            </Card>
          </Col>
        </>
      )}
    </Row>
  )
}

export default DashboardStats
