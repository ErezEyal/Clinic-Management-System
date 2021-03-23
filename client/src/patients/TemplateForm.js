import { useEffect, useState } from "react";
import DocFieldsModal from "./DocFieldsModal";

function TemplateForm(props) {
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFieldsModal, setShowFieldsModal] = useState(false);
  const [customFields, setCustomFields] = useState([
    "שדה 1",
    "שדה 2",
    "שדה 3",
    "שדה 4",
  ]);
  const CUSTOM_DOC_FIELDS_URL =
    process.env.REACT_APP_BASE_API_URL + "doc-fields";

  useEffect((fields) => {
    props.user
      .getIdToken(true)
      .then(async (idToken) => {
        props
          .postRequestWithToken(CUSTOM_DOC_FIELDS_URL, idToken)
          .then((fields) => {
            if (fields && fields.length && fields.length === 4) {
              setCustomFields(fields);
            }
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const calculateAge = () => {
    const ageDifMs = Date.now() - new Date(props.patient.birthDate).getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const birthDateString = () => {
    const date = new Date(props.patient.birthDate).getDate();
    const month = new Date(props.patient.birthDate).getMonth() + 1;
    const year = new Date(props.patient.birthDate).getFullYear();
    return `${date}/${month}/${year}`;
  };

  const currentDateString = () => {
    const dateObject = new Date();
    const date = dateObject.getDate();
    const month = dateObject.getMonth() + 1;
    const year = dateObject.getFullYear();
    return `${date}/${month}/${year}`;
  };

  const handleDocCreation = (event) => {
    event.preventDefault();
    setIsError(false);
    setIsSuccess(false);
    setIsLoading(true);

    const formFields = {
      name: event.target.patientName.value,
      id: event.target.patientId.value,
      age: event.target.patientAge.value,
      testDate: event.target.testDate.value,
      birthDate: event.target.patientBirthDate.value,
      gender: event.target.patientGender.value,
      currentDate: event.target.currentDate.value,
      email: event.target.currentDate.email,
      phone: event.target.currentDate.phone,
      secondPhone: event.target.currentDate.secondPhone,
      city: event.target.currentDate.city,
      address: event.target.currentDate.address,
      fieldA: event.target.fieldA.value,
      fieldB: event.target.fieldB.value,
      fieldC: event.target.fieldC.value,
      fieldD: event.target.fieldD.value,
    };
    // console.log(props.template);
    props.createDoc(formFields).then((result) => {
      setIsLoading(false);
      if (!result) {
        setIsSuccess(false);
        setIsError(true);
        console.log("result", result);
      } else {
        console.log("result", result);
        setIsError(false);
        setIsSuccess(true);
      }
    });
  };

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

  const handleHideFieldsModal = () => {
    setShowFieldsModal(false);
  };

  const handleFieldsChange = (fields) => {
    const data = {
      fields: fields,
    };
    props.user
      .getIdToken(true)
      .then(async (idToken) => {
        props
          .patchRequestWithToken(CUSTOM_DOC_FIELDS_URL, idToken, data)
          .then((fields) => {
            if (fields && fields.length && fields.length === 4) {
              setCustomFields(fields);
            }
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <>
      <DocFieldsModal
        show={showFieldsModal}
        hide={handleHideFieldsModal}
        customFields={customFields}
        save={handleFieldsChange}
      />
      <form className="d-inline" onSubmit={handleDocCreation}>
        <input
          className="btn btn-purple text-white mx-2 mx-md-4 my-2 my-md-0"
          type="submit"
          value="צור מסמך"
        />
        <button
          type="button"
          className="btn shadow-none"
          onClick={() => setShowFieldsModal(true)}
        >
          {editIcon}
        </button>
        <a
          href={props.sharedLink}
          target="_blank"
          rel="noreferrer"
          className="m-2 text-success text-decoration-none pointer"
          hidden={!isSuccess}
        >
          נוצר מסמך חדש
        </a>
        <span className="m-2 text-danger" hidden={!isError}>
          הפעולה נכשלה
        </span>
        <div class="spinner-border text-info" hidden={!isLoading} role="status">
          <span class="sr-only">Loading...</span>
        </div>
        <div className="d-flex my-3 flex-wrap">
          <div className="p-3">
            <label className="normalLabelWidth d-block d-md-inline-block ml-3">
              שם מטופל
            </label>
            <div className="normalInputSize d-inline-block">
              <input
                name="patientName"
                type="text"
                className="form-control"
                defaultValue={`${props.patient.firstName} ${props.patient.lastName}`}
              />
            </div>
          </div>
          <div className="p-3 ">
            <label className="normalLabelWidth d-block d-md-inline-block ml-3">
              תעודת זהות
            </label>
            <div className="normalInputSize d-inline-block">
              <input
                name="patientId"
                type="text"
                className="form-control"
                defaultValue={props.patient.id}
              />
            </div>
          </div>
          <div className="p-3 ">
            <label className="normalLabelWidth d-block d-md-inline-block ml-3">
              גיל
            </label>
            <div className="normalInputSize d-inline-block">
              <input
                name="patientAge"
                type="text"
                className="form-control"
                defaultValue={calculateAge()}
              />
            </div>
          </div>
          <div className="p-3 ">
            <label className="normalLabelWidth d-block d-md-inline-block ml-3">
              תאריך בדיקה
            </label>
            <div className="normalInputSize d-inline-block">
              <input
                name="testDate"
                type="text"
                className="form-control"
                defaultValue={currentDateString()}
              />
            </div>
          </div>
          <div className="p-3 ">
            <label className="normalLabelWidth d-block d-md-inline-block ml-3">
              תאריך לידה
            </label>
            <div className="normalInputSize d-inline-block">
              <input
                name="patientBirthDate"
                type="text"
                className="form-control"
                defaultValue={birthDateString()}
              />
            </div>
          </div>
          <div className="p-3 ">
            <label className="normalLabelWidth d-block d-md-inline-block ml-3">
              מין
            </label>
            <div className="normalInputSize d-inline-block">
              <input
                name="patientGender"
                type="text"
                className="form-control"
                defaultValue={props.patient.gender === "male" ? "זכר" : "נקבה"}
              />
            </div>
          </div>
          <div className="p-3 ">
            <label className="normalLabelWidth d-block d-md-inline-block ml-3">
              תאריך
            </label>
            <div className="normalInputSize d-inline-block">
              <input
                name="currentDate"
                type="text"
                className="form-control"
                defaultValue={currentDateString()}
              />
            </div>
          </div>
          <div className="p-3 ">
            <label className="normalLabelWidth d-block d-md-inline-block ml-3">
              כתובת מייל
            </label>
            <div className="normalInputSize d-inline-block">
              <input
                name="email"
                type="text"
                className="form-control"
                defaultValue={props.patient.email}
              />
            </div>
          </div>
          <div className="p-3 ">
            <label className="normalLabelWidth d-block d-md-inline-block ml-3">
              מספר טלפון
            </label>
            <div className="normalInputSize d-inline-block">
              <input
                name="phone"
                type="text"
                className="form-control"
                defaultValue={props.patient.phone}
              />
            </div>
          </div>
          <div className="p-3 ">
            <label className="normalLabelWidth d-block d-md-inline-block ml-3">
              עיר
            </label>
            <div className="normalInputSize d-inline-block">
              <input
                name="city"
                type="text"
                className="form-control"
                defaultValue={props.patient.city}
              />
            </div>
          </div>
          <div className="p-3 ">
            <label className="normalLabelWidth d-block d-md-inline-block ml-3">
              כתובת מגורים
            </label>
            <div className="normalInputSize d-inline-block">
              <input
                name="address"
                type="text"
                className="form-control"
                defaultValue={props.patient.address}
              />
            </div>
          </div>
          <div className="p-3 ">
            <label className="normalLabelWidth d-block d-md-inline-block ml-3">
              מספר טלפון שני
            </label>
            <div className="normalInputSize d-inline-block">
              <input
                name="secondPhone"
                type="text"
                className="form-control"
                defaultValue={props.patient.secondPhone}
              />
            </div>
          </div>
          <div className="col-12 px-4">
            <hr />
          </div>
          <div className="d-flex">
            <div className="p-3">
              <label className="ml-3 align-top" title="fieldA">
                {customFields[0]}
              </label>
              <div className="d-inline-block">
                <textArea
                  name="fieldA"
                  style={{ resize: "both" }}
                  className="form-control"
                ></textArea>
              </div>
            </div>
            <div className="p-3">
              <label className="ml-3 align-top" title="fieldB">
                {customFields[1]}
              </label>
              <div className="d-inline-block">
                <textArea
                  name="fieldB"
                  style={{ resize: "both" }}
                  className="form-control"
                ></textArea>
              </div>
            </div>
            <div className="p-3">
              <label className="ml-3 align-top" title="fieldC">
                {customFields[2]}
              </label>
              <div className="d-inline-block">
                <textArea
                  name="fieldC"
                  style={{ resize: "both" }}
                  className="form-control"
                ></textArea>
              </div>
            </div>
            <div className="p-3">
              <label className="ml-3 align-top" title="fieldD">
                {customFields[3]}
              </label>
              <div className="d-inline-block">
                <textArea
                  name="fieldD"
                  style={{ resize: "both" }}
                  className="form-control"
                ></textArea>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}

export default TemplateForm;
