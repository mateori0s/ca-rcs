let connection;

define(['postmonger'], (Postmonger) => {
    'use strict';

    let $ = jQuery.noConflict(); // Evitar conflicto con otras versiones de jQuery
    connection = new Postmonger.Session();
    let activity;

    // Configuration variables
    let eventDefinitionKey;

    $(window).ready(() => {
        // JB will respond the first time 'ready' is called with 'initActivity'
        connection.trigger('ready');
        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');
        connection.trigger("requestTriggerEventDefinition");
        connection.trigger("requestInteraction");
    });

    connection.on('initActivity', (data) => {
        if (data) activity = data;

        const inArguments = Boolean(
            data.arguments &&
            data.arguments.execute &&
            data.arguments.execute.inArguments &&
            data.arguments.execute.inArguments.length > 0
        ) ? data.arguments.execute.inArguments : [];


        const smsActionArg = inArguments.find(arg => arg.smsAction);
        if (smsActionArg && smsActionArg.smsAction && ['send', 'save'].includes(smsActionArg.smsAction)) {
            document.getElementById(`sms-action-${smsActionArg.smsAction}`).checked = true;
            if (smsActionArg.smsAction === 'send') setSendAction();
            else if (smsActionArg.smsAction === 'save') setSaveAction();
        }

        const caModeArg = inArguments.find(arg => arg.caMode);
        if (caModeArg && caModeArg.caMode && ['independent', 'dependent', 'data-extension'].includes(caModeArg.caMode)) {
            document.getElementById(`mode-${caModeArg.caMode}`).checked = true;
            if (caModeArg.caMode === 'independent') setIndependentMode();
            else if (caModeArg.caMode === 'dependent') setDependentMode();
            else if (caModeArg.caMode === 'data-extension') setDataExtensionMode();
        }

        let caMode = getCaMode();
        if (caMode === 'independent') {
            const mensajeTraducidoArg = inArguments.find(arg => arg.mensajeTraducido);
            if (mensajeTraducidoArg) {
                document.getElementById('mensajeIndependiente').value = mensajeTraducidoArg.mensajeTraducido;
            }
        } else if (caMode === 'data-extension') {
            const dataExtensionMessageColumnArg = inArguments.find(arg => arg.dataExtensionMessageColumn);
            if (dataExtensionMessageColumnArg) {
                document.getElementById('dataExtensionMessageColumn').value = dataExtensionMessageColumnArg.dataExtensionMessageColumn;
            }
        }

        const dataExtensionArg = inArguments.find(arg => arg.dataExtension);
        if (dataExtensionArg) document.getElementById('dataExtension').value = dataExtensionArg.dataExtension;

        const expireDateModifierArg = inArguments.find(arg => arg.expireDateModifier);
        if (expireDateModifierArg) document.getElementById("expire-date-modifier").value = expireDateModifierArg;

        const saveActionCountryArg = inArguments.find(arg => arg.saveActionCountry);
        if (saveActionCountryArg) {
            document.getElementById(`save-action-country-${saveActionCountryArg.saveActionCountry}`).checked = true;
            setOrigin(saveActionCountryArg.saveActionCountry);
        }
    });

    connection.on('requestedInteraction', (payload) => {
        let caMode = getCaMode();
        if (caMode === 'dependent') {

            
            let selectedValue;
            // determine the selected item (if there is one)
            if (activity.arguments.execute.inArguments) {
                let existingSelection;
                for (const inArgument of activity.arguments.execute.inArguments) {
                    if (inArgument.mensajeTraducido) {
                        existingSelection = inArgument.mensajeTraducido;
                        break;
                    }
                }
                if (existingSelection && existingSelection.split(".").length == 3) selectedValue = existingSelection.split(".")[1];
            }
            // Populate the select dropdown.

            const selectElement = document.getElementById("messageActivity");
            var options = document.querySelectorAll('#messageActivity option');
            options.forEach(o => o.remove());

            payload.activities.forEach((a) => {
                if (
                    a.schema &&
                    a.schema.arguments &&
                    a.schema.arguments.execute &&
                    a.schema.arguments.execute.outArguments &&
                    a.schema.arguments.execute.outArguments.length > 0
                ) {
                    a.schema.arguments.execute.outArguments.forEach((inArg) => {
                        if (inArg.mensajeTraducido) {
                        let option = document.createElement("option");
                        option.text = `${a.name} - (${a.key})`;
                        option.value = a.key;
                        selectElement.add(option);
                        }
                    });
                }
            });
            if (selectElement.childElementCount > 0) {
                // If we have a previously selected value, repopulate that value.
                if (selectedValue) {
                    const selectOption = selectElement.querySelector(`[value='${selectedValue}']`);
                    if (selectOption) selectOption.selected = true;
                    else console.log("Could not select value from list", `[value='${selectedValue}]'`);
                }
                // Let Journey Builder know the activity has changes.
                connection.trigger("setActivityDirtyState", true);
            }
        }
    });

    connection.on('clickedNext', () => { // Save function within MC.
        const caMode = getCaMode();

        const dataExtension = document.getElementById('dataExtension').value;
        let dataExtensionMessageColumn;

        let mensajeTraducido;
        if (caMode === 'dependent') {
            const select = document.getElementById("messageActivity");
            mensajeTraducido = `{{Interaction.${select.options[select.selectedIndex].value}.mensajeTraducido}}`;
        } else if (caMode === 'independent') {
            mensajeTraducido = document.getElementById("mensajeIndependiente").value;
        } else if (caMode === 'data-extension') {
            dataExtensionMessageColumn = document.getElementById("dataExtensionMessageColumn").value;
            mensajeTraducido = `{{Contact.Attribute."${dataExtension}".${dataExtensionMessageColumn}}}`;
        }

        const cellularNumber = `{{Contact.Attribute."${dataExtension}".cellular_number}}`;
        const smsAction = getSmsAction();

        let expireDateModifier = document.getElementById("expire-date-modifier").value ;

        let saveActionCountry = null;
        for (const country of ['AR', 'UY', 'PY']) {
            if (document.getElementById(`save-action-country-${country}`).checked) {
                saveActionCountry = country;
                break;
            }
        }
        
        activity['arguments'].execute.inArguments = [
            { dataExtension: dataExtension ? dataExtension : null },
            { mensajeTraducido: mensajeTraducido ? mensajeTraducido : null },
            { cellularNumber: cellularNumber ? cellularNumber : null },
            { smsAction: smsAction ? smsAction : null },
            { caMode: caMode ? caMode : null },
            { dataExtensionMessageColumn: dataExtensionMessageColumn ? dataExtensionMessageColumn : null },
            { expireDateModifier: expireDateModifier ? expireDateModifier : null },
            { saveActionCountry: saveActionCountry ? saveActionCountry : null }
        ];

        activity['metaData'].isConfigured = true;
        connection.trigger('updateActivity', activity);
    });

    /**
     * This function is to pull out the event definition within journey builder.
     * With the eventDefinitionKey, you are able to pull out values that passes through the journey
     */
    connection.on('requestedTriggerEventDefinition', (eventDefinitionModel) => {
        console.log("Requested TriggerEventDefinition", eventDefinitionModel.eventDefinitionKey);
        if (eventDefinitionModel) eventDefinitionKey = eventDefinitionModel.eventDefinitionKey;
    });
});

