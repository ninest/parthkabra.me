import { Chat } from "@/components/special/chat";
import { Keyboard } from "@/components/special/keyboard";

export default function Home() {
  return (
    <main>
      <Keyboard />

      <Chat
        messages={[
          { me: true, text: "Hi, may I know on what days you clean the bathroom?" },
          { me: true, text: "Do let me know so we can set up a schedule for both of us to clean" },
          { me: false, text: "The school will clean it regularly." },
          { me: false, text: "Someone will clean the toilet for us. You can use the vacuum if you feel dirty." },
        ]}
      />
    </main>
  );
}
