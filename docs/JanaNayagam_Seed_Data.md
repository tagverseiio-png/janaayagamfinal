|**JanaNayagam — Official Seed Data Pack**||
| - | :- |
|*Real Tamil Nadu government data for DB seeding: departments, roles, wards/local bodies, and category-wise ticket routing flow.*||
|||
|**Sheet**||
|01\_Departments\_43||
|02\_Roles\_Jurisdiction||
|03\_GCC\_Zones\_Wards||
|04\_Ward\_Sample\_Names||
|05\_Local\_Body\_Types||
|06\_Complaint\_Categories||
|07\_Ticket\_Lifecycle||
|08\_Category\_Ticket\_Flow||
|09\_Enums\_For\_DB||
|10\_Sources||
|**USE:**||



||
| - |
||
||
|**Contents**|
|Official 43 TN government departments + code/slug + which complaint categories map to each|
|Your 7+ platform roles (VAO -> CM) mapped to admin level, jurisdiction scope & what they see|
|All 15 GCC zones with official ward-number ranges + region (North/Central/South)|
|Sample of real named wards (Zone 1-5) + how to model the ward table + full-gazette source|
|Local body tiers (Corporation/Municipality/Town Panchayat/Block/Village Panchayat) + head designation|
|Master category list with code, owning department, default assignee role, default priority|
|Ticket states + allowed transitions + who can perform each transition|
|THE CORE SHEET: each category -> who gets it first -> L1->L4 escalation ladder + SLA per level|
|Ready enum values for status, priority, channel, role\_type columns|
|Official source URLs|
|*Columns named like id / code / slug / parent\_id are FK-ready for a Postgres/Prisma seed. Ward count (200) and zone count (15) are the current operational structure; a 20-zone redistricting is in planning. Pull the full 200 named-ward gazette from the official GCC delimitation PDF (see 10\_Sources) at build time.*|


|**Official 43 Departments — Government of Tamil Nadu**||||
| - | :- | :- | :- |
|*Source: tn.gov.in/department (full Secretariat department list). 'Civic-facing?' flags the ones citizens raise tickets against most.*||||
|||||
|**id**|**Department Name (official)**|**slug**||
|1|Adi Dravidar and Tribal Welfare|adi-dravidar-tribal-welfare||
|2|Agriculture|agriculture||
|3|Animal Husbandry, Dairying and Fisheries|animal-husbandry||
|4|Backward Classes, MBC and Minorities Welfare|bc-mbc-minorities-welfare||
|5|Commercial Taxes and Registration|commercial-taxes-registration||
|6|Co-operation, Food and Consumer Protection|cooperation-food-consumer||
|7|Energy|energy||
|8|Environment and Forests|environment-forests||
|9|Finance|finance||
|10|Handlooms, Handicrafts, Textiles and Khadi|handlooms-textiles||
|11|Health and Family Welfare|health-family-welfare||
|12|Higher Education|higher-education||
|13|Highways and Minor Ports|highways-minor-ports||
|14|Home, Prohibition and Excise|home-prohibition-excise||
|15|Housing and Urban Development|housing-urban-development||
|16|Human Resources Management|human-resources-mgmt||
|17|Industries|industries||
|18|Information Technology and Digital Services|it-digital-services||
|19|Labour and Employment|labour-employment||
|20|Law|law||
|21|Legislative Assembly|legislative-assembly||
|22|Micro, Small and Medium Enterprises|msme||
|23|Miscellaneous Officers, Secretariat|misc-secretariat||
|24|Mudhalvarin Mugavari (CM Helpline / CMO)|mudhalvarin-mugavari||
|25|Municipal Administration and Water Supply|municipal-admin-water-supply||
|26|Natural Resources|natural-resources||
|27|Other States Government|other-states||
|28|Planning, Development and Special Initiatives|planning-development||
|29|Public|public||
|30|Public (Elections)|public-elections||
|31|Public Works (PWD)|public-works||
|32|Revenue and Disaster Management|revenue-disaster-mgmt||
|33|Rural Development and Panchayat Raj|rural-dev-panchayat-raj||
|34|School Education|school-education||
|35|Social Reforms|social-reforms||
|36|Social Welfare and Women Empowerment|social-welfare-women||
|37|Special Programme Implementation|special-programme-impl||
|38|Tamil Development and Information|tamil-dev-information||
|39|Tourism, Culture and Religious Endowments|tourism-culture-endowments||
|40|Transport|transport||
|41|Water Resources (WRD)|water-resources||
|42|Welfare of Differently Abled Persons|differently-abled-welfare||
|43|Youth Welfare and Sports Development|youth-welfare-sports||



