import React, {Component} from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton, CompoundButton } from 'office-ui-fabric-react/lib/Button';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import {Dropdown} from 'office-ui-fabric-react/lib/Dropdown';
import axios from 'axios';


const BASE_URI = "http://localhost:8090/api";

class ServiceRequestForm extends Component {
    constructor(props){
        super(props);
        this.state = {
            patients : [],
            showCreateServiceRequestDialog: false
        }
    }
    _onClose(){
        this.setState({
            showCreateServiceRequestDialog : false
        })
    }
    renderDoctorSR(){
        return (
            <Dialog
            isOpen={ this.state.showCreateServiceRequestDialog }
            type={ DialogType.normal }
            onDismiss={ this._onClose.bind(this) }
            title='Create Service Request'
            subText='Create a new service request for a patient'
            isBlocking={ true }>
                <div className="sr-dialog-body">
                    <Dropdown ref="_selectedPatient" label='Select a patient to create SR' onChanged={ (item) => this.selectedPatient = item } options={this.state.patients}/>
                    <TextField multiline rows={ 5 }  label='Additional Comments'  />
                    <TextField label='PAS Index' type='number' placeholder="PAS index" />
                    <Checkbox label='I agree to prescribe the drug to this patient' defaultChecked={ false } onChange={ (item) => this.srfAuthorized = item } />
                </div>
                <DialogFooter>
                    <PrimaryButton onClick={ this._onClose.bind(this) } text='Submit' />
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
                console.log(value);
                if(value != "null"){
                    return axios.get(BASE_URI+"/com.novartis.iandd.Patient/"+value);  
                }
                return null;
            }).filter(function(value){
                return (value != null);
            });
            console.log(restCallURLs)
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
    }

    componentDidMount() {
    }

    render(){
        return(
            <div className="ms-Grid">
                <div className="ms-Grid-col ms-u-sm10 ms-u-md10 ms-u-lg10 ">
                    <div className="align-center">
                        <br/>
                        <CompoundButton description='Create a new service request' disabled={ false }
                                        onClick={this.onShowCreateServiceRequestDialog.bind(this)}>
                            Create Service Request
                        </CompoundButton>
                        <div className="ms-u-clearfix"/>
                    </div>    
                </div>
                {(this.state.showCreateServiceRequestDialog && this.props.SRType === "DOCTOR")? this.renderDoctorSR() : null}                    
            </div>
        )        
    }
}

export default ServiceRequestForm