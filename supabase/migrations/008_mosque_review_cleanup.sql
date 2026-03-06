-- Migration 007: Mosque Review Cleanup
-- Generated 2026-03-04
-- Based on manual review in docs/mosque-review.md
-- Deletions: 14, Updates: 60

-- ============================================
-- DELETIONS (14 mosques)
-- ============================================

-- Remove event references to deleted mosques
UPDATE events SET mosque_id = NULL WHERE mosque_id = '140346e3-bcc7-4543-9f90-54a31f02061d';
UPDATE events SET mosque_id = NULL WHERE mosque_id = '15344431-79dc-4e0f-914d-1eafe105077a';
UPDATE events SET mosque_id = NULL WHERE mosque_id = 'cadb5743-5ac6-4928-8d2e-06be019d266d';
UPDATE events SET mosque_id = NULL WHERE mosque_id = '8593b2a2-9dc5-4e2d-bf75-0fe73c9e4549';
UPDATE events SET mosque_id = NULL WHERE mosque_id = 'c133446e-b8b4-42ae-84d8-7973628428e3';
UPDATE events SET mosque_id = NULL WHERE mosque_id = 'dca4dd6b-5ba0-4657-bbe3-2ec9281acfe3';
UPDATE events SET mosque_id = NULL WHERE mosque_id = '1e324d04-2719-4ab1-ac6f-f0428ec939ee';
UPDATE events SET mosque_id = NULL WHERE mosque_id = '711dd509-b815-420a-8b9b-3f98bb59cdc8';
UPDATE events SET mosque_id = NULL WHERE mosque_id = '68ed74a6-3cbf-4b1d-8bef-8125152d2786';
UPDATE events SET mosque_id = NULL WHERE mosque_id = '6575e0c3-9b53-45b0-9bf4-6bd8368a1f42';
UPDATE events SET mosque_id = NULL WHERE mosque_id = 'f32a8c4d-7fe1-450c-add1-5f0ff19cd225';
UPDATE events SET mosque_id = NULL WHERE mosque_id = 'e9fd5616-0fe7-4477-9a87-fef83cbf7ec9';
UPDATE events SET mosque_id = NULL WHERE mosque_id = '090df8c8-abdb-4065-8f13-e63c8392ddf7';
UPDATE events SET mosque_id = NULL WHERE mosque_id = '80b0bfb3-f3ab-465a-86e5-5e47d0902cba';

-- Delete: Al-Amanah College Mosque
DELETE FROM mosques WHERE id = '140346e3-bcc7-4543-9f90-54a31f02061d';

-- Delete: Bass Hill Mosque
DELETE FROM mosques WHERE id = '15344431-79dc-4e0f-914d-1eafe105077a';

-- Delete: Bukhari House
DELETE FROM mosques WHERE id = 'cadb5743-5ac6-4928-8d2e-06be019d266d';

-- Delete: Campsie Mosque (Turkish)
DELETE FROM mosques WHERE id = '8593b2a2-9dc5-4e2d-bf75-0fe73c9e4549';

-- Delete: IREA (Islamic Research & Educational Academy)
DELETE FROM mosques WHERE id = 'c133446e-b8b4-42ae-84d8-7973628428e3';

-- Delete: ISRA (Islamic Sciences & Research Academy)
DELETE FROM mosques WHERE id = 'dca4dd6b-5ba0-4657-bbe3-2ec9281acfe3';

-- Delete: Masjid Ibrahim
DELETE FROM mosques WHERE id = '1e324d04-2719-4ab1-ac6f-f0428ec939ee';

-- Delete: Masjid Wardah
DELETE FROM mosques WHERE id = '711dd509-b815-420a-8b9b-3f98bb59cdc8';

-- Delete: Toongabbie Mosque
DELETE FROM mosques WHERE id = '68ed74a6-3cbf-4b1d-8bef-8125152d2786';

-- Delete: UNSW Musallah
DELETE FROM mosques WHERE id = '6575e0c3-9b53-45b0-9bf4-6bd8368a1f42';

-- Delete: Werribee Islamic Centre
DELETE FROM mosques WHERE id = 'f32a8c4d-7fe1-450c-add1-5f0ff19cd225';

-- Delete: Masjid Al-Farooq (Sunnybank)
DELETE FROM mosques WHERE id = 'e9fd5616-0fe7-4477-9a87-fef83cbf7ec9';

