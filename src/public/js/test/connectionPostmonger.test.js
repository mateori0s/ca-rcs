const Postmonger = require('postmonger');
const { connection } = require('../funcionesCA'); // Ajusta el path según tu estructura


describe('Connection Initialization', () => {

    test('should initialize connection as an instance of Postmonger.Session', () => {
        expect(connection).toBeInstanceOf(Postmonger.Session);
    });
});
