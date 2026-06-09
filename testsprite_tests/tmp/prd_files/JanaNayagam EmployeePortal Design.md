## **JANANAYAGAM** Tamil Nadu Civic Command Center 

Employee Login Portal — System Design Document 

## **Portal Route: /employee-login** 

|**Category**|**Description**|**Roles**|
|---|---|---|
|1|Elected Representatives|CM, Minister, MLA, Ward Member|
|2|Administrative Officials|Collector, DRO, BDO, VAO, Ward Officer, RI|
|3|Department Officials|43 Departments — Field to Director level|



## **Common Login Flow — All Employees** 

|**Step**|**Action**|**Details**|
|---|---|---|
|1|Open /employee-login|Separate from citizen login|
|2|Enter Aadhaar Number|16-digit Aadhaar number|
|3|OTP Verification|OTP sent to Aadhaar-linked mobile|
|4|Auto Name & Location|Name, district auto-filled from Aadhaar DB|
|5|Select Category|Elected Rep / Administrative Officer / Dept Official|
|6|Select Role & Jurisdiction|Role dropdown→District / Dept / Constituency|
|7|Dashboard Access|Routed to role-specific scoped dashboard|



## **CATEGORY 1 — ELECTED REPRESENTATIVES** 

CM · Minister · MLA · Ward Member | Route: /employee-login → Select: Elected Representative 

## **Chief Minister (CM)** 

**Login Input: Aadhaar + OTP only — unique role, no extra selection** 

|**Dashboard Feature**|**Description**|
|---|---|
|State Overview Map|All 38 districts — live ticket heatmap|
|Department Performance|All 43 departments ranked by resolution rate|
|District Radar|High / Medium / Low pressure indicators|
|Emergency Escalations|Critical tickets from Collector level|
|Daily State Report|Auto-generated statewide summary|
|Announcement Board|Push policy directives to all portals|



## **Minister** 

**Login Input: Aadhaar + OTP** → **Select Department (43 departments dropdown)** 

|**Dashboard Feature**|**Description**|
|---|---|
|Department Ticket View|All tickets under selected department statewide|
|District-wise Breakdown|Tickets per district for that department|
|Escalation Inbox|Tickets escalated to Minister level|
|Resolution Tracker|% resolved per district per week|
|Department Map|GPS heatmap of dept issues across TN|
|Policy Action Board|Issue directives to department officials|



## **MLA (Member of Legislative Assembly)** 

**Login Input: Aadhaar + OTP** → **Select Constituency (234 constituencies dropdown)** 

|**Dashboard Feature**|**Description**|
|---|---|
|Constituency Ticket Map|Live map of all issues in constituency|
|Ward-wise Summary|Tickets per ward within constituency|
|Category Breakdown|Water / Roads / EB / Sanitation split|
|Escalation Panel|Escalate critical issues to Collector / Minister|
|Constituency Report|Weekly auto-report of constituency health|



## **Ward Member (Councillor)** 

**Login Input: Aadhaar + OTP** → **Select District** → **Select Ward Number** 

|**Dashboard Feature**|**Description**|
|---|---|
|Ward Ticket List|All active citizen tickets in their ward|
|File Issue on Behalf|Raise ticket on behalf of citizen|
|Escalate to Ward Officer|Push unresolved issues to official|



|Ward Map|GPS view of issues in ward boundary|
|---|---|
|Monthly Ward Report|Auto-summary of ward activity|



## **CATEGORY 2 — ADMINISTRATIVE OFFICIALS** 

Collector · DRO · BDO · VAO · Ward Officer · RI | Route: /employee-login → Select: Administrative Officer 

## **District Collector** 

**Login Input: Aadhaar + OTP** → **Select District (38 districts)** 

|**Dashboard Feature**|**Description**|
|---|---|
|District Ticket Map|All tickets across district on live map|
|Department-wise View|Tickets per department in district|
|Officer Performance|Track BDO / DRO resolution rates|
|Emergency Flag|Flag critical issues to CM / Minister|
|District Daily Report|Auto-generated district summary|



## **DRO (District Revenue Officer)** 

**Login Input: Aadhaar + OTP** → **Select District** → **Select Revenue Division** 

|**Dashboard Feature**|**Description**|
|---|---|
|Revenue Division Map|Tickets across revenue division|
|Taluk-wise Breakdown|Per-taluk ticket summary|
|Land & Revenue Issues|Patta, encroachment, land record tickets|
|Field Inspection Tracker|Assign and track field visits|



## **BDO (Block Development Officer)** 

**Login Input: Aadhaar + OTP** → **Select District** → **Select Block** 

|**Dashboard Feature**|**Description**|
|---|---|
|Block Ticket Queue|All active tickets in the block|
|Village-wise Summary|Tickets per village / panchayat|
|VAO Performance|Track VAO resolution rates|
|Block Map|GPS view of block-level issues|
|Weekly Block Report|Auto-generated weekly summary|



## **VAO (Village Administrative Officer)** 

**Login Input: Aadhaar + OTP** → **Select District** → **Select Taluk** → **Select Village** 

|**Dashboard Feature**|**Description**|
|---|---|
|Village Ticket Queue|All citizen tickets from village|
|Raise Issue on Behalf|File ticket for citizen|
|Site Verification|Mark GPS-verified site inspection|
|Village Map|Active issue markers on village map|
|Daily Village Report|1-per-day auto-summary|



## **Ward Officer** 

**Login Input: Aadhaar + OTP** → **Select District** → **Select Ward Number** 

|**Dashboard Feature**|**Description**|
|---|---|
|Ward Grievance Queue|All active ward tickets|
|First Response Action|Accept / Assign / Reject tickets|
|Field Agent Dispatch|Assign field agent to ticket location|
|SLA Tracker|Monitor tickets nearing deadline|
|Resolution Log|All resolved tickets with timestamps|



