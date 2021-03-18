import { useEffect, useState } from "react";
import TimelineEvent from "./TimelineEvent";
import PatientEventModal from "./PatientEventModal";

function Timeline(props) {
  const [displayEventModal, setDisplayEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [meetingSummaryFilter, setMeetingSummaryFilter] = useState(true);
  const [patientCallFilter, setPatientCallFilter] = useState(true);
  const [procedureFilter, setProcedureFilter] = useState(true);
  const [meetingScheduleFilter, setMeetingScheduleFilter] = useState(true);
  const [otherFilter, setOtherFilter] = useState(true);
  const [taskFilter, setTaskFilter] = useState(true);
  const [displayFilters, setDisplayFilters] = useState(false);
  const PATIENT_EVENT_URL =
    process.env.REACT_APP_BASE_API_URL + "patient-event";

  useEffect(() => {
    if (!displayEventModal) {
      setSelectedEvent(null);
    }
  }, [displayEventModal, selectedEvent]);

  const showEventModal = () => {
    setDisplayEventModal(true);
  };

  const hideEventModal = () => {
    setDisplayEventModal(false);
  };

  const handleEventCreation = (event) => {
    const data = {
      event: event,
    };
    props.user
      .getIdToken(true)
      .then((idToken) => {
        props
          .postRequestWithToken(PATIENT_EVENT_URL, idToken, data)
          .then((result) => {
            console.log(result);
            props.fetchTimeline();
            hideEventModal();
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((error) => console.log(error));
  };

  const handleEventUpdate = (event) => {
    const data = {
      event: event,
    };
    props.user
      .getIdToken(true)
      .then((idToken) => {
        props
          .patchRequestWithToken(PATIENT_EVENT_URL, idToken, data)
          .then((result) => {
            console.log(result);
            props.fetchTimeline();
            hideEventModal();
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((error) => console.log(error));
  };

  const handleEventDeletion = (id) => {
    const data = {
      eventId: id,
    };
    props.user
      .getIdToken(true)
      .then((idToken) => {
        props
          .deleteRequestWithToken(PATIENT_EVENT_URL, idToken, data)
          .then((result) => {
            console.log(result);
            props.fetchTimeline();
            hideEventModal();
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((error) => console.log(error));
  };

  const editEvent = (event) => {
    setSelectedEvent(event);
    showEventModal();
  };

  const timeline = (filter = null) => {
    let days = [];
    for (const day of props.timeline) {
      const dayString = Object.keys(day)[0];
      // const daySpanTag = <span className="text-info">{dayString}</span>
      const events = day[dayString].flatMap((event, index) => {
        // console.log("event", event);
        if (event.template === "שיחה עם לקוח" && !patientCallFilter) {
          return [];
        } else if (event.template === "סיכום פגישה" && !meetingSummaryFilter) {
          return [];
        } else if (event.template === "פעולה" && !procedureFilter) {
          return [];
        } else if (event.template === "פגישה" && !meetingScheduleFilter) {
          return [];
        } else if (event.template === "מטלה" && !taskFilter) {
          return [];
        } else if (
          (event.template === "אחר" || !event.template) &&
          !otherFilter
        ) {
          return [];
        } else
          return [
            <TimelineEvent
              key={index}
              details={event}
              deleteEvent={handleEventDeletion}
              editEvent={editEvent}
            />,
          ];
      });
      if (events.length) {
        days.push(
          <div className="mb-4 mt-1">
            <span className="text-info">{dayString}</span>
            {events}
          </div>
        );
      }
    }
    return days;
  };

  return (
    <div>
      <PatientEventModal
        show={displayEventModal}
        hide={hideEventModal}
        event={selectedEvent}
        patient={props.patient}
        procedures={props.procedures}
        currentUserName={props.user.displayName}
        createEvent={handleEventCreation}
        updateEvent={handleEventUpdate}
        deleteEvent={handleEventDeletion}
      />
      <div className="d-flex mt-2 mb-4">
        <div name="filter" className="flex-grow-1 text-muted d-lg-flex">
          <div className="mb-3 mb-md-0 ">
            <span>
              <button
                className="btn text-muted btn-light border py-0 ml-2"
                onClick={() => setDisplayFilters(!displayFilters)}
              >
                <b>סינון</b>
              </button>
            </span>
          </div>
          <div className="mx-2 my-1 my-lg-0" hidden={!displayFilters}>
            <input
              type="checkbox"
              checked={meetingSummaryFilter}
              onChange={() => setMeetingSummaryFilter(!meetingSummaryFilter)}
            ></input>
            <span className="mr-2">סיכום פגישה </span>
          </div>
          <div className="mx-2 my-1 my-lg-0" hidden={!displayFilters}>
            <input
              type="checkbox"
              checked={procedureFilter}
              onChange={() => setProcedureFilter(!procedureFilter)}
            ></input>
            <span className="mr-2">פעולות </span>
          </div>
          <div className="mx-2 my-1 my-lg-0" hidden={!displayFilters}>
            <input
              type="checkbox"
              checked={patientCallFilter}
              onChange={() => setPatientCallFilter(!patientCallFilter)}
            ></input>
            <span className="mr-2">שיחה עם לקוח </span>
          </div>
          <div className="mx-2 my-1 my-lg-0" hidden={!displayFilters}>
            <input
              type="checkbox"
              checked={meetingScheduleFilter}
              onChange={() => setMeetingScheduleFilter(!meetingScheduleFilter)}
            ></input>
            <span className="mr-2">פגישה </span>
          </div>
          <div className="mx-2 my-1 my-lg-0" hidden={!displayFilters}>
            <input
              type="checkbox"
              checked={taskFilter}
              onChange={() => setTaskFilter(!taskFilter)}
            ></input>
            <span className="mr-2">מטלה </span>
          </div>
          <div className="mx-2 my-1 my-lg-0" hidden={!displayFilters}>
            <input
              type="checkbox"
              checked={otherFilter}
              onChange={() => setOtherFilter(!otherFilter)}
            ></input>
            <span className="mr-2">אחר </span>
          </div>
        </div>
        <div className="flex-shrink-0">
          <button className="btn btn-outline-info py-0 px-2 ml-2" onClick={showEventModal}>
            הוסף 
          </button>
        </div>
      </div>
      {timeline()}
    </div>
  );
}

export default Timeline;
