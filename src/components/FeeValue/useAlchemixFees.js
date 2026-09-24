import { useState, useEffect } from "react";

// Live on-chain fee reader for the Alchemix v3 fee schedule.
//
// Fees are governance parameters stored on-chain. Each one is read directly from
// its contract so the docs cannot drift out of date:
//   redemption  -> Alchemist.protocolFee()        (BPS, /10000)
//   liquidator  -> Alchemist.liquidatorFee()      (BPS, /10000)
//   transmuter  -> Transmuter.transmutationFee()  (BPS, /10000)
//   earlyExit   -> Transmuter.exitFee()           (BPS, /10000)
//   myt         -> MYT Vault.performanceFee()     (WAD, /1e18)
//
// The FALLBACK values below are the confirmed on-chain values at the time of
// writing. They seed the tables so a reader always sees correct numbers even if
// the public RPCs are unavailable; live reads overlay them when they resolve.

const SELECTORS = {
  protocolFee: "0xb0e21e8a",
  liquidatorFee: "0xf3803f7f",
  transmutationFee: "0x05a909d4",
  exitFee: "0x6284ae41",
  performanceFee: "0x87788782",
};

// Base runs a single USDC market (alUSDb), so it has no `eth` entry. The v3
// deployer reused one address across chains, so several Base addresses match
// contracts of a different type on Ethereum, Optimism and Arbitrum. Verify any
// new Base address on Base itself rather than copying it from another chain.
const CHAINS = {
  ethereum: {
    rpcs: [
      "https://ethereum-rpc.publicnode.com",
      "https://cloudflare-eth.com",
      "https://eth.llamarpc.com",
    ],
    assets: {
      eth: {
        alchemist: "0xfa995B6ABc387376C3e7De5f6d394Ab5B6beE26B",
        transmuter: "0x073598132f37756a7E665FB52f1757463120bd3C",
        myt: "0x29bcfeD246ce37319d94eBa107db90C453D4c43D",
      },
      usdc: {
        alchemist: "0xeB83112d925268BeDe86654C13D423a987587e3E",
        transmuter: "0x2584E8b0616b3E750492c9629a3b27679C410cb9",
        myt: "0x9B44efCa3e2a707B63Dc00CE79d646E5E5D24bA5",
      },
    },
  },
  optimism: {
    rpcs: [
      "https://mainnet.optimism.io",
      "https://optimism-rpc.publicnode.com",
      "https://optimism.llamarpc.com",
    ],
    assets: {
      eth: {
        alchemist: "0xDeD3A04612FF12b57317abE38e68026Fc9D28114",
        transmuter: "0x2584E8b0616b3E750492c9629a3b27679C410cb9",
        myt: "0x91b8657aea26Caa8A0E9D6DD4E24727Ccf32F822",
      },
      usdc: {
        alchemist: "0x930750a3510E703535e943E826ABa3c364fFC1De",
        transmuter: "0x693b7594Ae0633d9c5574D0da46a040f92F5b281",
        myt: "0xAf510a560744880410f0f65e3341A020FBC2cA41",
      },
    },
  },
  arbitrum: {
    rpcs: [
      "https://arb1.arbitrum.io/rpc",
      "https://arbitrum-one-rpc.publicnode.com",
      "https://arbitrum.llamarpc.com",
    ],
    assets: {
      eth: {
        alchemist: "0xDeD3A04612FF12b57317abE38e68026Fc9D28114",
        transmuter: "0x2584E8b0616b3E750492c9629a3b27679C410cb9",
        myt: "0xfe8F223F3d81462F55bf8609897B8cEcfA4B195C",
      },
      usdc: {
        alchemist: "0x930750a3510E703535e943E826ABa3c364fFC1De",
        transmuter: "0x693b7594Ae0633d9c5574D0da46a040f92F5b281",
        myt: "0xEba62B842081CeF5a8184318Dc5C4E4aACa9f651",
      },
    },
  },
  base: {
    rpcs: [
      "https://mainnet.base.org",
      "https://base-rpc.publicnode.com",
      "https://base.llamarpc.com",
    ],
    assets: {
      usdc: {
        alchemist: "0xEb380d86EeD275C9F2eD77745aB1B2ccf364BF7A",
        transmuter: "0x5B1c7180C630d3B2b6782Df70f43aE5Ea80425ba",
        myt: "0xb8BeFE5a6941ca4022a52042075ff269C3C67467",
      },
    },
  },
};

