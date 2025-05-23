"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, Form, Input, Button, Typography, Row, Col, message } from "antd";
import toast from "react-hot-toast";

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    const hide = message.loading("Submitting...", 0);
    try {
      // 1) Register user
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      // 2) Auto–login
      const result = await signIn("domain-login", {
        redirect: false,
        username: values.email,
        password: values.password,
      });
      if (result?.error) throw new Error(result.error);

      hide();
      message.success("Account created successfully!");
      router.push("/student");
    } catch (err) {
      hide();
      toast.error(err.message);
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
      {/* Background blobs */}
      <div
        className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-indigo-300 opacity-70 blur-3xl animate-pulse"
        style={{ animationDuration: "8s" }}
      />
      <div
        className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full bg-blue-300 opacity-70 blur-3xl animate-pulse"
        style={{ animationDuration: "8s", animationDelay: "2s" }}
      />

      <Row
        justify="center"
        align="middle"
        style={{ minHeight: "100vh", padding: "1rem" }}
      >
        <Col xs={24} sm={20} md={16} lg={12} xl={8}>
          <Card
            bordered={false}
            style={{
              borderRadius: "20px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <Typography.Title
              level={2}
              style={{ textAlign: "center", marginBottom: "1rem" }}
            >
              Create an Account
            </Typography.Title>

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{ name: "", email: "", password: "" }}
            >
              <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: "Please enter your name" }]}
              >
                <Input placeholder="Your full name" />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Please enter your email" },
                  { type: "email", message: "Enter a valid email" },
                ]}
              >
                <Input placeholder="you@example.com" />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Please enter your password" },
                  { min: 6, message: "Password must be at least 6 characters" },
                ]}
              >
                <Input.Password placeholder="••••••••" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block>
                  Sign Up
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
