import React from 'react';
import AppBar from 'material-ui/AppBar';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import {Grid,Row,Col} from 'react-flexbox-grid';
import {List, ListItem} from 'material-ui/List';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import cookie from 'react-cookie';
import Request from 'superagent';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import {Link, hashHistory} from 'react-router';
import io from 'socket.io-client';
import HtmlHint from './HtmlHint.jsx';
import Build from './Build.jsx';
import Eslint from './Eslint.jsx';
import Mocha from './Mocha.jsx';
import CodeCoverage from './CodeCoverage.jsx';

const styles = {
  button: {
    margin: 12,
    align:"center"
  },
  paper:{
 textAlign: 'center',
 display: 'inline-block',
  },
  exampleImageInput: {
    cursor: 'pointer',
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    width: '100%',
    opacity: 1,
  },
  inputField:{
    align:"center"
  },
  progress:{
    marginTop:'50px',
    marginLeft:'50px'
  }
};
export default class AdminInitiate extends React.Component {
    constructor(props)
    {
        super();
        this.state={input:'',completed:0, isSubmit:false,output:null,socket: io.connect('http://localhost:3000/monitor'),open: false,UserName:'user',repos:[],repoUrl:'',selectedRepo:'',testedRepo:[]};
        this.handleRepo = this.handleRepo.bind(this);
        this.handleType = this.handleType.bind(this);
        this.handleUrl = this.handleUrl.bind(this);
        this.handleLogout=this.handleLogout.bind(this);
        this.handleOpen = this.handleOpen.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    handleType(e)
    {
        this.setState({selectedRepo:e.target.value});
        this.setState({repoUrl:e.target.value});
    }
    handleRepo()
    {
        var array = this.state.testedRepo;
        console.log(this.state.repoUrl);
        var temp = this.state.repoUrl.split('/');
        array.push(temp[3]+"/"+temp[4]);
        this.setState({testedRepo:array});
        {this.handleSubmit()}
    }

    handleOpen ()
    {
    this.setState({open: true});
    }

    handleType(e)
    {
        this.setState({selectedRepo:e.target.value});
        this.setState({repoUrl:e.target.value});
    }
    handleRepo()
    {
        var array = this.state.testedRepo;
        console.log(this.state.repoUrl);
        var temp = this.state.repoUrl.split('/');
        array.push(temp[3]+"/"+temp[4]);
        this.setState({testedRepo:array});
        {this.handleSubmit()}
    }

    handleOpen ()
    {
    this.setState({open: true});
    }

    handleClose()
    {
    this.setState({open: false});
  }
    handleSubmit()
    {
        this.setState({open: false});
        Request.post('/initiate').set('Accept','application/json').send({data:this.state.selectedRepo,templateName:'CI-Template'})
        .end((err,res)=>{
            if(err || !res.ok)
                console.log(err);
            else
                console.log(res.text)
        })
    }
    handleLogout()
    {
        cookie.remove("access_token");
        cookie.remove("type");
    }

    handleUrl(e)
    {
        var temp = "http://github.com/"+e;
        this.setState({selectedRepo:temp})
        var that = this;
         Request.get('/userjoblist').set('Accept', 'application/json').send({user:this.state.UserName,repoUrl:temp}).end(function(err, res) {
            if (err || !res.ok)
                alert('Oh no! error');
            else {
                    console.log(res.text.length);
                    if(res.text=='[]')
                    {
                        console.log(that);
                        {that.handleOpen()}
                    }
                 }
             })

    }

    componentWillMount()
    {
        var gitDetails=[];
        var tempRepos=[];
        var uName,aUrl;
        var that=this;
        console.log(cookie.load("repos_url")+"-------");
        Request.get(cookie.load("repos_url")).set('Accept', 'application/json').end(function(err, res) {
            if (err || !res.ok)
                alert('Oh no! error');
            else {
                    gitDetails=res.body;
                    gitDetails.map((item)=>{
                    tempRepos.push(item.full_name);
                    uName=item.owner.login;
                    aUrl=item.owner.avatar_url;
                    })
                    that.setState({repos:tempRepos});
                    that.setState({UserName:uName});
                 }
             })

    }
    handleSubmit(){
      this.setState({open: false});
      this.setState({isSubmit:true});
      var that=this;
      Request.post('/initiate').set('Accept','application/json').send({data:that.state.selectedRepo,templateName:'CI-Pipeline.yml'})
      .end(function(err, res){
           if (err || !res.ok) {
             alert('Oh no! error');
           } else {
             console.log(res.text);//getting the jobId
             var userid=cookie.load('user');
             console.log("cookie",userid);
             var socket = that.state.socket;
             socket.emit('getjobstatus', {jobId:res.text,userId:userid});
                  socket.on('report', function(data) {
                      if (data.status === 'Monitoring Stopped') {
                          that.setState({stageArr: (
                                  <h1>Monitoring Stopped</h1>
                              )});
                      } else {
                          console.log(data.jobId, data.stageName, data.status);
                          switch (data.stageName) {
                              case 'build':
                                  that.setState({stageArr1: (<Build res={data}/>)});
                                  that.setState({stage1:data.status})
                                  break;
                              case 'eslint':
                                  that.setState({stageArr2: (<Eslint res={data}/>)});
                                  that.setState({stage2:data.status})
                                  break;
                              case 'htmlhint':
                                  that.setState({stageArr3: (<HtmlHint res={data}/>)});
                                  that.setState({stage3:data.status})
                                  break;
                              case 'code-coverage':
                                  that.setState({stageArr4: (<CodeCoverage res={data}/>)});
                                  that.setState({stage4:data.status})
                                  break;
                              case 'whitebox':
                                  that.setState({stageArr5: (<Mocha res={data}/>)});
                                  that.setState({stage5:data.status})
                                  break;
                              default:
                                  that.setState({stageArr6: (
                                          <div>
                                              <h2 style={{color:'#FFA500'}}>{data.jobId} Status:{data.status}</h2>

                                          </div>

                                      )});
                                      that.setState({stage6:data.status});
                                      break;
                          }
                      }
                  });
         }
       });
}
  render(){
    var box=null;
    console.log(this.state.stage1);
      if(this.state.isSubmit){
      box=<div >
        {this.state.stageArr6}
        {this.state.stageArr1}
        {this.state.stageArr2}
        {this.state.stageArr3}
        {this.state.stageArr4}
        {this.state.stageArr5}
            </div>
    }


        const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleClose}
      />,
      <FlatButton
        label="Submit"
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.handleSubmit}
      />,
    ];
    return (
        <div>
          <Grid style={{marginTop:"1%"}}>
             <Row >
             <Col xs={12} sm={12} md={12} lg={12}>
                    <TextField value={this.state.selectedRepo} floatingLabelText="Enter your git repo url" onChange={this.handleType}/>
                    <RaisedButton label="Submit" secondary={true} style={{marginLeft:"2%"}} onClick={this.handleRepo}/>
             </Col>
             </Row>
                <Row style={{marginTop:"1%"}}>
                  <Col lg={5} md={5} sm={7} xs={12}>
                    {box}
                 </Col>
                 <Col lgOffset={8} lg={5} md={5} mdOffset={8} sm={7} smOffset={8}  xs={12}>

                    <Card>
                        <CardHeader title="Your Repositories" style={{backgroundColor:"#BDBDBD"}}/>
                            <CardText>
                                <List>
                                {this.state.repos.map(text=>
                                    <ListItem key={text}  primaryText={text} onClick={()=>this.handleUrl(text)}/>
                                )}
                                </List>
                            </CardText>
                    </Card>
                 </Col>
            </Row>
            <Row style={{marginTop:"1%"}}>
            <Col lgOffset={8} lg={5} md={5} mdOffset={8} sm={7} smOffset={8}  xs={12}>
            <Card style={{marginTop:"5%"}}>
                        <CardHeader title="Tested Repositories" style={{backgroundColor:"#BDBDBD"}}/>
                            <CardText>
                                <List>
                                {this.state.testedRepo.map(text=>
                                    <ListItem key={text}  primaryText={text} onClick={()=>this.handleUrl(text)}/>
                                )}
                                </List>
                            </CardText>
                    </Card>
            </Col>
            </Row>

        </Grid>
        <Dialog
          title="It seems no results associated with this repo. Do you wish to test this repo?"
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}>
        </Dialog>
         </div>);
  }
}
