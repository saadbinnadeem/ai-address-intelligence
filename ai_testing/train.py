import json
import random
import spacy
from spacy.training.example import Example
from spacy.util import minibatch, compounding
import warnings
import os

warnings.filterwarnings("ignore")

BUILDINGS = ["building 2", "building A", "plaza 3", "tower B", "building no 5", "complex 1"]
UNITS = ["flat no 44", "flat 444", "makan num 12", "makkan no 12/22", "plot 55", "shop 8", "flat B-44", "house 99", "39/464", "fs 58/12", "5/1911", "2/34", "A-44", "R-112", "r-22", "B-90", "quarter 4", "banglow 12", "h 73/5", "g 12/4", "c-11"]
BLOCKS = ["block 5", "block no 2", "block 13D", "block 15", "sector 11-B", "sector 3", "sector 5C", "block H", "block N", "phase 6", "phase 8", "precinct 1", "precinct 8", "precinct 11a", "precinct 15", "precinct 27", "precinct 40", "ali block", "usman block", "abu bakar block", "umar block", "sector a", "a block", "aa block", "sector f", "ff block"]
STREETS = ["gali 4", "jinnah road", "tariq road", "university road", "mm alam road", "m.a jinnah road", "street 10", "gali number 2", "wali gli me", "wali gali", "ki back side pe"]
SOCIETIES = ["falaknaz dreams", "falaknaz dream", "askari 4", "saima arabian villas", "navy housing scheme", "bahria apartments", "rehman villas", "rufi lake drive", "chase up apartments", "bahria orchard", "safari villas", "sports city", "bahria farmhouses", "canal view"]
AREAS = ["qissa khwani bazaar", "jannat ul barakat", "f-8 markaz", "jinnah square", "commercial area", "markaz", "h area", "g area", "c area", "federal b area", "midway commercial", "theme park area", "overseas enclave", "bahria hills"]
TOWNS = [
    "liaquatabad", "liaquatabad town", "gulberg", "gulberg town", "gulistan e johar", "dha", "clifton", "johar", "johar town",
    "saddar", "saddar town", "malir", "malir town", "nazimabad", "nazimabad town", "bahria town", "shah faisal", "shah faisal colony", "shah faisal town",
    "korangi", "korangi town", "surjani", "surjani town", "saudabad", "model colony", "baldia", "baldia town", "bin qasim", "bin qasim town",
    "gadap", "gadap town", "gulshan-e-iqbal", "gulshan-e-iqbal town", "jamshed", "jamshed town", "kemari", "kemari town",
    "landhi", "landhi town", "lyari", "lyari town", "new karachi", "new karachi town", "north karachi", "north karachi town",
    "north nazimabad", "north nazimabad town", "orangi", "orangi town", "site", "site town", "ravi", "ravi town",
    "shalimar", "shalimar town", "wagah", "wagah town", "aziz bhatti", "aziz bhatti town", "data ganj bakhsh", "data ganj bakhsh town",
    "samanabad", "samanabad town", "iqbal", "iqbal town", "nishtar", "nishtar town"
]
CITIES = ["karachi", "lahore", "peshawar", "quetta", "islamabad", "rawalpindi", "hyderabad", "multan"]
LANDMARKS = [
    "peeli kothi ke peeche", "jamia masjid ke samne", "near peshawar museum", "chase up ke baghal me", "ptv station ke pass", 
    "imtiaz super market ke pass", "disco bakery ke samne", "near maroof sweet", "baitul mukarram ke pass", "farooqi masjid ke pass",
    "maroof sweet ke piche wali gli me", "jamia masjid ke baraber me", "chase up ke samne wali gali me", "farooqi masjid ke baghal wali gli me"
]

