const { dia, elementTools, shapes, linkTools, util } = joint;
var graph;
var paper;
var root = [];
var models = [];
var duplicateFrame = [];
var createdConsidearitonElementIds = new Set();   //This set stores all the multi linked consideration element in which the definition button is already embedded, to prevent dup ids
var multiParentElementIds = {}
var createdActivityTargets = new Set();
var elementsAlreayinLayout = new Set();
init();

function buildTheGraph(){
  var Elements = []
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
  }))
  .then(frame => {

// example of pulling a single Outcome and linked Activity from the input data file
// in reality we want to navigate the entire graph
  const frameArray = frame['@graph']
  duplicateFrame = frameArray
  frameArray.forEach(node =>{
    if(node['additionalType'] == "RdAF Stage"){
      var stage = linkNodes(node, Elements, "", "Stages")
      graph.addCells(stage)
      root.push(stage)
      topic = node['sunyrdaf:includes']
      if(Array.isArray(topic)){
        topic.forEach(topicObj =>{
        var tools = [];
        if(topicObj){
          //Creates the topic
          var topicElement = linkNodes(topicObj, Elements, stage, "Topics")
          const width = topicElement.size().width
          const height = topicElement.size().height
          topicElement.size(width + 200, height)
          Elements.push(topicElement)
          if(topicObj["sunyrdaf:includes"]){
            //Creates the consideration button if a topic includes consideration
            var port3 = createPort('Considerations', 'out');
            // Add custom tool buttons for each port
            topicElement.addPort(port3);        // Adds a port to the element
            const considerationButton = createConsiderationButton(port3)
            considerationButton.options.x = "85%"
            tools.push(considerationButton)       //Create the button
            graph.addCells(topicElement);
            toolsView = new joint.dia.ToolsView({ tools: [tools]});
            topicElement.findView(paper).addTools(toolsView);//Embed the tools view into the element view
            createTextBlock(topicElement,topicObj["sunyrdaf:includes"], stage )
          }
          var port2 = createPort('Outcomes', 'out');
          // Add custom tool buttons for each port
          topicElement.addPort(port2);
          const outcomeButton = createButton(port2)
          outcomeButton.options.x = "85%"
          tools.push(outcomeButton)//Creates the Outcome button
          graph.addCells(topicElement);
          toolsView = new joint.dia.ToolsView({ tools: tools});
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
  layout = doLayout();
  })
}





//If we want to use a pre-defined algorithm to traverse over the tree and create the tree, we will still need seperate functions for each and every type of node,
//Beacuse this will allows use to interact with the node later using its type when we put the buttons in function.
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
            createTextBlock(outcomeElement, outcome, parentNode)
          })
        }else{ //Condition if the topic has generated only one outcome
          const outcomeElement = linkNodes(topic[key], arr, parentNode, "Outcomes")
          //Check for activities in the outcome
          checkForActivities(topic[key], arr, outcomeElement)
          createTextBlock(outcomeElement, topic[key], parentNode)
        }
      }else if(key == "sunyrdaf:includes"){
        //Creates consideration elements if a topic includes considerations
        checkForConsiderations(topic[key], arr, parentNode);
      }
    }

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



//*******A lot to chnage in this function as rest of the elements that are yet to be introduced are linked to this.
//Function to Create activity nodes that are the results of the ouctomes generated
function checkForActivities(outcome, arr, parentNode){
  var portNameList = ['NT1', "PG1", "AC1"]
  const embedButton = buttonView("Activities", parentNode)
  for (const key in outcome){
    if(key.startsWith('sunyrdaf')){
      if(key == "sunyrdaf:resultsFrom"){
        if(Array.isArray(outcome[key])){ //Conditions to create multiple activities
          outcome[key].forEach(activity =>{
            const activityElement = linkNodes(activity, arr, parentNode, "Activities")
            if(activity['sunyrdaf:extends']){
              var subTopic = checkForSubTopics(activity['sunyrdaf:extends'], arr, parentNode)
              subTopicTextBlock(subTopic, activityElement)    //Creates the textBlock for the SubTopic button in Activities
            }
            if(activity['sunyrdaf:generates']){
              checkForActivitiesTarget(activity, arr, activityElement)
            }
            if(activity['sunyrdaf:includes']){
              checkForActivitiesTarget(activity, arr, activityElement)
            }
          })
        }else{// Condition to create a single activity
          if(outcome[key]['name'] == undefined){
            duplicateFrame.forEach(activity =>{
              if(activity['@id'] == outcome[key]){
                const activityElement = linkNodes(activity, arr, parentNode, "Activities")
                if(activity['sunyrdaf:extends']){
                  var subTopic = checkForSubTopics(activity['sunyrdaf:extends'], arr, activityElement)
                  subTopicTextBlock(subTopic, activityElement)    //Creates the textBlock for the SubTopic button in Activities
                }
                if(activity['sunyrdaf:generates']){
                  checkForActivitiesTarget(activity, arr, activityElement)
                }
                if(activity['sunyrdaf:includes']){
                  checkForActivitiesTarget(activity, arr, activityElement)
                }
              }
            })
          }else{
            var activity = outcome[key]
            const activityElement = linkNodes(activity, arr, parentNode, "Activities")
            if(activity['sunyrdaf:extends']){
              var subTopic = checkForSubTopics(activity['sunyrdaf:extends'], arr, parentNode)
              subTopicTextBlock(subTopic, activityElement)    //Creates the textBlock for the SubTopic button in Activities
            }
            if(activity['sunyrdaf:generates']){
              checkForActivitiesTarget(activity, arr, activityElement)
            }
            if(activity['sunyrdaf:includes']){
              checkForActivitiesTarget(activity, arr, activityElement)
            }



          }
        }
      }else if(key == "sunyrdaf:includes"){
        const consideration = checkForConsiderations(outcome[key], arr, parentNode)
        if(consideration){
        }else{
          //Error displayed is Considerations Undefined (Just for Debugging)
        }
      }else if(key == "sunyrdaf:extends"){
        //Instead Of creating an element and a link for the subtopic, we have just used
        //the Name, description and the catalog number to define the subtopic into a textblock
        var subTopic = checkForSubTopics(outcome[key], arr, parentNode);
        if(subTopic != undefined){
          //This creates the si
          subTopicTextBlock(subTopic, parentNode)

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
This function takes the nodes and links it
* Create and add node for the JointJS graph and link it to its parent
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
    var linkStageToTopics = makeLink(parentNode, topicElement)
    topicElement.prop('name/first', "Topics")
    arr.push(topicElement, linkStageToTopics)
    return topicElement;
  }
  if(typeOfNode == "Outcomes"){
    var outcomeElement = createOutcomes(childNode['@id'], childNode['name'])
    var linkTopicToOutcome = makeLink(parentNode, outcomeElement)
    outcomeElement.prop('name/first', "Outcomes")
    arr.push(outcomeElement, linkTopicToOutcome)
    return outcomeElement;
  }
  if(typeOfNode == "Activities"){
    var activityElement = createActivities(childNode['@id'], childNode['name'])
    var linkOutcomeToActivity = makeLink(parentNode, activityElement)
    activityElement.prop('name/first', "Activities")
    arr.push(activityElement, linkOutcomeToActivity)
    graph.addCells(activityElement, linkOutcomeToActivity)
    const portNameList = ['Participants', 'Methods', "Roles", "Resources", "Outputs", "RDaF Subtopic"]
    buttonView(portNameList, activityElement)
    createDropDownMenu(activityElement)
    return activityElement;
  }
  if(typeOfNode == "Considerations"){
    var considerationElement
    if (createdConsidearitonElementIds.has(childNode['@id'])) {
      console.warn(`Element with ID '${childNode['name']}' already exists. Skipping creation.`);
      if(multiParentElementIds[childNode['@id']]){
        considerationElement = multiParentElementIds[childNode['@id']];
        var linkOutcomeToConsideration = makeLink(parentNode, considerationElement)
        considerationElement.prop('name/first', "Considerations")
        arr.push(considerationElement, linkOutcomeToConsideration)
      }
    }else{
      considerationElement = createConsiderations(childNode['@id'], childNode['name'])
      const embedButton = buttonView("Definition", considerationElement)
      createdConsidearitonElementIds.add(childNode['@id'])
      multiParentElementIds[childNode['@id']] = considerationElement
      var linkOutcomeToConsideration = makeLink(parentNode, considerationElement)
      considerationElement.prop('name/first', "Considerations")
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

  if(typeOfNode == "Outputs"){
    var outputElement;
    if(createdActivityTargets.has(childNode['@id'])){
      //console.warn(`Element with ID '${childNode['name']}' already exists. Skipping creation.`);
      if(multiParentElementIds[childNode['@id']]){
        outputElement = multiParentElementIds[childNode['@id']];
        var linkOutputToActivity = makeLink(parentNode, outputElement)
        outputElement.prop('name/first', "Outputs")
        arr.push(linkOutputToActivity)
      }
    }else{
      outputElement = createOutputs(childNode['@id'], childNode['name'])
      createdActivityTargets.add(childNode['@id'])
      multiParentElementIds[childNode['@id']] = outputElement
      var linkOutputToActivity = makeLink(parentNode, outputElement)
      outputElement.prop('name/first', "Outputs")
      arr.push(outputElement, linkOutputToActivity)
    }
    return outputElement;
  }
  if(typeOfNode == "Methods"){
    let methodElement;
    if(createdActivityTargets.has(childNode['@id'])){
      //console.warn(`Element with ID '${childNode['name']}' already exists. Skipping creation.`);
      if(multiParentElementIds[childNode['@id']]){
        methodElement = multiParentElementIds[childNode['@id']];
        var linkMethodToActivity = makeLink(parentNode, methodElement)
        methodElement.prop('name/first', "Methods")
        arr.push(linkMethodToActivity)
      }
    }else{
      methodElement = createMethods(childNode['@id'], childNode['name'])
      var linkMethodToActivity = makeLink(parentNode, methodElement)
      createdActivityTargets.add(childNode['@id'])
      multiParentElementIds[childNode['@id']] = methodElement
      methodElement.prop('name/first', "Methods")
      arr.push(methodElement, linkMethodToActivity)
    }
    return methodElement;
  }
  if(typeOfNode == "Participants"){
    let participantElement;
    if(createdActivityTargets.has(childNode['@id'])){
      //console.warn(`Element with ID '${childNode['name']}' already exists. Skipping creation.`);
      if((multiParentElementIds[childNode['@id']])){
        participantElement = multiParentElementIds[childNode['@id']];
        var linkParticipantToActivity = makeLink(parentNode, participantElement)
        participantElement.prop('name/first', "Participants")
        arr.push(participantElement,linkParticipantToActivity)
      }
    }else{
      participantElement = createParticipants(childNode['@id'], childNode['name'])
      var linkParticipantToActivity = makeLink(parentNode, participantElement)
      createdActivityTargets.add(childNode['@id'])
      multiParentElementIds[childNode['@id']] = participantElement
      participantElement.prop('name/first', "Participants")
      arr.push(participantElement, linkParticipantToActivity)
    }
    return participantElement;
  }
  if(typeOfNode == "Roles"){
    let roleElement;
    if(createdActivityTargets.has(childNode['@id'])){
      //console.warn(`Element with ID '${childNode['name']}' already exists. Skipping creation.`);
      if((multiParentElementIds[childNode['@id']])){
        roleElement =  multiParentElementIds[childNode['@id']];
        var linkRoleToActivity = makeLink(parentNode, roleElement)
        roleElement.prop('name/first', "Roles")
        arr.push(linkRoleToActivity)
      }
    }else{
      roleElement = createRoles(childNode['@id'], childNode['name'])
      createdActivityTargets.add(childNode['@id'])
      multiParentElementIds[childNode['@id']] = roleElement
      var linkRoleToActivity = makeLink(parentNode, roleElement)
      roleElement.prop('name/first', "Roles")
      arr.push(roleElement, linkRoleToActivity)
    }
    return roleElement;
  }
  if(typeOfNode == "Resources"){
    let resourceElement;
    if(createdActivityTargets.has(childNode['@id'])){
      //console.warn(`Element with ID '${childNode['name']}' already exists. Skipping creation.`);
      if((multiParentElementIds[childNode['@id']])){
        resourceElement =  multiParentElementIds[childNode['@id']];
        var linkResourceToActivity = makeLink(parentNode, resourceElement)
        resourceElement.prop('name/first', "Resources")
        arr.push(linkResourceToActivity)
      }
    }else{
      resourceElement = createResources(childNode['@id'], childNode['name'])
      createdActivityTargets.add(childNode['@id'])
      multiParentElementIds[childNode['@id']] = resourceElement
      var linkResourceToActivity = makeLink(parentNode, resourceElement)
      resourceElement.prop('name/first', "Resources")
      resourceElement.prop('resource/Link', childNode['@id'])
      arr.push(resourceElement, linkResourceToActivity)
    }
    return resourceElement;
  }
}



function doLayout(parentElement, el) {
  // Apply layout using DirectedGraph plugin
  var visibleElements = []
  //Checks for the visible elements on the graph when an event occurs and adds it to the layout
  models.forEach(el =>{
    if(!el.get('hidden')){
      // if(elementsAlreayinLayout.has(el)){
      //   console.log()
      // }else{
        visibleElements.push(el)
      //}
    }
  })




  layout = joint.layout.DirectedGraph.layout(visibleElements, {
    setVertices: false,
    rankDir: 'LR',
    marginX: 50, // Add margin to the left and right of the graph
    marginY: 0, // Add margin to the top and bottom of the graph
    resizeClusters: false,
    setPosition: (element, position) => {
      // Align elements to the left by setting their x-coordinate
      setElementsPosition(element, position, parentElement)
      // if(elementsAlreayinLayout.has(element)){
      //   console.log()
      // }else{
      //   //elementsAlreayinLayout.add(element)
      // }
    }
  });

  setRootToFix();       //Sets the position of the root elements
  setLinkVertices();    //Sets the vertices that is, marks the points where the links should route from
}

buildTheGraph();

function init(){
// Create a new directed graph
graph = new dia.Graph({}, { cellNamespace: shapes });

// Create a new paper, which is a wrapper around SVG element
paper = new dia.Paper({
  interactive: { vertexAdd: false }, // disable default vertexAdd interaction
  el: document.getElementById('graph-container'),
  model: graph,
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

}




