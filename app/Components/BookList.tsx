"use client"
import { useState, useEffect, useCallback } from "react"
import { Table, Input, Button, Space, Card, Row, Col, Tag, message, Select, Tooltip, Avatar } from "antd"
import { SearchOutlined, EditOutlined, DeleteOutlined, BookOutlined, StarOutlined, StarFilled } from "@ant-design/icons"
import type { TablePaginationConfig, SorterResult, FilterValue, TableCurrentDataSource } from "antd/es/table/interface"
import axios from "axios"
import type { Book } from "@/interfaces/Book"
import dynamic from "next/dynamic"

// Disable SSR for the Modal component
const BookForm = dynamic(() => import("./BookForm"), {
  ssr: false,
})

interface TableParams {
  pagination?: TablePaginationConfig
  sortField?: string
  sortOrder?: string
  search?: string
  genre?: string
}

const BookList = () => {
  const [data, setData] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
    },
    sortField: "title",
    sortOrder: "ascend",
  })
  const [searchText, setSearchText] = useState("")
  const [genreFilter, setGenreFilter] = useState<string | undefined>(undefined)
  const [genres, setGenres] = useState<string[]>([])
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [formVisible, setFormVisible] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        page: tableParams.pagination?.current,
        limit: tableParams.pagination?.pageSize,
        sort: tableParams.sortField,
        order: tableParams.sortOrder,
        search: searchText,
        genre: genreFilter,
      }

      const response = await axios.get("/api/admin/book", { params })

      setData(response.data.data)
      setTableParams({
        ...tableParams,
        pagination: {
          ...tableParams.pagination,
          total: response.data.pagination.total,
        },
      })

      // Extract unique genres for filter
      const uniqueGenres = [...new Set(response.data.data.map((book: Book) => book.genre))]
      setGenres(uniqueGenres)
    } catch (error) {
      console.error("Error fetching books:", error)
      message.error("Failed to fetch books")
    } finally {
      setLoading(false)
    }
  }, [
    tableParams.pagination?.current,
    tableParams.pagination?.pageSize,
    tableParams.sortField,
    tableParams.sortOrder,
    searchText,
    genreFilter,
  ])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<Book> | SorterResult<Book>[],
    extra: TableCurrentDataSource<Book>,
  ) => {
    const sortField = Array.isArray(sorter) ? sorter[0]?.field?.toString() : sorter?.field?.toString()

    const sortOrder = Array.isArray(sorter) ? sorter[0]?.order?.toString() : sorter?.order?.toString()

    setTableParams({
      ...tableParams,
      pagination,
      sortField,
      sortOrder,
    })
  }

  const handleSearch = (value: string) => {
    setSearchText(value)
    setTableParams({
      ...tableParams,
      pagination: {
        ...tableParams.pagination,
        current: 1,
      },
    })
  }

  const handleGenreChange = (value: string) => {
    setGenreFilter(value)
    setTableParams({
      ...tableParams,
      pagination: {
        ...tableParams.pagination,
        current: 1,
      },
    })
  }

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/admin/book/${id}`)
      message.success("Book deleted successfully")
      fetchData()
    } catch (error) {
      message.error("Failed to delete book")
    }
  }

  const getRandomRating = () => {
    return (Math.random() * 4 + 1).toFixed(1)
  }

  const renderRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    return (
      <Space>
        {Array(fullStars)
          .fill(null)
          .map((_, i) => (
            <StarFilled key={i} style={{ color: "#faad14" }} />
          ))}
        {hasHalfStar && <StarOutlined style={{ color: "#faad14" }} />}
        <span>{rating}</span>
      </Space>
    )
  }

  const columns = [
    {
      title: "Cover",
      key: "cover",
      width: 80,
      render: (text: any, record: Book) => (
        <Avatar shape="square" size={64} icon={<BookOutlined />} style={{ backgroundColor: "#1890ff" }} />
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      sorter: true,
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: "Author",
      dataIndex: "author",
      key: "author",
      sorter: true,
    },
    {
      title: "ISBN",
      dataIndex: "isbn",
      key: "isbn",
    },
    {
      title: "Genre",
      dataIndex: "genre",
      key: "genre",
      render: (genre: string) => <Tag color="blue">{genre}</Tag>,
      filters: genres.map((genre) => ({ text: genre, value: genre })),
    },
    {
      title: "Publication Year",
      dataIndex: "publicationYear",
      key: "publicationYear",
      sorter: true,
    },
    {
      title: "Rating",
      key: "rating",
      render: () => renderRatingStars(Number.parseFloat(getRandomRating())),
    },
    {
      title: "Actions",
      key: "actions",
      render: (text: any, record: Book) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => {
                setSelectedBook(record)
                setFormVisible(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => handleDelete(record._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <Card
      title={
        <Space>
          <BookOutlined />
          <span>Books Management</span>
        </Space>
      }
      extra={
        <Button
          type="primary"
          onClick={() => {
            setSelectedBook(null)
            setFormVisible(true)
          }}
        >
          Add New Book
        </Button>
      }
    >
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={12} lg={8}>
          <Input
            placeholder="Search by title, author or ISBN"
            prefix={<SearchOutlined />}
            allowClear
            onChange={(e) => handleSearch(e.target.value)}
            value={searchText}
          />
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Select
            placeholder="Filter by genre"
            style={{ width: "100%" }}
            onChange={handleGenreChange}
            allowClear
            value={genreFilter}
          >
            {genres.map((genre) => (
              <Select.Option key={genre} value={genre}>
                {genre}
              </Select.Option>
            ))}
          </Select>
        </Col>
      </Row>

      <Table
        columns={columns}
        rowKey={(record) => record._id}
        dataSource={data}
        pagination={tableParams.pagination}
        loading={loading}
        onChange={handleTableChange}
        scroll={{ x: true }}
      />

      <BookForm
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        book={selectedBook}
        refreshData={fetchData}
      />
    </Card>
  )
}

export default BookList
