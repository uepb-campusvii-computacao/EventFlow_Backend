import express from "express";
import ActivityPrivateRoutes from "./private/ActivityPrivateRoutes";
import BatchPrivateRoutes from "./private/BatchPrivateRoutes";
import EventPrivateRoutes from "./private/EventPrivateRoutes";
import UserPrivateRoutes from "./private/UserPrivateRoutes";
import BatchPublicRoutes from "./public/BatchPublicRoutes";
import EventPublicRoutes from "./public/EventPublicRoutes";
import UserPublicRoutes from "./public/UserPublicRoutes";

const router = express.Router();

router.use("/", UserPublicRoutes);
router.use("/", EventPublicRoutes);
router.use("/", BatchPublicRoutes);

router.use("/", UserPrivateRoutes);
router.use("/", ActivityPrivateRoutes);
router.use("/", EventPrivateRoutes);
router.use("/", BatchPrivateRoutes);

export default router;
