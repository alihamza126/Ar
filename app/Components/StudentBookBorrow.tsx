"use client"
import {
  Card,
  Input,
  Button,
  Table,
  Tag,
  Modal,
  Form,
  DatePicker,
  message,
  Rate,
  Tooltip,
  Avatar,
  Space,
  Divider,
} from "antd"
import { SearchOutlined, BookOutlined, FilterOutlined, InfoCircleOutlined } from "@ant-design/icons"
import { useState, useEffect } from "react"
import axios from "axios"
import dayjs from "dayjs"
import type { Book } from "@interfaces/Book"

const StudentBookBorrow = () => {
  const [books, setBooks] = useState([])
  const [filteredBooks, setFilteredBooks] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedBook, setSelectedBook] = useState<any>(null)
  const [borrowModalVisible, setBorrowModalVisible] = useState(false)
  const [detailsModalVisible, setDetailsModalVisible] = useState(false)
  const [genreFilter, setGenreFilter] = useState<string[]>([])
  const [availableGenres, setAvailableGenres] = useState<string[]>([])
  const [form] = Form.useForm()

  // Fetch available books
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true)
      try {
        const res = await axios.get("/api/books/available")
        setBooks(res.data.data)
        setFilteredBooks(res.data.data)

        // Extract unique genres
        const genres = [...new Set(res.data.data.map((book: Book) => book.genre))]
        setAvailableGenres(genres)
      } catch (error) {
        message.error("Failed to fetch books")
      } finally {
        setLoading(false)
      }
    }
    fetchBooks()
  }, [])

  const handleSearch = (e: any) => {
    const value = e.target.value.toLowerCase()
    filterBooks(value, genreFilter)
  }

  const handleGenreFilter = (genres: string[]) => {
    setGenreFilter(genres)
    filterBooks("", genres)
  }

  const filterBooks = (searchValue: string, genres: string[]) => {
    let filtered = books

    // Apply search filter
    if (searchValue) {
      filtered = filtered.filter(
        (book: Book) =>
          book.title.toLowerCase().includes(searchValue) ||
          book.author.toLowerCase().includes(searchValue) ||
          book.isbn.toLowerCase().includes(searchValue),
      )
    }

    // Apply genre filter
    if (genres && genres.length > 0) {
      filtered = filtered.filter((book: Book) => genres.includes(book.genre))
    }

    setFilteredBooks(filtered)
  }

  const handleBorrow = async (values: any) => {
    try {
      setLoading(true)
      await axios.post("/api/student/borrow", {
        bookId: selectedBook._id,
        dueDate: values.dueDate,
      })
      message.success("Book borrowed successfully!")
      setBorrowModalVisible(false)
      // Refresh book list
      const res = await axios.get("/api/books/available")
      setBooks(res.data.data)
      setFilteredBooks(res.data.data)
    } catch (error: any) {
      message.error(error.response?.data?.message || "Failed to borrow book")
    } finally {
      setLoading(false)
    }
  }

  const showBookDetails = (book: any) => {
    setSelectedBook(book)
    setDetailsModalVisible(true)
  }

  const getRandomRating = () => {
    return (Math.random() * 4 + 1).toFixed(1)
  }

  const columns = [
    {
      title: "Cover",
      key: "cover",
      width: 80,
      render: () => <Avatar shape="square" size={64} icon={<BookOutlined />} style={{ backgroundColor: "#1890ff" }} />,
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: any) => <a onClick={() => showBookDetails(record)}>{text}</a>,
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
      render: (genre: string) => <Tag color="blue">{genre}</Tag>,
    },
    {
      title: "Rating",
      key: "rating",
      render: () => <Rate disabled defaultValue={Number.parseFloat(getRandomRating())} allowHalf />,
    },
    {
      title: "Available Copies",
      dataIndex: "availableCopies",
      key: "availableCopies",
      render: (copies: any) => (
        <Tag color={copies > 0 ? "green" : "red"}>
          {copies} {copies === 1 ? "copy" : "copies"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="View Details">
            <Button type="default" icon={<InfoCircleOutlined />} onClick={() => showBookDetails(record)} size="small" />
          </Tooltip>
          <Button
            type="primary"
            icon={<BookOutlined />}
            disabled={record.availableCopies === 0}
            onClick={() => {
              setSelectedBook(record)
              setBorrowModalVisible(true)
            }}
            size="small"
          >
            Borrow
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <Card
      title={
        <Space>
          <BookOutlined />
          <span>Available Books</span>
        </Space>
      }
      extra={
        <Space>
          <Input
            placeholder="Search books..."
            prefix={<SearchOutlined />}
            onChange={handleSearch}
            style={{ width: 250 }}
            allowClear
          />
          <Tooltip title="Filter by Genre">
            <Button
              icon={<FilterOutlined />}
              onClick={() => {
                // This would typically open a dropdown or drawer with genre filters
                // For simplicity, we're not implementing the full UI here
              }}
            />
          </Tooltip>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={filteredBooks}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />

      {/* Book Details Modal */}
      <Modal
        title="Book Details"
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            Close
          </Button>,
          <Button
            key="borrow"
            type="primary"
            disabled={selectedBook?.availableCopies === 0}
            onClick={() => {
              setDetailsModalVisible(false)
              setBorrowModalVisible(true)
            }}
          >
            Borrow This Book
          </Button>,
        ]}
        width={700}
      >
        {selectedBook && (
          <div style={{ display: "flex", gap: "20px" }}>
            <div style={{ flex: "0 0 150px" }}>
              <Avatar shape="square" size={150} icon={<BookOutlined />} style={{ backgroundColor: "#1890ff" }} />
              <div style={{ marginTop: "10px", textAlign: "center" }}>
                <Rate disabled defaultValue={Number.parseFloat(getRandomRating())} allowHalf />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <h2>{selectedBook.title}</h2>
              <p>
                <strong>Author:</strong> {selectedBook.author}
              </p>
              <p>
                <strong>ISBN:</strong> {selectedBook.isbn}
              </p>
              <p>
                <strong>Genre:</strong> <Tag color="blue">{selectedBook.genre}</Tag>
              </p>
              <p>
                <strong>Publication Year:</strong> {selectedBook.publicationYear}
              </p>
              <p>
                <strong>Available Copies:</strong> {selectedBook.availableCopies}
              </p>
              <Divider />
              <p>
                <strong>Description:</strong>
              </p>
              <p>{selectedBook.description || "No description available for this book."}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Borrow Modal */}
      <Modal
        title={`Borrow: ${selectedBook?.title}`}
        open={borrowModalVisible}
        onCancel={() => setBorrowModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleBorrow}
          layout="vertical"
          initialValues={{
            dueDate: dayjs().add(14, "day"), // Default 2 weeks from today
          }}
        >
          <Form.Item label="Book Title">
            <Input value={selectedBook?.title} disabled />
          </Form.Item>
          <Form.Item label="Author">
            <Input value={selectedBook?.author} disabled />
          </Form.Item>
          <Form.Item name="dueDate" label="Due Date" rules={[{ required: true, message: "Please select due date" }]}>
            <DatePicker
              style={{ width: "100%" }}
              disabledDate={(current) => {
                return current && current < dayjs().endOf("day")
              }}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Confirm Borrow
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default StudentBookBorrow
