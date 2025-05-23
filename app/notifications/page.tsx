// app/notifications/page.tsx
"use client"

import NotificationCenter from '@app/components/NotificationCenter';
// import NotificationCenter from '../../components/NotificationCenter';
import { Card } from 'antd';

export default function NotificationsPage() {
  return (
    <div className="notifications">
      <Card title="Your Notifications">
        <NotificationCenter fullView={true} />
      </Card>
    </div>
  );
}
