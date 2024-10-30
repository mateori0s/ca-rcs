const { setDependentMode } = require('../funcionesCA'); // Ajusta el path según tu estructura

describe('setDependentMode', () => {
    let connection;

    beforeEach(() => {
        // Simula el DOM
        document.body.innerHTML = `
            <div id="dependentModeOptionsDiv" style="display: none;"></div>
            <div id="independentModeOptionsDiv" style="display: flex;"></div>
            <div id="dataExtensionModeOptionsDiv" style="display: flex;"></div>
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

    it('should show dependent mode div and hide independent and data extension divs', () => {
        // Ejecuta la función
        setDependentMode();

        // Verifica los estilos
        expect(document.getElementById('dependentModeOptionsDiv').style.display).toBe('flex');
        expect(document.getElementById('independentModeOptionsDiv').style.display).toBe('none');
        expect(document.getElementById('dataExtensionModeOptionsDiv').style.display).toBe('none');

        // Verifica que connection.trigger haya sido llamado con 'requestInteraction'
        expect(connection.trigger).toHaveBeenCalledWith('requestInteraction');
    });
});
