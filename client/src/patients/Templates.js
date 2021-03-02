import { useEffect, useState } from 'react';
import PatientPageTemplateForm from './PatientPageTemplateForm';

function Templates(props) {
    const [template, setTemplate] = useState("default");
    const DOCUMENT_URL = "http://localhost:3000/api/document"

    const createDoc = async (fields) => {
        const data = {
            templateFields: fields,
            patient: props.patient
        }
        let success = false;
        await props.user.getIdToken(true)
            .then(async idToken => {
                await props.postRequestWithToken(DOCUMENT_URL, idToken, data)
                    .then(result => {
                        if (result.success) {
                            console.log(result)
                            success = true;
                        }
                        else {
                            success = false;
                        }
                    })
                    .catch(error => {
                        console.log(error);
                        success = false;
                    })
            })
            .catch(error => {
                console.log(error)
                success = false;
            })
        setTimeout(() => {
            if (success)
                props.docCreated();
        }, 1800)
        return success;
    }
    return (
        <div>
            <select className="form-control d-inline normalInputSize"
                defaultValue="default"
                onChange={e => setTemplate(e.target.value)}
            >
                <option value="default">---</option>
                <option value="patientPage">דף לקוח</option>
                <option value="template2">תבנית2</option>
                <option value="template3">תבנית3</option>
                <option value="template4">תבנית4</option>
            </select>
            {
                template === "patientPage" ?
                    (
                        <>
                            <PatientPageTemplateForm
                                createDoc={createDoc}
                                patient={props.patient}
                            />
                        </>
                    )
                    : ""
            }
        </div>
    )
}

export default Templates;