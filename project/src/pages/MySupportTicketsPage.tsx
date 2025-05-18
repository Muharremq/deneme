import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, AlertCircle, CheckCircle, Clock, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supportApi, productApi } from '../services/api';
import { SupportTicket, Product, TicketStatus } from '../types';
import Button from '../components/ui/Button';

const MySupportTicketsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated || !user) return;
      
      try {
        setLoading(true);
        
        // Kullanıcının tüm destek taleplerini getir
        const ticketsData = await supportApi.getUserTickets(user.id);
        setTickets(ticketsData);
        
        // Ürün referansları için ürünleri getir
        const productsData = await productApi.getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error('Failed to load support tickets:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [isAuthenticated, user]);

  // Ürün adını ID'ye göre bul
  const getProductName = (productId: string) => {
    if (!productId) return 'No Product Selected';
    
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  // Bilet detaylarını göster/gizle
  const handleToggleDetails = (ticketId: string) => {
    setSelectedTicketId(prevId => prevId === ticketId ? null : ticketId);
  };

  // Bilet durumuna göre renk ve icon belirle
  const getStatusInfo = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.OPEN:
        return { color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={16} className="mr-1" /> };
      case TicketStatus.IN_PROGRESS:
        return { color: 'bg-blue-100 text-blue-800', icon: <Loader size={16} className="mr-1" /> };
      case TicketStatus.RESOLVED:
        return { color: 'bg-green-100 text-green-800', icon: <CheckCircle size={16} className="mr-1" /> };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: null };
    }
  };
  
  // Bilet tarihini formatla
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-2 text-lg font-medium text-gray-900">Authentication Required</h2>
          <p className="mt-1 text-gray-500">Please log in to view your support tickets.</p>
          <div className="mt-6">
            <Link to="/login">
              <Button>Log In</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Support Tickets</h1>
          <Link to="/support">
            <Button className="flex items-center">
              <Send size={16} className="mr-2" />
              New Ticket
            </Button>
          </Link>
        </div>
        
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Loader className="mx-auto h-8 w-8 text-blue-500 animate-spin" />
            <p className="mt-2 text-gray-500">Loading your support tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-2 text-lg font-medium text-gray-900">No Support Tickets Found</h2>
            <p className="mt-1 text-gray-500">You haven't submitted any support tickets yet.</p>
            <div className="mt-6">
              <Link to="/support">
                <Button>Create New Ticket</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => {
              const { color, icon } = getStatusInfo(ticket.status);
              
              return (
                <div key={ticket.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleToggleDetails(ticket.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{ticket.subject}</h3>
                        <p className="text-sm text-gray-500">
                          Submitted on {formatDate(ticket.createdAt)}
                        </p>
                        {ticket.relatedProductId && (
                          <p className="text-sm text-gray-500">
                            Product: {getProductName(ticket.relatedProductId)}
                          </p>
                        )}
                      </div>
                      <span className={`flex items-center px-2 py-1 text-xs font-semibold rounded-full ${color}`}>
                        {icon}
                        {ticket.status}
                      </span>
                    </div>
                    
                    {selectedTicketId === ticket.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="bg-gray-50 p-3 rounded mb-4">
                          <p className="text-gray-700 whitespace-pre-wrap">{ticket.message}</p>
                        </div>
                        
                        {ticket.updatedAt !== ticket.createdAt && (
                          <p className="text-xs text-gray-500 mt-2">
                            Last updated: {formatDate(ticket.updatedAt)}
                          </p>
                        )}
                        
                        {ticket.status === TicketStatus.RESOLVED && (
                          <div className="mt-4 bg-green-50 p-3 rounded border border-green-200">
                            <div className="flex items-start">
                              <CheckCircle size={20} className="text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                              <div>
                                <h4 className="text-sm font-medium text-green-800">Ticket Resolved</h4>
                                <p className="text-sm text-green-700">
                                  This ticket has been marked as resolved by our support team.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MySupportTicketsPage;