const messageModel = require("../Models/messageModel")

const createMessage = async (req, res) => {
    const { chatId, senderId, text, fileUrl = "" } = req.body
    const message = new messageModel({
        chatId, senderId, text, fileUrl
    })
    try {
        const response = await message.save()
        res.status(200).json(response)
    } catch (error) {
        console.log(error)
        res.status(500).json(error);
    }
}
const getMessages = async (req, res) => {
    const { chatId } = req.params;

    try {
        const messages = await messageModel.find({ chatId })
        res.status(200).json(messages)
    } catch (error) {
        console.log(error)
        res.status(500).json(error);
    }
}

const updateMessage = async (req, res) => {
    const { messageId } = req.params; 
    const { text } = req.body; 

    try {
        const updatedMessage = await messageModel.findByIdAndUpdate(
            messageId,
            { text }, 
            { new: true }
        );

        if (!updatedMessage) {
            return res.status(404).json({ message: "Message not found" });
        }

        res.status(200).json(updatedMessage); 
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

module.exports = { createMessage, getMessages, updateMessage };