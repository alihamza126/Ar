"use client"
import { Tabs } from 'antd';
import BookIssueForm from './BookIssueForm';
import BookReturnList from './BookReturnList';


const TransactionTabs = () => {
  const items = [
    {
      key: 'issue',
      label: 'Issue Books',
      children: <BookIssueForm />
    },
    {
      key: 'return',
      label: 'Returns & Fines',
      children: <BookReturnList />
    }
  ];

  return <Tabs items={items} />;
};

export default TransactionTabs;
