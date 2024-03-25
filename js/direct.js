const { dia, elementTools, shapes, linkTools, util } = joint;

// Global Vars
var graph;
var paper;
var root = [];
var models = [];
var duplicateFrame = [];
var multiParentElementIds = {};

// initialize 
init(); 

function buildTheGraph(){
  var Elements = [];
  fetch('./data/json-ld/graph.jsonld')
    .then(response => response.json())
     // specifying a frame allows you to set the shape of the graph you want to navigate
    .then(data => jsonld.frame(data,
    {
        "@context": {
            "name": "https://schema.org/name",
            "additionalType": "https://schema.org/additionalType",
            "description": "https://schema.org/description",
            "sunyrdaf": "https://data.suny.edu/vocabs/oried/rdaf/suny/",
            "sunyrdaf:includes": {
                "@type": "@id"
            },
            "sunyrdaf:resultsFrom": {
                "@type": "@id"
            },
            "sunyrdaf:generates": {
              "@type": "@id"
            },
            "sunyrdaf:extends": {
              "@type": "@id"
            },
            "sunyrdaf:Method":{
              "@type": "@id"
            },
            "sunyrdaf:Participant":{
              "@type": "@id"
            },
            "sunyrdaf:Activity":{
              "@type": "@id"
            },
        },
    })).then(frame => {
      // example of pulling a single Outcome and linked Activity from the input data file
      // in reality we want to navigate the entire graph
      const frameArray = frame['@graph']
      duplicateFrame = frameArray
      frameArray.forEach(node =>{
        if(node['additionalType'] == "RdAF Stage"){
          var stage = linkNodes(node, Elements, "", "Stages")
          stage.position(100,100)
          graph.addCells(stage)
          root.push(stage)
          topic = node['sunyrdaf:includes']
          if(Array.isArray(topic)){
            topic.forEach(topicObj =>{
              var tools = [];
              if(topicObj){
                //Creates the topic
                var topicElement = linkNodes(topicObj, Elements, stage, "Topics")
                const w = topicElement.size().width
                const h = topicElement.size().height
                topicElement.size(w + 200, h)
                //Elements.push(topicElement)
                if(topicObj["sunyrdaf:includes"]){
                  //Creates the consideration button if a topic includes consideration
                  var port3 = createPort('Considerations', 'out');
                  // Add custom tool buttons for each port
                  topicElement.addPort(port3);// Adds a port to the element
                  const considerationButton = createConsiderationButton(port3)
                  considerationButton.options.x = "85%"
                  tools.push(considerationButton)//Create the button
                }
                var port2 = createPort('Outcomes', 'out');
                // Add custom tool buttons for each port
                topicElement.addPort(port2);
                const outcomeButton = createButton(port2)
                outcomeButton.options.x = "85%"
                tools.push(outcomeButton)//Creates the Outcome button
                graph.addCells(topicElement);
                let toolsView = new joint.dia.ToolsView({ tools: tools}); 
                topicElement.findView(paper).addTools(toolsView);
                checkOutcomes(topicObj, Elements, topicElement)
                createTextBlock(topicElement,topicObj, stage )
              }
            })
          }
        }
    });
    paper.setInteractivity(false);
    graph.addCells(Elements)
    // Perform layout after setting positions
    models = Elements
    doLayout();
  })
}

//If we want to use a pre-defined algorithm to traverse over the tree and create the tree, we will still need seperate functions for each and every type of node,
//Beacuse this will allows use to interact with the node later using its type when we put the buttons in function.
/**
 * Create and link Outcome elements 
 * @param {Object} topic - the JSON-LD topic node
 * @param {Object[]} arr - list of JointJS shapes created so far
 * @param {Object} parentNode - the JointJS shape that is the parent of this topic
 *
 */
