import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface BasicPopupProps {
  onClose: () => void;
}

const BasicPopup: React.FC<BasicPopupProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Test Form</h2>
          <button onClick={onClose} className="p-1">
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <form>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Type here continuously..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea 
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Type here continuously..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <input 
                type="number" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="1000"
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <button 
                type="submit"
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
              >
                Save
              </button>
              <button 
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BasicPopup;