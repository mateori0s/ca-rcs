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


        const caModeArg = inArguments.find(arg => arg.caMode);
        if (caModeArg && caModeArg.caMode && ['independent', 'data-extension'].includes(caModeArg.caMode)) {
            document.getElementById(`mode-${caModeArg.caMode}`).checked = true;
            if (caModeArg.caMode === 'independent') setIndependentMode();
            else if (caModeArg.caMode === 'data-extension') setDataExtensionMode();
        }

        let caMode = getCaMode();
        if (caMode === 'independent') {
            const idCampaingArg = inArguments.find(arg => arg.idCampaing);
            if (idCampaingArg) {
                document.getElementById('mensajeIndependiente').value = idCampaingArg.idCampaing;
            }
        } else if (caMode === 'data-extension') {
            const dataExtensionMessageColumnArg = inArguments.find(arg => arg.dataExtensionMessageColumn);
            if (dataExtensionMessageColumnArg) {
                document.getElementById('dataExtensionMessageColumn').value = dataExtensionMessageColumnArg.dataExtensionMessageColumn;
            }
        }

        const dataExtensionArg = inArguments.find(arg => arg.dataExtension);
        if (dataExtensionArg) document.getElementById('dataExtension').value = dataExtensionArg.dataExtension;

    });

    connection.on('requestedInteraction', (payload) => {
        let caMode = getCaMode();
    });

    connection.on('clickedNext', () => { // Save function within MC.

        const caMode = getCaMode();
        const dataExtension = document.getElementById('dataExtension').value;
        let dataExtensionMessageColumn;

        if (caMode === 'independent') {
            idCampaing = document.getElementById("mensajeIndependiente").value;
        } else if (caMode === 'data-extension') {
            dataExtensionMessageColumn = document.getElementById("dataExtensionMessageColumn").value;
            idCampaing = `{{Contact.Attribute."${dataExtension}".${dataExtensionMessageColumn}}}`;
        }
        const cellularNumber = `{{Contact.Attribute."${dataExtension}".cellular_number}}`;
        //const idCampaing = `{{Contact.Attribute."${dataExtension}".campaing_id}}`;

        activity['arguments'].execute.inArguments = [
            { dataExtension: dataExtension ? dataExtension : null },
            { idCampaing: idCampaing ? idCampaing : null },
            { cellularNumber: cellularNumber ? cellularNumber : null },
            { caMode: caMode ? caMode : null },
            { dataExtensionMessageColumn: dataExtensionMessageColumn ? dataExtensionMessageColumn : null }
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

function setSendAction() {
    connection.trigger('requestInteraction');
}

function setSaveAction() {
    connection.trigger('requestInteraction');
}
function setIndependentMode() {
    document.getElementById("dependentModeOptionsDiv").style.display = "none";
    document.getElementById("independentModeOptionsDiv").style.display = "flex";
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
    for (const mode of ['independent', 'data-extension']) {
        if (document.getElementById(`mode-${mode}`).checked) caMode = mode;
    }
    return caMode;
}

