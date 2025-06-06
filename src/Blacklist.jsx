import {useState, useRef, useContext} from "react";
import PropTypes from "prop-types";
import IconButton from "./IconButton.jsx";
import CloseIcon from "./icons/CloseIcon.jsx";
import AddIcon from "./icons/AddIcon.jsx";
import DeleteIcon from "./icons/DeleteIcon.jsx";
import {bgColor, textColor, themeColor} from "./theme.js";
import {ThemeContext} from "./context.js";

BlacklistWindow.propTypes = {
  blacklist: PropTypes.array.isRequired,
  addBlacklist: PropTypes.func,
  deleteBlacklist: PropTypes.func,
  close: PropTypes.func,
};

function BlacklistWindow({blacklist, addBlacklist, deleteBlacklist, close}) {
  const theme = useContext(ThemeContext)

  const [newBlocked, setNewBlocked] = useState("");
  const inputRef = useRef();

  function handleAdd() {
    if (newBlocked.trim() === "") return;
    addBlacklist({blockedUser: newBlocked});
    setNewBlocked("");
  }

  function handleDelete(id) {
    deleteBlacklist(id);
  }

  function handleEnter(e) {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      handleAdd();
    }
  }

  return (
    <div
      className={`ptt-chat-blacklist ptt-overflow-auto ptt-fixed ptt-top-0 ptt-right-0 ptt-left-0 ptt-bottom-0 ptt-w-fit ptt-h-fit ptt-m-auto ptt-px-3 ptt-py-3 ptt-text-left ptt-rounded ${bgColor(theme)} ${textColor(theme)} ${themeColor(theme).iconButton}`}
    >
      <div className="ptt-flex ptt-justify-between ptt-mb-2">
        <h2>黑名單</h2>
        <IconButton onClick={close}>
          <CloseIcon/>
        </IconButton>
      </div>
      <div className="ptt-flex ptt-mb-2 ptt-pr-2">
        <input
          ref={inputRef}
          type="text"
          value={newBlocked}
          onChange={(e) => setNewBlocked(e.target.value)}
          className={`ptt-outline ptt-bg-transparent ptt-px-1 ptt-flex-auto ptt-rounded ${themeColor(theme).inputOutline} ptt-w-24`}
          placeholder="新增黑名單"
          onKeyDown={handleEnter}
        />
        <IconButton onClick={handleAdd} className="ptt-ml-2">
          <AddIcon/>
        </IconButton>
      </div>
      <div className="ptt-overflow-auto ptt-max-h-80 ptt-min-w-[320px] ptt-pr-2">
        <ul className="ptt-list">
          {blacklist.map((entry) => (
            <li key={entry.id} className="ptt-flex ptt-justify-between ptt-items-center ptt-mb-1">
              <span>{entry.blockedUser}</span>
              <div>
                <IconButton onClick={() => handleDelete(entry.id)} className="ptt-ml-2">
                  <DeleteIcon/>
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default BlacklistWindow;
