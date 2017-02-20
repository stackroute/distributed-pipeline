var React = require('react');
var ReactDOM = require('react-dom');
var yamlLint = require('yaml-lint');
var yaml = require('js-yaml');
import RaisedButton from 'material-ui/RaisedButton';
import Graph from './graph.jsx';
import Dialog from 'material-ui/Dialog';
import brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/yaml';
import 'brace/theme/tomorrow';
import AppBar from 'material-ui/AppBar';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import TransformationFunc from './TransformationFunc.jsx';



var doc;
var edge = new Array();
var node = new Array();
var x1 = 100,y1=100;
const styles = {
	 button: {
		 margin: 20,
	 },
	 exampleImageInput: {
		 cursor: 'pointer',
		 position: 'absolute',
		 top: 0,
		 bottom: 0,
		 right: 20,
		 left: 0,
		 width: '100%',
		 opacity: 0,
	 },
};

class AddTemplateEdit extends React.Component
{
	constructor(props)
	{
		super(props);

		this.updateCode = this.updateCode.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleVisualise = this.handleVisualise.bind(this);
		this.updateFilename=this.updateFilename.bind(this);
		this.handleClose = this.handleClose.bind(this);
		this.showFileName=this.showFileName.bind(this);
		this.state={open:false,graph:'',jsonCode:'',filename:'',code:"write your workflow here",err:[],isValid:false, isSubmit:false}

	}



	handleClose()
	{
		this.setState({open:false});
	}



	split()
	{
		var obj = doc.stages;

		var jsonArray=[];
		var incr =1;

		var array = Object.getOwnPropertyNames(obj);
		var json= {"nodes":[],"edges":[]};
		array.map(function(item){
		var temp = {
			id : incr,
			title:item,
			x:x1,
			y:y1,
			type:"empty"
		}

		x1+=100;
		y1=y1+(Math.random()* (100 - (-100)) + (-100));
		console.log("y1"+y1);

		incr++;
		json.nodes.push(temp);
		node.push(item);
		var props = Object.getOwnPropertyNames(item);
		edge.push(obj[item].depends_on);
	});


			for(var i in node)
			{
				if(edge[i]!=null)
				{
					if(edge[i].length<2)
					{

					//console.log(node[i] + " index "+(node.indexOf(node[i])+1) +" depends_on "+ (node.indexOf(edge[i].toString())+1));
					var temp = {
						source:node.indexOf(node[i])+1,
						target:(node.indexOf(edge[i].toString())+1),
						type:"emptyEdge"
					}
					json.edges.push(temp);
					}
					else
					{
						for(var k in edge[i])
						{
							//console.log("separate printing====>"+node.indexOf(edge[i][k]));
							//console.log(node[i] +" index "+node.indexOf(node[i])+" depends_on "+ edge[i][k]+" index "+node.indexOf(edge[i][k]));
							var temp = {
						source:(node.indexOf(node[i])+1),
						target:(node.indexOf(edge[i][k])+1),
						type:"emptyEdge"
								}
								json.edges.push(temp);
						}
					}
				}


			}

	var temp = <Graph data={json}/>
	this.setState({graph:temp});
	this.setState({open:true});

	}
	handleVisualise()
	{
		doc = yaml.safeLoad(this.state.code);
		console.log(doc);
		this.split();
	}


		handleSubmit()
		{

			var that = this;
			yamlLint.lint(this.state.code).then(function () {
				that.setState({
					isValid: true,
					isSubmit:true,
				});
				that.setState({err:[]	})
				alert('Valid File!!! File Submitted');
			}).catch(function (error) {
				var errtext=error.message;
				var startindex=error.message.indexOf("at line") + 8;
				var endindex=error.message.indexOf("column")-2;

				var errrow=error.message.substring(startindex,endindex)-1;
				var myerror=[{ row: errrow, column: 2, type: 'error', text:errtext }];
				that.setState({isValid:false});
				that.setState({err:myerror})
				alert('Invalid file!!! correct the error.');
				console.log(error.message);
			});

		}

		updateCode(newCode)
		{
			this.setState({code:newCode});
		}


		showFileName(e) {
      var temp = e.target.files[0];
      var ext = temp.name.split('.').pop().toLowerCase();
      if(ext!="yml")
      {
        alert('Not a yml file');
      }
      else {
        var fil = document.getElementById("myFile");
        var that = this;
        this.setState({filename:fil.value});
        this.setState({isValid:true});
        var reader = new FileReader();
  			reader.onload = function(event) {
            that.setState({code:event.target.result});
  			};
  			reader.readAsText(temp);

      }
    }

		updateFilename(e)
		{
			this.setState({filename:e.target.value});
		}
		render () {

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
					onTouchTap={this.handleClose}
					/>,
			];
			var myerr=[{ row: 1, column: 2, type: 'error', text: 'Some error.'}];

			var box=null;

			if(this.state.isSubmit)
			{
				box= <TransformationFunc fileName={this.state.filename} content={this.state.code}/>;
			}
			else
			{

				box= <div className="container" style={{width:"auto"}}>
					<div className="row" >
						<AceEditor
							mode="yaml"
							theme="tomorrow"
							value={this.state.code}
							onChange={this.updateCode}
							name="UNIQUE_ID_OF_DIV"
							annotations={this.state.err}
							editorProps={{$blockScrolling: true}}
							style={{border:"1px solid black",margin:"1%",width:"60%"}}
							/>
					</div>
					<div className="row">
						<TextField
				      hintText="Enter File Name"
				      floatingLabelText="File Name"
				      floatingLabelFixed={true}
							value={this.state.filename}
							onChange={this.updateFilename}
				    />
						<RaisedButton
							label="Browse Template"
							labelPosition="before"
							style={styles.button}
							containerElement="label" primary={true}>
							<input type="file" id="myFile" style={styles.exampleImageInput} onChange={this.showFileName}/>
						</RaisedButton>
					</div>

					<div className="row" style={{textAlign:"left"}}>
						<RaisedButton label="Submit" secondary={true} onClick={this.handleSubmit} style={{margin:"1%"}} />
						<RaisedButton label="Visualise" primary={true} onClick={this.handleVisualise} style={{margin:"1%"}} />

						<Dialog
							title="Dialog With Actions"
							actions={actions}
							modal={false}
							open={this.state.open}
							onRequestClose={this.handleClose}>
							{this.state.graph}
						</Dialog>
					</div>

				</div>
			}


			return (
				<div>
					{box}
				</div>

			);
		} //end of render
	} //end of class TemplateEditor

	export default AddTemplateEdit;
