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
    return (gender === "male" ? "זכר" : "נקבה");
  };

  return (
    <div className="bg-white rounded-lg">
      <div className="my-3 text-center">
        <div className="mx-auto" style={{ width: "25%" }}>
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
            className="mx-auto d-block my-4 rounded-circle"
          ></img>
        </div>
        <h3 className="mb-0">
          {props.patient.firstName + " " + props.patient.lastName}
          <span className="mr-2">{`(${getGender(props.patient.gender)}, ${calculateAge()})`}</span>
        </h3>
        <button
          className="text-secondary btn py-0 shadow-none"
          onClick={props.editPatient}
        >
          עריכה
        </button>
        <hr />
      </div>
      <div className="px-4">
        <div className="mb-3 mt-4">
          <span className="d-block my-1 text-secondary">שם פרטי</span>
          <span>{props.patient.firstName || "--"}</span>
        </div>
        <div className="my-3">
          <span className="d-block my-1 text-secondary">שם משפחה</span>
          <span>{props.patient.lastName || "--"}</span>
        </div>
        <div className="my-3">
          <span className="d-block my-1 text-secondary">כתובת מייל</span>
          <span>{props.patient.email || "--"}</span>
        </div>
        <div className="my-3">
          <span className="d-block my-1 text-secondary">מספר טלפון</span>
          <span>{props.patient.phone || "--"}</span>
        </div>
        <div className="my-3">
          <span className="d-block my-1 text-secondary">מספר טלפון שני</span>
          <span>{props.patient.secondPhone || "--"}</span>
        </div>
        <div className="my-3">
          <span className="d-block my-1 text-secondary">תאריך לידה</span>
          <span>{birthDate}</span>
        </div>
        <div className="my-3">
          <span className="d-block my-1 text-secondary">תעודת זהות</span>
          <span>{props.patient.id || "--"}</span>
        </div>
        <div className="my-3">
          <span className="d-block my-1 text-secondary">שיוך</span>
          <span>{props.patient.category || "--"}</span>
        </div>
        <div className="my-3">
          <span className="d-block my-1 text-secondary">הערות</span>
          <span>{props.patient.comment || "--"}</span>
        </div>
      </div>
    </div>
  );
}

export default PatientProfile;
