import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

interface SystemStats {
  users: {
    total: number;
    vip: number;
    newToday: number;
    vipRate: string;
  };
  orders: {
    total: number;
    completed: number;
    pending: number;
    completionRate: string;
  };
  revenue: {
    total: string;
    currency: string;
  };
  calculations: {
    total: number;
    today: number;
  };
}

interface User {
  _id: string;
  email: string;
  username: string;
  isVip: boolean;
  vipExpiry?: string;
  createdAt: string;
}

interface PaymentOrder {
  _id: string;
  userId: {
    email: string;
    username: string;
  };
  amount: string;
  method: string;
  status: string;
  paymentData: {
    packageName: string;
  };
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(false);

  // 检查管理员权限
  if (!user?.isVip) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchStats();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/stats');
      setStats(response.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || '获取统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/users');
      setUsers(response.data.data.users);
    } catch (error: any) {
      toast.error(error.response?.data?.error || '获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/orders');
      setOrders(response.data.data.orders);
    } catch (error: any) {
      toast.error(error.response?.data?.error || '获取订单列表失败');
    } finally {
      setLoading(false);
    }
  };

  const updateUserVip = async (userId: string, isVip: boolean, vipExpiry?: string) => {
    try {
      await axios.put(`/admin/users/${userId}/vip`, { isVip, vipExpiry });
      toast.success('VIP状态更新成功');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'VIP状态更新失败');
    }
  };

  const confirmOrder = async (orderId: string) => {
    try {
      await axios.put(`/admin/orders/${orderId}/confirm`);
      toast.success('订单确认成功');
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.error || '订单确认失败');
    }
  };

  const tabs = [
    { id: 'overview', label: '系统概览', icon: '📊' },
    { id: 'users', label: '用户管理', icon: '👥' },
    { id: 'orders', label: '订单管理', icon: '💳' },
    { id: 'settings', label: '系统设置', icon: '⚙️' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-8 pt-20 lg:pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            管理后台
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            系统管理和数据监控
          </p>
        </motion.div>

        {/* 标签页导航 */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-dark-600">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* 内容区域 */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {loading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          )}

          {/* 系统概览 */}
          {activeTab === 'overview' && stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400">👥</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总用户数</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.users.total}</p>
                    <p className="text-xs text-gray-500">VIP用户: {stats.users.vip} ({stats.users.vipRate}%)</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 dark:text-green-400">💳</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">订单总数</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.orders.total}</p>
                    <p className="text-xs text-gray-500">完成率: {stats.orders.completionRate}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                      <span className="text-yellow-600 dark:text-yellow-400">💰</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总收入</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">¥{stats.revenue.total}</p>
                    <p className="text-xs text-gray-500">待处理: {stats.orders.pending}个订单</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 dark:text-purple-400">🧮</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">计算次数</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.calculations.total}</p>
                    <p className="text-xs text-gray-500">今日: {stats.calculations.today}次</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 用户管理 */}
          {activeTab === 'users' && (
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-600">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">用户列表</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-600">
                  <thead className="bg-gray-50 dark:bg-dark-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        用户
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        VIP状态
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        注册时间
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-600">
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.username}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isVip 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                          }`}>
                            {user.isVip ? 'VIP会员' : '普通用户'}
                          </span>
                          {user.vipExpiry && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              到期: {new Date(user.vipExpiry).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => updateUserVip(user._id, !user.isVip)}
                            className={`${
                              user.isVip 
                                ? 'text-red-600 hover:text-red-900 dark:text-red-400'
                                : 'text-green-600 hover:text-green-900 dark:text-green-400'
                            }`}
                          >
                            {user.isVip ? '取消VIP' : '设为VIP'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 订单管理 */}
          {activeTab === 'orders' && (
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-600">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">订单列表</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-600">
                  <thead className="bg-gray-50 dark:bg-dark-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        用户
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        套餐
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        金额
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        状态
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-600">
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {order.userId.username}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {order.userId.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {order.paymentData.packageName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ¥{order.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.status === 'completed'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {order.status === 'completed' ? '已完成' : 
                             order.status === 'pending' ? '待处理' : '已失败'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {order.status === 'pending' && (
                            <button
                              onClick={() => confirmOrder(order._id)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400"
                            >
                              确认支付
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

          {/* 系统设置 */}
          {activeTab === 'settings' && (
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">系统设置</h3>
              <p className="text-gray-600 dark:text-gray-400">
                系统设置功能正在开发中...
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;