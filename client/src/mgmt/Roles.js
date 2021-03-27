import { useState, useEffect } from "react";
import { FormControl, Button } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import ConfirmationModal from "../root/ConfirmationModal";
import NewRoleModal from "./NewRoleModal";

function Roles(props) {
  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [tableContent, setTableContent] = useState([]);
  const [rolesPage, setRolesPage] = useState(0);
  const [searchFocus, setSearchFocus] = useState(false);
  const [filter, setFilter] = useState("");
  const [editRole, setEditRole] = useState(-1);
  const [confirmationText, setConfirmationText] = useState("");
  const [confirmationAction, setConfirmationAction] = useState("");
  const [showNewRoleModal, setShowNewRoleModal] = useState(false);
  const ROLES_URL = process.env.REACT_APP_BASE_API_URL + "roles";
  const ROLE_URL = process.env.REACT_APP_BASE_API_URL + "role";

  const permissions = [
    "manageUsers",
    "viewLogs",
    "updateCustomer",
    "deleteCustomer",
    "addCustomer",
    "viewCalendar",
    "viewSecondCalendar",
    "viewThirdCalendar",
    "addCalendarEvents",
    "addSecondCalendarEvents",
    "addThirdCalendarEvents",
    "viewDocuments",
    "viewPhotos",
    "createDocs",
    "createImportantDocs",
    "editProcedures",
    "editPatientCategories",
  ];

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

  const removeIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="#dc3545d6"
      className="bi bi-x-circle-fill"
      viewBox="0 0 16 16"
    >
      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z" />
    </svg>
  );

  const numOfPages = () => {
    if (filteredRoles.length % 10 === 0) return filteredRoles.length / 10 - 1;
    else return Math.floor(filteredRoles.length / 10);
  };

  const pagination = (
    <div>
      <div className="d-block text-center mt-3">
        <Button
          variant="link"
          className="d-inline text-decoration-none shadow-none"
          onClick={() => setRolesPage(0)}
          disabled={rolesPage === 0}
          title="First page"
        >
          <span>&#8649;</span>
        </Button>
        <Button
          variant="link"
          className="d-inline text-decoration-none shadow-none"
          onClick={() => setRolesPage(rolesPage - 1)}
          disabled={rolesPage === 0}
          title="Previous page"
        >
          <span>&#8594;</span>
        </Button>

        <Button
          variant="link"
          className="d-inline text-decoration-none shadow-none"
          title="Current page"
        >
          <span>{rolesPage + 1}</span>
        </Button>

        <Button
          variant="link"
          className="d-inline text-decoration-none shadow-none"
          onClick={() => setRolesPage(rolesPage + 1)}
          disabled={rolesPage === numOfPages()}
          title="Next page"
        >
          <span>&#8592;</span>
        </Button>
        <Button
          variant="link"
          className="d-inline text-decoration-none shadow-none"
          onClick={() => setRolesPage(numOfPages())}
          disabled={rolesPage === numOfPages()}
          title="Last page"
        >
          <span>&#8647;</span>
        </Button>
      </div>
      <div className="d-block text-center mt-2">
        <span className="text-secondary smallFont">
          {filteredRoles.length} תפקידים
        </span>
      </div>
    </div>
  );

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = () => {
    if (!props.user) {
      return;
    }
    props.user
      .getIdToken(true)
      .then((idToken) => {
        props
          .postRequestWithToken(ROLES_URL, idToken)
          .then((roles) => {
            setRoles(roles);
            setFilteredRoles(roles);
            setEditRole(-1);
          })
          .catch((err) => console.log(err));
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const getRoleNameInputTag = (role) => {
    return (
      <input
        key={Date.now()}
        defaultValue={role.name}
        className="border-0 outline-none"
        onBlur={(e) => handleRoleNameChange(e, role)}
        style={{ color: "#007A8C" }}
        readOnly={role.admin}
      ></input>
    );
  };

  useEffect(() => {
    let tableRows = filteredRoles.map((role, index) => {
      return (
        <tr key={index} className="rolesTableRow border" style={{ color: "#007A8C" }}>
          <td
            className="pr-lg-4 firstColumnWidth position-absolute bg-white overflow-hidden"
            style={{ right: "0px" }}
          >
            <span className="noselect">{role.name}</span>
          </td>
          {permissions.map((permission) => {
            return (
              <td key={index + permission}>
                <div className="custom-control custom-switch text-center">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id={index + permission}
                    checked={role[permission] || role.admin ? true : false}
                    onChange={() => handlePermissionChange(role, permission)}
                    disabled={role.admin ? true : false}
                  />
                  <label
                    className="custom-control-label"
                    htmlFor={index + permission}
                  ></label>
                </div>
              </td>
            );
          })}
          <td>
            <div className="text-center">
              <button
                disabled={props.role && props.role.name === role.name}
                className={
                  "btn p-0 shadow-none pointer mx-2 " +
                  (role.admin ? "d-none" : "d-inline")
                }
                onClick={() =>
                  promptConfirmation(
                    `האם אתה בטוח שברצונך למחוק את התפקיד ${role.name}?`,
                    () => handleRoleRemoval(role)
                  )
                }
                // data-toggle="dropdown"
              >
                <span>{removeIcon}</span>
              </button>
              <div className="dropdown-menu" style={{ minWidth: "0" }}>
                <button
                  className="dropdown-item text-center"
                  onClick={() => handleRoleRemoval(role)}
                >
                  הסר
                </button>
              </div>
            </div>
          </td>
        </tr>
      );
    });
    tableRows = tableRows.slice(rolesPage * 10, rolesPage * 10 + 10);
    const table = [
      <thead key="1">
        <tr style={{ backgroundColor: "#F5F8FA" }}>
          <th
            className="pr-lg-4 border font-weight-normal firstColumnWidth position-absolute shadow-sm"
            style={{ right: "0px", backgroundColor: "#F5F8FA" }}
          >
            תפקיד
          </th>
          <th
            className="border font-weight-normal shadow-sm"
            style={{ minWidth: "12rem" }}
          >
            ניהול משתמשים
          </th>
          <th
            className="border font-weight-normal shadow-sm"
            style={{ minWidth: "12rem" }}
          >
            צפייה בלוגים
          </th>
          <th
            className="border font-weight-normal shadow-sm"
            style={{ minWidth: "12rem" }}
          >
            עדכון פרטי לקוח
          </th>
          <th
            className="border font-weight-normal shadow-sm"
            style={{ minWidth: "12rem" }}
          >
            מחיקת רשומת לקוח
          </th>
          <th
            className="border font-weight-normal shadow-sm"
            style={{ minWidth: "12rem" }}
          >
            הוספת רשומת לקוח
          </th>
          <th
            className="border font-weight-normal shadow-sm"
            style={{ minWidth: "12rem" }}
          >
            צפייה ביומן ראשי
          </th>
          <th
            className="border font-weight-normal shadow-sm"
            style={{ minWidth: "12rem" }}
          >
            צפייה ביומן ניתוחים
          </th>
          <th
            className="border font-weight-normal shadow-sm"
            style={{ minWidth: "12rem" }}
          >
            צפייה ביומן שלישי
          </th>
          <th
            className="border font-weight-normal shadow-sm"
            style={{ minWidth: "12rem" }}
          >
            עריכת יומן ראשי
          </th>
          <th
            className="border font-weight-normal shadow-sm"
            style={{ minWidth: "12rem" }}
          >
            עריכת יומן ניתוחים
          </th>
          <th
            className="border font-weight-normal shadow-sm"
            style={{ minWidth: "12rem" }}
          >
            עריכת יומן שלישי
          </th>
          <th
            className="border font-weight-normal shadow-sm"
            style={{ minWidth: "12rem" }}
          >
            צפייה במסמכי לקוח
          </th>
          <th
            className="border font-weight-normal shadow-sm"
            style={{ minWidth: "12rem" }}
          >
            צפייה בתמונות לקוח
          </th>
          <th
            className="border font-weight-normal shadow-sm"
            style={{ minWidth: "12rem" }}
          >
            יצירת מסמכי לקוח
          </th>
          <th
            className="border font-weight-normal shadow-sm"
            style={{ minWidth: "13rem" }}
          >
            יצירת מסמכי לקוח מסווגים
          </th>
          <th
            className="border font-weight-normal shadow-sm"
            style={{ minWidth: "13rem" }}
          >
            עריכת רשימת פעולות
          </th>
          <th
            className="border font-weight-normal shadow-sm"
            style={{ minWidth: "13rem" }}
          >
            עריכת רשימת שיוכים
          </th>
          <th
            className="border font-weight-normal shadow-sm "
            style={{ minWidth: "3rem" }}
          ></th>
        </tr>
      </thead>,
      <tbody key="2">{tableRows}</tbody>,
    ];
    setTableContent(table);
    console.log("another done")
  }, [filteredRoles, rolesPage, editRole, roles, props.role]);

  const handleRoleRemoval = (role) => {
    console.log("removing role", role);
    if (!props.user) {
      return;
    }
    const data = {
      roleId: role._id,
    };
    props.user
      .getIdToken(true)
      .then((idToken) => {
        props
          .deleteRequestWithToken(ROLE_URL, idToken, data)
          .then(() => {
            fetchRoles();
          })
          .catch((err) => console.log(err));
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const handleRoleNameChange = (e, role) => {
    if (e.target.value !== role.name) {
      if (!props.user) {
        return;
      }
      const data = {
        roleId: role._id,
        permission: {
          name: e.target.value,
        },
      };
      props.user
        .getIdToken(true)
        .then((idToken) => {
          props
            .patchRequestWithToken(ROLE_URL, idToken, data)
            .then((roles) => {
              setRoles(roles);
              setFilteredRoles(roles);
            })
            .catch((err) => console.log(err));
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  };

  const handlePermissionChange = (role, permission) => {
    if (role.admin) return;
    if (!props.user) {
      return;
    }
    const data = {
      roleId: role._id,
      permission: {},
    };
    data.permission[permission] = !role[permission];

    props.user
      .getIdToken(true)
      .then((idToken) => {
        props
          .patchRequestWithToken(ROLE_URL, idToken, data)
          .then((roles) => {
            setRoles(roles);
            setFilteredRoles(roles);
          })
          .catch((err) => console.log(err));
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const handleFilterChange = (e) => {
    setRolesPage(0);
    setFilter(e.target.value);
    setFilteredRoles(
      roles.filter((role) => {
        if (!Object.values(role).join(" ").includes(e.target.value)) {
          return false;
        } else {
          return true;
        }
      })
    );
  };

  const searchInputFocus = () => {
    setSearchFocus(!searchFocus);
  };

  const handleNewRole = (name) => {
    const data = {
      roleName: name,
    };
    props.user
      .getIdToken(true)
      .then((idToken) => {
        props
          .postRequestWithToken(ROLE_URL, idToken, data)
          .then(() => {
            fetchRoles();
          })
          .catch((err) => console.log(err));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const promptConfirmation = (text, action) => {
    setConfirmationText(text);
    setConfirmationAction(() => action);
  };

  const handleHideConf = () => {
    setConfirmationText("");
    setConfirmationAction(null);
  };

  const handleHideNewRoleModal = () => {
    setShowNewRoleModal(false);
  };

  const handleChangeConfirm = () => {
    confirmationAction();
    setConfirmationAction(null);
    setConfirmationText("");
  };

  if (!props.role) return null;

  return (
    <>
      <NewRoleModal
        show={showNewRoleModal}
        hide={handleHideNewRoleModal}
        save={handleNewRole}
      />
      <ConfirmationModal
        hide={handleHideConf}
        text={confirmationText}
        performAction={handleChangeConfirm}
      />
      <div
        className="container-fluid my-4 mx-md-5 text-right"
        style={{ maxWidth: "95vw" }}
      >
        <div className="text-right">
          <div className="d-inline-block">
            <h3 style={{ color: "#007A8C" }}>תפקידי מערכת</h3>
            <h6 className="text-secondary mb-0">{roles.length} תפקידים</h6>
          </div>
          <div className="d-inline-block float-sm-left mt-2 mt-sm-0">
            {/* <button className="btn btn-purple-outline">ייצוא</button> */}
            <button
              className="btn mx-2 btn-purple text-white"
              onClick={() => setShowNewRoleModal(true)}
            >
              תפקיד חדש
            </button>
          </div>
          <hr />
        </div>
        <div className="text-right mb-3">
          <div
            className={
              "border d-inline-block rounded my-1 " +
              (searchFocus ? "userSearch" : "")
            }
            style={{ backgroundColor: "#f5f8fa" }}
          >
            <FormControl
              placeholder="חיפוש תפקידים"
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
              className="text-break w-100 usersTable bg-white"
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
    </>
  );
}

export default Roles;