-- Delete: Madina Mosque (Wanneroo)
DELETE FROM mosques WHERE id = '090df8c8-abdb-4065-8f13-e63c8392ddf7';

-- Delete: Woden Mosque
DELETE FROM mosques WHERE id = '80b0bfb3-f3ab-465a-86e5-5e47d0902cba';

-- ============================================
-- UPDATES (60 mosques)
-- ============================================

-- Update: Ahl Al Sunnah Wal Jamaah → Masjid As-Salaam (Chester Hill)
UPDATE mosques SET
  name = 'Masjid As-Salaam (Chester Hill)',
  address = '40 Hector St, Chester Hill NSW 2162',
  latitude = -33.8848689,
  longitude = 151.0065648
WHERE id = '41ec0fd8-4065-445f-b7fb-8af988521f31';

-- Update: Al Zahra Mosque → Masjid Darul IMAAN (Arncliffe)
UPDATE mosques SET
  name = 'Masjid Darul IMAAN (Arncliffe)',
  address = '10 Eden Street, Wolli Creek NSW 2205',
  suburb = 'Wolli Creek',
  latitude = -33.936626,
  longitude = 151.1492267
WHERE id = '37d09589-18df-4e7a-b181-7a0a045ff392';

-- Update: Al-Faisal College Mosque → Masjid Omar (Auburn)
UPDATE mosques SET
  name = 'Masjid Omar (Auburn)',
  address = '43-47 Harrow Rd, Auburn NSW 2144, Australia',
  latitude = -33.8555183,
  longitude = 151.0305828,
  nicknames = ARRAY['Omar Mosque']::TEXT[]
WHERE id = 'ee74b4c3-8f3b-4e8a-ae4b-0215ade38aae';

-- Update: Auburn Gallipoli Mosque → (name unchanged)
UPDATE mosques SET
  address = '15-19 Gelibolu Pde, Auburn',
  latitude = -33.850828,
  longitude = 151.0344826,
  nicknames = ARRAY['Gallipoli']::TEXT[]
WHERE id = '1e449bfd-7c1a-40b1-b051-2b83ea72917e';

-- Update: Australian Islamic House → (name unchanged)
UPDATE mosques SET
  nicknames = ARRAY['AIH']::TEXT[]
WHERE id = '05ac3335-6e5a-466f-942a-7d1d3101c3a2';

-- Update: Blacktown Islamic Centre → Blacktown Mosque (Usman Mosque)
UPDATE mosques SET
  name = 'Blacktown Mosque (Usman Mosque)',
  address = '15 Fourth Avenue, Blacktown, NSW, Australia, 2148',
  latitude = -33.7640427,
  longitude = 150.9096006
WHERE id = '1a382ffd-9dc4-4d25-90a2-aef750a402f0';

-- Update: Cabramatta Mosque → Othman Bin Affan Mosque (Cabramatta)
UPDATE mosques SET
  name = 'Othman Bin Affan Mosque (Cabramatta)',
  address = '22 Water St, Cabramatta NSW 2166',
  latitude = -33.8948903,
  longitude = 150.9146006,
  nicknames = ARRAY['Cabramatta Mosque', 'Cabramatta West – Othman Bin Affan Masjid']::TEXT[]
WHERE id = '659a16b4-3d01-4a09-8b1e-4f22cfc5b4b1';

-- Update: Campbelltown Musallah → CYC Campbelltown
UPDATE mosques SET
  name = 'CYC Campbelltown',
  nicknames = ARRAY['CYC', 'Campbelltown Youth Centre']::TEXT[]
WHERE id = 'd2bf63ec-a742-46f7-9414-e5a93dc02034';

-- Update: Dar Ibn Abbas → Daar Ibn Abbas (Condell Park)
UPDATE mosques SET
  name = 'Daar Ibn Abbas (Condell Park)',
  address = '131 Eldridge Rd, Condell Park NSW 2200',
  suburb = 'Condell Park',
  latitude = -33.930358,
  longitude = 151.008378,
  nicknames = ARRAY['DIA']::TEXT[]
WHERE id = '860967fd-bb61-4ca2-bee6-f376dd6b4b29';

