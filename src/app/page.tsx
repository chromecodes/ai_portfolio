import styles from "./page.module.css";
import Chat from "./Chat";

export default function Home() {
  return (
    <div className={styles.page}>
      <Chat />
    </div>
  );
}
