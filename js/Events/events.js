
/*
There is not button set on the Stages yet so this is an event handler for when clicked on any of the stages
*/
paper.on('element:pointerclick', function(view, evt) {
    //evt.stopPropagation();
    if(view.model['id'] == "https://data.suny.edu/entities/oried/rdaf/nist/E" || view.model['id'] == "https://data.suny.edu/entities/oried/rdaf/nist/P" || view.model['id'] == "https://data.suny.edu/entities/oried/rdaf/nist/GA"){
    toggleBranch(view.model);
    }
    // resetting the layout here has an effect after collapsing and then moving the topic nodes
    // manually to be closer (it moves them so the expanded nodes will fit if you re-expand after
    // moving. It doesn't seem to have any effect after just collapsing a node's children
    // though. So I think it has promise as an approach but more work is needed to figure out
    // how to get the layout to redraw everytime the way we want it to
})

paper.on('element:pointerclick', function(view, evt) {
    //evt.stopPropagation();
    const model = view.model
    if(model.attributes.name['first'] == 'Resources'){
        const url = model.attributes.resource['Link']
        window.open(url, '_blank')
    }
})



function toggleBranch(child) {
    if(child.isElement()){
        //retrives the value of the collapsed attribute from the root model.
        var shouldHide = child.get('collapsed');
        child.set('collapsed', !shouldHide);
        const links = openBranch(child, shouldHide)
    }
}

function openBranch(child, shouldHide){
    // TODO: openBranch should only open the next level of the tree, not the
    // full tree - this might also help with the initial layout

    //Finds the outgoing links to the element the user is interacting with
    const findTarget = graph.getConnectedLinks(child, {outbound:true})
    //Using each link that is connected find the target Elements and play with them
    findTarget.forEach(targetLink =>{
        //elements connected to the child, those in the 1st rank of the graph
        //Target Elements only allow access to the first connected Element of the parent.
        const element = targetLink.getTargetElement()
        if(element){
            element.set('hidden', shouldHide)
            element.set('collapsed', false)
            //Make the links visible
            targetLink.set('hidden', shouldHide)
            if(!element.get('collapsed')){
                //This condition closes all the nodes when the user intereacts with the parentNode
                const subElementsLinks = graph.getConnectedLinks(element, {outbound:true})
                subElementsLinks.forEach(subLinks =>{
                    subLinks.set('hidden', true)
                    subLinks.set('collapsed', false)
                });

                const successrorCells = graph.getSubgraph([
                    ...graph.getSuccessors(element),
                ])
                successrorCells.forEach(function(successor) {
                    successor.set('hidden', true);
                    successor.set('collapsed', false);

                });
            }else{
                console.error("Element Undefined")
            }
        }
        //closeTheRest(element)
	// I don't think I'm calling this correctly, or in the right
	// place but see https://resources.jointjs.com/docs/jointjs/v3.7/joint.html#dia.LinkView.prototype.requestConnectionUpdate
	// in theory it should help with recalculating the routes after
	// things move
        //What I have implemented below works fine and is a good way to hide when we stop at one point in the tree, but I look into it and see if it helps
    })
    doLayout();
}


/*
    This function takes and element and routes through all of its child element and hides all the elements
*/
function closeTheRest(element){
    //This condition closes all the nodes when the user intereacts with the parentNode
    const subElementsLinks = graph.getConnectedLinks(element, {outbound:true})
    const successrorCells = graph.getSubgraph([
        ...graph.getSuccessors(element),
    ])
    subElementsLinks.forEach(subLinks =>{
        if(subLinks != undefined && !subLinks.get('hidden')){
            subLinks.set('hidden', true)
            subLinks.set('collapsed', false)
            successrorCells.forEach(function(successor) {
                if(successor != undefined){
                    successor.set('hidden', true);
                    successor.set('collapsed', false);

                }else{
                    console.error("Element already closed")
                }
            });
            const graphLinks = (graph.getLinks())
            graphLinks.forEach(links =>{
                if(!links.get('hidden') && links.getTargetElement()){
                    if(links.getTargetElement().get('hidden')){
                        links.getTargetElement().set('hidden', false)
                        links.set('collapsed', true)
                    }
                }
            })
        }else{
            console.error("Element already closed")
        }
    });



}


/*
    This function handles the event when a button is clicked. Collapse and hide the child nodes
    for now its just closes the first connected childs but later when we create the child (participants, roles, methods, etc. ) for activities we can use
    the above close the Rest to close the rest of the tree
*/
function toggelButton(node, typeOfPort){
    var shouldHide = node.get('collapsed');
    node.set('collapsed', !shouldHide);
    if(typeOfPort == "Outcomes"){
        defaultEvent(node, typeOfPort)
    }
    if(typeOfPort == "Considerations"){
        defaultEvent(node, typeOfPort)
    }
    if(typeOfPort == "Activities"){
        defaultEvent(node, typeOfPort)
    }else{
        defaultEvent(node, typeOfPort)
    }
}