function checkOutcomes(topic, arr, parentNode){
  //Creates all the Outcomes that are generated by the topic
  for (const key in topic){
    if(key.startsWith('sunyrdaf')){
      if(key == "sunyrdaf:generates"){
        if(Array.isArray(topic[key])){
          topic[key].forEach(outcome =>{
            const outcomeElement = linkNodes(outcome, arr, parentNode, "Outcomes")
            //Check for activities in the outcome
            checkForActivities(outcome, arr, outcomeElement)
          })
        }else{ //Condition if the topic has generated only one outcome
          const outcomeElement = linkNodes(topic[key], arr, parentNode, "Outcomes")
          //Check for activities in the outcome
          checkForActivities(topic[key], arr, outcomeElement)
        }
      }else if(key == "sunyrdaf:includes"){
        //Creates consideration elements if a topic includes considerations
        checkForConsiderations(topic[key], arr, parentNode);
      }
    }

  }

}

function createTextBlock(element, node, parentNode){
  var parentElementView = paper.findViewByModel(parentNode)
  var elementView = paper.findViewByModel(element)
  var bbox = parentElementView.model.getBBox();
  var paperRect1 = paper.localToPaperRect(bbox);
  // Draw an HTML rectangle above the element.
  var div = document.createElement('div');
  parentElementView.el.style.position = "relative"
  div.style.position = 'absolute';
  div.style.background = 'white';
  div.textContent = node['description']
  var length = element * 2
  div.style.width = (300) + 'px';
  div.style.height = (length) + 'px';
  div.style.border = "1px solid black";
  div.style.fontWeight = "bold"
  div.style.fontSize = "20px"
  div.id = element.id
  div.style.fontFamily = "Cambria"
  div.style.lineBreak = 0.5
  div.style.visibility = "hidden"
  div.style.backgroundColor = "lightgrey"
  if(node['description'] != null){
    paper.el.appendChild(div);
  }else{
    if(elementView.model.attributes.name['first'] == "Considerations"){
      elementView.removeTools()
    }
    console.warn()
  }

}

//Function to create considerations nodes
function checkForConsiderations(outcome, arr, parentNode){

  if(Array.isArray(outcome)){
    //Condition to handle topics that includes multiple considerations
    outcome.forEach(considerations =>{
      if (considerations['name'] == undefined) {
        for (const nodes of duplicateFrame) {
            if (nodes['@id'] == considerations) {
                const considerationElement = linkNodes(nodes, arr, parentNode, "Considerations");
                createTextBlock(considerationElement, nodes, parentNode)
                if(considerationElement){
                  return considerationElement;
                }else{
                  console.error("Considerations undefined")
                }
            }
        }
      }else {
          const considerationElement = linkNodes(considerations, arr, parentNode, "Considerations");
          createTextBlock(considerationElement, considerations, parentNode)
          if(considerationElement){
            return considerationElement;
          }else{
            console.error("Considerations undefined")
          }
      }
    })
  }else{ //Condition to handle topics that includes a single considerations
    if(outcome['name'] == undefined){
      for (const nodes of duplicateFrame) {
          if (nodes['@id'] == outcome) {
              const considerationElement = linkNodes(nodes, arr, parentNode, "Considerations");
              createTextBlock(considerationElement, nodes, parentNode)
              if(considerationElement){
                return considerationElement;
              }else{
                console.error("Considerations undefined")
              }
          }
      }
    }else{
      const considerationElement = linkNodes(outcome, arr, parentNode, "Considerations")
      createTextBlock(considerationElement, outcome, parentNode)
      if(considerationElement){
        return considerationElement;
      }else{
        console.error("Considerations undefined")
      }
    }
  }
}

