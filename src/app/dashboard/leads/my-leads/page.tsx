/*
|-----------------------------------------
| setting up Leads session-owned customers page
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/
import Query from "../_components/Query";
export default function Page() {
  return <Query kind="customers" mine />;
}
