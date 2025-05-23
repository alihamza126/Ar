// app/student/dashboard/page.tsx
"use client"
import CurrentBorrows from '../../components/CurrentBorrows';
import StudentBookBorrow from '../../components/StudentBookBorrow';
import { Card, Tabs } from 'antd';

export default function StudentDashboard() {
  const items = [
    {
      key: 'borrow',
      label: 'Borrow Books',
      children: <StudentBookBorrow />
    },
    {
      key: 'my-books',
      label: 'My Borrowed Books',
      children: <CurrentBorrows />
    }
  ];

  return (
    <Card title="Teacher Dashboard">
      <Tabs items={items} />
    </Card>
  );
}
