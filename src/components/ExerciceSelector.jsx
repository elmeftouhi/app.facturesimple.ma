import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faLock, faLockOpen, faChevronDown, faSlidersH } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";

function ExerciceSelector() {
  const { exercices, selectedExercice, selectExercice } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const clickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, [dropdownOpen]);

  if (exercices.length === 0) {
    return (
      <Link
        to="/settings?tab=exercices"
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:border-slate-300 hover:bg-slate-100 transition"
      >
        <FontAwesomeIcon icon={faCalendarAlt} className="text-slate-400" />
        <span>Create Fiscal Year</span>
      </Link>
    );
  }

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-100 transition"
      >
        <FontAwesomeIcon icon={faCalendarAlt} className="text-slate-400" />
        <span>{selectedExercice?.name || "Select Year"}</span>
        {selectedExercice?.status === "CLOSED" ? (
          <FontAwesomeIcon icon={faLock} className="h-3 w-3 text-rose-500" title="Closed year" />
        ) : (
          <FontAwesomeIcon icon={faLockOpen} className="h-3 w-3 text-emerald-500" title="Open year" />
        )}
        <FontAwesomeIcon icon={faChevronDown} className="h-3 w-3 text-slate-400" />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-100">
          <div className="border-b border-slate-100 px-3 py-2 text-xxs font-bold uppercase tracking-wider text-slate-400">
            Fiscal Years
          </div>
          <div className="max-h-60 overflow-y-auto mt-1 space-y-0.5">
            {exercices.map((ex) => {
              const active = selectedExercice?.id === ex.id;
              return (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => {
                    selectExercice(ex);
                    setDropdownOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs transition ${
                    active
                      ? "bg-sky-50 font-bold text-sky-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div>{ex.name}</div>
                    <div className="text-xxxxs text-slate-400 font-normal">
                      {ex.startDate} to {ex.endDate}
                    </div>
                  </div>
                  {ex.status === "CLOSED" ? (
                    <FontAwesomeIcon icon={faLock} className="h-3 w-3 text-rose-500" />
                  ) : (
                    <FontAwesomeIcon icon={faLockOpen} className="h-3 w-3 text-emerald-500" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="border-t border-slate-100 mt-1.5 pt-1.5 px-2">
            <Link
              to="/settings?tab=exercices"
              onClick={() => setDropdownOpen(false)}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xxs font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition"
            >
              <FontAwesomeIcon icon={faSlidersH} className="h-3 w-3" />
              <span>Configure Years</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExerciceSelector;