|||
| - | - |
|||
|||
|**Primary Domain**|**Civic-facing?**|
|Welfare|No|
|Agriculture|No|
|Veterinary/Stray Animals|Yes|
|Welfare|No|
|Registration/Taxes|Yes|
|Ration/PDS/Consumer|Yes|
|Electricity|Yes|
|Environment/Pollution|Yes|
|Finance|No|
|Industry|No|
|Health Services|Yes|
|Education|No|
|Roads (Highways)|Yes|
|Police/Public Safety|Yes|
|Town Planning/Encroachment|Yes|
|Admin|No|
|Industry|No|
|IT/e-Governance|No|
|Labour|No|
|Legal|No|
|Legislature|No|
|Industry|No|
|Admin|No|
|Grievance/CM Cell|Yes|
|Water/Sewerage/Civic|Yes|
|Natural Resources|No|
|Inter-state|No|
|Planning|No|
|Admin/Protocol|No|
|Elections|No|
|PWD/Buildings|Yes|
|Revenue/Land/Certificates|Yes|
|Rural/Panchayat Civic|Yes|
|Education|Yes|
|Social|No|
|Welfare/Women|Yes|
|Programmes|No|
|Culture/Info|No|
|Tourism|No|
|Transport/RTO/Bus|Yes|
|Water Bodies/Irrigation|Yes|
|Welfare|No|
|Sports|No|


|**Platform Roles -> Administrative Level -> Jurisdiction Scope**|||||
| - | :- | :- | :- | :- |
|*Maps your VAO->CM role model to the real admin hierarchy. 'Sees tickets in' drives the recursive descendant lookup.*|||||
||||||
|**id**|**role\_code**|**slug**|**Admin Level**||
|1|CITIZEN|citizen|—||
|2|VAO|vao|Revenue Village||
|3|PANCHAYAT\_PRESIDENT|panchayat-president|Village Panchayat||
|4|BDO|bdo|Panchayat Union (Block)||
|5|TAHSILDAR|tahsildar|Taluk||
|6|ZONAL\_OFFICER|zonal-officer|Corporation Zone||
|7|COMMISSIONER|commissioner|Corporation/Municipality||
|8|RDO|rdo|Revenue Division||
|9|COLLECTOR|collector|District||
|10|MLA|mla|Assembly Constituency||
|11|MINISTER|minister|Department (statewide)||
|12|CM|cm|State||
|13|SUPER\_ADMIN|super-admin|System||



|||
| - | - |
|||
|||
|**Sees tickets in**|**Description**|
|Own tickets only|Files & tracks own grievances|
|Single revenue village|Village Administrative Officer — lowest revenue handler|
|Single village panchayat|Elected rural local body head (parallel to VAO)|
|All villages in the block|Block Development Officer — rural development|
|All firkas/villages in taluk|Taluk revenue head|
|All wards in the zone|Urban zonal head (e.g. GCC zone)|
|Entire urban local body|Municipal executive head|
|All taluks in division|Revenue Divisional Officer / Sub-Collector|
|All tickets in the district (urban+rural)|District Collector — apex district authority|
|Constituency-level oversight|Elected legislator — political escalation|
|All tickets of their department|Cabinet minister — department head|
|ALL tickets statewide|Chief Minister — statewide oversight dashboard|
|System-wide (no ticket ownership)|Creates/manages users, roles, jurisdictions|



||
| - |
||
||
|**Login / Panel**|
|Mobile + OTP|
|Assigned by Super Admin|
|Assigned|
|Assigned|
|Assigned|
|Assigned|
|Assigned|
|Assigned|
|Assigned|
|Assigned|
|Assigned|
|CM Panel|
|Super Admin Panel|


