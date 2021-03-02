import { useState, useEffect } from "react";
import { FormControl, Button } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import PatientModal from "./PatientModal";
import OpenItemsBanner from "../tasks/OpenItemsBanner";
import PatientCategoriesModal from "./PatientCategoriesModal";

function Patients(props) {
  const [patients, setPatients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [tableContent, setTableContent] = useState([]);
  const [patientsPage, setPatientsPage] = useState(0);
  const [searchFocus, setSearchFocus] = useState(false);
  const [filter, setFilter] = useState("");
  const [openItems, setOpenItems] = useState(null);
  const history = useHistory();
  const [displayPatientModal, setDisplayPatientModal] = useState(false);
  const [displayCategoriesModal, setDisplayCategoriesModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientsPhotos, setPatientsPhotos] = useState({});
  const PATIENTS_URL = "http://localhost:3000/api/patients";
  const PATIENT_URL = "http://localhost:3000/api/patient";
  const OPEN_ITEMS_URL = "http://localhost:3000/api/open-items";
  const PATIENTS_PHOTOS_URL = "http://localhost:3000/api/patients-photos";
  const PATIENT_CATEGORY_URL = "http://localhost:3000/api/patient-category";
  const PATIENT_CATEGORIES_URL = "http://localhost:3000/api/patient-categories";

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
    if (filteredPatients.length % 10 === 0)
      return filteredPatients.length / 10 - 1;
    else return Math.floor(filteredPatients.length / 10);
  };

  const pagination = (
    <div>
      <div className="d-block text-center mt-3">
        <Button
          variant="link"
          className="d-inline text-decoration-none shadow-none"
          onClick={() => setPatientsPage(0)}
          disabled={patientsPage === 0}
          title="First page"
        >
          <span>&#8649;</span>
        </Button>
        <Button
          variant="link"
          className="d-inline text-decoration-none shadow-none"
          onClick={() => setPatientsPage(patientsPage - 1)}
          disabled={patientsPage === 0}
          title="Previous page"
        >
          <span>&#8594;</span>
        </Button>

        <Button
          variant="link"
          className="d-inline text-decoration-none shadow-none"
          title="Current page"
        >
          <span>{patientsPage + 1}</span>
        </Button>

        <Button
          variant="link"
          className="d-inline text-decoration-none shadow-none"
          onClick={() => setPatientsPage(patientsPage + 1)}
          disabled={patientsPage === numOfPages()}
          title="Next page"
        >
          <span>&#8592;</span>
        </Button>
        <Button
          variant="link"
          className="d-inline text-decoration-none shadow-none"
          onClick={() => setPatientsPage(numOfPages())}
          disabled={patientsPage === numOfPages()}
          title="Last page"
        >
          <span>&#8647;</span>
        </Button>
      </div>
      <div className="d-block text-center mt-2">
        <span className="text-secondary smallFont">
          {filteredPatients.length} לקוחות
        </span>
      </div>
    </div>
  );

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (!props.user) {
      return;
    }

    const data = {
      userId: props.user.uid,
    };

    props.user
      .getIdToken(true)
      .then((idToken) => {
        props
          .postRequestWithToken(OPEN_ITEMS_URL, idToken, data)
          .then((data) => {
            setOpenItems(data);
          })
          .catch((err) => console.log(err));
      })
      .catch(function (error) {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    props.user
      .getIdToken(true)
      .then((idToken) => {
        props
          .postRequestWithToken(PATIENT_CATEGORIES_URL, idToken)
          .then((categories) => {
            console.log(categories);
            setCategories(categories);
          })
          .catch((err) => console.log(err));
      })
      .catch(function (error) {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    if (filteredPatients && filteredPatients.length) {
      if (!props.user) {
        return;
      }

      const patientIds = filteredPatients
        .map((patient) => {
          return patient._id;
        })
        .slice(patientsPage * 10, patientsPage * 10 + 10);
      console.log("patient Ids: ", patientIds);
      props.user
        .getIdToken(true)
        .then((idToken) => {
          props
            .postRequestWithToken(PATIENTS_PHOTOS_URL, idToken, {
              patientIds: patientIds,
            })
            .then((patientPhotos) => {
              console.log(patientPhotos);
              setPatientsPhotos(patientPhotos);
              // const patientsWithPhotos = filteredPatients.map((patient) => {
              //   if (patientPhotos[patient._id]) {
              //     patient.picture = patientPhotos[patient._id];
              //   }
              //   return patient;
              // });
            })
            .catch((err) => console.log(err));
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  }, [patientsPage, filteredPatients]);

  const fetchPatients = () => {
    if (!props.user) {
      return;
    }
    props.user
      .getIdToken(true)
      .then((idToken) => {
        props
          .postRequestWithToken(PATIENTS_URL, idToken, { withoutPhoto: true })
          .then((data) => {
            setPatients(data);
            setFilteredPatients(data);
          })
          .catch((err) => console.log(err));
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  useEffect(() => {
    let tableRows = filteredPatients.flatMap((patient, index) => {
      if (patientsPhotos[patient._id]) {
        patient.picture = patientsPhotos[patient._id];
      }
      // this func should not handle filtering
      return (
        <tr
          key={index}
          className="patientsTableRow"
          style={{ color: "#007A8C" }}
        >
          <td className="pr-lg-4">
            <img
              src={
                patient.picture
                  ? patient.picture
                  : patient.gender === "male"
                  ? "/male1.png"
                  : "/female1.png"
              }
              alt={patient.firstName}
              width="20px"
              className="d-inline mx-2 rounded-circle"
            ></img>
            <span className="pointer" onClick={() => showPatient(patient)}>
              {patient.firstName + " " + patient.lastName}
            </span>
          </td>
          <td className="d-none d-md-table-cell">
            <span className="pointer" onClick={() => showPatient(patient)}>
              {patient.email}
            </span>
          </td>
          <td className="d-none d-md-table-cell">
            <span className="pointer" onClick={() => showPatient(patient)}>
              {patient.id}
            </span>
          </td>
          <td>
            <span
              dir="ltr"
              className="pointer"
              onClick={() => showPatient(patient)}
            >
              {patient.phone}
            </span>
            <div className="d-inline-block float-left">
              <span
                className="pointer mx-1 mx-md-2"
                onClick={() => showPatientModal(patient)}
                hidden={!props.role || !props.role.updateCustomer}
              >
                {editIcon}
              </span>
              <span
                className="pointer mx-md-2"
                onClick={() => deletePatient(patient)}
                hidden={!props.role || !props.role.deleteCustomer}
              >
                {removeIcon}
              </span>
            </div>
          </td>
        </tr>
      );
    });
    tableRows = tableRows.slice(patientsPage * 10, patientsPage * 10 + 10);
    const table = [
      <thead key="1">
        <tr style={{ backgroundColor: "#F5F8FA" }}>
          <th className="pr-lg-5 border font-weight-normal">שם</th>
          <th className="border font-weight-normal d-none d-md-table-cell">
            כתובת מייל
          </th>
          <th className="border font-weight-normal d-none d-md-table-cell">
            תעודת זהות
          </th>
          <th className="border font-weight-normal ">מספר טלפון</th>
        </tr>
      </thead>,
      <tbody key="2">{tableRows}</tbody>,
    ];
    setTableContent(table);
  }, [filteredPatients, patientsPage, patientsPhotos]);

  const handleFilterChange = (e) => {
    setPatientsPage(0);
    setFilter(e.target.value);
    setFilteredPatients(
      patients.filter((patient) => {
        if (!Object.values(patient).join(" ").includes(e.target.value)) {
          return false;
        } else {
          return true;
        }
      })
    );
  };

  const showPatient = (patient) => {
    props.selectPatient(patient);
    history.push("/patient");
  };

  const searchInputFocus = () => {
    setSearchFocus(!searchFocus);
  };

  const showPatientModal = (patient) => {
    setSelectedPatient(patient);
    setDisplayPatientModal(true);
  };

  const hidePatientModal = () => {
    setDisplayPatientModal(false);
  };

  const deletePatient = (patient) => {
    const data = {
      patientId: patient._id,
    };
    if (!props.user) {
      return;
    }
    props.user
      .getIdToken(true)
      .then((idToken) => {
        props
          .deleteRequestWithToken(PATIENT_URL, idToken, data)
          .then((data) => {
            setPatients(data);
            setFilteredPatients(data);
            setFilter("");
          })
          .catch((err) => console.log(err));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const showPatientCategoriesModal = () => {
    setDisplayCategoriesModal(true);
  };

  const hideCategoriesModal = () => {
    setDisplayCategoriesModal(false);
  };

  const updateCategories = (category, action) => {
    const data = {
      category: category,
      action: action,
    };
    props.user
      .getIdToken(true)
      .then((idToken) => {
        props
          .patchRequestWithToken(PATIENT_CATEGORY_URL, idToken, data)
          .then((categories) => {
            console.log(categories);
            setCategories(categories);
            props.updatePatientCategories(categories);
          })
          .catch((err) => console.log(err));
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  return (
    <>
      <PatientModal
        show={displayPatientModal}
        hide={hidePatientModal}
        patient={selectedPatient}
        updatePatient={props.savePatient}
        categories={categories}
      />
      <PatientCategoriesModal
        show={displayCategoriesModal}
        hide={hideCategoriesModal}
        categories={categories}
        updateCategories={updateCategories}
      />
      <OpenItemsBanner details={openItems} />
      <div
        className="container-fluid my-4 mx-md-5 text-right"
        style={{ maxWidth: "95vw" }}
      >
        <div className="text-right">
          <div className="d-inline-block">
            <h3 style={{ color: "#007A8C" }}>לקוחות</h3>
            <h6 className="text-secondary mb-0">{patients.length} לקוחות</h6>
          </div>
          <div className="d-inline-block float-sm-left mt-2 mt-sm-0">
            <button
              className="btn btn-purple-outline mx-2"
              onClick={() => showPatientCategoriesModal()}
            >
              שיוכים
            </button>
            <button className="btn btn-purple-outline">ייצוא</button>
            <button
              className="btn mx-2 btn-purple text-white"
              onClick={() => showPatientModal(null)}
              hidden={!props.role || !props.role.addCustomer}
            >
              הוסף לקוח
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
              placeholder="חיפוש לקוחות"
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
        <div className="d-flex justify-content-center">
          <table
            className="text-break w-100 patientsTable bg-white border"
            style={{ tableLayout: "fixed" }}
          >
            {tableContent}
          </table>
        </div>
        {pagination}
      </div>
    </>
  );
}

export default Patients;
