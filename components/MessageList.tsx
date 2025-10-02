// components/MessageList.tsx
import dayjs from 'dayjs';

export default function MessageList({ messages }) {
  if (!Array.isArray(messages)) return null;

  return (
  <div className="bg-white rounded-lg shadow p-4 min-h-[300px] space-y-4">
    {messages.map((msg, i) => {
      const isUser = msg.role === 'user';
      const timestamp = msg.created_at
        ? dayjs(msg.created_at).format('MMM D, h:mm A')
        : 'Just now';

      return (
        <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
          <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                isUser ? 'bg-blue-500 text-white' : 'bg-green-600 text-white'
              }`}
            >
              {isUser ? 'U' : 'P'}
            </div>

            {/* Message Bubble */}
            <div
              className={`max-w-sm px-4 py-2 rounded-lg shadow ${
                isUser ? 'bg-blue-100 text-blue-900' : 'bg-green-100 text-green-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <p className="text-xs mt-1 text-right text-gray-500">{timestamp}</p>
            </div>
          </div>
        </div>
      );
    })}
  </div>
);
}
