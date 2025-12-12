import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Factory, Star } from 'lucide-react';

const RoleSelectionPage = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      id: 'BUYER',
      title: 'Sign up as Buyer',
      icon: ShoppingCart,
      description: 'AI-based access to the finest machined parts and the best pricing. Global reach, locally.',
      color: '#4881F8'
    },
    {
      id: 'MANUFACTURER',
      title: 'Sign up as Manufacturer',
      icon: Factory,
      description: 'AI-based direct access to new projects. Connect with buyers needing your technology and expertise.',
      color: '#4881F8'
    },
    {
      id: 'HYBRID',
      title: 'Sign up as Hybrid',
      icon: Star,
      description: 'AI-based matching. Enjoy the benefits of both buying and manufacturing with our network.',
      color: '#4881F8'
    }
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    navigate(`/register?role=${roleId}`);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <img 
              src="/indianet png.png" 
              alt="Enigma Logo" 
              className="h-16 w-auto object-contain"
            />
          </div>
          <p className="text-gray-600">Next-Generation Manufacturing Procurement Platform</p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <div
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                className={`
                  p-8 rounded-lg border-2 cursor-pointer transition-all duration-300
                  ${isSelected 
                    ? 'border-[#4881F8] shadow-lg bg-blue-50' 
                    : 'border-gray-200 hover:border-[#4881F8] hover:shadow-md bg-white'
                  }
                `}
                style={{
                  borderColor: isSelected ? '#4881F8' : undefined
                }}
              >
                <div className="text-center">
                  <div 
                    className="mx-auto mb-4 p-4 rounded-full inline-block"
                    style={{ backgroundColor: `${role.color}20` }}
                  >
                    <Icon size={40} style={{ color: role.color }} />
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: '#4881F8' }}>
                    {role.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {role.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Already have account */}
        <div className="text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-semibold hover:underline"
              style={{ color: '#4881F8' }}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionPage;

