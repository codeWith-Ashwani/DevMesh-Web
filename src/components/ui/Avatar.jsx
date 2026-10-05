import { useState } from "react";

export default function Avatar({ user, className = "h-10 w-10" }) {
  const [failedUrl, setFailedUrl] = useState(null);
  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Developer";
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
  return (
    <span className={`avatar ${className}`} role="img" aria-label={name}>
      {user?.photoUrl && failedUrl !== user.photoUrl ? (
        <img
          src={user.photoUrl}
          alt=""
          onError={() => setFailedUrl(user.photoUrl)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </span>
  );
}
