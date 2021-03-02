import { useState } from "react";
import { useHistory } from "react-router-dom";


function OpenItemsBanner(props) {
    const [closed, setClosed] = useState(false)
    const history = useHistory()
    const warningIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" width="25" fill="currentColor" className="bi bi-exclamation-triangle-fill" viewBox="0 0 16 16">
            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
        </svg>
    )

    if (!props.details || (props.details && !props.details.items)) {
        return null
    }
    return (
        <div
            className={"bg-light border border-danger py-4 px-2 px-md-4 text-right mx-3 mx-md-5 mt-4 mb-2 rounded shadow " +
                (closed ? "d-none" : "d-flex")}
        >
            <div className="ml-3">
                <span className="text-danger">{warningIcon}</span>
            </div>
            <div className="flex-grow-1 text-dark">
                <button className="btn p-0 shadow-none" onClick={() => history.push("/tasks")}>
                    <h4 style={{ color: "#502020d9" }}>
                        {props.details.items > 1 ? (props.details.items + " משימות פתוחות ") : "משימה אחת פתוחה"}
                    </h4>
                </button>
            </div>
            <div>
                <button className="btn button-link shadow-none text-danger py-0 px-0"
                    onClick={() => setClosed(true)}>
                    <h1 className="mt-n2 mb-0 pr-md-5">&times;</h1>
                </button>
            </div>
        </div>
    )
}

export default OpenItemsBanner;