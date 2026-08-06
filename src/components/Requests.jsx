import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addRequests, removeRequests } from "../utils/requestsSlice";

function Requests() {
  const requests = useSelector((store) => store.requests); const dispatch = useDispatch();
  useEffect(() => { axios.get(`${BASE_URL}/user/requests/received`, { withCredentials: true }).then((res) => dispatch(addRequests(res.data.data))).catch(console.error); }, [dispatch]);
  const review = async (status, id) => { try { await axios.post(`${BASE_URL}/request/review/${status}/${id}`, {}, { withCredentials: true }); dispatch(removeRequests(id)); } catch (err) { console.error(err); } };
  if (!requests.length) return <Empty title="No pending requests" text="When another developer wants to connect, you’ll see them here." />;
  return <main className="mx-auto max-w-4xl px-5 py-10"><PageTitle eyebrow="Your network" title="Connection requests" /><div className="mt-7 space-y-4">{requests.map(({ _id, fromUserId: user }) => <article key={_id} className="soft-card flex flex-col gap-5 rounded-2xl border border-blue-100 bg-white p-5 sm:flex-row sm:items-center"><img className="h-20 w-20 rounded-2xl object-cover" src={user.photoUrl} alt={`${user.firstName}'s profile`} /><div className="flex-1"><h2 className="text-xl font-bold text-slate-900">{user.firstName} {user.lastName}</h2><p className="mt-1 text-sm text-slate-500">{user.age && user.gender ? `${user.age} years · ${user.gender}` : "Developer"}</p><p className="mt-2 text-slate-600">{user.about}</p></div><div className="flex gap-3"><button className="rounded-xl border border-pink-200 px-4 py-2 font-semibold text-pink-600 hover:bg-pink-50" onClick={() => review("rejected", _id)}>Decline</button><button className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700" onClick={() => review("accepted", _id)}>Accept</button></div></article>)}</div></main>;
}
export const PageTitle = ({ eyebrow, title }) => <header><p className="text-sm font-bold uppercase tracking-widest text-pink-500">{eyebrow}</p><h1 className="mt-1 text-3xl font-extrabold text-slate-900">{title}</h1></header>;
export const Empty = ({ title, text }) => <section className="mx-auto mt-16 max-w-md rounded-3xl border border-blue-100 bg-white p-10 text-center soft-card"><p className="text-4xl">💌</p><h1 className="mt-4 text-2xl font-bold text-slate-800">{title}</h1><p className="mt-2 text-slate-500">{text}</p></section>;
export default Requests;
