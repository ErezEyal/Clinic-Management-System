import { useEffect, useState } from "react";
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
  const [patientFiles, setPatientFiles] = useState([]);
  const [patientPhotos, setPatientPhotos] = useState([]);
  const [displayPatientModal, setDisplayPatientModal] = useState(false);
  const [templates, setTemplates] = useState(null);
  const PATIENT_FILES_URL = "http://localhost:3000/api/patient-files";
  const PATIENT_FILE_URL = "http://localhost:3000/api/patient-file";
  const PATIENT_PHOTOS_URL = "http://localhost:3000/api/patient-photos";
  const TIMELINE_URL = "http://localhost:3000/api/timeline";
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
  }, [props]);

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
  }, [props]);

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

  

  if (!props.patient) return <Redirect to="/" />;

  return (
    <>
      <PatientModal
        show={displayPatientModal}
        hide={hidePatientModal}
        patient={props.patient}
        updatePatient={props.savePatient}
        categories={props.categories}
      />
      <Container fluid className="d-flex p-4 text-right">
        <div
          className="col-sm-5 col-lg-3 d-none d-sm-block pr-0"
          style={{ minHeight: "70vh" }}
        >
          <div className="position-sticky" style={{ top: "4rem" }}>
            <PatientProfile
              patient={props.patient}
              editPatient={showPatientModal}
              categories={props.categories}
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
            <div className="">
              <Calendar
                user={props.user}
                postRequestWithToken={props.postRequestWithToken}
                patchRequestWithToken={props.patchRequestWithToken}
                deleteRequestWithToken={props.deleteRequestWithToken}
                maxHeight="75vh"
                small={true}
                role={props.role}
              />
            </div>
          ) : activeTab === "info" ? (
            <PatientProfile
              patient={props.patient}
              editPatient={showPatientModal}
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
            />
          ) : activeTab === "templates" ? (
            <Templates
              patient={props.patient}
              postRequestWithToken={props.postRequestWithToken}
              user={props.user}
              docCreated={handleDocCreated}
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
