/**
 * Swizzled (ejected) from @docusaurus/theme-classic@3.9.2.
 *
 * Customization: the "Last updated by" footer renders the contributor's GitHub
 * handle linked to their profile instead of their raw git display name.
 *
 * The name -> handle map is built automatically at build time by the
 * `last-update-authors` plugin (see plugins/last-update-authors.js), which
 * derives handles from each contributor's GitHub noreply commit email. New
 * contributors are linked with no changes here; anyone whose handle can't be
 * derived falls back to their plain git name (stock Docusaurus behavior).
 */
import React from "react";
import Link from "@docusaurus/Link";
import Translate from "@docusaurus/Translate";
import { ThemeClassNames } from "@docusaurus/theme-common";
import { useDateTimeFormat } from "@docusaurus/theme-common/internal";
import { usePluginData } from "@docusaurus/useGlobalData";

function useGithubHandle(authorName) {
  // usePluginData (without failfast) returns undefined rather than throwing if
  // the plugin produced no data, so an undiscoverable handle just falls back to
  // the plain name below — and SSG never breaks.
  const data = usePluginData("last-update-authors");
  const handles = data?.handles ?? {};
  return handles[authorName];
}

function LastUpdatedAtDate({ lastUpdatedAt }) {
  const atDate = new Date(lastUpdatedAt);
  const dateTimeFormat = useDateTimeFormat({
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  const formattedLastUpdatedAt = dateTimeFormat.format(atDate);
  return (
    <Translate
      id="theme.lastUpdated.atDate"
      description="The words used to describe on which date a page has been last updated"
      values={{
        date: (
          <b>
            <time dateTime={atDate.toISOString()} itemProp="dateModified">
              {formattedLastUpdatedAt}
            </time>
          </b>
        ),
      }}
    >
      {" on {date}"}
    </Translate>
  );
}

function LastUpdatedByUser({ lastUpdatedBy }) {
  const handle = useGithubHandle(lastUpdatedBy);
  const user = handle ? (
    <b>
      <Link to={`https://github.com/${handle}`}>@{handle}</Link>
    </b>
  ) : (
    <b>{lastUpdatedBy}</b>
  );
  return (
    <Translate
      id="theme.lastUpdated.byUser"
      description="The words used to describe by who the page has been last updated"
      values={{ user }}
    >
      {" by {user}"}
    </Translate>
  );
}

export default function LastUpdated({ lastUpdatedAt, lastUpdatedBy }) {
  return (
    <span className={ThemeClassNames.common.lastUpdated}>
      <Translate
        id="theme.lastUpdated.lastUpdatedAtBy"
        description="The sentence used to display when a page has been last updated, and by who"
        values={{
          atDate: lastUpdatedAt ? (
            <LastUpdatedAtDate lastUpdatedAt={lastUpdatedAt} />
          ) : (
            ""
          ),
          byUser: lastUpdatedBy ? (
            <LastUpdatedByUser lastUpdatedBy={lastUpdatedBy} />
          ) : (
            ""
          ),
        }}
      >
        {"Last updated{atDate}{byUser}"}
      </Translate>
      {process.env.NODE_ENV === "development" && (
        <div>
          {/* eslint-disable-next-line @docusaurus/no-untranslated-text */}
          <small> (Simulated during dev for better perf)</small>
        </div>
      )}
    </span>
  );
}
