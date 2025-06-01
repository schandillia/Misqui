// src/lib/avatar.ts
import { createAvatar } from "@dicebear/core"
import { avataaars } from "@dicebear/collection"

export function generateAvatar(seed: string): string {
  const avatar = createAvatar(avataaars, {
    seed: seed || "default",
    size: 128,
    backgroundColor: ["#FFDFBF", "#D5E8D4", "#FFE6F0"],
    accessoriesProbability: 50,
    accessories: ["eyepatch", "round", "sunglasses"],
    facialHairProbability: 0,
    top: ["shortCurly", "shortFlat", "longButNotTooLong", "bun", "curvy"],
    clothing: ["blazerAndShirt", "graphicShirt", "hoodie", "shirtCrewNeck"],
  }).toString()

  const avatarBase64 = Buffer.from(avatar).toString("base64")
  return `data:image/svg+xml;base64,${avatarBase64}`
}