|**Greater Chennai Corporation — 15 Zones + Ward Ranges**||||||
| - | :- | :- | :- | :- | :- |
|*Source: chennai.nic.in (official). region groups zones into the 3 Regional Deputy Commissioner offices.*||||||
|||||||
|**zone\_id**|**Zone No.**|**Zone Name**|**Region**|**ward\_from**|**ward\_to**|
|1|I|Thiruvottiyur|North|1|14|
|2|II|Manali|North|15|21|
|3|III|Madhavaram|North|22|33|
|4|IV|Tondiarpet|North|34|48|
|5|V|Royapuram|North|49|63|
|6|VI|Thiru-Vi-Ka Nagar|Central|64|78|
|7|VII|Ambattur|Central|79|93|
|8|VIII|Anna Nagar|Central|94|108|
|9|IX|Teynampet|Central|109|126|
|10|X|Kodambakkam|Central|127|142|
|11|XI|Valasaravakkam|South|143|155|
|12|XII|Alandur|South|156|167|
|13|XIII|Adyar|South|168|182|
|14|XIV|Perungudi|South|183|191|
|15|XV|Sholinganallur|South|192|200|
|||||||
|*Total wards = 200 across 15 zones. A 20-zone redistricting is in planning (not yet operational).*||||||



||
| - |
||
||
|**ward\_count**|
|14|
|7|
|12|
|15|
|15|
|15|
|15|
|15|
|18|
|16|
|13|
|12|
|15|
|9|
|9|
||
||

|**Sample Named Wards (Zone I-V) + Ward Table Model**|||||||
| - | - | - | :- | :- | :- | :- |
|*Real ward names from GCC listings. Full 200-ward named gazette: pull from official GCC delimitation PDF (see Sources).*|||||||
||||||||
|**ward\_id**|**ward\_no**|**zone\_no**|**ward\_name**||||
|1|1|I|Kodungaiyur (West)||||
|2|2|I|Kodungaiyur (East)||||
|3|3|I|Dr. Radhakrishnan Nagar (North)||||
|4|4|I|Cheriyan Nagar (North)||||
|5|5|I|Jeeva Nagar (North)||||
|6|6|I|Cheriyan Nagar (South)||||
|7|7|I|Jeeva Nagar (South)||||
|8|8|I|Korukkupet||||
|9|9|I|Mottai Thottam||||
|10|10|I|Kumarasamy Nagar (South)||||
|11|11|I|Dr. Radhakrishnan Nagar (South)||||
|12|12|I|Kumarasamy Nagar (North)||||
|13|13|I|Vijayaragavalu Nagar (West)||||
|14|14|I|Tondiarpet||||
|15|15|II|Sanjeevirayanpet||||
|16|16|II|Grace Garden||||
|17|17|II|Ma-Po-Si Nagar||||
|18|18|II|Royapuram||||
|19|19|II|Singarathottam||||
|20|20|II|Narayanappa Thottam||||
|21|21|II|Old Washermenpet||||
|22|22|III|Meenakshiammanpet||||
|23|23|III|Kondithope||||
|24|24|III|Sevenwells (North)||||
|25|25|III|Amman Koil||||
|26|26|III|Muthialpet||||
|27|27|III|Vallalseethakathi Nagar||||
|28|28|III|Kachaleeswarar Nagar||||
|29|29|III|Sevenwells (South)||||
|30|30|III|Sowcarpet||||
|31|31|III|Basin Bridge||||
|32|32|III|Vyasarpet (South)||||
|33|33|III|Vyasarpet (North)||||
|34|34|IV|Perambur (North)||||
|35|35|IV|Perambur (East)||||
|36|36|IV|Elango Nagar||||
|37|37|IV|Perambur (South)||||
|38|38|IV|Thiru-Vi-Ka Nagar||||
|39|39|IV|Wadia Nagar||||
|40|40|IV|Dr. Sathyavanimuthu Nagar||||
|41|41|IV|Pulianthope||||
|42|42|IV|Dr. Besant Nagar||||
|43|43|IV|Pedhunayakanpet||||
||||||||


|*NOTE: Ward names vary across published lists and a re-delimitation is underway. For authoritative all-200 names + boundaries, use the official GCC Delimitation of Wards gazette PDF (chennaicorporation.gov.in). Suggested ward table: ward\_id, ward\_no, zone\_id (FK), ward\_name, reserved\_category (GEN/SC/ST/WOMEN), assembly\_constituency, parliamentary\_constituency.*||||||
| - | - | - | - | - | - |


||
| - |
||
||
||
||
||
||
||
||
||
||
||
||
||
||
||
||
||
||
||
||
||
||
||
||
||
||
||
||
||
||
||
||
||
||
||
||
||
||
||
||
||
||
||
||
||
||
||

