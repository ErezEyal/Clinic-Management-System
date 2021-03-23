import { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import TaskItem from "./TaskItem";
import Select from "react-select";
import "./tasks.css";
import ConfirmationModal from "../root/ConfirmationModal";

function TaskModal(props) {
  const [titleActive, setTitleActive] = useState(false);
  const [descActive, setDescActive] = useState(false);
  const [titleActiveClasses, setTitleActiveClasses] = useState(
    " bg-transparent border-0 "
  );
  const [descActiveClasses, setDescActiveClasses] = useState(
    " bg-gray border-0 "
  );
  const [taskClosed, setTaskClosed] = useState(false);
  const [task, setTask] = useState(null);
  const [patient, setPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [confirmationText, setConfirmationText] = useState("");
  const [confirmationAction, setConfirmationAction] = useState("");

  useEffect(() => {
    console.log("task props: ", props.task);
    setTask(props.task);
    const patientOptions = [...props.patients];
    patientOptions.unshift({
      label: "בחר לקוח",
      value: 0,
    });
    setPatients(patientOptions);
  }, [props]);

  useEffect(() => {
    if (titleActive) {
      // inputRef.current.focus();
      setTitleActiveClasses("");
    } else {
      setTitleActiveClasses(" bg-transparent border-0 ");
    }

    if (descActive) {
      // inputRef.current.focus();
      setDescActiveClasses(" ");
    } else {
      setDescActiveClasses(" bg-gray border-0 ");
    }
  }, [titleActive, descActive]);

  useEffect(() => {
    if (task) {
      const taskItems = task.items;
      let allDone = true;
      if (!taskItems.length) {
        allDone = false;
      }
      for (const item of taskItems) {
        if (!item.done) {
          allDone = false;
        }
      }
      if (allDone) {
        setTaskClosed(true);
      } else {
        setTaskClosed(false);
      }
    }
  }, [task]);

  useEffect(() => {
    let existingPatient = false;
    props.patients.forEach((patientObject) => {
      if (props.task && patientObject.value === props.task.patientId) {
        setPatient(patientObject);
        existingPatient = true;
      }
    });
    if (!existingPatient) {
      console.log("setting null");
      setPatient(null);
    }
  }, [props]);

  const removeTaskItem = (key) => {
    const newList = task.items.filter((item) => {
      return item.number !== key;
    });
    let updatedTask = { ...task };
    updatedTask.items = newList;
    setTask(updatedTask);
  };

  const updateTaskItem = (itemObject) => {
    const updatedTasksList = task.items.map((item) => {
      if (item.number === itemObject.number) {
        return itemObject;
      }
      return item;
    });
    let updatedTask = { ...task };
    updatedTask.items = updatedTasksList;
    setTask(updatedTask);
  };

  const addTask = () => {
    for (const item of task.items) {
      if (!item.title) return;
    }

    const newItem = {
      title: "",
      done: false,
      number:
        task.items && task.items.length
          ? task.items[task.items.length - 1].number + 1
          : 1,
      date: Date.now() + 604800000,
      id: Date.now(),
    };
    let updatedTask = { ...task };
    updatedTask.items.push(newItem);
    setTask(updatedTask);
  };

  const handleSave = () => {
    if (!task.group) {
      alert("please add more details before saving");
    } else {
      props.saveTask(task);
      props.hide();
      setTask(null);
    }
  };

  const handleDelete = () => {
    if (!task._id) {
      alert("This task was not created yet");
    } else {
      props.deleteTask(task);
      props.hide();
      setTask(null);
    }
  };

  const changeTaskGroup = (groupID) => {
    let updatedTask = { ...task };
    updatedTask.group = groupID;
    setTask(updatedTask);
  };

  const handleTitleChange = (e) => {
    e.target.style.cssText =
      e.target.style.cssText + " height:" + e.target.scrollHeight + "px";
    //setTitle(e.target.value);
    let updatedTask = { ...task };
    updatedTask.title = e.target.value;
    setTask(updatedTask);
  };

  const handleDescChange = (e) => {
    e.target.style.height = "1px";
    e.target.style.height = Math.max(10 + e.target.scrollHeight, 100) + "px";

    let updatedTask = { ...task };
    updatedTask.description = e.target.value;
    setTask(updatedTask);
  };

  const handlePatientChange = (e) => {
    console.log(e.value);
    let updatedTask = { ...task };
    updatedTask.patientId = e.value;
    setTask(updatedTask);
    if (e.value) {
      setPatient({
        label: e.label,
        value: e.value,
      });
    } else {
      setPatient(null);
    }
  };

  const handleTitleFocus = (e) => {
    setTitleActive(true);
  };

  const handleTitleBlur = (e) => {
    setTitleActive(false);
  };

  const handleDescFocus = (e) => {
    e.target.style.height = e.target.scrollHeight + "px";
    setDescActive(true);
  };

  const handleDescBlur = (e) => {
    setDescActive(false);
  };

  const getTaskGroupTitle = () => {
    if (task && task.group) {
      const group = props.taskGroups.find((group) => group._id === task.group);
      if (group) {
        return group.title;
      }
    }
    return null;
  };

  const detailsIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className="bi bi-text-right"
      viewBox="0 0 16 16"
    >
      <path
        fillRule="evenodd"
        d="M6 12.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-4-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm4-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-4-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"
      />
    </svg>
  );

  const itemsIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className="bi bi-check2-square"
      viewBox="0 0 16 16"
    >
      <path
        fillRule="evenodd"
        d="M15.354 2.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L8 9.293l6.646-6.647a.5.5 0 0 1 .708 0z"
      />
      <path
        fillRule="evenodd"
        d="M1.5 13A1.5 1.5 0 0 0 3 14.5h10a1.5 1.5 0 0 0 1.5-1.5V8a.5.5 0 0 0-1 0v5a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V3a.5.5 0 0 1 .5-.5h8a.5.5 0 0 0 0-1H3A1.5 1.5 0 0 0 1.5 3v10z"
      />
    </svg>
  );

  const plusIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className="bi bi-plus-square"
      viewBox="0 0 16 16"
    >
      <path
        fillRule="evenodd"
        d="M14 1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"
      />
      <path
        fillRule="evenodd"
        d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"
      />
    </svg>
  );

  const labelIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className="bi bi-bookmark"
      viewBox="0 0 16 16"
    >
      <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z" />
    </svg>
  );

  const countRows = () => {
    if (!task) {
      return 2;
    } else {
      const linebreaks = (task.description.match(/\n/g) || []).length;
      return linebreaks + 4;
    }
  };

  const handleClosing = () => {
    if (task.closedAt) {
      delete task.closedAt;
    } else {
      task.closedAt = Date.now();
    }
    handleSave();
  };

  if (!task) return null;

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
    <Modal
      size="lg"
      show={props.show && !confirmationText}
      onHide={props.hide}
      animation={false}
      className="text-right"
    >
      <div
        className="modal-content pt-2 pb-4 px-3"
        style={{ backgroundColor: "#f4f5f7" }}
      >
        <div name="modalHeader" className="d-flex">
          <div className="flex-grow-1">
            <textarea
              rows={1}
              className={
                "modalInput pointer rounded overflow-hidden m-2 shadow-none w-100" +
                titleActiveClasses
              }
              style={{ fontSize: "large", fontWeight: "500", resize: "none" }}
              onFocus={handleTitleFocus}
              onBlur={handleTitleBlur}
              onChange={handleTitleChange}
              value={task ? task.title : ""}
              placeholder="כותרת מטלה"
            ></textarea>
          </div>
          <div>
            <button
              className="btn button-link py-0 px-1 mr-3 shadow-none text-muted"
              onClick={() => props.hide()}
            >
              <h4>&times;</h4>
            </button>
          </div>
        </div>
        <div name="modalBody">
          <div name="taskDetails" className="mb-4">
            <div className="my-2">
              <span className="d-inline-block modalIconWidth">
                {detailsIcon}
              </span>
              <h6 className="d-inline-block">פרטי המטלה</h6>
            </div>
            <div className="modalTextPadding">
              <textarea
                rows={countRows()}
                height="200px"
                className={
                  "modalInput pointer rounded overflow-hidden py-0 px-1 mr-n1 shadow-none w-100" +
                  descActiveClasses
                }
                style={{ resize: "none" }}
                onFocus={handleDescFocus}
                onBlur={handleDescBlur}
                onChange={handleDescChange}
                value={task ? task.description : ""}
                placeholder="פרטי המטלה"
              ></textarea>
            </div>
          </div>
          <div name="taskItems" className="my-2">
            <div className="my-2">
              <span className="d-inline-block modalIconWidth">{itemsIcon}</span>
              <h6 className="d-inline-block">משימות</h6>
              <button
                className="btn shadow-none pt-0 text-primary"
                onClick={addTask}
              >
                {plusIcon}
              </button>
            </div>
            <div className="">
              <div name="tasks">
                {task && task.items
                  ? task.items.map((item, index) => {
                      return (
                        <TaskItem
                          key={index}
                          id={item.id}
                          number={item.number}
                          title={item.title}
                          done={item.done}
                          date={item.date}
                          userId={item.userId}
                          removeItem={removeTaskItem}
                          updateItem={updateTaskItem}
                          users={props.users}
                        />
                      );
                    })
                  : ""}
              </div>
            </div>
          </div>

          <div name="patient" className="my-4">
            <div className="my-2">
              <span className="d-inline-block modalIconWidth">{labelIcon}</span>
              <h6 className="d-inline-block">לקוח</h6>
            </div>
            <div className="modalTextPadding">
              <div style={{ width: "15rem" }}>
                <Select
                  placeholder="בחר..."
                  className="basic-single "
                  value={patient}
                  isRtl={true}
                  isSearchable={true}
                  options={patients}
                  isDisabled={props.task.patientId}
                  onChange={handlePatientChange}
                />
              </div>
            </div>
          </div>

          <div name="taskGroup" className="my-2">
            <div className="my-2">
              <span className="d-inline-block modalIconWidth">{labelIcon}</span>
              <h6 className="d-inline-block">סיווג</h6>
            </div>
            <div className="modalTextPadding">
              <div className="dropdown d-inline-block">
                <button
                  className="btn dropdown-toggle p-0 shadow-none"
                  type="button"
                  data-toggle="dropdown"
                >
                  <span className="pl-2">
                    {getTaskGroupTitle() || "בחר סיווג"}
                  </span>
                </button>
                <div className="dropdown-menu dropdown-menu-right text-right">
                  {props.taskGroups.flatMap((group, index) => {
                    if (group.closedTasks) return [];
                    return [
                      <button
                        key={index}
                        className={
                          "dropdown-item " +
                          (task.group === group._id ? "bg-info text-white" : "")
                        }
                        onClick={() => changeTaskGroup(group._id)}
                      >
                        {group.title}
                      </button>,
                    ];
                  })}
                </div>
              </div>
            </div>
          </div>

          <hr />

          <div className="mb-1 mt-4 mr-2">
            <button
              className="btn btn-primary mx-2 my-1"
              onClick={handleSave}
              hidden={task.closedAt}
              disabled={
                !task ||
                !task.title ||
                (task.items.length && !task.items[task.items.length - 1].title)
              }
            >
              {task && task._id ? "שמור שינויים" : "צור מטלה"}
            </button>
            <div className="d-sm-none"></div>
            <button
              className="btn btn-outline-danger mx-2 my-1 float-left"
              // onClick={handleDelete}
              onClick={() =>
                      promptConfirmation(
                        `האם אתה בטוח שברצונך להסיר המטלה ${props.task.title}?`,
                        handleDelete
                      )
                    }
              hidden={task.closedAt || !task._id}
            >
              מחק מטלה
            </button>
            <div className="d-sm-none"></div>
            <button
              className={
                "btn mx-2 my-1 float-left " +
                (taskClosed && !task.closedAt
                  ? "btn-success"
                  : "btn-outline-success")
              }
              onClick={handleClosing}
              hidden={!task._id}
              disabled={!task || !task.title}
            >
              {task.closedAt ? "פתח מטלה " : "סיים מטלה"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
    </>
  );
}

export default TaskModal;
