import re

with open('brick/building_model.ttl', 'r', encoding='utf-8') as f:
    content = f.read()

chillers = len(re.findall(r'a brick:Chiller\b', content))
floors   = len(re.findall(r'a brick:Floor\b', content))
zones    = len(re.findall(r'a brick:HVAC_Zone\b', content))
ahus     = len(re.findall(r'a brick:AHU\b', content))
vavs     = len(re.findall(r'a brick:VAV\b', content))
chp      = len(re.findall(r'a brick:Chilled_Water_Pump\b', content))
cdp      = len(re.findall(r'a brick:Condenser_Water_Pump\b', content))
ct       = len(re.findall(r'a brick:Cooling_Tower\b', content))
iaq      = len(re.findall(r'a brick:Air_Quality_Sensor\b', content))
ws       = len(re.findall(r'a brick:Weather_Station\b', content))
feeds    = len(re.findall(r'brick:feeds\b', content))
lines    = content.count('\n')

print('=== Brick Model Spot-Check ===')
print(f'  File lines       : {lines}')
print(f'  Chillers         : {chillers} (expected 3)')
print(f'  Floors           : {floors} (expected 4)')
print(f'  HVAC Zones       : {zones} (expected 16)')
print(f'  AHUs             : {ahus} (expected 4)')
print(f'  VAVs             : {vavs} (expected 16)')
print(f'  CHW Pumps        : {chp} (expected 3)')
print(f'  CDW Pumps        : {cdp} (expected 3)')
print(f'  Cooling Towers   : {ct} (expected 3)')
print(f'  IAQ Sensors      : {iaq} (expected 8)')
print(f'  Weather Stations : {ws} (expected 1)')
print(f'  feeds triples    : {feeds}')

ok = all([chillers==3, floors==4, zones==16, ahus==4, vavs==16, chp==3, cdp==3, ct==3, iaq==8, ws==1])
status = 'PASS' if ok else 'FAIL'
print(f'=== {status} ===')
