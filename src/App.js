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
import {css} from 'glamor';
import axios from 'axios';

class App extends Component {
    
    constructor(props){
        super(props);
        this.state = {
            showCreatePrescriberDialog: false,
            showCreateLiaisonDialog : false,
            showCreateInsurerDialog: false,
            showCreatePatientDialog: false
        }
    }

    showCreatePrescriberDialog(){
        this.setState({
            showCreatePrescriberDialog: true
        });
    }

    showCreateInsurerDialog(){
        console.log("show create insurer dialog");
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
        var requestData = {
            "insurerOrgName": this.refs._insurerOrgID.value,
            "insurerOrgId" : this.refs._insurerOrgName.value
        }

        axios.post("http://localhost:4200/insurer", requestData).then(function(response){
            var _insurerRecords = [];
            if(this.state.insurerRecords){
                _insurerRecords = this.state.insurerRecords;
                _insurerRecords.push(response);
                this.setState({
                    insurerRecords : _insurerRecords   
                });
                return;
            } else {
                _insurerRecords.push(response);
                this.setState({
                    insurerRecords: _insurerRecords
                });
            }            
        });
    }

    _savePatientRecord(){
        console.log(this.selectedPatientGender);
        var requestData = {
            "firstName": this.refs._firstName.value,
            "lastName": this.refs._lastName.value,
            "address": this.refs._address.value,
            "socialSecurityNumber": this.refs._socialSecurityNumber.value,
            "gender": this.selectedPatientGender.key
        }
        console.log(JSON.stringify(requestData));
        axios.post("http://localhost:4200/patient", requestData).then(function(response){
            var _patientRecords = [];
            if(this.state.patientRecords){
                _patientRecords = this.state.patientRecords;
                _patientRecords.push(response);
                this.setState({
                    patientRecords : _patientRecords   
                });
                return;
            } else {
                _patientRecords.push(response);
                this.setState({
                    patientRecords: _patientRecords
                });
            }            
        });        
    }

    renderCreatePrescriberDialog(){
    
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

    componentDidMount() {

    }

    renderButtonGrid() {
        return (
            <div className="align-center">
                    <br/>
                    <CompoundButton description='Create a new prescriber record' disabled={ false } onClick={this.showCreatePrescriberDialog.bind(this)}>
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
        return (
        <div className="pivot-align">
            <Pivot linkFormat={ PivotLinkFormat.links }>
                <PivotItem linkText='Patients'>
                    <Label>No Patients yet</Label>
                </PivotItem>
                <PivotItem linkText='Prescribers'>
                    <Label>No prescribers yet</Label>
                </PivotItem>
                <PivotItem linkText='Insurers'>
                    <Label>No Insurers yet</Label>
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
                    <div className="ms-Grid-col ms-u-sm6 ms-u-md6 ms-u-lg6 ">
                        { this.renderPivots() }
                    </div>
                    {this.state.showCreateInsurerDialog ? this.renderCreateInsurerDialog() : null}
                    {this.state.showCreatePatientDialog ? this.renderCreatePatientDialog() : null}
                    
                </div>      
        );
    }
}

export default App;
