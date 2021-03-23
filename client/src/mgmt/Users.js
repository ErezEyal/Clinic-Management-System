import { useState, useEffect } from "react";
import { FormControl, Button } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import ConfirmationModal from "../root/ConfirmationModal";
import UserModal from "./UserModal";
// import UserModal from '../users/UserModal';

function Users(props) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [tableContent, setTableContent] = useState([]);
  const [usersPage, setUsersPage] = useState(0);
  const [searchFocus, setSearchFocus] = useState(false);
  const [filter, setFilter] = useState("");
  const history = useHistory();
  const [displayUserModal, setDisplayUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [roles, setRoles] = useState([]);
  const [confirmationText, setConfirmationText] = useState("");
  const [confirmationAction, setConfirmationAction] = useState("");
  const USERS_URL = process.env.REACT_APP_BASE_API_URL + "users";
  const USER_URL = process.env.REACT_APP_BASE_API_URL + "user";
  const ROLES_URL = process.env.REACT_APP_BASE_API_URL + "roles";
  const USER_PHOTO_URL = process.env.REACT_APP_BASE_API_URL + "user-photo";
  const USERS_EXPORT_URL = process.env.REACT_APP_BASE_API_URL + "export-users";

  useEffect(() => {
    props.user
      .getIdToken(true)
      .then((idToken) => {
        props
          .postRequestWithToken(ROLES_URL, idToken)
          .then((data) => {
            const roleNames = data.map((role) => {
              return role.name;
            });
            setRoles(roleNames);
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  }, [props]);

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

  const editIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className="bi bi-pencil-fill text-secondary"
      viewBox="0 0 16 16"
    >
      <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z" />
    </svg>
  );

  const numOfPages = () => {
    if (filteredUsers.length % 10 === 0) return filteredUsers.length / 10 - 1;
    else return Math.floor(filteredUsers.length / 10);
  };

  const pagination = (
    <div>
      <div className="d-block text-center mt-3">
        <Button
          variant="link"
          className="d-inline text-decoration-none shadow-none"
          onClick={() => setUsersPage(0)}
          disabled={usersPage === 0}
          title="First page"
        >
          <span>&#8649;</span>
        </Button>
        <Button
          variant="link"
          className="d-inline text-decoration-none shadow-none"
          onClick={() => setUsersPage(usersPage - 1)}
          disabled={usersPage === 0}
          title="Previous page"
        >
          <span>&#8594;</span>
        </Button>

        <Button
          variant="link"
          className="d-inline text-decoration-none shadow-none"
          title="Current page"
        >
          <span>{usersPage + 1}</span>
        </Button>

        <Button
          variant="link"
          className="d-inline text-decoration-none shadow-none"
          onClick={() => setUsersPage(usersPage + 1)}
          disabled={usersPage === numOfPages()}
          title="Next page"
        >
          <span>&#8592;</span>
        </Button>
        <Button
          variant="link"
          className="d-inline text-decoration-none shadow-none"
          onClick={() => setUsersPage(numOfPages())}
          disabled={usersPage === numOfPages()}
          title="Last page"
        >
          <span>&#8647;</span>
        </Button>
      </div>
      <div className="d-block text-center mt-2">
        <span className="text-secondary smallFont">
          {filteredUsers.length} משתמשים
        </span>
      </div>
    </div>
  );

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    if (!props.user) {
      return;
    }
    props.user
      .getIdToken(true)
      .then((idToken) => {
        props
          .postRequestWithToken(USERS_URL, idToken)
          .then((users) => {
            setUsers(users.users || []);
            setFilteredUsers(users.users || []);
          })
          .catch((err) => console.log(err));
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  useEffect(() => {
    let tableRows = filteredUsers.map((user, index) => {
      // this func should not handle filtering
      return (
        <tr key={index} className="usersTableRow" style={{ color: "#007A8C" }}>
          <td
            className="firstColumnWidth position-absolute pr-lg-4"
            style={{ right: "0px" }}
          >
            <img
              src={user.photo ? user.photo : "/unknownBig.png"}
              width="20px"
              alt="profile"
              className="d-inline mx-2 rounded-circle"
            ></img>
            <span>{user.name}</span>
          </td>
          <td style={{ minWidth: "14rem" }}>
            <span>{user.email}</span>
          </td>
          <td style={{ minWidth: "14rem" }}>
            <span dir="ltr">{user.phoneNumber}</span>
          </td>
          <td style={{ minWidth: "14rem" }}>
            {user.mfa ? (
              <span className="text-success">פעיל</span>
            ) : (
              <span className="text-danger">כבוי</span>
            )}
          </td>
          <td style={{ minWidth: "14rem" }}>
            <span>{user.role}</span>
            <div className="d-inline-block float-left">
              <span
                className="pointer mx-2"
                onClick={() => showUserModal(user)}
              >
                {editIcon}
              </span>

              <div className="d-inline">
                <span
                  className="pointer mx-2"
                  // data-toggle="dropdown"
                  onClick={() =>
                    promptConfirmation(
                      `האם אתה בטוח שברצונך למחוק את ${user.name}?`,
                      () => deleteUser(user)
                    )
                  }
                >
                  {removeIcon}
                </span>
                <div className="dropdown-menu" style={{ minWidth: "0" }}>
                  <button
                    className="dropdown-item text-center text-danger font-weight-bold"
                    onClick={() => deleteUser(user)}
                  >
                    הסר
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      );
    });
    tableRows = tableRows.slice(usersPage * 10, usersPage * 10 + 10);
    const table = [
      <thead key="1">
        <tr style={{ backgroundColor: "#F5F8FA" }}>
          <th
            className="firstColumnWidth position-absolute pr-lg-5 border font-weight-normal sticky-col firstCol shadow-sm"
            style={{ backgroundColor: "#F5F8FA", right: "0px" }}
          >
            שם
          </th>
          <th className="border font-weight-normal shadow-sm">כתובת מייל</th>
          <th className="border font-weight-normal shadow-sm">מספר טלפון</th>
          <th className="border font-weight-normal shadow-sm">אימות דו שלבי</th>
          <th className="border font-weight-normal shadow-sm">תפקיד</th>
        </tr>
      </thead>,
      <tbody key="2">{tableRows}</tbody>,
    ];
    setTableContent(table);
  }, [filteredUsers, usersPage]);

  const handleFilterChange = (e) => {
    setUsersPage(0);
    setFilter(e.target.value);
    setFilteredUsers(
      users.filter((user) => {
        if (!Object.values(user).join(" ").includes(e.target.value)) {
          return false;
        } else {
          return true;
        }
      })
    );
  };

  const showUser = (user) => {
    props.selectUser(user);
    history.push("/user");
  };

  const searchInputFocus = () => {
    setSearchFocus(!searchFocus);
  };

  const showUserModal = (user) => {
    setSelectedUser(user);
    setDisplayUserModal(true);
  };

  const hideUserModal = () => {
    setDisplayUserModal(false);
  };

  const deleteUser = (user) => {
    const data = {
      userId: user.uid,
      userName: user.name,
    };
    if (!props.user) {
      return;
    }
    props.user
      .getIdToken(true)
      .then((idToken) => {
        props
          .deleteRequestWithToken(USER_URL, idToken, data)
          .then((data) => {
            setUsers(data);
            setFilteredUsers(data);
            setFilter("");
          })
          .catch((err) => console.log(err));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const updateUserDetails = async (uid, fields) => {
    const data = {
      uid: uid,
      updatedFields: fields,
      user: selectedUser,
    };
    if (!props.user) {
      return;
    }
    return await props.user
      .getIdToken(true)
      .then(async (idToken) => {
        return await props
          .patchRequestWithToken(USER_URL, idToken, data)
          .then((result) => {
            if (result.result === true) {
              fetchUsers();
              setTimeout(() => hideUserModal(), 2000);
              return true;
            } else {
              return false;
            }
          })
          .catch((err) => {
            console.log(err);
            return false;
          });
      })
      .catch((error) => {
        console.log(error);
        return false;
      });
  };

  const updateUserPhoto = async (uid, photo) => {
    const data = {
      userId: uid,
      photo: photo,
      userName: selectedUser.name,
    };
    if (!props.user) {
      return;
    }
    return await props.user
      .getIdToken(true)
      .then(async (idToken) => {
        return await props
          .postRequestWithToken(USER_PHOTO_URL, idToken, data)
          .then((result) => {
            if (result.result === true) {
              fetchUsers();
              setTimeout(() => hideUserModal(), 100);
              return true;
            } else {
              return false;
            }
          })
          .catch((err) => {
            console.log(err);
            return false;
          });
      })
      .catch((error) => {
        console.log(error);
        return false;
      });
  };

  const handleExport = () => {
    props.user.getIdToken(true).then((idToken) => {
      const response = fetch(USERS_EXPORT_URL, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: idToken }),
      })
        .then((res) => res.text())
        .then((res) => {
          let blob = new Blob([res], { type: "text/csv" });
          let a = document.createElement("a");
          a.download = "users.csv";
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

  const promptConfirmation = (text, action) => {
    setConfirmationText(text);
    setConfirmationAction(() => action);
  };

  const handleHideConf = () => {
    setConfirmationText("");
    setConfirmationAction(null);
  };

  const handleChangeConfirm = () => {
    confirmationAction();
    setConfirmationAction(null);
    setConfirmationText("");
  };

  return (
    <>
      <ConfirmationModal
        hide={handleHideConf}
        text={confirmationText}
        performAction={handleChangeConfirm}
      />
      <UserModal
        show={displayUserModal}
        hide={hideUserModal}
        user={selectedUser}
        roles={roles}
        updateUser={updateUserDetails}
        updateUserPhoto={updateUserPhoto}
      />
      <div
        className="container-fluid my-4 mx-md-5 text-right"
        style={{ maxWidth: "95vw" }}
      >
        <div className="text-right">
          <div className="d-inline-block">
            <h3 style={{ color: "#007A8C" }}>משתמשי מערכת</h3>
            <h6 className="text-secondary mb-0">{users.length} משתמשים</h6>
          </div>
          <div className="d-inline-block float-sm-left mt-2 mt-sm-0">
            <button className="btn btn-purple-outline" onClick={handleExport}>
              ייצוא
            </button>
            <button
              className="btn mx-2 btn-purple text-white"
              onClick={() => history.push("/signup")}
            >
              משתמש חדש
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
              placeholder="חיפוש משתמשים"
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

export default Users;
