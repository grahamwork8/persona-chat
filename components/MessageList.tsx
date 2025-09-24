// components/MessageList.tsx
export default function MessageList({ messages }) {
  return (
    <div className="space-y-2">
      {messages.map((msg, i) => (
        <div key={i} className={`p-2 rounded ${msg.role === "user" ? "bg-blue-100" : "bg-green-100"}`}>
          <strong>{msg.role}</strong> {msg.content}
        </div>
      ))}
    </div>
  );
}
