import { useState, useEffect } from "react";
import ConfirmationModal from "../root/ConfirmationModal";
import Task from "./Task";
import "./tasks.css";

function TaskColumn(props) {
  const [titleActive, setTitleActive] = useState(false);
  const [titleActiveClasses, setTitleActiveClasses] = useState(
    " bg-transparent border-0 "
  );
  const [title, setTitle] = useState("");
  const [confirmationText, setConfirmationText] = useState("");
  const [confirmationAction, setConfirmationAction] = useState("");

  useEffect(() => {
    if (titleActive) {
      setTitleActiveClasses("");
    } else {
      setTitleActiveClasses(" bg-transparent border-0 ");
    }
  }, [titleActive]);

  useEffect(() => {
    setTitle(props.title);
  }, [props.title]);

  const handleTitleChange = (e) => {
    e.target.style.cssText =
      e.target.style.cssText + " height:" + e.target.scrollHeight + "px";
    setTitle(e.target.value);
  };

  const handleTitleFocus = (e) => {
    setTitleActive(true);
  };

  const handleTitleBlur = (e) => {
    setTitleActive(false);
    if (props.title !== title) props.saveTitle(title);
  };

  const promptConfirmation = (text, action) => {
    setConfirmationText(text);
    setConfirmationAction(() => action);
  };

  const handleHideConf = () => {
    setConfirmationText("");
    setConfirmationAction(null);
  };

  const handleChangeConfirm = () => {
    confirmationAction();
    setConfirmationAction(null);
    setConfirmationText("");
  };

  return (
    <>
      <ConfirmationModal
        hide={handleHideConf}
        text={confirmationText}
        performAction={handleChangeConfirm}
      />
      <div
        className="rounded bg-white p-2 mx-md-2 mb-md-4 mt-4"
        style={{ width: "21em" }}
      >
        <div
          id="columnHeader"
          className={
            "d-flex mb-3 px-2 pt-1 rounded shadow " +
            (!props.closedTasks ? "bg-light" : "bg-darkerGray")
          }
          style={{ border: "1px solid lightGray" }}
        >
          <div className="flex-grow-1">
            <textarea
              rows={1}
              className={
                "modalInput rounded overflow-hidden shadow-none w-100 " +
                (!props.closedTasks ? "pointer " : " ") +
                titleActiveClasses
              }
              style={{ fontWeight: "600", resize: "none" }}
              onFocus={!props.closedTasks && handleTitleFocus}
              onBlur={!props.closedTasks && handleTitleBlur}
              onChange={!props.closedTasks && handleTitleChange}
              value={title}
              readOnly={props.closedTasks}
              placeholder="???????? ??????????"
            ></textarea>
          </div>
          <div hidden={!props.closedTasks}>
            <button
              className="btn text-secondary fontSmall shadow-none"
              //   onClick={() => props.cleanClosedTasks()}
              onClick={() =>
                promptConfirmation(
                  `?????? ?????? ???????? ?????????????? ?????????? ???? ???????????? ???????????????`,
                  () => props.cleanClosedTasks()
                )
              }
            >
              ??????
            </button>
          </div>
          <div hidden={props.closedTasks}>
            <button
              className="btn text-secondary fontSmall shadow-none"
              onClick={() => props.showTaskModal(null)}
            >
              + ???????? ????????
            </button>
          </div>
          <div hidden={props.tasks.length || props.closedTasks}>
            <button
              className="btn button-link py-0 px-1 shadow-none text-muted"
              onClick={props.deleteGroup}
            >
              <h4>&times;</h4>
            </button>
          </div>
        </div>
        <div>
          {props.tasks.map((task, index) => {
            return (
              <Task
                key={index}
                showTaskModal={props.showTaskModal}
                details={task}
                users={props.users}
                currentUserId={props.currentUserId}
              />
            );
          })}
          {!props.tasks.length ? (
            <span className="fontSmall">?????? ??????????</span>
          ) : (
            ""
          )}
        </div>
      </div>
    </>
  );
}

export default TaskColumn;
