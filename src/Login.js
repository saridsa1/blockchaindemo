import React, {Component} from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import {Dialog, DialogType, DialogFooter} from 'office-ui-fabric-react/lib/Dialog';
import {PrimaryButton, DefaultButton} from 'office-ui-fabric-react/lib/Button';
import {Dropdown} from 'office-ui-fabric-react/lib/Dropdown';
import ServiceRequestForm from './ServiceRequestForm'
import {css} from 'glamor';
import axios from 'axios';

const BASE_URI = "http://localhost:3000/api";
const AUTHENTICATION_URL = "http://localhost:2400/authenticate";

const patientData = [{"$class":"com.novartis.iandd.Patient","patientId":"PAT:1b4f4132-bcb4-4d99-ae3c-7773825bad72","firstName":"Jane","lastName":"Doe","address":"Novartis, New york","socialSecurityNumber":"236-89-7896","sex":"FEMALE","sharePrivateInfo":false,"insurer":"INSR:430852e0-2833-4831-ac92-8334baa61308"},{"$class":"com.novartis.iandd.Patient","patientId":"PAT:e98d234b-824e-461d-8b5c-178ba891b551","firstName":"Praveen","lastName":"U","address":"Novartis, Hyderabad","socialSecurityNumber":"296-36-5698","sex":"MALE","sharePrivateInfo":false,"insurer":"INSR:430852e0-2833-4831-ac92-8334baa61308"},{"$class":"com.novartis.iandd.Patient","patientId":"PAT:a0613712-144e-4cf5-a368-5869269d2b46","firstName":"Satya ","lastName":"Saridae","address":"Novartis, Hyderabad","socialSecurityNumber":"296-69-8965","sex":"MALE","sharePrivateInfo":false,"insurer":"INSR:430852e0-2833-4831-ac92-8334baa61308"},{"$class":"com.novartis.iandd.Patient","patientId":"PAT:c8d1e9e6-bf36-4670-aadc-bd171a659b52","firstName":"John","lastName":"Doe","address":"Novartis, Fortworth","socialSecurityNumber":"125-45-7896","sex":"MALE","sharePrivateInfo":false,"insurer":"INSR:430852e0-2833-4831-ac92-8334baa61308"}]
const doctorData  = [{"$class":"com.novartis.iandd.Prescriber","prescriberId":"PRSC:e7093c60-fc55-4f0c-b4b7-803d1afa616c","firstName":"Chetan","lastName":"AC","certificate":{"$class":"com.novartis.iandd.DoctorCertificate","registrationNumber":"AC_CHETAN_001","expiryDate":"2019-05-31T07:00:00.000Z"},"prescriberDataShareConsent":false,"patient":["PAT:a0613712-144e-4cf5-a368-5869269d2b46","PAT:e98d234b-824e-461d-8b5c-178ba891b551","PAT:c8d1e9e6-bf36-4670-aadc-bd171a659b52"]},{"$class":"com.novartis.iandd.Prescriber","prescriberId":"PRSC:20b06b31-9346-415b-84b7-d56e828e77ef","firstName":"Johnny","lastName":"Test","certificate":{"$class":"com.novartis.iandd.DoctorCertificate","registrationNumber":"JOHNNYTEST01","expiryDate":"2020-03-25T07:00:00.000Z"},"prescriberDataShareConsent":false,"patient":["PAT:1b4f4132-bcb4-4d99-ae3c-7773825bad72"]}];
const insurerData = [{"$class":"com.novartis.iandd.Insurer","insurerId":"INSR:430852e0-2833-4831-ac92-8334baa61308","insurerOrgName":"STATEFARM001","insurerOrgId":"State farm LLC","insurerOrgEmail":"admin@statefarm.org"}];


class DoctorLogin extends Component {
    constructor(props){
        super(props);
        let _patientData = patientData.map(function(value, index){
            return {
                'key' : value.patientId,
                'text': value.firstName+" "+value.lastName,
                'data': value
            }
        });
        let _doctorData = doctorData.map(function(value, index){
            return {
                'key' : value.prescriberId,
                'text': value.firstName+" "+value.lastName,
                'data': value
            }
        });
        let _insurerData = insurerData.map(function(value, index){
            return {
                'key' : value.insurerId,
                'text': value.insurerOrgEmail,
                'data': value
            }
        });        

        this.state = {
            showLoginDialog: false,
            logonSuccess: false,
            masterData : {
                "com.novartis.iandd.Patient" : _patientData,
                "com.novartis.iandd.Prescriber"  : _doctorData,
                "com.novartis.iandd.Insurer"   : _insurerData
            }
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
        if(this.state.selectedParticipantType === "com.novartis.iandd.Prescriber"){
            var prescriberID = this.selectedParticipantData.prescriberId;
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
        if(this.state.selectedParticipantType === "com.novartis.iandd.Patient" || this.state.selectedParticipantType === "com.novartis.iandd.Insurer"){
            
            var participantKey = (this.state.selectedParticipantType === "com.novartis.iandd.Patient" ? "patientId" : "insurerId");
            var participantId = this.selectedParticipantData[participantKey];

            var participantType = "/"+this.state.selectedParticipantType+"/"
            axios.all([
                axios.get(BASE_URI+"/com.novartis.iandd.ServiceRequest"),
                axios.get(BASE_URI+participantType+participantId)
                ]
            ).then(axios.spread(function (_servicerequestdata, _response) {
                if(this.state.selectedParticipantType === "com.novartis.iandd.Patient"){
                    this.setState({
                        logonSuccess : true,
                        serviceRequestData: _servicerequestdata.data[0],
                        showLoginDialog: false,
                        patientData: _response.data
                    });
                } else  if(this.state.selectedParticipantType === "com.novartis.iandd.Insurer"){
                    this.setState({
                        logonSuccess : true,
                        serviceRequestData: _servicerequestdata.data[0],
                        showLoginDialog: false,
                        insurerData: _response.data
                    });
                }

            }.bind(this)));
        }

    }

    renderLoginDialog(){
        let optionsForParticipant = [];
        if(this.state.selectedParticipantType){
            optionsForParticipant = this.state.masterData[this.state.selectedParticipantType];
            console.log(optionsForParticipant);
        }
        return (
            <Dialog
            isOpen={ this.state.showLoginDialog }
            type={ DialogType.normal }
            onDismiss={ this._closeDialog.bind(this) }
            title='Participant Login'
            subText='Select a participant type and participant'
            isBlocking={ true }>
                <div>
                        <Dropdown label='Participant type' onChanged={ (item) => this.setState({'selectedParticipantType': item.key}) }
                          options={
                              [
                                  {key: 'com.novartis.iandd.Patient', text: 'Patient'},
                                  {key: 'com.novartis.iandd.Prescriber', text: 'Doctor'},
                                  {key: 'com.novartis.iandd.Insurer', text: 'Payor'},
                              ]
                          }/>
                        {this.state.selectedParticipantType
                         ?
                        <Dropdown label='Participant' onChanged={ (item) => this.selectedParticipantData = item.data }
                          options={ optionsForParticipant }/>                        
                         : null
                        }
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