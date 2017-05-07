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
 * Set the patient data share consent
 * @param {com.novartis.iandd.SetPatientDataShareConsent} patientDataShareConsent - The patient data share consent
 * @transaction
 */
function onSetPatientDataShareConsent(patientDataShareConsent) {
	console.log("onSetPatientDataShareConsent ");
	patientDataShareConsent.serviceRequestRef.patientAuthorization = patientDataShareConsent.valueToSet;
	return getAssetRegistry('com.novartis.iandd.ServiceRequest').then(function(serviceRegistry){
		serviceRegistry.update(patientDataShareConsent.serviceRequestRef);
	});
}
