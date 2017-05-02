import React, { Component } from 'react';
import {
  DetailsList
} from 'office-ui-fabric-react/lib/DetailsList';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { SelectionMode } from 'office-ui-fabric-react/lib/Selection';
import axios from 'axios';
import SweetAlert from 'sweetalert-react';


class PatientDetailList extends Component{
    constructor(props){
        super(props);        
        var columns = [];
        columns.push({
            key: "firstName",
            name: "First Name",
            headerClassName: "ms-font-l v text-align-left",
            minWidth: 50,
            maxWidth: 100,
            isCollapsable: false,
            isRowHeader: true,
            isResizable: true
        });
        columns.push({
            key: "lastName",
            name: "Last Name",
            headerClassName: "ms-font-l ms-fontColor-blue text-align-left",
            minWidth: 50,
            maxWidth: 100,
            isCollapsable: false,
            isRowHeader: true,
            isResizable: true
        });
        columns.push({
            key: "address",
            name: "Address",
            headerClassName: "ms-font-l ms-fontColor-blue text-align-left",
            minWidth: 100,
            maxWidth: 130,
            isCollapsable: false,
            isRowHeader: true,
            isResizable: true
        });
        columns.push({
            key: "sex",
            name: "Gender",
            headerClassName: "ms-font-l ms-fontColor-blue text-align-left",
            minWidth: 50,
            maxWidth: 60,
            isCollapsable: false,
            isRowHeader: true,
            isResizable: true
        });
        columns.push({
            key: "actions",
            name: "Identity Actions",
            headerClassName: "ms-font-l ms-fontColor-blue text-align-left",
            minWidth: 100,
            maxWidth: 130,
            isCollapsable: false,
            isRowHeader: true,
            isResizable: false
        });            
        this.columns = columns;    

        this.state = {
            showAlert: false,
            alertMessage : "",
            alertTitle: ""
        }
    }

    issueIdentity(participant){
        var userID = participant.lastName+"_"+participant.firstName;
        var requestData = {
            "participant": "com.novartis.iandd.Patient#"+participant.patientId,
            "userID": userID
        }
        axios.post('http://localhost:3000/api/system/issueIdentity', requestData).then(function(response){
            console.log(response.data);
            this.setState({
                showAlert: true,
                alertTitle: "Identity issued successfully!",
                alertMessage: JSON.stringify(response.data)
            })
        }.bind(this)).catch(function(response) {
            this.setState({
                showAlert: true,
                alertTitle: "Error issuing identity",
                alertMessage: "The user ID already exists on the block chain!"
            })
        }.bind(this));
    }

    revokeIdentity(participant){
        var userID = participant.lastName+"_"+participant.firstName;
        var requestData = {           
            "userID": userID
        }
        axios.post('http://localhost:3000/api/system/revokeIdentity', requestData).then(function(response){       
            console.log(response.data);
            this.setState({
                showAlert: true,
                alertTitle: "Identity revoked successfully!",
                alertMessage: "Identity revoked for "+userID
            })
        }.bind(this)).catch(function(response) {
            this.setState({
                showAlert: true,
                alertTitle: "Error revoking identity",
                alertMessage: "Error occurred while revoking identity for "+userID
            })
        }.bind(this));
    }

    _renderItemColumn(item, index, column) {        
        if(column.key === "actions"){
            return (
                <div>                    
                    <IconButton iconProps={ { iconName: 'Permissions' } } data-automation-id='issueIdentity' disabled={ false } text='Issue identity' onClick={ this.issueIdentity.bind(this, item) }/>
                    <IconButton iconProps={ { iconName: 'RemoveLink' } } data-automation-id='revokeIdentity' disabled={ false } text='Revoke identity' onClick={ this.revokeIdentity.bind(this, item) }/>
                </div>    
            );
        } else {
            let fieldContent = item[column.key];
            return (<span data-selection-disabled={ true }>{ fieldContent }</span>);
        }
        
    }

    render(){
        return (
            <div className="scrollDetailsList">
                <DetailsList
                    items={ this.props.displayData }
                    setKey='set'
                    columns={ this.columns }
                    onRenderItemColumn={ this._renderItemColumn.bind(this) }
                    selectionMode={SelectionMode.single}/>
                <SweetAlert show={this.state.showAlert} title={this.state.alertTitle} text={this.state.alertMessage} onConfirm={() => this.setState({ showAlert: false })}/>
            </div>
        )
    }
}

export default PatientDetailList;