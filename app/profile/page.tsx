// app/profile/page.tsx
"use client"

import UserProfile from '@app/components/UserProfile';
// import UserProfile from '../../components/UserProfile';
import { Card } from 'antd';

export default function ProfilePage() {
  return (
    <div className="profile">
      <Card>
        <UserProfile />
      </Card>
    </div>
  );
}
