const express = require("express");
const { createMessage, getMessages, updateMessage } = require("../Controllers/messageController");

const router = express.Router()

router.post("/", createMessage);
router.get("/:chatId", getMessages);
router.put("/:messageId", updateMessage);

module.exports = router