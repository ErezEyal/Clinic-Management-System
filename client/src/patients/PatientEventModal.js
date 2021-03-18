import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import DatePicker, { registerLocale } from "react-datepicker";
import he from "date-fns/locale/he";
registerLocale("he", he);

function PatientEventModal(props) {
  const [date, setDate] = useState(Date.now());
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [template, setTemplate] = useState(null);

  const successMessage = (
    <span className="text-success">אירוע נשמר בהצלחה</span>
  );
  const errorMessage = <span className="text-danger">שגיאה בשמירת האירוע</span>;

  useEffect(() => {
    if (props.event) {
      setDate(props.event.date);
      setTitle(props.event.title);
      setDetails(props.event.description);
      if (props.event.taskId && !props.event.template) {
        setTemplate("מטלה");
      } else {
        setTemplate(props.event.template);
      }
    } else {
      setDate(Date.now());
      setTitle("");
      setDetails("");
      setTemplate(null);
    }
  }, [props]);

  const createEvent = () => {
    if (props.event) return;
    if (!title) alert("אנא הכנס כותרת");
    else {
      const eventObject = {
        title: title,
        description: details,
        date: date,
        patientId: props.patient._id,
        userName: props.currentUserName,
        template: template,
      };
      props.createEvent(eventObject);
    }
  };

  const updateEvent = () => {
    if (!props.event) return;
    if (!title) {
      alert("אנא הכנס כותרת");
    } else {
      const eventObject = {
        title: title,
        description: details,
        date: date,
        patientId: props.patient._id,
        userName: props.currentUserName,
        _id: props.event._id,
        template: template,
      };
      props.updateEvent(eventObject);
    }
  };

  const deleteEvent = () => {
    props.deleteEvent(props.event._id);
  };

  const updateTime = (time) => {
    setDate(new Date(time).valueOf());
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

  const clockIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className="bi bi-clock"
      viewBox="0 0 16 16"
    >
      <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
      <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
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

  const updateEventDetails = (e) => {
    setTemplate(e.target.innerText);
    if (e.target.innerText === "שיחה עם לקוח") {
      if (!title) setTitle("בוצעה שיחה עם הלקוח");
      if (!details) setDetails("פרטי השיחה: ");
    } else if (e.target.innerText === "סיכום פגישה") {
      if (!title) setTitle("סיכום פגישת לקוח");
      if (!details) setDetails("פרטי הפגישה: ");
    } else if (e.target.innerText === "אחר") {
      if (!title) setTitle("");
      if (!details) setDetails("");
    } else {
      setTitle("");
      setDetails("");
    }
  };

  return (
    <Modal onHide={props.hide} show={props.show} className="text-right">
      <div
        className="modal-content pt-2 pb-4 px-3"
        style={{ backgroundColor: "#f4f5f7" }}
      >
        <div name="modalHeader" className="d-flex">
          <div className="dropdown my-3 flex-grow-1">
            <span className="d-inline-block modalIconWidth">{labelIcon}</span>
            <button
              className="btn dropdown-toggle p-0 shadow-none"
              type="button"
              data-toggle="dropdown"
              disabled={template === "פגישה" || template === "מטלה"}
            >
              <span className="px-1">{template || "בחר סוג אירוע"}</span>
            </button>
            <div className="dropdown-menu dropdown-menu-right text-right">
              {["פעולה", "שיחה עם לקוח", "סיכום פגישה", "אחר"].map(
                (event, index) => {
                  return (
                    <button
                      key={index}
                      className={"dropdown-item"}
                      onClick={(e) => updateEventDetails(e)}
                    >
                      {event}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          <div>
            <button
              className="btn button-link py-0 px-1 mr-3 shadow-none text-muted"
              onClick={props.hide}
            >
              <h4>&times;</h4>
            </button>
          </div>
        </div>
        <div name="modalBody">
          <div className="my-2">
            <span className="d-inline-block modalIconWidth">{detailsIcon}</span>
            <h6 className="d-inline-block">כותרת</h6>
          </div>
          <div className="modalTextPadding pl-3">
            <textarea
              hidden={template === "פעולה"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              rows={1}
              className="eventTitle border-top-0 border-left-0 border-right-0 bg-transparent overflow-hidden shadow-none w-100"
              style={{ fontWeight: "500", resize: "none", outline: "none" }}
              placeholder="הוסף כותרת"
              disabled={template === "פגישה" || template === "מטלה"}
            ></textarea>
            <div className="dropdown">
              <button
                className="btn dropdown-toggle p-0 shadow-none"
                type="button"
                data-toggle="dropdown"
                hidden={template !== "פעולה"}
                disabled={template === "פגישה" || template === "מטלה"}
              >
                <span className="px-1">{title || "בחר פעולה"}</span>
              </button>
              <div
                className="dropdown-menu dropdown-menu-right text-right"
                hidden={template !== "פעולה"}
              >
                {props.procedures.map((event, index) => {
                  return (
                    <button
                      key={index}
                      className={"dropdown-item"}
                      onClick={(e) => setTitle(e.target.innerText)}
                    >
                      {event}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div name="eventDescription" className="mb-4">
            <div className="mb-2 mt-4">
              <span className="d-inline-block modalIconWidth">
                {detailsIcon}
              </span>
              <h6 className="d-inline-block">תיאור האירוע</h6>
            </div>
            <div className="modalTextPadding pl-3">
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={5}
                className="outline-none rounded border-0 w-100"
                style={{ backgroundColor: "#f0f0f0", fontSize: "0.9rem" }}
                placeholder="הוסף תיאור"
                disabled={template === "פגישה" || template === "מטלה"}
              ></textarea>
            </div>
          </div>

          <div name="eventDate" className="eventDate mb-4">
            <div className="my-2 d-inline">
              <span className="d-inline-block modalIconWidth">{clockIcon}</span>
            </div>
            <div className="d-inline">
              <DatePicker
                selected={new Date(date)}
                onChange={(newDate) => updateTime(newDate)}
                locale="he"
                showTimeSelect={true}
                timeIntervals={15}
                timeFormat="HH:mm"
                timeCaption="זמן"
                disabled={template === "פגישה" || template === "מטלה"}
                dateFormat="eeee, LLLL d , k:mm"
                popperModifiers={{
                  preventOverflow: {
                    enabled: true,
                    escapeWithReference: false,
                    boundariesElement: "viewport",
                  },
                }}
                className="text-center datePicker fontSmall w-100 bg-transparent border-top-0 border-left-0 border-right-0 outline-none pointer"
              />
            </div>
          </div>

          <div
            className="mb-2 mt-3 text-center"
            hidden={props.event ? !props.event.taskId && !template : !template}
          >
            <button
              hidden={props.event}
              className="btn btn-primary text-white"
              onClick={createEvent}
            >
              צור אירוע
            </button>
            <button
              hidden={
                !props.event || template === "פגישה" || template === "מטלה"
              }
              className="btn btn-primary text-white"
              onClick={updateEvent}
            >
              עדכן אירוע
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default PatientEventModal;