//Function to Create activity nodes that are the results of the ouctomes generated
function checkForActivities(outcome, arr, parentNode){
  var portName = ['NT1', "PG1", "AC1"]
  const embedButton = buttonView("Activities", parentNode, portName)
  for (const key in outcome){
    if(key.startsWith('sunyrdaf')){
      if(key == "sunyrdaf:resultsFrom"){
        if(Array.isArray(outcome)){ //Conditions to create multiple activities
          outcome[key].forEach(activity =>{
            const activityElement = linkNodes(activity, arr, parentNode, "Activities")
          })
        }else{// Condition to create a single activity
          if(outcome[key]['name'] == undefined){
            duplicateFrame.forEach(nodes =>{
              if(nodes['@id'] == outcome[key]){
                const activityElement = linkNodes(nodes, arr, parentNode, "Activities")
              }
            })
          }else{
            const activityElement = linkNodes(outcome[key], arr, parentNode, "Activities")
          }
        }
      }else if(key == "sunyrdaf:includes"){
        const consideration = checkForConsiderations(outcome[key], arr, parentNode)
        var portName = ['Definition']
        if(consideration){
          //const embedButton = buttonView("Definition", consideration, portName)
        }else{
          console.error("Considerations Undefined")
        }
      }else if(key == "sunyrdaf:extends"){
        //Instead Of creating an element and a link for the subtopic, we have just used
        //the Name, description and the catalog number to define the subtopic into a textblock
        var subTopic = checkForSubTopics(outcome[key], arr, parentNode);
        if(subTopic != undefined){
          //This creates the si
          var nodeCellView = paper.findViewByModel(parentNode)
          var bbox = nodeCellView.model.getBBox();
          var paperRect1 = paper.localToPaperRect(bbox);
          // Draw an HTML rectangle above the element.
          var div = document.createElement('div');
          nodeCellView.el.style.position = "relative"
          div.style.position = 'absolute';
          div.style.background = 'white';
          div.textContent = subTopic
          var length = subTopic * 2
          div.style.width = ((paperRect1.width)/2) + 'px';
          div.style.height = (length) + 'px';
          div.style.border = "1px solid black";
          div.style.fontWeight = "bold"
          div.style.fontSize = "20px"
          div.id = parentNode.id
          div.style.fontFamily = "Cambria"
          div.style.lineBreak = 0.5
          div.style.visibility = "hidden"
          paper.el.appendChild(div);

        }
      }
    }
  }
}
//This function creates the subtopic
/*
  For now the subtopics are linked to its paretnode because if not linked it distracts the directed graph.
*/
function checkForSubTopics(outcome, arr, parentNode){
  if(outcome['name'] || outcome['description']){
    const subTopic = linkNodes(outcome, arr, parentNode, "Subtopic")
    return subTopic;
  }else {
    for (const nodes of duplicateFrame) {
      if (nodes['@id'] == outcome) {
        outcome = nodes
        const subTopic = linkNodes(outcome, arr, parentNode, "Subtopic")
        return subTopic;
      }
    }
  }
}

/*
 * Create a node for the JointJS graph and link it to its parent
 * @param {Object} childNode - an object in the JSON-LD graph
 * @param {Object[]} arr - the list of elements in the JointJS graph
 * @param {Object} parentNode - the parent object in the JSON-LD graph
 * @param {string} typeOfNode - the name of the type of node we are linking
 * @return the newly created node
*/
function linkNodes(childNode, arr, parentNode, typeOfNode){
  if(typeOfNode == "Stages"){
    var stage = createStage(childNode['@id'], childNode['name'])
    stage.prop('name/first', "Stages")
    arr.push(stage)
    return stage;
  }
  if(typeOfNode == "Topics"){
    var topicElement = createTopics(childNode['@id'], childNode['name'])
    const linkStageToTopics = makeLink(parentNode, topicElement)
    topicElement.prop('name/first', "Topics")
    arr.push(topicElement, linkStageToTopics)
    return topicElement;
  }
  if(typeOfNode == "Outcomes"){
    const outcomeElement = createOutcomes(childNode['@id'], childNode['name'])
    const linkTopicToOutcome = makeLink(parentNode, outcomeElement)
    outcomeElement.prop('name/first', "Outcomes")
    arr.push(outcomeElement, linkTopicToOutcome)
    return outcomeElement;
  }
  if(typeOfNode == "Activities"){
    const activityElement = createActivities(childNode['@id'], childNode['name'])
    const linkOutcomeToActivity = makeLink(parentNode, activityElement)
    activityElement.prop('name/first', "Activities")
    arr.push(activityElement, linkOutcomeToActivity)
    return activityElement;
  }
  if(typeOfNode == "Considerations"){
    var considerationElement
    if (multiParentElementIds[childNode['@id']]) {
      console.warn(`Element with ID '${childNode['name']}' already exists. Skipping creation.`);
      considerationElement = multiParentElementIds[childNode['@id']];
      const linkOutcomeToConsideration = makeLink(parentNode, considerationElement)
      arr.push(linkOutcomeToConsideration)
    }else{
      considerationElement = createConsiderations(childNode['@id'], childNode['name'])
      var portName = ['Definition']
      const embedButton = buttonView("Definition", considerationElement, portName)
      multiParentElementIds[childNode['@id']] = considerationElement;
      considerationElement.prop('name/first', "Considerations")
      const linkOutcomeToConsideration = makeLink(parentNode, considerationElement)
      arr.push(considerationElement, linkOutcomeToConsideration)
    }
    return considerationElement;
  }
  if(typeOfNode == "Subtopic"){
    var id = childNode['@id'];
    var parts = id.split("/");
    var category = parts[parts.length - 1];
    let description;
    if(childNode['name'] == undefined){
      description = category + ": " + childNode['description']
    }else if(childNode['description'] == undefined){
      description = category + ": " + childNode['name']
    }else{
      description = category + ": " + childNode['name'] + ": " + childNode['description']
    }
    return description
  }
}

