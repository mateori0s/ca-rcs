const { setSendAction } = require('../funcionesCA');

describe('setSendAction', () => {
    let connection;

    beforeEach(() => {
        // Simula el DOM y mockea connection
        document.body.innerHTML = '<div id="expireDateModifierDiv" style="display: block;"></div>';
        
        connection = {
            trigger: jest.fn()
        };

        // Configura connection como una variable global
        global.connection = connection;
    });

    afterEach(() => {
        // Limpia cualquier mock o manipulación global al final de cada test
        jest.clearAllMocks();
        delete global.connection;
    });

    it('should hide the expireDateModifierDiv and trigger the requestInteraction event', () => {
        // Llama a la función
        setSendAction();

        // Verifica que el div se haya ocultado
        expect(document.getElementById('expireDateModifierDiv').style.display).toBe('none');

        // Verifica que connection.trigger haya sido llamada con 'requestInteraction'
        expect(connection.trigger).toHaveBeenCalledWith('requestInteraction');
    });
});
