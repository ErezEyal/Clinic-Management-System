import "./Patients.css";

function PatientProfile(props) {
  const date = new Date(props.patient.birthDate).getDate();
  const month = new Date(props.patient.birthDate).getMonth() + 1;
  const year = new Date(props.patient.birthDate).getFullYear();
  const birthDate = `${date}/${month}/${year}`;

  const calculateAge = () => {
    const ageDifMs = Date.now() - new Date(props.patient.birthDate).getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const getGender = (gender) => {
    return gender === "male" ? "זכר" : "נקבה";
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

  return (
    <div className="d-flex flex-column h-100">
      <div className="bg-light border rounded-sm shadow-sm d-flex">
        <div
          className="mx-auto flex-shrink-1 p-2"
          style={{ maxWidth: "200px" }}
        >
          <img
            alt="patientPicture"
            src={
              props.patient.picture
                ? props.patient.picture
                : props.patient.gender === "female"
                ? "/female1.png"
                : "/male1.png"
            }
            width="100%"
            className="rounded-lg shadow border border-light"
          ></img>
        </div>
        <div className="flex-grow-1 pt-2 pr-3 text-right">
          <h3 className="">
            {props.patient.firstName + " " + props.patient.lastName}
          </h3>
          <span>{`${getGender(props.patient.gender)}, ${calculateAge()}`}</span>
          <button
            className="text-secondary btn py-0 shadow-none"
            onClick={props.editPatient}
            hidden={
              !props.role || (!props.role.admin && !props.role.updateCustomer)
            }
          >
            {editIcon}
          </button>
          <p className="text-muted mt-1 mb-0">
            <span>{props.patient.phone}</span>
          </p>
          <p className="text-muted mt-1">
            <span>{props.patient.email}</span>
          </p>
        </div>
      </div>
      <hr />
      <div className="px-4 bg-light border rounded-sm shadow-sm d-flex overflow-auto smallScrollBar">
        <div className="d-flex flex-wrap text-break">
          <div className="my-3 col-sm-6">
            <span className="d-block my-1 text-secondary">שם פרטי</span>
            <span>{props.patient.firstName || "--"}</span>
          </div>
          <div className="my-3 col-sm-6">
            <span className="d-block my-1 text-secondary">שם משפחה</span>
            <span>{props.patient.lastName || "--"}</span>
          </div>
          <div className="my-3 col-sm-6">
            <span className="d-block my-1 text-secondary">כתובת מייל</span>
            <span>{props.patient.email || "--"}</span>
          </div>
          <div className="my-3 col-sm-6">
            <span className="d-block my-1 text-secondary">עיר</span>
            <span>{props.patient.city || "--"}</span>
          </div>
          <div className="my-3 col-sm-6">
            <span className="d-block my-1 text-secondary">כתובת מגורים</span>
            <span>{props.patient.address || "--"}</span>
          </div>
          <div className="my-3 col-sm-6">
            <span className="d-block my-1 text-secondary">מספר טלפון</span>
            <span>{props.patient.phone || "--"}</span>
          </div>
          <div className="my-3 col-sm-6">
            <span className="d-block my-1 text-secondary">מספר טלפון שני</span>
            <span>{props.patient.secondPhone || "--"}</span>
          </div>
          <div className="my-3 col-sm-6">
            <span className="d-block my-1 text-secondary">תאריך לידה</span>
            <span>{birthDate}</span>
          </div>
          <div className="my-3 col-sm-6">
            <span className="d-block my-1 text-secondary">תעודת זהות</span>
            <span>{props.patient.id || "--"}</span>
          </div>
          <div className="my-3 col-sm-6" hidden={!props.patient.passport}>
            <span className="d-block my-1 text-secondary">מספר דרכון</span>
            <span>
              {(props.patient.usePassport && props.patient.passport) || "--"}
            </span>
          </div>
          <div className="my-3 col-sm-6">
            <span className="d-block my-1 text-secondary">שיוך</span>
            <span>
              {(props.patient.category && props.patient.category.join(", ")) ||
                "--"}
            </span>
          </div>
          <div className="my-3 col-sm-6">
            <span className="d-block my-1 text-secondary">פעולות</span>
            <span>
              {(props.patient.procedures &&
                props.patient.procedures.join(", ")) ||
                "--"}
            </span>
          </div>
          <div className="my-3 col-sm-6">
            <span className="d-block my-1 text-secondary">הערות</span>
            <span>{props.patient.comment || "--"}</span>
          </div>
          <div className="my-3 col-sm-6">
            <span className="d-block my-1 text-secondary">שדה1</span>
            <span>{props.patient.bool1 || "--"}</span>
          </div>
          <div className="my-3 col-sm-6">
            <span className="d-block my-1 text-secondary">שדה2</span>
            <span>{props.patient.bool2 || "--"}</span>
          </div>
          <div className="my-3 col-sm-6">
            <span className="d-block my-1 text-secondary">שדה3</span>
            <span>{props.patient.bool3 || "--"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientProfile;
