const payeeHandler = require('../src/payeeHandler')
const path = require('path')

const payeesPathRelative = '/payees.json'
const testPayeesPath = path.resolve(__dirname.concat(payeesPathRelative))

const expectedPayees = require('./payeeHandlerExpected')

describe('parsePayees()', () => {
    test('should return the content of the supplied file as JSON', () => {
        expect(payeeHandler.parsePayees(testPayeesPath)).toEqual([])
    })
})

describe('writePayees()', () => {
    test('writePayees() should write correctly write JSON to the supplied file', () => {
        payeeHandler.writePayees(expectedPayees.initial, testPayeesPath)
        expect(payeeHandler.parsePayees(testPayeesPath)).toEqual(expectedPayees.initial)
    })
})

describe('getIndexOfPayee()', () => {
    test('should return the index of the payee when the payee exists', () => {
        expect(payeeHandler.getIndexOfPayee(expectedPayees.initial, "test alias")).toBe(0)
    })
    
    test('should return -1 when the payee does not exist', () => {
        expect(payeeHandler.getIndexOfPayee(expectedPayees.initial, "Non-existing payee")).toBe(-1)
    })
})

describe('addNameToPayee()', () => {
    test('should create new payee when the payee does not exist', () => {
        payeeHandler.addNameToPayee("test alias", "a new name", testPayeesPath)
        expect(payeeHandler.parsePayees(testPayeesPath)).toEqual(expectedPayees.afterAddingNewName)
    })
    
    test('should add new name to payee when the payee exists', () => {
        payeeHandler.addNameToPayee("another alias", "another name", testPayeesPath)
        expect(payeeHandler.parsePayees(testPayeesPath)).toEqual(expectedPayees.afterAddingNewPayee)
    })
})

afterAll(() => {
    payeeHandler.writePayees([], testPayeesPath)
})
