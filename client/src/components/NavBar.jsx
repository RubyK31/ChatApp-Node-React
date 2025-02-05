import { useContext } from "react";
import { Container, Nav, Navbar, Stack } from "react-bootstrap";
import { Link } from "react-router-dom"
import { AuthContext } from "../context/AuthContext";
import Notifications from "./chat/Notifications";
import { FaSignOutAlt } from "react-icons/fa";
const NavBar = () => {
    const { user, logoutUser } = useContext(AuthContext)
    return (<Navbar bg="dark" className="mb-4" style={{ height: "3.75rem" }}>
        <Container>
            <h3>
                <Link to="/" className="link-light text-decoration-none">
                    🗨️💬 
                </Link>
            </h3>
            {user && (
                <span className="text-white"><strong>{user?.name}&apos;s Chats</strong></span>
            )}
            <Nav>
                <Stack direction="horizontal" gap={3}>
                    {
                        user && (<>
                            <Notifications />
                            <Link onClick={() => logoutUser()} to="/login" className="link-light text-decoration-none">
                                <FaSignOutAlt size={20} /> {/* Logout Icon */}
                            </Link>
                        </>)
                    }
                    {
                        !user && (<>
                            <Link to="/login" className="link-light text-decoration-none">
                                Login
                            </Link>
                            <Link to="/register" className="link-light text-decoration-none">
                                Register
                            </Link>
                        </>)
                    }
                   
                </Stack>
            </Nav>
        </Container>
    </Navbar> );
}
 
export default NavBar;