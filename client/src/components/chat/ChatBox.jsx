import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { useFetchRecipientUser } from "../../hooks/useFetchRecipient";
import { Stack } from "react-bootstrap";
import moment from "moment";
import InputEmoji from "react-input-emoji";
import axios from "axios"; // Import axios
import { AiOutlineUpload } from "react-icons/ai"; // Import the upload icon from react-icons

const ChatBox = () => {
    const { user } = useContext(AuthContext);
    const { currentChat, messages, isMessagesLoading, sendTextMessage, isTyping, sendTypingEvent } = useContext(ChatContext);
    const { recipientUser } = useFetchRecipientUser(currentChat, user);
    const [textMessage, setTextMessage] = useState("");
    const [file, setFile] = useState(null); // Add file state to manage selected files
    const [uploading, setUploading] = useState(false);
    const scroll = useRef();
    const typingTimeout = useRef(null);

    useEffect(() => {
        scroll.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleTyping = (text) => {
        setTextMessage(text);
        if (typingTimeout.current) clearTimeout(typingTimeout.current);

        if (text.length > 0) {
            sendTypingEvent(true);
            typingTimeout.current = setTimeout(() => {
                sendTypingEvent(false);
            }, 5000); // Stop typing after 2 seconds of inactivity
        } else {
            sendTypingEvent(false);
        }
    };

    // Handle file selection
    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
    };

    // Handle file upload to server
    const handleFileUpload = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setUploading(true);

        try {
            // Upload the file to the server
            const response = await axios.post("http://localhost:5000/api/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            const fileUrl = response.data.fileUrl;
            console.log("File uploaded successfully:", fileUrl);

            // Send the file URL as a message
            sendTextMessage(fileUrl, user, currentChat._id, setTextMessage);
            setFile(null); // Reset file after upload

        } catch (error) {
            console.error("File upload failed", error);
        } finally {
            setUploading(false);
        }
    };

    if (!recipientUser)
        return (
            <p style={{ textAlign: "center", width: "100%", fontStyle: "italic", paddingTop: "4px" }}>
                You haven&apos;t selected any chat yet.
            </p>
        );

    if (isMessagesLoading)
        return (
            <p style={{ textAlign: "center", width: "100%" }}>
                Messages are loading...
            </p>
        );

    return (
        <Stack gap={4} className="chat-box">
            <div className="chat-header">
                <strong>You&apos;re conversing with {recipientUser?.name}</strong>
            </div>
            <Stack gap={3} className="messages">
                {messages &&
                    messages.map((message, index) => (
                        <Stack
                            key={index}
                            className={`${message?.senderId === user?._id
                                ? "message self align-self-end flex-grow-0"
                                : "message align-self-start flex-grow-0"
                                }`}
                            ref={scroll}
                        >
                            {message.fileUrl?.startsWith("/uploads/") ? (
                                // If the message is a file URL, check for file types (PDF, Image, Video, etc.)
                                message.fileUrl.endsWith(".pdf") ? (
                                    // If it's a PDF, render it as an iframe
                                    <iframe 
                                        src={`http://localhost:5000${message.fileUrl}`} 
                                        width="100%" 
                                        height="350px" 
                                        title="PDF Viewer"
                                        style={{ border: "none" }}
                                    />
                                ) : message.fileUrl.endsWith(".mp4") ? (
                                    // If it's a video file, render it as a video tag
                                    <video 
                                        controls
                                        src={`http://localhost:5000${message.fileUrl}`} 

                                        style={{ border: "none", maxWidth: "100%", height: "auto" }}
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                ) : message.fileUrl.endsWith(".jpg") || message.fileUrl.endsWith(".jpeg") || message.fileUrl.endsWith(".png") ? (
                                    // If it's an image file, render it as an image
                                    <img 
                                        src={`http://localhost:5000${message.fileUrl}`} 
                                        alt="Uploaded file" 
                                        style={{ maxWidth: "100%", height: "auto" }} 
                                    />
                                ) : (
                                    // For any other file type, display the file name
                                    <div>{message.fileUrl.split('/').pop()}</div>  // This will display the file name
                                )
                            ) : (
                                // Otherwise, render the message as text
                                <span>{message.text}</span>
                            )}

                            <span className="message-footer">
                                {moment(message.createdAt).calendar()}
                            </span>
                        </Stack>
                    ))}
                {isTyping && (
                    <div className="typing-indicator">
                        <span>Typing...</span>
                        <div className="typing-animation">
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                        </div>
                    </div>
                )}
            </Stack>
            <Stack direction="horizontal" gap={3} className="chat-input flex-grow-0">
                {/* Emoji Input */}
                <InputEmoji
                    value={textMessage}
                    onChange={handleTyping}
                    fontFamily="nunito"
                    borderColor="rgba(72,112,223,0.2)"
                />
                
                {/* Upload Button */}
                <div className="upload-btn">
                   <input
                        type="file"
                        id="file-input"
                        style={{ display: "none" }}
                        onChange={(event) => {
                            handleFileChange(event); // Store file in state
                            handleFileUpload(); // Upload the file immediately after selection
                        }}
                    />

                    <button
                        className="upload-file-btn"
                        onClick={() => document.getElementById("file-input").click()}
                        disabled={uploading}
                        style={{
                            backgroundColor: "#239ad1",
                            border: "none",
                            borderRadius: "50%",
                            padding: "6px",
                            cursor: "pointer",
                        }}
                    >
                        <AiOutlineUpload size={24} color="white" />
                    </button>
                </div>

                {/* Send Message Button */}
                <button
                    className="send-btn"
                    onClick={() => sendTextMessage(textMessage, user, currentChat._id, setTextMessage)}
                    disabled={uploading} // Disable send button if uploading is in progress
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" className="bi bi-send-fill" viewBox="0 0 16 16">
                        <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z" />
                    </svg>
                </button>
            </Stack>
        </Stack>
    );
};

export default ChatBox;
