import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ShoppingCart, Image as ImageIcon, Edit, Trash, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface MarketplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  location: string;
  image_url: string;
  vendor_id: string;
  vendor_name: string;
  vendor_avatar: string;
  created_at: string;
  status: 'available' | 'sold_out' | 'archived';
}

interface ListingFormData {
  title: string;
  description: string;
  price: string;
  quantity: string;
  category: string;
  location: string;
  availability: 'available' | 'sold_out' | 'archived';
  image: File | null;
}

const CATEGORIES = [
  'Vegetables',
  'Fruits',
  'Grains',
  'Seeds',
  'Herbs',
  'Other'
];

const MarketplaceModal = ({ isOpen, onClose }: MarketplaceModalProps) => {
  const { user, profile } = useAuth();
  const [isListingMode, setIsListingMode] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<ListingFormData>({
    title: '',
    description: '',
    price: '',
    quantity: '',
    category: '',
    location: '',
    availability: 'available',
    image: null
  });
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select(`
          *,
          vendor:vendor_id (
            name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProducts(data.map(item => ({
        ...item,
        vendor_name: item.vendor?.name || 'Unknown Vendor',
        vendor_avatar: item.vendor?.avatar_url
      })));
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load marketplace listings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsLoading(true);

      // Upload image if exists
      let image_url = null;
      if (formData.image) {
        const fileExt = formData.image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `marketplace/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, formData.image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        image_url = publicUrl;
      }

      // Create listing
      const { error } = await supabase
        .from('marketplace_listings')
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim(),
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity),
          category: formData.category,
          location: formData.location.trim(),
          image_url,
          vendor_id: user.id,
          status: formData.availability
        });

      if (error) {
        console.error('Error creating listing:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Product listed successfully.",
      });

      // Reset form and refresh products
      setFormData({
        title: '',
        description: '',
        price: '',
        quantity: '',
        category: '',
        location: '',
        availability: 'available',
        image: null
      });
      setImagePreview('');
      setIsListingMode(false);
      fetchProducts();
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: "Error",
        description: "Failed to create listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const ListingForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Product Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter product name"
            required
            className="focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            required
          >
            <SelectTrigger className="focus:ring-2 focus:ring-emerald-500">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(category => (
                <SelectItem key={category} value={category.toLowerCase()}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe your product"
          required
          className="min-h-[100px] focus:ring-2 focus:ring-emerald-500"
        />
          </div>
          
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="Enter your location"
            required
            className="focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <Label htmlFor="availability">Availability</Label>
          <Select
            value={formData.availability}
            onValueChange={(value: 'available' | 'sold_out' | 'archived') => 
              setFormData(prev => ({ ...prev, availability: value }))}
          >
            <SelectTrigger className="focus:ring-2 focus:ring-emerald-500">
              <SelectValue placeholder="Select availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="sold_out">Sold Out</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
                  </div>
                </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
          <Label htmlFor="price">Price (KES)</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
            placeholder="Enter price"
            required
            className="focus:ring-2 focus:ring-emerald-500"
          />
                  </div>
                  <div>
          <Label htmlFor="quantity">Quantity Available</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
            placeholder="Enter quantity"
            required
            className="focus:ring-2 focus:ring-emerald-500"
          />
        </div>
                  </div>

                  <div>
        <Label htmlFor="image">Product Image</Label>
        <div className="mt-1 flex items-center space-x-4">
          <div className="relative w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
          <div className="text-sm text-gray-500">
            Click to upload or drag and drop<br />
            PNG, JPG up to 5MB
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => setIsListingMode(false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating Listing..." : "Create Listing"}
        </Button>
      </div>
    </form>
  );

  const ProductGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Add Product Button */}
      <Card className="border-2 border-dashed border-gray-200 hover:border-emerald-500 cursor-pointer"
        onClick={() => setIsListingMode(true)}>
        <CardContent className="flex flex-col items-center justify-center h-full py-8">
          <Plus className="w-12 h-12 text-gray-400 mb-2" />
          <p className="text-gray-600">Add New Product</p>
        </CardContent>
      </Card>

      {/* Product Cards */}
      {products.map((product) => (
        <Card key={product.id}>
          <div className="aspect-square relative">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title}
                className="w-full h-full object-cover rounded-t-lg"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <ShoppingCart className="w-12 h-12 text-gray-400" />
              </div>
            )}
            <Badge 
              className={`absolute top-2 right-2 ${
                product.status === 'available' 
                  ? 'bg-green-100 text-green-800' 
                  : product.status === 'sold_out'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {product.status === 'available' ? 'In Stock' : 
               product.status === 'sold_out' ? 'Sold Out' : 'Archived'}
            </Badge>
                  </div>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                {product.vendor_avatar ? (
                  <img
                    src={product.vendor_avatar}
                    alt={product.vendor_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-emerald-600 text-sm">
                      {product.vendor_name?.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{product.vendor_name}</p>
                <p className="text-xs text-gray-500">{product.location}</p>
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-1">{product.title}</h3>
            <p className="text-sm text-gray-500 mb-2">{product.description}</p>
            <div className="flex items-center justify-between">
              <p className="font-bold text-emerald-600">KES {product.price.toFixed(2)}</p>
              <p className="text-sm text-gray-500">{product.quantity} available</p>
            </div>
            
            {user?.id !== product.vendor_id && product.status === 'available' && (
              <Button 
                className="w-full mt-2"
                onClick={() => {
                  // TODO: Implement chat functionality
                  toast({
                    title: "Coming Soon",
                    description: "Chat functionality will be available soon!",
                  });
                }}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat with Seller
              </Button>
            )}

            {user?.id === product.vendor_id && (
              <div className="flex justify-end space-x-2 mt-2">
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                  <Trash className="w-4 h-4 mr-1" />
                  Delete
                </Button>
                </div>
            )}
              </CardContent>
            </Card>
          ))}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Marketplace</DialogTitle>
          <DialogDescription>
            Buy and sell farm products within the community
          </DialogDescription>
        </DialogHeader>

        {isListingMode ? (
          <ListingForm />
        ) : (
          <ProductGrid />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MarketplaceModal;
