const path = require('path')
const moment = require('moment')

const Transaction = require('./Transaction')

const getTransactions = async fileName => {
    return new Promise((resolve, reject) => {
        const transactions = []

        const lineReader = require('readline').createInterface({
            input: require('fs').createReadStream(fileName)
        })
            
        lineReader.on('line', line => {
            transactions.push(processTransaction(line))
        })

        lineReader.on('close', line => {
            resolve(transactions)
        })
    })
}

const processTransaction = line => {
  const cleaned = line.replace(/["']/g, "")
  return createTransaction(cleaned)
}

const createTransaction = line => {
  const split = line.split(';')
  const amount = split[3] ? split[3] : split[4]
  const sign = split[3] ? -1 : 1

  return new Transaction(moment(split[0], "DD.MM.YYYY"), split[1], formatAmount(amount) * sign)
}

const formatAmount = numberString => {
  const separatorsRemoved = numberString.replace(/[.]/g, "")
  return Number(separatorsRemoved.replace(/[,]/g, "."))
}

module.exports = {
    getTransactions,
    processTransaction,
    formatAmount
}
