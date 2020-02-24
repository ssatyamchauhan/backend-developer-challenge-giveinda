

// import csv middleware
const csv = require('csvtojson')

module.exports = csvtojson = async (csv_data) => {
    try {
        let json_data = await csv({ noheader: false, trim: true,  output: 'json' }).fromString(csv_data)
        return json_data;
    }
    catch (err) {
        return err;
    }
}
