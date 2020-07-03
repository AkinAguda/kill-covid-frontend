import React, { Component } from "react";
import {Link} from "react-router-dom";
import { connect } from 'react-redux';
import nJwt from 'njwt';

import { setCurrentPatient } from './../../redux/doctor/doctor.actions';

import './PatientDetails.css';
import profilePic from "../../assets/prof.png";
import editIcon from './../../assets/svg/edit.svg';
import docGraph from './../../assets/doc-graph.png';
import PatientHistory from "../../components/patientHistory/patientHistory";
import Prescription from "../../components/prescription/prescription";



class PatientDetails extends Component{
    constructor(){
        super();
        this.state={
            page:'progress',
            comment : '',
            isExtraHistoryHidden: true
        };
        
    }

    generateAccessToken = (uid) => {
        let claims = {
         "sub": "1234567890",
         "iat": 1592737638,
         "exp": 1592741238,
         "uid": uid
        };
        let jwt = nJwt.create(claims, "secret", "HS256");
        let token = jwt.compact();
        return token;
    };

    submitRemark = (e,patientId) => {
        e.preventDefault();
        const { currentDoctorId } = this.props

        fetch('https://fast-hamlet-28566.herokuapp.com/doctors/add_remark', {
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json',
                'doc-access-token' : this.generateAccessToken(currentDoctorId)
            },
            body : JSON.stringify({
                comment : this.state.comment,
                user_id : patientId
            })
        })
        .then(res => res.json())
        .then(data => {
            this.setState({ comment : '' });
            alert('Remark sent');
        })
    }

    setPage(event,page){
        this.setState({page});
        document.querySelector('.active').classList.remove('active');
        event.target.classList.add('active')
    }

    toggleExtraHistory = e => {
        e.preventDefault();
        this.setState( prevState => ({isExtraHistoryHidden: !prevState.isExtraHistoryHidden}),()=> console.log(this.state.isExtraHistoryHidden))
    }

    flagPatient = async (e,patientId) => {
        e.preventDefault();
        const { currentDoctorId } = this.props
        
        try{
        let response = await fetch('https://fast-hamlet-28566.herokuapp.com/doctors/flag', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'doc-access-token': this.generateAccessToken(currentDoctorId)
            },
            body: JSON.stringify({
                user_id: patientId
            })
        })

        let result = await response.json()
        console.log(result)
    }catch(err){
        console.log(err)
    }
    }
    

    setDisplay(patient){
        let {page} = this.state;
        if(page==='progress'){
            return <div className="progress-div">
                    <div className="history">
                        <div className="head-container">
                            <h4>HISTORY</h4>
                        </div>
                        {   this.state.isExtraHistoryHidden
                        ?   <>
                            { this.setHistory(patient.symptoms[patient.symptoms.length-1]) }
                            <button onClick={this.toggleExtraHistory} > View All </button>
                            </>
                        :   <>
                            { this.setFullHistory(patient.symptoms) }
                            <button onClick={this.toggleExtraHistory} > View Latest </button>
                            </>
                         }
                        
                    </div>
                    <div className="prescriptions">
                        <div className="head-container">
                            <h4>PRESCRIPTIONS</h4>
                            <Link to="/add-prescription"><img src={editIcon} alt='edit icon' /></Link>
                            
                        </div>
                        <div className="drugs">
                            <div className="head-container2">
                                <h4>DRUGS</h4>
                                <h4>DOSAGE</h4>
                            </div>
                            {
                                patient.guides.map((guide,index) => ( <Prescription key={index} name={guide.info} time={guide.time_lapse}/> ))
                            }
                            
                        </div>
                    </div>
                    <div className="body-temp">
                        <div className="head-container">
                            <h4>BODY TEMPERATURE</h4>
                        </div>
                        <img src={docGraph} alt='graph' />
                    </div>
                
                    <div className='notes'>
                        <div className='patient'>
                            <h4>PATIENT'S NOTE</h4>
                            <p>
                                <span>Hey Doc,</span>
                                <span>I don't understand why I don't feel much better after 20 days in quarantine.</span>
                                <span>I developed dry cough yesterday morning.</span>
                            </p>
                        </div>
                        <div className='doctor'>
                            <h4>DOCTOR'S NOTE</h4>
                            <textarea value={this.state.comment} onChange={e => this.setState({comment : e.target.value})} rows='10'/>
                            <button onClick={e=>this.submitRemark(e,patient.user_id)}>Send</button>
                        </div>
                    </div>
                    <button onClick={e=>this.flagPatient(e,patient.user_id)}>Flag As Emergency</button>
                </div>    
        }
        if(page==='info'){
            return <div className="information-div">
            <div className="patient-info patient-name">
                <h3 className="title">Name: {patient.first_name} {patient.last_name}</h3>
            </div>
            <div className="patient-info patient-home-address">
                <h3 className="title">Home Address: {patient.address}</h3>
            </div>
            <div className="patient-info patient-phone-number">
                <h3 className="title">Phone Number: {patient.tel}</h3>
            </div>
            <div className="patient-info patient-email">
                <h3 className="title">Email: {patient.email}</h3>
            </div>
            <div className="patient-info patient-age">
                <h3 className="title">Age: {patient.age}</h3>
            </div>
        </div>
        }
    }

    setHistory = (symptom,id) => {
        let finalArray = []
        let date = new Date(symptom.date_added)
        date = `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`
        if(symptom.cough){
            finalArray.push(<PatientHistory symptom="Cough" degree={symptom.specifics.cough_degree} key={1} date={date} />)
        }
        if(symptom.fatigue){
            finalArray.push(<PatientHistory symptom="Fatigue" degree={symptom.specifics.fatigue_degree} key={2} date={date} />)
        }
        if(symptom.fever){
            finalArray.push(<PatientHistory symptom="Fever" degree={symptom.specifics.fever_degree} key={3} date={date} />)
        }
        if(symptom.other){
            finalArray.push(<PatientHistory symptom={symptom.other} key={4} degree={symptom.specifics.other_degree} date={date} />)
        }
        if(symptom.resp){
            finalArray.push(<PatientHistory resp symptom="Respiratory Problem" key={5} date={date} />)
        }
        return <div key={id} className='history-slot'>
            <h1>{date}</h1>
            { finalArray }
        </div>   
    }

    setFullHistory = symptoms => {
      return Array.from(symptoms).reverse().map((symptom,index) => this.setHistory(symptom,index))
    }

    render(){
        
        const { setCurrentPatient,currentPatient } = this.props
        let patient;

        if(this.props.location.patient){
            patient = this.props.location.patient
            setCurrentPatient(patient)
        }else {
            patient = currentPatient
        }
       
        return (
            <div className="PatientDetails">
                <div className="Pcontainer">
                    <header className='patient-details-header'>
                        <div className="Pbanner">
                            <h2>Patient's Details</h2>
                            <img src={profilePic} alt="img"/>
                            <h3>{ `${patient.first_name} 
                                  ${patient.last_name}`
                                }
                            </h3>
                        </div>

                        <div className="Pswitch">
                            <h4 onClick={e=>this.setPage(e,'progress')} className="Pprog active">PROGRESS</h4>
                            <h4 onClick={e=>this.setPage(e,'info')} className="Pinfo">INFORMATION</h4>
                        </div>
                    </header>
                    
                    <div className="Pdisplay">
                        {this.setDisplay(patient)}
                    </div>

                    </div>
            
        </div>
        );
    }
}

const mapStateToProps = state => ({
    currentDoctorId: state.doctor.currentDoctorId,
    currentPatient: state.doctor.currentPatient
});

const mapDispatchToProps = dispatch => ({
    setCurrentPatient:  patient => dispatch(setCurrentPatient(patient))
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PatientDetails);