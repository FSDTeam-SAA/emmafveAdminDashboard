const Sidebar = ({ chats, activeChat, setActiveChat }) => {
  return (
    <div className="w-56 border-r border-gray-200 p-4 bg-white">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">Chats</h4>

      <div className="space-y-1">
        {chats.map((chat) => {
          const isActive = activeChat?._id === chat._id;

          return (
            <div
              key={chat._id}
              onClick={() => setActiveChat(chat)}
              className={`px-3 py-2 rounded-lg cursor-pointer transition
                ${
                  isActive
                    ? "bg-gray-200 text-gray-900 font-medium"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
            >
              {chat.name}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
