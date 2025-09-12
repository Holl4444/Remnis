import styles from './MemoryCard.module.css';

interface Memory {
    memId: string;
    text: string;
    memTags: string[];
}

export default function MemoryCard({ memObj }: { memObj: Memory }) {
    return (
        <li key={memObj.memId} className={styles.li}>
            <h3 className={styles.cardTitle}>{ memObj.memTags[0]}</h3>
            <p className={styles.cardText}>{memObj.text}</p>
            <p className={styles.tags}>Tags: {memObj.memTags.join(', ')}</p>
        </li>
    ); 
}