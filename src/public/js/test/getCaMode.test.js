const { getCaMode } = require('../funcionesCA'); // Ajusta el path según tu estructura

describe('getCaMode', () => {
    beforeEach(() => {
        // Simula el DOM
        document.body.innerHTML = `
            <input type="radio" id="mode-independent" name="mode" value="independent" checked>
            <input type="radio" id="mode-dependent" name="mode" value="dependent">
            <input type="radio" id="mode-data-extension" name="mode" value="data-extension">
        `;
    });

    it('should return "independent" when the independent mode is checked', () => {
        const result = getCaMode();
        expect(result).toBe('independent');
    });

    it('should return "dependent" when the dependent mode is checked', () => {
        // Cambia el estado de los inputs
        document.getElementById('mode-independent').checked = false;
        document.getElementById('mode-dependent').checked = true;
        document.getElementById('mode-data-extension').checked = false;

        const result = getCaMode();
        expect(result).toBe('dependent');
    });

    it('should return "data-extension" when the data extension mode is checked', () => {
        // Cambia el estado de los inputs
        document.getElementById('mode-independent').checked = false;
        document.getElementById('mode-dependent').checked = false;
        document.getElementById('mode-data-extension').checked = true;

        const result = getCaMode();
        expect(result).toBe('data-extension');
    });

    it('should return undefined when no mode is checked', () => {
        // Cambia el estado de los inputs
        document.getElementById('mode-independent').checked = false;
        document.getElementById('mode-dependent').checked = false;
        document.getElementById('mode-data-extension').checked = false;

        const result = getCaMode();
        expect(result).toBeUndefined();
    });
});
