
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation, MapPin, Phone, Clock } from "lucide-react";

interface DirectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DirectionsModal = ({ isOpen, onClose }: DirectionsModalProps) => {
  const locations = [
    {
      id: 1,
      name: "NNECFA Main Office",
      address: "Kapsabet Town, Nandi County",
      coordinates: "0.2028° N, 35.1011° E",
      phone: "+254 712 345 678",
      hours: "Mon-Fri: 8:00 AM - 5:00 PM",
      description: "Main administrative office for plot applications and general inquiries"
    },
    {
      id: 2,
      name: "Community Center",
      address: "Mosoriot Center, Nandi County",
      coordinates: "0.1953° N, 35.0876° E",
      phone: "+254 723 456 789",
      hours: "Daily: 7:00 AM - 6:00 PM",
      description: "Community meetings, training sessions, and local services"
    },
    {
      id: 3,
      name: "Field Station - Sector 1",
      address: "Chepkongony Area, Nandi County",
      coordinates: "0.2155° N, 35.0923° E",
      phone: "+254 734 567 890",
      hours: "Mon-Sat: 7:00 AM - 4:00 PM",
      description: "Field monitoring and forest management activities"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Navigation className="h-5 w-5 mr-2 text-emerald-600" />
            NNECFA Locations & Directions
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {locations.map((location) => (
            <Card key={location.id} className="border-emerald-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-emerald-600" />
                  {location.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-700">{location.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Address:</p>
                    <p className="text-gray-800">{location.address}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Coordinates:</p>
                    <p className="text-gray-800 font-mono text-sm">{location.coordinates}</p>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-emerald-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Phone:</p>
                      <p className="text-gray-800">{location.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-emerald-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Hours:</p>
                      <p className="text-gray-800">{location.hours}</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-500 mb-2">Get directions:</p>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 text-sm bg-emerald-100 text-emerald-800 rounded-md hover:bg-emerald-200 transition-colors"
                    >
                      Google Maps
                    </a>
                    <a
                      href={`https://maps.apple.com/?q=${encodeURIComponent(location.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      Apple Maps
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <div className="text-center py-4 bg-emerald-50 rounded-lg">
            <p className="text-emerald-800 font-medium">Need Help Finding Us?</p>
            <p className="text-emerald-600 text-sm">Call our main office at +254 712 345 678 for assistance</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DirectionsModal;
