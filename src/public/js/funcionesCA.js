const Postmonger = require('postmonger');
let connection;

beforeAll(() => {
    // Simular la inicialización de la conexión
    connection = new Postmonger.Session();
});

function getSmsAction() {
    let smsAction;
    for (const action of ['send', 'save']) {
        if (document.getElementById(`sms-action-${action}`).checked) {
            smsAction = action;
        }
    }
    return smsAction;
}

function setIndependentMode() {
    document.getElementById("independentModeOptionsDiv").style.display = "flex";
    document.getElementById("dataExtensionModeOptionsDiv").style.display = "none";
    global.connection.trigger("requestInteraction");
}

function setDataExtensionMode() {
    document.getElementById("independentModeOptionsDiv").style.display = "none";
    document.getElementById("dataExtensionModeOptionsDiv").style.display = "flex";
    global.connection.trigger("requestInteraction");
}
function getCaMode() {
    let caMode;
    for (const mode of ['independent', 'data-extension']) {
        if (document.getElementById(`mode-${mode}`).checked) caMode = mode;
    }
    return caMode;
};

connection = new Postmonger.Session();


module.exports = { getSmsAction,setSendAction,setSaveAction,
    setIndependentMode,setDependentMode,setDataExtensionMode,getCaMode,
connection };