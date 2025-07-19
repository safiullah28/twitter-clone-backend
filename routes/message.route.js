import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { getMessage, sendMessage } from "../controllers/message.controller.js";

const msgRouter = express.Router();

msgRouter.get("/getmessages/:receiverId", protectRoute, getMessage);
msgRouter.post("/sendmessage/:receiverId", protectRoute, sendMessage);

export default msgRouter;
