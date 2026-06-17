import MDXComponents from "@theme-original/MDXComponents";
import Term from "@site/src/components/GlossaryTerm";

// Make <Term> available in every .md / .mdx file without a per-file import.
export default {
  ...MDXComponents,
  Term,
};
