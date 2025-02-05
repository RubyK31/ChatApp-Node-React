import { useContext, useState } from "react";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import { unreadNotificationsFunc } from "../../utils/unreadNotifications";
import moment from "moment"
import { FaBell } from "react-icons/fa";

const Notifications = () => {
    const [isOpen, setIsOpen] = useState(false);
    const {user} = useContext(AuthContext)
    const {notifications, userChats, allUsers, markAllNotificationsAsRead, markNotificationsAsRead} = useContext(ChatContext)
    const unreadNotifications = unreadNotificationsFunc(notifications)
    const modifiedNotifications = notifications.map((n) => {
        const sender = allUsers.find(user => user._id === n.senderId)
        return ({
            ...n,
            senderName: sender?.name
        }) 
    }) 
    
    return (
        <div className="notifications">
            <div className="notifications-icon" onClick={() => setIsOpen(!isOpen)}>
             <FaBell size={18} />
                {unreadNotifications?.length === 0 ? null : (
                    <span className="notification-count">
                        <span>{ unreadNotifications?.length }</span>
                    </span>
                )}
            </div> 
            {isOpen ? (
                <div className="notifications-box">
                    <div className="notifications-header">
                        <h3>Notifications</h3>
                        <div className="mark-as-read" onClick={() => markAllNotificationsAsRead(notifications)}>Mark all as read</div>
                    </div>
                    {modifiedNotifications?.length === 0 ? <span className="notification">No notifications yet</span> :
                    null}
                    {modifiedNotifications && modifiedNotifications.map((n, index) => {
                        return <div
                            key={index}
                            className={
                                n.isRead ? 'notification' : 'notification not-read'
                            }
                            onClick={() => {
                                markNotificationsAsRead(n, userChats, user, notifications)
                                setIsOpen(false)
                            }}
                        >
                            <span>{`${n.senderName} sent you new message`}</span>
                            <span className="notification-time">{ moment(n.date).calendar()}</span>
                        </div>
  
                    })}
                </div>
            ) : null}
        </div>  
    );
}
 
export default Notifications;