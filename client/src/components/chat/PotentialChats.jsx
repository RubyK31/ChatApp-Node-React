import { useContext } from "react";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import { Stack } from "react-bootstrap";

const PotentialChats = () => {
    const { user } = useContext(AuthContext);
    const { potentialChats, createChat, onlineUsers } = useContext(ChatContext);

    return (
        <div style={{ backgroundColor: "#333", padding: "10px", borderRadius: "8px", maxHeight: "400px", overflowY: "auto", width: "250px" }}>
            <Stack direction="vertical" gap={3}>
                {potentialChats && potentialChats.map((u, index) => (
                    <div 
                        key={index} 
                        onClick={() => createChat(user._id, u._id)} 
                        style={{
                            display: "flex",
                            alignItems: "center",
                            backgroundColor: "#444",
                            padding: "8px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            transition: "background-color 0.2s ease"
                        }}
                    >
                        <img 
                            src={u.profileImageUrl || "default-avatar.png"} 
                            alt={u.name} 
                            style={{
                                width: "35px",
                                height: "35px",
                                borderRadius: "50%",
                                marginRight: "8px"
                            }} 
                        />
                        <div style={{ flexGrow: 1 }}>
                            <span style={{ color: "white", fontWeight: "bold", fontSize: "14px" }}>{u.name}</span>
                        </div>
                        <span 
                            style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                backgroundColor: onlineUsers?.some((onlineUser) => onlineUser?.userId === u?._id) ? "#28a745" : "#dc3545"
                            }}
                        />
                    </div>
                ))}
            </Stack>
        </div>
    );
};

export default PotentialChats;