-- Update: Guildford Mosque → ICMG Guildford Mosque
UPDATE mosques SET
  name = 'ICMG Guildford Mosque',
  address = '64 Mountford Avenue, Guildford, NSW, Australia, 2161',
  latitude = -33.8520259,
  longitude = 150.9874625
WHERE id = 'fa654b22-7dcb-4b86-9ce6-9ed43f4696cd';

-- Update: Hoxton Park Mosque (ICSA) → Masjid Bilal (Hoxton Park Mosque)
UPDATE mosques SET
  name = 'Masjid Bilal (Hoxton Park Mosque)',
  address = '6 Wilson Rd, Hinchinbrook NSW 2168',
  latitude = -33.9199345,
  longitude = 150.8632424
WHERE id = 'a0d163b6-48f0-42f6-be5d-3049bb1d87de';

-- Update: Imam Hasan Centre → Imam Hasan Centre (Annangrove)
UPDATE mosques SET
  name = 'Imam Hasan Centre (Annangrove)',
  address = '165 Annangrove Road, Annangrove, NSW, Australia, 2156',
  suburb = 'Annangrove',
  latitude = -33.6712963,
  longitude = 150.9567839
WHERE id = '1a675ff8-3163-4f3c-a9a3-7d84315520b6';

-- Update: Islamic Society of Manly Warringah → Dee Why Masjid (ISMW)
UPDATE mosques SET
  name = 'Dee Why Masjid (ISMW)',
  address = '12 South Creek Rd, Dee Why NSW 2099',
  latitude = -33.7435703,
  longitude = 151.293536,
  nicknames = ARRAY['ISMW']::TEXT[]
WHERE id = 'cc983a76-48d0-4770-aefb-2af7070cc986';

-- Update: Kellyville Mosque (Islamic Centre of the Hills) → Hills District Muslim Society
UPDATE mosques SET
  name = 'Hills District Muslim Society',
  address = 'Harvery Lower Pavilion, Castle Hill',
  suburb = 'Castle Hill',
  latitude = -33.7183524,
  longitude = 150.9835742,
  nicknames = ARRAY['HDMS']::TEXT[]
WHERE id = '359d8e3b-9b4b-49c2-b74b-e368e3ed4e73';

-- Update: Lakemba Mosque (Imam Ali bin Abi Talib) → (name unchanged)
UPDATE mosques SET
  address = '71-75 Wangee Rd, Lakemba NSW 2195',
  latitude = -33.9121219,
  longitude = 151.073664,
  nicknames = ARRAY['Big Mosque']::TEXT[]
WHERE id = '423483d6-3b2c-42bb-ae2d-cb50b19fc220';

-- Update: Lidcombe Mosque → Abu Hanifa Institute (Lidcombe)
UPDATE mosques SET
  name = 'Abu Hanifa Institute (Lidcombe)',
  address = '22-24 Bridge Street, Lidcombe, NSW, Australia, 2141',
  latitude = -33.8638857,
  longitude = 151.0427934
WHERE id = '49f35beb-c39a-432f-bb8e-6945eec1f95b';

-- Update: Markaz Imam Ahmad → Markaz Imam Ahmad (Liverpool)
UPDATE mosques SET
  name = 'Markaz Imam Ahmad (Liverpool)'
WHERE id = '0a268f5a-236f-48e9-84e5-0709388b70fe';

-- Update: Masjid Al-Azhar → Masjid Al-Azhar (Belmore)
UPDATE mosques SET
  name = 'Masjid Al-Azhar (Belmore)',
  address = '172b Burwood Rd, Belmore',
  latitude = -33.915511,
  longitude = 151.087195
WHERE id = '470921f5-59f8-4064-afef-1adef5838f94';

-- Update: Masjid Al-Hijrah → Tempe Mosque Masjid Al-Hijrah
UPDATE mosques SET
  name = 'Tempe Mosque Masjid Al-Hijrah',
  address = '45 Station St, Tempe NSW 2044',
  latitude = -33.9254371,
  longitude = 151.159321,
  nicknames = ARRAY['Tempe Mosque']::TEXT[]
WHERE id = '58a970bd-74e7-4bc1-a79c-4527b22aa44d';

-- Update: Masjid Al-Noor → (name unchanged)
UPDATE mosques SET
  address = '1-3 Ferndell St, South Granville NSW 2142',
  suburb = 'South Granville',
  latitude = -33.8668812,
  longitude = 151.0085065
