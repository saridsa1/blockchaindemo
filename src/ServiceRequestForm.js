import React, {Component} from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton, CompoundButton } from 'office-ui-fabric-react/lib/Button';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import {Dropdown} from 'office-ui-fabric-react/lib/Dropdown';
import axios from 'axios';
import SweetAlert from 'sweetalert-react';

const BASE_URI = "http://localhost:3000/api";

const AGREEMENT_TEXT = 
"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum mattis tincidunt lacus eget aliquam. Integer vel arcu ac lacus interdum pretium non ac massa. Sed maximus libero nec dui dignissim dictum maximus at velit. Mauris accumsan dolor est. Maecenas leo felis, luctus a felis at, tristique lobortis libero. Nam a erat sem. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam convallis pellentesque arcu, sed ultrices mauris interdum ut."+
"Donec feugiat, metus a sodales auctor, nisl nisl dignissim justo, id egestas lectus purus a tortor. Phasellus eleifend eu est a viverra. Curabitur sollicitudin eu nisl at placerat. Donec non rutrum quam. Curabitur risus lectus, aliquet quis dui id, bibendum rhoncus odio. Proin convallis mauris in nibh pulvinar, at ultricies magna fermentum. Pellentesque tempus justo quam. Curabitur volutpat sollicitudin urna, dictum sodales purus tempor sed. Aenean sit amet commodo nunc. Donec pulvinar at urna ut ornare. Suspendisse pellentesque sed nulla sed aliquet. Aliquam feugiat, massa non malesuada pulvinar, eros urna mollis odio, ultricies tincidunt diam ante ac justo. Quisque iaculis, est ut lobortis ornare, velit dui pellentesque lorem, sodales accumsan odio turpis vel sem. Curabitur consequat libero sed mi suscipit faucibus. Praesent viverra semper viverra."+
"Vivamus sit amet pharetra urna. Curabitur tortor massa, semper et eros fringilla, consequat pretium lorem. Sed at erat cursus, imperdiet orci posuere, ultricies metus. Morbi sit amet congue enim. Donec ex augue, tincidunt ac ex vel, ultricies maximus felis. Phasellus quis nulla ut lacus vestibulum maximus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Maecenas pellentesque, nibh quis scelerisque euismod, libero lectus condimentum erat, quis fringilla quam risus at felis. Curabitur consequat nisi nunc, vestibulum dictum risus cursus sed. Maecenas vel dui a ante bibendum semper sit amet ac arcu. Maecenas maximus, libero ac tristique fermentum, risus dolor convallis nisl, id cursus erat felis vitae risus. Donec bibendum tortor et finibus elementum. Aliquam mattis, nunc quis pulvinar volutpat, magna ligula convallis metus, eu maximus elit lacus vel mi. "


class ServiceRequestForm extends Component {
    constructor(props){
        super(props);
        this.state = {
            patients : [],
            showCreateServiceRequestDialog: false,
            showAlert: false,
            alertMessage: "",
            alertTitle: ""
        }
    }

    generateUUID() {
        let d = new Date().getTime();
        return  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    };

    generateServiceRequestID(){
        return "SR:"+this.generateUUID();
    }

    _onClose(){
        this.setState({
            showCreateServiceRequestDialog : false
        })
    }

