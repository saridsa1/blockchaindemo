import React, {Component} from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import {Dialog, DialogType, DialogFooter} from 'office-ui-fabric-react/lib/Dialog';
import {PrimaryButton, DefaultButton} from 'office-ui-fabric-react/lib/Button';
import ServiceRequestForm from './ServiceRequestForm'
import {css} from 'glamor';
import axios from 'axios';

const BASE_URI = "http://localhost:3000/api";
const AUTHENTICATION_URL = "http://localhost:2400/authenticate";

class DoctorLogin extends Component {
    constructor(props){
        super(props);
        this.state = {
            showLoginDialog: false,
            logonSuccess: false
        }
    }   
    componentDidMount() {
        this.setState({
            showLoginDialog: true
        })
    }    

    _closeDialog() {
        this.setState({
            showLoginDialog: false
        });
    }

    _doLogin() {
        var authenticationData = {
            "participantId": this.refs._userName.value,
            "participantPassword": this.refs._password.value 
        }

        axios.post(AUTHENTICATION_URL, authenticationData).then(function(authenticationResponse){
            console.log(JSON.stringify(authenticationResponse));
            if(authenticationResponse.data.participantType === "com.novartis.iandd.Prescriber"){
                var prescriberID = authenticationResponse.data.participantId;
                axios.get(BASE_URI+"/com.novartis.iandd.Prescriber/"+prescriberID).then(function(response){
                this.setState({
                        logonSuccess : true,
                        showLoginDialog: false,
                        participantType: "prescriber",
                        prescriberData: response.data
                    });
                }.bind(this)).catch(function(error){
                    console.error(error);
                    return null;
                });
            }
            if(authenticationResponse.data.participantType === "com.novartis.iandd.Patient" || authenticationResponse.data.participantType === "com.novartis.iandd.Insurer"){
                var participantId = authenticationResponse.data.participantId;
                var participantType = "/"+authenticationResponse.data.participantType+"/"
                axios.all([
                    axios.get(BASE_URI+"/com.novartis.iandd.ServiceRequest"),
                    axios.get(BASE_URI+participantType+participantId)
                    ]
                ).then(axios.spread(function (_servicerequestdata, _response) {
                    if(authenticationResponse.data.participantType === "com.novartis.iandd.Patient"){
                        this.setState({
                            logonSuccess : true,
                            serviceRequestData: _servicerequestdata.data[0],
                            showLoginDialog: false,
                            patientData: _response.data
                        });
                    } else  if(authenticationResponse.data.participantType === "com.novartis.iandd.Insurer"){
                        this.setState({
                            logonSuccess : true,
                            serviceRequestData: _servicerequestdata.data[0],
                            showLoginDialog: false,
                            insurerData: _response.data
                        });
                    }

                }.bind(this)));
            }

        }.bind(this)).catch(function(error){
            alert("An error occurred from authentication server, please check the console for more details");
            console.error(error);
        });
    }

    renderLoginDialog(){
        return (
            <Dialog
            isOpen={ this.state.showLoginDialog }
            type={ DialogType.normal }
            onDismiss={ this._closeDialog.bind(this) }
            title='Participant Login'
            subText='Login using generated credentials'
            isBlocking={ true }>
                <div>
                        <TextField ref="_userName" label='User name' required={ true } />
                        <TextField ref="_password" label='Password' type="password" required={ true }/>
                </div>
                <DialogFooter>
                    <PrimaryButton onClick={ this._doLogin.bind(this) } text='Login' />
                    <DefaultButton onClick={ this._closeDialog.bind(this) } text='Cancel' />
                </DialogFooter>
            </Dialog>
        )
    }

    render(){
        let dateString = (new Date()).toISOString();
        if(this.state.logonSuccess && this.state.prescriberData){
            dateString = this.state.prescriberData.firstName+" "+this.state.prescriberData.lastName+" | "+this.state.prescriberData.$class+" | " +(new Date()).toISOString();
        }
        if(this.state.logonSuccess && this.state.patientData){
            dateString = this.state.patientData.firstName+" "+this.state.patientData.lastName+" | "+this.state.patientData.$class+" | " +(new Date()).toISOString();
        }
        if(this.state.logonSuccess && this.state.insurerData){
            dateString = this.state.insurerData.insurerOrgEmail+" | "+this.state.insurerData.$class+" | " +(new Date()).toISOString();
        }
        return(
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
                    <div>
                        {this.state.logonSuccess && this.state.prescriberData ? <ServiceRequestForm SRType="DOCTOR" prescriber={this.state.prescriberData}/> : null}
                        {this.state.logonSuccess && this.state.patientData ?    <ServiceRequestForm SRType="PATIENT" patient={this.state.patientData} serviceRequest={this.state.serviceRequestData}/> : null}
                        {this.state.logonSuccess && this.state.insurerData ?    <ServiceRequestForm SRType="INSURER" insurer={this.state.insurerData} serviceRequest={this.state.serviceRequestData}/> : null}
                    </div>    
                    {this.state.showLoginDialog ? this.renderLoginDialog() : null}
            </div>            
        )
    }
}

export default DoctorLogin;