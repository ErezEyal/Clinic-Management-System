import { FormControl, Button } from "react-bootstrap";
import "./audit.css";
import { useState, useEffect } from "react";

function Audit(props) {
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [tableContent, setTableContent] = useState([]);
  const [eventsPage, setEventsPage] = useState(0);
  const [searchFocus, setSearchFocus] = useState(false);
  const AUDIT_URL = process.env.REACT_APP_BASE_API_URL + "events";
  const [filter, setFilter] = useState("");
  const [expandedRow, setExpandedRow] = useState(-1);
  const [totalCount, setTotalCount] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const AUDIT_EXPORT_URL = process.env.REACT_APP_BASE_API_URL + "export-audit";

  const searchIcon = (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 16 16"
      className="bi bi-search"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M10.442 10.442a1 1 0 0 1 1.415 0l3.85 3.85a1 1 0 0 1-1.414 1.415l-3.85-3.85a1 1 0 0 1 0-1.415z"
      />
      <path
        fillRule="evenodd"
        d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"
      />
    </svg>
  );

  const numOfPages = () => {
    if (filteredCount % 10 === 0) return filteredCount / 10 - 1;
    else return Math.floor(filteredCount / 10);
  };

  const pagination = (
    <div>
      <div className="d-block text-center mt-3">
        <Button
          variant="link"
          className="d-inline text-decoration-none shadow-none"
          onClick={() => setEventsPage(0)}
          disabled={eventsPage === 0}
          title="First page"
        >
          <span>&#8649;</span>
        </Button>
        <Button
          variant="link"
          className="d-inline text-decoration-none shadow-none"
          onClick={() => setEventsPage(eventsPage - 1)}
          disabled={eventsPage === 0}
          title="Previous page"
        >
          <span>&#8594;</span>
        </Button>

        <Button
          variant="link"
          className="d-inline text-decoration-none shadow-none"
          title="Current page"
        >
          <span>{eventsPage + 1}</span>
        </Button>

        <Button
          variant="link"
          className="d-inline text-decoration-none shadow-none"
          onClick={() => setEventsPage(eventsPage + 1)}
          disabled={eventsPage === numOfPages()}
          title="Next page"
        >
          <span>&#8592;</span>
        </Button>
        <Button
          variant="link"
          className="d-inline text-decoration-none shadow-none"
          onClick={() => setEventsPage(numOfPages())}
          disabled={eventsPage === numOfPages()}
          title="Last page"
        >
          <span>&#8647;</span>
        </Button>
      </div>
      <div className="d-block text-center mt-2">
        <span className="text-secondary smallFont">{filteredCount} ????????????</span>
      </div>
    </div>
  );

  useEffect(() => {
    if (!props.user) {
      return;
    }

    const data = {
      page: eventsPage,
      filter: filter,
    };
    props.user
      .getIdToken(true)
      .then((idToken) => {
        props
          .postRequestWithToken(AUDIT_URL, idToken, data)
          .then((res) => {
            setFilteredEvents(res.events);
            setFilteredCount(res.filteredCount);
            setTotalCount(res.totalCount);
          })
          .catch((err) => console.log(err));
      })
      .catch(function (error) {
        console.log(error);
      });
  }, [filter, eventsPage]);

  useEffect(() => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      time: "long",
    };

    let tableRows = filteredEvents.flatMap((event, index) => {
      return (
        <tr key={index}>
          <td
            dir="ltr"
            className="pr-lg-5 firstColumnWidth position-absolute bg-white"
            style={{ right: 0 }}
          >
            {typeof event.date === "number"
              ? new Date(event.date).toLocaleString("he-IL")
              : ""}
          </td>
          <td style={{ minWidth: "14rem" }}>{event.action}</td>
          <td style={{ minWidth: "14rem" }}>{event.user}</td>
          <td style={{ whiteSpace: "pre-line", minWidth: "14rem" }}>
            <div className="d-flex">
              <div className="flex-grow-1">
                <span className="d-block">{event.details}</span>
                <span hidden={expandedRow !== index}>{event.moreDetails}</span>
              </div>
              <div hidden={!event.moreDetails} className="flex-shrink-0">
                <button
                  className="p-0 btn text-secondary fontSmall"
                  onClick={() => setExpandedRow(index)}
                  hidden={expandedRow === index}
                >
                  ??????
                </button>
                <button
                  className="p-0 btn text-secondary fontSmall"
                  onClick={() => setExpandedRow(-1)}
                  hidden={expandedRow !== index}
                >
                  ????????
                </button>
              </div>
            </div>
          </td>
        </tr>
      );
    });

    const table = [
      <thead key="1">
        <tr>
          <th
            className="firstColumnWidth position-absolute pr-lg-5 shadow-sm border bg-light"
            style={{ right: 0 }}
          >
            ??????????
          </th>
          <th className="shadow-sm border bg-light">??????????</th>
          <th className="shadow-sm border bg-light">??????????</th>
          <th className="shadow-sm border bg-light">??????????</th>
        </tr>
      </thead>,
      <tbody key="2">{tableRows}</tbody>,
    ];
    console.log(filteredEvents);
    setTableContent(table);
  }, [filteredEvents, expandedRow]);

  const handleFilterChange = (e) => {
    setEventsPage(0);
    setFilter(e.target.value);
  };

  const searchInputFocus = () => {
    setSearchFocus(!searchFocus);
  };

  const handleExport = () => {
    props.user.getIdToken(true).then((idToken) => {
      const response = fetch(AUDIT_EXPORT_URL, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: idToken }),
      })
        .then((res) => res.text())
        .then((res) => {
          let blob = new Blob([res], { type: "text/csv" });
          let a = document.createElement("a");
          a.download = "audit.csv";
          a.href = URL.createObjectURL(blob);
          a.dataset.downloadurl = ["text/csv", a.download, a.href].join(":");
          a.style.display = "none";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(function () {
            URL.revokeObjectURL(a.href);
          }, 1500);
        });
    });
  };

  return (
    <div
      className="container-fluid AuditContainer my-4 mx-md-5 text-right"
      style={{ maxWidth: "95vw" }}
    >
      <div className="text-right">
        <div className="d-inline-block">
          <h3 style={{ color: "#007A8C" }}>?????????? ????????????</h3>
          <h6 className="text-secondary mb-0">{totalCount} ????????????</h6>
        </div>
        <div className="d-inline-block float-left">
          <button className="btn btn-purple-outline" onClick={handleExport}>
            ??????????
          </button>
        </div>
        <hr />
      </div>
      <div className="text-right mb-3">
        <div
          className={
            "border d-inline-block rounded my-1 " +
            (searchFocus ? "patientSearch" : "")
          }
          style={{ backgroundColor: "#f5f8fa" }}
        >
          <FormControl
            placeholder="?????????? ??????????????"
            style={{ width: "13rem" }}
            className="d-inline-block border-0 shadow-none bg-transparent"
            value={filter}
            onChange={handleFilterChange}
            onFocus={searchInputFocus}
            onBlur={searchInputFocus}
          />
          <div className="d-inline-block px-3" style={{ color: "#007A8C" }}>
            {searchIcon}
          </div>
        </div>
      </div>
      <div className="position-relative">
        <div className="d-flex overflow-auto tableParentDiv">
          <table
            className="text-break w-100 auditTable"
            style={{
              tableLayout: "auto",
              borderSpacing: "10px",
              borderCollapse: "separate",
            }}
          >
            {tableContent}
          </table>
        </div>
      </div>
      {pagination}
    </div>
  );
}

export default Audit;
