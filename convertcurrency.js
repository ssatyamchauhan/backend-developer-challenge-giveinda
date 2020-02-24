const axios = require('axios');
const _ = require('underscore')

module.exports = currencyConverter = async (currency, to) => {

    function groupingData(arrays) {

        function sum(numbers) {
            return _.reduce(numbers, function (result, current) {
                return result + parseFloat(current);
            }, 0);
        }
        var result = _.chain(arrays)
            .groupBy("Nonprofit")
            .map(function (value, key) {
                return {
                    Nonprofit: key,
                    "Total Amount": sum(_.pluck(value, "Total Amount")),
                    "Total Fee": sum(_.pluck(value, "Total Fee")),
                    "Number of Donations": value.length
                }
            })
            .value();
        return result;
    }



    const currency_list = ['CAD',
        'HKD',
        'ISK',
        'PHP',
        'DKK',
        'HUF',
        'GBP',
        'RON',
        'SEK',
        'IDR',
        'INR',
        'BRL',
        'RUB',
        'HRK',
        'JPY',
        'THB',
        'CHF',
        'MYR',
        'BGN',
        'TRY',
        'CNY',
        'NOK',
        'NZD',
        'ZAR',
        'MXN',
        'SGD',
        'AUD',
        'USD',
        'EUR',
        'ILS',
        'KRW',
        'PLN'
    ]
    try {
        let result = []
        for (var i of currency) {
            let from = Object.values(i[0])
            from = from[2]
            if (currency_list.includes(from) && currency_list.includes(to)) {
                if (to !== from) {
                    const convert_rate = await axios.get(`https://api.exchangeratesapi.io/latest?symbols=${to}&base=${from}`);
                    if (convert_rate.data) {
                        let filtered_data = i.map((element) => {

                            element["Total Amount"] = parseInt(element["Total Amount"]) * convert_rate.data.rates[to];
                            element["Donation Currency"] = to;
                            return element;
                        })
                        // console.log('filterere',filtered_data)
                        result.push(filtered_data)
                    }
                }
                else {
                    result.push(i)
                    continue
                }
            }
            else {
                result.push(i)
                continue
            }
        }
        // console.log(result)
        var merge = [].concat.apply([], result)
        // console.log(merge)
        return groupingData(merge);
    }
    catch (err) {
        console.log(err)
    }
}
