'use client';

import { useEffect } from 'react';
import styles from './error.module.css';

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.log(`Breaking Error:`, error);
  }, [error]);

  return (
    <section className={styles.errorWrap}>
      <h1 className={styles.errorHero}>
        Sorry, something went wrong
      </h1>
          <button className={styles.button} onClick={reset}>Reload Remnis</button>
    </section>
  );
}
