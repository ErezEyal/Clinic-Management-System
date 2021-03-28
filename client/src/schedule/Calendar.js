import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import heLocale from "@fullcalendar/core/locales/he";
import CalendarEventModal from "./CalendarEventModal";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";

function Calendar(props) {
  const calendarRef = useRef();
  const CALENDAR_EVENTS_URL =
    process.env.REACT_APP_BASE_API_URL + "calendar-events";
  const CALENDAR_EVENT_URL = process.env.REACT_APP_BASE_API_URL + "event";
  const PATIENTS_URL = process.env.REACT_APP_BASE_API_URL + "patients";
  const [displayEventModal, setDisplayEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [sizeSmall, setSizeSmall] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [displayMain, setDisplayMain] = useState(true);
  const [displaySecond, setDisplaySecond] = useState(true);
  const [displayThird, setDisplayThird] = useState(true);
  const [patients, setPatients] = useState([]);
  const [listDays, setListDays] = useState(31);
  const [filter, setFilter] = useState("");
  const [delayedFilter, setDelayedFilter] = useState("");

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
          fetchInfo.start.setMonth(fetchInfo.start.getMonth() - 1)
        ),
        end: new Date(fetchInfo.end.setMonth(fetchInfo.end.getMonth() + 1)),
        mainCalendar: true,
        filter: filter,
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
    [props, displayMain, delayedFilter]
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
          fetchInfo.start.setMonth(fetchInfo.start.getMonth() - 1)
        ),
        end: new Date(fetchInfo.end.setMonth(fetchInfo.end.getMonth() + 1)),
        secondCalendar: true,
        filter: filter,
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
    [props, displaySecond, delayedFilter]
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
          fetchInfo.start.setMonth(fetchInfo.start.getMonth() - 1)
        ),
        end: new Date(fetchInfo.end.setMonth(fetchInfo.end.getMonth() + 1)),
        thirdCalendar: true,
        filter: filter,
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
    [props, displayThird, delayedFilter]
  );

  const handleEventCreation = (event, calendarName) => {
    const data = {
      event: event,
      calendarName: calendarName,
      userName: props.user.displayName,
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
      userName: props.user.displayName,
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

  const handleEventClick = useCallback((eventInfo) => {
    console.log(eventInfo.event);
    setDisplayEventModal(true);
    setSelectedEvent({
      start: eventInfo.event.startStr,
      end: eventInfo.event.endStr,
      title: eventInfo.event.title || "",
      details: eventInfo.event.extendedProps.description || "",
      calendar: eventInfo.event.extendedProps.calendarName,
      patientId: eventInfo.event.extendedProps.patientId,
      id: eventInfo.event.id,
    });
  }, []);

  const fetchEvents = () => {
    let calendarApi = calendarRef.current.getApi();
    calendarApi.refetchEvents();
  };

  const showEventModal = useCallback(() => {
    setDisplayEventModal(true);
  }, []);

  const hideEventModal = () => {
    setDisplayEventModal(false);
  };

  const calendar = useMemo(
    () => (
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
            duration: { days: listDays },
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
    ),
    [
      props.maxHeight,
      props.role,
      showEventModal,
      sizeSmall,
      listDays,
      displayMain,
      displaySecond,
      displayThird,
      delayedFilter,
    ]
  );

  useEffect(() => {
    const delayEventsFetching = setTimeout(() => {
      setDelayedFilter(filter)
    }, 1000);

    return () => clearTimeout(delayEventsFetching);
  }, [filter]);

  return (
    <>
      <div
        className={(sizeSmall ? "mt-2" : "mt-4") + " mx-auto text-right"}
        id="calendarArea"
        style={{ width: "95%", height: "85%" }}
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
          patients={patients}
          patient={props.patient}
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
          <div className="mr-auto d-inline-block mb-3">
            <div className="d-inline-block ml-3">
              <input
                type="text"
                placeholder="חפש אירועים"
                className="form-control "
                value={filter}
                style={{width: "8rem"}}
                onChange={(e) => setFilter(e.target.value)}
              ></input>
            </div>
            <select
              onChange={(e) => setListDays(parseInt(e.target.value))}
              value={listDays.toString()}
              class="custom-select d-inline-block pr-4"
              style={{ width: "7rem", paddingRight: 0 }}
            >
              <option value="7">שבוע</option>
              <option value="14">שבועיים</option>
              <option value="31">חודש</option>
              <option value="92">שלושה חודשים</option>
              <option value="365">שנה</option>
            </select>
          </div>
        </div>

        {calendar}
      </div>
    </>
  );
}

export default Calendar;
