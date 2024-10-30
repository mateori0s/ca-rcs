// setIndependentMode.test.js
const { setIndependentMode } = require('../funcionesCA'); // Ajusta el path según tu estructura

describe('setIndependentMode', () => {
    let connection;

    

    beforeEach(() => {
        // Crea un mock para el objeto connection
        connection = {
            trigger: jest.fn()
        };

        // Asigna el mock a la variable global o al contexto donde se utiliza
        global.connection = connection;

        // Configura elementos ficticios en el DOM para las pruebas
        document.body.innerHTML = `
            <div id="dependentModeOptionsDiv"></div>
            <div id="independentModeOptionsDiv"></div>
            <div id="dataExtensionModeOptionsDiv"></div>
        `;
    });

    afterEach(() => {
        // Limpia cualquier mock o manipulación global al final de cada test
        jest.clearAllMocks();
        delete global.connection;
    });

    test('should hide dependentModeOptionsDiv, show independentModeOptionsDiv, hide dataExtensionModeOptionsDiv, and trigger requestInteraction', () => {
        // Llama a la función a probar
        setIndependentMode();

        // Verifica que el estilo del elemento dependentModeOptionsDiv se haya cambiado a 'none'
        expect(document.getElementById('dependentModeOptionsDiv').style.display).toBe('none');

        // Verifica que el estilo del elemento independentModeOptionsDiv se haya cambiado a 'flex'
        expect(document.getElementById('independentModeOptionsDiv').style.display).toBe('flex');

        // Verifica que el estilo del elemento dataExtensionModeOptionsDiv se haya cambiado a 'none'
        expect(document.getElementById('dataExtensionModeOptionsDiv').style.display).toBe('none');

        // Verifica que connection.trigger haya sido llamada con 'requestInteraction'
        expect(connection.trigger).toHaveBeenCalledWith('requestInteraction');
    });
});
