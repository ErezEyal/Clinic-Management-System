import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import DatePicker, { registerLocale } from "react-datepicker";
import he from "date-fns/locale/he";
import Select from "react-select";

registerLocale("he", he);

function CalendarEventModal(props) {
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(null);
  const [fullDay, setFullDay] = useState(false);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [calendar, setCalendar] = useState("");
  const [eventId, setEventId] = useState(null);
  const [patient, setPatient] = useState("");
  const [patientEvent, setPatientEvent] = useState(false);

  const successMessage = (
    <span className="text-success">אירוע נשמר בהצלחה</span>
  );
  const errorMessage = <span className="text-danger">שגיאה בשמירת האירוע</span>;

  const calendars = [
    { name: "main", displayName: "יומן ראשי" },
    { name: "second", displayName: "יומן ניתוחים" },
    { name: "third", displayName: "יומן שלישי" },
  ];

  useEffect(() => {
    if (props.event) {
      console.log(props.event);
      setStartTime(new Date(props.event.start));
      if (!props.event.start.includes("T")) {
        const endDate = new Date(props.event.end).getDate() - 1;
        const endEpoch = new Date(props.event.end).setDate(endDate);
        setEndTime(new Date(endEpoch));
      } else {
        setEndTime(new Date(props.event.end));
      }
      setFullDay(!props.event.start.includes("T"));
      setTitle(props.event.title);
      setDetails(props.event.details);
      setCalendar({
        name: props.event.calendar,
        displayName:
          props.event.calendar === "main"
            ? "יומן ראשי"
            : props.event.calendar === "second"
            ? "יומן ניתוחים"
            : props.event.calendar === "third"
            ? "יומן שלישי"
            : "",
      });
      setEventId(props.event.id);
      const patientObject = props.patients.find(
        (patient) => patient.value === props.event.patientId
      );
      setPatient(
        (!props.event && props.patient) ||
          patientObject ||
          (props.event &&
            props.event.patientId &&
            !patientObject && {
              label: props.event.patientId,
              value: props.event.patientId,
            }) ||
          undefined
      );
      setPatientEvent(
        (!props.event && props.patient) || props.event.patientId ? true : false
      );
    } else {
      setStartTime(new Date());
      setEndTime(null);
      setFullDay(false);
      setTitle("");
      setDetails("");
      setCalendar("");
      setEventId(null);
      setPatient(props.patient || props.patients[0] || "");
      setPatientEvent(props.patient);
    }
  }, [props]);

  useEffect(() => {
    if (endTime === null) {
      const currentHour = startTime.getHours();
      startTime.setHours(currentHour + 1);
      startTime.setMinutes(0);
      const end = new Date(startTime).setHours(
        new Date(startTime).getHours() + 1
      );
      setEndTime(new Date(end));
    }
  }, [startTime, endTime]);

  const createEvent = () => {
    if (
      fullDay &&
      new Date(startTime).setHours(0, 0, 0, 0) >
        new Date(endTime).setHours(0, 0, 0, 0)
    )
      alert("מועד סיום האירוע שגוי");
    else if (!title) alert("אנא הכנס כותרת");
    else if (!calendar) alert("אנא בחר יומן");
    else if (!fullDay && startTime >= endTime)
      alert("מועד סיום צריך להיות אחרי מועד ההתחלה");
    else {
      const patientId = patient && patient.value && patientEvent ? patient.value : "";
      const eventObject = {
        summary: title,
        start: {},
        end: {
          timeZone: "UTC",
        },
        description: details,
        extendedProperties: {
          private: {
            patientId: patientId,
          },
        },
      };
      if (fullDay) {
        const endDate = new Date(endTime).setDate(endTime.getDate() + 1);
        eventObject.start.date = new Date(startTime)
          .toISOString()
          .substring(0, 10);
        eventObject.end.date = new Date(endDate).toISOString().substring(0, 10);
      } else {
        eventObject.start.dateTime = new Date(startTime).toISOString();
        eventObject.end.dateTime = new Date(endTime).toISOString();
      }
      props.createEvent(eventObject, calendar.name);
    }
  };

  const updateEvent = () => {
    if (!eventId) return;
    if (
      fullDay &&
      new Date(startTime).setHours(0, 0, 0, 0) >
        new Date(endTime).setHours(0, 0, 0, 0)
    )
      alert("מועד סיום האירוע שגוי");
    else if (!title) alert("אנא הכנס כותרת");
    else if (!calendar) alert("אנא בחר יומן");
    else if (!fullDay && startTime >= endTime)
      alert("מועד סיום צריך להיות אחרי מועד ההתחלה");
    else {
      const patientId = patient && patient.value && patientEvent ? patient.value : "";
      const eventObject = {
        summary: title,
        start: {
          date: null,
          dateTime: null,
        },
        end: {
          date: null,
          dateTime: null,
          timeZone: "UTC",
        },
        description: details,
        extendedProperties: {
          private: {
            patientId: patientId,
          },
        },
        id: eventId,
      };
      if (fullDay) {
        const endDate = new Date(endTime).setDate(endTime.getDate() + 1);
        eventObject.start.date = new Date(startTime)
          .toISOString()
          .substring(0, 10);
        eventObject.end.date = new Date(endDate).toISOString().substring(0, 10);
      } else {
        eventObject.start.dateTime = new Date(startTime).toISOString();
        eventObject.end.dateTime = new Date(endTime).toISOString();
      }
      props.updateEvent(eventObject, calendar.name);
    }
  };

  const deleteEvent = () => {
    props.deleteEvent(eventId, calendar.name);
  };

  const toggleFullDay = () => {
    if (fullDay) {
      setFullDay(false);
    } else {
      if (
        new Date(endTime).setHours(0, 0, 0, 0) <
        new Date(startTime).setHours(0, 0, 0, 0)
      ) {
        endTime.setDate(startTime.getDate());
      }
      setFullDay(true);
    }
  };

  const updateStartTime = (time) => {
    setStartTime(time);
    if (endTime < time) {
      const end = new Date(time).setHours(time.getHours() + 1);
      setEndTime(new Date(end));
    }
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

  const handlePatientChange = (e) => {
    setPatient({
      label: e.label,
      value: e.value,
    });
  };

  return (
    <Modal onHide={props.hide} show={props.show} className="text-right">
      <div
        className="modal-content pt-2 pb-4 px-3"
        style={{ backgroundColor: "#f4f5f7" }}
      >
        <div name="modalHeader" className="d-flex">
          <div className="flex-grow-1">
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              rows={1}
              className="mt-4 eventTitle border-top-0 border-left-0 border-right-0 bg-transparent overflow-hidden m-2 shadow-none w-100"
              style={{ fontWeight: "500", resize: "none", outline: "none" }}
              placeholder="הוסף כותרת"
            ></textarea>
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
          <div name="eventDate" className="eventDate mb-4">
            <div className="my-2">
              <span className="d-inline-block modalIconWidth">{clockIcon}</span>
              <h6 className="d-inline-block">זמן</h6>
            </div>
            <div className="mr-md-4 d-block d-md-flex">
              <div>
                <DatePicker
                  selected={new Date(startTime)}
                  onChange={(newDate) => updateStartTime(newDate)}
                  locale="he"
                  showTimeSelect={!fullDay}
                  timeIntervals={15}
                  timeFormat="HH:mm"
                  timeCaption="זמן"
                  dateFormat={!fullDay ? "eeee, LLLL d , k:mm" : "eeee, LLLL d"}
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
              <div className="my-2 my-md-0">
                <span className="mx-2 fontSmall">עד</span>
              </div>
              <div>
                <DatePicker
                  selected={new Date(endTime)}
                  onChange={(newDate) => setEndTime(newDate)}
                  locale="he"
                  showTimeSelect={!fullDay}
                  timeIntervals={15}
                  timeFormat="HH:mm"
                  timeCaption="זמן"
                  dateFormat={!fullDay ? "eeee, LLLL d , k:mm" : "eeee, LLLL d"}
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
            <input
              id="fullDay"
              type="checkbox"
              className="mr-md-4 ml-2 mt-3 pointer"
              onChange={toggleFullDay}
              checked={fullDay}
            ></input>
            <label htmlFor="fullDay">
              <small>יום מלא</small>
            </label>
          </div>
          <div name="eventDescription" className="mb-4">
            <div className="my-2">
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
              ></textarea>
            </div>
          </div>

          <div name="patient" className="my-4">
            <div className="my-2">
              <span className="d-inline-block modalIconWidth">{labelIcon}</span>
              <h6 className="d-inline-block">לקוח</h6>
              <div class="custom-control custom-switch d-inline mr-2">
                <input
                  type="checkbox"
                  class="custom-control-input shadow-none"
                  id="patientSwitch"
                  checked={patientEvent}
                  disabled={
                    (!props.event && props.patient) ||
                    (props.event && props.event.patientId)
                  }
                  onChange={() => setPatientEvent(!patientEvent)}
                />
                <label class="custom-control-label" for="patientSwitch"></label>
              </div>
            </div>
            <div className="modalTextPadding" hidden={!patientEvent}>
              <div style={{ width: "17rem" }}>
                <Select
                  placeholder="בחר..."
                  className="basic-single "
                  value={patient || null}
                  isRtl={true}
                  isSearchable={true}
                  isDisabled={
                    (!props.event && props.patient) ||
                    (props.event && props.event.patientId)
                  }
                  options={props.patients}
                  onChange={handlePatientChange}
                />
              </div>
            </div>
          </div>

          <div name="calendarID" className="my-2">
            <div className="my-2">
              <span className="d-inline-block modalIconWidth">{labelIcon}</span>
              <h6 className="d-inline-block">יומן</h6>
            </div>
            <div className="modalTextPadding">
              <div className="dropdown d-inline-block">
                <button
                  className="btn dropdown-toggle p-0 shadow-none"
                  type="button"
                  data-toggle="dropdown"
                  disabled={props.event}
                >
                  <span className="pl-2">
                    {calendar.displayName || "בחר יומן"}
                  </span>
                </button>
                <div className="dropdown-menu dropdown-menu-right text-right">
                  {props.role &&
                    calendars.flatMap((cal, index) => {
                      if (
                        (cal.name === "main" &&
                          !props.role.addCalendarEvents && !props.role.admin) ||
                        (cal.name === "second" &&
                          !props.role.addSecondCalendarEvents && !props.role.admin) ||
                        (cal.name === "third" &&
                          !props.role.addThirdCalendarEvents && !props.role.admin)
                      ) {
                        return [];
                      }
                      return [
                        <button
                          key={index}
                          className={"dropdown-item"}
                          onClick={(e) => setCalendar(cal)}
                        >
                          {cal.displayName}
                        </button>,
                      ];
                    })}
                </div>
              </div>
            </div>
          </div>

          <div
            className="mb-2 mt-3 text-center"
            hidden={
              !props.role ||
              (props.event &&
                !props.role.addCalendarEvents &&
                props.event.calendar === "main") ||
              (props.event &&
                !props.role.addSecondCalendarEvents &&
                props.event.calendar === "second") ||
              (props.event &&
                !props.role.addThirdCalendarEvents &&
                props.event.calendar === "third")
            }
          >
            <button
              hidden={eventId}
              className="btn btn-primary text-white"
              onClick={createEvent}
            >
              צור אירוע
            </button>
            <button
              hidden={!eventId}
              className="btn btn-primary text-white"
              onClick={updateEvent}
            >
              עדכן אירוע
            </button>
            <button
              hidden={!eventId}
              className="mr-3 btn btn-outline-danger"
              onClick={deleteEvent}
            >
              מחק אירוע
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default CalendarEventModal;
