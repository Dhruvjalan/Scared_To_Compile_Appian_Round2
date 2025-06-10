'use client';

import { ThumbsDown } from 'lucide-react';
import React, { useState } from 'react';

type DownvotePayload = {
  product_id: string | number;
  user_query: string;
  search_type?: 'text' | 'image' | 'multimodal';
  reason?: 'not_relevant' | 'wrong_category' | 'wrong_style' | 'wrong_color' | 'poor_quality';
  user_session?: string;
};

const DownvoteButton: React.FC<{ productId: string | number; userQuery: string }> = ({ productId, userQuery }) => {
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);

  const handleDownvote = async () => {
    setLoading(true);
    setResponseMessage(null);

    const payload: DownvotePayload = {
      product_id: productId,
      user_query: userQuery,
      search_type: 'text', // or 'image', 'multimodal' depending on your UI context
      reason: 'not_relevant', // You can make this selectable if needed
      user_session: 'test-session-123', // You can pass actual session ID if available
    };

    try {
      const res = await fetch('http://localhost:5000/feedback/downvote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setResponseMessage(`✅ Success: ${data.message}`);
      } else {
        setResponseMessage(`❌ Error: ${data.error}`);
      }
    } catch (error: any) {
      setResponseMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-4 px-4" >
      <button
        onClick={handleDownvote}
        disabled={loading}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
      >
        {loading ? 'Submitting...' :  <ThumbsDown />}
       
      </button>
      {responseMessage && <p className="mt-2 text-sm">{responseMessage}</p>}
    </div>
  );
};

export default DownvoteButton;
