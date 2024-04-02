/*
    CIRCLE BUTTON
*/
function radioButton(port, index, name){
  if(name == "Not Started"){
    var space = 100
    var buttonWidth = (index - 300) / 2
  }else if(name == "In Progress"){
    var space = 200
    var buttonWidth = (index - 300) / 2
  }else{
    var space = 300
    var buttonWidth = (index - 300) / 2
  }

    var button  = new joint.elementTools.Button({
      markup: [
        {
          tagName: 'circle',
          attributes: {
            'id': port.id,
            'r': 10,
            'fill': 'white', // Button background color
            'stroke': 'black', // Button border color
            'stroke-width': 2, // Button border width
            'cursor': 'pointer',
          }
        },
        {
          tagName: 'text',
          selector: 'label',
          textContent: name, // Text displayed on the button
          attributes: {
            'fill': 'black', // Text color
            'font-size': '15px',
            'font-family': 'Arial',
            'text-anchor': 'middle',
            'x':-45,
            'y': -10, // Adjust text position
            'cursor': 'pointer',
          }
          },
      ],
      x:buttonWidth + space, // Set position based on index
      y: 80 , // Adjust y position based on index
      offset: { x: -8, y: -8 },
      action: function(evt, elementView) {
        radioButtonEvents(elementView, port)
      },
    });
    return button;
}


//This function takes in a list of ports that are to be embeded into the element,
//Make sure the port Ids of the ports are always different
//Creates a set of 3 circle buttons that are required in the Activities
function radioButtonView(portNameList, element, tools){
  var port1 = createPort(portNameList[0], 'out');
  var port2 = createPort(portNameList[1],'out');
  var port3 = createPort(portNameList[2], 'out');
  element.addPort(port1)
  element.addPort(port2)
  element.addPort(port3)
  tools.push(radioButton(port1, element.size().width, 'Not Started'))
  tools.push(radioButton(port2, element.size().width, 'In Progress'))
  tools.push(radioButton(port3, element.size().width, "Achieved"))
}
var i = 0
/*
  BUTTONS VIEW: Adds the button to the tools View
*/
function buttonView(portName, element){
  var port = createPort(portName, 'out', 'Port 3');
  var considerationPort = createPort("Considerations", "out", "Port 4")
  var subTopicPort = createPort("RDaF Subtopic", 'out', 'Port 5')
  // Add custom tool buttons for each port
  var tool = [];

  //Create the Button
  if(portName == "Considerations"){
    element.addPort(considerationPort)
    tool.push(createConsiderationButton(port))
  }if(portName == "Activities"){
    element.addPort(port);
    element.addPort(considerationPort)
    element.addPort(subTopicPort)
    tool.push(createConsiderationButton(considerationPort))
    tool.push(createButton(port))
    //Push the circle buttons to the same list
    var portNameList = ['NT1', "PG1", "AC1"]
    tool.push(radioButtonView(portNameList, element, tool))
    tool.push(createSubTopicButton(subTopicPort))
  }
  if(portName == "Outcomes"){
    element.addPort(port);
    tool.push(createButton(port))
  }
  if(portName == "Definition"){
    element.addPort(port);
    tool.push(createDefinitionButton(port))
  }
  if(Array.isArray(portName)){
    portName.forEach(ports =>{
      var port1 = createPort(ports, 'out', "Port3");
      element.addPort(port1)
      if(ports == "Participants"){
        tool.push(createParticipantsButton(port1))
      }
      if(ports == "Roles"){
        tool.push(createRolesButton(port1))
      }
      if(ports == "Methods"){
        tool.push(createMethodButton(port1))
      }
      if(ports == "Resources"){
        tool.push(createResourcesButton(port1))
      }
      if(ports == "Outputs"){
        tool.push(createOutputButton(port1))
      }
      if(ports == "RDaF Subtopic"){
        tool.push(createSubTopicButton(port1))
      }
    })
  }
  createElementView(element, tool)

}

function createElementView(element, tool){
  //Add the element to the graph
  graph.addCells(element);
  toolsView = new joint.dia.ToolsView({ tools: tool});
  //Create an element view
  var elementView = element.findView(paper)
  //Embed tthe tools view in to the element view
  elementView.addTools(toolsView);
}