function getSmsAction() {
    let smsAction;
    for (const action of ['send', 'save']) {
        if (document.getElementById(`sms-action-${action}`).checked) smsAction = action;
    }
    return smsAction;
}

function setSendAction() {
    document.getElementById('expireDateModifierDiv').style.display = 'none';
    connection.trigger('requestInteraction');
}

function setSaveAction() {
    document.getElementById('expireDateModifierDiv').style.display = 'flex';
    connection.trigger('requestInteraction');
}

function setIndependentMode() {
    document.getElementById("dependentModeOptionsDiv").style.display = "none";
    document.getElementById("independentModeOptionsDiv").style.display = "flex";
    document.getElementById("dataExtensionModeOptionsDiv").style.display = "none";
    connection.trigger("requestInteraction");
}

function setDependentMode() {
    document.getElementById("dependentModeOptionsDiv").style.display = "flex";
    document.getElementById("independentModeOptionsDiv").style.display = "none";
    document.getElementById("dataExtensionModeOptionsDiv").style.display = "none";
    connection.trigger("requestInteraction");
}

function setDataExtensionMode() {
    document.getElementById("dependentModeOptionsDiv").style.display = "none";
    document.getElementById("independentModeOptionsDiv").style.display = "none";
    document.getElementById("dataExtensionModeOptionsDiv").style.display = "flex";
    connection.trigger("requestInteraction");
}

function getCaMode() {
    let caMode;
    for (const mode of ['independent', 'dependent', 'data-extension']) {
        if (document.getElementById(`mode-${mode}`).checked) caMode = mode;
    }
    return caMode;
}