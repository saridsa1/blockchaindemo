import React, {Component} from 'react';
import {CompoundButton, Button, ButtonType} from 'office-ui-fabric-react/lib/Button';
import {Dialog, DialogType, DialogFooter} from 'office-ui-fabric-react/lib/Dialog';
import {
    Pivot,
    PivotItem,
    PivotLinkFormat
} from 'office-ui-fabric-react/lib/Pivot';
import {Label} from 'office-ui-fabric-react/lib/Label';
import {Dropdown} from 'office-ui-fabric-react/lib/Dropdown';
import {TextField} from 'office-ui-fabric-react/lib/TextField';
import {DatePicker} from 'office-ui-fabric-react/lib/DatePicker';

import {css} from 'glamor';
import axios from 'axios';
import SweetAlert from 'sweetalert-react';
import PatientDetailList from './PatientPivotComponent';
import PrescriberDetailList from './PrescriberPivotComponent';
import InsurerDetailsList from './InsurerPivotComponent';
import LiaisonDetailsList from './LiaisonPivotComponent';

const BASE_URI = "http://localhost:8090/api";

class App extends Component {

    generateUUID() {
        let d = new Date().getTime();
        return  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    };

    constructor(props) {
        super(props);
        this.state = {
            showCreatePrescriberDialog: false,
            showCreateLiaisonDialog: false,
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
            axios.get(BASE_URI+'/com.novartis.iandd.Patient'),
            axios.get(BASE_URI+'/com.novartis.iandd.Liaison'),
            axios.get(BASE_URI+'/com.novartis.iandd.Prescriber'),
            axios.get(BASE_URI+'/com.novartis.iandd.Insurer')
        ]).then(axios.spread(function (_patients, _liaisons, _prescribers, _insurers) {
            this.setState({
                patients: _patients.data,
                liaisons: _liaisons.data,
                prescribers: _prescribers.data,
                insurers: _insurers.data
            });
        }.bind(this)));
    }

    componentDidMount() {
        console.log("Component will mount ");

        this.refreshData();
    }

    showCreatePrescriberDialog() {
        this.setState({
            showCreatePrescriberDialog: true
        });
    }

    showCreateInsurerDialog() {
        this.setState({
            showCreateInsurerDialog: true
        })
    }

    showCreateLiaisonDialog() {
        this.setState({
            showCreateLiaisonDialog: true
        });
    }

    showCreatePatientDialog() {
        this.setState({
            showCreatePatientDialog: true
        })
    }

    _closeDialog(dialogType) {
        switch (dialogType) {
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

    _saveLiaisonRecord(){
        // Liaison email needs to be added
        let requestData = {
            "liaisonId": "LIAI:" + this.generateUUID(),
            "firstName": this.refs._lFirstName.value,
            "lastName": this.refs._lLastName.value,
            "liaisonOrg": this.refs._lOrgId.value,
        };

        axios.post(BASE_URI+"/com.novartis.iandd.Liaison", requestData).then(function (response) {
            console.log(JSON.stringify(response));
            let message = "Liaison " + requestData.lastName + " has been successfully added to block chain network";
            this.setState({
                showCreateLiaisonDialog: false,
                showAlert: true,
                alertTitle: "Liaison added successfully",
                alertMessage: message
            });
            this.refreshData();
        }.bind(this)).catch(function(error){
            console.error(error);
            this.setState({
                showCreatePrescriberDialog: false,
                showAlert: true,
                alertTitle: "Error occurred",
                alertMessage: "An error occurred while creating the record"
            });
        });

    }

    _saveInsurerRecord() {
        let requestData = {
            "insurerId": "INSR:" + this.generateUUID(),
            "insurerOrgName": this.refs._insurerOrgID.value,
            "insurerOrgId": this.refs._insurerOrgName.value,
            "insurerOrgEmail": this.refs._insurerEmail.value
        };

        axios.post(BASE_URI+"/com.novartis.iandd.Insurer", requestData).then(function (response) {
            console.log(JSON.stringify(response));
            let message = "Insurer " + requestData.insurerOrgEmail + " has been successfully added to block chain network";
            this.setState({
                showCreateInsurerDialog: false,
                showAlert: true,
                alertTitle: "Insurer added successfully",
                alertMessage: message
            });
            this.refreshData();
        }.bind(this)).catch(function(error){
            console.error(error);
            this.setState({
                showCreateInsurerDialog: false,
                showAlert: true,
                alertTitle: "Error occurred",
                alertMessage: "An error occurred while creating the record"
            });
        });
    }

    _savePrescriberRecord() {
        var certificateObj = {
            "registrationNumber" : this.refs._dCertificateID.value,
            "expiryDate" : this.selectedDCExpiryDate
        };

        let requestData = {
            "prescriberId": "PRSC:" + this.generateUUID(),
            "firstName": this.refs._dFirstName.value,
            "lastName": this.refs._dLastName.value,
            "certificate" : certificateObj
        };

        axios.post(BASE_URI+"/com.novartis.iandd.Prescriber", requestData).then(function (response) {
            console.log(JSON.stringify(response));
            let message = "Prescriber " + requestData.lastName + " has been successfully added to block chain network";
            this.setState({
                showCreatePrescriberDialog: false,
                showAlert: true,
                alertTitle: "Prescriber added successfully",
                alertMessage: message
            });
            this.refreshData();
        }.bind(this)).catch(function(error){
            console.error(error);
            this.setState({
                showCreatePrescriberDialog: false,
                showAlert: true,
                alertTitle: "Error occurred",
                alertMessage: "An error occurred while creating the record"
            });
        });

    }

    _savePatientRecord() {
        let requestData = {
            "patientId": "PAT:" + this.generateUUID(),
            "firstName": this.refs._firstName.value,
            "lastName": this.refs._lastName.value,
            "address": this.refs._address.value,
            "socialSecurityNumber": this.refs._socialSecurityNumber.value,
            "sex": this.selectedPatientGender.key
        };
        
        var primaryPhysicianData  = this.primaryPhysician.key;

        //console.log(JSON.stringify(requestData));
        axios.post(BASE_URI+"/com.novartis.iandd.Patient", requestData).then(function (response) {
            console.log(JSON.stringify(response));
            /**
             * Update the physician to add this patient to a list of his patients
             */
            if(!primaryPhysicianData.patient){
                primaryPhysicianData.patient = []
            } 
            primaryPhysicianData.patient.push(response.data.patientId);
            console.log(JSON.stringify(primaryPhysicianData));

            axios.put(BASE_URI+"/com.novartis.iandd.Prescriber/"+primaryPhysicianData.prescriberId, primaryPhysicianData).then(function(response){

                let message = "Patient " + requestData.lastName + " " + requestData.firstName + " has been successfully added to block chain network";
                this.setState({
                    showCreatePatientDialog: false,
                    showAlert: true,
                    alertTitle: "Patient added successfully",
                    alertMessage: message
                });
                this.refreshData();

            }.bind(this))
        }.bind(this)).catch(function (error) {
            console.error(error);
            let message = "Patient " + requestData.lastName + " " + requestData.firstName + " was not added to block chain network";
            this.setState({
                showCreatePatientDialog: false,
                showAlert: true,
                alertTitle: "An error occurred",
                alertMessage: message
            });
        }.bind(this))
    }

    renderCreateLiaisonDialog(){
        return (
            <Dialog
                isOpen={ this.state.showCreateLiaisonDialog }
                type={ DialogType.normal }
                onDismiss={ this._closeDialog.bind(this, "liaison") }
                title='Create Liaison'
                subText='Create a new liaison participant on the block chain'
                className="large-dialog"
                isBlocking={ true }>
                <TextField ref="_lFirstName" label="First name" placeholder="Liaison's first name"/>
                <TextField ref="_lLastName" label="Last name" placeholder="Liaison's last name"/>
                <TextField ref="_lOrgId" label="Liaison Org" placeholder="Liaison's Org ID"/>
                <TextField ref="_lEmailID" label="Liaison Email" placeholder="Liaison's Email ID"/>
                <DialogFooter>
                    <Button buttonType={ ButtonType.primary }
                            onClick={ this._saveLiaisonRecord.bind(this) }>Save</Button>
                    <Button onClick={ this._closeDialog.bind(this, "liaison") }>Cancel</Button>
                </DialogFooter>
            </Dialog>
        )
    }

    renderCreatePrescriberDialog() {
        return (
            <Dialog
                isOpen={ this.state.showCreatePrescriberDialog }
                type={ DialogType.normal }
                onDismiss={ this._closeDialog.bind(this, "prescriber") }
                title='Create patient'
                subText='Create a new doctor participant on the block chain'
                className="large-dialog"
                isBlocking={ true }>
                <TextField ref="_dFirstName" label="First name" placeholder="Doctor's first name"/>
                <TextField ref="_dLastName" label="Last name" placeholder="Doctor's last name"/>
                <TextField ref="_dCertificateID" label="Certificate ID" placeholder="Doctor's certificate ID"/>
                <DatePicker onSelectDate={ date => this.selectedDCExpiryDate = date } label="Expiry date"
                            placeholder='Select a date...'/>
                <DialogFooter>
                    <Button buttonType={ ButtonType.primary }
                            onClick={ this._savePrescriberRecord.bind(this) }>Save</Button>
                    <Button onClick={ this._closeDialog.bind(this, "prescriber") }>Cancel</Button>
                </DialogFooter>
            </Dialog>
        )
    }

    renderCreatePatientDialog() {
        let prescribersData = this.state.prescribers.map(function(value, index){
            return {
                'key' : value,
                'text': value.lastName+" "+value.firstName
            }
        });
        console.log(JSON.stringify(prescribersData));
        return (
            <Dialog
                isOpen={ this.state.showCreatePatientDialog }
                type={ DialogType.normal }
                onDismiss={ this._closeDialog.bind(this, "patient") }
                title='Create patient'
                subText='Create a new patient participant on the block chain'
                className="large-dialog"
                isBlocking={ true }>
                <TextField ref="_firstName" label="First name" placeholder="Patient's first name"/>
                <TextField ref="_lastName" label="Last name" placeholder="Patient's last name"/>
                <TextField ref="_address" label="Address" multiline rows={ 4 } placeholder="Patient's address"/>
                <TextField ref="_socialSecurityNumber" label="Social security number"
                           placeholder="Patient's social security number"/>
                <Dropdown ref="_gender" label='Gender' onChanged={ (item) => this.selectedPatientGender = item }
                          options={
                              [
                                  {key: 'MALE', text: 'Male'},
                                  {key: 'FEMALE', text: 'Female'}
                              ]
                          }/>
                <Dropdown ref="_primaryPhysician" label='Primary physician' onChanged={ (item) => this.primaryPhysician = item } 
                    options={prescribersData}/>              
                <DialogFooter>
                    <Button buttonType={ ButtonType.primary }
                            onClick={ this._savePatientRecord.bind(this) }>Save</Button>
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
                <TextField ref="_insurerOrgName" label='Insurer org name' placeholder='Organization name of the insurer'
                           ariaLabel='Insurer org name'/>
                <TextField ref="_insurerOrgID" label='Insurer org ID' placeholder='Organization ID of the insurer'
                           ariaLabel='Insurer org ID'/>
                <TextField ref="_insurerEmail" label='Insurer Email' placeholder='Email ID of the insurer'
                           ariaLabel='Insurer org ID'/>
                <DialogFooter>
                    <Button buttonType={ ButtonType.primary }
                            onClick={ this._saveInsurerRecord.bind(this) }>Save</Button>
                    <Button onClick={ this._closeDialog.bind(this, "insurer") }>Cancel</Button>
                </DialogFooter>
            </Dialog>
        )
    }

    renderButtonGrid() {
        return (
            <div className="align-center">
                <br/>
                <CompoundButton description='Create a new doctor record' disabled={ false }
                                onClick={this.showCreatePrescriberDialog.bind(this)}>
                    Create Prescriber
                </CompoundButton>
                <div className="ms-u-clearfix"/>
                <br/>
                <CompoundButton description='Create a new liaison record' disabled={ false }
                                onClick={this.showCreateLiaisonDialog.bind(this)}>
                    Create Liaison
                </CompoundButton>
                <div className="ms-u-clearfix"/>
                <br/>
                <CompoundButton description='Create a new insurer record' disabled={ false }
                                onClick={this.showCreateInsurerDialog.bind(this)}>
                    Create Insurer
                </CompoundButton>
                <div className="ms-u-clearfix"/>
                <br/>
                <CompoundButton description='Create a new patient record' disabled={ false }
                                onClick={this.showCreatePatientDialog.bind(this)}>
                    Create Patient
                </CompoundButton>
                <br/>
            </div>
        )
    }

    renderPivots() {
        console.log(this.state);
        return (
            <div className="pivot-align">
                <Pivot linkFormat={ PivotLinkFormat.links }>
                    <PivotItem linkText='Patients'>
                        {this.state.patients.length > 0 ? <PatientDetailList displayData={this.state.patients}/> :
                            <Label>No Patients records yet</Label>}
                    </PivotItem>
                    <PivotItem linkText='Prescribers'>
                        {this.state.prescribers.length > 0 ?
                            <PrescriberDetailList displayData={this.state.prescribers}/> :
                            <Label>No Doctors records yet</Label>}
                    </PivotItem>
                    <PivotItem linkText='Insurers'>
                        {this.state.insurers.length > 0 ? <InsurerDetailsList displayData={this.state.insurers}/> :
                            <Label>No Insurer records yet</Label>}
                    </PivotItem>
                    <PivotItem linkText='Liaisons'>
                        {this.state.insurers.length > 0 ? <LiaisonDetailsList displayData={this.state.liaisons}/> :
                            <Label>No Liaison records yet</Label>}
                    </PivotItem>
                </Pivot>
            </div>
        )
    }

    render() {
        let dateString = (new Date()).toISOString();
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
                <div className="ms-Grid-col ms-u-sm2 ms-u-md2 ms-u-lg2 ">
                    { this.renderButtonGrid() }
                </div>
                <div className="ms-Grid-col ms-u-sm10 ms-u-md10 ms-u-lg10 ">
                    { this.renderPivots() }
                </div>
                {this.state.showCreateInsurerDialog ? this.renderCreateInsurerDialog() : null}
                {this.state.showCreatePatientDialog ? this.renderCreatePatientDialog() : null}
                {this.state.showCreatePrescriberDialog ? this.renderCreatePrescriberDialog() : null}
                {this.state.showCreateLiaisonDialog ? this.renderCreateLiaisonDialog() : null}
                <SweetAlert show={this.state.showAlert} title={this.state.alertTitle} text={this.state.alertMessage}
                            onConfirm={() => this.setState({showAlert: false})}/>
            </div>
        );
    }
}

export default App;