|**Local Body Tiers — Urban & Rural**|||
| - | :- | :- |
|*Statewide counts + the head designation that owns tickets at each tier.*|||
||||
|**Track**|**Tier**|**Statewide Count**|
|URBAN|Municipal Corporation|25 (approx)|
|URBAN|Municipality|148–150|
|URBAN|Town Panchayat|490 (≈561 older)|
|URBAN|Corporation Zone|e.g. 15 in GCC|
|URBAN|Ward / Division|e.g. 200 in GCC|
|RURAL|District Panchayat|~31|
|RURAL|Panchayat Union (Block)|385|
|RURAL|Village Panchayat|12,524|
|REVENUE|Revenue Division|76|
|REVENUE|Taluk|220|
|REVENUE|Firka|—|
|REVENUE|Revenue Village|—|



|||
| - | - |
|||
|||
|**Head / Officer**|**Notes**|
|Mayor (elected) + Commissioner (exec)|Largest cities — e.g. Greater Chennai Corporation|
|Chairman (elected) + Commissioner|Smaller cities/towns|
|Chairman + Executive Officer|Rural-to-urban transition towns|
|Zonal Officer / Asst. Commissioner|Sub-unit within a corporation|
|Ward Councillor (elected)|Smallest urban unit|
|Chairperson + Collector oversight|Apex rural body of a district|
|Block Development Officer (BDO) + Chairman|Group of village panchayats|
|President (elected) + Panchayat Secretary|Grassroots rural unit|
|RDO / Sub-Collector|Group of taluks|
|Tahsildar|Group of firkas|
|Revenue Inspector (RI)|Cluster of revenue villages|
|Village Administrative Officer (VAO)|Lowest revenue unit|


|**Complaint Categories — Master**|||
| - | - | :- |
|*Category -> owning department (FK to 01) -> default assignee role (FK to 02) -> default priority.*|||
||||
|**category\_code**|**Category**|**Owning Department**|
|CAT-WTR|Water Supply & Sewerage|Municipal Admin & Water Supply|
|CAT-ELE|Electricity|Energy (TANGEDCO)|
|CAT-RDC|Roads (City)|Municipal Admin & Water Supply|
|CAT-RDH|Roads (Highways)|Highways and Minor Ports|
|CAT-GRB|Solid Waste & Sanitation|Municipal Admin & Water Supply|
|CAT-LGT|Street Lighting|Municipal Admin & Water Supply|
|CAT-HLT|Public Health & Mosquito|Health and Family Welfare|
|CAT-ENC|Encroachment & Town Planning|Housing and Urban Development|
|CAT-LND|Revenue & Land / Certificates|Revenue and Disaster Management|
|CAT-POL|Police & Public Safety|Home, Prohibition and Excise|
|CAT-TAX|Property Tax & Trade License|Municipal Admin & Water Supply|
|CAT-PDS|Welfare Schemes & Ration|Co-operation, Food & Consumer Protection|
|CAT-EDU|Education (Govt School)|School Education|
|CAT-MED|Health Services (PHC/GH)|Health and Family Welfare|
|CAT-TRN|Transport (Bus/RTO)|Transport|
|CAT-POL2|Environment & Pollution|Environment and Forests|
|CAT-ANM|Stray Animals|Animal Husbandry|
|CAT-WMN|Women & Child Safety|Social Welfare & Women Empowerment|



|||
| - | - |
|||
|||
|**Default Assignee Role**|**Default Priority**|
|ZONAL\_OFFICER / BDO|High|
|ZONAL\_OFFICER|High|
|ZONAL\_OFFICER / BDO|Medium|
|RDO|Medium|
|ZONAL\_OFFICER / BDO|High|
|ZONAL\_OFFICER / BDO|Medium|
|ZONAL\_OFFICER / BDO|High|
|COMMISSIONER / RDO|Medium|
|VAO|Medium|
|COMMISSIONER (Police)|High|
|COMMISSIONER|Low|
|TAHSILDAR|Medium|
|BDO / Collector|Low|
|BDO / Collector|Medium|
|RDO|Low|
|RDO / Collector|Medium|
|ZONAL\_OFFICER / BDO|Low|
|COMMISSIONER / Collector|High|


