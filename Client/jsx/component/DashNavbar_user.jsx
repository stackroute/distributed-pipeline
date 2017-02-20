import React from 'react';

import AppBar from 'material-ui/AppBar';

import FlatButton from 'material-ui/FlatButton';

import Request from 'superagent';

import cookie from 'react-cookie';

import {Link,hashHistory} from 'react-router';

import Drawer from 'material-ui/Drawer';

import MenuItem from 'material-ui/MenuItem';

import ActionDashboard from 'material-ui/svg-icons/action/dashboard';

import ActionSearch from 'material-ui/svg-icons/action/search';

import IconButton from 'material-ui/IconButton';

class DashNavbar_user extends React.Component{

constructor(){

super();

this.state = {

open: false

};

this.handleLogout = this.handleLogout.bind(this);

this.handleToggle=this.handleToggle.bind(this);

}

handleToggle(){

this.setState({

open: !this.state.open

});

}

handleLogout()

{

cookie.remove("access_token");
cookie.remove("type");

}

render(){

return(

<div>

<AppBar title="Octopus"   onLeftIconButtonTouchTap={this.handleToggle}

iconElementRight={ <Link to="/"><FlatButton label="Logout" onClick={this.handleLogout}/></Link> }/>

<Drawer docked={false} width={250} open={this.state.open} >

<Link to="/monitori">

<MenuItem onTouchTap={this.handleToggle}>

<IconButton><ActionSearch/></IconButton>

<FlatButton label='Monitoring' hoverColor='#e8f1fb ' labelStyle={{

textAlign: 'left'

}} style={{

fontSize: '50px',

marginTop: '4px'

}}/>

</MenuItem>

</Link>

<Link to='/pipeline'>

<MenuItem onTouchTap={this.handleToggle}>

<IconButton><ActionDashboard/></IconButton>

<FlatButton label='Initiate' hoverColor='#e8f1fb ' labelStyle={{

textAlign: 'left'

}} style={{

fontSize: '50px',

marginTop: '4px'

}}/></MenuItem>

</Link>



</Drawer>

{this.props.children}

</div>

);}

}

export default DashNavbar_user;