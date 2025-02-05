/* eslint-disable react/prop-types */
import { Stack } from "react-bootstrap";
import avatar from "../../assets/avatar.svg";
import { useFetchRecipientUser } from "../../hooks/useFetchRecipient";
import { useContext } from "react";
import { ChatContext } from "../../context/ChatContext";
import { unreadNotificationsFunc } from "../../utils/unreadNotifications";
import { useFetchLatestMessage } from "../../hooks/useFetchLatestMessage";
import moment from "moment";

const UserChat = ({ chat, user }) => {
    const { recipientUser } = useFetchRecipientUser(chat, user);
    const { onlineUsers, notifications, markThisUserNotificationAsRead } = useContext(ChatContext);
    const { latestMessage } = useFetchLatestMessage(chat);
    
    const unreadNotifications = unreadNotificationsFunc(notifications);
    const thisUserNotifications = unreadNotifications?.filter(
        (n) => n.senderId === recipientUser?._id
    );

    const isOnline = onlineUsers?.some((user) => user?.userId === recipientUser?._id);

    const truncateText = (text) => {
        let shortText = text.substring(0, 20);
        return text.length > 20 ? shortText + "..." : shortText;
    };

    return (
        <Stack 
            direction="horizontal" 
            gap={3} 
            className="user-card align-items-center p-2 justify-content-between" 
            role="button"
            onClick={() => {
                if (thisUserNotifications?.length !== 0) {
                    markThisUserNotificationAsRead(thisUserNotifications, notifications);
                }
            }}
            style={{ width: "100%", overflow: "hidden" }} // Prevent horizontal scrolling issues
        >
            {/* Left Section: Avatar & Text */}
            <div className="d-flex align-items-center" style={{ flex: 1, minWidth: "0" }}>
                <img src={avatar} alt="User Avatar" height="30px" className="me-2" />
                <div className="text-content" style={{ flex: 1, minWidth: "0" }}>
                    <div className="name text-truncate">{recipientUser?.name}</div>
                    <div className="text text-truncate">
                        {latestMessage?.text && <span>{truncateText(latestMessage?.text)}</span>}
                    </div>
                </div>
            </div>

            {/* Right Section: Date & Notifications */}
            <div className="d-flex flex-column align-items-end" style={{ whiteSpace: "nowrap" }}>
                <div className="date">{latestMessage?.createdAt ? moment(latestMessage?.createdAt).calendar() : ""}</div>
                <div className={thisUserNotifications?.length > 0 ? "this-user-notifications" : ""}>
                    {thisUserNotifications?.length > 0 ? thisUserNotifications.length : ""}
                </div>
                <span className={isOnline ? "user-online" : ""}></span>
            </div>
        </Stack>
    );
};

export default UserChat;
