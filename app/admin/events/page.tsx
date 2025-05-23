// app/admin/events/page.tsx
"use client"


import EventManagement from '../../components/EventManagement';
import { Card } from 'antd';

export default function EventManagementPage() {
  return (
    <div className="event-management">
      <Card>
        <EventManagement />
      </Card>
    </div>
  );
}