/*
    CONSIDERATION BUTTON
*/
function createConsiderationButton(port,pos) {
    var button  = new joint.elementTools.Button({
      markup: [
        {
          tagName: 'rect',
          selector: 'button',
          attributes: {
              'id': port.id,
              'width': 115,
              'height': 20,
              'fill': '#005C90', // Button background color
              'stroke': 'black', // Button border color
              'stroke-width': 2, // Button border width
              'cursor': 'pointer'
          }
        },
          {
            tagName: 'text',
            selector: 'text',
            textContent: port.id, // Text displayed on the button
            attributes: {
              'fill': 'white', // Text color
              'font-size': '15px',
              'font-family': 'Arial',
              'font-weight':'bold',
              'text-anchor': 'middle',
              'x':56,
              'y': 15, // Adjust text position
              'cursor': 'pointer'
          }
        }
      ],
      x: "100%", // Button position X
      y: "50%", // Button position Y
      //ffset: { x: -8, y: -8 },
      action: function(evt,elementView) {
        //Event Handle for the button.
        toggelButton(this.model, `${port.id}`)
      },
    });
    return button;
}

function createSubTopicButton(port, pos){
  var button  = new joint.elementTools.Button({
    markup: [
      {
        tagName: 'rect',
        selector: 'button',
        attributes: {
            'id': port.id,
            'width': 100,
            'height': 20,
            'fill': 'lightgrey', // Button background color
            'stroke': 'black', // Button border color
            'stroke-width': 2, // Button border width
            'cursor': 'pointer'
        }
      },
        {
          tagName: 'text',
          selector: 'text',
          textContent: port.id, // Text displayed on the button
          attributes: {
            'fill': 'black', // Text color
            'font-size': '12px',
            'font-weight': 'bold',
            'font-family': 'Arial',
            'text-anchor': 'middle',
            'x':47,
            'y': 15, // Adjust text position
            'cursor': 'pointer'
        }
      }
    ],
    x: "0%", // Button position X
    y: "0%", // Button position Y
    offset: { x: -8, y: -8 },
    action: function(evt,elementView) {
      //Event Handle for the button.
    },
  });
  return button;
}




/*
    GENERIC BUTTONS
*/
function createButton(port,pos) {
    var button  = new joint.elementTools.Button({
      markup: [
          {
              tagName: 'rect',
              selector: 'button',
              attributes: {
                  'id': port.id,
                  'width': 115,
                  'height': 20,
                  'fill': '#005C90', // Button background color
                  'stroke': 'black', // Button border color
                  'stroke-width': 2, // Button border width
                  'cursor': 'pointer'
              }
          },
          {
              tagName: 'text',
              selector: 'text',
              textContent: port.id, // Text displayed on the button
              attributes: {
                'fontweight':'bold',
                  'fill': 'white', // Text color
                  'font-size': '15px',
                  'font-family': 'Arial',
                  'text-anchor': 'middle',
                  'x': 55,
                  'y': 15, // Adjust text position
                  'cursor': 'pointer'
              }
          }
      ],
      x: "100%", // Button position X
      y: "20%", // Button position Y
      action: function(evt, elementView) {
        toggelButton(this.model, `${port.id}`)
      },
    });
    return button;
}


function createDefinitionButton(port,pos) {
  var button  = new joint.elementTools.Button({
    markup: [
      {
        tagName: 'rect',
        selector: 'button',
        attributes: {
            'id': port.id,
            'width': 70,
            'height': 20,
            'fill': 'black', // Button background color
            'stroke': 'black', // Button border color
            'stroke-width': 2, // Button border width
            'cursor': 'pointer'
        }
      },
        {
          tagName: 'text',
          selector: 'text',
          textContent: port.id, // Text displayed on the button
          attributes: {
            'fill': 'black', // Text color
            'font-size': '15px',
            'font-family': 'Arial',
            'text-anchor': 'middle',
            'fill': 'white',
            'x':35,
            'y': 15, // Adjust text position
            'cursor': 'pointer'
        }
      }
    ],
    x: "80%", // Button position X
    y: "45%", // Button position Y
    offset: { x: -8, y: -8 },
    action: function(evt,elementView) {
      //Event Handler for the button.
    },
  });
  return button;
}

