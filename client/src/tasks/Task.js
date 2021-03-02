import { useState, useEffect } from "react";
import { Card, Container } from "react-bootstrap";
import "./tasks.css";

function Task(props) {
  const [isHovered, setHover] = useState(false);
  const [minimizeDetails, setMinimizeDetails] = useState(false);
  const colors = {
    red: "border-danger",
    blue: "border-primary",
    green: "border-success",
    black: "border-dark",
    gray: "text-secondary",
    default: "border-primary",
  };

  const xIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className="bi bi-x"
      viewBox="0 0 16 16"
    >
      <path
        fillRule="evenodd"
        d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
      />
    </svg>
  );

  const upIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
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

  const downIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
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

  const clockIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className="bi bi-clock-fill"
      viewBox="0 0 16 16"
    >
      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
    </svg>
  );

  const checkIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className="bi bi-check2-circle"
      viewBox="0 0 16 16"
    >
      <path d="M2.5 8a5.5 5.5 0 0 1 8.25-4.764.5.5 0 0 0 .5-.866A6.5 6.5 0 1 0 14.5 8a.5.5 0 0 0-1 0 5.5 5.5 0 1 1-11 0z" />
      <path d="M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l7-7z" />
    </svg>
  );
  const dateString = (epoch) => {
    const date = new Date(epoch);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const assignedUserIds = () => {
    const taskItems = props.details.items;
    const userIds = [];
    for (const item of taskItems) {
      if (!userIds.includes(item.userId)) {
        userIds.push(item.userId);
      }
    }
    return userIds;
  };

  const taskUsersPhotos = () => {
    const userIds = assignedUserIds().slice(0, 4);
    const userPhotos = props.users.flatMap((user, index) => {
      if (userIds.includes(user.uid)) {
        return [
          {
            name: user.name,
            photo: user.photo ? user.photo : "unknownBig.png",
          },
        ];
      } else {
        return [];
      }
    });
    if (assignedUserIds().length > 4) {
      userPhotos.push({ name: "אחר", photo: "/dots.png" });
    }
    return userPhotos;
  };

  const bgColor = () => {
    const taskItems = props.details.items;
    let allDone = true;
    let delay = false;
    if (!taskItems.length) {
      allDone = false;
    }
    for (const item of taskItems) {
      if (!item.done) {
        allDone = false;
      }
      if (!item.done && new Date(Date.now()).setHours(0, 0, 0) > item.date) {
        delay = true;
      }
    }
    if (allDone) {
      return "#33d06a30";
    } else if (delay) {
      return "#ff000030";
    } else {
      return "white";
    }
  };

  const pendingUserAction = () => {
    if (props.details.closedAt) return false;
    const taskItems = props.details.items;
    let pendingAction = false;
    for (const item of taskItems) {
      if (!item.done && item.userId == props.currentUserId) {
        return true;
      }
    }
    return false;
  };

  const isLate = () => {
    const taskItems = props.details.items;
    let delay = false;
    for (const item of taskItems) {
      if (!item.done && new Date(Date.now()).setHours(0, 0, 0) > item.date) {
        delay = true;
      }
    }
    if (delay) {
      return true;
    } else {
      return false;
    }
  };

  const isDone = () => {
    const taskItems = props.details.items;
    if (!taskItems.length) return false;
    for (const item of taskItems) {
      if (!item.done) {
        return false;
      }
    }
    return true;
  };

  const nextDueDate = (dueDate) => {
      if (!dueDate) return "";
    if (new Date(Date.now()).setHours(0, 0, 0, 0) > dueDate) {
        return ""
    }
    else {
        const timeLeft = dueDate - new Date(Date.now()).setHours(23, 59, 59, 0); 
        const days = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
        console.log("נותרו " + days + " ימים")
        return "נותרו " + days + " ימים"
    }
  };

  return (
    <div
      className={
        "d-flex flex-column pointer h-100 pb-2 px-2 rounded-lg mb-3 " +
        (isHovered ? "shadow-lg " : "shadow ") +
        (!props.details.closedAt ? "bg-light " : "bg-darkerGray ")
      }
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => props.showTaskModal(props.details)}
      style={{
        border: pendingUserAction() ? "1px solid blue" : "1px solid lightGray",
      }}
    >
      <div name="taskCardHeader" className="py-1"></div>
      <div name="taskCardBody">
        <div>
          <div className="d-flex">
            <div className="flex-grow-1">
              <p>{props.details.title}</p>
            </div>
            <div hidden={!isLate()} className="flex-shrink-0 pr-1">
              <span className="text-white bg-lightRed fontSmall rounded py-1">
                <span className="mx-1">{clockIcon}</span>
                <span className="mr-1 ml-2">באיחור</span>
              </span>
            </div>
            <div hidden={!isDone()} className="flex-shrink-0 pr-1">
              <span className="text-white bg-lightGreen fontSmall rounded py-1">
                <span className="mx-1">{checkIcon}</span>
                <span className="mr-1 ml-2">בוצע</span>
              </span>
            </div>
          </div>
          <p
            className="text-muted text-break"
            style={{ whiteSpace: "pre-wrap" }}
          >
            {props.details.description.length < 70
              ? props.details.description
              : props.details.description.substring(0, 70) + "..."}
          </p>
        </div>
      </div>
      <div></div>
      <div className="mt-auto position-relative px-2">
        {taskUsersPhotos().map((photo, index) => {
          return (
            <img
              key={index}
              className="ml-2 rounded-circle"
              src={photo.photo}
              width="30"
              title={photo.name}
            ></img>
          );
        })}
        <span
          className="position-absolute float-left text-muted fontSmall"
          style={{ bottom: 0, left: 0 }}
        >
          {nextDueDate(props.details.dueDate)}
        </span>
      </div>
    </div>
  );
}

export default Task;
