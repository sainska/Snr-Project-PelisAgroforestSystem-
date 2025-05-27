
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package, Calendar } from "lucide-react";

interface MarketplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MarketplaceModal = ({ isOpen, onClose }: MarketplaceModalProps) => {
  // Mock marketplace data - would be fetched from database in real implementation
  const marketplaceItems = [
    {
      id: 1,
      title: "Organic Tomatoes",
      price: "KSh 80/kg",
      seller: "John Kimani",
      location: "Kapsabet",
      category: "Vegetables",
      available: true,
      postedDate: "2 days ago"
    },
    {
      id: 2,
      title: "Fresh Maize",
      price: "KSh 60/kg",
      seller: "Mary Cherop",
      location: "Mosoriot",
      category: "Grains",
      available: true,
      postedDate: "1 week ago"
    },
    {
      id: 3,
      title: "Farm Tools Set",
      price: "KSh 3,500",
      seller: "Peter Kigen",
      location: "Nandi Hills",
      category: "Equipment",
      available: false,
      postedDate: "3 days ago"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2 text-emerald-600" />
            NNECFA Marketplace
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center py-4 bg-emerald-50 rounded-lg">
            <p className="text-emerald-800 font-medium">Community Marketplace</p>
            <p className="text-emerald-600 text-sm">Buy and sell farm products within NNECFA community</p>
          </div>
          
          {marketplaceItems.map((item) => (
            <Card key={item.id} className="border-emerald-200">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg flex items-center">
                    <Package className="h-5 w-5 mr-2 text-emerald-600" />
                    {item.title}
                  </CardTitle>
                  <div className="text-right">
                    <p className="font-bold text-emerald-700">{item.price}</p>
                    <Badge 
                      variant={item.available ? "default" : "secondary"}
                      className={item.available ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
                    >
                      {item.available ? "Available" : "Sold"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Seller:</p>
                    <p className="font-medium">{item.seller}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Location:</p>
                    <p className="font-medium">{item.location}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Category:</p>
                    <Badge variant="outline">{item.category}</Badge>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {item.postedDate}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">More marketplace features coming soon!</p>
            <p className="text-xs">Contact NNECFA office to list your products</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MarketplaceModal;
