import { useState, useEffect, useRef } from "react";
import { Modal } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import DatePicker, { registerLocale } from "react-datepicker";
import he from "date-fns/locale/he";
import imageCompression from "browser-image-compression";
import ConfirmationModal from "../root/ConfirmationModal";
registerLocale("he", he);

function PatientModal(props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [secondPhone, setSecondPhone] = useState("");
  const [birthDate, setBirthDate] = useState(Date.parse(new Date()));
  const [id, setId] = useState("");
  const [passport, setPassport] = useState("");
  const [usePassport, setUsePassport] = useState(false);
  const [gender, setGender] = useState("female");
  const [picture, setPicture] = useState(null);
  const [comment, setComment] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [bool1, setBool1] = useState("לא");
  const [bool2, setBool2] = useState("לא");
  const [bool3, setBool3] = useState("לא");
  const [saveDisabled, setSaveDisabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [category, setCategory] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [minimizeCategories, setMinimizeCategories] = useState(true);
  const [minimizeProcedures, setMinimizeProcedures] = useState(true);
  const [confirmationText, setConfirmationText] = useState("");
  const [confirmationAction, setConfirmationAction] = useState("");
  const imageInputRef = useRef();
  const history = useHistory();

  useEffect(() => {
    if (props.patient) {
      setSaveDisabled(true);
      setFirstName(props.patient.firstName);
      setLastName(props.patient.lastName);
      setEmail(props.patient.email);
      setCity(props.patient.city);
      setAddress(props.patient.address);
      setBool1(props.patient.bool1);
      setBool2(props.patient.bool2);
      setBool3(props.patient.bool3);
      setPhone(props.patient.phone);
      setSecondPhone(props.patient.secondPhone);
      setBirthDate(props.patient.birthDate || Date.parse(new Date()));
      setId(props.patient.id);
      setPassport(props.patient.passport);
      setUsePassport(props.patient.usePassport);
      setGender(props.patient.gender);
      setPicture(props.patient.picture);
      setComment(props.patient.comment);
      setCategory(props.patient.category || []);
      setProcedures(props.patient.procedures || []);
    } else {
      setSaveDisabled(false);
      setFirstName("");
      setLastName("");
      setEmail("");
      setEmail("");
      setCity("");
      setBool1("לא");
      setBool2("לא");
      setBool3("לא");
      setPhone("");
      setSecondPhone("");
      setBirthDate(Date.parse(new Date()));
      setId("");
      setPassport("");
      setUsePassport(false);
      setGender("female");
      setPicture(null);
      setComment("");
      setCategory([]);
      setProcedures([]);
    }
    setErrorMessage("");
    setMinimizeCategories(true);
    setMinimizeProcedures(true);
  }, [props]);

  useEffect(() => {
    let profileChanged = false;
    if (!props.patient) {
      profileChanged = true;
    } else if (props.patient.firstName !== firstName) profileChanged = true;
    else if (props.patient.lastName !== lastName) profileChanged = true;
    else if (props.patient.email !== email) profileChanged = true;
    else if (props.patient.city !== city) profileChanged = true;
    else if (props.patient.address !== address) profileChanged = true;
    else if (props.patient.bool1 !== bool1) profileChanged = true;
    else if (props.patient.bool2 !== bool2) profileChanged = true;
    else if (props.patient.bool3 !== bool3) profileChanged = true;
    else if (props.patient.phone !== phone) profileChanged = true;
    else if (props.patient.birthDate !== birthDate) profileChanged = true;
    else if (props.patient.id !== id) profileChanged = true;
    else if (props.patient.passport !== passport) profileChanged = true;
    else if (props.patient.usePassport !== usePassport) profileChanged = true;
    else if (props.patient.gender !== gender) profileChanged = true;
    else if (props.patient.picture !== picture) profileChanged = true;
    else if (props.patient.secondPhone !== secondPhone) profileChanged = true;
    else if (props.patient.comment !== comment) profileChanged = true;
    else if (props.patient.category !== category) profileChanged = true;
    else if (props.patient.procedures !== procedures) profileChanged = true;

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
    procedures,
    passport,
    usePassport,
    picture,
    props.patient,
    city,
    address,
    bool1,
    bool2,
    bool3,
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
        city: city,
        address: address,
        phone: phone,
        secondPhone: secondPhone,
        birthDate: birthDate,
        id: id,
        passport: passport,
        usePassport: usePassport,
        gender: gender,
        picture: picture,
        comment: comment,
        category: category,
        procedures: procedures,
        bool1: bool1,
        bool2: bool2,
        bool3: bool3,
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

  const handleDelete = () => {
    props
      .deletePatient(props.patient)
      .then((result) => {
        if (result) {
          setSuccessMessage("הלקוח נמחק מהמערכת");
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
  };

  const handleImageChange = async (e) => {
    if (!e.target.files[0]) {
      setErrorMessage("בחר קובץ חדש");
      return;
    }
    const file = e.target.files[0];
    console.log(`originalFile size ${file.size / 1024 / 1024} MB`);
    if (!file || file.size > 7000000) {
      setErrorMessage("קובץ גדול מ-7 מגה בייט או לא תקין");
      return;
    }
    setErrorMessage("");

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 200,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      console.log(
        "compressedFile instanceof Blob",
        compressedFile instanceof Blob
      ); // true
      console.log(
        `compressedFile size ${compressedFile.size / 1024 / 1024} MB`
      ); // smaller than maxSizeMB

      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = () => {
        const base64data = reader.result;
        setPicture(base64data);
        setSaveDisabled(false);
      };
    } catch (error) {
      console.log(error);
    }
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

  const calculateAge = (bDate) => {
    const ageDifMs = Date.now() - new Date(bDate).getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const getGender = (gender) => {
    return gender === "male" ? "זכר" : "נקבה";
  };

  const promptConfirmation = (text, action) => {
    setConfirmationText(text);
    setConfirmationAction(() => action);
  };

  const handleHideConf = () => {
    setConfirmationText("");
    setConfirmationAction(null);
  };

  const handleChangeConfirm = () => {
    confirmationAction();
    setConfirmationAction(null);
    setConfirmationText("");
  };

  return (
    <>
      <ConfirmationModal
        hide={handleHideConf}
        text={confirmationText}
        performAction={handleChangeConfirm}
      />
      <Modal
        size="lg"
        onHide={props.hide}
        show={props.show && !confirmationText}
        className="text-right"
      >
        <div
          className="modal-content shadow-lg"
          style={{ backgroundColor: "#f4f5f7" }}
        >
          <div className="bg-white h-100 rounded-lg border p-4">
            <div className="d-flex">
              <div className="flex-shrink-1" style={{ maxWidth: "200px" }}>
                <input
                  type="file"
                  className="d-none"
                  id="imageFile"
                  onChange={handleImageChange}
                  disabled={
                    !props.role ||
                    (props.patient &&
                      !props.role.updateCustomer &&
                      !props.role.admin)
                  }
                  ref={imageInputRef}
                  accept="image/*"
                />
                <div className="mt-2">
                  <label
                    className="pointer my-0 text-muted"
                    htmlFor="imageFile"
                  >
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
                      className="rounded-lg shadow border border-light"
                    ></img>
                  </label>
                </div>
              </div>
              <div className="flex-grow-1 pr-3">
                <h3 className="mt-3" style={{ color: "#4b4b4ceb" }}>
                  {firstName + " " + lastName}
                </h3>
                <span
                  className=""
                  hidden={!firstName && !lastName}
                >{`${getGender(gender)}, ${calculateAge(birthDate)}`}</span>
                <p className="text-muted mt-1 mb-0">
                  <span>{phone}</span>
                </p>
                <p className="text-muted mt-1">
                  <span>{email}</span>
                </p>
              </div>
            </div>
            <hr />
            <div className="px-sm-4 d-flex flex-wrap">
              <div className="mb-3 mt-4 col-md-6">
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
                  disabled={
                    !props.role ||
                    (props.patient &&
                      !props.role.updateCustomer &&
                      !props.role.admin)
                  }
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="patientModalInput"
                ></input>
              </div>
              <div className="my-3 col-md-6">
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
                  disabled={
                    !props.role ||
                    (props.patient &&
                      !props.role.updateCustomer &&
                      !props.role.admin)
                  }
                  onChange={(e) => setLastName(e.target.value)}
                  className="patientModalInput"
                ></input>
              </div>
              <div className="my-3 col-md-6">
                <div className="">
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
                  disabled={
                    !props.role ||
                    (props.patient &&
                      !props.role.updateCustomer &&
                      !props.role.admin)
                  }
                  onChange={(e) => setEmail(e.target.value)}
                  className="patientModalInput"
                ></input>
              </div>

              <div className="my-3 col-md-6">
                <div className="">
                  <span className="my-1 text-secondary ml-2">עיר</span>
                  <span
                    className={
                      !props.patient || city === props.patient.city
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
                  value={city}
                  disabled={
                    !props.role ||
                    (props.patient &&
                      !props.role.updateCustomer &&
                      !props.role.admin)
                  }
                  onChange={(e) => setCity(e.target.value)}
                  className="patientModalInput"
                ></input>
              </div>

              <div className="my-3 col-md-6">
                <div className="">
                  <span className="my-1 text-secondary ml-2">כתובת מגורים</span>
                  <span
                    className={
                      !props.patient || address === props.patient.address
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
                  value={address}
                  disabled={
                    !props.role ||
                    (props.patient &&
                      !props.role.updateCustomer &&
                      !props.role.admin)
                  }
                  onChange={(e) => setAddress(e.target.value)}
                  className="patientModalInput"
                ></input>
              </div>

              <div className="my-3 col-md-6">
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
                  disabled={
                    !props.role ||
                    (props.patient &&
                      !props.role.updateCustomer &&
                      !props.role.admin)
                  }
                  className="patientModalInput"
                ></input>
              </div>
              <div className="my-3 col-md-6">
                <div>
                  <span className="my-1 text-secondary ml-2">
                    מספר טלפון שני
                  </span>
                  <span
                    className={
                      !props.patient ||
                      secondPhone === props.patient.secondPhone
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
                  disabled={
                    !props.role ||
                    (props.patient &&
                      !props.role.updateCustomer &&
                      !props.role.admin)
                  }
                  className="patientModalInput"
                ></input>
              </div>
              <div className="my-3 col-md-6">
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
                    disabled={
                      !props.role ||
                      (props.patient &&
                        !props.role.updateCustomer &&
                        !props.role.admin)
                    }
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
              <div className="my-3 col-md-6">
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
                  disabled={
                    !props.role ||
                    (props.patient &&
                      !props.role.updateCustomer &&
                      !props.role.admin)
                  }
                  onChange={(e) => setId(e.target.value)}
                  className="patientModalInput"
                ></input>
              </div>

              <div className="my-3 col-md-6">
                <div>
                  <span className="my-1 text-secondary ml-2">מספר דרכון</span>
                  <div className="d-inline ml-2">
                    <input
                      type="checkbox"
                      disabled={
                        !props.role ||
                        (props.patient &&
                          !props.role.updateCustomer &&
                          !props.role.admin)
                      }
                      onChange={(e) => setUsePassport(e.target.checked)}
                      checked={usePassport}
                    />
                  </div>
                  <span
                    className={
                      !props.patient ||
                      (!props.patient.usePassport && !usePassport) ||
                      (passport === props.patient.passport &&
                        usePassport === props.patient.usePassport)
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
                  value={usePassport ? passport : ""}
                  disabled={
                    !props.role ||
                    (props.patient &&
                      !props.role.updateCustomer &&
                      !props.role.admin)
                  }
                  onChange={(e) => {
                    if (usePassport) {
                      setPassport(e.target.value);
                    }
                  }}
                  className="patientModalInput"
                ></input>
              </div>

              <div className="my-3 col-md-6">
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
                    disabled={
                      !props.role ||
                      (props.patient &&
                        !props.role.updateCustomer &&
                        !props.role.admin)
                    }
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
                    disabled={
                      !props.role ||
                      (props.patient &&
                        !props.role.updateCustomer &&
                        !props.role.admin)
                    }
                    value="female"
                    checked={gender === "female"}
                    onChange={(e) => setGender(e.target.value)}
                  />
                </div>
              </div>

              <div className="my-3 col-md-6">
                <div>
                  <span className="my-1 text-secondary ml-2">שדה1</span>
                  <span
                    className={
                      !props.patient || bool1 === props.patient.bool1
                        ? "d-none"
                        : ""
                    }
                  >
                    {exclamation}
                  </span>
                </div>

                <div className="form-check form-check-inline mr-0">
                  <label className="form-check-label" htmlFor="yesBool1">
                    כן
                  </label>
                  <input
                    className="form-check-input"
                    type="radio"
                    id="yesBool1"
                    value="כן"
                    disabled={
                      !props.role ||
                      (props.patient &&
                        !props.role.updateCustomer &&
                        !props.role.admin)
                    }
                    checked={bool1 === "כן"}
                    onChange={(e) => setBool1(e.target.value)}
                  />
                </div>
                <div className="form-check form-check-inline">
                  <label className="form-check-label" htmlFor="noBool1">
                    לא
                  </label>
                  <input
                    className="form-check-input"
                    type="radio"
                    id="noBool1"
                    disabled={
                      !props.role ||
                      (props.patient &&
                        !props.role.updateCustomer &&
                        !props.role.admin)
                    }
                    value="לא"
                    checked={bool1 === "לא"}
                    onChange={(e) => setBool1(e.target.value)}
                  />
                </div>
              </div>

              <div className="my-3 col-md-6">
                <div>
                  <span className="my-1 text-secondary ml-2">שדה2</span>
                  <span
                    className={
                      !props.patient || bool2 === props.patient.bool2
                        ? "d-none"
                        : ""
                    }
                  >
                    {exclamation}
                  </span>
                </div>

                <div className="form-check form-check-inline mr-0">
                  <label className="form-check-label" htmlFor="yesBool2">
                    כן
                  </label>
                  <input
                    className="form-check-input"
                    type="radio"
                    id="yesBool2"
                    value="כן"
                    disabled={
                      !props.role ||
                      (props.patient &&
                        !props.role.updateCustomer &&
                        !props.role.admin)
                    }
                    checked={bool2 === "כן"}
                    onChange={(e) => setBool2(e.target.value)}
                  />
                </div>
                <div className="form-check form-check-inline">
                  <label className="form-check-label" htmlFor="noBool2">
                    לא
                  </label>
                  <input
                    className="form-check-input"
                    type="radio"
                    id="noBool2"
                    disabled={
                      !props.role ||
                      (props.patient &&
                        !props.role.updateCustomer &&
                        !props.role.admin)
                    }
                    value="לא"
                    checked={bool2 === "לא"}
                    onChange={(e) => setBool2(e.target.value)}
                  />
                </div>
              </div>

              <div className="my-3 col-md-6">
                <div>
                  <span className="my-1 text-secondary ml-2">שדה3</span>
                  <span
                    className={
                      !props.patient || bool3 === props.patient.bool3
                        ? "d-none"
                        : ""
                    }
                  >
                    {exclamation}
                  </span>
                </div>

                <div className="form-check form-check-inline mr-0">
                  <label className="form-check-label" htmlFor="yesBool3">
                    כן
                  </label>
                  <input
                    className="form-check-input"
                    type="radio"
                    id="yesBool3"
                    value="כן"
                    disabled={
                      !props.role ||
                      (props.patient &&
                        !props.role.updateCustomer &&
                        !props.role.admin)
                    }
                    checked={bool3 === "כן"}
                    onChange={(e) => setBool3(e.target.value)}
                  />
                </div>
                <div className="form-check form-check-inline">
                  <label className="form-check-label" htmlFor="noBool3">
                    לא
                  </label>
                  <input
                    className="form-check-input"
                    type="radio"
                    id="noBool3"
                    disabled={
                      !props.role ||
                      (props.patient &&
                        !props.role.updateCustomer &&
                        !props.role.admin)
                    }
                    value="לא"
                    checked={bool3 === "לא"}
                    onChange={(e) => setBool3(e.target.value)}
                  />
                </div>
              </div>

              <div className="my-3 col-md-6">
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
                  disabled={
                    !props.role ||
                    (props.patient &&
                      !props.role.updateCustomer &&
                      !props.role.admin)
                  }
                  onChange={(e) => setComment(e.target.value)}
                  className="patientModalInput"
                ></input>
              </div>
              <div className="my-3 col-md-6">
                <div>
                  <span className="my-1 text-secondary ml-3">שיוך</span>
                  <button
                    className="btn p-0 shadow-none fontSmall"
                    onClick={() => setMinimizeCategories(!minimizeCategories)}
                  >
                    <span className="text-secondary">
                      {minimizeCategories ? "הצג" : "הסתר"}
                    </span>
                  </button>
                </div>
                <div className="d-flex flex-wrap">
                  {category &&
                    props.categories.map((cat) => {
                      return (
                        <div
                          className="pl-3 py-1"
                          hidden={minimizeCategories && !category.includes(cat)}
                        >
                          <input
                            type="checkbox"
                            onChange={(e) =>
                              handleCategoryChange(cat, e.target.checked)
                            }
                            disabled={
                              !props.role ||
                              (props.patient &&
                                !props.role.updateCustomer &&
                                !props.role.admin)
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
                          <div
                            className="pl-3 py-1"
                            hidden={
                              minimizeCategories && !category.includes(cat)
                            }
                          >
                            <input
                              type="checkbox"
                              onChange={(e) =>
                                handleCategoryChange(cat, e.target.checked)
                              }
                              disabled={
                                !props.role ||
                                (props.patient &&
                                  !props.role.updateCustomer &&
                                  !props.role.admin)
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

              <div className="my-3 col-md-6">
                <div>
                  <span className="my-1 text-secondary ml-2">פעולות</span>
                </div>
                <p title={procedures.join(", ")}>{procedures.join(", ")}</p>
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
                hidden={
                  !props.role ||
                  (props.patient &&
                    !props.role.updateCustomer &&
                    !props.role.admin)
                }
                onClick={saveChanges}
              >
                {props.patient ? "עדכן פרטים" : "הוסף לקוח"}
              </button>

              <div className="d-inline">
                <button
                  className="btn btn-outline-danger mr-2"
                  hidden={
                    !props.role ||
                    !props.deletePatient ||
                    !props.patient ||
                    (!props.role.deleteCustomer && !props.role.admin)
                  }
                  // data-toggle="dropdown"
                  onClick={() =>
                      promptConfirmation(
                        `האם אתה בטוח שברצונך להסיר את ${props.patient.firstName} ${props.patient.lastName}?`,
                        handleDelete
                      )
                    }
                >
                  <span>הסר לקוח</span>
                </button>
                <div className="dropdown-menu" style={{ minWidth: "0" }}>
                  <button
                    className="dropdown-item text-center"
                    // onClick={handleDelete}
                    onClick={() =>
                      promptConfirmation(
                        `האם אתה בטוח שברצונך להסיר את ${props.patient.firstName} ${props.patient.lastName}?`,
                        handleDelete
                      )
                    }
                  >
                    <span className="font-weight-bold text-danger">הסר</span>
                  </button>
                </div>
              </div>

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
    </>
  );
}

export default PatientModal;
