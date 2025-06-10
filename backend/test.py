import requests
import pandas as pd
import json

csv = pd.read_csv('Fashion Dataset v2.csv')
names = csv['name']
urls = csv['img']
namecount=0
urlcount=0

with open('masterfinal.json', 'r') as file:
    data = json.load(file)

for item in data:
    print("|",end='')
    if item['data']['productDisplayName'] in names:
        namecount+=1
        print("Found 1")
    try:
        if item['styleImages']['Default']['imgURL']:
            urlcount+=1
    except:
        continue

print("\n\n")
print("Overlap",namecount)
print("overlap url",urlcount)