WHERE id = '75f3e8dc-7211-4dd7-bc33-0dccfd6a8d38';

-- Update: Masjid As-Sunnah → Masjid As-Sunnah (Lakemba)
UPDATE mosques SET
  name = 'Masjid As-Sunnah (Lakemba)',
  address = '132 Haldon St, Lakemba NSW 2195, Australia',
  suburb = 'Lakemba',
  latitude = -33.9230804,
  longitude = 151.0789965
WHERE id = '64809aa6-7684-4e18-9850-2ed5cb4a0c2f';

-- Update: Parramatta Mosque → (name unchanged)
UPDATE mosques SET
  address = 'Unit 40/150 Marsden St, Parramatta NSW 2150',
  latitude = -33.8139117,
  longitude = 151.0016017
WHERE id = '7c7373b5-44b3-47b4-8a39-1f697e1e7406';

-- Update: Punchbowl Mosque (Masjid Bilal) → Punchbowl Mosque
UPDATE mosques SET
  name = 'Punchbowl Mosque',
  address = '25 Matthews Street, Punchbowl, NSW, Australia, 2196',
  latitude = -33.9271839,
  longitude = 151.0574031,
  nicknames = ARRAY['AIM']::TEXT[]
WHERE id = 'a6eb1178-990d-401a-baad-c084c1c0619f';

-- Update: Revesby Mosque → ASWJ Revesby
UPDATE mosques SET
  name = 'ASWJ Revesby',
  address = '10/9-11 Mavis Street, Revesby, NSW, Australia, 2212',
  latitude = -33.9363483,
  longitude = 151.018958,
  nicknames = ARRAY['ASWJ']::TEXT[]
WHERE id = '6fd828f3-836e-40c7-9467-d564edc489cf';

-- Update: Rooty Hill Mosque → Rooty Hill Masjid
UPDATE mosques SET
  name = 'Rooty Hill Masjid',
  address = '33 Headcorn Street, Mount Druitt, NSW, Australia, 2770',
  suburb = 'Mount Druitt',
  latitude = -33.7589425,
  longitude = 150.830081
WHERE id = '7c04e81a-f2d6-47ad-b399-815f67d745bb';

-- Update: Roselands Mosque (Masjid Darul Imaan) → Roselands Mosque
UPDATE mosques SET
  name = 'Roselands Mosque',
  address = '37 Ludgate Street, Roselands, NSW, Australia, 2196',
  latitude = -33.9312331,
  longitude = 151.0781936
WHERE id = 'a3dc7d40-a258-448f-b6f1-cec5420196df';

-- Update: Smithfield Mosque → (name unchanged)
UPDATE mosques SET
  nicknames = ARRAY['Bourke Street Mosque']::TEXT[]
WHERE id = '32288989-1662-4c59-8d3f-8e9186f23832';

-- Update: Surry Hills Mosque → (name unchanged)
UPDATE mosques SET
  address = '177 Commonwealth St, Surry Hills NSW 2010',
  latitude = -33.8832847,
  longitude = 151.2101396,
  nicknames = ARRAY['King Faisal Mosque']::TEXT[]
WHERE id = 'ba44999c-a9ed-4333-9a8c-e2cc454e1455';

-- Update: Broadmeadows Mosque (Turkish) → (name unchanged)
UPDATE mosques SET
  address = '45-55 King St, Dallas VIC 3047',
  suburb = 'Dallas',
  latitude = -37.6687898,
  longitude = 144.9416693,
  nicknames = ARRAY['Broadmeadows Turkish Islamic Cultural Centre']::TEXT[]
WHERE id = '790d3843-9180-4d31-9722-c5cfe6c38762';

-- Update: Dandenong Mosque → Emir Sultan Mosque (Dandenong)
UPDATE mosques SET
  name = 'Emir Sultan Mosque (Dandenong)',
  address = '139 Cleeland St, Dandenong VIC 3175',
  latitude = -37.9747393,
  longitude = 145.2160538,
  nicknames = ARRAY['ICMG Dandenong']::TEXT[]
WHERE id = '425c45d1-c5aa-4065-afb6-a15f1430b066';

