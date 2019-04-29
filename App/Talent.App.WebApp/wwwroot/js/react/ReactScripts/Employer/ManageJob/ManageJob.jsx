import React from 'react';
import ReactDOM from 'react-dom';
import Cookies from 'js-cookie';
import LoggedInBanner from '../../Layout/Banner/LoggedInBanner.jsx';
import { LoggedInNavigation } from '../../Layout/LoggedInNavigation.jsx';
import { JobSummaryCard } from './JobSummaryCard.jsx';
import { BodyWrapper, loaderData } from '../../Layout/BodyWrapper.jsx';
import xhr from '../../../service';
import { Pagination, Card, Label, Icon, Dropdown, Menu, Checkbox, Accordion, Form, Segment } from 'semantic-ui-react';

export default class ManageJob extends React.Component {
    constructor(props) {
        super(props);
        let loader = loaderData
        loader.allowedUsers.push("Employer");
        loader.allowedUsers.push("Recruiter");
        //console.log(loader)
        this.state = {
            loadJobs: [],
            loaderData: loader,
            activePage: 1,
            sortBy: {
                date: "desc"
            },
            filter: {
                showActive: true,
                showClosed: false,
                showDraft: true,
                showExpired: true,
                showUnexpired: true
            },
            store: [],
            totalPages: 1,
            activeIndex: ""
        }
        this.loadData = this.loadData.bind(this);
        this.init = this.init.bind(this);
        this.loadNewData = this.loadNewData.bind(this);
        //your functions go here
    };

    init() {
      let loaderData = TalentUtil.deepCopy(this.state.loaderData)
  
        loaderData.isLoading = false;
        this.setState({ loaderData });//comment this

        //set loaderData.isLoading to false after getting data
        //this.loadData(() =>
        //    this.setState({ loaderData })
        //)
        
        //console.log(this.state.loaderData)
    }

    componentDidMount() {
      this.loadData();
      loaderData.isLoading = false;   
    };

    async loadData() {
      var link = 'http://localhost:51689/listing/listing/getData'; 
      var res = await xhr.get(link);
      
      this.setState({ loadJobs: res.data.myJobs, store: res.data.myJobs}, () => {
        this.setState({
          totalPages: Math.ceil(this.state.loadJobs.length / 6) || 1
        }, () => {
          this.page();
        })
      });
      console.log(res.data.myJobs)         
    }

    loadNewData(data) {
        var loader = this.state.loaderData;
        loader.isLoading = true;
        data[loaderData] = loader;
        this.setState(data, () => {
            this.loadData(() => {
                loader.isLoading = false;
                this.setState({
                    loadData: loader
                })
            })
        });
    }

  handleFilterChange = (e) => {
    setTimeout(() => {
      var curF = this.refs.filter.state.value;
      var data = this.state.store;
      console.log(this.refs.filter.state.value);
      switch (curF) {
        case "active": data = data.filter(s => s.status == 0);
          break;
        case "closed": data = data.filter(s => s.status == 1);
          break;
        case "expired": data = data.filter(s => s.expiry == true);
          break;
        case "unexpired": data = data.filter(s => s.expiry == false);
          break;
      }
      this.setState({ loadJobs: data });
    }, 0)
  }

  handleOrderChange = (e) => {
    setTimeout(() => {
      var cur = this.refs.order.state.value;
      
      var myData = [];
      if (cur == "Newest") {
       // myData = [].concat(this.state.loadJobs)
        myData = this.state.store
          .sort((a, b) => a.createdOn < b.createdOn)
      }
      else {
        myData = [].concat(this.state.loadJobs)
          .sort((a, b) => a.createdOn > b.createdOn)
      }
      this.setState({ loadJobs: myData });
      }, 0)         
    }

    page = () => {
      setTimeout(() => {
        var cur = this.refs.pn.state.activePage;
        var arr = this.state.store;
        if (arr.length > 6) {
          var arr_filter = (cur == 1) ? arr.filter(c => arr.indexOf(c) < 6) : arr.filter(c => arr.indexOf(c) > (cur - 1) * 6 - 1 && arr.indexOf(c) < cur * 6)
          this.setState({
            loadJobs: arr_filter,
          })
        }
        console.log(cur)
      }, 0)
    }

