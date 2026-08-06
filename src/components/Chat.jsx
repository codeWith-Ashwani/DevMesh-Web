import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";

function Chat() {
  const { userId } = useParams();
  const location = useLocation();
  const currentUser = useSelector((store) => store.user);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const otherUser = location.state?.user;

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/chat/${userId}`, { withCredentials: true });
        setMessages(response.data.data);
        setError("");
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load this chat.");
      }
    };
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!text.trim()) return;
    try {
      const response = await axios.post(`${BASE_URL}/chat/${userId}`, { text }, { withCredentials: true });
      setMessages((current) => [...current, response.data.data]);
      setText("");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to send your message.");
    }
  };

  return <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-8"><section className="soft-card flex min-h-[70vh] flex-1 flex-col overflow-hidden rounded-3xl border border-blue-100 bg-white"><header className="flex items-center gap-3 border-b border-blue-100 px-6 py-4"><img className="h-11 w-11 rounded-xl object-cover" src={otherUser?.photoUrl || "https://placehold.co/96x96/e0e7ff/1e3a8a?text=Dev"} alt="Connection" /><div><p className="text-lg font-bold text-slate-900">{otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : "Your connection"}</p><p className="text-sm text-blue-600">Messages refresh automatically</p></div></header><div className="flex-1 space-y-4 overflow-y-auto p-5">{error && <p className="rounded-xl bg-pink-50 p-3 text-sm text-pink-700">{error}</p>}{!error && messages.length === 0 && <div className="grid h-full place-items-center text-center"><div><p className="text-4xl font-mono text-blue-600">&lt;/&gt;</p><h1 className="mt-3 text-xl font-bold text-slate-800">Start the conversation</h1><p className="mt-1 text-slate-500">Say hello and discover what you can build together.</p></div></div>}{messages.map((message) => { const mine = message.fromUserId === currentUser?._id; return <div key={message._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${mine ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}><p>{message.text}</p><p className={`mt-1 text-xs ${mine ? "text-blue-100" : "text-slate-400"}`}>{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p></div></div>})}</div><form className="flex gap-3 border-t border-blue-100 p-4" onSubmit={sendMessage}><input className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={text} maxLength="2000" placeholder="Write a message..." onChange={(event) => setText(event.target.value)} /><button className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700" type="submit">Send</button></form></section></main>;
}

export default Chat;
