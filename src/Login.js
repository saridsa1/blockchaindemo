import React, {Component} from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import {Dialog, DialogType, DialogFooter} from 'office-ui-fabric-react/lib/Dialog';
import {PrimaryButton, DefaultButton} from 'office-ui-fabric-react/lib/Button';
import ServiceRequestForm from './ServiceRequestForm'
import {css} from 'glamor';
import axios from 'axios';

const BASE_URI = "http://localhost:8090/api";

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
        /**
         * Make an AJAX call to verify the credentials
         */
        var prescriberID = "PRSC:12d17034-6daf-4178-b6aa-14a158966384";
        axios.get(BASE_URI+"/com.novartis.iandd.Prescriber/"+prescriberID).then(function(response){
           this.setState({
                logonSuccess : true,
                showLoginDialog: false,
                prescriberData: response.data
            });
            console.log(this.state);
        }.bind(this)).catch(function(error){
            console.error(error);
            return null;
        });

    }

    renderLoginDialog(){
        return (
            <Dialog
            isOpen={ this.state.showLoginDialog }
            type={ DialogType.normal }
            onDismiss={ this._closeDialog.bind(this) }
            title='Login'
            subText='Login using generated credentials'
            isBlocking={ true }>
                <div>
                        <TextField label='User name' required={ true } />
                        <TextField label='Password' type="password" required={ true }/>
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
                        {this.state.logonSuccess && this.state.prescriberData? <ServiceRequestForm SRType="DOCTOR" prescriber={this.state.prescriberData}/> : null}
                    </div>    
                    {this.state.showLoginDialog ? this.renderLoginDialog() : null}
            </div>            
        )
    }
}

export default DoctorLogin;