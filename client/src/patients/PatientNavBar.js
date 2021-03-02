// import { useState } from 'react';
import { useEffect, useState } from 'react';
import './Patients.css';

function PatientNavBar(props) {
    const [active, setActive] = useState("timeline");

    useEffect(() => {
        props.setActiveTab(active);
    }, [active])

    useEffect(() => {
        if (props.activeTab !== active)
            setActive(props.activeTab);
    }, [props])




    return (
        <div className="text-right patientNav">
            <ul className="border-bottom p-0">
                <li className="d-inline-block d-md-none pb-0">
                    <button
                        className={"px-2 px-md-4 btn botton-link shadow-none " + (active === "info" ? "active-tab" : "")}
                        onClick={() => setActive("info")}
                    >
                        פרטי לקוח</button>
                    <span
                        className={"d-block w-100 mt-1 " + (active === "info" ? "active-tab" : "")}>
                    </span>
                </li>
                <li className="d-inline-block pb-0">
                    <button
                        className={"px-2 px-md-4 btn botton-link shadow-none " + (active === "timeline" ? "active-tab" : "")}
                        onClick={() => setActive("timeline")}
                    >
                        פעילות</button>
                    <span
                        className={"d-block w-100 mt-1 " + (active === "timeline" ? "active-tab" : "")}>
                    </span>
                </li>
                <li className={"pb-0 " + (props.role.viewDocuments || props.role.admin ? "d-inline-block" : "d-none")}>
                    <button
                        className={"px-2 px-md-4 btn botton-link shadow-none " + (active === "documents" ? "active-tab" : "")}
                        onClick={() => setActive("documents")}
                    >
                        מסמכים</button>
                    <span
                        className={"d-block w-100 mt-1 " + (active === "documents" ? "active-tab" : "")}>
                    </span>
                </li>
                <li className={"pb-0 " + (props.role.viewPhotos || props.role.admin ? "d-inline-block" : "d-none")}>
                    <button
                        className={"px-2 px-md-4 btn botton-link shadow-none " + (active === "photos" ? "active-tab" : "")}
                        onClick={() => setActive("photos")}
                    >
                        תמונות</button>
                    <span
                        className={"d-block w-100 mt-1 " + (active === "photos" ? "active-tab" : "")}>
                    </span>
                </li>
                <li className={"pb-0 " + (props.role.addCalendarEvents || props.role.admin ? "d-inline-block" : "d-none")}>
                    <button
                        className={"px-2 px-md-4 btn botton-link shadow-none " + (active === "calendar" ? "active-tab" : "")}
                        onClick={() => setActive("calendar")}
                    >
                        זימון פגישה</button>
                    <span
                        className={"d-block w-100 mt-1 " + (active === "calendar" ? "active-tab" : "")}>
                    </span>
                </li>
                <li className={"pb-0 " + (props.role.createDocs || props.role.admin ? "d-inline-block" : "d-none")}>
                    <button
                        className={"px-2 px-md-4 btn botton-link shadow-none " + (active === "templates" ? "active-tab" : "")}
                        onClick={() => setActive("templates")}
                    >
                        יצירת מסמך</button>
                    <span
                        className={"d-block w-100 mt-1 " + (active === "templates" ? "active-tab" : "")}>
                    </span>
                </li>
            </ul>
        </div>
    );
}

export default PatientNavBar;