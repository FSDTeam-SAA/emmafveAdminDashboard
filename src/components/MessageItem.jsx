const MessageItem = ({ msg, user, onRead }) => {
  const isOwn = msg.sender._id === user._id;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: !isOwn ? "flex-end" : "flex-start",
        marginBottom: 6,
      }}
    >
      <div
        style={{
          background: isOwn ? "#DCF8C6" : "#fff",
          padding: "8px 12px",
          borderRadius: 10,
          maxWidth: "70%",
        }}
      >
        {!isOwn && <b>{msg.sender.name}</b>}
        <div>{msg.text}</div>

        {isOwn && msg.readBy?.length > 0 && (
          <div style={{ fontSize: 10 }}>✔✔ Read</div>
        )}

        {!isOwn && (
          <div
            style={{ fontSize: 11, color: "blue", cursor: "pointer" }}
            onClick={() => onRead(msg._id)}
          >
            Mark as read
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
