import pandas as pd
import json
import uuid

def get_obj(obj_id,name,category):
    obj = {}
    obj['key'] = obj_id
    obj['text'] = name
    obj['category'] = category
    return obj

def increment_alphabet(char):
    if char.isalpha() and len(char) == 1:
        ascii_code = ord(char)
        if char.islower():
            new_ascii_code = (ascii_code - ord('a') + 1) % 26 + ord('a')
        else:
            new_ascii_code = (ascii_code - ord('A') + 1) % 26 + ord('A')
        return chr(new_ascii_code)
    else:
        return char

uuids = {}
text_to_id = {}
def get_uuid(category,text):
    if category not in uuids:
        uuids[category] = 0
        text_to_id[category] = {}
    if text not in text_to_id[category]:
        uuids[category] = uuids[category] + 1
        text_to_id[category][text] = "suny:" + category + '.' + str(uuids[category])
    return text_to_id[category][text]

links = []
entities = []
startNode = {
    'key': 'Start',
    'text': 'Stages',
    'category': 'stage'
}

rdaf_objs = {'stage': {}, 'topic': {}, 'subtopic': {} }
suny_objs = {}

st_df = pd.read_csv("rdafstagesandtopics.csv", encoding="utf-8",dtype="str")
mapping_df = pd.read_csv("sunymappings.csv",encoding="utf-8",dtype="str")

for index,row in st_df.iterrows():
    obj = { 'name': row['Name'], 'description': row['Definition'] }
    otype = row['Type'].lower()
    rdaf_objs[otype][row['ID']] = obj
    if otype == 'topic':
        sid = row['ID'].split('.')[0]
        links.append({'from':'Start', 'fromport':sid, 'to':row['ID']})


extensions = {}
def add_extension(source_id,target_id):
    if source_id not in extensions:
        extensions[source_id] = {}
    extensions[source_id][target_id] = 1

def get_extension(text):
    parts = text.split(':',1)
    extends = None
    if len(parts) == 2 and parts[0].strip().split(' ')[0] in rdaf_objs['subtopic']:
        extends = parts[0].strip().split(' ')[0]
        name = parts[1].strip()
    else:
        name = text
    return (extends,name)

def map_row(row,last_subtopic):
    subtopic_id = None
    if str(row['SUBTOPIC']) == 'nan':
        subtopic_id = last_subtopic
    else:
        (subtopic_id,subtopic_text) = row['SUBTOPIC'].strip().split(' ',1)
        if subtopic_id not in rdaf_objs['subtopic']:
            topic_id = '.'.join(subtopic_id.split('.')[0:2])
            sub_obj = { 'name': subtopic_text, 'topic': topic_id, 'considerationFor': [], 'extensions': [] }
            rdaf_objs['subtopic'][subtopic_id] = sub_obj
        last_subtopic = subtopic_id
    considerations = []
    if str(row['Consideration For (Inputs)']) != 'nan':
        considerations = row['Consideration For (Inputs)'].strip().split(',')
        rdaf_objs['subtopic'][subtopic_id]['considerationFor'] = considerations
    activity_id = None
    if str(row['Activity']) != 'nan':
        activity = row['Activity'].strip()
        activity_id = get_uuid('activity',activity)
        suny_objs[activity_id] = { 'name':activity, 'type': 'activity', 'outputs': [], 'participants': [], 'roles': [], 'resources': [], 'extends': subtopic_id  }
        add_extension(subtopic_id,activity_id)
    if str(row['Outcomes (see comment)']) != 'nan':
        parts = row['Outcomes (see comment)'].strip().split(':',1)
        (outcome_extends,outcome) = get_extension(row['Outcomes (see comment)'].strip())
        outcome_id = get_uuid('outcome',outcome)
        if outcome_extends:
            add_extension(outcome_extends,outcome_id)
        topic_id = '.'.join(subtopic_id.split('.')[0:2])
        suny_objs[outcome_id] = { 'name':outcome, 'type': 'outcome', 'activities': {}, 'extends': outcome_extends, 'topic': topic_id }
        if activity_id:
            suny_objs[outcome_id]['activities'][activity_id] = 1
    if str(row['Milestone Indicator (Outputs)']) != 'nan':
        (output_extends,output) = get_extension(row['Milestone Indicator (Outputs)'].strip())
        output_id = get_uuid('output',output)
        if output_extends:
            add_extension(output_extends,outcome_id)
        suny_objs[output_id] = { 'name':output, 'type': 'output', 'extends': output_extends }
        if activity_id:
            suny_objs[activity_id]['outputs'].append(output_id)
    return last_subtopic

last_subtopic = None
for index,row in mapping_df.iterrows():
    last_subtopic = map_row(row,last_subtopic)
