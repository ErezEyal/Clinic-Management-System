import { useCallback, useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import "./Patients.css";
import PatientNavBar from "./PatientNavBar";
import PatientProfile from "./PatientProfile";
import Calendar from "../schedule/Calendar";
import DocumentsList from "./DocumentsList";
import PatientModal from "./PatientModal";
import Timeline from "./Timeline";
import { Redirect } from "react-router-dom";
import Templates from "./Templates";

function Patient(props) {
  const [activeTab, setActiveTab] = useState("timeline");
  const [templates, setTemplates] = useState([]);
  const [patientFiles, setPatientFiles] = useState(null);
  const [patientPhotos, setPatientPhotos] = useState(null);
  const [displayPatientModal, setDisplayPatientModal] = useState(false);
  const TEMPLATES_URL = process.env.REACT_APP_BASE_API_URL + "templates";
  const PATIENT_FILES_URL =
    process.env.REACT_APP_BASE_API_URL + "patient-files";
  const PATIENT_FILE_URL = process.env.REACT_APP_BASE_API_URL + "patient-file";
  const PATIENT_PHOTOS_URL =
    process.env.REACT_APP_BASE_API_URL + "patient-photos";
  const TIMELINE_URL = process.env.REACT_APP_BASE_API_URL + "timeline";
  const [timeline, setTimeline] = useState([]);

  const changeTab = (tab) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    if (props.patient) {
      props.user
        .getIdToken(true)
        .then((idToken) => {
          props
            .postRequestWithToken(PATIENT_FILES_URL, idToken, props.patient)
            .then((result) => {
              console.log(result);
              setPatientFiles(result);
            })
            .catch((err) => console.log(err));
        })
        .catch((error) => console.log(error));
    }
  }, [PATIENT_FILES_URL, props]);

  useEffect(() => {
    if (props.patient) {
      props.user
        .getIdToken(true)
        .then((idToken) => {
          props
            .postRequestWithToken(TEMPLATES_URL, idToken)
            .then((result) => {
              console.log("Templates:", result);
              setTemplates(result);
            })
            .catch((err) => console.log(err));
        })
        .catch((error) => console.log(error));
    }
  }, [TEMPLATES_URL, props]);

  useEffect(() => {
    if (props.patient) {
      const data = {
        patientId: props.patient._id,
      };
      props.user
        .getIdToken(true)
        .then((idToken) => {
          props
            .postRequestWithToken(TIMELINE_URL, idToken, data)
            .then((result) => {
              console.log(result);
              setTimeline(result);
            })
            .catch((err) => console.log(err));
        })
        .catch((error) => console.log(error));
    }
  }, [props, activeTab]);

  useEffect(() => {
    if (props.patient) {
      props.user
        .getIdToken(true)
        .then((idToken) => {
          props
            .postRequestWithToken(PATIENT_PHOTOS_URL, idToken, props.patient)
            .then((result) => {
              console.log(result);
              setPatientPhotos(result);
            })
            .catch((err) => console.log(err));
        })
        .catch((error) => console.log(error));
    }
  }, [props]);

  const getUpdatedPatientDetails = useCallback(() => {
    if (timeline.length) {
      let procedures = [];
      for (const day of timeline) {
        for (const patientEvent of day[Object.keys(day)[0]]) {
          if (
            patientEvent.template === "פעולה" &&
            !procedures.includes(patientEvent.title)
          ) {
            procedures.push(patientEvent.title);
          }
        }
      }
      const updatedPatient = { ...props.patient };
      updatedPatient.procedures = procedures;
      // console.log(updatedPatient);
      return updatedPatient;
    }
    return props.patient;
  }, [timeline, props.patient]);

  if (!props.patient) return <Redirect to="/" />;

  const showPatientModal = () => {
    setDisplayPatientModal(true);
  };

  const hidePatientModal = () => {
    setDisplayPatientModal(false);
  };

  const handleDocCreated = () => {
    setActiveTab("timeline");
  };

  const fetchTimeline = () => {
    if (props.patient) {
      const data = {
        patientId: props.patient._id,
      };
      props.user
        .getIdToken(true)
        .then((idToken) => {
          props
            .postRequestWithToken(TIMELINE_URL, idToken, data)
            .then((result) => {
              console.log(result);
              setTimeline(result);
            })
            .catch((err) => console.log(err));
        })
        .catch((error) => console.log(error));
    }
  };

  const getFileLink = (path) => {
    if (props.patient) {
      return props.user
        .getIdToken(true)
        .then((idToken) => {
          return props
            .postRequestWithToken(PATIENT_FILE_URL, idToken, { filePath: path })
            .then((result) => {
              console.log(result);
              const filesTemp = [...patientFiles];
              filesTemp.forEach((file, index) => {
                if (file.path === path) {
                  filesTemp[index].link = result.link;
                }
              });
              setPatientFiles(filesTemp);
              return result.link;
            })
            .catch((err) => {
              console.log(err);
              return null;
            });
        })
        .catch((error) => {
          console.log(error);
          return null;
        });
    }
  };

  const getPhotoLink = (path) => {
    if (props.patient) {
      return props.user
        .getIdToken(true)
        .then((idToken) => {
          return props
            .postRequestWithToken(PATIENT_FILE_URL, idToken, { filePath: path })
            .then((result) => {
              console.log(result);
              const filesTemp = [...patientPhotos];
              filesTemp.forEach((file, index) => {
                if (file.path === path) {
                  filesTemp[index].link = result.link;
                }
              });
              setPatientPhotos(filesTemp);
              return result.link;
            })
            .catch((err) => {
              console.log(err);
              return null;
            });
        })
        .catch((error) => {
          console.log(error);
          return null;
        });
    }
  };

  return (
    <>
      <PatientModal
        show={displayPatientModal}
        hide={hidePatientModal}
        patient={props.patient}
        updatePatient={props.savePatient}
        categories={props.categories}
        procedures={props.procedures}
        role={props.role}
      />
      <Container fluid className="d-flex p-4 text-right" style={{height: "90vh"}}>
        <div
          className="col-sm-5 col-lg-3 d-none d-sm-block pr-0"
        >
          <div className="h-100">
            <PatientProfile
              patient={getUpdatedPatientDetails()}
              editPatient={showPatientModal}
              categories={props.categories}
              role={props.role}
            />
          </div>
        </div>
        <div className="d-flex flex-column col-sm-7 col-lg-9 px-0 px-md-2">
          <PatientNavBar
            role={props.role}
            setActiveTab={changeTab}
            activeTab={activeTab}
          />
          {activeTab === "calendar" ? (
            <div className="h-100">
              <Calendar
                user={props.user}
                postRequestWithToken={props.postRequestWithToken}
                patchRequestWithToken={props.patchRequestWithToken}
                deleteRequestWithToken={props.deleteRequestWithToken}
                maxHeight="100%"
                small={true}
                role={props.role}
                patient={{
                  label: `${props.patient.firstName} ${props.patient.lastName} (${props.patient.id})`,
                  value: props.patient._id,
                }}
              />
            </div>
          ) : activeTab === "info" ? (
            <PatientProfile
              patient={props.patient}
              editPatient={showPatientModal}
              categories={props.categories}
              role={props.role}
            />
          ) : activeTab === "documents" ? (
            <DocumentsList
              patient={props.patient}
              files={patientFiles}
              photos={false}
              getLink={getFileLink}
            />
          ) : activeTab === "photos" ? (
            <DocumentsList
              patient={props.patient}
              files={patientPhotos}
              photos={true}
              getLink={getPhotoLink}
            />
          ) : activeTab === "timeline" ? (
            <Timeline
              timeline={timeline}
              patient={props.patient}
              user={props.user}
              postRequestWithToken={props.postRequestWithToken}
              putRequestWithToken={props.putRequestWithToken}
              patchRequestWithToken={props.patchRequestWithToken}
              deleteRequestWithToken={props.deleteRequestWithToken}
              fetchTimeline={fetchTimeline}
              procedures={props.procedures}
              role={props.role}
            />
          ) : activeTab === "templates" ? (
            <Templates
              patient={props.patient}
              postRequestWithToken={props.postRequestWithToken}
              patchRequestWithToken={props.patchRequestWithToken}
              user={props.user}
              docCreated={handleDocCreated}
              templates={templates}
            />
          ) : (
            ""
          )}
        </div>
      </Container>
    </>
  );
}

export default Patient;
