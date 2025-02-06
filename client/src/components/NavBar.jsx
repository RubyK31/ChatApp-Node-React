import { useContext, useState } from "react";
import { Container, Nav, Navbar, Stack, Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import Notifications from "./chat/Notifications";
import { FaSignOutAlt, FaUsers } from "react-icons/fa";
import avatar from "../assets/avatar.svg";

const NavBar = () => {
    const { user, logoutUser } = useContext(AuthContext);
    const { potentialChats, createChat, onlineUsers } = useContext(ChatContext);
    const [showChats, setShowChats] = useState(false);

    return (
        <Navbar bg="dark" className="mb-4 px-3" style={{ height: "3.75rem" }}>
            <Container>
                <Stack direction="horizontal" gap={3}>
                    {/* Logo */}
                    <h3>
                        <Link to="/" className="link-light text-decoration-none">
                            🗨️💬 
                        </Link>
                    </h3>

                    {/* Potential Chats Dropdown (Next to Logo) */}
                    {user && (
                        <Dropdown show={showChats} onToggle={() => setShowChats(!showChats)}>
                            <Dropdown.Toggle variant="secondary" style={{ backgroundColor: "transparent", border: "none", padding: "0" }}>
                               <em>Converse&nbsp;&nbsp;</em><FaUsers size={24} color="white" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu style={{ backgroundColor: "#222", width: "250px", maxHeight: "300px", overflowY: "auto", borderRadius: "5px" }}>
                                {potentialChats.length > 0 ? (
                                    potentialChats.map((u, index) => (
                                        <Dropdown.Item
                                            key={index}
                                            onClick={() => createChat(user._id, u._id)} 
                                            style={{ display: "flex", alignItems: "center", padding: "10px", color: "white", backgroundColor: "#333", borderRadius: "5px" }}
                                        >
                                            {/* User Avatar */}
                                            <img
                                                src={avatar}
                                                alt={u.name}
                                                style={{ width: "30px", height: "30px", borderRadius: "50%", marginRight: "10px" }}
                                            />
                                            {/* User Name */}
                                            <span>{u.name}</span>
                                            {/* Online Status */}
                                            <span
                                                style={{
                                                    width: "8px",
                                                    height: "8px",
                                                    borderRadius: "50%",
                                                    backgroundColor: onlineUsers?.some((onlineUser) => onlineUser?.userId === u?._id) ? "#28a745" : "#dc3545",
                                                    marginLeft: "auto"
                                                }}
                                            />
                                        </Dropdown.Item>
                                    ))
                                ) : (
                                    <Dropdown.Item style={{ color: "gray", textAlign: "center" }}>No new chats</Dropdown.Item>
                                )}
                            </Dropdown.Menu>
                        </Dropdown>
                    )}
                </Stack>

                {user && <span className="text-white"><strong>{user?.name}&apos;s Chats</strong></span>}

                {/* Right Section */}
                <Nav>
                    <Stack direction="horizontal" gap={3}>
                        {user && (
                            <>
                                <Notifications />
                                <Link onClick={() => logoutUser()} to="/login" className="link-light text-decoration-none">
                                    <FaSignOutAlt size={20} /> {/* Logout Icon */}
                                </Link>
                            </>
                        )}
                        {!user && (
                            <>
                                <Link to="/login" className="link-light text-decoration-none">
                                    Login
                                </Link>
                                <Link to="/register" className="link-light text-decoration-none">
                                    Register
                                </Link>
                            </>
                        )}
                    </Stack>
                </Nav>
            </Container>
        </Navbar>
    );
};

export default NavBar;
