function createTextBlock(element, node, parentNode){
    var parentElementView = paper.findViewByModel(parentNode)
    var elementView = paper.findViewByModel(element)
    // Draw an HTML rectangle above the element.
    var div = document.createElement('div');
    parentElementView.el.style.position = "relative"
    div.style.position = 'absolute';
    div.style.background = 'white';
    div.textContent = node['description']
    var length = element * 2
    div.style.width = 300 + 'px';
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


//Trying something new for the options in Activitites Element
function createDropDownMenu(element){
    var elementView = paper.findViewByModel(element)
    var menu = document.createElement('select')
    var elementBBox = elementView.model.getBBox()
    menu.id = element.id
    var option1 = document.createElement('option')
    option1.textContent = "Roles"
    var option2 = document.createElement('option')
    option2.textContent = "Methods"
    var option3 = document.createElement('option')
    option3.textContent = "Output"
    var option4 = document.createElement('option')
    option4.textContent = "Resources"
    var positionX = parseInt(elementBBox.x) + parseInt(elementBBox.width)
    var positionY = parseInt(elementBBox.y) + parseInt(elementBBox.height)
    menu.style.top = "1000px"
    menu.style.left = "1000px"
    //menu.style.visibility = "hidden"
    menu.appendChild(option1)
    menu.appendChild(option2)
    menu.appendChild(option3)
    menu.appendChild(option4)
    elementView.el.appendChild(menu)
    paper.el.appendChild(elementView.el);
}