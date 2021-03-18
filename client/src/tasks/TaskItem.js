import { useState, useEffect, useRef } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "./tasks.css";
import "react-datepicker/dist/react-datepicker.css";
import he from 'date-fns/locale/he';

registerLocale('he', he);


function TaskItem(props) {
    const [hover, setHover] = useState(false);
    const [backround, setBackground] = useState("");
    const [active, setActive] = useState(false);
    const [inputFocusClasses, setInputClasses] = useState(" bg-transparent border-0 ")
    const [itemBackground, setItemBackground] = useState(" darkerGray")
    const inputRef = useRef();

    const clockIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-clock ml-1" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm8-7A8 8 0 1 1 0 8a8 8 0 0 1 16 0z" />
            <path fillRule="evenodd" d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z" />
        </svg>
    )

    const xIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-circle-fill" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z" />
        </svg>
    )

    useEffect(() => {
        if (hover) {
            setBackground(" bg-gray ");
        }
        else {
            setBackground("");
        }
    }, [hover]);

    useEffect(() => {
        if (active) {
            inputRef.current.focus();
            setInputClasses("");
        }
        else {
            setInputClasses(" bg-transparent border-0 ");
        }
    }, [active])

    useEffect(() => {
        const today = new Date().setHours(0, 0, 0, 0);
        if (props.done) {
            setItemBackground(" bg-green ");
        }
        else if (today > props.date) {
            setItemBackground(" bg-red ");
        }
        else {
            setItemBackground(" darkerGray ");
        }
    }, [props])

    // useEffect

    const handleCheck = (e) => {
        const itemObject = {
            title: props.title,
            done: e.target.checked,
            number: props.number,
            date: props.date,
            userId: props.userId,
            id: props.id
        }
        props.updateItem(itemObject);
    }

    const handleInputFocus = (e) => {
        setActive(true);
    }

    const handleInputBlur = (e) => {
        setActive(false);
    }

    const handleTitleChange = (e) => {
        const itemObject = {
            title: e.target.value,
            done: props.done,
            number: props.number,
            date: props.date,
            userId: props.userId,
            id: props.id
        }
        props.updateItem(itemObject);
        e.target.style.cssText = e.target.style.cssText + ' height:' + (e.target.scrollHeight) + 'px';
    }

    const handleDateChange = (newDate) => {
        const itemObject = {
            title: props.title,
            done: props.done,
            number: props.number,
            date: Date.parse(newDate),
            userId: props.userId,
            id: props.id
        }
        props.updateItem(itemObject);
    }

    const handleUserChange = (newUser) => {
        const itemObject = {
            title: props.title,
            done: props.done,
            number: props.number,
            date: props.date,
            userId: newUser.uid,
            id: props.id
        }
        props.updateItem(itemObject);
    }

    const getUserName = () => {
        for (const user of props.users) {
            if (user.uid === props.userId) {
                return user.name;
            }
        }
    }

    const getUserPhoto = () => {
        for (const user of props.users) {
            if (user.uid === props.userId) {
                return user.photo;
            }
        }
    }

    

    return (
        <div className={"d-flex rounded px-1 py-2 mr-n1 border-bottom " + backround}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <div>
                <input
                    id={props.number}
                    className="ml-3 pointer"
                    type="checkbox"
                    onChange={handleCheck}
                    checked={props.done}
                />
            </div>
            <div className="flex-grow-1">
                <textarea
                    rows={1}
                    value={props.title}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    onChange={handleTitleChange}
                    ref={inputRef}
                    className={"modalInput rounded overflow-hidden py-0 w-100 pointer my-0" + inputFocusClasses + (props.done ? " strike text-muted " : "")}
                    style={{ resize: "none" }}
                    placeholder="משימה לדוגמה"

                />
            </div>
            <div className={"pr-1 rounded align-self-start mx-1 mx-lg-3 flex-shrink-0 " + itemBackground}>
                <span className="d-none d-md-inline">{clockIcon}</span>
                <DatePicker
                    selected={new Date(props.date)}
                    onChange={newDate => handleDateChange(newDate)}
                    locale="he"
                    className="mr-n1 text-center bg-transparent outline-none pointer fontSmall w-100 py-1 w-inline border-0 rounded flex-shrink-1"
                />
            </div>
            <div className="dropdown ml-lg-2 flex-shrink-0">
                <a href="#" data-toggle="dropdown" className="text-decoration-none">
                    <img
                        className="pointer mx-1 rounded-circle"
                        src={getUserPhoto() ? getUserPhoto() : "/unknownBig.png"}
                        width="25"
                        height="25"
                        title={getUserName()}
                        alt="user"
                    ></img>
                </a>
                <div className="dropdown-menu dropdown-menu-right text-right">
                    {
                        props.users.map((user, index) => {
                            return (
                                <a
                                    key={index}
                                    href="#"
                                    className="dropdown-item"
                                    onClick={() => handleUserChange(user)}
                                >
                                    <img
                                        src={user.photo || "/unknownBig.png"}
                                        width="25"
                                        height="25"
                                        className="rounded-circle"
                                        alt="user"
                                    ></img>
                                    <span className="mr-2">{user.name}</span>
                                </a>
                            )
                        })
                    }
                </div>
            </div>
            <div className="mx-2">
                <button
                    className="btn shadow-none p-0 mt-n1 text-darkerGray"
                    onClick={() => props.removeItem(props.number)}
                >
                    {xIcon}
                </button>
            </div>
        </div>
    )
}

export default TaskItem;
