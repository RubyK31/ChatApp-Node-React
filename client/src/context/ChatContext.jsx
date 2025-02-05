/* eslint-disable react/prop-types */
import { createContext, useCallback, useEffect, useState } from "react";
import { baseUrl, getRequest, postRequest } from "../utils/services";
import { io } from "socket.io-client";

export const ChatContext = createContext();
export const ChatContextProvider = ({ children, user }) => {
    const [userChats, setUserChats] = useState(null);
    const [isUserChatsLoading, setIsUserChatsLoading] = useState(false)
    const [userChatsError, setUserChatsError] = useState(null)
    const [potentialChats, setPotentialChats] = useState([])
    const [currentChat, setCurrentChat] = useState(null)
    const [messages, setMessages] = useState(null)
    const [isMessagesLoading, setIsMessagesLoading] = useState(null)
    const [messagesError, setMessagesError] = useState(null)
    const [sendTextMessageError, setSendTextMessageError] = useState(null)
    const [newMessage, setNewMessage] = useState(null)
    const [socket, setSocket] = useState(null)
    const [onlineUsers, setOnlineUsers] = useState([])
    const [notifications, setNotifications] = useState([])
    const [allUsers, setAllUsers] = useState([])
    const [isTyping, setIsTyping] = useState(false); // New state for typing indicator

    // console.log("nots", notifications,isTyping)

    // console.log(onlineUsers,sendTextMessageError, "On users")
    
    //initial socket
    useEffect(() => {
        const newSocket = io("http://localhost:3010");
        setSocket(newSocket);
        return () => {
            newSocket.disconnect()
        }
    }, [user])

    useEffect(() => {
        if (socket === null) return;
        socket.emit("addNewUser", user?._id)
        socket.on("getOnlineUsers", (res) => {
            setOnlineUsers(res)
        });

        // Listen for typing events
        socket.on("typing", (senderId) => {
            if (currentChat?.members.includes(senderId)) {
                console.log("Typing event received from:", senderId);
                setIsTyping(true);
                console.log("🔄 isTyping set to:", true);
            }
        });

        socket.on("stopTyping", (senderId) => {
            if (currentChat?.members.includes(senderId)) {
                console.log("Stop typing event received from:", senderId);
                setIsTyping(false);
                console.log("🔄 isTyping set to:", false);
            }
        });


        return () => {
            socket.off("getOnlineUsers");
            socket.off("typing");
            socket.off("stopTyping");
        }
    }, [socket, currentChat])
    
    // Send typing event
    const sendTypingEvent = useCallback((isTyping) => {
        if (socket === null || !currentChat) return;
        const recipientId = currentChat.members.find((id) => id !== user?._id);
        if (isTyping) {
            socket.emit("typing", { senderId: user._id, recipientId });
        } else {
            socket.emit("stopTyping", { senderId: user._id, recipientId });
        }
    }, [socket, currentChat, user]);


    //send message
     useEffect(() => {
         if (socket === null) return;
        const recipientId = currentChat?.members.find((id) => id != user?._id)
        socket.emit("sendMessage", {...newMessage, recipientId})
    }, [newMessage])
    
    //receive message and notification
    useEffect(() => {
        if (socket === null) return;
        socket.on("getMessage", res => {
            if (currentChat?._id !== res.chatId) return;

            setMessages((prev) => [...prev, res])
        });
        socket.on("getNotification", (res) => {
            const isChatOpen = currentChat?.members.some(id => id === res.senderId)
            if (isChatOpen) {
                setNotifications(prev => [{ ...res, isRead: true }, ...prev])
            } else {
                setNotifications(prev => [res, ...prev])
            }
        })
        return () => {
            socket.off("getMessage")
            socket.off("getNotification")
        };
    },[socket, currentChat])

    useEffect(() => {
        const getUsers = async() => {
            const response = await getRequest(`${baseUrl}/users`)
            if (response.error) {
                return console.log("Error fetching users", response)
            }

            const pchats = response.filter((u) => { let isChatCreated = false
                if (user?._id === u._id) {
                    return false
                }
                if (userChats) {
                    isChatCreated = userChats?.some((chat) => {
                        return chat.members[0] === u._id || chat.members[1] === u._id
                    })
                }

                return !isChatCreated
            })
            setPotentialChats(pchats)
            setAllUsers(response)
        }
        getUsers()
    },[userChats])
    
    useEffect(() => {
        const getUserChats = async () => {
            if (user?._id) {
                setIsUserChatsLoading(true);
                setUserChatsError(null);

                const response = await getRequest(`${baseUrl}/chats/${user?._id}`)
                setIsUserChatsLoading(false)
                
                if (response.error) {
                    return setUserChatsError(response)
                }

                setUserChats(response)
            }
        };
        getUserChats()
    }, [user, notifications]);

    useEffect(() => {
        const getMessages = async () => {
            setIsMessagesLoading(true);
            setMessagesError(null);

            const response = await getRequest(`${baseUrl}/messages/${currentChat?._id}`)
            setIsMessagesLoading(false)
            
            if (response.error) {
                return setMessagesError(response)
            }

            setMessages(response)   
        };
        getMessages()
    }, [currentChat]);

   const sendTextMessage = useCallback(async (textMessage, sender, currentChatId, setTextMessage) => {
        if (!textMessage) return console.log("Please type something first");

        // Check if the message is a file URL (based on the presence of "/uploads")
        const isFileUrl = textMessage.includes("/uploads");

        const messageData = {
            chatId: currentChatId,
            senderId: sender._id,
            text: isFileUrl ? "Sent an attachment" : textMessage, // Set to "Sent an attachment" if it's a file
            fileUrl: isFileUrl ? textMessage : "undefined", // Send the file URL if it's a file
        };
        const response = await postRequest(`${baseUrl}/messages`, JSON.stringify(messageData));

        if (response.error) {
            return setSendTextMessageError(response);
        }

        setNewMessage(response);
        setMessages((prev) => [...prev, response]);
        setTextMessage(""); // Clear the message input after sending
    }, []);


    const updateCurrentChat = useCallback((chat) => {
        setCurrentChat(chat)
    },[])

    const createChat = useCallback(async (firstId, secondId) => {
        const response = await postRequest(`${baseUrl}/chats/`, JSON.stringify({ firstId, secondId }))
        if (response.error) {
            return console.log("Error creating chat")
        }

        setUserChats((prev) => [...prev, response]);
    }, []);

    const markAllNotificationsAsRead = useCallback((notifications) => {
        const mNotifications = notifications.map((n) => {
            return { ...n, isRead: true };
        });

        setNotifications(mNotifications)
    }, [])

    const markNotificationAsRead = useCallback((n, userChats, user, notifications) => {
        const desiredChat = userChats.find(chat => {
            const chatMembers = [user._id, n.senderId]
            const isDesiredChat = chat?.members.every((member) => {
                return chatMembers.includes(member);
            });
            return isDesiredChat
        })
        //mark notification as read
        const mNotifications = notifications.map(el => {
            if (n.senderId === el.senderId) {
                return { ...n, isRead: true }
            } else {
                return el
            }
        })
        updateCurrentChat(desiredChat)
        setNotifications(mNotifications)
    }, []);

    const markThisUserNotificationAsRead = useCallback((thisUserNotifications, notifications) => {
        const mNotifications = notifications.map(el => {
            let notification;
            thisUserNotifications.forEach(n => {
                if (n.senderId === el.senderId) {
                    notification = {...n, isRead: true}
                } else {
                    notification = el
                }
            })
            return notification
        })
        setNotifications(mNotifications)
    })

    return (
        <ChatContext.Provider
            value={{
                userChats,
                isUserChatsLoading,
                userChatsError,
                potentialChats,
                createChat,
                updateCurrentChat,
                currentChat,
                messages,
                isMessagesLoading,
                messagesError,
                sendTextMessage,
                sendTextMessageError,
                onlineUsers,
                notifications,
                allUsers,
                markAllNotificationsAsRead,
                markNotificationAsRead,
                markThisUserNotificationAsRead,
                sendTypingEvent,
                isTyping
            }}
        >
            { children }
        </ChatContext.Provider>
    );
};