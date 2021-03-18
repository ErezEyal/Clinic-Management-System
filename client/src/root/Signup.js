import { Form, Col, Row, Button } from 'react-bootstrap';
import { useEffect, useRef, useState } from 'react';
import { useHistory } from "react-router-dom";


function Signup(props) {
    const nameRef = useRef();
    const emailRef = useRef();
    const passRef = useRef();
    const passCheckRef = useRef();
    const roleRef = useRef();
    const phoneRef = useRef();
    const phonePrefixRef = useRef();
    const [signUpError, setSignUpError] = useState("");
    const [registered, setRegistered] = useState(false);
    const [isMfa, setIsMfa] = useState(true);
    const [roles, setRoles] = useState([]);
    const SIGNUP_URL = process.env.REACT_APP_BASE_URL + "signup";
    const AUDIT_URL = process.env.REACT_APP_BASE_API_URL + "audit";
    const ROLES_URL = process.env.REACT_APP_BASE_API_URL + "roles";
    let history = useHistory();

    const handleSignUp = (event) => {
        setRegistered(false);
        setSignUpError("");
        event.preventDefault();
        if (!nameRef.current.value) {
            setSignUpError("אנא הכנס שם מלא");
            return;
        }
        if (!emailRef.current.value) {
            setSignUpError("אנא הכנס שם משתמש");
            return;
        }
        else if (!passRef.current.value || !passCheckRef.current.value) {
            setSignUpError("אנא הכנס סיסמה");
            return;
        }
        else if (passRef.current.value !== passCheckRef.current.value) {
            setSignUpError("הסיסמאות אינן זהות");
            return;
        }
        else if (isMfa && !phoneRef.current.value) {
            setSignUpError("הכנס מספר טלפון או בטל אימות דו שלבי");
            return;
        }
        console.log("Trying to register");

        const data = {
            name: nameRef.current.value,
            email: emailRef.current.value,
            password: passRef.current.value,
            phone: '+' + phonePrefixRef.current.value + phoneRef.current.value,
            mfa: isMfa,
            role: roleRef.current.value
        }

        if (!props.user) {
            console.log("log in before signing up new users");
            setSignUpError("התחבר למערכת על מנת להשלים את ההרשמה");
            return;
        }

        props.user.getIdToken(true).then(idToken => {
            props.postRequestWithToken(SIGNUP_URL, idToken, data)
                .then(data => {
                    console.log(data);
                    if (data.result && data.result === true) {
                        setRegistered(true);
                        setTimeout(() => {
                            history.push("/users")
                        }, 2000)
                    }
                    else {
                        if (data.authorized === true)
                            setSignUpError("אנא וודא שהפרטים נכונים ונסה שוב");
                        else
                            setSignUpError("חסרות הרשאות מתאימות");
                    }
                })
                .catch(err => {
                    console.log(err);
                    setSignUpError("ההרשמה נכשלה");
                    console.log(SIGNUP_URL)
                    console.log(ROLES_URL)
                })
        }).catch(error => {
            console.log(error);
            setSignUpError("ההרשמה נכשלה");
        });
    }

    useEffect(() => {
        props.user.getIdToken(true)
            .then(idToken => {
                props.postRequestWithToken(ROLES_URL, idToken)
                    .then(data => {
                        const roleNames = data.map((role) => {
                            return role.name;
                        })
                        setRoles(roleNames);
                    })
                    .catch(err => {
                        console.log(err);
                    })
            }).catch(error => {
                console.log(error);
            });
    }, [props])

    return (
        <>
            <div className="mt-md-5 text-center">
                <img src="lock.png" width="45" className="mt-4 block" alt="lock" />
                <h4 className="mt-3 mb-3">הרשמת משתמש חדש</h4>
            </div>
            <div className="d-flex justify-content-center text-center">

                <Form onSubmit={handleSignUp} style={{ width: "27em", maxWidth: "90vw" }} className="px-2">
                    <Form.Group as={Row} className="my-4 mx-0" controlId="name">
                        <Form.Label column xs="4" className="text-right pr-0">
                            שם מלא
                        </Form.Label>
                        <Col xs="8" className="px-0">
                            <Form.Control ref={nameRef} placeholder="שם מלא" />
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="my-4 mx-0" controlId="email">
                        <Form.Label column xs="4" className="text-right pr-0">
                            כתובת מייל
                        </Form.Label>
                        <Col xs="8" className="px-0">
                            <Form.Control ref={emailRef} placeholder="כתובת מייל" />
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="my-4 mx-0" controlId="phone">
                        <Form.Label column xs="4" className="text-right pr-0">
                            מספר טלפון
                        </Form.Label>
                        <Col xs="5" className="px-0">
                            <Form.Control ref={phoneRef} placeholder="מספר טלפון" />
                        </Col>
                        <Col xs="3" className="pl-0 pr-3">
                            <Form.Control ref={phonePrefixRef} placeholder="קידומת" defaultValue="972" />
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mx-0 mt-3" controlId="password">
                        <Form.Label column xs="4" className="text-right pr-0">
                            סיסמה
                        </Form.Label>
                        <Col xs="8" className="px-0">
                            <Form.Control type="password" ref={passRef} placeholder="סיסמה" />
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mx-0 my-4" controlId="passwordCheck">
                        <Form.Label column xs="4" className="text-right pr-0">
                            אימות סיסמה
                    </Form.Label>
                        <Col xs="8" className="px-0">
                            <Form.Control type="password" ref={passCheckRef} placeholder="אימות סיסמה" />
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="my-4 mx-0" controlId="role">
                        <Form.Label column xs="4" className="text-right pr-0">
                            הרשאות משתמש
                        </Form.Label>
                        <Col xs="8" className="px-0">
                            <Form.Control as="select" custom ref={roleRef}>
                                {
                                    roles
                                        ? roles.map((role, index) => (
                                            <option
                                                key={index}
                                                value={role}
                                            >
                                                { role}
                                            </option>
                                        ))
                                        : ""
                                }

                            </Form.Control>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="my-2 mx-0" controlId="phone">
                        <Form.Label column xs="4" className="text-right pr-0">
                            אימות דו שלבי
                        </Form.Label>
                        <Col xs="8" className="text-right py-2 pr-0">
                            <Form.Check inline type="checkbox" className="mr-0" checked={isMfa} onChange={() => setIsMfa(!isMfa)} />
                            <Form.Label className={"text-right mr-2 " + (isMfa ? "text-success" : "text-danger")}>
                                {isMfa ? "פעיל" : "כבוי"}
                            </Form.Label>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} controlId="error" hidden={!signUpError}>
                        <Form.Label className="mx-auto text-danger">
                            {signUpError}
                        </Form.Label>
                    </Form.Group>

                    <Form.Group as={Row} controlId="error" hidden={!registered}>
                        <Form.Label className="mx-auto text-success">
                            ההרשמה בוצעה בהצלחה
                        </Form.Label>
                    </Form.Group>

                    <Form.Group as={Row} className="mx-0" controlId="submitButton">
                        <Button
                            type="submit"
                            block
                            className={signUpError ? "" : " mt-4"}
                            style={{ backgroundColor: "#1975d2" }}>
                            המשך בתהליך ההרשמה
                        </Button>
                    </Form.Group>

                </Form>
            </div>
        </>
    );
}

export default Signup;