    _updateServiceRequest(serviceRequestorType){
        let requestData = {};
        let serviceRequestID = "";
        switch(serviceRequestorType){
            case "DOCTOR": 
                serviceRequestID = this.generateServiceRequestID();
                requestData = {
                    "serviceRequestId":serviceRequestID,
                    "patient" : this.selectedPatient.key.patientId,
                    "doctor"  : this.props.prescriber.prescriberId,
                    "insurer" : this.selectedPatient.key.insurer,
                    "prescriberPrescriptionAuthorization": this.srfAuthorized,
                    "PASIndex": this.refs._pasIndex.value,
                    "additionalComments" : this.refs._additionalComments.value
                }                
                axios.post(BASE_URI+"/com.novartis.iandd.ServiceRequest", requestData).then(function(response){
                    var serviceRequestID = response.data.serviceRequestId;
                    let message = "A service request has been created, the patient and the insurer should now agree\nto the terms and conditions for this request to complete."
                    this.setState({
                        showCreateServiceRequestDialog: false,
                        showAlert: true,
                        alertTitle: "Service request has been created",
                        alertMessage: message
                    });
                }.bind(this)).catch(function(error){
                    console.error(error);
                    alert("An error occurred while creating the service request, please check the console for details");
                });
                break;
            case "PATIENT":
                serviceRequestID = this.props.serviceRequest.serviceRequestId;

                requestData = this.props.serviceRequest;
                requestData.patientAuthorization = this.srfAuthorizedByPatient;

                axios.put(BASE_URI+"/com.novartis.iandd.ServiceRequest/"+serviceRequestID, requestData).then(function(response){
                    var serviceRequestID = response.data.serviceRequestId;
                    let message = "You have signed the service request, this request will now need to be approved by your insurer.";
                    this.setState({
                        showSignPatientSRForm: false,
                        showAlert: true,
                        alertTitle: "Service request has been signed",
                        alertMessage: message
                    });
                }.bind(this)).catch(function(error){
                    console.error(error);
                    alert("An error occurred while updating the service request, please check the console for details");                    
                });
                break;
            case "INSURER":
                serviceRequestID = this.props.serviceRequest.serviceRequestId;

                requestData = this.props.serviceRequest;
                requestData.copayAssistance = this.copayRequired;
                requestData.insurerApproveReject = this.srfAuthorizedByInsurer;

                axios.put(BASE_URI+"/com.novartis.iandd.ServiceRequest/"+serviceRequestID, requestData).then(function(response){
                    var serviceRequestID = response.data.serviceRequestId;
                    let message = "The service request has now been completed!";
                    this.setState({
                        showSignInsurerSRForm: false,
                        showAlert: true,
                        alertTitle: "Service request complete",
                        alertMessage: message
                    });
                }.bind(this)).catch(function(error){
                    console.error(error);
                    alert("An error occurred while updating the service request, please check the console for details");                    
                });
                break;
            default:
                break;                
        }
    }

    renderInsurerSR(){
        let agreementText =  "I agree to the terms and conditions";
        let copayText     =  "This case needs a co-pay assistance";
        let dialogSubText = "Sign the service request "+this.props.serviceRequest.serviceRequestId+"(Insurer's desktop)"

        return (
            <Dialog
            isOpen={this.state.showSignInsurerSRForm}
            type={DialogType.normal}
            onDismiss={this._onClose.bind(this)}
            title='Sign Service Request'
            subText={dialogSubText}
            isBlocking={ true }>
                <TextField multiline = {40} value={AGREEMENT_TEXT}/>
                <Checkbox label={agreementText} defaultChecked={false} onChange={ (item, checked) => this.srfAuthorizedByInsurer = checked } />
                <Checkbox label={copayText} defaultChecked={true} onChange={ (item, checked) => this.copayRequired = checked } />
                <DialogFooter>
                    <PrimaryButton onClick={ this._updateServiceRequest.bind(this, "INSURER") } text='Submit' />
                    <DefaultButton onClick={ this._onClose.bind(this) } text='Cancel' />
                </DialogFooter>                    
            </Dialog>
        )
    }

    renderPatientSR(){
        let agreementText =  "I agree to the terms and conditions";
        let dialogSubText = "Sign the service request "+this.props.serviceRequest.serviceRequestId+"(Patient's desktop)"
        return (
            <Dialog
            isOpen={ this.state.showSignPatientSRForm }
            type={ DialogType.normal }
            onDismiss={ this._onClose.bind(this) }
            title='Sign Service Request'
            subText={dialogSubText}
            isBlocking={ true }>
                <TextField multiline = { 40 } value={ AGREEMENT_TEXT }/>
                <Checkbox label={agreementText} defaultChecked={ false } onChange={ (item, checked) => this.srfAuthorizedByPatient = checked } />                
                <DialogFooter>
                    <PrimaryButton onClick={ this._updateServiceRequest.bind(this, "PATIENT") } text='Submit' />
                    <DefaultButton onClick={ this._onClose.bind(this) } text='Cancel' />
                </DialogFooter>                    
            </Dialog>
        )
    }

