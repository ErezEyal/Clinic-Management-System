import { useState, useEffect } from "react";
import TaskColumn from "./TasksColumn";
import TaskModal from "./TaskModal";

function Tasks(props) {
  const [taskModal, setTaskModal] = useState(false);
  const [taskToOpen, setTaskToOpen] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskGroups, setTaskGroups] = useState([]);
  const [patients, setPatients] = useState([]);
  const PATIENTS_URL = process.env.REACT_APP_BASE_API_URL + "patients";
  const TASKS_URL = process.env.REACT_APP_BASE_API_URL + "tasks";
  const TASK_URL = process.env.REACT_APP_BASE_API_URL + "task";
  const TASK_GROUPS_URL = process.env.REACT_APP_BASE_API_URL + "taskgroups";
  const TASK_GROUP_URL = process.env.REACT_APP_BASE_API_URL + "taskgroup";
  const CLOSED_TASKS_URL = process.env.REACT_APP_BASE_API_URL + "closed-tasks";

  useEffect(() => {
    if (!props.user) {
      return;
    }
    //get all tasks
    props.user
      .getIdToken(true)
      .then((idToken) => {
        props
          .postRequestWithToken(TASKS_URL, idToken)
          .then((data) => {
            setTasks(data);
          })
          .catch((err) => console.log(err));
      })
      .catch(function (error) {
        console.log(error);
      });
    //get all task groups
    props.user
      .getIdToken(true)
      .then((idToken) => {
        props
          .postRequestWithToken(TASK_GROUPS_URL, idToken)
          .then((data) => {
            setTaskGroups(data);
          })
          .catch((err) => console.log(err));
      })
      .catch(function (error) {
        console.log(error);
      });
  }, [props]);

  useEffect(() => {
    if (!props.user) {
      return;
    }
    props.user
      .getIdToken(true)
      .then((idToken) => {
        props
          .postRequestWithToken(PATIENTS_URL, idToken)
          .then((data) => {
            const patients = data.map((patient) => {
              return {
                value: patient._id,
                label: `${patient.firstName} ${patient.lastName} (${patient.id})`,
              };
            });
            setPatients(patients);
          })
          .catch((err) => console.log(err));
      })
      .catch(function (error) {
        console.log(error);
      });
  }, []);

  const saveTask = (task) => {
    const data = {
      taskDetails: task,
      userName: props.user.displayName,
    };
    props.user
      .getIdToken(true)
      .then((idToken) => {
        console.log(task);
        props
          .postRequestWithToken(TASK_URL, idToken, data)
          .then((result) => {
            console.log(result);
            setTasks(result);
          })
          .catch((err) => console.log(err));
      })
      .catch((error) => console.log(error));
  };

  const deleteTask = (task) => {
    const data = {
      taskDetails: task,
    };
    props.user
      .getIdToken(true)
      .then((idToken) => {
        console.log(task);
        props
          .deleteRequestWithToken(TASK_URL, idToken, data)
          .then((result) => {
            console.log(result);
            setTasks(result);
          })
          .catch((err) => console.log(err));
      })
      .catch((error) => console.log(error));
  };

  const getGroupTasks = (group) => {
    if (group.closedTasks) {
      return tasks.filter((task) => {
        return (
          task.closedAt && (task.closedAt > group.cleanedAt || !group.cleanedAt)
        );
      });
    }
    return tasks.filter((task) => task.group === group._id && !task.closedAt);
  };

  const toggleTaskModal = (task, groupID = 1) => {
    console.log("got the following task to open: ", task);
    const newTask = task
      ? task
      : {
          title: "",
          description: "",
          items: [],
          photo: "/profile.png",
          date: Date.now(),
          group: groupID,
        };
    if (!taskModal) setTaskToOpen(newTask);
    setTaskModal(!taskModal);
  };

  const addTaskGroup = () => {
    props.user
      .getIdToken(true)
      .then((idToken) => {
        props
          .postRequestWithToken(TASK_GROUP_URL, idToken)
          .then((result) => {
            console.log(result);
            setTaskGroups(result);
          })
          .catch((err) => console.log(err));
      })
      .catch((error) => console.log(error));
  };

  const updateTaskGroupTitle = (title, id) => {
    const data = {
      groupID: id,
      groupTitle: title,
    };
    props.user
      .getIdToken(true)
      .then((idToken) => {
        props
          .putRequestWithToken(TASK_GROUP_URL, idToken, data)
          .then((result) => {
            console.log(result);
            setTaskGroups(result);
          })
          .catch((err) => console.log(err));
      })
      .catch((error) => console.log(error));
  };

  const deleteTasksGroup = (id) => {
    const data = {
      groupID: id,
    };
    props.user
      .getIdToken(true)
      .then((idToken) => {
        props
          .deleteRequestWithToken(TASK_GROUP_URL, idToken, data)
          .then((result) => {
            console.log(result);
            setTaskGroups(result);
          })
          .catch((err) => console.log(err));
      })
      .catch((error) => console.log(error));
  };

  const cleanClosedTasks = () => {
    props.user
      .getIdToken(true)
      .then((idToken) => {
        props
          .patchRequestWithToken(CLOSED_TASKS_URL, idToken)
          .then((result) => {
            console.log(result);
            setTasks(result);
          })
          .catch((err) => console.log(err));
      })
      .catch((error) => console.log(error));

    props.user
      .getIdToken(true)
      .then((idToken) => {
        props
          .postRequestWithToken(TASK_GROUPS_URL, idToken)
          .then((data) => {
            setTaskGroups(data);
          })
          .catch((err) => console.log(err));
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const downIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className="bi bi-chevron-down"
      viewBox="0 0 16 16"
    >
      <path
        fillRule="evenodd"
        d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
      />
    </svg>
  );
  const upIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className="bi bi-chevron-up"
      viewBox="0 0 16 16"
    >
      <path
        fillRule="evenodd"
        d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"
      />
    </svg>
  );

  const openTaskIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className="bi bi-clipboard"
      viewBox="0 0 16 16"
    >
      <path
        fillRule="evenodd"
        d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"
      />
      <path
        fillRule="evenodd"
        d="M9.5 1h-3a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"
      />
    </svg>
  );

  const closedTaskIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className="bi bi-check-circle"
      viewBox="0 0 16 16"
    >
      <path
        fillRule="evenodd"
        d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"
      />
      <path
        fillRule="evenodd"
        d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.236.236 0 0 1 .02-.022z"
      />
    </svg>
  );

  const inProcessIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className="bi bi-bar-chart-fill"
      viewBox="0 0 16 16"
    >
      <rect width="4" height="5" x="1" y="10" rx="1" />
      <rect width="4" height="9" x="6" y="6" rx="1" />
      <rect width="4" height="14" x="11" y="1" rx="1" />
    </svg>
  );

  const xIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className="bi bi-x-circle"
      viewBox="0 0 16 16"
    >
      <path
        fillRule="evenodd"
        d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"
      />
      <path
        fillRule="evenodd"
        d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
      />
    </svg>
  );

  return (
    <div className="text-right aaap-4 aaapx-5">
      <TaskModal
        show={taskModal}
        hide={toggleTaskModal}
        task={taskToOpen}
        saveTask={saveTask}
        deleteTask={deleteTask}
        taskGroups={taskGroups}
        users={props.users}
        currentUser={props.user}
        patients={patients}
      />
      <div className="row mx-0 mx-md-4 my-2 flex-md-nowrap">
        {taskGroups.map((group, index) => {
          return (
            <div key={index} className="mx-auto mx-sm-0">
              <TaskColumn
                title={group.title}
                tasks={getGroupTasks(group)}
                users={props.users}
                saveTitle={(newTitle) =>
                  updateTaskGroupTitle(newTitle, group._id)
                }
                showTaskModal={(task) => toggleTaskModal(task, group._id)}
                deleteGroup={() => deleteTasksGroup(group._id)}
                cleanClosedTasks={
                  group.closedTasks ? () => cleanClosedTasks() : null
                }
                currentUserId={props.user.uid}
                closedTasks={group.closedTasks}
              />
            </div>
          );
        })}
        <div className="mr-1 flex-shrink-0">
          <button
            className="btn mt-2 text-secondary shadow-none "
            onClick={addTaskGroup}
          >
            <span>+ הוסף קבוצה</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Tasks;
