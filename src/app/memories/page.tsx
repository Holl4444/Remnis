'use client';
import { useActionState, useEffect, startTransition } from 'react';
import MemoryCard from '../components/MemoryCard';
import styles from './page.module.css';

interface MemoryData {
  memId: string;
  text: string;
  memTags: string[];
}

interface MemoriesState {
    memories: MemoryData[];
    count: number;
    error: string | null;
}

const initialState: MemoriesState = {
    memories: [],
    count: 0,
    error: null,
};

async function fetchMemoriesAction(
  prevState: MemoriesState
): Promise<MemoriesState> {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const response = await fetch(`${apiBaseUrl}/memories`);
    if (response.ok) {
      const memorydata = await response.json();
      if (memorydata.success) {
        return {
          memories: memorydata.memories,
          count: memorydata.count,
          error: null,
        }
      } else {
        return {
          ...prevState,
          error: memorydata.error,
        };
      }
    } else {
      return {
        memories: [],
        count: 0,
        error: `HTTP error: ${response.status}`,
      };
    }
  } catch (err) {
    console.error(err);
    return {
        memories: [],
        count: 0,
        error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export default function Memories() {
  const [state, fetchAction, isPending] = useActionState(
    fetchMemoriesAction,
    initialState
  );

    useEffect(() => {
        startTransition(() => {
            fetchAction();
        });  
  }, [fetchAction]);

  if (isPending) return <div>Loading memories...</div>;
  if (state.error) return <div>Error: {state.error}</div>;

  return (
    <section className={styles.content}>
      <h1 className={styles.memoriesTitle}>
        Memories ({state.count})
      </h1>
      <ul className={styles.memCardUl}>
        {state.memories.map((memory) => (
          <MemoryCard key={memory.memId} memObj={memory}></MemoryCard>
        ))}
      </ul>
    </section>
  );
}
