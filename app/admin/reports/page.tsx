// app/admin/reports/page.tsx
"use client"

import ReportGenerator from '../../components/ReportGenerator';
import { Card, Tabs } from 'antd';

const ReportsPage = () => {
  const tabItems = [
    {
      key: 'books',
      label: 'Books Report',
      children: <ReportGenerator type="books" />
    },
    {
      key: 'users',
      label: 'Users Report',
      children: <ReportGenerator type="users" />
    },
    {
      key: 'transactions',
      label: 'Transactions Report',
      children: <ReportGenerator type="transactions" />
    },
    {
      key: 'fines',
      label: 'Fines Report',
      children: <ReportGenerator type="fines" />
    }
  ];

  return (
    <Card>
      <Tabs items={tabItems} />
    </Card>
  );
};

export default ReportsPage;
