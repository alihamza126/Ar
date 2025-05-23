"use client"

import type React from "react"
import { type ReactNode, useState, useEffect } from "react"
import { Layout, Menu, Avatar, Dropdown, Button, theme, Drawer } from "antd"
import type { MenuProps } from "antd"
import {
  HomeOutlined,
  CalendarOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BookFilled,
  MenuOutlined,
  StarOutlined,
  HistoryOutlined,
} from "@ant-design/icons"
import { useRouter, usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import NotificationCenter from "../Components/NotificationCenter"

const { Header, Sider, Content } = Layout

interface DashboardLayoutProps {
  children: ReactNode
}

type MenuItem = Required<MenuProps>["items"][number]

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileView, setMobileView] = useState(false)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const { token } = theme.useToken()
  const { data: session, status } = useSession()

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      setMobileView(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setDrawerVisible(false)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push("/")
  }

  const menuItems: MenuItem[] = [
    {
      key: "/student",
      icon: <HomeOutlined />,
      label: "Dashboard",
      onClick: () => router.push("/student"),
    },
    {
      key: "/student/dashboard",
      icon: <BookFilled />,
      label: "Borrow Books",
      onClick: () => router.push("/student/dashboard"),
    },
    {
      key: "/student/reading-history",
      icon: <HistoryOutlined />,
      label: "Reading History",
      onClick: () => router.push("/student/reading-history"),
    },
    {
      key: "/student/favorites",
      icon: <StarOutlined />,
      label: "My Favorites",
      onClick: () => router.push("/student/favorites"),
    },
    {
      key: "/student/events",
      icon: <CalendarOutlined />,
      label: "Events",
      onClick: () => router.push("/student/events"),
    },
    {
      key: "/student/profile",
      icon: <UserOutlined />,
      label: "Profile",
      onClick: () => router.push("/student/profile"),
    },
  ]

  // User menu items using next-auth signOut
  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "View Profile",
      onClick: () => router.push("/student/profile"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
      onClick: () => router.push("/student/settings"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
      onClick: handleLogout,
    },
  ]

  // Show loading or nothing while checking authentication
  if (status === "loading" || status === "unauthenticated") {
    return null
  }

  // Find the current active menu item
  const getPageTitle = () => {
    const currentItem = menuItems.find(
      (item) => pathname === item?.key || pathname?.startsWith(item?.key?.toString() || ""),
    )
    return currentItem?.label || "Student Dashboard"
  }

  const sidebarContent = (
    <>
      <div
        style={{
          height: "64px",
          padding: collapsed ? "16px 8px" : "16px 24px",
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid #f0f0f0",
          background: token.colorPrimary,
          color: "white",
        }}
      >
        {!collapsed && <div style={{ fontSize: "18px", fontWeight: "bold" }}>Library Portal</div>}
        {collapsed && (
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            LP
          </div>
        )}
      </div>
      <Menu
        theme="light"
        mode="inline"
        defaultSelectedKeys={["/student"]}
        selectedKeys={[pathname || "/student"]}
        style={{ borderRight: 0 }}
        items={menuItems}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          borderTop: "1px solid #f0f0f0",
          padding: collapsed ? "16px 8px" : "16px 24px",
        }}
      >
        <Button
          type="primary"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          style={{ width: collapsed ? "100%" : "auto" }}
        >
          {!collapsed && "Logout"}
        </Button>
      </div>
    </>
  )

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Desktop Sidebar */}
      {!mobileView && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          theme="light"
          style={{
            boxShadow: "2px 0 8px 0 rgba(29,35,41,.05)",
            zIndex: 10,
          }}
        >
          {sidebarContent}
        </Sider>
      )}

      {/* Mobile Drawer */}
      {mobileView && (
        <Drawer
          placement="left"
          closable={false}
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          bodyStyle={{ padding: 0 }}
          width={250}
        >
          {sidebarContent}
        </Drawer>
      )}

      <Layout>
        <Header
          style={{
            padding: "0 16px",
            background: "#fff",
            boxShadow: "0 1px 4px rgba(0,21,41,.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {mobileView ? (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setDrawerVisible(true)}
                style={{ fontSize: "16px", width: 64, height: 64 }}
              />
            ) : (
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ fontSize: "16px", width: 64, height: 64 }}
              />
            )}
            <h1 style={{ margin: 0, fontSize: "18px" }}>{getPageTitle()}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <NotificationCenter />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <div style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                <Avatar
                  src={session?.user?.image || "/placeholder.svg?height=40&width=40"}
                  size="default"
                  alt={session?.user?.name || "User"}
                />
                {!mobileView && <span style={{ marginLeft: 8 }}>{session?.user?.name || "User"}</span>}
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            background: "#fff",
            borderRadius: "4px",
            minHeight: 280,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}

export default DashboardLayout
