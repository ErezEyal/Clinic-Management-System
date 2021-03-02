import React, { useEffect, useState } from "react";
import "./index.css";
import Schedule from "./schedule/Schedule";
import Calendar from "./schedule/Calendar";
import Login from "./root/Login";
import NavigationBar from "./NavigationBar";
import "bootstrap/dist/css/bootstrap.min.css";
import Patients from "./patients/Patients";
import Patient from "./patients/Patient";
import Audit from "./audit/Audit";
import Tasks from "./tasks/Tasks";
import ProtectedRoute from "./ProtectedRoute";
import { useHistory } from "react-router-dom";
import {
  // BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  BrowserRouter,
} from "react-router-dom";
import { auth, getCurrentUsername } from "./firebase.js";
import Signup from "./root/Signup";
import Users from "./mgmt/Users";
import Roles from "./mgmt/Roles";

function App() {
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [role, setRole] = useState(null);
  const [users, setUsers] = useState([]);
  const [userPhoto, setUserPhoto] = useState(null);
  const [patientCategories, setPatientCategories] = useState([]);
  const history = useHistory();
  const PATIENT_URL = "http://localhost:3000/api/patient";
  const PERMISSIONS_URL = "http://localhost:3000/api/role-permissions";
  const USERS_URL = "http://localhost:3000/api/users";
  const PATIENT_CATEGORIES_URL = "http://localhost:3000/api/patient-categories";

  const arrayToCSV = (array) => {
    const rows = [
        ["name1", "city1", "some other info"],
        ["name2", "city2", "more info"]
    ];
    
    let csvContent = "data:text/csv;charset=utf-8," 
        + rows.map(e => e.join(",")).join("\n");
  }

  useEffect(() => {
    if (!user) {
      return;
    }
    user
      .getIdToken(true)
      .then((idToken) => {
        postRequestWithToken(USERS_URL, idToken)
          .then((users) => {
            setUsers(users.users || []);
            for (const userRecord of users.users) {
              if (userRecord.uid === user.uid) {
                setUserPhoto(userRecord.photo);
                break;
              }
            }
          })
          .catch((err) => console.log(err));
      })
      .catch(function (error) {
        console.log(error);
      });
  }, [user]);

  useEffect(() => {
      if (!user || patientCategories.length) return;
    user
      .getIdToken(true)
      .then((idToken) => {
        postRequestWithToken(PATIENT_CATEGORIES_URL, idToken)
          .then((categories) => {
            setPatientCategories(categories);
          })
          .catch((err) => console.log(err));
      })
      .catch(function (error) {
        console.log(error);
      });
  }, [user]);

  const postRequestWithToken = (url, idToken, data = {}) => {
    data["idToken"] = idToken;
    const response = fetch(url, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => res.json());

    return response;
  };

  const deleteRequestWithToken = (url, idToken, data = {}) => {
    data["idToken"] = idToken;
    const response = fetch(url, {
      method: "delete",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => res.json());

    return response;
  };

  const putRequestWithToken = (url, idToken, data = {}) => {
    data["idToken"] = idToken;
    const response = fetch(url, {
      method: "put",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => res.json());

    return response;
  };

  const patchRequestWithToken = (url, idToken, data = {}) => {
    data["idToken"] = idToken;
    const response = fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => res.json());

    return response;
  };

  auth.onAuthStateChanged((newUser) => {
    const newLoggedInUser = newUser && (!user || newUser.uid !== user.uid);
    if (newUser) {
      if (newLoggedInUser) {
        console.log("login detected with ", newUser);
        setUser(newUser);
        if (!role || !role.name) {
          getRole(newUser);
        }
        setIsLoadingUser(false);
      }
    } else {
      console.log("logout detected");
      setUser(false);
      if (role && role.name) setRole({});
      setIsLoadingUser(false);
    }
  });

  const handlePatientSelection = (patient) => {
    setSelectedPatient(patient);
  };

  const savePatient = (patient) => {
    if (patient._id) return updatePatient(patient);
    else return createPatient(patient);
  };

  const updatePatient = (patient) => {
    const data = {
      patient: patient,
    };
    if (!user) {
      return;
    }
    return user
      .getIdToken(true)
      .then((idToken) => {
        return putRequestWithToken(PATIENT_URL, idToken, data)
          .then((data) => {
            console.log(data);
            if (!data.result) {
              return false;
            } else {
              return true;
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

  const createPatient = (patient) => {
    const data = {
      patient: patient,
      userName: user.displayName,
    };
    if (!user) {
      return false;
    }
    return user
      .getIdToken(true)
      .then((idToken) => {
        return postRequestWithToken(PATIENT_URL, idToken, data)
          .then((data) => {
            console.log(data);
            if (!data.result) {
              return false;
            } else {
              return true;
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

  const getRole = (user) => {
    if (!user || role) return;
    user.getIdToken(true).then((idToken) => {
      postRequestWithToken(PERMISSIONS_URL, idToken).then((role) => {
        setRole(role);
        console.log(role);
      });
    });
  };

  const updatePatientCategories = (categories) => {
    if (categories) setPatientCategories(categories);
  };

  return (
    <div className="pt-5">
      <BrowserRouter>
        <NavigationBar
          user={user}
          userPhoto={userPhoto}
          postRequestWithToken={postRequestWithToken}
          role={role}
        />
        <Switch>
          <ProtectedRoute
            path="/schedule"
            user={user}
            isLoading={isLoadingUser}
          >
            <Schedule />
          </ProtectedRoute>
          <ProtectedRoute
            path="/calendar"
            user={user}
            isLoading={isLoadingUser}
          >
            <Calendar
              user={user}
              postRequestWithToken={postRequestWithToken}
              patchRequestWithToken={patchRequestWithToken}
              deleteRequestWithToken={deleteRequestWithToken}
              maxHeight="auto"
              role={role}
            />
          </ProtectedRoute>

          <ProtectedRoute
            path="/patients"
            user={user}
            isLoading={isLoadingUser}
          >
            <Patients
              role={role}
              user={user}
              postRequestWithToken={postRequestWithToken}
              patchRequestWithToken={patchRequestWithToken}
              deleteRequestWithToken={deleteRequestWithToken}
              selectPatient={handlePatientSelection}
              savePatient={savePatient}
              updatePatientCategories={updatePatientCategories}
            />
          </ProtectedRoute>

          <ProtectedRoute path="/patient" user={user} isLoading={isLoadingUser}>
            <Patient
              role={role}
              user={user}
              postRequestWithToken={postRequestWithToken}
              patchRequestWithToken={patchRequestWithToken}
              deleteRequestWithToken={deleteRequestWithToken}
              putRequestWithToken={putRequestWithToken}
              patient={selectedPatient}
              savePatient={savePatient}
              categories={patientCategories}
            />
          </ProtectedRoute>

          <Route path="/login">
            <Login
              setLoadingUser={setIsLoadingUser}
              postRequestWithToken={postRequestWithToken}
            />
          </Route>

          <ProtectedRoute path="/users" user={user} isLoading={isLoadingUser}>
            <Users
              user={user}
              postRequestWithToken={postRequestWithToken}
              patchRequestWithToken={patchRequestWithToken}
              deleteRequestWithToken={deleteRequestWithToken}
              selectPatient={handlePatientSelection}
              savePatient={savePatient}
            />
          </ProtectedRoute>

          <ProtectedRoute path="/roles" user={user} isLoading={isLoadingUser}>
            <Roles
              user={user}
              postRequestWithToken={postRequestWithToken}
              patchRequestWithToken={patchRequestWithToken}
              deleteRequestWithToken={deleteRequestWithToken}
            />
          </ProtectedRoute>

          <ProtectedRoute path="/signup" user={user} isLoading={isLoadingUser}>
            <Signup user={user} postRequestWithToken={postRequestWithToken} />
          </ProtectedRoute>
          <ProtectedRoute path="/audit" user={user} isLoading={isLoadingUser}>
            <Audit user={user} postRequestWithToken={postRequestWithToken} />
          </ProtectedRoute>
          <ProtectedRoute path="/tasks" user={user} isLoading={isLoadingUser}>
            <Tasks
              user={user}
              postRequestWithToken={postRequestWithToken}
              deleteRequestWithToken={deleteRequestWithToken}
              putRequestWithToken={putRequestWithToken}
              patchRequestWithToken={patchRequestWithToken}
              users={users}
            />
          </ProtectedRoute>
          <ProtectedRoute path="/" user={user} isLoading={isLoadingUser}>
            <Redirect to="/patients" />
          </ProtectedRoute>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
