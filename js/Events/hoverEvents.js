//In order to see the effect of this function minimize the page to 25% because the subtopic elements are scattered througout the page
//Show the subtopic when the enters the cell view of the subtopic button
paper.on('cell:mouseover', function(cellView) {
    try {
        if(cellView.model.attributes.name['first'] == "Resources"){
            const resourceElement = (cellView.el.querySelectorAll('rect')[0])
            resourceElement.setAttribute('fill', "#7490D7")
        }
      //From the element view look for the element tools
        var toolsArray = cellView._toolsView.tools
        toolsArray.forEach(element => {
            element
            if (element.childNodes && element.childNodes.button) {
                    const subtopicButton = element.$el[0]
                    subtopicButton.addEventListener('mouseover', function() {
                        // Your mouseover event handling code here
                        var bbox = cellView.model.getBBox();
                        var paperRect1 = paper.localToPaperRect(bbox);
                        if(element.childNodes.button.id == "RDaF Subtopic"){
                            // Set the position of the element according to the pointer and make it visible
                            var textBlock = document.getElementById(cellView.model.id)
                            textBlock.style.left = ((paperRect1.x) + 10) + 'px';
                            textBlock.style.top = ((paperRect1.y) + 55) + 'px';
                            textBlock.style.visibility = "visible"
                        }
                        else if(element.childNodes.button.id == "Definition"){
                            // Set the position of the element according to the pointer and make it visible
                            element.childNodes.button.setAttribute('fill', 'darkgrey')
                            var textBlock = document.getElementById(cellView.model.id)
                            if(textBlock != null){
                                textBlock.style.left = (paperRect1.x + cellView.model.size().width - 20) + 'px';
                                textBlock.style.top = ((paperRect1.y) + 55) + 'px';
                                textBlock.style.visibility = "visible"
                            }
                        }
                        else if(element.childNodes.button.id == "Activities"){
                                element.childNodes.button.setAttribute('fill', 'lightgrey')
                                var textBlock = document.getElementById("Activities" + cellView.model.id)
                                textBlock.style.left = (paperRect1.x + cellView.model.size().width - 20) + 'px';
                                textBlock.style.top = ((paperRect1.y) + 40) + 'px';
                                textBlock.style.visibility = "visible"
                        }
                        else if(element.childNodes.button.id == "Considerations"){
                                element.childNodes.button.setAttribute('fill', 'lightgrey')
                                var textBlock = document.getElementById(cellView.model.id)
                                textBlock.style.left = (paperRect1.x + cellView.model.size().width - 20) + 'px';
                                textBlock.style.top = ((paperRect1.y) + 60) + 'px';
                                //textBlock.style.visibility = "visible"
                        }
                        else if(element.childNodes.button.id == "Outcomes"){
                            element.childNodes.button.setAttribute('fill', 'lightgrey')
                            var textBlock = document.getElementById(cellView.model.id)
                            textBlock.style.left = (paperRect1.x + cellView.model.size().width - 20) + 'px';
                            textBlock.style.top = ((paperRect1.y) + 40) + 'px';
                            textBlock.style.visibility = "visible"
                        }
                        else if(element.childNodes.button.id == "Outputs"){
                            element.childNodes.button.setAttribute('fill', 'lightgrey')
                            var textBlock = document.getElementById("Outputs" + cellView.model.id)
                            if(textBlock){
                                textBlock.style.left = (paperRect1.x + cellView.model.size().width - 20) + 'px';
                                textBlock.style.top = ((paperRect1.y) + 40) + 'px';
                                textBlock.style.visibility = "visible"
                            }else{
                                console.log()
                            }

                        }
                        else if(element.childNodes.button.id == "Participants"){
                            element.childNodes.button.setAttribute('fill', 'lightgrey')
                            if(textBlock){
                                textBlock.style.left = (paperRect1.x + cellView.model.size().width - 20) + 'px';
                                textBlock.style.top = ((paperRect1.y) + 40) + 'px';
                                textBlock.style.visibility = "visible"
                            }else{
                                console.log()
                            }
                        }

                        else if(element.childNodes.button.id == "Methods"){
                            element.childNodes.button.setAttribute('fill', 'lightgrey')
                            if(textBlock){
                                textBlock.style.left = (paperRect1.x + cellView.model.size().width - 20) + 'px';
                                textBlock.style.top = ((paperRect1.y) + 40) + 'px';
                                textBlock.style.visibility = "visible"
                            }else{
                                console.log()
                            }
                        }
                        else if(element.childNodes.button.id == "Roles"){
                            element.childNodes.button.setAttribute('fill', 'lightgrey')
                            if(textBlock){
                                textBlock.style.left = (paperRect1.x + cellView.model.size().width - 20) + 'px';
                                textBlock.style.top = ((paperRect1.y) + 40) + 'px';
                                textBlock.style.visibility = "visible"
                            }else{
                                console.log()
                            }
                        }
                        else if(element.childNodes.button.id == "Resources"){
                            element.childNodes.button.setAttribute('fill', 'lightgrey')
                            if(textBlock){
                                textBlock.style.left = (paperRect1.x + cellView.model.size().width - 20) + 'px';
                                textBlock.style.top = ((paperRect1.y) + 40) + 'px';
                                textBlock.style.visibility = "visible"
                            }else{
                                console.log()
                            }
                        }

                        else{
                            console.log()
                        }
                    });
            }else {
                console.log();
            }
        });
    } catch (error) {
        console.error();
    }
});

  //In order to see the effect of this function minimize the page to 25% because the subtopic elements are scattered througout the page
  //Hide the subtopic when the mouse pointer leaves the button
    paper.on('cell:mouseout', function(cellView) {
    try {
        if(cellView.model.attributes.name['first'] == "Resources"){
            const resourceElement = (cellView.el.querySelectorAll('rect')[0])
            resourceElement.setAttribute('fill', "#C8CDDA")
        }
        //From the element View look for the element tools
        var toolsArray = cellView._toolsView.tools
        toolsArray.forEach(element => {
            if (element.childNodes && element.childNodes.button) {
                const subtopicButton = element.$el[0]
                subtopicButton.addEventListener('mouseout', function() {
                    // Set the position of the element according to the pointer and make it visible
                    //Look for any events on subtopic button
                    if(element.childNodes.button.id == "RDaF Subtopic"){
                        var textBlock = document.getElementById(cellView.model.id)
                        textBlock.style.visibility = "hidden"
                    }
                    else if(element.childNodes.button.id == "Definition"){
                        // Set the position of the element according to the pointer and make it visible
                        element.childNodes.button.setAttribute('fill', 'black')
                        var textBlock = document.getElementById(cellView.model.id)
                        textBlock.style.visibility = "hidden"
                    }
                    else if(element.childNodes.button.id == "Activities"){
                        element.childNodes.button.setAttribute('fill', '#ffffb3')
                        var textBlock = document.getElementById("Activities" + cellView.model.id)
                        textBlock.style.visibility = "hidden"
                    }
                    else if(element.childNodes.button.id == "Considerations"){
                        element.childNodes.button.setAttribute('fill', '#ffbf80')
                    }
                    else if(element.childNodes.button.id == "Outcomes"){
                        element.childNodes.button.setAttribute('fill', '#ffffb3')
                        var textBlock = document.getElementById(cellView.model.id)
                        if(textBlock){
                            textBlock.style.visibility = "hidden"
                        }else{
                            console.log()
                        }
                    }
                    else if(element.childNodes.button.id == "Outputs"){
                        element.childNodes.button.setAttribute('fill', '#ffffb3')
                        var textBlock = document.getElementById("Outputs" + cellView.model.id)
                        if(textBlock){
                            textBlock.style.visibility = "hidden"
                        }else{
                            console.log()
                        }
                    }
                    else if(element.childNodes.button.id == "Participants"){
                        element.childNodes.button.setAttribute('fill', '#ffffb3')
                        var textBlock = document.getElementById("Participants" + cellView.model.id)
                        if(textBlock){
                            textBlock.style.visibility = "hidden"
                        }else{
                            console.log()
                        }
                    }
                    else if(element.childNodes.button.id == "Roles"){
                        element.childNodes.button.setAttribute('fill', '#ffffb3')
                        var textBlock = document.getElementById("Roles" + cellView.model.id)
                        if(textBlock){
                            textBlock.style.visibility = "hidden"
                        }else{
                            console.log()
                        }
                    }
                    else if(element.childNodes.button.id == "Resources"){
                        element.childNodes.button.setAttribute('fill', '#ffffb3')
                        var textBlock = document.getElementById("Resources" + cellView.model.id)
                        if(textBlock){
                            textBlock.style.visibility = "hidden"
                        }else{
                            console.log()
                        }
                    }
                    else if(element.childNodes.button.id == "Methods"){
                        element.childNodes.button.setAttribute('fill', '#ffffb3')
                        var textBlock = document.getElementById("Methods" + cellView.model.id)
                        if(textBlock){
                            textBlock.style.visibility = "hidden"
                        }else{
                            console.log()
                        }
                    }


                });
            }else {
                console.log();
            }
        });
    } catch (error) {
        console.error();
    }
})