|**Ticket Lifecycle — States & Transitions**|||
| - | - | :- |
|*Your lifecycle: Submit -> Assign -> In Progress -> Resolved -> Closed (+ reopen/escalate branches).*|||
||||
|**state**|**Meaning**|**Allowed Transition**|
|SUBMITTED|Citizen files grievance with geo-photo|-> ASSIGNED|
|ASSIGNED|Routed to the responsible officer|-> IN\_PROGRESS / -> REASSIGNED|
|IN\_PROGRESS|Officer working on the issue|-> RESOLVED / -> ESCALATED|
|ESCALATED|Bumped to next level in chain|-> ASSIGNED (higher level)|
|RESOLVED|Officer marks issue fixed|-> CLOSED / -> REOPENED|
|REOPENED|Citizen not satisfied with resolution|-> IN\_PROGRESS / -> ESCALATED|
|CLOSED|Final state — citizen satisfied / appeal exhausted|(terminal)|



|||
| - | - |
|||
|||
|**Trigger**|**Performed By**|
|System auto-routes to default assignee role for the jurisdiction|Citizen / System|
|Officer accepts & starts work, or reassigns to correct dept|Officer|
|Work done -> Resolved; SLA breach/no-action -> Escalated|Officer|
|Auto/manual escalation to L2/L3/L4 authority|System / Officer / Citizen|
|Citizen confirms (Closed) or rejects (Reopened)|Officer -> Citizen|
|Goes back to officer or escalates|Citizen|
|Feedback/rating captured|Citizen / System|


|**Category Ticket Flow — Routing & Escalation Ladder (CORE)**||||
| - | :- | :- | :- |
|*For each category: who gets it first (L1) and the L2->L4 escalation chain with target SLA. Maps to real TN officer hierarchy.*||||
|||||
|**category\_code**|**Category**|**L1 — First Assignee**||
|CAT-WTR|Water/Sewerage|Area/Asst. Engineer (Water) [VAO/BDO rural]||
|CAT-ELE|Electricity|Section Office AE (TANGEDCO) via 1912||
|CAT-RDC|Roads (City)|Junior Engineer (Zonal) via 1913||
|CAT-RDH|Roads (Highways)|Asst. Engineer (Highways)||
|CAT-GRB|Garbage/Sanitation|Sanitary Inspector (ward)||
|CAT-LGT|Street Lighting|Ward JE / Electrical wing||
|CAT-HLT|Public Health/Mosquito|Ward Sanitary Inspector||
|CAT-ENC|Encroachment|Town Planning Inspector / VAO||
|CAT-LND|Revenue/Land/Certs|Village Admin Officer (VAO)||
|CAT-POL|Police/Safety|Beat Officer / SHO (Inspector)||
|CAT-TAX|Property Tax/License|Zonal Revenue Assistant||
|CAT-PDS|Ration/Welfare|Ration Shop / Taluk Supply Officer via 1967||
|CAT-EDU|Education|Headmaster / BEO||
|CAT-MED|Health Services|PHC Medical Officer||
|CAT-TRN|Transport|Depot Manager / RTO clerk||
|CAT-POL2|Pollution/Environment|District Environmental Engineer (TNPCB)||
|CAT-ANM|Stray Animals|Ward Sanitary Inspector / Vet Asst.||
|CAT-WMN|Women/Child Safety|All-Women PS / 181 / 1098||



|||
| - | - |
|||
|||
|**L2 — Escalation**|**L3 — Escalation**|
|Executive Engineer / Zonal Officer|Commissioner / Superintending Engineer|
|AEE / Executive Engineer|Superintending Engineer (Circle)|
|Asst. Engineer / Zonal Officer|Executive Engineer / City Engineer|
|Asst. Divisional Engineer|Divisional Engineer / SE|
|Sanitary Officer / Zonal Officer|City Health Officer|
|Asst. Engineer / Zonal Officer|Executive Engineer|
|Zonal Health Officer|City Health Officer|
|Asst. Commissioner / Tahsildar|Commissioner / RDO|
|Revenue Inspector (RI)|Tahsildar|
|Sub-Div Officer (DSP/ACP)|SP / DCP|
|Asst. Revenue Officer|Revenue Officer / Zonal Officer|
|Asst. Commissioner Civil Supplies|District Supply Officer (DSO)|
|Block Edu Officer / BDO|Chief Educational Officer (CEO)|
|Block Medical Officer / BDO|Deputy Director Health Services|
|Regional Transport Officer (RTO)|Joint Transport Commissioner|
|Asst. Environmental Engineer|Joint Chief Env. Engineer|
|Zonal Officer / Vet Officer|City Health Officer|
|Protection Officer / DSP|SP / DCP / DSWO|



