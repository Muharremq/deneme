import React, { useState, useEffect } from 'react';
import { Users, ShoppingBag, BarChart2, Settings, Shield, AlertTriangle, AlertCircle, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Product, SupportTicket, TicketStatus, User, UserRole } from '../../types';
import { productApi, supportApi, authApi } from '../../services/api';
import Button from '../../components/ui/Button';


interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  pendingApprovals: number;
}

const mockStats: DashboardStats = {
  totalUsers: 1547,
  totalProducts: 892,
  totalOrders: 3254,
  totalRevenue: 157892.45,
  activeUsers: 892,
  pendingApprovals: 23
};

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  useEffect(() => {
    if (activeSection === 'user-management') {
      loadUsers();
    } else if (activeSection === 'product-moderation') {
      loadProducts();
    } else if (activeSection === 'reports') {
      loadTickets();
    }
  }, [activeSection]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await authApi.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await productApi.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const loadTickets = async () => {
    try {
      const data = await supportApi.getTickets();
      setTickets(data);
    } catch (error) {
      console.error('Failed to load tickets:', error);
    }
  };

    // Bilet detaylarını görüntüleme fonksiyonu
const handleViewTicketDetails = (ticketId: string) => {
  setSelectedTicketId(prevId => prevId === ticketId ? null : ticketId);
};

// Ürün adını ürün ID'si ile bulmak için yardımcı fonksiyon
const getProductName = (productId: string) => {
  const product = products.find(p => p.id === productId);
  return product ? product.name : 'Unknown Product';
};


  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await productApi.deleteProduct(productId);
      loadProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: TicketStatus) => {
    try {
      await supportApi.updateTicketStatus(ticketId, status);
      loadTickets();
    } catch (error) {
      console.error('Failed to update ticket status:', error);
    }
  };
  
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await authApi.deleteUser(userId);
      loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need to be logged in as an admin to view this page.</p>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'user-management':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">User Management</h2>
            
            {loading ? (
              <div className="animate-pulse">
                <div className="h-10 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="h-10 w-10 rounded-full mr-3"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                <Users size={20} className="text-gray-500" />
                              </div>
                            )}
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === UserRole.ADMIN 
                              ? 'bg-red-100 text-red-800' 
                              : user.role === UserRole.SELLER 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.phone || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 size={16} className="mr-1" />
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 'product-moderation':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Product Moderation</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(product.price)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.stock}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 size={16} className="mr-1" />
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

     case 'reports':
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Reports & Issues</h2>
      {loading ? (
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {!tickets || tickets.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No tickets found</h3>
              <p className="mt-1 text-sm text-gray-500">There are no support tickets at this time.</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket.id} className="border rounded-lg overflow-hidden">
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleViewTicketDetails(ticket.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{ticket.subject}</h3>
                      <p className="text-sm text-gray-500">
                        From: {ticket.userName} ({ticket.userId})
                      </p>
                      <p className="text-sm text-gray-500">
                        Created: {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                      {ticket.relatedProductId && (
                        <p className="text-sm text-gray-500">
                          Related Product: {getProductName(ticket.relatedProductId)}
                        </p>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      ticket.status === TicketStatus.OPEN
                        ? 'bg-yellow-100 text-yellow-800'
                        : ticket.status === TicketStatus.IN_PROGRESS
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                  
                  {selectedTicketId === ticket.id && (
                    <div className="mt-4 border-t pt-4">
                      <p className="text-gray-700 mb-4">{ticket.message}</p>
                      <div className="flex justify-end space-x-2">
                        {ticket.status === TicketStatus.OPEN && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateTicketStatus(ticket.id, TicketStatus.IN_PROGRESS);
                            }}
                          >
                            Start Processing
                          </Button>
                        )}
                        {ticket.status === TicketStatus.IN_PROGRESS && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateTicketStatus(ticket.id, TicketStatus.RESOLVED);
                            }}
                          >
                            Mark as Resolved
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <h3 className="text-xl font-bold text-gray-900">{mockStats.totalUsers}</h3>
                <p className="text-sm text-gray-500">{mockStats.activeUsers} active now</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <ShoppingBag className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Products</p>
                <h3 className="text-xl font-bold text-gray-900">{mockStats.totalProducts}</h3>
                <p className="text-sm text-gray-500">{mockStats.pendingApprovals} pending approval</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <BarChart2 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <h3 className="text-xl font-bold text-gray-900">
                  {formatCurrency(mockStats.totalRevenue)}
                </h3>
                <p className="text-sm text-gray-500">{mockStats.totalOrders} orders</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => setActiveSection('user-management')}
            className={`bg-white rounded-lg shadow-md p-6 hover:bg-gray-50 transition-colors ${
              activeSection === 'user-management' ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4 text-left">
                <h3 className="text-lg font-medium text-gray-900">User Management</h3>
                <p className="text-sm text-gray-500">Manage user accounts and permissions</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveSection('product-moderation')}
            className={`bg-white rounded-lg shadow-md p-6 hover:bg-gray-50 transition-colors ${
              activeSection === 'product-moderation' ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4 text-left">
                <h3 className="text-lg font-medium text-gray-900">Product Moderation</h3>
                <p className="text-sm text-gray-500">Review and approve product listings</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveSection('reports')}
            className={`bg-white rounded-lg shadow-md p-6 hover:bg-gray-50 transition-colors ${
              activeSection === 'reports' ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4 text-left">
                <h3 className="text-lg font-medium text-gray-900">Reports & Issues</h3>
                <p className="text-sm text-gray-500">Handle user reports and system issues</p>
              </div>
            </div>
          </button>
        </div>

        {/* Active Section Content */}
        {renderSection()}

        {/* Performance Metrics */}
        {!activeSection && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Performance Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">User Growth</h3>
                <p className="text-2xl font-bold text-gray-900">+12.5%</p>
                <p className="text-sm text-green-600">↑ 2.3% from last month</p>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Order Success Rate</h3>
                <p className="text-2xl font-bold text-gray-900">98.2%</p>
                <p className="text-sm text-green-600">↑ 0.5% from last month</p>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Average Response Time</h3>
                <p className="text-2xl font-bold text-gray-900">1.2h</p>
                <p className="text-sm text-red-600">↓ 0.3h from target</p>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">System Uptime</h3>
                <p className="text-2xl font-bold text-gray-900">99.9%</p>
                <p className="text-sm text-green-600">↑ 0.1% from last month</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;