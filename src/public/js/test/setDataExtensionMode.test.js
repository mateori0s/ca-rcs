const { setDataExtensionMode } = require('../funcionesCA'); // Ajusta el path según tu estructura

describe('setDataExtensionMode', () => {
    let connection;

    beforeEach(() => {
        // Simula el DOM
        document.body.innerHTML = `
            <div id="dependentModeOptionsDiv" style="display: flex;"></div>
            <div id="independentModeOptionsDiv" style="display: flex;"></div>
            <div id="dataExtensionModeOptionsDiv" style="display: none;"></div>
        `;

        // Mock de la conexión
        connection = {
            trigger: jest.fn()
        };

        // Asegúrate de que la función 'connection.trigger' esté disponible globalmente
        global.connection = connection;
    });

    afterEach(() => {
        // Limpia cualquier mock o manipulación global al final de cada test
        jest.clearAllMocks();
        delete global.connection;
    });

    it('should show data extension mode div and hide dependent and independent mode divs', () => {
        // Ejecuta la función
        setDataExtensionMode();

        // Verifica los estilos
        expect(document.getElementById('dependentModeOptionsDiv').style.display).toBe('none');
        expect(document.getElementById('independentModeOptionsDiv').style.display).toBe('none');
        expect(document.getElementById('dataExtensionModeOptionsDiv').style.display).toBe('flex');

        // Verifica que connection.trigger haya sido llamado con 'requestInteraction'
        expect(connection.trigger).toHaveBeenCalledWith('requestInteraction');
    });
});
