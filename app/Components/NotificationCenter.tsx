"use client"
import { Badge, Popover, List, Button, Tag, Avatar, Space, Divider, Card, Empty, notification } from "antd"
import { BellOutlined, CheckOutlined, BookOutlined, WarningOutlined } from "@ant-design/icons"
import { useState, useEffect } from "react"
import axios from "axios"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

// Extend dayjs with relativeTime plugin
dayjs.extend(relativeTime)

interface Notification {
  _id: string
  message: string
  type: string
  read: boolean
  createdAt: string
  relatedEntity?: {
    _id: string
    title?: string
    name?: string
  }
}

const NotificationCenter = ({ fullView = false }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [popoverVisible, setPopoverVisible] = useState(false)

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await axios.get("/api/notifications")
      setNotifications(res.data.data)
      setUnreadCount(res.data.data.filter((n: Notification) => !n.read).length)
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Refresh notifications every 3 minutes
    const interval = setInterval(fetchNotifications, 180000)
    return () => clearInterval(interval)
  }, [])

  const markAsRead = async (id: string) => {
    try {
      await axios.patch(`/api/notifications/${id}/read`)
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)))
      setUnreadCount((prev) => prev - 1)
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await axios.patch("/api/notifications/mark-all-read")
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
      notification.success({
        message: "All notifications marked as read",
        placement: "topRight",
      })
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "reservation":
        return <Avatar icon={<CheckOutlined />} style={{ backgroundColor: "#52c41a" }} />
      case "overdue":
        return <Avatar icon={<WarningOutlined />} style={{ backgroundColor: "#f5222d" }} />
      case "suggestion":
        return <Avatar icon={<BookOutlined />} style={{ backgroundColor: "#1890ff" }} />
      default:
        return <Avatar icon={<BellOutlined />} style={{ backgroundColor: "#1890ff" }} />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "reservation":
        return "#f6ffed"
      case "overdue":
        return "#fff2f0"
      case "suggestion":
        return "#e6f7ff"
      default:
        return "#f0f5ff"
    }
  }

  const notificationContent = (
    <div style={{ width: 350 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 16px",
          marginBottom: 8,
        }}
      >
        <h4 style={{ margin: 0 }}>Notifications</h4>
        <Button type="link" size="small" onClick={markAllAsRead} disabled={unreadCount === 0}>
          Mark all as read
        </Button>
      </div>
      <Divider style={{ margin: "8px 0" }} />

      {notifications.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No notifications yet" style={{ padding: "20px 0" }} />
      ) : (
        <List
          dataSource={notifications.slice(0, 5)}
          loading={loading}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: "8px 16px",
                backgroundColor: item.read ? "inherit" : getNotificationColor(item.type),
                cursor: "pointer",
                transition: "background-color 0.3s",
              }}
              onClick={() => markAsRead(item._id)}
            >
              <List.Item.Meta
                avatar={getNotificationIcon(item.type)}
                title={
                  <Space>
                    {item.message}
                    {!item.read && <Tag color="blue">New</Tag>}
                  </Space>
                }
                description={
                  <div>
                    <div>{dayjs(item.createdAt).fromNow()}</div>
                    {item.relatedEntity?.title && (
                      <div style={{ fontStyle: "italic" }}>Re: {item.relatedEntity.title}</div>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}

      <Divider style={{ margin: "8px 0" }} />
      <div style={{ textAlign: "center", padding: 8 }}>
        <Button
          type="link"
          onClick={() => {
            setPopoverVisible(false)
            // Navigate to full notifications page
            window.location.href = "/notifications"
          }}
        >
          View All Notifications
        </Button>
      </div>
    </div>
  )

  if (fullView) {
    return (
      <Card title="Your Notifications">
        {notifications.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No notifications yet" />
        ) : (
          <>
            <div style={{ marginBottom: 16, textAlign: "right" }}>
              <Button type="primary" onClick={markAllAsRead} disabled={unreadCount === 0}>
                Mark all as read
              </Button>
            </div>
            <List
              dataSource={notifications}
              loading={loading}
              pagination={{ pageSize: 10 }}
              renderItem={(item) => (
                <List.Item
                  style={{
                    backgroundColor: item.read ? "inherit" : getNotificationColor(item.type),
                    padding: "12px 16px",
                    borderRadius: "8px",
                    marginBottom: "8px",
                  }}
                  actions={[
                    !item.read && (
                      <Button type="link" size="small" onClick={() => markAsRead(item._id)}>
                        Mark as read
                      </Button>
                    ),
                  ]}
                >
                  <List.Item.Meta
                    avatar={getNotificationIcon(item.type)}
                    title={item.message}
                    description={
                      <Space direction="vertical" size={0}>
                        <span>{dayjs(item.createdAt).format("YYYY-MM-DD HH:mm")}</span>
                        {!item.read && <Tag color="blue">Unread</Tag>}
                        {item.relatedEntity?.title && (
                          <span style={{ fontStyle: "italic" }}>Related to: {item.relatedEntity.title}</span>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </>
        )}
      </Card>
    )
  }

  return (
    <Popover
      content={notificationContent}
      trigger="click"
      open={popoverVisible}
      onOpenChange={setPopoverVisible}
      placement="bottomRight"
      arrow={{ pointAtCenter: true }}
    >
      <Badge count={unreadCount} overflowCount={9} style={{ cursor: "pointer" }}>
        <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} shape="circle" />
      </Badge>
    </Popover>
  )
}

export default NotificationCenter