-- Update: Epping Mosque (Epping Islamic Centre) → Al Siraat College (Epping)
UPDATE mosques SET
  name = 'Al Siraat College (Epping)',
  address = '45 Harvest Home Rd, Epping VIC 3076, Australia',
  latitude = -37.6249696,
  longitude = 145.0370175
WHERE id = '71b5440f-4a68-4d93-957e-7ba81563f799';

-- Update: Fawkner Mosque → (name unchanged)
UPDATE mosques SET
  address = '17 Baird St, Fawkner VIC 3060',
  latitude = -37.7053426,
  longitude = 144.9712614,
  nicknames = ARRAY['Darul Ulum Islamic College Masjid']::TEXT[]
WHERE id = '4026a52d-466b-4dbe-84b0-0be8a4136fba';

-- Update: Hallam Mosque (Hira Masjid) → Hallam Masjid (Belgrave)
UPDATE mosques SET
  name = 'Hallam Masjid (Belgrave)',
  address = '131-133 Hallam Belgrave Road, Narre Warren North, VIC, Australia, 3804',
  suburb = 'Narre Warren North',
  latitude = -37.9893773,
  longitude = 145.2785969
WHERE id = 'fb4e1270-8dea-4b39-a6eb-8dc8d2f555fb';

-- Update: Heidelberg Mosque → Elsedeaq Heidelberg Mosque
UPDATE mosques SET
  name = 'Elsedeaq Heidelberg Mosque',
  address = '32 Elliott St, Heidelberg Heights, VIC, 3081, Australia',
  suburb = 'Heidelberg Heights',
  latitude = -37.7442806,
  longitude = 145.0514572
WHERE id = '90614fd3-ee9a-4959-aebb-05412be24f1c';

-- Update: IISCA Doveton Mosque → Afghan Islamic Centre & Omar Farooq Mosque (Doveton) - AICOM
UPDATE mosques SET
  name = 'Afghan Islamic Centre & Omar Farooq Mosque (Doveton) - AICOM',
  address = '14-16 Photinia Street, Doveton, VIC, Australia, 3177',
  latitude = -37.9922743,
  longitude = 145.2360755,
  nicknames = ARRAY['AICOM']::TEXT[]
WHERE id = '8b7d7005-0941-41a1-9999-f1e73e04b7eb';

-- Update: Newport Mosque → Australian Islamic Centre (Newport)
UPDATE mosques SET
  name = 'Australian Islamic Centre (Newport)',
  address = '23-27 Blenheim Rd, Newport VIC 3015',
  latitude = -37.8465892,
  longitude = 144.8631737
WHERE id = '19755a67-4e9f-48ca-b2ff-37f32e9bbc2b';

-- Update: Omar bin Al-Khattab Mosque (Carlton) → Albanian Australian Islamic Society – AAIS (Carlton North)
UPDATE mosques SET
  name = 'Albanian Australian Islamic Society – AAIS (Carlton North)',
  nicknames = ARRAY['AAIS']::TEXT[]
WHERE id = 'b6b415cf-cada-43e8-b3c1-5753519205e0';

-- Update: Preston Mosque → Omar Bin Al Khattab Masjid Preston
UPDATE mosques SET
  name = 'Omar Bin Al Khattab Masjid Preston',
  nicknames = ARRAY['Preston Mosque']::TEXT[]
WHERE id = '403bdd7b-429d-403b-a6d9-1bf88b87a1a5';

-- Update: Sunshine Mosque → Sunshine Mosque (Ardeer)
UPDATE mosques SET
  name = 'Sunshine Mosque (Ardeer)',
  address = '618 Ballarat Rd, Ardeer VIC 3022',
  suburb = 'Ardeer',
  latitude = -37.7715384,
  longitude = 144.8012782
WHERE id = '1fe14aa5-a285-43d8-82e8-46530dcbcb99';

-- Update: Virgin Mary Mosque → (name unchanged)
UPDATE mosques SET
  address = '143 Hogans Rd, Hoppers Crossing VIC 3029',
  latitude = -37.863196,
  longitude = 144.684124
WHERE id = '88d544c7-cfb6-4602-bb9e-3f03e6a5e347';

-- Update: Darra Mosque → Darra Mosque (Oxley)
UPDATE mosques SET
  name = 'Darra Mosque (Oxley)',
  address = '219 Douglas St, Oxley QLD 4075',
  suburb = 'Oxley',
  latitude = -27.5670147,
  longitude = 152.9705377,
  nicknames = ARRAY['Darra Mosque', 'Darra Masjid', 'Islamic Society of Darra']::TEXT[]
