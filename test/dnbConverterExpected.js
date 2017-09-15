const moment = require('moment')

const Transaction = require('../src/Transaction')

module.exports = {
    initial: [
        new Transaction(moment('04.09.2017', 'DD.MM.YYYY'), 'Overf�ring Innland  5506367870 Elena Grung Austlid Vipps By DNB', -139),
        new Transaction(moment('03.09.2017', 'DD.MM.YYYY'), 'Visa  100022  Usd 2,36 Amazon Services-kindValutakurs: 7,9788', -18.83),
        new Transaction(moment('01.09.2017', 'DD.MM.YYYY'), 'Overf�ring Innland  5505441700 Trond Dahl� Vipps By DNB - Vipps', 185),
    ],
    single: new Transaction(moment('03.09.2017', 'DD.MM.YYYY'), 'Visa  100022  Usd 2,36 Amazon Services-kindValutakurs: 7,9788', -18.83)
}