import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
// import NavDropdown from 'react-bootstrap/NavDropdown';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { auth } from "./firebase.js";
import { useHistory } from "react-router-dom";
import { NavDropdown } from "react-bootstrap";
import "./App.css";
import { useEffect } from "react";

function NavigationBar(props) {
  let history = useHistory();
  const AUDIT_URL = process.env.REACT_APP_BASE_API_URL + "audit";

  const sendLogoutLog = (user) => {
    const data = {
      event: "logout",
      time: Date.now(),
    };

    user
      .getIdToken(true)
      .then((idToken) => {
        props
          .postRequestWithToken(AUDIT_URL, idToken, data)
          .then((result) => console.log(result))
          .catch((err) => console.log(err));
      })
      .catch((error) => console.log(error));
  };

  const handleSignOut = () => {
    history.push("/login");
    sendLogoutLog(props.user);
    auth
      .signOut()
      .then(() => {
        console.log("User logged out");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <Navbar
      fixed="top"
      aaabg="light"
      style={{ background: "#4e4073" }}
      expand="lg"
      variant="dark"
      className="text-right"
    >
      <Navbar.Brand href={props.user ? "/patients" : "/login"}>
        Clinic Home
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto mr-md-4">
          <Nav.Link className="mr-3" href="/patients">
            לקוחות
          </Nav.Link>
          <Nav.Link
            className="mr-3"
            href="/calendar"
            hidden={
              !props.role ||
              (!props.role.viewCalendar &&
                !props.role.admin &&
                !props.role.viewSecondCalendar &&
                !props.role.viewThirdCalendar)
            }
          >
            יומן
          </Nav.Link>
          <Nav.Link className="mr-3" href="/tasks">
            מטלות
          </Nav.Link>
          <NavDropdown
            title="ניהול "
            className="text-right mr-3"
            hidden={
              !props.role ||
              (!props.role.manageUsers &&
                !props.role.viewLogs &&
                !props.role.admin)
            }
          >
            <NavDropdown.Item
              href="/signup"
              className="text-right"
              hidden={
                !props.role || (!props.role.manageUsers && !props.role.admin)
              }
            >
              הרשמה
            </NavDropdown.Item>
            <NavDropdown.Item
              href="/users"
              className="text-right"
              hidden={
                !props.role || (!props.role.manageUsers && !props.role.admin)
              }
            >
              משתמשים
            </NavDropdown.Item>
            <NavDropdown.Item
              href="/roles"
              className="text-right"
              hidden={
                !props.role || (!props.role.manageUsers && !props.role.admin)
              }
            >
              הרשאות
            </NavDropdown.Item>
            <NavDropdown.Item
              href="/audit"
              className="text-right"
              hidden={
                !props.role || (!props.role.viewLogs && !props.role.admin)
              }
            >
              תיעוד
            </NavDropdown.Item>
          </NavDropdown>
        </Nav>
        <Form inline className="pr-3 border-secondary border-right text-white">
          {props.user ? (
            <>
              <img
                className="rounded-circle ml-2 mr-0"
                width="32px"
                height="32px"
                alt="profile"
                src={props.userPhoto ? props.userPhoto : "/unknown.png"}
              />
              <NavDropdown
                title={props.role ? props.user.displayName + ", " + props.role.name + " " : " "}
                className="userSectionNavBar"
              >
                {/* <NavDropdown.Item className="text-right" href="#action/3.1">
                  עדכון פרטים
                </NavDropdown.Item>
                <NavDropdown.Divider /> */}
                <NavDropdown.Item
                  onClick={handleSignOut}
                  className="text-right"
                  href="#logout"
                >
                  התנתק
                </NavDropdown.Item>
              </NavDropdown>
            </>
          ) : (
            "שלום אורח"
          )}
        </Form>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default NavigationBar;