  close = async (id) => {
    var link = 'http://localhost:51689/listing/listing/closeJob/' + id;
    var cookies = Cookies.get('talentAuthToken');
    $.ajax({
      url: link,
      headers: {
        'Authorization': 'Bearer ' + cookies,
        'Content-Type': 'application/json'
      },
      body: {
        "id": id,        
      },
      type: "POST",
      contentType: "application/json",
      dataType: "json",
      success: function (res) {
       console.log(res)
      },
      error: function (res) {
        console.log("failure")
      }
    })
    this.loadData();
    loaderData.isLoading = false;
  }

  copy = async (job) => {
    var link = 'http://localhost:51689/listing/listing/createUpdateJob';
    var cookies = Cookies.get('talentAuthToken');
    $.ajax({
      url: link,
      headers: {
        'Authorization': 'Bearer ' + cookies,
        'Content-Type': 'application/json'
      },
      body: {
        "id": "",        
        "title": job.title,
        "description": job.description,
        "summary": job.summary,
        "applicantDetails": job.applicantDetails,
        "jobDetails": job.jobDetails,        
      },
      type: "POST",
      contentType: "application/json",
      dataType: "json",
      success: function (res) {
        console.log(res)
      },
      error: function (res) {
        console.log("failure")
      }
    })
    this.loadData();
    loaderData.isLoading = false;
  }
    
  render() {
    
    var time = Date.now();

    const items = this.state.loadJobs.map(d =>
      (
        <Card key={d.id}>          
          <Card.Content>
            <Label as='a' color='orange' icon='user' content='0' ribbon='right'/>
            <Card.Header>{d.title}</Card.Header>
            <Card.Meta>{`${d.location.city} ${d.location.country}`}</Card.Meta>              
            <Card.Description>{d.summary}</Card.Description>
            <br />
            <br />
            {d.Expiry &&
              <Label color='red' content='expired' attached='bottom left' />}
            {d.status === 1 &&
              <Label color='red' content='closed' attached='bottom left' />}

            <Menu compact floated='right' size='mini' color='blue' >
              <Menu.Item as='a' onClick={(e) => this.close(d.id, e)} >
                <Icon name='ban' />Close
              </Menu.Item>
              <Menu.Item as='a' onClick={(e) => this.edit(d.id, e)} >
                <Icon name='edit' />Edit
              </Menu.Item>
              <Menu.Item as='a' onClick={(e) => this.copy(d, e)} >
                <Icon name='copy' />Copy
              </Menu.Item>
            </Menu>                       
                        
            </Card.Content>          
        </Card>       
      )
    );
        const filOpts = [
          { key: 'active', text: "Show Active", value: 'active' },
          { key: 'closed', text: "Show Closed", value: 'closed' },
          { key: 'expired', text: "Show Expired", value: 'expired' },
          { key: 'unexpired', text: "Show Unexpired", value: 'unexpired' },
        ]                                                 
        const dateOpts = [
          { key: 'Newest', text: "Newest First", value: 'Newest' },
          { key: 'Oldest', text: "Oldest First", value: 'Oldest' }
        ]    
        return (
          <BodyWrapper reload={this.init} loaderData={this.state.loaderData}>
            <div style={{padding:"3em"}} >
            <h1>List of Jobs</h1>
            <span><i className="icon filter" /> Filter:
                  <Dropdown
                  ref='filter'
                  onChange={this.handleFilterChange}
                  placeholder='Choose Filter'
                  selection
                  options={filOpts}
                />               
                <i className="calendar alternate outline icon" /> Sort by Date:
                  <Dropdown
                  ref='order'
                  onChange={this.handleOrderChange}
                  placeholder='Newest First'                 
                  selection
                  options={dateOpts}
                  />
              </span>
              <br />
              <br />
              <Card.Group itemsPerRow={3} centered>
                {items}
              </Card.Group>
              <br />
              <br />
            <Pagination
              className="fluid"
              color="blue"
              ref="pn"
              onClick={(e) => this.page(e)}
              defaultActivePage={1}
              ellipsisItem={{ content: <Icon name='ellipsis horizontal' />, icon: true }}
              firstItem={{ content: <Icon name='angle double left' />, icon: true }}
              lastItem={{ content: <Icon name='angle double right' />, icon: true }}
              prevItem={{ content: <Icon name='angle left' />, icon: true }}
              nextItem={{ content: <Icon name='angle right' />, icon: true }}
              totalPages={this.state.totalPages}
              />
              </div>
            </BodyWrapper>
        )
    }
}