    renderDoctorSR(){
        return (
            <Dialog
            isOpen={ this.state.showCreateServiceRequestDialog }
            type={ DialogType.normal }
            onDismiss={ this._onClose.bind(this) }
            title='Create Service Request'
            subText="Create a new service request for a patient(Doctor's desktop)"
            isBlocking={ true }>
                <Dropdown ref="_selectedPatient" label='Select a patient to create SR' onChanged={ (item) => this.selectedPatient = item } options={this.state.patients}/>
                <TextField ref="_additionalComments" multiline rows={ 5 }  label='Additional Comments'  />
                <TextField ref="_pasIndex" label='PAS Index' type='number' placeholder="PAS index" />
                <Checkbox label='I agree to prescribe the drug to this patient' defaultChecked={ false } onChange={ (item, checked) => this.srfAuthorized = checked } />
                <DialogFooter>
                    <PrimaryButton onClick={ this._updateServiceRequest.bind(this, "DOCTOR") } text='Submit' />
                    <DefaultButton onClick={ this._onClose.bind(this) } text='Cancel' />
                </DialogFooter>
            </Dialog>
        )
    }

    onShowCreateServiceRequestDialog(){
        /**
         * Make an AJAX call to get the list of patients assigned to the doctor
         * 1. Create a list of patient ID's from the doctor
         * 2. Make all the AJAX calls
         * 3. From the response extract the 
         */
        if(this.props.SRType === "DOCTOR"){
            let patientsList = this.props.prescriber.patient;
            let restCallURLs = patientsList.map(function(value, index){
                if(value !== "null"){
                    return axios.get(BASE_URI+"/com.novartis.iandd.Patient/"+value);  
                }
                return null;
            }).filter(function(value){
                return (value != null);
            });
            axios.all(restCallURLs).then(function(args){
                console.log(args);
                var patientData = args.map(function(value, index){
                    return {
                        key: value.data,
                        text: value.data.lastName+" "+value.data.firstName
                    };
                });
                this.setState({
                    patients : patientData,
                    showCreateServiceRequestDialog: true
                })
            }.bind(this));
        }
        if(this.props.SRType === "PATIENT") {
            this.setState({
                showSignPatientSRForm: true,
                patientData: this.props.patient
            });
        }
        if(this.props.SRType === "INSURER") {
            this.setState({
                showSignInsurerSRForm: true,
                insurerData: this.props.insurer
            });
        }
    }

    componentDidMount() {
    }

    renderDoctorScreen(){
        return (
           <div> 
                <br/>
                <CompoundButton description='Create a new service request' disabled={ false } onClick={this.onShowCreateServiceRequestDialog.bind(this)}>
                    Create Service Request
                </CompoundButton>
                <div className="ms-u-clearfix"/>
           </div>
        )
    }
    
    renderSignSRF(){
        let patientData = this.props.patient;
        let serviceRequest = this.props.SRData;
        let buttonDesc = "Sign the service request with ID - "+this.props.serviceRequest.serviceRequestId;
        return (
           <div> 
                <br/>
                <CompoundButton description={buttonDesc} disabled={ false } onClick={this.onShowCreateServiceRequestDialog.bind(this)}>
                    Sign the service request
                </CompoundButton>
                <div className="ms-u-clearfix"/>
           </div>
        )        
    }

    render(){
        return(
            <div className="ms-Grid">
                <div className="ms-Grid-col ms-u-sm10 ms-u-md10 ms-u-lg10 ">
                    <div className="align-center">
                        {this.props.SRType === "DOCTOR" ? this.renderDoctorScreen() : null}    
                        {this.props.SRType === "PATIENT"? this.renderSignSRF() : null}
                        {this.props.SRType === "INSURER"? this.renderSignSRF() : null}
                    </div>    
                </div>
                {(this.state.showCreateServiceRequestDialog && this.props.SRType === "DOCTOR")? this.renderDoctorSR() : null}
                {(this.state.showSignPatientSRForm && this.props.SRType === "PATIENT")? this.renderPatientSR() : null}
                {(this.state.showSignInsurerSRForm && this.props.SRType === "INSURER")? this.renderInsurerSR() : null}
                 <SweetAlert show={this.state.showAlert} title={this.state.alertTitle} text={this.state.alertMessage}
                            onConfirm={() => this.setState({showAlert: false})}/>
            </div>
        )        
    }
}

export default ServiceRequestForm