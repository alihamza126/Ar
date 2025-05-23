// app/admin/fines/page.tsx
"use client"

import FineManagement from '../../components/FineManagement';
import { Card } from 'antd';

export default function FineManagementPage() {
  return (
    <div className="fine-management">
      <Card>
        <FineManagement />
      </Card>
    </div>
  );
}
