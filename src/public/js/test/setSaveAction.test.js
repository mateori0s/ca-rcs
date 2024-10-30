const { setSaveAction } = require('../funcionesCA');

describe('setSaveAction', () => {
    let connection;

    beforeEach(() => {
        // Crea un mock para el objeto connection
        connection = {
            trigger: jest.fn()
        };

        // Asigna el mock a la variable global o al contexto donde se utiliza
        global.connection = connection;

        // Configura un elemento ficticio en el DOM para pruebas
        document.body.innerHTML = '<div id="expireDateModifierDiv"></div>';
    });

    afterEach(() => {
        // Limpia cualquier mock o manipulación global al final de cada test
        jest.clearAllMocks();
        delete global.connection;
    });

    test('should set the display style of expireDateModifierDiv to flex and trigger requestInteraction', () => {
        // Llama a la función a probar
        setSaveAction();

        // Verifica que el estilo del elemento se haya cambiado a 'flex'
        expect(document.getElementById('expireDateModifierDiv').style.display).toBe('flex');

        // Verifica que connection.trigger haya sido llamada con 'requestInteraction'
        expect(connection.trigger).toHaveBeenCalledWith('requestInteraction');
    });
});
