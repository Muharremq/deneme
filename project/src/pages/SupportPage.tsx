import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, ChevronDown, ChevronUp, Inbox } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supportApi, productApi } from '../services/api';
import { Product, SupportTicket } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const SupportPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [showTickets, setShowTickets] = useState(false);
  const [userTickets, setUserTickets] = useState<SupportTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    relatedProductId: ''
  });

  // Admin kullanıcılarının erişimini engelle
  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Ürünleri yükle
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await productApi.getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Failed to load products:', error);
      }
    };
    
    loadProducts();
  }, []);

  // Kullanıcının biletlerini yükle
  useEffect(() => {
    if (showTickets && isAuthenticated && user) {
      const loadUserTickets = async () => {
        try {
          const tickets = await supportApi.getTickets(user.id);
          setUserTickets(tickets);
        } catch (error) {
          console.error('Failed to load user tickets:', error);
        }
      };
      
      loadUserTickets();
    }
  }, [showTickets, isAuthenticated, user]);

  // Form değişikliklerini izle
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Bilete tıklama işleyicisi
  const handleTicketClick = (ticketId: string) => {
    setSelectedTicketId(prevId => prevId === ticketId ? null : ticketId);
  };

  // Ürün adını bul
  const getProductName = (productId: string) => {
    if (!productId) return 'No Product Selected';
    
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  // Formu gönder
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      navigate('/login', { state: { redirect: '/support' } });
      return;
    }
    
    try {
      setLoading(true);
      
      // Şikayet oluştur
      await supportApi.createTicket(
        user.id,
        user.name,
        formData.subject,
        formData.message,
        formData.relatedProductId
      );
      
      setSuccess(true);
      
      // Eğer biletler görüntüleniyorsa, yeni bileti görmek için yenile
      if (showTickets) {
        const tickets = await supportApi.getTickets(user.id);
        setUserTickets(tickets);
      }
      
      // Formu temizle
      setFormData({
        subject: '',
        message: '',
        relatedProductId: ''
      });
      
      // 3 saniye sonra başarı mesajını kaldır
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Failed to submit support ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Customer Support</h1>
          
          {/* Biletleri Görüntüle Butonu */}
          <Button 
            variant="outline" 
            onClick={() => setShowTickets(!showTickets)}
            className="flex items-center"
          >
            {showTickets ? 'Hide Tickets' : 'View My Tickets'}
            {showTickets ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : (
              <ChevronDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        </div>
        
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <Send className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Your support ticket has been submitted successfully! We will get back to you as soon as possible.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Bilet Listesi */}
        {showTickets && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">My Support Tickets</h2>
            
            {userTickets.length === 0 ? (
              <div className="text-center py-6">
                <Inbox className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500">You don't have any support tickets yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userTickets.map(ticket => (
                  <div key={ticket.id} className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50" onClick={() => handleTicketClick(ticket.id)}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{ticket.subject}</h3>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        ticket.status === 'open'
                          ? 'bg-yellow-100 text-yellow-800'
                          : ticket.status === 'inProgress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                    
                    {selectedTicketId === ticket.id && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-gray-700 mb-2">{ticket.message}</p>
                        {ticket.relatedProductId && (
                          <p className="text-sm text-gray-500">
                            Related Product: {getProductName(ticket.relatedProductId)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Submit a Support Ticket</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Kullanıcı Bilgileri (Salt Okunur) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Your Name"
                  value={user?.name || ''}
                  disabled
                  fullWidth
                />
                
                <Input
                  label="Email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  fullWidth
                />
              </div>
              
              {/* Ticket Bilgileri */}
              <Input
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                fullWidth
              />
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your issue in detail..."
                ></textarea>
              </div>
              
              {/* İlgili Ürün Seçimi */}
              <div>
                <label htmlFor="relatedProductId" className="block text-sm font-medium text-gray-700 mb-1">
                  Related Product (Optional)
                </label>
                <select
                  id="relatedProductId"
                  name="relatedProductId"
                  value={formData.relatedProductId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- Select a product (optional) --</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <Button
                type="submit"
                isLoading={loading}
                disabled={!isAuthenticated || loading}
                className="flex items-center justify-center"
              >
                <Send size={18} className="mr-2" />
                Submit Ticket
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;