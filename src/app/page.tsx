import Agentbar from "./components/Agentbar";
import Chat from "./components/Chat";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <Chat />
      <Agentbar />
    </div>
  );
}
