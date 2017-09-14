const path = require('path')
const payeesPathRelative = '/../data/payees.json'
const payeesPath = path.resolve(__dirname.concat(payeesPathRelative))

const fs = require("fs")

const addNameToPayee = (payee, newName, pathToPayees) => {
    const payees = parsePayees(pathToPayees)
    if(getIndexOfPayee(payees, payee) < 0) {
        payees.push({
            alias: payee,
            names: []
        })
    }
    payees[getIndexOfPayee(payees, payee)].names.push(newName)
    writePayees(payees, pathToPayees)
}

const getIndexOfPayee = (payees, payee) => {
    return payees.findIndex(thisPayee => thisPayee.alias === payee)
}

const parsePayees = (fileName) => {
    return JSON.parse(fs.readFileSync(fileName).toString());
}

const writePayees = (payees, fileName) => {
    fs.writeFileSync(fileName, JSON.stringify(payees));
}

module.exports = {
    addNameToPayee,
    getIndexOfPayee,
    parsePayees,
    writePayees
}
