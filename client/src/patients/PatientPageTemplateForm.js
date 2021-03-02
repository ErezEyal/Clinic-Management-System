import { useState } from "react";

function PatientPageTemplateForm(props) {
    const [isError, setIsError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const calculateAge = () => {
        const ageDifMs = Date.now() - (new Date(props.patient.birthDate).getTime());
        const ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    const birthDateString = () => {
        const date = new Date(props.patient.birthDate).getDate();
        const month = new Date(props.patient.birthDate).getMonth() + 1;
        const year = new Date(props.patient.birthDate).getFullYear();
        return `${date}/${month}/${year}`
    }

    const currentDateString = () => {
        const dateObject = new Date()
        const date = dateObject.getDate();
        const month = dateObject.getMonth() + 1;
        const year = dateObject.getFullYear();
        return `${date}/${month}/${year}`
    }

    const boxChecked = (bool) => {
        return (bool ? "☒" : "☐")
    }

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
            mn: event.target.mn.value,
            patientBackground: event.target.patientBackground.value,
            testFindings: event.target.testFindings.value,
            summary: event.target.summary.value,
            bloodCount: boxChecked(event.target.bloodCount.checked),
            clottingTest: boxChecked(event.target.clottingTest.checked),
            smallBloodC: boxChecked(event.target.smallBloodC.checked),
            fullBloodC: boxChecked(event.target.fullBloodC.checked),
            thyroidGland: boxChecked(event.target.thyroidGland.checked),
            ekg: boxChecked(event.target.ekg.checked),
            chestRadio: boxChecked(event.target.chestRadio.checked),
            memo: boxChecked(event.target.memo.checked),
            breastClose: boxChecked(event.target.breastClose.checked),
            docSummaryLetter: boxChecked(event.target.docSummaryLetter.checked),
            eyesCheck: boxChecked(event.target.eyesCheck.checked),
            expertCheck: boxChecked(event.target.expertCheck.checked),
            additionalMed: event.target.additionalMed.value,
            expertName: event.target.expertName.value
        }
        console.log(formFields);
        props.createDoc(formFields)
            .then(result => {
                setIsLoading(false);
                if (!result) {
                    setIsSuccess(false);
                    setIsError(true);
                    console.log("result", result)
                }
                else {
                    console.log("result", result)
                    setIsError(false);
                    setIsSuccess(true);
                }
            })
    }

    return (
        <>
            <form
                className="d-inline"
                onSubmit={handleDocCreation}
            >
                <input
                    className="btn btn-purple text-white mx-2 mx-md-4 my-2 my-md-0"
                    type="submit"
                    value="צור מסמך"
                />
                <span className="m-2 text-success" hidden={!isSuccess}>המסמך נוצר בהצלחה</span>
                <span className="m-2 text-danger" hidden={!isError}>הפעולה נכשלה</span>
                <div class="spinner-border text-info" hidden={!isLoading} role="status">
                    <span class="sr-only">Loading...</span>
                </div>
                <div className="row my-3">
                    <div className="p-3">
                        <label
                            className="normalLabelWidth d-block d-md-inline-block ml-3"
                        >שם מטופל</label>
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
                        <label className="normalLabelWidth d-block d-md-inline-block ml-3">תעודת זהות</label>
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
                        <label className="normalLabelWidth d-block d-md-inline-block ml-3">גיל</label>
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
                        <label className="normalLabelWidth d-block d-md-inline-block ml-3">תאריך בדיקה</label>
                        <div className="normalInputSize d-inline-block">
                            <input name="testDate" type="text" className="form-control" />
                        </div>
                    </div>
                    <div className="p-3 ">
                        <label className="normalLabelWidth d-block d-md-inline-block ml-3">תאריך לידה</label>
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
                        <label className="normalLabelWidth d-block d-md-inline-block ml-3">מין</label>
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
                        <label className="normalLabelWidth d-block d-md-inline-block ml-3">תאריך</label>
                        <div className="normalInputSize d-inline-block">
                            <input
                                name="currentDate"
                                type="text"
                                className="form-control"
                                defaultValue={currentDateString()}
                            />
                        </div>
                    </div>
                    <div className="mt-4 col-12">
                        <h5>מ.נ</h5>
                        <textarea name="mn" className="form-control col-lg-4" rows="2"></textarea>
                    </div>
                    <div className="mt-4 col-12">
                        <h5>מחלות רקע, אשפוזים קודמים, רגישויות (כולל טיפולים אסתטיים וכירורגים קודמים)</h5>
                        <textarea name="patientBackground" className="form-control col-lg-4" rows="2"></textarea>
                    </div>
                    <div className="col-12 mt-4">
                        <h5>ממצאים בבדיקה</h5>
                        <textarea name="testFindings" className="form-control col-lg-4" rows="2"></textarea>
                    </div>
                    <div className="col-12 mt-4">
                        <h5>סיכום ותוכנית</h5>
                        <textarea name="summary" className="form-control col-lg-4" rows="2"></textarea>
                    </div>

                    <h5 className="col-12 mb-3 mt-5">בדיקות הכנה לניתוח</h5>
                    <div className="p-3">
                        <label className="d-block font-weight-bold">בדיקות דם</label>
                        <div >
                            <input name="bloodCount" className="form-check-input" type="checkbox" />
                            <label className="mr-4">
                                ספירת דם
                    </label>
                        </div>
                        <div>
                            <input name="clottingTest" className="form-check-input" type="checkbox" />
                            <label className="mr-4">
                                תפקודי כרישה
                    </label>
                        </div>
                        <div>
                            <input name="smallBloodC" className="form-check-input" type="checkbox" />
                            <label className="mr-4">
                                כימיה קטנה בדם
                    </label>
                        </div>
                        <div>
                            <input name="fullBloodC" className="form-check-input" type="checkbox" />
                            <label className="mr-4">
                                כימיה מלאה בדם
                    </label>
                        </div>
                        <div>
                            <input name="thyroidGland" className="form-check-input" type="checkbox" />
                            <label className="mr-4">
                                תפקודי בלוטת התריס
                    </label>
                        </div>
                    </div>
                    <div className="p-3">
                        <div>
                            <label className="d-block font-weight-bold">אחר</label>
                            <input
                                name="ekg"
                                className="form-check-input"
                                type="checkbox"
                            />
                            <label className="mr-4">
                                א.ק.ג
                    </label>
                        </div>
                        <div>
                            <input name="chestRadio" className="form-check-input" type="checkbox" />
                            <label className="mr-4">
                                צילום חזה
                    </label>
                        </div>
                        <div>
                            <input name="memo" className="form-check-input" type="checkbox" />
                            <label className="mr-4">
                                ממוגרפיה
                    </label>
                        </div>
                        <div>
                            <input name="breastClose" className="form-check-input" type="checkbox" />
                            <label className="mr-4">
                                סוגר שדיים
                    </label>
                        </div>
                        <div>
                            <input name="docSummaryLetter" className="form-check-input" type="checkbox" />
                            <label className="mr-4">
                                מכתב סיכום רפואי מרופא מטפל
                    </label>
                        </div>
                        <div>
                            <input name="eyesCheck" className="form-check-input" type="checkbox" />
                            <label className="mr-4">
                                בדיקת רופא עיניים
                    </label>
                        </div>
                        <div>
                            <input name="expertCheck" className="form-check-input" type="checkbox" />
                            <label className="mx-4">
                                בדיקת רופא מומחה
                    </label>
                            <input type="text" name="expertName" className="outline-none border border-top-0 border-left-0 border-right-0" />
                        </div>
                    </div>
                </div>
                <div>
                    <h5>יש להצטייד בתרופות הבאות</h5>
                    <textarea name="additionalMed" className="form-control col-lg-4" rows="3"></textarea>
                </div>
            </form>
        </>
    )
}

export default PatientPageTemplateForm;