// Confirmed on-chain values (fractions of 1). Used as seed + fallback.
// Re-verified 2026-09-02: exitFee() is 100 bps on Ethereum and Optimism and
// 250 bps on Arbitrum, for both the alETH and alUSD transmuters.
// Re-verified 2026-09-15: liquidatorFee() is 150 bps on every Alchemist;
// performanceFee() is 5% on the Ethereum alETH MYT and 15% on the other five.
// Base read 2026-09-24: protocolFee() 10 bps, exitFee() 100 bps and
// performanceFee() 17.5%, which differ from the other chains.
const FALLBACK = {
  ethereum: {
    eth: { redemption: 0.0025, liquidator: 0.015, transmuter: 0, earlyExit: 0.01, myt: 0.05 },
    usdc: { redemption: 0.0025, liquidator: 0.015, transmuter: 0, earlyExit: 0.01, myt: 0.15 },
  },
  optimism: {
    eth: { redemption: 0.0025, liquidator: 0.015, transmuter: 0, earlyExit: 0.01, myt: 0.15 },
    usdc: { redemption: 0.0025, liquidator: 0.015, transmuter: 0, earlyExit: 0.01, myt: 0.15 },
  },
  arbitrum: {
    eth: { redemption: 0.0025, liquidator: 0.015, transmuter: 0, earlyExit: 0.025, myt: 0.15 },
    usdc: { redemption: 0.0025, liquidator: 0.015, transmuter: 0, earlyExit: 0.025, myt: 0.15 },
  },
  base: {
    usdc: { redemption: 0.001, liquidator: 0.015, transmuter: 0, earlyExit: 0.01, myt: 0.175 },
  },
};

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

async function ethCall(rpcs, to, data) {
  const body = JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "eth_call",
    params: [{ to, data }, "latest"],
  });
  for (const rpc of rpcs) {
    try {
      const res = await fetch(rpc, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (!res.ok) continue;
      const json = await res.json();
      if (json.error || !json.result || json.result === "0x") continue;
      return BigInt(json.result);
    } catch (e) {
      continue;
    }
  }
  return null;
}

const bps = (v) => (v == null ? null : Number(v) / 10000);
const wad = (v) => (v == null ? null : Number(v) / 1e18);

async function fetchFees() {
  const out = clone(FALLBACK);
  await Promise.all(
    Object.entries(CHAINS).map(async ([chain, cfg]) => {
      await Promise.all(
        Object.entries(cfg.assets).map(async ([asset, addrs]) => {
          const [redemption, liquidator, transmuter, earlyExit, myt] = await Promise.all([
            ethCall(cfg.rpcs, addrs.alchemist, SELECTORS.protocolFee).then(bps),
            ethCall(cfg.rpcs, addrs.alchemist, SELECTORS.liquidatorFee).then(bps),
            ethCall(cfg.rpcs, addrs.transmuter, SELECTORS.transmutationFee).then(bps),
            ethCall(cfg.rpcs, addrs.transmuter, SELECTORS.exitFee).then(bps),
            ethCall(cfg.rpcs, addrs.myt, SELECTORS.performanceFee).then(wad),
          ]);
          const cell = out[chain][asset];
          if (redemption != null) cell.redemption = redemption;
          if (liquidator != null) cell.liquidator = liquidator;
          if (transmuter != null) cell.transmuter = transmuter;
          if (earlyExit != null) cell.earlyExit = earlyExit;
          if (myt != null) cell.myt = myt;
        })
      );
    })
  );
  return out;
}

// Module-level cache shared by every component instance on the page.
let _promise = null;
let _cache = null;

export function useAlchemixFees() {
  const [fees, setFees] = useState(_cache ?? FALLBACK);

  useEffect(() => {
    if (_cache) {
      setFees(_cache);
      return;
    }
    if (!_promise) _promise = fetchFees();
    let active = true;
    _promise
      .then((data) => {
        _cache = data;
        if (active) setFees(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return fees;
}

export { FALLBACK };
