const path = require('path')

const dnbConverter = require('../src/dnbConverter')
const expected = require('./dnbConverterExpected')

const transactionsPath = path.resolve(__dirname.concat('/transactions-test.txt'))

describe('formatAmount()', () => {
    test('should correctly handle numbers smaller than 100', () => {
        expect(dnbConverter.formatAmount('18,83')).toBe(18.83)
    })
    
    test('should correctly handle strings containing 1000 separators', () => {
        expect(dnbConverter.formatAmount('3.590,91')).toBe(3590.91)
    })
})

test('createTransaction() should return a transaction for correctly formatted text', () => {
    const transString = `"03.09.2017";"Visa  100022  Usd 2,36 Amazon Services-kindValutakurs: 7,9788";"05.09.2017";"18,83";""`
    expect(dnbConverter.processTransaction(transString)).toEqual(expected.single)
})

test('getTransactions() should return correct transactions from text file', async () => {
    const actualTransactions = await dnbConverter.getTransactions(transactionsPath)
    expect(actualTransactions).toEqual(expected.initial)
})
