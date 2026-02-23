-- Migration 006: Australian Mosque Expansion
-- Generated 2026-02-22
-- Adds ~58 mosques across 8 states (NSW gap-fill + VIC, QLD, WA, SA, ACT, NT, TAS)

-- ============================================
-- ADD STATE COLUMN
-- ============================================

ALTER TABLE mosques ADD COLUMN state TEXT;

-- Backfill existing mosques (all 22 are in NSW)
UPDATE mosques SET state = 'NSW';

-- Now enforce NOT NULL
ALTER TABLE mosques ALTER COLUMN state SET NOT NULL;

-- ============================================
-- UNIQUE CONSTRAINT ON NAME
-- ============================================

ALTER TABLE mosques ADD CONSTRAINT mosques_name_unique UNIQUE (name);

-- ============================================
-- INDEX ON STATE
-- ============================================

CREATE INDEX idx_mosques_state ON mosques(state);

-- ============================================
-- New South Wales (NSW) — 17 new mosques
-- ============================================

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Masjid Al-Azhar', '2 Lakemba St, Belmore NSW 2192', 'Belmore', 'NSW', -33.9132, 151.0879)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Campsie Mosque (Turkish)', '4 Anglo Rd, Campsie NSW 2194', 'Campsie', 'NSW', -33.912, 151.1008)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Roselands Mosque (Masjid Darul Imaan)', '6A Roseland Ave, Roselands NSW 2196', 'Roselands', 'NSW', -33.935, 151.0719)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Lidcombe Mosque', '5 Birnie Ave, Lidcombe NSW 2141', 'Lidcombe', 'NSW', -33.8555, 151.061)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Blacktown Islamic Centre', '43 Fifth Ave, Blacktown NSW 2148', 'Blacktown', 'NSW', -33.7631, 150.9111)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Guildford Mosque', '18 Railway Terrace, Guildford NSW 2161', 'Guildford', 'NSW', -33.8511, 150.9871)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Toongabbie Mosque', '12 Binalong Rd, Toongabbie NSW 2146', 'Toongabbie', 'NSW', -33.7893, 150.965)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Bass Hill Mosque', '684 Hume Hwy, Bass Hill NSW 2197', 'Bass Hill', 'NSW', -33.8973, 150.9929)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Smithfield Mosque', '30 Bourke St, Smithfield NSW 2164', 'Smithfield', 'NSW', -33.8579, 150.9275)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Masjid Al-Hijrah', '72 Princes Hwy, Tempe NSW 2044', 'Tempe', 'NSW', -33.9229, 151.1631)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Hoxton Park Mosque (ICSA)', '214 Wilson Rd, Hinchinbrook NSW 2168', 'Hinchinbrook', 'NSW', -33.9199, 150.8632)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Revesby Mosque', '1 Bransgrove Rd, Revesby NSW 2212', 'Revesby', 'NSW', -33.9484, 151.0157)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Kellyville Mosque (Islamic Centre of the Hills)', '3 Hezlett Rd, Kellyville NSW 2155', 'Kellyville', 'NSW', -33.6944, 150.9566)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Masjid Wardah', '7 Waterloo Rd, Greenacre NSW 2190', 'Greenacre', 'NSW', -33.9073, 151.0572)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Al-Faisal College Mosque', '35 Railway Parade, Auburn NSW 2144', 'Auburn', 'NSW', -33.8579, 151.0373)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Bukhari House', '519 Canterbury Rd, Campsie NSW 2194', 'Campsie', 'NSW', -33.9197, 151.1009)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Islamic Society of Manly Warringah', '6 South Creek Rd, Dee Why NSW 2099', 'Dee Why', 'NSW', -33.7422, 151.2918)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- Victoria (VIC) — 15 mosques
-- ============================================

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Preston Mosque', '90-96 Cramer St, Preston VIC 3072', 'Preston', 'VIC', -37.7402, 145.0017)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Newport Mosque', '1 Walker St, Newport VIC 3015', 'Newport', 'VIC', -37.8422, 144.8817)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Broadmeadows Mosque (Turkish)', '46-48 Camp Rd, Broadmeadows VIC 3047', 'Broadmeadows', 'VIC', -37.6878, 144.9408)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Sunshine Mosque', '619 Ballarat Rd, Albion VIC 3020', 'Albion', 'VIC', -37.7749, 144.8092)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Thomastown Mosque', '124 Station St, Thomastown VIC 3074', 'Thomastown', 'VIC', -37.6765, 145.0151)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Werribee Islamic Centre', '5 Minindee Rd, Werribee VIC 3030', 'Werribee', 'VIC', -37.9000, 144.6600)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Dandenong Mosque', '87 Foster St, Dandenong VIC 3175', 'Dandenong', 'VIC', -37.9872, 145.2203)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Hallam Mosque (Hira Masjid)', '38 Belgrave-Hallam Rd, Hallam VIC 3803', 'Hallam', 'VIC', -37.9987, 145.275)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Epping Mosque (Epping Islamic Centre)', '7 Lyndarum Dr, Epping VIC 3076', 'Epping', 'VIC', -37.6285, 145.0272)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Fawkner Mosque', '46-48 Baroda Ave, Fawkner VIC 3060', 'Fawkner', 'VIC', -37.6920, 144.9680)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Coburg Mosque (Cypriot Turkish Islamic Centre)', '31 Nicholson St, Coburg VIC 3058', 'Coburg', 'VIC', -37.7551, 144.9752)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Omar bin Al-Khattab Mosque (Carlton)', '765 Drummond St, Carlton VIC 3053', 'Carlton', 'VIC', -37.7866, 144.9704)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Heidelberg Mosque', '25 Yarra St, Heidelberg VIC 3084', 'Heidelberg', 'VIC', -37.7578, 145.063)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Virgin Mary Mosque', '168-170 Hogans Rd, Hoppers Crossing VIC 3029', 'Hoppers Crossing', 'VIC', -37.8626, 144.6826)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('IISCA Doveton Mosque', '15 Photinia St, Doveton VIC 3177', 'Doveton', 'VIC', -37.9926, 145.2366)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- Queensland (QLD) — 8 mosques
-- ============================================

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Kuraby Mosque (Islamic Society of Holland Park)', '19 Doig St, Holland Park QLD 4121', 'Holland Park', 'QLD', -27.5200, 153.0700)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Darra Mosque', '63-65 Station Rd, Darra QLD 4076', 'Darra', 'QLD', -27.5723, 152.9531)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Masjid Al-Farooq (Sunnybank)', '13 Doig St, Sunnybank QLD 4109', 'Sunnybank', 'QLD', -27.5800, 153.0600)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Islamic College of Brisbane', '45 Acacia Rd, Karawatha QLD 4117', 'Karawatha', 'QLD', -27.6188, 153.092)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Slacks Creek Mosque', '17 Milne St, Slacks Creek QLD 4127', 'Slacks Creek', 'QLD', -27.6400, 153.1500)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Logan Mosque (Masjid Taqwa)', '24 Magnesium Dr, Crestmead QLD 4132', 'Crestmead', 'QLD', -27.6803, 153.071)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Gold Coast Mosque', '23 Allied Dr, Arundel QLD 4214', 'Arundel', 'QLD', -27.939, 153.3848)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Toowoomba Mosque', '196 West St, Toowoomba QLD 4350', 'Toowoomba', 'QLD', -27.5692, 151.9418)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- Western Australia (WA) — 8 mosques
-- ============================================

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Perth Mosque', '427 William St, Perth WA 6000', 'Perth', 'WA', -31.9436, 115.8624)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Masjid Ibrahim (Southern River)', '2 Balfour St, Southern River WA 6110', 'Southern River', 'WA', -32.1053, 115.9428)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Mirrabooka Mosque', '8 Sudbury Rd, Mirrabooka WA 6061', 'Mirrabooka', 'WA', -31.8712, 115.8586)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Thornlie Mosque', '2 Garling St, Thornlie WA 6108', 'Thornlie', 'WA', -32.0600, 115.9600)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Rivervale Mosque', '3 Malvern Rd, Rivervale WA 6103', 'Rivervale', 'WA', -31.9565, 115.9027)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Canning Vale Mosque', '2 Waranup Ct, Canning Vale WA 6155', 'Canning Vale', 'WA', -32.0700, 115.9200)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Kenwick Mosque', '33 Bickley Rd, Kenwick WA 6107', 'Kenwick', 'WA', -32.0216, 115.9745)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Madina Mosque (Wanneroo)', '20 Civic Dr, Wanneroo WA 6065', 'Wanneroo', 'WA', -31.7585, 115.8092)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- South Australia (SA) — 5 mosques
-- ============================================

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Adelaide Mosque', '20 Little Gilbert St, Adelaide SA 5000', 'Adelaide', 'SA', -34.934, 138.5916)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Park Holme Mosque (Islamic Society of SA)', '658 Marion Rd, Park Holme SA 5043', 'Park Holme', 'SA', -34.9881, 138.5565)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Al-Khalil Mosque (Pooraka)', '29 Wandana Ave, Pooraka SA 5095', 'Pooraka', 'SA', -34.8300, 138.6200)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Elizabeth Mosque', '89 Hamblynn Rd, Elizabeth Downs SA 5113', 'Elizabeth Downs', 'SA', -34.6994, 138.691)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Murray Bridge Mosque', '26 Grubb St, Murray Bridge SA 5253', 'Murray Bridge', 'SA', -35.1200, 139.2800)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- Australian Capital Territory (ACT) — 3 mosques
-- ============================================

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Canberra Islamic Centre', '130 Empire Circuit, Yarralumla ACT 2600', 'Yarralumla', 'ACT', -35.3097, 149.112)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Gungahlin Mosque', '130 Hibberson St, Gungahlin ACT 2912', 'Gungahlin', 'ACT', -35.1858, 149.136)
ON CONFLICT (name) DO NOTHING;

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Woden Mosque', '21 Irving St, Phillip ACT 2606', 'Phillip', 'ACT', -35.3395, 149.0844)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- Northern Territory (NT) — 1 mosque
-- ============================================

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Darwin Mosque', '53 Vanderlin Dr, Casuarina NT 0810', 'Casuarina', 'NT', -12.3759, 130.8827)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- Tasmania (TAS) — 1 mosque
-- ============================================

INSERT INTO mosques (name, address, suburb, state, latitude, longitude)
VALUES ('Hobart Mosque', '166 Warwick St, West Hobart TAS 7000', 'West Hobart', 'TAS', -42.8806, 147.3154)
ON CONFLICT (name) DO NOTHING;