function createMethodButton(port,pos) {
  var button  = new joint.elementTools.Button({
    markup: [
        {
            tagName: 'rect',
            selector: 'button',
            attributes: {
                'id': port.id,
                'width': 115,
                'height': 20,
                'fill': '#005C90', // Button background color
                'stroke': 'black', // Button border color
                'stroke-width': 2, // Button border width
                'cursor': 'pointer'
            }
        },
        {
            tagName: 'text',
            selector: 'text',
            textContent: port.id, // Text displayed on the button
            attributes: {
              'fontweight':'bold',
                'fill': 'white', // Text color
                'font-size': '15px',
                'font-family': 'Arial',
                'text-anchor': 'middle',
                'x': 55,
                'y': 15, // Adjust text position
                'cursor': 'pointer'
            }
        }
    ],
    x: "85%", // Button position X
    y: "0%", // Button position Y
    action: function(evt, elementView) {
      toggelButton(this.model, `${port.id}`)
    },
  });
  return button;
}

function createRolesButton(port,pos) {
  var button  = new joint.elementTools.Button({
    markup: [
        {
            tagName: 'rect',
            selector: 'button',
            attributes: {
                'id': port.id,
                'width': 115,
                'height': 20,
                'fill': '#005C90', // Button background color
                'stroke': 'black', // Button border color
                'stroke-width': 2, // Button border width
                'cursor': 'pointer'
            }
        },
        {
            tagName: 'text',
            selector: 'text',
            textContent: port.id, // Text displayed on the button
            attributes: {
              'fontweight':'bold',
              'fill': 'white', // Text color
              'font-size': '15px',
              'font-family': 'Arial',
              'text-anchor': 'middle',
              'x': 55,
              'y': 15, // Adjust text position
              'cursor': 'pointer'
            }
        }
    ],
    x: "85%", // Button position X
    y: "20%", // Button position Y
    action: function(evt, elementView) {
      toggelButton(this.model, `${port.id}`)
    },
  });
  return button;
}

function createParticipantsButton(port,pos) {
  var button  = new joint.elementTools.Button({
    markup: [
        {
            tagName: 'rect',
            selector: 'button',
            attributes: {
                'id': port.id,
                'width': 115,
                'height': 20,
                'fill': '#005C90', // Button background color
                'stroke': 'black', // Button border color
                'stroke-width': 2, // Button border width
                'cursor': 'pointer'
            }
        },
        {
            tagName: 'text',
            selector: 'text',
            textContent: port.id, // Text displayed on the button
            attributes: {
              'fontweight':'bold',
              'fill': 'white', // Text color
              'font-size': '15px',
              'font-family': 'Arial',
              'text-anchor': 'middle',
              'x': 55,
              'y': 15, // Adjust text position
              'cursor': 'pointer'
            }
        }
    ],
    x: "85%", // Button position X
    y: "40%", // Button position Y
    action: function(evt, elementView) {
      toggelButton(this.model, `${port.id}`)
    },
  });
  return button;
}

function createOutputButton(port,pos) {
  var button  = new joint.elementTools.Button({
    markup: [
        {
            tagName: 'rect',
            selector: 'button',
            attributes: {
                'id': port.id,
                'width': 115,
                'height': 20,
                'fill': '#005C90', // Button background color
                'stroke': 'black', // Button border color
                'stroke-width': 2, // Button border width
                'cursor': 'pointer'
            }
        },
        {
            tagName: 'text',
            selector: 'text',
            textContent: port.id, // Text displayed on the button
            attributes: {
              'fontweight':'bold',
              'fill': 'white', // Text color
              'font-size': '15px',
              'font-family': 'Arial',
              'text-anchor': 'middle',
              'x': 55,
              'y': 15, // Adjust text position
              'cursor': 'pointer'
            }
        }
    ],
    x: "85%", // Button position X
    y: "80%", // Button position Y
    action: function(evt, elementView) {
      toggelButton(this.model, `${port.id}`)
    },
  });
  return button;
}


function createResourcesButton(port,pos) {
  var button  = new joint.elementTools.Button({
    markup: [
        {
            tagName: 'rect',
            selector: 'button',
            attributes: {
                'id': port.id,
                'width': 115,
                'height': 20,
                'fill': '#005C90', // Button background color
                'stroke': 'black', // Button border color
                'stroke-width': 2, // Button border width
                'cursor': 'pointer'
            }
        },
        {
            tagName: 'text',
            selector: 'text',
            textContent: port.id, // Text displayed on the button
            attributes: {
              'fontweight':'bold',
              'fill': 'white', // Text color
              'font-size': '15px',
              'font-family': 'Arial',
              'text-anchor': 'middle',
              'x': 55,
              'y': 15, // Adjust text position
              'cursor': 'pointer'
            }
        }
    ],
    x: "85%", // Button position X
    y: "60%", // Button position Y
    action: function(evt, elementView) {
      toggelButton(this.model, `${port.id}`)
    },
  });
  return button;
}