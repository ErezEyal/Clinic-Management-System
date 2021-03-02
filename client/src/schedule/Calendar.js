import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import heLocale from "@fullcalendar/core/locales/he";
import CalendarEventModal from "./CalendarEventModal";
import { useEffect, useRef, useState, useCallback } from "react";

function Calendar(props) {
  const calendarRef = useRef();
  const CALENDAR_EVENTS_URL = "http://localhost:3000/api/calendar-events";
  const CALENDAR_EVENT_URL = "http://localhost:3000/api/event";
  const [displayEventModal, setDisplayEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [sizeSmall, setSizeSmall] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [displayMain, setDisplayMain] = useState(true);
  const [displaySecond, setDisplaySecond] = useState(true);
  const [displayThird, setDisplayThird] = useState(true);

  useEffect(() => {
    if (!displayEventModal) {
      setSelectedEvent(null);
    }
  }, [displayEventModal, selectedEvent]);

  useEffect(() => {
    if (window.innerWidth > 600 && !props.small) {
      setSizeSmall(false);
      let calendarApi = calendarRef.current.getApi();
      calendarApi.changeView("dayGridMonth");
    }
  }, []);

  const getMainCalendarEvents = useCallback(
    (fetchInfo, successCallback, failureCallback) => {
      if (!props.role) {
        successCallback([]);
        return;
      } else if (
        !displayMain ||
        (!props.role.viewCalendar && !props.role.admin)
      ) {
        successCallback([]);
        return;
      }
      const data = {
        start: new Date(
          fetchInfo.start.setMonth(fetchInfo.start.getMonth() - 2)
        ),
        end: new Date(fetchInfo.end.setMonth(fetchInfo.end.getMonth() + 2)),
        mainCalendar: true,
      };
      props.user
        .getIdToken(true)
        .then((idToken) => {
          props
            .postRequestWithToken(CALENDAR_EVENTS_URL, idToken, data)
            .then((result) => {
              console.log("success callback:", result);
              setTimeout(() => successCallback(result), 100);
            })
            .catch((err) => {
              console.log(err);
              failureCallback(err);
            });
        })
        .catch((error) => console.log(error));
    },
    [props, displayMain, displaySecond, displayThird]
  );

  const getSecondCalendarEvents = useCallback(
    (fetchInfo, successCallback, failureCallback) => {
      if (!props.role) {
        successCallback([]);
        return;
      } else if (
        !displaySecond ||
        (!props.role.viewSecondCalendar && !props.role.admin)
      ) {
        successCallback([]);
        return;
      }
      const data = {
        start: new Date(
          fetchInfo.start.setMonth(fetchInfo.start.getMonth() - 2)
        ),
        end: new Date(fetchInfo.end.setMonth(fetchInfo.end.getMonth() + 2)),
        secondCalendar: true,
      };
      props.user
        .getIdToken(true)
        .then((idToken) => {
          props
            .postRequestWithToken(CALENDAR_EVENTS_URL, idToken, data)
            .then((result) => {
              console.log("success callback:", result);
              setTimeout(() => successCallback(result), 100);
            })
            .catch((err) => {
              console.log(err);
              failureCallback(err);
            });
        })
        .catch((error) => console.log(error));
    },
    [props, displaySecond]
  );

  const getThirdCalendarEvents = useCallback(
    (fetchInfo, successCallback, failureCallback) => {
      if (!props.role) {
        successCallback([]);
        return;
      } else if (
        !displayThird ||
        (!props.role.viewThirdCalendar && !props.role.admin)
      ) {
        successCallback([]);
        return;
      }
      const data = {
        start: new Date(
          fetchInfo.start.setMonth(fetchInfo.start.getMonth() - 2)
        ),
        end: new Date(fetchInfo.end.setMonth(fetchInfo.end.getMonth() + 2)),
        thirdCalendar: true,
      };
      props.user
        .getIdToken(true)
        .then((idToken) => {
          props
            .postRequestWithToken(CALENDAR_EVENTS_URL, idToken, data)
            .then((result) => {
              console.log("success callback:", result);
              setTimeout(() => successCallback(result), 100);
            })
            .catch((err) => {
              console.log(err);
              failureCallback(err);
            });
        })
        .catch((error) => console.log(error));
    },
    [props, displayThird]
  );

  const handleEventCreation = (event, calendarName) => {
    const data = {
      event: event,
      calendarName: calendarName,
    };
    props.user
      .getIdToken(true)
      .then((idToken) => {
        props
          .postRequestWithToken(CALENDAR_EVENT_URL, idToken, data)
          .then((result) => {
            console.log(result);
            fetchEvents();
            hideEventModal();
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((error) => console.log(error));
  };

  const handleEventUpdate = (event, calendarName) => {
    const data = {
      event: event,
      calendarName: calendarName,
    };
    props.user
      .getIdToken(true)
      .then((idToken) => {
        props
          .patchRequestWithToken(CALENDAR_EVENT_URL, idToken, data)
          .then((result) => {
            console.log(result);
            fetchEvents();
            hideEventModal();
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((error) => console.log(error));
  };

  const handleEventDeletion = (eventID, calendarName) => {
    const data = {
      eventId: eventID,
      calendarName: calendarName,
    };
    props.user
      .getIdToken(true)
      .then((idToken) => {
        props
          .deleteRequestWithToken(CALENDAR_EVENT_URL, idToken, data)
          .then((result) => {
            console.log(result);
            fetchEvents();
            hideEventModal();
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((error) => console.log(error));
  };

  const handleEventClick = (eventInfo) => {
    console.log(eventInfo.event);
    setDisplayEventModal(true);
    setSelectedEvent({
      start: eventInfo.event.startStr,
      end: eventInfo.event.endStr,
      title: eventInfo.event.title || "",
      details: eventInfo.event.extendedProps.description || "",
      calendar: eventInfo.event.extendedProps.calendarName,
      id: eventInfo.event.id,
    });
  };

  const fetchEvents = () => {
    let calendarApi = calendarRef.current.getApi();
    calendarApi.refetchEvents();
  };

  const showEventModal = () => {
    setDisplayEventModal(true);
  };

  const hideEventModal = () => {
    setDisplayEventModal(false);
  };

  return (
    <>
      <div
        className={(sizeSmall ? "mt-2" : "mt-4") + " mx-auto text-right"}
        id="calendarArea"
        style={{ width: "95%" }}
        hidden={isLoading}
      >
        <CalendarEventModal
          show={displayEventModal}
          hide={hideEventModal}
          event={selectedEvent}
          createEvent={handleEventCreation}
          updateEvent={handleEventUpdate}
          deleteEvent={handleEventDeletion}
          role={props.role}
        />
        <div className="d-lg-flex mb-3">
          <span>
            <b>מציג אירועים עבור: </b>
          </span>
          <div
            className="mx-2 my-1 my-lg-0"
            hidden={
              props.role && (props.role.admin || props.role.viewCalendar)
                ? false
                : true
            }
          >
            <input
              type="checkbox"
              className="d-inline"
              checked={displayMain}
              onChange={() => setDisplayMain(!displayMain)}
            ></input>
            <span className="mr-2">יומן ראשי </span>
          </div>
          <div
            className="mx-2 my-1 my-lg-0"
            hidden={
              props.role && (props.role.admin || props.role.viewSecondCalendar)
                ? false
                : true
            }
          >
            <input
              type="checkbox"
              className="d-inline"
              checked={displaySecond}
              onChange={() => setDisplaySecond(!displaySecond)}
            ></input>
            <span className="mr-2">יומן ניתוחים </span>
          </div>
          <div
            className="mx-2 my-1 my-lg-0"
            hidden={
              props.role && (props.role.admin || props.role.viewThirdCalendar)
                ? false
                : true
            }
          >
            <input
              type="checkbox"
              className="d-inline"
              checked={displayThird}
              onChange={() => setDisplayThird(!displayThird)}
            ></input>
            <span className="mr-2">יומן שלישי </span>
          </div>
        </div>
        <FullCalendar
          plugins={[dayGridPlugin, listPlugin, timeGridPlugin]}
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            meridiem: false,
          }}
          initialView="monthList"
          locale={heLocale}
          fixedWeekCount={false}
          height={props.maxHeight}
          eventSources={[
            {
              events: getMainCalendarEvents,
            },
            {
              events: getSecondCalendarEvents,
              color: "#b74242f5",
            },
            {
              events: getThirdCalendarEvents,
              color: "#629c62",
            },
          ]}
          headerToolbar={{
            start:
              sizeSmall &&
              props.role &&
              (props.role.addCalendarEvents ||
                props.role.addSecondCalendarEvents ||
                props.role.addThirdCalendarEvents ||
                props.role.admin)
                ? "createEventButton"
                : !sizeSmall
                ? "dayGridMonth,monthList,dayGridDay"
                : "title",
            center:
              sizeSmall &&
              props.role &&
              !props.role.addCalendarEvents &&
              !props.role.addSecondCalendarEvents &&
              !props.role.addThirdCalendarEvents &&
              !props.role.admin
                ? ""
                : "title",
            end: sizeSmall
              ? "today prev,next"
              : props.role &&
                (props.role.addCalendarEvents ||
                  props.role.addSecondCalendarEvents ||
                  props.role.addThirdCalendarEvents ||
                  props.role.admin)
              ? "createEventButton today prev,next"
              : "today prev,next",
          }}
          dayMaxEvents={3}
          views={{
            dayGridDay: {
              dayMaxEvents: false,
            },
            month: {
              timeFormat: "h:mm",
            },
            monthList: {
              type: "list",
              duration: { days: 31 },
              buttonText: "לוח זמנים",
            },
          }}
          navLinks={false}
          ref={calendarRef}
          eventClick={handleEventClick}
          customButtons={{
            createEventButton: {
              text: "צור אירוע",
              click: showEventModal,
            },
          }}
          buttonText={{
            listWeek: "שבוע",
          }}
        />
      </div>
    </>
  );
}

export default Calendar;
