"use client"
import { Card, List, Button, Rate, Avatar, Space, Empty, Tag, message } from "antd"
import { BookOutlined, HeartFilled, DeleteOutlined } from "@ant-design/icons"
import { useState, useEffect } from "react"

interface FavoriteBook {
  _id: string
  book: {
    _id: string
    title: string
    author: string
    genre: string
    isbn: string
  }
  rating: number
  notes?: string
  addedAt: string
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteBook[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true)
      try {
        // This would be a real API call
        // const res = await axios.get('/api/student/favorites');
        // setFavorites(res.data.data);

        // Mock data for now
        setFavorites([
          {
            _id: "1",
            book: {
              _id: "book1",
              title: "The Great Gatsby",
              author: "F. Scott Fitzgerald",
              genre: "fiction",
              isbn: "978-0-7432-7356-5",
            },
            rating: 5,
            notes: "Amazing classic literature!",
            addedAt: "2024-01-15",
          },
          {
            _id: "2",
            book: {
              _id: "book2",
              title: "Clean Code",
              author: "Robert C. Martin",
              genre: "technology",
              isbn: "978-0-13-235088-4",
            },
            rating: 4,
            notes: "Great for programming best practices",
            addedAt: "2024-01-10",
          },
        ])
      } catch (error) {
        console.error("Failed to fetch favorites:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchFavorites()
  }, [])

  const removeFavorite = async (id: string) => {
    try {
      // await axios.delete(`/api/student/favorites/${id}`);
      setFavorites(favorites.filter((fav) => fav._id !== id))
      message.success("Removed from favorites")
    } catch (error) {
      message.error("Failed to remove from favorites")
    }
  }

  return (
    <Card
      title={
        <Space>
          <HeartFilled style={{ color: "#ff4d4f" }} />
          <span>My Favorite Books</span>
        </Space>
      }
    >
      {favorites.length === 0 ? (
        <Empty description="No favorite books yet. Start adding books you love!" />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={favorites}
          loading={loading}
          pagination={{ pageSize: 10 }}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  key="remove"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeFavorite(item._id)}
                >
                  Remove
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar shape="square" size={64} icon={<BookOutlined />} style={{ backgroundColor: "#1890ff" }} />
                }
                title={
                  <Space direction="vertical" size={0}>
                    <span style={{ fontSize: "16px", fontWeight: "bold" }}>{item.book.title}</span>
                    <span style={{ color: "#666" }}>by {item.book.author}</span>
                  </Space>
                }
                description={
                  <Space direction="vertical" size={4}>
                    <Space>
                      <Tag color="blue">{item.book.genre}</Tag>
                      <span style={{ color: "#999" }}>ISBN: {item.book.isbn}</span>
                    </Space>
                    <Rate disabled defaultValue={item.rating} />
                    {item.notes && <div style={{ fontStyle: "italic", color: "#666" }}>"{item.notes}"</div>}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  )
}
