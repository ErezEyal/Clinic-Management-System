import { useEffect, useRef, useState } from "react";
import { Form, Modal } from "react-bootstrap";
import imageCompression from "browser-image-compression";

function UserModal(props) {
  const [field, setField] = useState("role");
  const [updatedFieldValue, setUpdatedFieldValue] = useState("");
  const updatedFieldeRef = useRef();
  const [mfa, setMfa] = useState(false);
  const [role, setRole] = useState("");
  const [result, setResult] = useState("");
  const [photo, setPhoto] = useState(null);
  // const [saveDisabled, setSaveDisabled] = useState(true);

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

  useEffect(() => {
    setResult("");
    setMfa(props.user.mfa || false);
    setRole(props.user.role || "");
    setField("role");
    setUpdatedFieldValue(props.user.name || "");
    setResult("")
    setPhoto(props.user.photo);
  }, [props]);

  useEffect(() => {
    if (updatedFieldeRef.current) {
      switch (field) {
        case "name":
          setUpdatedFieldValue(props.user.name);
          break;
        case "phone":
          if (!props.user.phoneNumber) {
            setUpdatedFieldValue("");
          } else {
            setUpdatedFieldValue(props.user.phoneNumber.replace("+972", "0"));
          }
          break;
        case "email":
          setUpdatedFieldValue(props.user.email);
          break;
      }
    }
  }, [field]);

  const handleFieldValueChange = (e) => {
    setUpdatedFieldValue(e.target.value);
  };

  const handleSave = async () => {
    let result = false;
    switch (field) {
      case "name":
        result = await props.updateUser(props.user.uid, {
          displayName: updatedFieldValue,
        });
        console.log(result);
        break;
      case "phone":
        result = await props.updateUser(props.user.uid, {
          phoneNumber: updatedFieldValue.replace("0", "+972"),
          multiFactor: props.user.mfa
            ? {
                enrolledFactors: [
                  {
                    phoneNumber: updatedFieldValue.replace("0", "+972"),
                    displayName: "main phone",
                    factorId: "phone",
                    uid: props.user.uid,
                  },
                ],
              }
            : null,
        });
        break;
      case "email":
        result = await props.updateUser(props.user.uid, {
          email: updatedFieldValue,
        });
        break;
      case "2fa":
        if (mfa) {
          result = await props.updateUser(props.user.uid, {
            multiFactor: {
              enrolledFactors: [
                {
                  phoneNumber: props.user.phoneNumber,
                  displayName: "main phone",
                  factorId: "phone",
                  uid: props.user.uid,
                },
              ],
            },
          });
        } else {
          result = await props.updateUser(props.user.uid, {
            multiFactor: {
              enrolledFactors: null,
            },
          });
        }
        break;
      case "role":
        result = await props.updateUser(props.user.uid, {
          role: role,
        });
        break;
      case "photo":
        result = await props.updateUserPhoto(props.user.uid, photo);
        break;
    }
    if (result) {
      setResult("success");
    } else {
      setResult("error");
    }
  };

  const handleImageChange = async (e) => {
    const imageFile = e.target.files[0];
    if (!imageFile || imageFile.size > 7000000) {
      setResult("fileError");
      return;
    }
    setResult("");

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 300,
    };

    try {
      const compressedFile = await imageCompression(imageFile, options);
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
        setPhoto(base64data);
        setField("photo");
      };
    } catch (error) {
      console.log(error);
    }

    // const reader = new FileReader();
    // reader.onload = (e) => {
    //     console.log(e.target.result)
    //     setPhoto(e.target.result)
    //     setField("photo")

    // }
    // reader.readAsDataURL(e.target.files[0])
  };

  return (
    <Modal
      size="md"
      onHide={props.hide}
      show={props.show}
      className="text-right"
    >
      <div className="modal-content p-1" style={{ backgroundColor: "#f4f5f7" }}>
        <div className="bg-white h-100 rounded-lg border pb-4">
          <div className="text-left">
            <button
              className="btn button-link px-1 py-0 my-2 mx-3 shadow-none text-muted"
              onClick={props.hide}
            >
              <h4>&times;</h4>
            </button>
          </div>
          <div className="mt-n2 text-center">
            <input
              type="file"
              className="d-none"
              id="imageFile"
              onChange={handleImageChange}
            />
            <div className="mx-auto" style={{ width: "30%" }}>
              <label className="pointer my-0 text-muted" htmlFor="imageFile">
                <img
                  src={photo ? photo : "/unknownBig.png"}
                  width="100%"
                  className="mx-auto d-block my-0 rounded-circle"
                ></img>
              </label>
            </div>
            <h3 className="my-2" style={{ color: "#4b4b4ceb" }}>
              {props.user.name}
            </h3>
            <h5 className="my-2 text-muted">{props.user.email}</h5>
            <hr />
          </div>
          <Form.Group className="my-4 mx-3">
            <Form.Label className="text-right">בחר שדה</Form.Label>
            <Form.Control
              as="select"
              className="normalInputSize"
              value={field}
              onChange={(e) => setField(e.target.value)}
            >
              <option value="role">תפקיד</option>
              <option value="name">שם</option>
              <option value="phone">מספר טלפון</option>
              <option value="2fa">אימות דו שלבי</option>
              <option value="email">כתובת מייל</option>
              <option value="photo">תמונת פרופיל</option>
            </Form.Control>
            <Form.Label
              className="fontSmall mt-3 text-muted"
              hidden={field !== "photo"}
            >
              לחץ על התמונה בשביל לבצע שינויים
            </Form.Label>
          </Form.Group>

          <Form.Group className="my-4 mx-3">
            <Form.Label className="text-right" hidden={field === "photo"}>
              ערך מעודכן
            </Form.Label>
            <Form.Control
              hidden={field === "2fa" || field === "role" || field === "photo"}
              className="normalInputSize"
              ref={updatedFieldeRef}
              value={updatedFieldValue}
              onChange={handleFieldValueChange}
            />
            <div hidden={field !== "2fa"}>
              <Form.Check
                inline
                className="mr-0 ml-2"
                type="checkbox"
                checked={mfa}
                onChange={() => setMfa(!mfa)}
              />
              <Form.Label className={mfa ? "text-success" : "text-danger"}>
                {mfa ? "פעיל" : "כבוי"}
              </Form.Label>
            </div>

            <Form.Control
              hidden={field !== "role"}
              as="select"
              className="normalInputSize"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {props.roles.map((userRole, index) => {
                return (
                  <option key={index} value={userRole}>
                    {userRole}
                  </option>
                );
              })}
            </Form.Control>
          </Form.Group>
          <div className="text-center">
            <button className="btn text-white btn-purple" onClick={handleSave}>
              שמור
            </button>

            <span
              className={
                "my-2 text-success " +
                (result !== "success" ? "d-none" : "d-block")
              }
            >
              הפרטים עודכנו בהצלחה
            </span>

            <span
              className={
                "my-2 text-danger " +
                (result !== "error" ? "d-none" : "d-block")
              }
            >
              הפעולה נכשלה, אנא וודא שהפרטים נכונים
            </span>

            <span
              className={
                "my-2 text-danger " +
                (result !== "error" || field !== "phone" ? "d-none" : "d-block")
              }
            >
              מספר הטלפון חייב להיות ייחודי ובפורמט מתאים
            </span>

            <span
              className={
                "my-2 text-danger " +
                (result !== "fileError" ? "d-none" : "d-block")
              }
            >
              הקובץ גדול מ-7 מגה בייט או לא תקין
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default UserModal;
