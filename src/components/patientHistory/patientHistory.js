import React from "react"
import "./patientHistory.css"

const patientHistory = (props) => {
    return (
        <div className="patient-history">
            <h3>{props.symptom}</h3>
            <p>{props.date}</p>
        </div>
    );
}

export default patientHistory;