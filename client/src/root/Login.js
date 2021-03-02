// import './../App.css';
import { Form, Col, Row, Button } from 'react-bootstrap';
import { auth } from '../firebase.js';
import { useRef, useState } from 'react';
import { useHistory } from "react-router-dom";
import { postRequestWithToken, setPersistence } from '../firebase.js'
import firebase from "firebase/app";


function Login(props) {
  const emailRef = useRef();
  const passRef = useRef();
  const ChangeActionRef = useRef();
  const rememberMeRef = useRef();
  const phoneCodeRef = useRef()
  const [errorMessage, setErrorMessage] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [formAction, setFormAction] = useState("login");
  const [verificationId, setVerificationId] = useState(null);
  const [resolver, setResolver] = useState(null);
  let history = useHistory();
  const AUDIT_URL = "http://localhost:3000/api/audit";

  const sendLoginLog = (user) => {
    const data = {
      event: "login",
      time: Date.now()
    }

    user.getIdToken(true).then(idToken => {
      props.postRequestWithToken(AUDIT_URL, idToken, data)
        .then(result => console.log(result))
        .catch(err => console.log(err))
    }).catch(error => console.log(error));
  }

  const sendPassResetLog = (email) => {
    const data = {
      event: "password reset",
      time: Date.now(),
      email: email
    }

    fetch(AUDIT_URL, {
      method: "post",
      cache: 'no-cache',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(result => console.log(result))
      .catch(err => console.log(err));
  }

  const handlePassReset = (event) => {
    setResetEmailSent(false);
    event.preventDefault();
    if (!emailRef.current.value) {
      setErrorMessage("אנא הכנס כתובת מייל");
      return;
    }
    auth.sendPasswordResetEmail(emailRef.current.value).then(() => {
      console.log("email sent");
      setErrorMessage("");
      setResetEmailSent(true);
      sendPassResetLog(emailRef.current.value);
    }).catch((error) => {
      if (error.code === "auth/invalid-email") {
        setErrorMessage("אנא וודא שכתובת המייל נכונה");
      }
      else {
        setErrorMessage("כתובת מייל שגויה");
        console.log("error: ", error);
      }
    });
  }

  const handleSignIn = (event) => {
    event.preventDefault();
    console.log(rememberMeRef);
    if (!emailRef.current.value) {
      setErrorMessage("אנא הכנס שם משתמש");
      return;
    }
    else if (!passRef.current.value) {
      setErrorMessage("אנא הכנס סיסמה");
      return;
    }
    if (rememberMeRef.current.checked) {
      setPersistence("local");
    }
    else {
      setPersistence("session");
    }
    auth.signInWithEmailAndPassword(emailRef.current.value, passRef.current.value)
      .then((user) => {
        console.log("signed in")
        const usr = user.user;
        user.user.getIdToken(true).then((idToken) => console.log(idToken));
        setErrorMessage("");
        sendLoginLog(usr);
        props.setLoadingUser(true);
        history.push("/patients");
      })
      .catch((error) => {
        console.log(error);
        if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
          setErrorMessage("פרטי משתמש שגוים, אנא נסה שוב");
        }
        else if (error.code === "auth/multi-factor-auth-required") {
          setFormAction("2fa");
          setErrorMessage("");
          send2FACode(error);
        }
        else {
          setErrorMessage("התחברות נכשלה, אנא וודא שפרטי המשתמש נכונים")
        }
      });
  }

  const send2FACode = (error) => {
    console.log(error.resolver)
    setResolver(error.resolver)
    let recaptchaVerifier = new firebase.auth.RecaptchaVerifier('signin', {
      'size': 'invisible'
    })
    let phoneInfoOptions = {
      multiFactorHint: error.resolver.hints[0],
      session: error.resolver.session
    };
    let phoneAuthProvider = new firebase.auth.PhoneAuthProvider();
    // Send SMS verification code.
    return phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier)
      .then(function (verificationId) {
        console.log(verificationId)
        setVerificationId(verificationId);
      })
  }

  const handlePhoneCodeInput = () => {
    const code = phoneCodeRef.current.value;
    // console.log("code", code)
    // console.log("ver id", verificationId)
    const cred = firebase.auth.PhoneAuthProvider.credential(verificationId, code);
    const multiFactorAssertion = firebase.auth.PhoneMultiFactorGenerator.assertion(cred);
    resolver.resolveSignIn(multiFactorAssertion)
      .then((user) => {
        console.log("signed in")
        const usr = user.user;
        // user.user.getIdToken(true).then((idToken) => console.log(idToken));
        setErrorMessage("");
        sendLoginLog(usr);
        props.setLoadingUser(true);
        history.push("/patients");

      }).catch(error => {
        setErrorMessage("ההתחברות נכשלה, נסה שוב")
      })
  }

  const changeFormAction = () => {
    ChangeActionRef.current.blur();
    setResetEmailSent(false);
    setErrorMessage("");
    if (formAction === "login") {
      setFormAction("resetPass");
    }
    else {
      setFormAction("login");
    }
  }

  return (
    <>
      <div className="mt-2 mt-md-5 text-center">
        <img src="lock.png" width="45" className="mt-4 block" alt="lock" />
        <h4 className="mt-3 mb-3">התחבר למערכת</h4>
      </div>
      <div className="d-flex justify-content-center">
        <Form
          onSubmit={formAction === "login" ? handleSignIn : handlePassReset}
          style={{ width: "27em", maxWidth: "90vw" }}
          className="px-2"
        >

          <Form.Group as={Row} className="my-4 mx-0" controlId="email" hidden={formAction === "2fa"}>
            <Form.Label column xs="4" className="text-right pr-0">
              כתובת מייל
          </Form.Label>
            <Col xs="8" className="px-0">
              <Form.Control ref={emailRef} placeholder="כתובת מייל" />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mx-0 my-2" controlId="password" hidden={formAction !== "login"}>
            <Form.Label column xs="4" className="text-right pr-0">
              סיסמה
            </Form.Label>
            <Col xs="8" className="px-0">
              <Form.Control type="password" ref={passRef} placeholder="סיסמה" />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mx-0" hidden={formAction !== "2fa"}>
          <Form.Label className="text-right text-secondary ml-2">קוד אימות נשלח ל- </Form.Label>
            <Form.Label dir={"ltr"} className="text-right text-secondary">
              {resolver ? resolver.hints[0].phoneNumber.substring(1) : ""}
            </Form.Label>
          </Form.Group>
          <Form.Group as={Row} className="mx-0 my-4" hidden={formAction !== "2fa"}>
            <Form.Label column xs="4" className="text-right pr-0">
              קוד חד פעמי
            </Form.Label>
            <Col xs="8" className="px-0">
              <Form.Control ref={phoneCodeRef} placeholder="הכנס קוד" />
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId="error" hidden={!resetEmailSent}>
            <Form.Label className="mx-auto text-success">
              מייל איפוס סיסמה נשלח בהצלחה
            </Form.Label>
          </Form.Group>

          <Form.Group as={Row}
            controlId="error"
            hidden={!errorMessage}
            className="text-center">
            <Form.Label className="mx-auto text-danger">
              {errorMessage}
            </Form.Label>
          </Form.Group>

          <Form.Group as={Row} className="mx-0" hidden={formAction !== "2fa"}>
            <Button
              onClick={handlePhoneCodeInput}
              block
              id="passcode"
              className={"shadow-none btn-purple border-0 py-2 " + (errorMessage ? "" : "mt-4")}
            >
              התחבר
            </Button>
          </Form.Group>

          <Form.Group as={Row} className="mx-0" controlId="submitButton" hidden={formAction === "2fa"}>
            <Button
              type="submit"
              block
              id="signin"
              className={"shadow-none btn-purple border-0 py-2 " + (errorMessage ? "" : "mt-4")}
            >
              {formAction === "login" ? "המשך" : "שלח מייל איפוס סיסמה"}
            </Button>
          </Form.Group>

          <Form.Group as={Row} className="mt-4 text-right">
            <Col xs="6" className="pl-0" hidden={formAction !== "login"}>
              <div>
                <Form.Check inline
                  ref={rememberMeRef}
                  role="button"
                  className="text-right mr-0"
                  type="checkbox"
                  id="rememberme"
                />
                <Form.Check.Label
                  role="button"
                  className="mr-2"
                  htmlFor="rememberme">זכור אותי ל14 יום</Form.Check.Label>
              </div>
            </Col>
            <Col xs="6"
              hidden={formAction === "2fa"}
              className={formAction === "login" ? "text-left" : "text-right"}>
              <Button
                ref={ChangeActionRef}
                onClick={changeFormAction}
                variant="link"
                className="shadow-none pt-0 px-0 px-lg-2">
                {formAction === "login" ? "שכחת סיסמה?" : "התחברות משתמש קיים"}
              </Button>
            </Col>
          </Form.Group>

        </Form>
      </div>
    </>
  );
}

export default Login;