WHERE id = 'f17ff44e-6d46-4491-bb33-e1dd679a6754';

-- Update: Gold Coast Mosque → Gold Coast Arundel Masjid
UPDATE mosques SET
  name = 'Gold Coast Arundel Masjid',
  address = '144 Allied Dr, Arundel QLD 4214',
  latitude = -27.9389675,
  longitude = 153.3868771,
  nicknames = ARRAY['Gold Coast Mosque', 'Arundel Masjid']::TEXT[]
WHERE id = 'd1c41424-0e16-4bf0-ae94-4bb3c996a35c';

-- Update: Kuraby Mosque (Islamic Society of Holland Park) → Masjid Al Farooq (Kuraby Mosque)
UPDATE mosques SET
  name = 'Masjid Al Farooq (Kuraby Mosque)',
  address = '1408 Beenleigh Road, Kuraby, QLD, Australia, 4112',
  suburb = 'Kuraby',
  latitude = -27.6057707,
  longitude = 153.0933994,
  nicknames = ARRAY['Kuraby Mosque']::TEXT[]
WHERE id = '1203bf78-5379-4beb-ae65-786b04614eca';

-- Update: Logan Mosque (Masjid Taqwa) → Masjid Al Salam (Logan Mosque)
UPDATE mosques SET
  name = 'Masjid Al Salam (Logan Mosque)',
  address = '262 Third Avenue, Kingston, QLD, Australia, 4114',
  suburb = 'Kingston',
  latitude = -27.6575862,
  longitude = 153.0919509
WHERE id = '5bb5e51b-564a-4954-887a-b6d9a229e8c6';

-- Update: Slacks Creek Mosque → (name unchanged)
UPDATE mosques SET
  address = '16 Queens Road, Slacks Creek, QLD, Australia, 4127',
  latitude = -27.6572129,
  longitude = 153.1425626
WHERE id = 'fb6c3ce8-7f03-4b2b-b733-bc08b6855be7';

-- Update: Toowoomba Mosque → (name unchanged)
UPDATE mosques SET
  address = '217 West St, Toowoomba QLD 4350',
  latitude = -27.5988871,
  longitude = 151.9365516
WHERE id = 'bd0ab807-c58e-45d9-948f-b5149f4de77e';

-- Update: Canning Vale Mosque → Canning Vale Mosque (Iqra Academy Centre)
UPDATE mosques SET
  name = 'Canning Vale Mosque (Iqra Academy Centre)',
  address = '33 Tulloch Way, Canning Vale WA 6155',
  latitude = -32.065365,
  longitude = 115.9312406
WHERE id = '600509cc-4f3f-48c0-afe7-ff4302017daf';

-- Update: Kenwick Mosque → (name unchanged)
UPDATE mosques SET
  address = '404 Bickley Rd, Kenwick WA 6107',
  latitude = -32.0215823,
  longitude = 115.9744682
WHERE id = '8aa8c52c-6916-415f-980e-99a0143cb2bd';

-- Update: Masjid Ibrahim (Southern River) → (name unchanged)
UPDATE mosques SET
  address = '2 Leslie St, Southern River, Western Australia 6110',
  latitude = -32.0941829,
  longitude = 115.9722899
WHERE id = 'e3632b33-ef31-4620-8521-a63c6988674c';

-- Update: Mirrabooka Mosque → Masjid Al-Taqwa (Mirrabooka)
UPDATE mosques SET
  name = 'Masjid Al-Taqwa (Mirrabooka)',
  address = '135 Boyare Ave, Mirrabooka WA 6061',
  latitude = -31.858508,
  longitude = 115.85893,
  nicknames = ARRAY['Mirrabooka Mosque']::TEXT[]
WHERE id = 'e06536c5-1f30-4424-8afb-51a5a968b6b5';

-- Update: Rivervale Mosque → (name unchanged)
UPDATE mosques SET
  address = '9 Rowe Ave, Rivervale WA 6103',
  latitude = -31.9565525,
  longitude = 115.9040756
WHERE id = '657f7883-4c65-4012-8f1a-0893e67bc0d6';