//Function to show the subtopic when the pointer hover over the subtopic button
function showSubtopic(node, typeOfPort){
    const OutboundLinks = graph.getConnectedLinks(node, {outbound:true})
    if(OutboundLinks[0].getTargetElement().prop('name/first') == typeOfPort){
        OutboundLinks[0].getTargetElement().set('hidden', false)
        OutboundLinks[0].getTargetElement().set('collapse', true)
        OutboundLinks[0].set('hidden', true)
    }
}

//Function to hide the subtopic when the pointer hover over the subtopic button
function hideSubtopic(node, typeOfPort){
    const OutboundLinks = graph.getConnectedLinks(node, {outbound:true})
    if(OutboundLinks[0].getTargetElement().prop('name/first') == typeOfPort){
        OutboundLinks[0].getTargetElement().set('hidden', true)
        OutboundLinks[0].getTargetElement().set('collapse', false)
        OutboundLinks[0].set('hidden', true)
    }
}




//This function handles the event for the 3 buttons on the outcomes node
function radioButtonEvents(elementView, port){
    var circleElements = elementView._toolsView.$el[0].querySelectorAll('circle')
    circleElements.forEach(circleElement =>{
    //Still need to wrap around this event because we just need to set one button at a time not all should be selected.
    var activityButton = elementView._toolsView.tools[1].el
    var considerationButton = elementView._toolsView.tools[0].$el[0]
    const outboundLinks = (graph.getConnectedLinks(elementView.model, {outbound: true}))
    removeUnwantedButton(elementView, outboundLinks, activityButton, considerationButton)
    //Change the color of the element when clicked
    if(circleElement.id == `${port.id}`){
        if(circleElement.id.startsWith('A')){
            //When clicked on Achieved, hide the activity button
            if(activityButton.style.visibility == "visible" || considerationButton.style.visibility == "visible"){
                var rectElement = (elementView.el.querySelector('rect'))
                var width = parseInt(rectElement.getAttribute('width')) - 115
                rectElement.setAttribute('width', width)
                //This condition is applied when user wants to hide all the elements including Activities and Considerations
                const OutboundLinks = graph.getConnectedLinks(elementView.model, {outbound:true})
                OutboundLinks.forEach(links =>{
                    //Make the links visible
                    links.getTargetElement().set('hidden', true)
                    links.getTargetElement().set('collapsed', false)
                    //Make the links visible
                    links.set('hidden', true)
                    links.set('collapsed', false)
                    //This condition listens to the events on elements that has more than on parent
                    const orphanLink = graph.getConnectedLinks(links.getTargetElement(), {inbound:true})
                    if(orphanLink.length > 1){
                        orphanLink.forEach(links =>{
                            if(!links.get('hidden')){
                                links.getTargetElement().set('hidden', false)
                                links.getTargetElement().set('collapsed', true)
                                links.set('hidden', false)
                            }
                        })
                    }else{
                        links.getTargetElement().set('hidden', true)
                        links.getTargetElement().set('collapsed', false)
                        links.set('hidden', true)
                        closeTheRest(links.getTargetElement())
                    }
                })
            }else{
                var rectElement = (elementView.el.querySelector('rect'))
                var width = parseInt(rectElement.getAttribute('width'))
                rectElement.setAttribute('width', width)
            }
            activityButton.style.visibility = "hidden"
            considerationButton.style.visibility = "hidden"
            circleElement.setAttribute('fill', 'Green')

        }
        if(circleElement.id.startsWith('P')){
            //When clicked on In Progress button, show the activity button
            if(activityButton.style.visibility == "hidden" || considerationButton.style.visibility == "hidden" && (activityButton || considerationButton)){
                var rectElement = (elementView.el.querySelector('rect'))
                var width = parseInt(rectElement.getAttribute('width')) + 115
                rectElement.setAttribute('width', width)
                updateAnchorConnection(elementView.model)
            }else{
                var rectElement = (elementView.el.querySelector('rect'))
                var width = parseInt(rectElement.getAttribute('width'))
                rectElement.setAttribute('width', width)
                updateAnchorConnection(elementView.model)
            }
            activityButton.style.visibility = "visible"
            considerationButton.style.visibility = "visible"
            circleElement.setAttribute('fill', '#D86C00')
        }
        if(circleElement.id.startsWith('N')){
            //When clicked on Not Started Button, show the activity button
            if(activityButton.style.visibility == "hidden" || considerationButton.style.visibility == "hidden" && (activityButton || considerationButton)){
                var rectElement = (elementView.el.querySelector('rect'))
                var width = parseInt(rectElement.getAttribute('width')) + 115
                rectElement.setAttribute('width', width)
                updateAnchorConnection(elementView.model)
            }else{
                var rectElement = (elementView.el.querySelector('rect'))
                var width = parseInt(rectElement.getAttribute('width'))
                rectElement.setAttribute('width', width)
                updateAnchorConnection(elementView.model)
            }
            activityButton.style.visibility = "visible"
            considerationButton.style.visibility = "visible"
            circleElement.setAttribute('fill', '#AB0606')
        }
    }else{
        //unhighlights the rest of the elements that the user is not interacting with
        circleElement.setAttribute('fill', 'white')
    }
    })
}




