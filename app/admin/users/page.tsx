// app/admin/users/page.tsx
"use client"

import UserList from '../../components/UserList';
import { Card } from 'antd';

export default function UserManagement() {
  return (
    <div className="user-management">
      <Card>
        <UserList />
      </Card>
    </div>
  );
}
