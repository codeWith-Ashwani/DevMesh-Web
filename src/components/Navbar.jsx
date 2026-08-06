import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { removeUser } from "../utils/userSlice";

function ThemeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  useEffect(() => { document.documentElement.classList.toggle("dark", dark); localStorage.setItem("theme", dark ? "dark" : "light"); }, [dark]);
  return <button className="grid h-10 w-10 place-items-center rounded-xl border border-blue-100 bg-white text-lg text-blue-700 hover:bg-blue-50" onClick={() => setDark((value) => !value)} title="Toggle dark mode" aria-label="Toggle dark mode">{dark ? "☀" : "◐"}</button>;
}

function Navbar() {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = async () => { try { await axios.post(`${BASE_URL}/logout`, {}, { withCredentials: true }); dispatch(removeUser()); navigate("/login"); } catch (err) { console.error(err); } };
  return <header className="sticky top-0 z-20 border-b border-blue-100 bg-white/90 backdrop-blur"><nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3"><Link to="/" className="flex items-center gap-3"><span className="brand-gradient grid h-10 w-10 place-items-center rounded-xl shadow-md shadow-pink-200"><svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-white stroke-2"><path d="m8 9-3 3 3 3M16 9l3 3-3 3M14 5l-4 14" strokeLinecap="round" strokeLinejoin="round" /></svg></span><span className="text-xl font-extrabold tracking-tight text-slate-900">Dev<span className="text-pink-500">Mesh</span></span></Link><div className="flex items-center gap-3"><Link className="hidden text-sm font-bold text-blue-700 hover:text-pink-600 sm:block" to="/projects">Projects</Link><ThemeToggle />{user ? <div className="dropdown dropdown-end"><button tabIndex={0} className="flex items-center gap-3 rounded-full py-1 pl-2 pr-1 hover:bg-blue-50"><span className="hidden text-sm font-medium text-slate-600 sm:block">Hi, {user.firstName}</span><img className="h-9 w-9 rounded-full border-2 border-pink-200 object-cover" src={user.photoUrl} alt="Your profile" /></button><ul tabIndex={0} className="menu dropdown-content z-30 mt-3 w-52 rounded-2xl border border-blue-100 bg-white p-2 text-slate-700 shadow-xl"><li><Link to="/profile">Edit profile</Link></li><li><Link to="/projects">Project board</Link></li><li><Link to="/connections">Connections</Link></li><li><Link to="/requests">Requests</Link></li><li><button className="text-pink-600" onClick={handleLogout}>Log out</button></li></ul></div> : <Link className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700" to="/login">Get started</Link>}</div></nav></header>;
}
export default Navbar;
