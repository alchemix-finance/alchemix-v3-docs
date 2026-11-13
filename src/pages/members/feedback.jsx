import React from "react";
import MembersShell from "@site/src/components/Members/Shell";
import Feedback from "@site/src/components/Members/Feedback";
import { FEEDBACK } from "@site/src/components/Members/copy";

/** /members/feedback: anonymous and signed feedback, your submissions, the shipped log (ticket 16). */
export default function MembersFeedbackPage() {
  return (
    <MembersShell title={FEEDBACK.headline} description={FEEDBACK.intro}>
      <Feedback />
    </MembersShell>
  );
}
