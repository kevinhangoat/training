import { useState } from 'react'
import './App.css'
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from "@chatscope/chat-ui-kit-react";

const API_KEY = " "

function Chat() {
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
        message: "",
        sendor: "user",
    }
  ])


  const handleSend = async (msg) => {
    const newMsg = { 
        message: msg, 
        sentTime: "just now", 
        sender: "user",
        direction: "outgoing"
    }
    const newMsgs = [...messages, newMsg];
    setMessages(newMsgs);
    setTyping(true);
    await processMessageToChatGPT(newMsgs);
  }


  async function processMessageToChatGPT(chatMessages) {
    let apiMessages = chatMessages.map((messageObject)=>{
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant"
      } else {
        role = "user"
      }
      return { role: role, content: messageObject.message }
    });

    const systemMessage = {
      role: "system",
      content: "You are a sales man"
    }

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,
        ...apiMessages
      ]
    }

    await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      console.log(data);
      setMessages([...chatMessages, { message: data.choices[0].message.content, sender: "ChatGPT" }]);
      setTyping(false);
    })
  }

  return(
    <div className="Chat">
      <div style={{ display: "flex", flexDirection: "column", height: "800px", width: "800px" }}>
        <MainContainer>
            <ChatContainer>
                <MessageList scrollBehavior="smooth" typingIndicator={typing ? <TypingIndicator content="User is typing..." /> : null}>
                    {messages.map((msg, i) => (
                        <Message 
                          key={i} 
                          model={{
                            ...msg,
                            direction: msg.sender === "user" ? "outgoing" : "incoming"
                          }} 
                        />
                    ))}
                </MessageList>
                <MessageInput placeholder="Type a message..." onSend={handleSend} />
            </ChatContainer>
        </MainContainer>
      </div>
    </div>
  )
}

export default Chat