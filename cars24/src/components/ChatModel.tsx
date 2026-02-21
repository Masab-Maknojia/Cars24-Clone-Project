import React, { useState } from "react";
import { X, Send } from "lucide-react";
import { toast } from "sonner";
import { sendMessage } from "@/lib/Chatapi";
import { sendLocalNotification } from "@/lib/utils"; // <--- Imported our new helper!

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  senderId: string;
  receiverId: string;
  carName: string;
}

const ChatModel = ({ isOpen, onClose, senderId, receiverId, carName }: ChatModalProps) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!message.trim()) return;
    setLoading(true);

    try {
      await sendMessage({
        senderId,
        receiverId,
        content: `[Re: ${carName}] ${message}`,
        timestamp: new Date().toISOString(),
      });
      
      await sendLocalNotification(
        "Message Sent!", 
        `Your message regarding the ${carName} has been delivered.`
      );

      toast.success("Message sent to seller!");
      setMessage("");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl text-black">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Contact Seller</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Asking about: <span className="font-semibold">{carName}</span>
        </p>

        <textarea
          className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500 text-black"
          rows={4}
          placeholder="Is the price negotiable?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSend}
            disabled={loading}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="w-4 h-4 mr-2" />
            {loading ? "Sending..." : "Send Message"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatModel;