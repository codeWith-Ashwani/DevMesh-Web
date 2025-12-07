// import React from "react";
import axios from "axios";
import React, { useEffect } from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { removeUserFeed } from "../utils/feedSlice";




const UserCard = ({ user }) => {
  const { _id, firstName, lastName, photoUrl, age, gender, about, skills } =
    user;
  // const requests = useSelector((store) => store.requests);
  const dispatch = useDispatch();
  const handleSendRequest = async (status, userId) => {
    
    try {
      const res = await axios.post(
       `${BASE_URL}/request/send/${status}/${userId}` ,
        {},
        {
          withCredentials: true,
        }
      );
      dispatch(removeUserFeed(userId));
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="card bg-base-300 w-96 shadow-sm">
      <figure>
        <img src={photoUrl} alt="photo" />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{firstName + " " + lastName}</h2>
        {age && gender && <p>{age + ",  " + gender}</p>}
        <p>{about}</p>
        <div className="card-actions justify-center my-4">
          <button
            className="btn btn-secondary"
            onClick={() => handleSendRequest("interested", _id)}
          >
            Interested
          </button>
          <button
            className="btn btn-primary"
            onClick={() => handleSendRequest("ignore", _id)}
          >
            Ignore
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