-- Update: Thornlie Mosque → Thornlie Masjid (Australian Islamic College)
UPDATE mosques SET
  name = 'Thornlie Masjid (Australian Islamic College)',
  address = '26 Clancy Way, Thornlie WA 6108',
  latitude = -32.0529366,
  longitude = 115.9617761,
  nicknames = ARRAY['AIC']::TEXT[]
WHERE id = '68881571-f83b-495f-bd62-5f0f719ca347';

-- Update: Adelaide Mosque → Adelaide City Mosque
UPDATE mosques SET
  name = 'Adelaide City Mosque',
  address = '20-28 Little Gilbert St, Adelaide SA 5000',
  latitude = -34.9340499,
  longitude = 138.591638
WHERE id = '647b4e05-7a8f-4ec8-b957-8ffccdcd1786';

-- Update: Elizabeth Mosque → Masjid Othman Bin Affan (Elizabeth Mosque)
UPDATE mosques SET
  name = 'Masjid Othman Bin Affan (Elizabeth Mosque)',
  address = '139-141 Hogarth Road, Elizabeth Grove, SA',
  suburb = 'Elizabeth Grove',
  latitude = -34.7414426,
  longitude = 138.6757712,
  nicknames = ARRAY['Elizabeth Mosque']::TEXT[]
WHERE id = '3c49f4b4-358a-4b4b-9780-2ae66d182aeb';

-- Update: Murray Bridge Mosque → (name unchanged)
UPDATE mosques SET
  address = '85 Old Swanport Rd, Murray Bridge SA 5253',
  latitude = -35.1436447,
  longitude = 139.2580491
WHERE id = 'ef2c759a-8a20-4de3-8a95-a7e2a9834bb9';

-- Update: Park Holme Mosque (Islamic Society of SA) → Marion Mosque (Islamic Society of SA)
UPDATE mosques SET
  name = 'Marion Mosque (Islamic Society of SA)',
  nicknames = ARRAY['ISSA']::TEXT[]
WHERE id = '8907b6e2-3573-4f15-a8d7-4713a6f90b6a';

-- Update: Canberra Islamic Centre → Canberra Islamic Centre (CIC)
UPDATE mosques SET
  name = 'Canberra Islamic Centre (CIC)',
  address = '221 Clive Steele Ave, Monash ACT 2904',
  suburb = 'Monash',
  latitude = -35.409854,
  longitude = 149.1022115,
  nicknames = ARRAY['CIC', 'Masjid Sabah Al Ahmad']::TEXT[]
WHERE id = '6afd0210-39b0-4ea5-9278-2e66601d499b';

-- Update: Gungahlin Mosque → (name unchanged)
UPDATE mosques SET
  address = '140 The Valley Avenue, Gungahlin, ACT, Australia, 2912',
  latitude = -35.1874568,
  longitude = 149.133148
WHERE id = '48daa881-3eff-4e7a-b9ad-525ff23ef3e6';

-- Update: Darwin Mosque → Islamic Society of Darwin
UPDATE mosques SET
  name = 'Islamic Society of Darwin',
  address = '53 Vanderlin Dr, Wanguri NT 0810',
  suburb = 'Wanguri',
  latitude = -12.3770408,
  longitude = 130.8877853,
  nicknames = ARRAY['ISOD']::TEXT[]
WHERE id = '2d886910-ae63-4bfb-9c03-208ae5dbb6f6';

-- Update: Hobart Mosque → (name unchanged)
UPDATE mosques SET
  address = '166 Warwick St, Hobart TAS 7000',
  suburb = 'Hobart',
  latitude = -42.876423,
  longitude = 147.3210788
WHERE id = 'f6c53dc0-7a1e-4b58-8b76-b608c570f65d';

-- ============================================
-- NEW EVENT: Al Siraat College (Epping) — Quran Tafseer Program
-- ============================================

INSERT INTO events (
  mosque_id, title, event_type, language, gender, time_mode,
  prayer_anchor, prayer_offset_minutes,
  is_recurring, recurrence_pattern, recurrence_end_date,
  status
) VALUES (
  '71b5440f-4a68-4d93-957e-7ba81563f799',
  'Quran Tafseer Program',
  'quran_circle',
  'english',
  'mixed',
  'prayer_anchored',
  'maghrib',
  5,
  TRUE,
  'weekly_monday',
  '2026-03-19',
  'active'
);

