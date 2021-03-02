import './Patients.css';
import ListGroup from 'react-bootstrap/ListGroup';
import { useState } from 'react';


function PatientsList(props) {
    const [selected, setSelected] = useState(-1);
    // const {onPatientChange, firstPatient }  = props;
    
    // useEffect(() => {
    //     console.log("function called");
    //     onPatientChange(firstPatient);
    // }, [firstPatient]);

    const handleChange = (patient, index) => {
        setSelected(index);
        props.onPatientChange(patient);
    }

    const nothingFound = <span className="text-muted px-4">אין שמות מתאימים</span>;
    
    const patientNames = props.patientsJson.flatMap((patient, index) => {
        if (!patient.name.includes(props.filter) && props.filter) {
            return [];
        }
        return <ListGroup.Item
            className={selected === index ? "selected text-right" : "text-right"}
            key={index}
            onClick={() => handleChange(patient, index)}
        >
            {patient.name}
        </ListGroup.Item>
    });

    return (
        <ListGroup 
            dir="ltr" 
            variant="flush" 
            className="listWidth patientsList darkText rounded-lg h-100 scrollVisible mt-4 text-right"
        >
            {patientNames.length > 0 ? patientNames : nothingFound}
        </ListGroup>
    );
}

export default PatientsList;