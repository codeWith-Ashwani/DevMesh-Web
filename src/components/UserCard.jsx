import axios from "axios";
import { useDispatch } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { removeUserFeed } from "../utils/feedSlice";

const UserCard = ({ user }) => {
  const { _id, firstName, lastName, photoUrl, age, gender, about, skills = [], githubUrl, linkedInUrl, portfolioUrl, lookingFor } = user;
  const dispatch = useDispatch();
  const isPreview = !_id;

  const handleSendRequest = async (status) => {
    try {
      await axios.post(`${BASE_URL}/request/send/${status}/${_id}`, {}, { withCredentials: true });
      dispatch(removeUserFeed(_id));
    } catch (err) {
      console.error("Unable to send request", err);
    }
  };

  return (
    <article className="soft-card w-full max-w-sm overflow-hidden rounded-3xl border border-blue-100 bg-white">
      <div className="relative h-72 bg-gradient-to-br from-blue-100 to-pink-100">
        <img className="h-full w-full object-cover" src={photoUrl} alt={`${firstName}'s profile`} />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/60 to-transparent" />
        <div className="absolute bottom-4 left-5 text-white">
          <h2 className="text-2xl font-bold">{firstName} {lastName}</h2>
          {age && gender && <p className="text-sm text-blue-50">{age} years · {gender}</p>}
        </div>
      </div>
      <div className="space-y-5 p-6">
        <p className="min-h-12 text-sm leading-6 text-slate-600">{about || "Tell the community a little about yourself."}</p>
        {lookingFor && <p className="rounded-xl bg-pink-50 px-3 py-2 text-sm font-semibold text-pink-700">Looking for: {lookingFor}</p>}
        {skills.length > 0 && <div className="flex flex-wrap gap-2">{skills.map((skill) => <span key={skill} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{skill}</span>)}</div>}
        {(githubUrl || linkedInUrl || portfolioUrl) && <div className="flex flex-wrap gap-3 text-sm font-semibold">{githubUrl && <a className="text-blue-600 hover:text-pink-600" href={githubUrl} target="_blank" rel="noreferrer">GitHub</a>}{linkedInUrl && <a className="text-blue-600 hover:text-pink-600" href={linkedInUrl} target="_blank" rel="noreferrer">LinkedIn</a>}{portfolioUrl && <a className="text-blue-600 hover:text-pink-600" href={portfolioUrl} target="_blank" rel="noreferrer">Portfolio</a>}</div>}
        {!isPreview && <div className="grid grid-cols-2 gap-3 pt-1">
          <button className="rounded-xl border border-pink-200 bg-pink-50 px-4 py-3 font-semibold text-pink-600 hover:bg-pink-100" onClick={() => handleSendRequest("ignore")}>Skip</button>
          <button className="brand-gradient rounded-xl px-4 py-3 font-semibold text-white shadow-lg shadow-pink-200 hover:-translate-y-0.5" onClick={() => handleSendRequest("interested")}>Connect</button>
        </div>}
      </div>
    </article>
  );
};

export default UserCard;