|||
| - | - |
|||
|||
|**L4 — Final / Appeal**|**SLA (L1/L2/L3/L4)**|
|Collector -> CM Helpline 1100|3 / 7 / 10 / 15 days|
|CGRF -> Electricity Ombudsman (TNERC)|1 / 3 / 7 / statutory|
|Commissioner -> CM Helpline|3 / 7 / 10 / 15 days|
|Chief Engineer (Highways)|3 / 7 / 10 / 15 days|
|Commissioner -> CM Helpline|1 / 3 / 7 / 10 days|
|Commissioner|2 / 5 / 10 / 15 days|
|Collector / Dir. Public Health|1 / 3 / 7 / 10 days|
|Collector|7 / 15 / 21 / 30 days|
|RDO -> Collector -> CM Helpline|7 / 10 / 15 / 21 days|
|Commissioner / DGP -> SHRC / Court|1 / 3 / 7 / statutory|
|Commissioner -> Taxation Appellate|7 / 15 / 21 / 30 days|
|Commissioner Civil Supplies -> CM Helpline|3 / 7 / 10 / 15 days|
|Collector -> Dir. School Education|7 / 15 / 21 / 30 days|
|Collector -> Dir. Medical Services|3 / 7 / 15 / 21 days|
|Transport Commissioner|7 / 15 / 21 / 30 days|
|Member Secretary TNPCB -> NGT|7 / 15 / 21 / statutory|
|Commissioner|3 / 7 / 10 / 15 days|
|Collector / Commissioner -> SCW|1 / 3 / 7 / statutory|


|**Enum Values for DB Columns**||
| - | :- |
|*Drop-in enums for status / priority / channel / role\_type.*||
|||
|**enum\_name**||
|ticket\_status||
|priority||
|channel||
|role\_type||
|body\_track||
|reserved\_category||
|sla\_unit||



||
| - |
||
||
|**values**|
|SUBMITTED, ASSIGNED, IN\_PROGRESS, ESCALATED, RESOLVED, REOPENED, CLOSED|
|LOW, MEDIUM, HIGH, CRITICAL|
|APP, WEB, HELPLINE, EMAIL, WALK\_IN|
|CITIZEN, VAO, PANCHAYAT\_PRESIDENT, BDO, TAHSILDAR, ZONAL\_OFFICER, COMMISSIONER, RDO, COLLECTOR, MLA, MINISTER, CM, SUPER\_ADMIN|
|URBAN, RURAL, REVENUE|
|GEN, SC, ST, WOMEN|
|HOURS, DAYS, WORKING\_DAYS|


|**Sources (Official & Reference)**|
| - |
||
||
|**Source**|
|43 Departments (official list)|
|TN departments (Wikipedia mirror of tn.gov.in)|
|GCC zones & ward ranges|
|GCC ward delimitation gazette (full 200 ward names)|
|GCC council / zone structure|
|CM Helpline (IIPGCMS)|
|CPGRAMS (central appeal mechanism)|
|TANGEDCO grievance/CGRF/Ombudsman|
|Local government in Tamil Nadu (counts)|
|Urban local bodies list (counts)|



|||
| - | - |
|||
|||
|**URL**|**Type**|
|tn.gov.in/department|Official|
|en.wikipedia.org/wiki/List\_of\_departments\_of\_the\_government\_of\_Tamil\_Nadu|Reference|
|chennai.nic.in/about-district/administrative-setup/local-bodies/|Official (District NIC)|
|chennaicorporation.gov.in/delimitation\_draft/pdf/DELIMITATION\_OF\_WARDS\_DRAFT\_PROPOSAL\_ENGLISH.pdf|Official|
|chennaicorporation.gov.in/gcc/council/about-council/|Official|
|cmhelpline.tnega.org|Official|
|pgportal.gov.in|Official (Central)|
|tangedco.org|Official|
|en.wikipedia.org/wiki/Local\_government\_in\_Tamil\_Nadu|Reference|
|en.wikipedia.org/wiki/List\_of\_urban\_local\_bodies\_in\_Tamil\_Nadu|Reference|

