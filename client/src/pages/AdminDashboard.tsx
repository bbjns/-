import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import './AdminDashboard.css';

interface Stats {
  totalUsers: number;
  premiumUsers: number;
  totalOrders: number;
  revenue: number;
}

interface User {
  id: string;
  email: string;
  isPremium: boolean;
  isAdmin: boolean;
  createdAt: string;
}

interface Order {
  id: string;
  userId: string;
  amount: number;
  duration: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'orders'>('dashboard');
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, premiumUsers: 0, totalOrders: 0, revenue: 0 });
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL || '/api';

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const response = await axios.get(`${apiUrl}/admin/stats`);
        setStats(response.data);
      } else if (activeTab === 'users') {
        const response = await axios.get(`${apiUrl}/admin/users`);
        setUsers(response.data);
      } else if (activeTab === 'orders') {
        const response = await axios.get(`${apiUrl}/admin/orders`);
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOrder = async (orderId: string) => {
    try {
      await axios.post(`${apiUrl}/admin/orders/${orderId}/approve`);
      alert('订单已批准');
      loadData();
    } catch (error) {
      alert('操作失败');
    }
  };

  return (
    <div className="container admin-page">
      <div className="admin-header">
        <h1>{t('admin.dashboard')}</h1>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          {t('admin.dashboard')}
        </button>
        <button
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          {t('admin.users')}
        </button>
        <button
          className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          {t('admin.orders')}
        </button>
      </div>

      {loading ? (
        <div className="loading">{t('common.loading')}</div>
      ) : (
        <>
          {activeTab === 'dashboard' && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <div className="stat-label">{t('admin.totalUsers')}</div>
                  <div className="stat-value">{stats.totalUsers}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-info">
                  <div className="stat-label">{t('admin.premiumUsers')}</div>
                  <div className="stat-value">{stats.premiumUsers}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📦</div>
                <div className="stat-info">
                  <div className="stat-label">{t('admin.totalOrders')}</div>
                  <div className="stat-value">{stats.totalOrders}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <div className="stat-label">{t('admin.revenue')}</div>
                  <div className="stat-value">${stats.revenue}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="card">
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>邮箱</th>
                      <th>会员状态</th>
                      <th>管理员</th>
                      <th>注册时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id.substring(0, 8)}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`badge ${user.isPremium ? 'premium' : 'free'}`}>
                            {user.isPremium ? '高级会员' : '免费'}
                          </span>
                        </td>
                        <td>{user.isAdmin ? '是' : '否'}</td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="card">
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>订单号</th>
                      <th>用户ID</th>
                      <th>金额</th>
                      <th>时长</th>
                      <th>支付方式</th>
                      <th>状态</th>
                      <th>创建时间</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.id.substring(0, 8)}</td>
                        <td>{order.userId.substring(0, 8)}</td>
                        <td>${order.amount}</td>
                        <td>{order.duration}个月</td>
                        <td>{order.paymentMethod}</td>
                        <td>
                          <span className={`badge ${order.status}`}>
                            {order.status === 'pending' ? '待处理' : order.status === 'completed' ? '已完成' : '已取消'}
                          </span>
                        </td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>
                          {order.status === 'pending' && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleApproveOrder(order.id)}
                            >
                              批准
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
