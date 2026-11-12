import React from "react";
import ArticleLesson from "@site/src/components/Academy/ArticleLesson";
import Content from "@site/src/components/Academy/lessons/intermediate/i1ThreeContracts.mdx";

/* Intermediate lesson 1 (script I1) starts with 20,000 USDC in the wallet and nothing in a vault. `walletMyt`
   puts mixUSDC beside the USDC in the strip once the wallet holds some. */
const START = { wallet: 20_000, walletAl: 0, walletMyt: 0, deposit: 0, debt: 0, earmarked: null, fixedYield: null };
const MOMENTS = ["deposit", "mixed-deposit", "add-myt", "send", "send-back", "loop"];

export default function Lesson() {
  return (
    <ArticleLesson
      lessonId="three-contracts"
      description="Follow a deposit from your wallet into MYT and the Alchemist, learn why your position is an NFT, and where the Transmuter fits."
      Content={Content}
      start={START}
      moments={MOMENTS}
      passTitle="Lesson 1 complete."
      deeper={[
        { to: "/dev/architecture/overview", label: "Architecture overview" },
        { to: "/user/concepts/myt-and-yield", label: "Mix-Yield Token" },
        { to: "/user/concepts/self-repaying-loans", label: "Self-repaying loans" },
      ]}
    />
  );
}
