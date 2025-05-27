
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, Calendar, AlertCircle } from "lucide-react";

interface MessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MessagesModal = ({ isOpen, onClose }: MessagesModalProps) => {
  // Mock messages data - would be fetched from database in real implementation
  const messages = [
    {
      id: 1,
      title: "Monthly Community Meeting",
      sender: "NNECFA Admin",
      content: "Reminder: Monthly community meeting scheduled for next Friday at 2 PM at the community center.",
      type: "announcement",
      date: "Today",
      isRead: false
    },
    {
      id: 2,
      title: "Crop Disease Alert",
      sender: "Forest Officer Jane",
      content: "Alert: Cases of coffee berry disease reported in Sector 3. Please inspect your crops and report any symptoms.",
      type: "alert",
      date: "Yesterday",
      isRead: true
    },
    {
      id: 3,
      title: "Welcome to NNECFA",
      sender: "System",
      content: "Welcome to the Nandi North Escarpment Community Forest Association! Your account has been approved.",
      type: "system",
      date: "1 week ago",
      isRead: true
    }
  ];

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'announcement':
        return <Users className="h-5 w-5 text-blue-600" />;
      default:
        return <MessageSquare className="h-5 w-5 text-emerald-600" />;
    }
  };

  const getMessageBadge = (type: string) => {
    switch (type) {
      case 'alert':
        return <Badge className="bg-red-100 text-red-800">Alert</Badge>;
      case 'announcement':
        return <Badge className="bg-blue-100 text-blue-800">Announcement</Badge>;
      default:
        return <Badge className="bg-emerald-100 text-emerald-800">Message</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-emerald-600" />
            Community Messages
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {messages.map((message) => (
            <Card 
              key={message.id} 
              className={`border-emerald-200 ${!message.isRead ? 'bg-emerald-50' : ''}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg flex items-center">
                    {getMessageIcon(message.type)}
                    <span className="ml-2">{message.title}</span>
                    {!message.isRead && (
                      <div className="w-2 h-2 bg-emerald-500 rounded-full ml-2"></div>
                    )}
                  </CardTitle>
                  {getMessageBadge(message.type)}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>From: {message.sender}</span>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {message.date}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{message.content}</p>
              </CardContent>
            </Card>
          ))}
          
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Stay connected with your community!</p>
            <p className="text-xs">Important announcements and updates will appear here</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessagesModal;
