// app/admin/transactions/page.tsx
"use client"

import TransactionTabs from '../../components/TransactionTabs';
import { Card } from 'antd';

export default function TransactionManagement() {
  return (
    <div className="transaction-management">
      <Card>
        <TransactionTabs />
      </Card>
    </div>
  );
}
