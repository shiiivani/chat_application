import { useEffect, useState } from "react";
import "./App.css";
import { id, init } from "@instantdb/react";
import send from "./assets/images/send.png";
import edit from "./assets/images/edit.png";
import search from "./assets/images/search.png";

// ID for app: Chat App
const APP_ID = "8f0ed5b6-b9bc-4ef8-bd5d-2c4c9ab928a8";

const db = init({ appId: APP_ID });

function App() {
  const query = { contacts: {}, messages: {} };
  const { data } = db.useQuery(query);
  const [selectedConv, setSelectedConv] = useState(1);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeConv, setActiveConv] = useState(1);

  const handleContactClick = (conv) => {
    setSelectedConv(conv);
    setActiveConv(conv);
  };

  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedConv) {
        try {
          const fetchedMessages = data?.messages
            .filter((message) => message.conv === selectedConv)
            .sort((a, b) => {
              return new Date(a.time) - new Date(b.time);
            });

          setMessages(fetchedMessages);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      }
    };

    fetchMessages();
  }, [selectedConv, data?.messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageData = {
      sender: newMessage,
      receiver: "",
      conv: selectedConv,
      time: new Date().toISOString(),
    };

    try {
      await db.transact(db.tx.messages[id()].update(messageData));

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Function to handle "Enter" key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  const getLastMessage = (conv) => {
    const contactMessages = data.messages.filter(
      (message) => message.conv === conv
    );
    if (contactMessages.length === 0) return "";
    const lastMessage = contactMessages.sort(
      (a, b) => new Date(b.time) - new Date(a.time)
    )[0];
    return lastMessage.sender ? lastMessage.sender : lastMessage.receiver;
  };

  return (
    <div className="App">
      <div className="chat-app">
        <div className="sidebar">
          <div className="sidebar-header">
            <h3>Chats</h3>
            <img src={edit} width="20px" alt="Edit icon" />
          </div>
          <div className="search-input">
            <img src={search} width="20px" alt="Search icon" />
            <input type="text" placeholder="Search" />
          </div>
          <div className="contact-lists">
            {data?.contacts?.map((contact) => (
              <div
                key={contact.id}
                className={`chat-box ${
                  activeConv === contact.conv ? "active" : ""
                }`}
                onClick={() => handleContactClick(contact.conv)}
              >
                <div className="user-profile">
                  <img src={contact.profile} width="50px" alt="User Profile" />
                </div>
                <div className="chat-box-content">
                  <h4>{contact.users}</h4>
                  <p>{getLastMessage(contact.conv)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chat">
          {selectedConv && (
            <>
              <div className="chat-header">
                <div className="user-profile">
                  <img
                    src={
                      data?.contacts?.find(
                        (contact) => contact.conv === selectedConv
                      )?.profile
                    }
                    width="60px"
                    alt="user"
                  />
                </div>
                <h3>
                  {
                    data?.contacts?.find(
                      (contact) => contact.conv === selectedConv
                    )?.users
                  }
                </h3>
              </div>

              <div className="chat-main">
                {messages?.map((message, index) => (
                  <>
                    {message.sender && (
                      <div key={index} className="sender">
                        <p>{message.sender}</p>
                      </div>
                    )}
                    {message.receiver && (
                      <div key={index} className="receiver">
                        <p>{message.receiver}</p>
                      </div>
                    )}
                  </>
                ))}
              </div>

              <div className="chat-footer">
                <input
                  type="text"
                  placeholder="Type your message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                />
                <button onClick={handleSendMessage}>
                  <img src={send} width="20px" alt="Paper plane icon" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
