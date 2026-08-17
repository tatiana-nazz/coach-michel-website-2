import { PrivateAccessEntry } from '@/features/access/screens/scr-acc-001/private-access-entry';

import styles from './page.module.css';

export default function QaHandoffPage() {
  return (
    <main
      className={styles.qaSurface}
      data-qa-handoff-purpose="temporary"
      data-qa-handoff-surface="SCR-ACC-001"
    >
      <p className={styles.qaBanner}>Temporary QA handoff · SCR-ACC-001</p>
      <PrivateAccessEntry />
    </main>
  );
}
