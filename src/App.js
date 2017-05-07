import React, { Component } from 'react';
import { CompoundButton, Button, ButtonType } from 'office-ui-fabric-react/lib/Button';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import {
  Pivot,
  PivotItem,
  PivotLinkFormat
} from 'office-ui-fabric-react/lib/Pivot';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { DatePicker } from 'office-ui-fabric-react/lib/DatePicker';

import {css} from 'glamor';
import axios from 'axios';
import SweetAlert from 'sweetalert-react';
import PatientDetailList from './PatientPivotComponent';
import PrescriberDetailList from './PrescriberPivotComponent';
import InsurerDetailsList from './InsurerPivotComponent';

const uuidV4 = require('uuid/v4');

class App extends Component {
    
    constructor(props){
        super(props);
        this.state = {
            showCreatePrescriberDialog: false,
            showCreateLiaisonDialog : false,
            showCreateInsurerDialog: false,
            showCreatePatientDialog: false,
            showAlert: false,
            alertMessage: "",
            patients: [],
            liaisons: [],
            insurers: [],
            prescribers: []

        }
    }

    refreshData() {
        axios.all([
            axios.get('http://localhost:3000/api/com.novartis.iandd.Patient'),
            axios.get('http://localhost:3000/api/com.novartis.iandd.Liaison'),
            axios.get('http://localhost:3000/api/com.novartis.iandd.Prescriber'),
            axios.get('http://localhost:3000/api/com.novartis.iandd.Insurer')    
        ]).then(axios.spread(function(_patients, _liaisons, _prescribers, _insurers){
            this.setState({
                patients : _patients.data,
                liaisons : _liaisons.data,
                prescribers: _prescribers.data,
                insurers : _insurers.data    
            });
        }.bind(this)));  
    }
    componentDidMount(){
        console.log("Component will mount ");
        
        this.refreshData();
    }

    showCreatePrescriberDialog(){
        this.setState({
            showCreatePrescriberDialog: true
        });
    }

    showCreateInsurerDialog(){
        this.setState({
            showCreateInsurerDialog: true
        })
    }

    showCreateLiaisonDialog(){
        this.setState({
            showCreateLiaisonDialog: true
        });
    }

    showCreatePatientDialog() {
        this.setState({
            showCreatePatientDialog: true
        })
    }

    _closeDialog(dialogType){
        switch(dialogType){
            case "insurer": 
                this.setState({
                    showCreateInsurerDialog: false
                });
                break;
            case "patient":
                this.setState({
                    showCreatePatientDialog: false
                });
                break;
            case "prescriber":
                this.setState({
                    showCreatePrescriberDialog: false
                });
                break;
            case "liaison":
                this.setState({
                    showCreateLiaisonDialog: false
                });
                break;
            default:
                console.warn("No inputs passed to close dialog, will close all");
                break;
        }
    }

    _saveInsurerRecord(){
        let requestData = {
            "insurerId" : "INSR:"+uuidV4(),
            "insurerOrgName": this.refs._insurerOrgID.value,
            "insurerOrgId" : this.refs._insurerOrgName.value
        };

        axios.post("http://localhost:3000/api/com.novartis.iandd.Insurer", requestData).then(function(response){
            alert("Insurer participant has been added successfully");
        });
    }
    _savePrescriberRecord(){

    }
    _savePatientRecord(){
        var requestData = {
            "patientId": "PAT:"+uuidV4(),
            "firstName": this.refs._firstName.value,
            "lastName": this.refs._lastName.value,
            "address": this.refs._address.value,
            "socialSecurityNumber": this.refs._socialSecurityNumber.value,
            "sex": this.selectedPatientGender.key
        };
        console.log(JSON.stringify(requestData));
        axios.post("http://localhost:3000/api/com.novartis.iandd.Patient", requestData).then(function(response){
            console.log(JSON.stringify(response));
            let message = "Patient "+requestData.lastName+" "+requestData.firstName+" has been successfully added to block chain network";
            this.setState({
                showCreatePatientDialog: false,
                showAlert: true,
                alertTitle: "Patient added successfully",
                alertMessage: message
            });
            this.refreshData();
        }.bind(this)).catch(function(error){
            console.error(error);
            let message = "Patient "+requestData.lastName+" "+requestData.firstName+" was not added to block chain network";
             this.setState({
                showAlert: true,
                alertTitle: "Patient added successfully",
                alertMessage: message
            });
        }.bind(this))
    }

    renderCreatePrescriberDialog(){
        return (
            <Dialog
                isOpen={ this.state.showCreatePrescriberDialog }
                type={ DialogType.normal }
                onDismiss={ this._closeDialog.bind(this, "prescriber") }
                title='Create patient'
                subText='Create a new doctor participant on the block chain'
                className="large-dialog"
                isBlocking={ true }>
                <TextField ref="_dFirstName" label="First name" placeholder="Doctor's first name" />
                <TextField ref="_dLastName" label="Last name" placeholder="Doctor's last name" />
                <TextField ref="_dCertificateID" label="Certificate ID" placeholder="Doctor's certificate ID" />
                <DatePicker onSelectDate{ (item) => this.state.selectedDCExpiryDate = item } label="Expiry date" placeholder='Select a date...' />

                <DialogFooter>
                    <Button buttonType={ ButtonType.primary } onClick={ this._savePrescriberRecord.bind(this) }>Save</Button>
                    <Button onClick={ this._closeDialog.bind(this, "prescriber") }>Cancel</Button>
                </DialogFooter>
            </Dialog>
        )
    }

