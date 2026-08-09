import { FiMail, FiUser } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

function ProfileCard() {
  const { updateEmailNotifications, user } = useAuth();
  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="mt-3 flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-900 text-base font-black text-white dark:bg-slate-100 dark:text-slate-900">
        {initials || <FiUser />}
      </div>
      <div className="min-w-0">
        <span className="block text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">
          Profile
        </span>
        <strong className="block truncate text-sm font-black text-slate-900 dark:text-white">
          {user?.name}
        </strong>
        <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-slate-500 dark:text-slate-400">
          <FiMail />
          {user?.email}
        </p>
        <label className="mt-2 flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
          <input
            checked={user?.emailNotificationsEnabled !== false}
            className="h-4 w-4 accent-orange-400"
            type="checkbox"
            onChange={(event) => updateEmailNotifications(event.target.checked)}
          />
          Email notifications
        </label>
      </div>
    </section>
  );
}

export default ProfileCard;
