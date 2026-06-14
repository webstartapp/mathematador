import { Router } from "express";

import {
  ChallengeGetAllParams,
  ChallengeGetParams,
  ChallengeStartNewBody,
  ChallengeStartNewParams,
  ChallengeUpdateResultBody,
  ChallengeUpdateResultParams,
  SubscriptionUpdateBody,
  UserForgottenBody,
  UserForgottenPasswordBody,
  UserLoginBody,
  UserLoginPasswordBody,
  UserRegisterBody
} from "@/_generated/api";
import { requireAuth } from "@/middlewares/auth";
import { validate } from "@/middlewares/validation";
import { challengeGet } from "@/resolvers/apiPaths/challengeGet";
import { challengeGetAll } from "@/resolvers/apiPaths/challengeGetAll";
import { challengeStartNew } from "@/resolvers/apiPaths/challengeStartNew";
import { challengeUpdateResult } from "@/resolvers/apiPaths/challengeUpdateResult";
import { gameProgress } from "@/resolvers/apiPaths/gameProgress";
import { subscriptionCancelImmediately } from "@/resolvers/apiPaths/subscriptionCancelImmediately";
import { subscriptionUpdate } from "@/resolvers/apiPaths/subscriptionUpdate";
import { userForgotten } from "@/resolvers/apiPaths/userForgotten";
import { userForgottenPassword } from "@/resolvers/apiPaths/userForgottenPassword";
import { userLogin } from "@/resolvers/apiPaths/userLogin";
import { userLoginPassword } from "@/resolvers/apiPaths/userLoginPassword";
import { userRegister } from "@/resolvers/apiPaths/userRegister";

const router = Router();

// --- Unauthenticated Auth Routes ---
router.post("/user/forgotten", validate({ body: UserForgottenBody }), userForgotten);

router.post("/user/login", validate({ body: UserLoginBody }), userLogin);

router.put("/user/login", validate({ body: UserLoginPasswordBody }), userLoginPassword);

router.post("/user/register", validate({ body: UserRegisterBody }), userRegister);

router.post("/user/forgotten-password", validate({ body: UserForgottenPasswordBody }), userForgottenPassword);

// --- Authenticated Challenge Routes ---
router.post(
  "/challenges/:operationId",
  requireAuth,
  validate({ params: ChallengeStartNewParams, body: ChallengeStartNewBody }),
  challengeStartNew
);

router.get("/challenges/:operationId", requireAuth, validate({ params: ChallengeGetAllParams }), challengeGetAll);

router.get("/challenges/:operationId/:id", requireAuth, validate({ params: ChallengeGetParams }), challengeGet);

router.put(
  "/challenges/:operationId/:id",
  requireAuth,
  validate({ params: ChallengeUpdateResultParams, body: ChallengeUpdateResultBody }),
  challengeUpdateResult
);

// --- Authenticated Subscription Routes ---
router.post("/subscriptions", requireAuth, validate({ body: SubscriptionUpdateBody }), subscriptionUpdate);

router.delete("/subscriptions", requireAuth, subscriptionCancelImmediately);

// --- Authenticated Progress Routes ---
router.get("/game/progress", requireAuth, gameProgress);

export default router;
