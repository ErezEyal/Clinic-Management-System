import { useState } from "react";

function TemplateForm(props) {
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const boxChecked = (bool) => {
    return bool ? "☒" : "☐";
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
    //   field1: event.target.field1.value,
    //   field2: event.target.field2.value,
    //   field3: event.target.field3.value,
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

  return (
    <>
      <form className="d-inline" onSubmit={handleDocCreation}>
        <input
          className="btn btn-purple text-white mx-2 mx-md-4 my-2 my-md-0"
          type="submit"
          value="צור מסמך"
        />
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
          {/* <div className="col-12 px-4">
            <hr />
          </div>
          <div className="p-3 ">
            <label className="normalLabelWidth d-block d-md-inline-block ml-3">
              שדה1
            </label>
            <div className="normalInputSize d-inline-block">
              <input name="field1" type="text" className="form-control" />
            </div>
          </div>
          <div className="p-3 ">
            <label className="normalLabelWidth d-block d-md-inline-block ml-3">
              שדה2
            </label>
            <div className="normalInputSize d-inline-block">
              <input name="field2" type="text" className="form-control" />
            </div>
          </div>
          <div className="p-3 ">
            <label className="normalLabelWidth d-block d-md-inline-block ml-3">
              שדה3
            </label>
            <div className="normalInputSize d-inline-block">
              <input name="field3" type="text" className="form-control" />
            </div>
          </div> */}
        </div>
      </form>
    </>
  );
}

export default TemplateForm;
