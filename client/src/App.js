import React, { useEffect } from 'react';
import { DropzoneArea } from "material-ui-dropzone";
import axios from 'axios';
import DataTable from 'react-data-table-component';
import Select from 'react-select';
import './App.css'

const columns = [
  {
    name: 'Nonprofit',
    selector: 'Nonprofit',
    sortable: true,
  },
  {
    name: 'Number of Donations	',
    selector: 'Number of Donations',
    sortable: true,
  },
  {
    name: "Nonprofit",
    selector: 'Nonprofit',
    sortable: true,
  },
  {
    name: "Total Amount",
    selector: 'Total Amount',
    sortable: true,
  },
  {
    name: "Total Fee",
    selector: 'Total Fee',
    sortable: true,
  }
];
class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      files: [],
      data: [],
      listofcurrency: [],
      selectedOption: '',
      disabled: false
    };
  }

  componentDidMount() {
    axios
      .get('https://api.exchangeratesapi.io/latest')
      .then(data => {
        var currencylist = Object.keys(data.data.rates).map((e, i) => {
          return { value: e, label: e }
        })
        this.setState({
          listofcurrency: currencylist
        })
      })
      .catch(err => console.log(err))
  }

  currencySelector = selectedOption => {
    this.setState({ selectedOption });
    if (this.state.files !== [] && selectedOption.value) {
      const formdata = new FormData();
      formdata.append('files', this.state.files[0])
      formdata.append('currency', selectedOption.value)
      axios
        .post('http://localhost:2000/', formdata)
        .then((data) => {
          this.setState({
            data: data.data.data
          })
        })
        .catch(err => {
          console.log('Here is your error', err)
        })
    }
  };

  handleChange = (files) => {
    this.setState({ files: files })
    const formdata = new FormData();
    formdata.append('files', files[0])
    formdata.append('currency', this.state.selectedOption.value)
    if (files[0] && this.state.selectedOption) {
      axios
        .post('http://localhost:2000/', formdata)
        .then((data) => {
          this.setState({
            data: data.data.data
          })
          console.log('Thanks for the uploading the file')
        })
        .catch(err => {
          console.log('Here is your error', err)
        })
    }
  }

  render() {

    return (
      <div>
       
        <DropzoneArea
          style={{ width: '100%' }}
          onChange={this.handleChange}
          acceptedFiles={['text/csv']}
          maxFileSize={5000000}
        />
         <div>
          <Select
            disabled={this.state.disabled}
            value={this.state.selectedOption}
            onChange={this.currencySelector}
            options={this.state.listofcurrency}
            placeholder="Select the currency"
          />
        </div>
        <DataTable
          style={{ width: '100%' }}
          title="Give India"
          columns={columns}
          data={this.state.data}
        />
        <div className="progressbar">
          <p>Hey After selection the currency and uploading the file please wait for few seconds to get data back. Be connected to the internet</p>
        </div>
      </div>
    )
  }
}

export default App;