function doLayout() {
  // Apply layout using DirectedGraph plugin
  var visibleElements = []
  //Checks for the visible elements on the graph when an event occurs and adds it to the layout
  models.forEach(el =>{
    if(!el.get('hidden') ){
      visibleElements.push(el)
    }
  })
  layout = joint.layout.DirectedGraph.layout(visibleElements, {
    setVertices: false,
    rankDir: 'LR',
    nodeSep: 50, // Increase the separation between adjacent nodes
    edgeSep: 10, // Increase the separation between adjacent edges
    rankSep: 0, // Increase the separation between node layers
    marginX: 50, // Add margin to the left and right of the graph
    marginY: 50, // Add margin to the top and bottom of the graph
    resizeClusters: false,
    setPosition: (element, position) => {
      // Align elements to the left by setting their x-coordinate
      setElementsPosition(element, position)
    }
  });
  setRootToFix();       //Sets the position of the root elements
  setLinkVertices();    //Sets the vertices that is, marks the points where the links should route from
}

function init() {
  // initialize the graph
  graph = new dia.Graph({}, { cellNamespace: shapes });

  let CustomLinkView = joint.dia.LinkView.extend({
    // custom interactions:
    pointerdblclick: function(evt, x, y) {
      this.addVertex(x, y);
    },
    contextmenu: function(evt, x, y) {
      this.addLabel(x, y);
    },
    // custom options:
    options: joint.util.defaults({
      doubleLinkTools: true,
    }, 
    joint.dia.LinkView.prototype.options)
  });


  // Create a new paper, which is a wrapper around SVG element
  paper = new dia.Paper({
    interactive: { vertexAdd: false }, // disable default vertexAdd interaction
    el: document.getElementById('graph-container'),
    model: graph,
    linkView: CustomLinkView,
    interactive: { vertexAdd: false }, // disable default vertexAdd interaction,
    width: 10000, //window.innerWidth,
    height: 50000,//window.innerHeight,
    overflow: true,
    gridSize: 10,
    perpendicularLinks: true,
    drawGrid: true,
    background: {
      color: '#f9f9f9'
    },
    defaultLinkAnchor: {
      name: 'connectionLength'
    },
    interactive: {
      linkMove: false,
      labelMove: false
    },
    async: true,
    //Viewport function supports collapsing/uncollapsing behaviour on paper
    viewport: function(view) {
      // Return true if model is not hidden
      return !view.model.get('hidden');
    }
  });

  // Fit the paper content to the container size
  paper.transformToFitContent()

  /*
    There is not button set on the Stages yet so this is an event handler for when clicked on any of the stages
  */
  paper.on('element:pointerclick', function(view, evt) {
    evt.stopPropagation();
    if(view.model['id'] == "https://data.suny.edu/entities/oried/rdaf/nist/E" || view.model['id'] == "https://data.suny.edu/entities/oried/rdaf/nist/P" || view.model['id'] == "https://data.suny.edu/entities/oried/rdaf/nist/GA"){
      toggleBranch(view.model);
    }
  })
  buildTheGraph();
}

