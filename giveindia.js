// importing express 
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const csvtojson = require('./csvtojson')
const cc = require('currency-codes');
const convertCurrency = require('./convertcurrency')
const bodyParser = require('body-parser');
var _ = require("underscore");

const axios = require('axios');

// Initializing app here 
const app = express()

app.use(express.json())
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }))
app.use(fileUpload());


async function validator(csv_data) {

    var filtered_result = csv_data.filter((e, i) => {
        return (
            e.Date.match(/^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/) &&
            typeof (e["Order Id"]) == "string" &&
            typeof ("Nonprofit") == "string" &&
            cc.code(e["Donation Currency"]) &&
            e["Donation Amount"].match(/^\d+(?:\.\d{0,2})$/) &&
            e["Fee"].match(/^\d+(?:\.\d{0,2})$/)
        )
    })
    return filtered_result;

}


function aggregateByNonprofit(json_data) {
    function sum(numbers) {
        return _.reduce(numbers, function (result, current) {
            return result + parseFloat(current);
        }, 0);
    }
    function groupBy(array, f) {
        var groups = {};
        array.forEach(function (o) {
            var group = JSON.stringify(f(o));
            groups[group] = groups[group] || [];
            groups[group].push(o);
        });
        return Object.keys(groups).map(function (group) {
            return groups[group];
        })
    }

    var grouped = groupBy(json_data, function (item) {
        return [item["Nonprofit"], item["Donation Currency"]];
    });

    let adding_amount = grouped.map((value, key) => {
        // console.log(value)
        return {
            Nonprofit: value[0].Nonprofit,
            "Total Amount": sum(_.pluck(value, "Donation Amount")),
            "Donation Currency": value[0]["Donation Currency"],
            "Total Fee": sum(_.pluck(value, "Fee")),
            "Number of Donations": value.length
        }
    })

    let result = groupBy(adding_amount, function (item) {
        return [item["Donation Currency"]]
    })

    return result;
}

app.post('/', async (req, res) => {

    try {
        var buffer = req.files.files.data;
        var data = buffer.toString();
        const { currency } = req.body;
        var json_data = await csvtojson(data)
        const valid_data = await validator(json_data)
        var aggregate_by_nonprofit = await aggregateByNonprofit(valid_data)
        var converting_currency = await convertCurrency(aggregate_by_nonprofit, currency)
    }
    catch (err) {
        console.log('You are sending the empty files ')
    }

    return res.json({
        status: 200,
        message: "Here is your response!",
        data: converting_currency
    })
})

app.listen(2000, () => {
    console.log('Your app is listening 2000')
})