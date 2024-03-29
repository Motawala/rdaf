function checkForActivitiesTarget(activity, arr, parentNode){
const targetNode = activity['sunyrdaf:includes']
if(activity['sunyrdaf:generates']){
    if(Array.isArray(activity['sunyrdaf:generates'])){
    activity['sunyrdaf:generates'].forEach(node =>{
        if(node['name'] == undefined){
        node = findNode(node)
        var outputElement = linkNodes(node, arr, parentNode, "Outputs")
        }else{
        var outputElement = linkNodes(node, arr, parentNode, "Outputs")
        }
    })
    }else{
    if(activity['sunyrdaf:generates']['name'] == undefined){
        activity['sunyrdaf:generates'] = findNode(activity['sunyrdaf:generates'])
        var outputElement = linkNodes(activity['sunyrdaf:generates'], arr, parentNode, "Outputs")
    }else{
        var outputElement = linkNodes(activity['sunyrdaf:generates'], arr, parentNode, "Outputs")
    }
    }
}

if(Array.isArray(activity['sunyrdaf:includes'])){
    activity['sunyrdaf:includes'].forEach(node =>{
    if(node['name'] == undefined){
        node = findNode(node)
        if(node['@type'] == "sunyrdaf:Method" || node['@type'] == "https://data.suny.edu/vocabs/oried/rdaf/suny/Method"){
        var methodElement = linkNodes(node, arr, parentNode, "Methods")
        }
        if(node['@type'] == "sunyrdaf:Participant" || node['@type'] == "https://data.suny.edu/vocabs/oried/rdaf/suny/Participant"){
        var participantElement = linkNodes(node, arr, parentNode, "Participants")
        }
        if(node['@type'] == "sunyrdaf:Role" || node['@type'] == "https://data.suny.edu/vocabs/oried/rdaf/suny/Role"){
        var roleElement = linkNodes(node, arr, parentNode, "Roles")
        }
        if(node['@type'] == "sunyrdaf:Resource" || node['@type'] == "https://data.suny.edu/vocabs/oried/rdaf/suny/Resource"){
        var resourceElement = linkNodes(node, arr, parentNode, "Resources")
    }
    }else{
        if(node['@type'] == "sunyrdaf:Method" || node['@type'] == "https://data.suny.edu/vocabs/oried/rdaf/suny/Method"){
        var methodElement = linkNodes(node, arr, parentNode, "Methods")
        }
        if(node['@type'] == "sunyrdaf:Participant" || node['@type'] == "https://data.suny.edu/vocabs/oried/rdaf/suny/Participant"){
        var participantElement = linkNodes(node, arr, parentNode, "Participants")
        }
        if(node['@type'] == "sunyrdaf:Role" || node['@type'] == "https://data.suny.edu/vocabs/oried/rdaf/suny/Role"){
            var roleElement = linkNodes(node, arr, parentNode, "Roles")
        }
        if(node['@type'] == "sunyrdaf:Resource" || node['@type'] == "https://data.suny.edu/vocabs/oried/rdaf/suny/Resource"){
        var resourceElement = linkNodes(node, arr, parentNode, "Resources")
        }
    }
    })
}else{
    if(targetNode['name'] == undefined){
    targetNode = findNode(targetNode)
    if(targetNode['@type'] == "sunyrdaf:Method" || targetNode['@type'] == "https://data.suny.edu/vocabs/oried/rdaf/suny/Method"){
        var methodElement = linkNodes(targetNode, arr, parentNode, "Methods")
        }
    if(targetNode['@type'] == "sunyrdaf:Participant" || targetNode['@type'] == "https://data.suny.edu/vocabs/oried/rdaf/suny/Participant"){
        var participantElement = linkNodes(targetNode, arr, parentNode, "Participants")
    }
    if(targetNode['@type'] == "sunyrdaf:Role" || targetNode['@type'] == "https://data.suny.edu/vocabs/oried/rdaf/suny/Role"){
        var roleElement = linkNodes(targetNode, arr, parentNode, "Roles")
    }
    if(targetNode['@type'] == "sunyrdaf:Resource" || targetNode['@type'] == "https://data.suny.edu/vocabs/oried/rdaf/suny/Resource"){
        var resourceElement = linkNodes(targetNode, arr, parentNode, "Resources")
    }
    }else{
    if(targetNode['@type'] == "sunyrdaf:Method" || targetNode['@type'] == "https://data.suny.edu/vocabs/oried/rdaf/suny/Method"){
        var methodElement = linkNodes(targetNode, arr, parentNode, "Methods")
    }
    if(targetNode['@type'] == "sunyrdaf:Participant" || targetNode['@type'] == "https://data.suny.edu/vocabs/oried/rdaf/suny/Participant"){
        var participantElement = linkNodes(targetNode, arr, parentNode, "Participants")
    }
    if(targetNode['@type'] == "sunyrdaf:Role" || targetNode['@type'] == "https://data.suny.edu/vocabs/oried/rdaf/suny/Role"){
        var roleElement = linkNodes(targetNode, arr, parentNode, "Roles")
    }
    if(targetNode['@type'] == "sunyrdaf:Resource" || targetNode['@type'] == "https://data.suny.edu/vocabs/oried/rdaf/suny/Resource"){
        var resourceElement = linkNodes(targetNode, arr, parentNode, "Resources")
    }
    }
}
}

function findNode(nodeUndefined){
for (const nodes of duplicateFrame) {
    if(nodes['@id'] == nodeUndefined){
    return nodes
    }
}
}