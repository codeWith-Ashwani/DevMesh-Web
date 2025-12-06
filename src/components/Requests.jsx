import axios from "axios";
import React, { useEffect } from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addRequests, removeRequests } from "../utils/requestsSlice";

const buildUrl = (base, path) =>
  base ? `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}` : path;


function Requests() {
  const requests = useSelector((store) => store.requests);
  const dispatch = useDispatch();

  const reviewRequests = async (status, _id) => {
    const path = `/request/review/${status}/${_id}`;
    const url = buildUrl(BASE_URL, path);
    try {
      const res = await axios.post(
        url,
        {},
        {
          withCredentials: true,
        }
      );
      dispatch(removeRequests(_id));
    } catch (err) {
      console.log(err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/requests/received", {
        withCredentials: true,
      });

      dispatch(addRequests(res.data.data));
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (!requests) {
    return <h1 className="flex justify-center text-2xl">Loading...</h1>;
  }

  if (requests.length === 0) {
    return (
      <h1 className="flex justify-center text-2xl py-10">No Requests found</h1>
    );
  }

  return (
    <div className="text-center my-10">
      <h1 className="text-bold text-white text-3xl">Requests</h1>
      {requests.map((request) => {
        const {
          _id,
          firstName,
          lastName,
          photoUrl,
          age,
          gender,
          skills,
          about,
        } = request.fromUserId;
        return (
          <div
            key={_id}
            className=" flex m-4 p-4 border rounded-lg bg-base-300 w-full mx-auto"
          >
            <div>
              <img
                src={photoUrl}
                className="w-20 h-20 rounded-full"
                alt="photo"
              />
            </div>
            <div className="text-left mx-4  ">
              <h2 className="font-bold text-2xl p-1">
                {firstName + " " + lastName}
              </h2>
              {age && gender && <p>{age + ", " + gender}</p>}
              <p>{about}</p>
            </div>
            <div className="card-actions justify-center mx-7 my-4">
              <button
                className="btn btn-secondary"
                onClick={() => reviewRequests("accepted", request._id)}
              >
                Accept
              </button>
              <button
                className="btn btn-primary"
                onClick={() => reviewRequests("rejected", request._id)}
              >
                Reject
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Requests;
