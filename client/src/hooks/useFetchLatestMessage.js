import { useEffect, useState, useContext } from "react";
import { baseUrl, getRequest } from "../utils/services";
import { ChatContext } from "../context/ChatContext";

export const useFetchLatestMessage = (chat) => {
    const { newMessage, notifications } = useContext(ChatContext);
    const [latestMessage, setLatestMessage] = useState(null); // Fix useState initialization

    useEffect(() => {
        const getMessages = async () => {
            const response = await getRequest(`${baseUrl}/messages/${chat?._id}`);

            if (response.error) {
                console.log('Error getting messages', response.error);
                return;
            }

            if (Array.isArray(response)) { // Ensure response is an array
                const lastMessage = response[response.length - 1]; // Correct way to get last item
                setLatestMessage(lastMessage);
                console.log(lastMessage);
            }
        };

        if (chat?._id) { // Ensure chat ID is valid before fetching
            getMessages();
        }
    }, [chat?._id, newMessage, notifications]); // Include chat ID in dependencies

    return { latestMessage };
};