for extension in extensions:
    rdaf_objs['subtopic'][extension]['extensions'] = extensions[extension]

stages = []
for stage in rdaf_objs['stage']:
    tooltip = rdaf_objs['stage'][stage]['description']
    name = rdaf_objs['stage'][stage]['name']
    stages.append({'port':stage, 'text':name, 'tooltip':tooltip})


considerations = {}
for subtopic in rdaf_objs['subtopic']:
    name = rdaf_objs['subtopic'][subtopic]['name']
    obj = get_obj(subtopic,name,'consideration')
    obj['text'] = name
    entities.append(obj)
    if len(rdaf_objs['subtopic'][subtopic]['considerationFor']) > 0:
        for obj_id in rdaf_objs['subtopic'][subtopic]['considerationFor']:
            if obj_id in rdaf_objs['topic']:
                links.append({'from':obj_id, 'fromport':'considerations', 'to':subtopic})
            if obj_id not in considerations:
                considerations[obj_id] = {}
            considerations[obj_id][subtopic] = 1


for topic in rdaf_objs['topic']:
    tooltip = rdaf_objs['topic'][topic]['description']
    name = rdaf_objs['topic'][topic]['name']
    obj = get_obj(topic,name,'topic')
    obj['a'] = 'outcomes'
    obj['aText'] = 'Outcomes'
    obj['aToolTip'] = tooltip
    if topic in considerations:
        obj['category'] = obj['category'] + '-considerations'
        obj['y'] = 'considerations'
        obj['yText'] = 'Considerations'
        obj['yToolTip'] = 'Considerations for ' + topic
    entities.append(obj)

for obj_id in suny_objs:
    otype = suny_objs[obj_id]['type']
    oname = suny_objs[obj_id]['name']
    isExtension = None
    if 'extends' in suny_objs[obj_id] and suny_objs[obj_id]['extends']:
        isExtension = suny_objs[obj_id]['extends'] 
    obj = get_obj(obj_id,oname,otype)
    if otype == 'outcome':
        obj['a'] = 'activities'
        obj['aText'] = 'Activities'
        obj['aToolTip'] = 'Activities that result in ' + oname
        for activity in suny_objs[obj_id]['activities']:
            links.append({'from': obj_id, 'fromport':'activities','to':activity})
        topic = suny_objs[obj_id]['topic']
        links.append({'from':topic,'fromport':'outcomes','to':obj_id})
    elif otype == 'output':
        parts = obj_id.split('|')
        if len(parts) > 1:
            obj['text'] = parts[0]
            obj['category'] = 'output-linked'
            obj['b'] = parts[1]
            obj['bText'] = 'View'
            obj['bToolTip'] = parts[1]
    elif otype == 'activity':
        obj['a'] = 'participants'
        obj['aText'] = 'Participants'
        obj['aToolTip'] = 'Participants in ' + oname
        obj['b'] = 'methods'
        obj['bText'] = 'Methods'
        obj['bToolTip'] = 'Methods for ' + oname
        obj['c'] = 'outputs'
        obj['cText'] = 'Outputs'
        obj['cToolTip'] = 'Outputs of ' + oname
        obj['d'] = 'pgroups'
        obj['dText'] = 'Roles'
        obj['dToolTip'] = 'Roles involved in ' + oname
        obj['e'] = 'resources'
        obj['eText'] = 'resources'
        obj['eToolTip'] = 'Resources used by ' + oname
        for output in suny_objs[obj_id]['outputs']:
            links.append({'from': obj_id, 'fromport':'outputs','to':output})
    if isExtension:
        if isExtension in considerations:
            obj['category'] = obj['category'] + '-' + "extension-considerations"
            for cid in considerations[isExtension]:
                links.append({'from':obj_id, 'fromport':'considerations', 'to':cid})
            obj['y'] = 'considerations'
            obj['yText'] = 'Considerations'
            obj['yToolTip'] = 'Considerations for' + oname
        else:
            obj['category'] = obj['category'] + '-' + "extension"
        obj['z'] = 'extends'
        obj['zText'] = 'RDaF Subtopic'
        obj['zToolTip'] = isExtension + ' ' + rdaf_objs['subtopic'][isExtension]['name']
        links.append({'from':obj_id, 'fromport':'extends', 'to':suny_objs[obj_id]['extends']})
    entities.append(obj)

port = 'a'
for stage in stages:
    startNode[port] = stage['port']
    startNode[port + 'Text'] = stage['text']
    startNode[port + 'ToolTip'] = stage['tooltip']
    port = increment_alphabet(port)
entities.insert(0,startNode)

with open("entities.json", "w") as json_file:
    json.dump(entities, json_file, indent=4)

with open("links.json","w") as json_file:
    json.dump(links, json_file, indent=4)
print(text_to_id)
