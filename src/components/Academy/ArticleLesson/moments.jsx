import React, { useState } from "react";
import { AppButton, AppInput, NOT_READY, PracticeVault } from "../AppMock";
import { LessonControl } from "../kit";
import { TAUGHT } from "../Beginner";
import { useMoment, useMomentNote } from "./position";
import { Stage } from "./index";

/**
 * The practice moments of the article lessons, each set into the
 * lesson's MDX.
 *
 * A moment reads the live position from the lesson's store and writes to it
 * once, when the reader presses the app's button. Until every moment above
 * it is done it shows the live position with its field and button switched
 * off. Once done it keeps its own after-state, with the change chips against
 * the state before, and the button stays switched off under the app's label.
 * The words around a moment are the MDX's; a moment adds only the app's own
 * labels.
 *
 * Each moment carries two statics the Pager reads,
 * `moment` (its id in the store) and `hint` (the line beside the footer's
 * Next while the moment is not done), and every switched-off button says
 * why under itself: the wrong amount ("Type 10,000"), more than is there, or
 * an earlier step not done.
 *
 * One practice element per page, and it changes in place. A page with two
 * actions keeps
 * one element that carries both in turn, with an `Await` marker in the MDX
 * where the second action's result waits (see index.jsx).
 *
 * A switched-off button does not print its reason inside the
 * element ("Clear the field and type 5,000" was read before the text
 * that explains it). Each moment's `hint` is the specific next action
 * ("Type 10,000 and press Deposit"), shown beside the footer's Next, and a
 * moment reports only what is wrong ("That is more than your wallet holds")
 * through `useMomentNote`, which the footer shows in place of the hint.
 */

/**
 * Under a control whose moment is not open yet. It lives with AppButton and
 * LessonControl, which leave it off on the article lessons.
 */
export { NOT_READY };
/** A typed amount the wallet does not hold. */
export const OVER_WALLET = "That is more than your wallet holds";

/* ── Lesson 2: Deposit and earn ──────────────────────────── */

/** The course's example APR. The year is 5% of 10,000, exactly 500. */
const APR = 0.05;
const DEPOSIT = 10_000;
const TAKE = 500;

/** "Type 10,000 in the USDC field on the Deposit tab and press Deposit." */
export function DepositMoment() {
  const m = useMoment("deposit");
  const [typed, setTyped] = useState("");
  const shown = m.done ? m.after : m.position;
  const n = Number(typed) || 0;
  const ok = m.ready && n === DEPOSIT && m.position.wallet >= DEPOSIT;
  const hint = m.done ? null : !m.ready ? NOT_READY : n > m.position.wallet ? OVER_WALLET : n !== DEPOSIT ? "Type 10,000" : null;
  useMomentNote("deposit", m.ready && n > m.position.wallet ? OVER_WALLET : null);
  return (
    <Stage>
      <PracticeVault
        apr={APR}
        deposit={shown.deposit}
        taught={TAUGHT.apr}
        lit={["deposit"]}
        prev={m.before}
        tab="Deposit/Borrow"
        wash
      >
        <AppInput
          token="USDC"
          amount={m.done ? "" : typed}
          onChange={m.ready ? setTyped : undefined}
          balance={shown.wallet}
          prevBalance={m.done ? m.before.wallet : null}
          digits={0}
        />
        <AppInput token="alUSD" dim />
        <AppButton
          disabled={!ok}
          hint={hint}
          onClick={() => m.apply({ ...m.position, wallet: m.position.wallet - DEPOSIT, deposit: m.position.deposit + DEPOSIT })}
        >
          Deposit
        </AppButton>
      </PracticeVault>
    </Stage>
  );
}
DepositMoment.moment = "deposit";
DepositMoment.hint = "Type 10,000 and press Deposit";

/**
 * Lesson 2's third page on one element. "Press Skip ahead a year" moves the
 * Deposit stat; the same vault then opens on the Withdraw tab for "type 500
 * in the USDC field and press Withdraw". The MDX puts an `Await` marker for
 * the withdraw after the paragraph that asks for it.
 */
export function YearThenWithdrawMoment() {
  const year = useMoment("year");
  const take = useMoment("withdraw");
  const [out, setOut] = useState("");
  const n = Number(out) || 0;
  const shown = take.done ? take.after : year.done ? year.after : year.position;
  const prev = take.done ? take.before : year.done ? year.before : null;
  const ok = take.ready && n === TAKE && take.position.deposit >= TAKE;
  const hint = take.done
    ? null
    : !take.ready
      ? NOT_READY
      : n > take.position.deposit
        ? "That is more than your deposit"
        : n !== TAKE
          ? "Type 500"
          : null;
  useMomentNote("withdraw", take.ready && n > take.position.deposit ? "That is more than your deposit" : null);
  return (
    <Stage>
      <PracticeVault
        apr={APR}
        deposit={shown.deposit}
        taught={TAUGHT.apr}
        // The APR tile is lit while the page talks about the year it earns
        // then Deposit alone once the year has run.
        lit={year.done ? ["deposit"] : ["apr", "deposit"]}
        prev={prev}
        tab={year.done ? "Withdraw" : null}
        wash
      >
        {year.done ? (
          <>
            <AppInput
              token="USDC"
              type="Available"
              amount={take.done ? "" : out}
              onChange={take.ready ? setOut : undefined}
              balance={shown.deposit}
              digits={0}
            />
            <AppButton
              disabled={!ok}
              hint={hint}
              onClick={() => take.apply({ ...take.position, wallet: take.position.wallet + TAKE, deposit: take.position.deposit - TAKE })}
            >
              Withdraw
            </AppButton>
          </>
        ) : null}
      </PracticeVault>
      {year.done ? null : (
        <LessonControl
          disabled={!year.ready}
          hint={NOT_READY}
          onClick={() => year.apply({ ...year.position, deposit: year.position.deposit * (1 + APR) })}
        >
          Skip ahead a year
        </LessonControl>
      )}
    </Stage>
  );
}
YearThenWithdrawMoment.moment = "year";
YearThenWithdrawMoment.hint = "Press Skip ahead a year to continue";
