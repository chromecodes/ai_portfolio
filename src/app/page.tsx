import Agentbar from "./components/Agentbar";
import Chat from "./components/Chat";
import MainBg from "./components/MainBg";
import Topbar from "./components/Topbar";

export default function Home() {
  return (
    <div className="dark">
      <Topbar />
      <MainBg />
      <Chat />
      <Agentbar />
    </div>
  );
}
