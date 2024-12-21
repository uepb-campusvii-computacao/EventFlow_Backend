import express from "express";
import ActivityPrivateRoutes from "../modules/activities/activity.private.routes";
import BatchPrivateRoutes from "../modules/batchs/batch.private.routes";
import BatchPublicRoutes from "../modules/batchs/batch.public.routes";
import EventPrivateRoutes from "./private/EventPrivateRoutes";
import UserPrivateRoutes from "./private/UserPrivateRoutes";
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
