import { useState, useEffect, useRef } from "react";
import { Modal } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import DatePicker, { registerLocale } from "react-datepicker";
import he from "date-fns/locale/he";
registerLocale("he", he);

function PatientModal(props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [secondPhone, setSecondPhone] = useState("");
  const [birthDate, setBirthDate] = useState(Date.parse(new Date()));
  const [id, setId] = useState("");
  const [gender, setGender] = useState("female");
  const [picture, setPicture] = useState(null);
  const [comment, setComment] = useState("");
  const [saveDisabled, setSaveDisabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [category, setCategory] = useState([]);
  const imageInputRef = useRef();
  const history = useHistory();

  useEffect(() => {
    if (props.patient) {
      setSaveDisabled(true);
      setFirstName(props.patient.firstName);
      setLastName(props.patient.lastName);
      setEmail(props.patient.email);
      setPhone(props.patient.phone);
      setSecondPhone(props.patient.secondPhone);
      setBirthDate(props.patient.birthDate || Date.parse(new Date()));
      setId(props.patient.id);
      setGender(props.patient.gender);
      setPicture(props.patient.picture);
      setComment(props.patient.comment);
      setCategory(props.patient.category || []);
    } else {
      setSaveDisabled(false);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setSecondPhone("");
      setBirthDate(Date.parse(new Date()));
      setId("");
      setGender("female");
      setPicture(null);
      setComment("");
      setCategory([]);
    }
    setErrorMessage("")
  }, [props]);

  useEffect(() => {
    let profileChanged = false;
    if (!props.patient) {
      profileChanged = true;
    } else if (props.patient.firstName !== firstName) profileChanged = true;
    else if (props.patient.lastName !== lastName) profileChanged = true;
    else if (props.patient.email !== email) profileChanged = true;
    else if (props.patient.phone !== phone) profileChanged = true;
    else if (props.patient.birthDate !== birthDate) profileChanged = true;
    else if (props.patient.id !== id) profileChanged = true;
    else if (props.patient.gender !== gender) profileChanged = true;
    else if (props.patient.picture !== picture) profileChanged = true;
    else if (props.patient.secondPhone !== secondPhone) profileChanged = true;
    else if (props.patient.comment !== comment) profileChanged = true;
    else if (props.patient.category !== category) profileChanged = true;

    if (profileChanged) {
      setSaveDisabled(false);
    } else {
      setSaveDisabled(true);
    }
  }, [
    firstName,
    lastName,
    email,
    phone,
    birthDate,
    id,
    gender,
    secondPhone,
    comment,
    category,
  ]);

  const exclamation = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className="bi bi-exclamation-triangle text-danger"
      viewBox="0 0 16 16"
    >
      <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z" />
      <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z" />
    </svg>
  );

  const saveChanges = () => {
    if (!firstName) setErrorMessage("הכנס שם פרטי");
    else if (!lastName) setErrorMessage("הכנס שם משפחה");
    else if (!phone) setErrorMessage("הכנס מספר טלפון");
    else if (!category.length) setErrorMessage("בחר שיוך");
    else {
      setErrorMessage("");
      const newPatientObject = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        secondPhone: secondPhone,
        birthDate: birthDate,
        id: id,
        gender: gender,
        picture: picture,
        comment: comment,
        category: category,
      };
      if (props.patient) {
        newPatientObject._id = props.patient._id;
      }
      setSaveDisabled(true);
      props
        .updatePatient(newPatientObject)
        .then((result) => {
          if (result) {
            console.log("result", result);
            setSuccessMessage("הפרטים נשמרו בהצלחה...");
            setTimeout(() => {
              history.push("/");
            }, 1000);
          } else {
            console.log(result);
            setErrorMessage("הפעולה נכשלה");
          }
        })
        .catch((error) => {
          setErrorMessage("הפעולה נכשלה");
        });
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file || file.size > 1000000) {
      setErrorMessage("קובץ גדול מידי או לא תקין");
      return;
    }
    setErrorMessage("");
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log(e.target.result);
      setPicture(e.target.result);
      setSaveDisabled(false);
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  const handleCategoryChange = (cat, checked) => {
    if (checked && !category.includes(cat)) {
      const tempCategory = [...category];
      tempCategory.push(cat);
      setCategory(tempCategory);
    } else if (!checked && category.includes(cat)) {
      const tempCategory = [...category];
      tempCategory.splice(category.indexOf(cat), 1);
      setCategory(tempCategory);
    }
  };

  return (
    <Modal
      size="lg"
      onHide={props.hide}
      show={props.show}
      className="text-right"
    >
      <div
        className="modal-content shadow-lg"
        style={{ backgroundColor: "#f4f5f7" }}
      >
        <div className="bg-white h-100 rounded-lg border p-4">
          <div className="text-center">
            <input
              type="file"
              className="d-none"
              id="imageFile"
              onChange={handleImageChange}
              ref={imageInputRef}
            />
            <div className="mx-auto mt-2" style={{ width: "8rem" }}>
              <label className="pointer my-0 text-muted" htmlFor="imageFile">
                <img
                  alt="patient"
                  src={
                    picture
                      ? picture
                      : gender === "female"
                      ? "/female1.png"
                      : "/male1.png"
                  }
                  width="100%"
                  className="mx-auto d-block my-0 rounded-circle"
                ></img>
              </label>
            </div>
            <h3 className="mt-2 mb-0" style={{ color: "#4b4b4ceb" }}>
              {firstName + " " + lastName}
            </h3>
            <hr />
          </div>
          <div className="px-4">
            <div className="mb-3 mt-4">
              <div>
                <span className="my-1 text-secondary ml-2">שם פרטי</span>
                <span
                  className={
                    !props.patient || firstName === props.patient.firstName
                      ? "d-none"
                      : ""
                  }
                >
                  {exclamation}
                </span>
              </div>
              <input
                type="text"
                placeholder="--"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="patientModalInput"
              ></input>
            </div>
            <div className="my-3">
              <div>
                <span className="my-1 text-secondary ml-2">שם משפחה</span>
                <span
                  className={
                    !props.patient || lastName === props.patient.lastName
                      ? "d-none"
                      : ""
                  }
                >
                  {exclamation}
                </span>
              </div>
              <input
                type="text"
                placeholder="--"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="patientModalInput"
              ></input>
            </div>
            <div className="my-3">
              <div>
                <span className="my-1 text-secondary ml-2">כתובת מייל</span>
                <span
                  className={
                    !props.patient || email === props.patient.email
                      ? "d-none"
                      : ""
                  }
                >
                  {exclamation}
                </span>
              </div>
              <input
                type="text"
                placeholder="--"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="patientModalInput"
              ></input>
            </div>
            <div className="my-3">
              <div>
                <span className="my-1 text-secondary ml-2">מספר טלפון</span>
                <span
                  className={
                    !props.patient || phone === props.patient.phone
                      ? "d-none"
                      : ""
                  }
                >
                  {exclamation}
                </span>
              </div>
              <input
                type="text"
                placeholder="--"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="patientModalInput"
              ></input>
            </div>
            <div className="my-3">
              <div>
                <span className="my-1 text-secondary ml-2">מספר טלפון שני</span>
                <span
                  className={
                    !props.patient || secondPhone === props.patient.secondPhone
                      ? "d-none"
                      : ""
                  }
                >
                  {exclamation}
                </span>
              </div>
              <input
                type="text"
                placeholder="--"
                value={secondPhone}
                onChange={(e) => setSecondPhone(e.target.value)}
                className="patientModalInput"
              ></input>
            </div>
            <div className="my-3">
              <div>
                <span className="my-1 text-secondary ml-2">תאריך לידה</span>
                <span
                  className={
                    !props.patient || birthDate === props.patient.birthDate
                      ? "d-none"
                      : ""
                  }
                >
                  {exclamation}
                </span>
              </div>
              <div>
                <DatePicker
                  selected={new Date(birthDate)}
                  onChange={(newDate) => setBirthDate(Date.parse(newDate))}
                  locale="he"
                  dateFormat="dd/MM/yyyy"
                  popperModifiers={{
                    preventOverflow: {
                      enabled: true,
                      escapeWithReference: false,
                      boundariesElement: "viewport",
                    },
                  }}
                  className="text-right patientModalInput"
                />
              </div>
            </div>
            <div className="my-3">
              <div>
                <span className="my-1 text-secondary ml-2">תעודת זהות</span>
                <span
                  className={
                    !props.patient || id === props.patient.id ? "d-none" : ""
                  }
                >
                  {exclamation}
                </span>
              </div>
              <input
                type="text"
                placeholder="--"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="patientModalInput"
              ></input>
            </div>
            <div className="my-3">
              <div>
                <span className="my-1 text-secondary ml-2">מין</span>
                <span
                  className={
                    !props.patient || gender === props.patient.gender
                      ? "d-none"
                      : ""
                  }
                >
                  {exclamation}
                </span>
              </div>

              <div className="form-check form-check-inline mr-0">
                <label className="form-check-label" htmlFor="male">
                  זכר
                </label>
                <input
                  className="form-check-input"
                  type="radio"
                  name="gender"
                  id="male"
                  value="male"
                  checked={gender === "male"}
                  onChange={(e) => setGender(e.target.value)}
                />
              </div>
              <div className="form-check form-check-inline">
                <label className="form-check-label" htmlFor="female">
                  נקבה
                </label>
                <input
                  className="form-check-input"
                  type="radio"
                  name="gender"
                  id="female"
                  value="female"
                  checked={gender === "female"}
                  onChange={(e) => setGender(e.target.value)}
                />
              </div>

              <input
                hidden
                type="text"
                placeholder="--"
                value={id}
                onChange={(e) => setGender(e.target.value)}
                className="patientModalInput"
              ></input>
            </div>
            <div className="my-3">
              <div>
                <span className="my-1 text-secondary ml-2">הערות</span>
                <span
                  className={
                    !props.patient || comment === props.patient.comment
                      ? "d-none"
                      : ""
                  }
                >
                  {exclamation}
                </span>
              </div>
              <input
                type="text"
                placeholder="--"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="patientModalInput"
              ></input>
            </div>
            <div className="my-3">
              <div>
                <span className="my-1 text-secondary ml-2">שיוך</span>
              </div>
              <div className="d-flex flex-wrap">
                {category &&
                  props.categories.map((cat) => {
                    return (
                      <div className="pl-3 py-1">
                        <input
                          type="checkbox"
                          onChange={(e) =>
                            handleCategoryChange(cat, e.target.checked)
                          }
                          checked={category.includes(cat)}
                        />
                        <label className="mr-2">{cat}</label>
                      </div>
                    );
                  })}
                {props.patient &&
                  props.patient.category &&
                  props.patient.category.flatMap((cat) => {
                    if (!props.categories.includes(cat)) {
                      return [
                        <div className="pl-3 py-1">
                          <input
                            type="checkbox"
                            onChange={(e) =>
                              handleCategoryChange(cat, e.target.checked)
                            }
                            checked={category.includes(cat)}
                          />
                          <label className="mr-2">{cat}</label>
                        </div>,
                      ];
                    } else {
                      return [];
                    }
                  })}
              </div>
            </div>
          </div>
          <div className="text-center my-2">
            <span className="text-success">{successMessage}</span>
            <span className="text-danger">{errorMessage}</span>
          </div>
          <hr />
          <div className="m-3 mt-4">
            <button
              disabled={saveDisabled}
              className="btn btn-outline-primary"
              onClick={saveChanges}
            >
              {props.patient ? "עדכן פרטים" : "הוסף לקוח"}
            </button>
            <button
              className="btn btn-outline-secondary float-left"
              onClick={props.hide}
            >
              סגור
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default PatientModal;
