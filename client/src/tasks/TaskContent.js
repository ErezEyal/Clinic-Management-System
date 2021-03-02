import { useState, useEffect } from "react";
import { Card, Container } from "react-bootstrap";
import Task from "./Task";
import "./tasks.css";

const exampleTask = (
    <Task title="כותרת משימה סגורה"
        item1="פעולה ראשונה פעולה ראשונה פעולה ראשונה"
        item2="פעולה שניה"
        item3="פעולה שלישית"
        date="18/11/2020"
        profile2={true}
        color="gray"
    />
)

function TaskContent(props) {

    return (
        <div className="modal fade" id="taskContent" tabIndex="-1">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="exampleModalLabel">Modal title</h5>
                        <button type="button" className="close ml-0" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="my-4">{exampleTask}</div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                        <button type="button" className="btn btn-primary">Save changes</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TaskContent;
