import { useContext, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import { Container, Stack } from "react-bootstrap";
import UserChat from "../components/chat/UserChat";
import { AuthContext } from "../context/AuthContext";
import PotentialChats from "../components/chat/PotentialChats";
import ChatBox from "../components/chat/ChatBox";
import { FaBars } from "react-icons/fa";

const Chat = () => {
    const { user } = useContext(AuthContext);
    const { userChats, isUserChatsLoading, updateCurrentChat } = useContext(ChatContext);
    const [showChatList, setShowChatList] = useState(true); // Toggle state

    return (
        <Container fluid>
            <PotentialChats />

            {/* Toggle Button */}
            <div className="chat-toggle-btn">
                <FaBars 
                    size={24} 
                    role="button" 
                    onClick={() => setShowChatList(!showChatList)} 
                />
            </div>

            {userChats?.length > 0 && (
                <Stack direction="horizontal" gap={3} className="d-flex flex-row flex-wrap">
                    
                    {/* User Chat List (Left Side) - Toggle Visibility */}
                    {showChatList && (
                        <Stack className="user-chat-list flex-grow-1" gap={3}>
                            {isUserChatsLoading && <p>Loading Chats...</p>}
                            {userChats?.map((chat, index) => (
                                <div key={index} onClick={() => updateCurrentChat(chat)}>
                                    <UserChat chat={chat} user={user} />
                                </div>
                            ))}
                        </Stack>
                    )}

                    {/* Chat Box (Right Side) - Expands when chat list is hidden */}
                    <Stack 
                        className={`chat-box flex-grow-1 ${showChatList ? "collapsed" : "expanded"}`}
                    >
                        <ChatBox />
                    </Stack>
                </Stack>
            )}
        </Container>
    );
};

export default Chat;