## **Revenue Inspector (RI)** 

**Login Input: Aadhaar + OTP** → **Select District** → **Select Taluk** → **Select Firka** 

|**Dashboard Feature**|**Description**|
|---|---|
|Firka Ticket View|Land/revenue tickets in firka|
|Field Visit Log|Submit GPS-confirmed site inspection reports|
|Patta & Land Records|View linked land record complaints|
|Firka Map|GPS view of revenue complaints|



## **CATEGORY 3 — DEPARTMENT OFFICIALS** 

43 Departments — Field Level to Director | Route: /employee-login → Select: Department Official 

Login Input: Aadhaar + OTP → Select Department → Select Role → Select Jurisdiction (District / Circle / Ward) 

|**#**|**Department**|**Role Hierarchy (Field**→**Top)**|ioner|
|---|---|---|---|
|1|Water (TWAD/Metro Water)|AEO→Deputy AE→Area Engineer→GM→Executive Director→Director||
|2|Electricity (TANGEDCO/EB)|Lineman→Deputy AE→Asst. AE→Area Engineer→Super Agent→GM||
|3|Sanitation|DSI→Sanitary Inspector→Health Inspector→City Health Officer→Commiss||
|4|PWD / Roads|AE→Deputy Engineer→Executive Engineer→SE→Chief Engineer||
|5|Health (Govt Hospitals)|Medical Officer→Medical Superintendent→Director of Health Services||
|6|School Education|Headmaster→BEO→DEO→Director||
|7|Higher Education|Principal→Regional Director→Director||
|8|Revenue|Revenue Inspector→Tahsildar→RDO→Collector||
|9|Police|Sub-Inspector→Inspector→DSP→SP→IG→DGP||
|10|Agriculture|Agriculture Officer→Deputy Director→District Officer→Director||
|11|Animal Husbandry|Veterinary Officer→Asst. Director→Deputy Director→Director||
|12|Transport (RTO)|MVO→Regional Transport Officer→Director||
|13|Housing (TNHB)|AE→Executive Engineer→SE→Director||
|14|Highways|AE→Deputy Engineer→Executive Engineer→Chief Engineer||
|15|Forest|Forest Guard→Range Officer→DFO→PCCF||
|16|Fisheries|Fisheries Officer→Deputy Director→District Officer→Director||
|17|Social Welfare|CDO→Deputy CDO→District Officer→Director||
|18|Adi Dravidar Welfare|Project Officer→District Officer→Director||
|19|BC/MBC Welfare|Project Officer→District Officer→Director||
|20|Differently Abled Welfare|Project Officer→District Officer→Director||
|21|Women & Child Development|CDPO→District Officer→Director||
|22|Rural Development (TNRD)|VPDO→BDO→District RD Officer→Director||
|23|Panchayat|Panchayat Secretary→Block Panchayat Officer→District Officer||
|24|Municipality|Ward Exec Officer→Deputy Commissioner→Commissioner→Director||
|25|Corporation (GCC/City)|Ward Executive→Zonal Officer→Commissioner→Director||
|26|Fire & Rescue|Fireman→Station Officer→Divisional Officer→Director||
|27|Registrar (Land/Marriage)|Sub-Registrar→District Registrar→IGR||
|28|Labour|Labour Officer→Deputy Labour Commissioner→Commissioner||
|29|Legal Metrology|Inspector→Asst. Controller→Controller||
|30|Food Safety (FSSAI/TN)|Food Safety Officer→Designated Officer→Commissioner||
|31|Cooperative|Asst. Cooperative Officer→District Officer→Director||



|32|Handlooms & Textiles|Inspector→Deputy Director→Director|
|---|---|---|
|33|Tourism|Tourism Officer→Deputy Director→Director|
|34|Industries (SIDCO/SIPCOT)|Project Officer→Deputy Director→Director|
|35|Environment|Environmental Officer→District Officer→Director|
|36|Information (DI&PR)|District Information Officer→Deputy Director→Director|
|37|Archaeology|Field Officer→Deputy Director→Director|
|38|Tamil Development|District Officer→Deputy Director→Director|
|39|Sports & Youth Affairs|District Sports Officer→Deputy Director→Director|
|40|Adi Dravidar Housing (TAHDCO)|Project Officer→District Officer→Director|
|41|Slum Clearance (TNSCB)|Field Officer→Deputy Director→Director|
|42|Postal Services (TN Circle)|Postman→Postmaster→Superintendent→Director|
|43|Civil Supplies (TNCSC)|Depot Officer→Taluk Supply Officer→District Officer→Commissioner|



## **Common Dashboard Features — All Department Officials** 

|**Feature**|**Description**|
|---|---|
|Assigned Ticket Queue|Tickets routed to this official's dept + jurisdiction only|
|Accept / Reject / Escalate|Action buttons on each ticket|
|GPS Issue Map|Exact location of reported issue on map|
|Site Verification|Mark GPS-confirmed site visit done|
|Escalation Chain|Full hierarchy visible above and below this role|
|SLA Timer|Countdown showing deadline per ticket|
|Daily Report|Auto-generated 1-per-day activity summary|
|Verified Badge|Badge shown after Aadhaar verification|



## **Build Phases** 

|**Phase**|**Departments**|**Priority Reason**|
|---|---|---|
|Phase 1|Water, Electricity, Sanitation|Highest citizen grievance volume|
|Phase 2|PWD/Roads, Health, Revenue|Second highest volume|
|Phase 3|Police, Agriculture, Transport|Medium volume|
|Phase 4|Remaining 37 departments|Complete rollout|



JanaNayagam — Tamil Nadu Civic Command Center | Employee Portal System Design | Confidential 

