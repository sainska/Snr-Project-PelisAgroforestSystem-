
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sprout, MapPin, FileText, ShoppingCart, Users, Shield } from "lucide-react";
import EnhancedAuthModal from "@/components/EnhancedAuthModal";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  if (profile) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-amber-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-emerald-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-emerald-800">Pelis Agroforest System</h1>
              <p className="text-sm text-emerald-600">NNECFA Digital Platform</p>
            </div>
          </div>
          <Button 
            onClick={() => setIsAuthOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Login / Register
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-emerald-800 mb-6">
            Advanced Digital Forest Management Platform
          </h2>
          <p className="text-lg text-emerald-700 mb-8 leading-relaxed">
            Join the enhanced Pelis Agroforest System with secure registration, payment verification, 
            marketplace integration, and comprehensive forest management tools for sustainable communities.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card className="border-emerald-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <MapPin className="w-12 h-12 text-emerald-600 mb-2" />
                <CardTitle className="text-emerald-800">Smart Plot Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-emerald-700">
                  Apply for plots with GPS tracking, view applicant counts, receive PDF permits 
                  with QR codes, and manage assignments digitally.
                </p>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="w-12 h-12 text-emerald-600 mb-2" />
                <CardTitle className="text-emerald-800">Advanced Reporting</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-emerald-700">
                  Submit detailed crop reports with photos, receive performance points, 
                  and benefit from officer reviews and monitoring assessments.
                </p>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <ShoppingCart className="w-12 h-12 text-emerald-600 mb-2" />
                <CardTitle className="text-emerald-800">Integrated Marketplace</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-emerald-700">
                  Buy and sell farm products, tools, and seedlings with photo uploads, 
                  trust scoring, and community reviews.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Features */}
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <Card className="border-blue-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="w-12 h-12 text-blue-600 mb-2" />
                <CardTitle className="text-blue-800">Secure Registration</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-blue-700 text-left space-y-2">
                  <li>• National ID verification with document upload</li>
                  <li>• Face photo validation for security</li>
                  <li>• M-Pesa payment integration (Ksh 300)</li>
                  <li>• Email verification workflow</li>
                  <li>• Officer approval requirement</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-purple-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="w-12 h-12 text-purple-600 mb-2" />
                <CardTitle className="text-purple-800">Community Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-purple-700 text-left space-y-2">
                  <li>• Real-time messaging and announcements</li>
                  <li>• Conflict resolution system</li>
                  <li>• Trust scoring and community reviews</li>
                  <li>• Performance tracking and rewards</li>
                  <li>• Role-based access control</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12">
            <Button 
              size="lg"
              onClick={() => setIsAuthOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg"
            >
              Start Your Journey Today
            </Button>
            <p className="text-emerald-600 text-sm mt-4">
              Secure • Verified • Community-Driven
            </p>
          </div>
        </div>
      </div>

      <EnhancedAuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => navigate('/dashboard')}
      />
    </div>
  );
};

export default Index;
