import { useEffect, useState } from "react";
import axiosInstance from "../../api/axios";
import { useAuthStore } from "../../store/auth.store";
import socket from "../../socket";

interface User {
  id: string;
  name: string;
}

interface Message {
  senderId: string;
  receiverId: string;
  message: string;
  createdAt?: string;
}

export default function Messenger() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");

  const { user } = useAuthStore();

  // Fetch users once
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axiosInstance.get("/user");
        setUsers(res.data.filter((u: User) => u.id !== user.id));
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, [user.id]);

  // Register socket & listen to incoming messages
  useEffect(() => {
    socket.emit("register", user.id);

    socket.on("recieveMessage", (msg: Message) => {
      // Only add messages from/to current chat
      if (
        selectedUser &&
        (msg.senderId === selectedUser.id || msg.receiverId === selectedUser.id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off("recieveMessage");
    };
  }, [user.id, selectedUser]);

  // Send message
  const sendMessage = () => {
    if (!text.trim() || !selectedUser) return;

    const msg: Message = {
      senderId: user.id,
      receiverId: selectedUser.id,
      message: text,
      createdAt: new Date().toISOString(),
    };

    // Emit to server
    socket.emit("sendMessage", msg);

    // Add instantly to UI
    setMessages((prev) => [...prev, msg]);
    setText("");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar: Users */}
      <div className="w-1/4 bg-white border-r p-4 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Users</h2>
        {users.length ? (
          users.map((u) => (
            <button
              key={u.id}
              onClick={() => {
                setSelectedUser(u);
                setMessages([]); // Reset messages, you can later fetch chat history
              }}
              className={`w-full text-left p-2 mb-2 rounded ${
                selectedUser?.id === u.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              {u.name}
            </button>
          ))
        ) : (
          <p>No users found.</p>
        )}
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col p-4">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="border-b pb-3 mb-3">
              <h2 className="text-lg font-semibold">
                Chat with {selectedUser.name}
              </h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-white p-3 rounded shadow flex flex-col gap-2">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-center mt-5">
                  No messages yet.
                </p>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`max-w-xs p-2 rounded ${
                      msg.senderId === user.id
                        ? "bg-blue-500 text-white self-end ml-auto"
                        : "bg-gray-300 text-black self-start"
                    }`}
                  >
                    {msg.message}
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="mt-3 flex">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-2 border rounded"
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={sendMessage}
                className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="text-gray-500 text-center mt-20">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
