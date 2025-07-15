'use client';

import MemForm from './components/memoryForm';
import styles from './page.module.css';

export default function Home() {
  // const memFormData = new FormData('memForm');
  return (
    <section className={styles.content}>
      <header className={styles.header}>
        <h1 className={styles.heroTitle}>Remnis</h1>
        <nav></nav>
      </header>
      <main className={styles.main}>
        <MemForm />
      </main>
    </section>
  );
}
