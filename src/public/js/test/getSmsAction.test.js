const { getSmsAction } = require('../funcionesCA'); // Ajusta el path según tu estructura

describe('getSmsAction', () => {
    
    beforeEach(() => {
        document.body.innerHTML = ''; // Limpiamos el DOM antes de cada test
    });

    test('debería devolver "send" cuando el botón de envío está marcado', () => {
        document.body.innerHTML = `
            <input type="radio" id="sms-action-send" name="sms-action" checked>
            <input type="radio" id="sms-action-save" name="sms-action">
        `;

        const result = getSmsAction();
        expect(result).toBe('send');
    });

    test('debería devolver "save" cuando el botón de guardar está marcado', () => {
        document.body.innerHTML = `
            <input type="radio" id="sms-action-send" name="sms-action">
            <input type="radio" id="sms-action-save" name="sms-action" checked>
        `;

        const result = getSmsAction();
        expect(result).toBe('save');
    });

    test('debería devolver undefined cuando ninguno de los botones está marcado', () => {
        document.body.innerHTML = `
            <input type="radio" id="sms-action-send" name="sms-action">
            <input type="radio" id="sms-action-save" name="sms-action">
        `;

        const result = getSmsAction();
        expect(result).toBeUndefined();
    });
});