import { useState } from "react";
import axios from "axios";
import { restaurantService } from "../main";
import { HiSparkles, HiXMark, HiPaperAirplane } from "react-icons/hi2";

type ChatMessage = { role: "user" | "assistant"; content: string };

function AiSupportChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi! Ask me anything about your SwiftBite orders." },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const nextMessages = [...messages, { role: "user", content: text } as ChatMessage];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      const { data } = await axios.post(
        `${restaurantService}/api/ai/chat`,
        { message: text, history: nextMessages.slice(0, -1) },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      console.log(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't reach support right now. Try again in a bit." },
      ]);
    } finally {
      setSending(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#E23744] text-white shadow-lg cursor-pointer"
        aria-label="Open order support chat"
      >
        <HiSparkles className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex h-[28rem] w-80 flex-col overflow-hidden rounded-xl bg-white shadow-2xl border">
      <div className="flex items-center justify-between bg-[#E23744] px-4 py-3 text-white">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <HiSparkles className="h-4 w-4" /> SwiftBite Support
        </span>
        <button onClick={() => setOpen(false)} aria-label="Close chat" className="cursor-pointer">
          <HiXMark className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
              m.role === "user" ? "ml-auto bg-[#E23744] text-white" : "bg-gray-100 text-gray-800"
            }`}
          >
            {m.content}
          </div>
        ))}
        {sending && <div className="max-w-[85%] rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-400">Typing...</div>}
      </div>

      <div className="flex items-center gap-2 border-t p-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask about your order..."
          className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none"
        />
        <button
          onClick={sendMessage}
          disabled={sending}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E23744] text-white disabled:opacity-50 cursor-pointer"
          aria-label="Send"
        >
          <HiPaperAirplane className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default AiSupportChat;
