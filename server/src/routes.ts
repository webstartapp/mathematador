import { Router } from "express";

import { requireAuth } from "@/middlewares/auth";
import { challengeGet } from "@/resolvers/apiPaths/challengeGet";
import { challengeGetAll } from "@/resolvers/apiPaths/challengeGetAll";
import { challengeStartNew } from "@/resolvers/apiPaths/challengeStartNew";
import { challengeUpdateResult } from "@/resolvers/apiPaths/challengeUpdateResult";
import { cosmeticsBuy } from "@/resolvers/apiPaths/cosmeticsBuy";
import { cosmeticsEquip } from "@/resolvers/apiPaths/cosmeticsEquip";
import { cosmeticsGet } from "@/resolvers/apiPaths/cosmeticsGet";
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
router.post("/user/forgotten", userForgotten);

router.post("/user/login", userLogin);

router.put("/user/login", userLoginPassword);

router.post("/user/register", userRegister);

router.post("/user/forgotten-password", userForgottenPassword);

// --- Authenticated Challenge Routes ---
router.post("/challenges/:operationId", requireAuth, challengeStartNew);

router.get("/challenges/:operationId", requireAuth, challengeGetAll);

router.get("/challenges/:operationId/:id", requireAuth, challengeGet);

router.put("/challenges/:operationId/:id", requireAuth, challengeUpdateResult);

// --- Authenticated Subscription Routes ---
router.post("/subscriptions", requireAuth, subscriptionUpdate);

router.delete("/subscriptions", requireAuth, subscriptionCancelImmediately);

// --- Authenticated Progress Routes ---
router.get("/game/progress", requireAuth, gameProgress);

// --- Authenticated Cosmetics Routes ---
router.get("/cosmetics", requireAuth, cosmeticsGet);

router.post("/user/cosmetics/buy", requireAuth, cosmeticsBuy);

router.post("/user/cosmetics/equip", requireAuth, cosmeticsEquip);

export default router;