function defaultEvent(node, typeOfPort){
    let parentElement;
    let visibleElement;
    if(!node.get('collapsed')){
        const OutboundLinks = graph.getConnectedLinks(node, {outbound:true})
        if(Array.isArray(OutboundLinks)){
            OutboundLinks.forEach(links =>{
                if(links && links.getTargetElement()){
                    if(links.getTargetElement().prop('name/first') == typeOfPort){
                        links.getTargetElement().set('hidden', false)
                        links.getTargetElement().set('collapsed', true)
                        links.set('hidden', false)
                        links.set('collapsed', true)
                        visibleElement = links.getTargetElement()
                        if(typeOfPort == "Outcomes"){
                        //Using the html element (Activity button) to hide and show the particular button from the entire ElementView
                            var elementView = links.getTargetElement().findView(paper)
                            if(elementView.hasTools()){
                                //Query's for the Activity Button on the and hides it
                                const Actbutton = elementView._toolsView.tools[1].$el[0]
                                const ConsiderationButtton = elementView._toolsView.tools[0].$el[0]
                                Actbutton.style.visibility = "hidden"
                                ConsiderationButtton.style.visibility = "hidden"
                                const circleElement = elementView._toolsView.$el[0].querySelectorAll('circle')
                                //If the user has selected Not Started or In progress on Outcome, Below condition checks the status while opening and closing the outcome
                                circleElement.forEach(circle =>{
                                    if(circle.getAttribute('fill') == "Red" || circle.getAttribute('fill') == "Orange"){
                                        Actbutton.style.visibility = "visible"
                                        ConsiderationButtton.style.visibility = "visible"
                                    }
                                })
                            }
                        }
                    }
                }else{
                    console.error("Link Array is not defined")
                }
            })
            doLayout()
        }
    }else{
        const OutboundLinks = graph.getConnectedLinks(node, {outbound:true})
        OutboundLinks.forEach(links =>{
            if(links.getTargetElement().prop('name/first') == typeOfPort && links != undefined){
                //Make the links visible
                links.getTargetElement().set('hidden', true)
                links.getTargetElement().set('collapsed', false)
                //Make the links visible
                links.set('hidden', true)
                links.set('collapsed', false)
                //This condition listens to the events on elements that has more than on parent
                const orphanLink = graph.getConnectedLinks(links.getTargetElement(), {inbound:true})
                if(orphanLink.length > 1){
                    orphanLink.forEach(links =>{
                        if(links.get('collapsed') && links != undefined && links.getTargetElement() != undefined){
                            links.getTargetElement().set('hidden', false)
                            links.getTargetElement().set('collapsed', true)
                            links.set('hidden', false)
                        }
                    })
                }
                if(links.getTargetElement() != undefined){
                    closeTheRest(links.getTargetElement())
                }else{
                    console.error("element or link already closed")
                }
                if(typeOfPort == "Outcomes"){
                    //Using the html element (Activity button) instead to hide and show the particular button from the entire ElementView
                    var elementView = links.getTargetElement().findView(paper)
                    if(elementView.hasTools()){
                        //Query's for the Activity Button on the and hides it
                        const Actbutton = elementView._toolsView.tools[1].$el[0]
                        const ConsiderationButtton = elementView._toolsView.tools[0].$el[0]
                        Actbutton.style.visibility = "hidden"
                        ConsiderationButtton.style.visibility = "hidden"
                        const circleElement = elementView._toolsView.$el[0].querySelectorAll('circle')
                        //If the user has selected Not Started or In progress on Outcome, Below condition checks the status while opening and closing
                        circleElement.forEach(circle =>{
                            if(circle.getAttribute('fill') == "Red" || circle.getAttribute('fill') == "Orange"){
                                Actbutton.style.visibility = "visible"
                                ConsiderationButtton.style.visibility = "visible"
                            }
                        })
                    }
                }
            }
        })
        //doLayout()
    }
}



function removeUnwantedButton(elementView, outboundLinks, activityButton, considerationButton){
    var activitiesElements = []
    var considerationElement = []
    outboundLinks.forEach(links =>{
        if(links.getTargetElement().attributes.name['first'] == "Activities"){
            activitiesElements.push("Activities")
        }
        if(links.getTargetElement().attributes.name['first'] == "Considerations"){
            considerationElement.push("Considerations")
        }
    })
    if(Array.isArray(activitiesElements) && activitiesElements.length === 0){
        if(activityButton){
            activityButton.remove()
        }
    }

    if(Array.isArray(considerationElement) && considerationElement.length === 0){
        if(considerationButton){
            considerationButton.remove()
        }
    }
}

function setTimeOut(){
    hoverTimeout = setTimeout(function() {
        // Your hover action goes here
        console.log();
      }, 100000000); // Change 1000 to the desired timeout in milliseconds
}


