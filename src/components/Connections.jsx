import axios from "axios";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addConnections } from "../utils/connectionsSlice";
import { Empty, PageTitle } from "./Requests";

function Connections() {
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();
  useEffect(() => { axios.get(`${BASE_URL}/user/connections`, { withCredentials: true }).then((res) => dispatch(addConnections(res.data.data))).catch(console.error); }, [dispatch]);
  if (!connections.length) return <Empty title="Your circle is waiting" text="Start exploring the feed to find developers to connect with." />;
  return <main className="mx-auto max-w-4xl px-5 py-10"><PageTitle eyebrow="Your network" title="Connections" /><div className="mt-7 grid gap-4 sm:grid-cols-2">{connections.map((user) => <article key={user._id} className="soft-card rounded-2xl border border-blue-100 bg-white p-5"><div className="flex gap-4"><img className="h-16 w-16 rounded-2xl object-cover" src={user.photoUrl} alt={`${user.firstName}'s profile`} /><div><h2 className="text-lg font-bold text-slate-900">{user.firstName} {user.lastName}</h2><p className="text-sm text-slate-500">{user.age && user.gender ? `${user.age} years · ${user.gender}` : "Developer"}</p></div></div><p className="mt-4 text-sm leading-6 text-slate-600">{user.about}</p><Link className="mt-5 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700" to={`/chat/${user._id}`} state={{ user }}>Open chat</Link></article>)}</div></main>;
}
export default Connections;
