import MessageItem from "./MessageItem";

const ChatWindow = ({
  messages,
  text,
  // setText,
  sendMessage,
  typingUser,
  handleTyping,
  user,
  readMessage,
}) => {
  return (
    <div className="flex-1 flex flex-col p-4 bg-gray-50">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto border border-gray-200 bg-white rounded-xl p-4 space-y-2">
        {messages.map((msg) => (
          <MessageItem
            key={msg._id}
            msg={msg}
            user={user}
            onRead={readMessage}
          />
        ))}
      </div>

      {/* Typing indicator */}
      {typingUser && (
        <div className="text-sm text-gray-500 mt-2 italic">
          Someone is typing...
        </div>
      )}

      {/* Input */}
      <div className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={handleTyping}
          placeholder="Type message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={sendMessage}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