    renderCreatePatientDialog(){
        return (
                <Dialog
                        isOpen={ this.state.showCreatePatientDialog }
                        type={ DialogType.normal }
                        onDismiss={ this._closeDialog.bind(this, "patient") }
                        title='Create patient'
                        subText='Create a new patient participant on the block chain'
                        className="large-dialog"
                        isBlocking={ true }>
                    <TextField ref="_firstName" label="First name" placeholder="Patient's first name" />
                    <TextField ref="_lastName" label="Last name" placeholder="Patient's last name" />
                    <TextField ref="_address" label="Address" multiline rows={ 4 } placeholder="Patient's address" />
                    <TextField ref="_socialSecurityNumber" label="Social security number" placeholder="Patient's social security number" />
                    <Dropdown ref="_gender" label='Gender'  onChanged={ (item) => this.selectedPatientGender = item }
                        options={
                            [
                                { key: 'MALE', text: 'Male' },
                                { key: 'FEMALE', text: 'Female' }
                            ]
                        }/>
                    <DialogFooter>
                        <Button buttonType={ ButtonType.primary } onClick={ this._savePatientRecord.bind(this) }>Save</Button>
                        <Button onClick={ this._closeDialog.bind(this, "patient") }>Cancel</Button>
                    </DialogFooter>
                </Dialog>
        )        
    }

    renderCreateInsurerDialog() {
        return (
                <Dialog
                        isOpen={ this.state.showCreateInsurerDialog }
                        type={ DialogType.normal }
                        onDismiss={ this._closeDialog.bind(this, "insurer") }
                        title='Create insurer'
                        subText='Create a new insurer participant on the block chain'
                        isBlocking={ true }
                >
                    <TextField ref="_insurerOrgName" label='Insurer org name' placeholder='Organization name of the insurer' ariaLabel='Insurer org name' />
                    <TextField ref="_insurerOrgID" label='Insurer org ID' placeholder='Organization ID of the insurer' ariaLabel='Insurer org ID' />    
                    <DialogFooter>
                        <Button buttonType={ ButtonType.primary } onClick={ this._saveInsurerRecord.bind(this) }>Save</Button>
                        <Button onClick={ this._closeDialog.bind(this, "insurer") }>Cancel</Button>
                    </DialogFooter>
                </Dialog>
        )
    }

    renderButtonGrid() {
        return (
            <div className="align-center">
                    <br/>
                    <CompoundButton description='Create a new doctor record' disabled={ false } onClick={this.showCreatePrescriberDialog.bind(this)}>
                        Create Prescriber
                    </CompoundButton>
                    <div className="ms-u-clearfix"></div>
                    <br/>
                    <CompoundButton description='Create a new liaison record' disabled={ false } onClick={this.showCreateLiaisonDialog.bind(this)}>
                        Create Liaison
                    </CompoundButton>
                    <div className="ms-u-clearfix"></div>
                    <br/>
                    <CompoundButton description='Create a new insurer record' disabled={ false } onClick={this.showCreateInsurerDialog.bind(this)}>
                        Create Insurer
                    </CompoundButton>
                    <div className="ms-u-clearfix"></div>
                    <br/>
                    <CompoundButton description='Create a new patient record' disabled={ false } onClick={this.showCreatePatientDialog.bind(this)}>
                        Create Patient
                    </CompoundButton>
                    <br/>                    
            </div> 
        )
    }
    
    renderPivots(){
        console.log(this.state);
        return (
        <div className="pivot-align">
            <Pivot linkFormat={ PivotLinkFormat.links }>
                <PivotItem linkText='Patients'>
                    {this.state.patients.length > 0 ? <PatientDetailList displayData={this.state.patients} /> : <Label>No Patients records yet</Label>}
                </PivotItem>
                <PivotItem linkText='Prescribers'>
                    {this.state.prescribers.length > 0 ? <PrescriberDetailList displayData={this.state.prescribers} /> : <Label>No Doctors records yet</Label>}
                </PivotItem>
                <PivotItem linkText='Insurers'>
                    {this.state.insurers.length > 0 ? <InsurerDetailsList displayData={this.state.insurers} /> : <Label>No Insurer records yet</Label>}
                </PivotItem>
                <PivotItem linkText='Liaisons'>
                    <Label>No liaisons yet</Label>
                </PivotItem>
            </Pivot>
        </div>            
        )
    }

    render() {
        var dateString = (new Date()).toISOString();
        return (            
                <div className="ms-Grid">
                    <div className="ms-Grid-row" { ...css({
                    backgroundColor: '#2488d8',
                    boxShadow: '0 0 20px rgba(192, 192, 192, .3)',
                    padding: 20
                    }) }>
                    <div className="ms-Grid-col ms-u-sm10 ms-u-md10 ms-u-lg10">
                            <span className="ms-font-su ms-fontColor-white">
                                Welcome to the block chain demo !
                            </span>
                        <br/>
                        <span className="ms-font-xs ms-fontColor-white">{ dateString }</span>
                    </div>
                    </div>
                    <div className="ms-Grid-col ms-u-sm3 ms-u-md3 ms-u-lg3 ">
                        { this.renderButtonGrid() }
                    </div>
                    <div className="ms-Grid-col ms-u-sm8 ms-u-md8 ms-u-lg8 ">
                        { this.renderPivots() }
                    </div>
                    {this.state.showCreateInsurerDialog ? this.renderCreateInsurerDialog() : null}
                    {this.state.showCreatePatientDialog ? this.renderCreatePatientDialog() : null}
                    {this.state.showCreatePrescriberDialog ? this.renderCreatePrescriberDialog() : null}
                    <SweetAlert show={this.state.showAlert} title={this.state.alertTitle} text={this.state.alertMessage} onConfirm={() => this.setState({ showAlert: false })}/>
                </div>      
        );
    }
}

export default App;
