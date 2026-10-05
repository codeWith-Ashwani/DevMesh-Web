import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import { IconTerminal, IconChevronRight, IconX } from "./Icons";
const actions = [
  ["Overview", "/"],
  ["Discover developers", "/feed"],
  ["Connections", "/connections"],
  ["Connection requests", "/requests"],
  ["Projects", "/projects"],
  ["Find your team", "/collaborate"],
  ["Messages", "/messages"],
  ["My profile", "/profile"],
];
export default function CommandPalette({ isOpen, onClose }) {
  return isOpen ? <Palette onClose={onClose} /> : null;
}
function Palette({ onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const filtered = actions.filter(([label]) =>
    label.toLowerCase().includes(query.toLowerCase()),
  );
  const close = useCallback(() => onClose(), [onClose]);
  const go = (path) => {
    navigate(path);
    onClose();
  };
  return (
    <Modal label="Jump to a page" onClose={close}>
      <div className="flex items-center gap-3 p-4 border-b border-[#26383D]">
        <IconTerminal className="h-5 w-5 text-[#B7ED82] shrink-0" />
        <input
          aria-label="Find a page"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded="true"
          aria-controls="page-options"
          aria-activedescendant={
            filtered[selected] ? "page-" + selected : undefined
          }
          className="w-full bg-transparent outline-none text-sm"
          placeholder="Where would you like to go?"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelected(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setSelected((value) => (value + 1) % (filtered.length || 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setSelected(
                (value) =>
                  (value - 1 + filtered.length) % (filtered.length || 1),
              );
            } else if (event.key === "Enter" && filtered[selected]) {
              event.preventDefault();
              go(filtered[selected][1]);
            }
          }}
        />
        <button
          aria-label="Close page switcher"
          className="icon-button"
          onClick={close}
        >
          <IconX />
        </button>
      </div>
      <div id="page-options" role="listbox" aria-label="Pages" className="p-3">
        {filtered.map(([label, path], index) => (
          <button
            id={"page-" + index}
            key={path}
            role="option"
            aria-selected={index === selected}
            className={
              "w-full flex items-center justify-between px-4 py-3 text-sm rounded-lg text-left " +
              (index === selected
                ? "bg-[#1B2B30] text-[#B7ED82]"
                : "text-[#9AADAA]")
            }
            onMouseEnter={() => setSelected(index)}
            onClick={() => go(path)}
          >
            {label}
            <IconChevronRight className="h-4 w-4" />
          </button>
        ))}
        {!filtered.length && (
          <p className="p-8 text-center text-sm text-[#9AADAA]">
            No pages match “{query}”.
          </p>
        )}
      </div>
      <p className="px-5 py-3 border-t border-[#26383D] text-[11px] font-mono text-[#9AADAA]">
        ↑ ↓ to choose · Enter to open · Esc to close
      </p>
    </Modal>
  );
}
