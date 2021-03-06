/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * This transaction is responsible for updating the insurer flags on the 
 * service request
 * @param {com.novartis.iandd.UpdateInsurerFlags} inputArg - The input argument
 * @transaction
 */
function onUpdateInsurerFlags(inputArg) {
	console.log("== Updating the insurer flags == ");
	inputArg.serviceRequestRef.copayAssistance = inputArg.copayAssistance;
	inputArg.serviceRequestRef.insurerApproveReject = inputArg.insurerApproveReject;
	
	return getAssetRegistry('com.novartis.iandd.ServiceRequest').then(function(serviceRegistry){
		serviceRegistry.update(inputArg.serviceRequestRef);
	});
}

/**
 * This transaction is responsible for updating the patient flags on the 
 * service request
 * @param {com.novartis.iandd.UpdatePatientFlags} inputArg - The input argument
 * @transaction
 */
function onUpdatePatientFlags(inputArg) {
	console.log("== Updating the insurer flags == ");
	inputArg.serviceRequestRef.patientAuthorization = inputArg.patientAuthorization;
	
	return getAssetRegistry('com.novartis.iandd.ServiceRequest').then(function(serviceRegistry){
		serviceRegistry.update(inputArg.serviceRequestRef);
	});
}