TEMPLATES = [
    [("BUILDING", BUILDINGS), ("UNIT", UNITS), ("SOCIETY", SOCIETIES), ("TOWN", TOWNS), ("CITY", CITIES)],
    [("BLOCK", BLOCKS), ("UNIT", UNITS), ("SOCIETY", SOCIETIES), ("TOWN", TOWNS), ("CITY", CITIES)],
    [("BUILDING", BUILDINGS), ("UNIT", UNITS), ("AREA", AREAS), ("TOWN", TOWNS), ("CITY", CITIES)],
    [("UNIT", UNITS), ("BLOCK", BLOCKS), ("TOWN", TOWNS), ("CITY", CITIES)],
    [("UNIT", UNITS), ("TOWN", TOWNS), ("CITY", CITIES)], 
    [("UNIT", UNITS), ("TOWN", TOWNS)], 
    [("UNIT", UNITS), ("STREET", STREETS), ("LANDMARK", LANDMARKS), ("TOWN", TOWNS), ("CITY", CITIES)],
    [("CITY", CITIES), ("TOWN", TOWNS), ("BLOCK", BLOCKS), ("UNIT", UNITS)],
    [("UNIT", UNITS), ("AREA", AREAS), ("TOWN", TOWNS), ("CITY", CITIES)], 
    [("UNIT", UNITS), ("SOCIETY", SOCIETIES), ("AREA", AREAS), ("CITY", CITIES), ("LANDMARK", LANDMARKS)],
    [("UNIT", UNITS), ("BLOCK", BLOCKS), ("AREA", AREAS), ("TOWN", TOWNS), ("CITY", CITIES), ("LANDMARK", LANDMARKS)],
    [("CITY", CITIES), ("STREET", STREETS), ("UNIT", UNITS), ("LANDMARK", LANDMARKS)],
    [("LANDMARK", LANDMARKS), ("TOWN", TOWNS), ("UNIT", UNITS), ("CITY", CITIES)]
]

def apply_random_casing(text):
    chance = random.random()
    if chance < 0.33:
        return text.lower()
    elif chance < 0.66:
        return text.title()
    else:
        return text.upper()

def generate_massive_dataset(num_records=10000):
    dataset = []
    for _ in range(num_records):
        template = random.choice(TEMPLATES)
        clean_text = ""
        entities = []
        current_pos = 0
        for label, choice_list in template:
            raw_value = random.choice(choice_list)
            value = apply_random_casing(raw_value) 
            clean_text += value + " "
            start = current_pos
            end = current_pos + len(value)
            entities.append((start, end, label))
            current_pos = end + 1
        dataset.append({
            "text": clean_text.strip(),
            "entities": entities
        })
    with open("dataset.json", "w", encoding="utf-8") as f:
        json.dump(dataset, f, indent=2)

def load_dataset_from_json(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    formatted_data = []
    for item in data:
        formatted_data.append((item["text"], {"entities": item["entities"]}))
    return formatted_data

def train_address_ner_fast(training_data, iterations=150, output_dir="saved_address_model"):
    nlp = spacy.blank("en")
    if "ner" not in nlp.pipe_names:
        ner = nlp.add_pipe("ner", last=True)
    else:
        ner = nlp.get_pipe("ner")
    for _, annotations in training_data:
        for ent in annotations.get("entities"):
            ner.add_label(ent[2])
    optimizer = nlp.begin_training()
    
    for itn in range(iterations):
        random.shuffle(training_data)
        losses = {}
        batches = minibatch(training_data, size=compounding(4.0, 32.0, 1.001))
        for batch in batches:
            examples = []
            for text, annotations in batch:
                doc = nlp.make_doc(text)
                examples.append(Example.from_dict(doc, annotations))
            nlp.update(examples, drop=0.35, sgd=optimizer, losses=losses)
        current_loss = losses.get('ner', 0)
        
        if current_loss < 0.5:
            break
            
    nlp.to_disk(output_dir)
    return nlp

if __name__ == "__main__":
    generate_massive_dataset(10000)
    TRAIN_DATA = load_dataset_from_json("dataset.json")
    train_address_ner_fast(TRAIN_DATA, 150, "saved_address_model")