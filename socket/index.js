const { Server } = require("socket.io");

const io = new Server({ cors: "http://localhost:5173" });
let onlineUsers = [];

io.on("connection", (socket) => {
    console.log("New Connection", socket.id);

    // Listen to a connection
    socket.on("addNewUser", (userId) => {
        !onlineUsers.some(user => user.userId === userId) &&
            onlineUsers.push({
                userId,
                socketId: socket.id
            });
        console.log("onlineUsers", onlineUsers);
        io.emit("getOnlineUsers", onlineUsers);
    });

    // Add message
    socket.on("sendMessage", (message) => {
        const user = onlineUsers.find((user) => user.userId === message.recipientId);
        if (user) {
            io.to(user.socketId).emit("getMessage", message);
            io.to(user.socketId).emit("getNotification", {
                senderId: message.senderId,
                isRead: false,
                date: new Date(),
            });
        }
    });

socket.on("typing", (data) => {
    console.log("Typing event received:", data);
    
    // Check if the recipient exists in onlineUsers
    const recipient = onlineUsers.find((user) => user.userId === data.recipientId);
    
    console.log("Recipient found:", recipient); // Log recipient details

    if (recipient) {
        console.log("Emitting typing event to:", recipient.socketId);
        io.to(recipient.socketId).emit("typing", data.senderId);
    } else {
        console.log("Recipient not found in onlineUsers.");
    }
});

socket.on("stopTyping", (data) => {
    console.log("Stop typing event received:", data);
    
    // Check if the recipient exists in onlineUsers
    const recipient = onlineUsers.find((user) => user.userId === data.recipientId);
    
    console.log("Recipient found:", recipient); // Log recipient details

    if (recipient) {
        console.log("Emitting stopTyping event to:", recipient.socketId);
        io.to(recipient.socketId).emit("stopTyping", data.senderId);
    } else {
        console.log("Recipient not found in onlineUsers.");
    }
});


    socket.on("disconnect", () => {
        onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
        io.emit("getOnlineUsers", onlineUsers);
    });
});

io.listen(3010);