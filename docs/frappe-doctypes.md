# Cunningham Operations Hub - Frappe DocType Specifications

This document specifies all DocTypes required for Phase 1 of the Cunningham Operations Hub. Build these in Frappe Cloud admin before connecting the Next.js frontend.

---

## Table of Contents

1. [Customer](#customer)
2. [Contact](#contact)
3. [Site](#site)
4. [Tank](#tank)
5. [Service Visit](#service-visit)
6. [Checklist Item (Child)](#checklist-item-child)
7. [Measurement (Child)](#measurement-child)
8. [Service Report](#service-report)
9. [Report Section (Child)](#report-section-child)
10. [Recommendation](#recommendation)
11. [Opportunity](#opportunity)
12. [Proposal](#proposal)
13. [Proposal Line Item (Child)](#proposal-line-item-child)
14. [Contract](#contract)
15. [Project](#project)
16. [Project Task (Child)](#project-task-child)
17. [Material (Child)](#material-child)
18. [Equipment (Child)](#equipment-child)
19. [Daily Log](#daily-log)
20. [Material Exception](#material-exception)
21. [Billing Milestone](#billing-milestone)
22. [Document](#document)
23. [Photo](#photo)
24. [User (Extended)](#user-extended)
25. [Audit Log Entry](#audit-log-entry)

---

## Customer

**DocType Name:** `Customer`  
**Module:** Cunningham  
**Naming:** `CUS-.#####`  
**Is Submittable:** No

### Fields

| Field Name | Type | Required | Options/Length | Description |
|------------|------|----------|----------------|-------------|
| customer_name | Data | Yes | 140 | Company or municipality name |
| customer_type | Select | Yes | Municipality, Utility, Industrial, Commercial, Other | |
| website | Data | No | 255 | |
| phone | Data | No | 20 | |
| email | Data | No | 255 | |
| billing_address_line1 | Data | No | 140 | |
| billing_address_line2 | Data | No | 140 | |
| billing_city | Data | No | 100 | |
| billing_state | Data | No | 50 | |
| billing_zip | Data | No | 10 | |
| billing_county | Data | No | 100 | |
| notes | Text | No | | |
| is_active | Check | No | Default: 1 | |
| primary_contact | Link | No | Contact | |

### Permissions

| Role | Read | Write | Create | Delete |
|------|------|-------|--------|--------|
| System Manager | Yes | Yes | Yes | Yes |
| Leadership | Yes | Yes | Yes | No |
| Sales Manager | Yes | Yes | Yes | No |
| Sales Rep | Yes | Yes | Yes | No |
| Project Manager | Yes | Yes | No | No |
| Field Superintendent | Yes | No | No | No |
| Field Technician | Yes | No | No | No |
| Office Staff | Yes | Yes | Yes | No |
| Read Only | Yes | No | No | No |

---

## Contact

**DocType Name:** `Contact`  
**Module:** Cunningham  
**Naming:** `CON-.#####`  
**Is Submittable:** No

### Fields

| Field Name | Type | Required | Options/Length | Description |
|------------|------|----------|----------------|-------------|
| first_name | Data | Yes | 100 | |
| last_name | Data | Yes | 100 | |
| full_name | Data | No | 200 | Read Only, Computed |
| customer | Link | Yes | Customer | |
| role | Select | Yes | Decision Maker, Technical Contact, Billing Contact, Site Contact, Other | |
| title | Data | No | 100 | Job title |
| email | Data | No | 255 | |
| phone | Data | No | 20 | |
| mobile | Data | No | 20 | |
| is_primary | Check | No | Default: 0 | |
| notes | Text | No | | |
| preferred_language | Select | No | en, es | Default: en |

### Permissions

Same as Customer.

---

## Site

**DocType Name:** `Site`  
**Module:** Cunningham  
**Naming:** `SITE-.#####`  
**Is Submittable:** No

### Fields

| Field Name | Type | Required | Options/Length | Description |
|------------|------|----------|----------------|-------------|
| site_name | Data | Yes | 140 | |
| customer | Link | Yes | Customer | |
| address_line1 | Data | No | 140 | |
| address_line2 | Data | No | 140 | |
| city | Data | No | 100 | |
| state | Data | No | 50 | |
| zip | Data | No | 10 | |
| county | Data | No | 100 | |
| latitude | Float | No | | Decimal degrees |
| longitude | Float | No | | Decimal degrees |
| site_status | Select | Yes | Active, Inactive, Pending | Default: Active |
| access_instructions | Text | No | | Gate codes, key locations, etc. |
| gate_code | Data | No | 20 | |
| primary_contact | Link | No | Contact | |
| notes | Text | No | | |

### Permissions

Same as Customer.

---

## Tank

**DocType Name:** `Tank`  
**Module:** Cunningham  
**Naming:** `TANK-.#####`  
**Is Submittable:** No

### Fields

| Field Name | Type | Required | Options/Length | Description |
|------------|------|----------|----------------|-------------|
| tank_name | Data | Yes | 140 | Descriptive name |
| site | Link | Yes | Site | |
| customer | Link | Yes | Customer | Denormalized from Site |
| tank_type | Select | Yes | Elevated - Spheroid, Elevated - Pedestal, Elevated - Multi-Leg, Elevated - Fluted Column, Ground - Standpipe, Ground - Reservoir, Ground - Clearwell, Ground - Hydropillar, Other | |
| material | Select | Yes | Steel, Concrete, Fiberglass, Other | Default: Steel |
| capacity_gallons | Int | No | | |
| height_feet | Float | No | | |
| diameter_feet | Float | No | | |
| year_built | Int | No | | 4 digits |
| coating_type | Select | No | Epoxy, Polyurethane, Glass-Lined, Galvanized, None, Unknown, Other | |
| coating_year | Int | No | | 4 digits |
| last_inspection_date | Date | No | | |
| next_inspection_due | Date | No | | |
| last_service_date | Date | No | | |
| next_service_due | Date | No | | |
| service_status | Select | Yes | Active - Current, Active - Service Due, Active - Overdue, Inactive, Decommissioned | Default: Active - Current |
| notes | Text | No | | |
| latitude | Float | No | | Override site location if different |
| longitude | Float | No | | Override site location if different |

### Permissions

Same as Customer.

---

## Service Visit

**DocType Name:** `Service Visit`  
**Module:** Cunningham  
**Naming:** `SV-.YYYY.-.#####`  
**Is Submittable:** Yes

### Fields

| Field Name | Type | Required | Options/Length | Description |
|------------|------|----------|----------------|-------------|
| visit_number | Data | Yes | 20 | Read Only, Auto |
| tank | Link | Yes | Tank | |
| site | Link | Yes | Site | Fetched from Tank |
| customer | Link | Yes | Customer | Fetched from Tank |
| visit_type | Select | Yes | Annual Inspection, Warranty Inspection, 5-Year Inspection, Spot Repair, Emergency Service, Washout, Other | |
| status | Select | Yes | Scheduled, In Progress, Completed, Cancelled, On Hold | Default: Scheduled |
| scheduled_date | Date | No | | |
| actual_date | Date | No | | |
| assigned_crew | Data | No | 140 | Crew name or team |
| lead_technician | Link | No | User | |
| notes | Text | No | | |
| weather_conditions | Data | No | 100 | |
| temperature_f | Int | No | | |
| wind_conditions | Data | No | 50 | |
| crew_hours | Float | No | | Total person-hours |
| report | Link | No | Service Report | Generated report |

### Child Tables

- `checklist_items` → Checklist Item
- `measurements` → Measurement

### Workflow States

1. **Scheduled** - Initial state
2. **In Progress** - Crew on site
3. **Completed** - All work done
4. **Cancelled** - Visit cancelled
5. **On Hold** - Temporarily paused

### Permissions

| Role | Read | Write | Create | Delete | Submit |
|------|------|-------|--------|--------|--------|
| System Manager | Yes | Yes | Yes | Yes | Yes |
| Leadership | Yes | Yes | Yes | No | Yes |
| Project Manager | Yes | Yes | Yes | No | Yes |
| Field Superintendent | Yes | Yes | Yes | No | Yes |
| Field Technician | Yes | Yes | Yes | No | No |
| Office Staff | Yes | Yes | Yes | No | No |
| Read Only | Yes | No | No | No | No |

---

## Checklist Item (Child)

**DocType Name:** `Checklist Item`  
**Module:** Cunningham  
**Is Child Table:** Yes

### Fields

| Field Name | Type | Required | Options/Length | Description |
|------------|------|----------|----------------|-------------|
| checklist_category | Data | Yes | 100 | e.g., Exterior, Interior, Safety |
| checklist_item | Data | Yes | 255 | Item description |
| status | Select | Yes | Pass, Fail, N/A, Needs Attention | |
| notes | Text | No | | |
| photo_required | Check | No | Default: 0 | |
| photo_taken | Check | No | Default: 0 | |

---

## Measurement (Child)

**DocType Name:** `Measurement`  
**Module:** Cunningham  
**Is Child Table:** Yes

### Fields

| Field Name | Type | Required | Options/Length | Description |
|------------|------|----------|----------------|-------------|
| measurement_type | Data | Yes | 100 | e.g., Coating Thickness, Pit Depth |
| location | Data | Yes | 100 | Location on tank |
| value | Float | Yes | | |
| unit | Data | Yes | 20 | e.g., mils, inches |
| min_acceptable | Float | No | | |
| max_acceptable | Float | No | | |
| status | Select | Yes | Within Spec, Out of Spec, Needs Review | |
| notes | Text | No | | |

---

## Service Report

**DocType Name:** `Service Report`  
**Module:** Cunningham  
**Naming:** `RPT-.YYYY.-.#####`  
**Is Submittable:** Yes

### Fields

| Field Name | Type | Required | Options/Length | Description |
|------------|------|----------|----------------|-------------|
| report_number | Data | Yes | 20 | Read Only, Auto |
| service_visit | Link | Yes | Service Visit | |
| tank | Link | Yes | Tank | Fetched |
| customer | Link | Yes | Customer | Fetched |
| status | Select | Yes | Draft, In Review, Approved, Sent, Acknowledged | Default: Draft |
| report_date | Date | Yes | | |
| executive_summary | Text Editor | No | | Rich text |
| overall_condition | Select | Yes | Good, Fair, Poor, Critical | |
| prepared_by | Link | No | User | |
| reviewed_by | Link | No | User | |
| approved_by | Link | No | User | |
| approved_date | Date | No | | |
| sent_date | Date | No | | |
| sent_to | Data | No | 255 | Email addresses |
| customer_acknowledged_date | Date | No | | |

### Child Tables

- `sections` → Report Section

### Workflow States

1. **Draft** - Being written
2. **In Review** - Under internal review
3. **Approved** - Ready to send
4. **Sent** - Delivered to customer
5. **Acknowledged** - Customer confirmed receipt

### Permissions

| Role | Read | Write | Create | Delete | Submit |
|------|------|-------|--------|--------|--------|
| System Manager | Yes | Yes | Yes | Yes | Yes |
| Leadership | Yes | Yes | Yes | No | Yes |
| Project Manager | Yes | Yes | Yes | No | Yes |
| Field Superintendent | Yes | Yes | Yes | No | No |
| Office Staff | Yes | Yes | Yes | No | No |
| Read Only | Yes | No | No | No | No |

---

## Report Section (Child)

**DocType Name:** `Report Section`  
**Module:** Cunningham  
**Is Child Table:** Yes

### Fields

| Field Name | Type | Required | Options/Length | Description |
|------------|------|----------|----------------|-------------|
| section_title | Data | Yes | 140 | |
| section_content | Text Editor | Yes | | Rich text |
| photos | Text | No | | JSON array of Photo names |

---

## Recommendation

**DocType Name:** `Recommendation`  
**Module:** Cunningham  
**Naming:** `REC-.#####`  
**Is Submittable:** No

### Fields

| Field Name | Type | Required | Options/Length | Description |
|------------|------|----------|----------------|-------------|
| report | Link | Yes | Service Report | |
| tank | Link | Yes | Tank | Fetched |
| priority | Select | Yes | Critical, High, Medium, Low | |
| recommendation_type | Select | Yes | Immediate Repair, Scheduled Repair, Coating, Full Rehabilitation, Monitoring, No Action, Other | |
| title | Data | Yes | 255 | |
| description | Text | Yes | | |
| estimated_cost_low | Currency | No | | |
| estimated_cost_high | Currency | No | | |
| recommended_timeframe | Data | No | 100 | e.g., "Within 30 days" |
| area_affected | Data | No | 100 | |
| photos | Text | No | | JSON array |
| converted_to_proposal | Check | No | Default: 0 | |
| proposal | Link | No | Proposal | |

### Permissions

Same as Service Report.

---

## Opportunity

**DocType Name:** `Opportunity`  
**Module:** Cunningham  
**Naming:** `OPP-.#####`  
**Is Submittable:** No

### Fields

| Field Name | Type | Required | Options/Length | Description |
|------------|------|----------|----------------|-------------|
| opportunity_name | Data | Yes | 255 | |
| customer | Link | Yes | Customer | |
| site | Link | No | Site | |
| tank | Link | No | Tank | |
| source | Select | Yes | Existing Customer, Referral, Bid List, Website, Trade Show, Cold Call, Inspection Finding, Other | |
| status | Select | Yes | New, Qualified, Proposal Sent, Negotiating, Won, Lost, Dormant | Default: New |
| description | Text | No | | |
| estimated_value | Currency | No | | |
| probability | Percent | No | | 0-100 |
| expected_close_date | Date | No | | |
| assigned_to | Link | No | User | |
| next_follow_up_date | Date | No | | |
| follow_up_notes | Text | No | | |
| lost_reason | Data | No | 255 | |
| competitor | Data | No | 140 | |
| notes | Text | No | | |

### Permissions

| Role | Read | Write | Create | Delete |
|------|------|-------|--------|--------|
| System Manager | Yes | Yes | Yes | Yes |
| Leadership | Yes | Yes | Yes | Yes |
| Sales Manager | Yes | Yes | Yes | Yes |
| Sales Rep | Yes | Yes | Yes | No |
| Project Manager | Yes | No | No | No |
| Read Only | Yes | No | No | No |

---

## Proposal

**DocType Name:** `Proposal`  
**Module:** Cunningham  
**Naming:** `PROP-.YYYY.-.#####`  
**Is Submittable:** Yes

### Fields

| Field Name | Type | Required | Options/Length | Description |
|------------|------|----------|----------------|-------------|
| proposal_number | Data | Yes | 20 | Read Only, Auto |
| opportunity | Link | No | Opportunity | |
| customer | Link | Yes | Customer | |
| site | Link | No | Site | |
| tank | Link | No | Tank | |
| proposal_type | Select | Yes | Engineered Spec, Negotiated | |
| status | Select | Yes | Draft, Internal Review, Sent, Follow-Up Due, Negotiating, Won, Lost, Expired, Dormant | Default: Draft |
| title | Data | Yes | 255 | |
| scope_of_work | Text Editor | No | | Rich text |
| subtotal | Currency | No | | Computed |
| tax_rate | Percent | No | | |
| tax_amount | Currency | No | | Computed |
| total | Currency | No | | Computed |
| valid_until | Date | No | | |
| sent_date | Date | No | | |
| prepared_by | Link | No | User | |
| approved_by | Link | No | User | |
| bid_due_date | Date | No | | For engineered specs |
| bid_opening_date | Date | No | | For engineered specs |
| engineer_of_record | Data | No | 140 | |
| bonding_required | Check | No | Default: 0 | |
| bond_amount | Currency | No | | |
| prevailing_wage | Check | No | Default: 0 | |
| last_follow_up_date | Date | No | | |
| next_follow_up_date | Date | No | | |
| follow_up_notes | Text | No | | |
| won_date | Date | No | | |
| lost_date | Date | No | | |
| lost_reason | Data | No | 255 | |
| competitor | Data | No | 140 | |
| contract | Link | No | Contract | |
| notes | Text | No | | |

### Child Tables

- `line_items` → Proposal Line Item

### Workflow States

1. **Draft** - Being created
2. **Internal Review** - Needs approval
3. **Sent** - Delivered to customer
4. **Follow-Up Due** - Needs follow-up
5. **Negotiating** - Active discussions
6. **Won** - Contract secured
7. **Lost** - Did not win
8. **Expired** - Past valid date
9. **Dormant** - Inactive, may revive

### Permissions

| Role | Read | Write | Create | Delete | Submit |
|------|------|-------|--------|--------|--------|
| System Manager | Yes | Yes | Yes | Yes | Yes |
| Leadership | Yes | Yes | Yes | Yes | Yes |
| Sales Manager | Yes | Yes | Yes | Yes | Yes |
| Sales Rep | Yes | Yes | Yes | No | No |
| Project Manager | Yes | No | No | No | No |
| Read Only | Yes | No | No | No | No |

---

## Proposal Line Item (Child)

**DocType Name:** `Proposal Line Item`  
**Module:** Cunningham  
**Is Child Table:** Yes

### Fields

| Field Name | Type | Required | Options/Length | Description |
|------------|------|----------|----------------|-------------|
| item_description | Text | Yes | | |
| quantity | Float | Yes | | |
| unit | Data | Yes | 20 | e.g., SF, LF, EA, LS |
| unit_price | Currency | Yes | | |
| total_price | Currency | Yes | | Computed |
| cost_code | Data | No | 20 | |
| notes | Text | No | | |

---

## Contract

**DocType Name:** `Contract`  
**Module:** Cunningham  
**Naming:** `CTR-.YYYY.-.#####`  
**Is Submittable:** Yes

### Fields

| Field Name | Type | Required | Options/Length | Description |
|------------|------|----------|----------------|-------------|
| contract_number | Data | Yes | 20 | Read Only, Auto |
| proposal | Link | Yes | Proposal | |
| customer | Link | Yes | Customer | Fetched |
| site | Link | No | Site | Fetched |
| status | Select | Yes | Draft, Active, Completed, Cancelled | Default: Draft |
| contract_date | Date | Yes | | |
| start_date | Date | No | | |
| end_date | Date | No | | |
| contract_value | Currency | Yes | | |
| retainage_percent | Percent | No | | |
| retainage_amount | Currency | No | | Computed |
| signed_date | Date | No | | |
| signed_by_customer | Data | No | 140 | |
| signed_by_cunningham | Data | No | 140 | |
| terms_and_conditions | Text Editor | No | | |
| change_orders_total | Currency | No | | Default: 0 |
| final_contract_value | Currency | No | | Computed |
| notes | Text | No | | |
| project | Link | No | Project | |

### Permissions

| Role | Read | Write | Create | Delete | Submit |
|------|------|-------|--------|--------|--------|
| System Manager | Yes | Yes | Yes | Yes | Yes |
| Leadership | Yes | Yes | Yes | Yes | Yes |
| Sales Manager | Yes | Yes | Yes | No | Yes |
| Project Manager | Yes | Yes | No | No | No |
| Read Only | Yes | No | No | No | No |

---

## Project

**DocType Name:** `Project`  
**Module:** Cunningham  
**Naming:** `PROJ-.YYYY.-.#####`  
**Is Submittable:** No

### Fields

| Field Name | Type | Required | Options/Length | Description |
|------------|------|----------|----------------|-------------|
| project_number | Data | Yes | 20 | Read Only, Auto |
| project_name | Data | Yes | 255 | |
| contract | Link | Yes | Contract | |
| customer | Link | Yes | Customer | Fetched |
| site | Link | Yes | Site | Fetched |
| tank | Link | Yes | Tank | Fetched |
| status | Select | Yes | Planning, Scheduled, Mobilizing, In Progress, On Hold, Punch List, Completed, Closed | Default: Planning |
| project_manager | Link | No | User | |
| superintendent | Link | No | User | |
| scheduled_start_date | Date | No | | |
| actual_start_date | Date | No | | |
| scheduled_end_date | Date | No | | |
| actual_end_date | Date | No | | |
| budget | Currency | No | | |
| actual_cost | Currency | No | | |
| percent_complete | Percent | No | | 0-100 |
| notes | Text | No | | |

### Child Tables

- `tasks` → Project Task
- `materials` → Material
- `equipment` → Equipment

### Workflow States

1. **Planning** - Project setup
2. **Scheduled** - Dates confirmed
3. **Mobilizing** - Crew/equipment moving
4. **In Progress** - Active work
5. **On Hold** - Paused
6. **Punch List** - Final items
7. **Completed** - Work done
8. **Closed** - Fully closed out

### Permissions

| Role | Read | Write | Create | Delete |
|------|------|-------|--------|--------|
| System Manager | Yes | Yes | Yes | Yes |
| Leadership | Yes | Yes | Yes | Yes |
| Sales Manager | Yes | No | No | No |
| Project Manager | Yes | Yes | Yes | No |
| Field Superintendent | Yes | Yes | No | No |
| Field Technician | Yes | No | No | No |
| Office Staff | Yes | Yes | Yes | No |
| Read Only | Yes | No | No | No |

---

## Project Task (Child)

**DocType Name:** `Project Task`  
**Module:** Cunningham  
**Is Child Table:** Yes

### Fields

| Field Name | Type | Required | Options/Length | Description |
|------------|------|----------|----------------|-------------|
| task_name | Data | Yes | 255 | |
| description | Text | No | | |
| status | Select | Yes | Not Started, In Progress, Completed, On Hold, Cancelled | Default: Not Started |
| assigned_to | Link | No | User | |
| scheduled_start | Date | No | | |
| scheduled_end | Date | No | | |
| actual_start | Date | No | | |
| actual_end | Date | No | | |
| estimated_hours | Float | No | | |
| actual_hours | Float | No | | |
| percent_complete | Percent | No | | |
| predecessor_task | Data | No | 100 | Reference to another task |
| notes | Text | No | | |

---

## Material (Child)

**DocType Name:** `Material`  
**Module:** Cunningham  
**Is Child Table:** Yes

### Fields

| Field Name | Type | Required | Options/Length | Description |
|------------|------|----------|----------------|-------------|
| material_name | Data | Yes | 255 | |
| material_code | Data | No | 50 | |
| description | Text | No | | |
| quantity_required | Float | Yes | | |
| quantity_ordered | Float | No | | |
| quantity_received | Float | No | | |
| quantity_used | Float | No | | |
| unit | Data | Yes | 20 | |
| unit_cost | Currency | No | | |
| total_cost | Currency | No | | Computed |
| supplier | Data | No | 140 | |
| order_date | Date | No | | |
| expected_delivery | Date | No | | |
| received_date | Date | No | | |
| lot_number | Data | No | 50 | |
| notes | Text | No | | |

---

## Equipment (Child)

**DocType Name:** `Equipment`  
**Module:** Cunningham  
**Is Child Table:** Yes

### Fields

| Field Name | Type | Required | Options/Length | Description |
|------------|------|----------|----------------|-------------|
| equipment_name | Data | Yes | 140 | |
| equipment_type | Data | Yes | 100 | |
| asset_number | Data | No | 50 | |
| rental_or_owned | Select | Yes | Rental, Owned | |
| rental_company | Data | No | 140 | |
| daily_rate | Currency | No | | |
| start_date | Date | No | | |
| end_date | Date | No | | |
| total_days | Int | No | | Computed |
| total_cost | Currency | No | | Computed |
| notes | Text | No | | |

---

## Daily Log

**DocType Name:** `Daily Log`  
**Module:** Cunningham  
**Naming:** `DL-.YYYY.-.#####`  
**Is Submittable:** Yes

### Fields

| Field Name | Type | Required | Options/Length | Description |
|------------|------|----------|----------------|-------------|
| project | Link | Yes | Project | |
| log_date | Date | Yes | | |
| weather | Data | No | 100 | |
| temperature_high | Int | No | | Fahrenheit |
| temperature_low | Int | No | | Fahrenheit |
| crew_size | Int | No | | |
| work_performed | Text | No | | |
| materials_used | Text | No | | |
| equipment_used | Text | No | | |
| delays_issues | Text | No | | |
| safety_incidents | Text | No | | |
| visitor_log | Text | No | | |
| photos | Text | No | | JSON array |
| submitted_by | Link | No | User | |

### Permissions

| Role | Read | Write | Create | Delete | Submit |
|------|------|-------|--------|--------|--------|
| System Manager | Yes | Yes | Yes | Yes | Yes |
| Leadership | Yes | Yes | Yes | No | Yes |
| Project Manager | Yes | Yes | Yes | No | Yes |
| Field Superintendent | Yes | Yes | Yes | No | Yes |
| Field Technician | Yes | Yes | Yes | No | No |
| Read Only | Yes | No | No | No | No |

---

## Material Exception

**DocType Name:** `Material Exception`  
**Module:** Cunningham  
**Naming:** `ME-.#####`  
**Is Submittable:** No

### Fields

| Field Name | Type | Required | Options/Length | Description |
|------------|------|----------|----------------|-------------|
| project | Link | Yes | Project | |
| exception_date | Date | Yes | | |
| material | Data | Yes | 255 | |
| exception_type | Select | Yes | Shortage, Defect, Wrong Item, Damage, Other | |
| description | Text | Yes | | |
| quantity_affected | Float | No | | |
| resolution | Text | No | | |
| resolution_date | Date | No | | |
| cost_impact | Currency | No | | |
| schedule_impact_days | Int | No | | |
| reported_by | Link | No | User | |
| photos | Text | No | | JSON array |

### Permissions

Same as Daily Log.

---

## Billing Milestone

**DocType Name:** `Billing Milestone`  
**Module:** Cunningham  
**Naming:** `BM-.#####`  
**Is Submittable:** No

### Fields

| Field Name | Type | Required | Options/Length | Description |
|------------|------|----------|----------------|-------------|
| project | Link | Yes | Project | |
| milestone_name | Data | Yes | 255 | |
| description | Text | No | | |
| percent_of_contract | Percent | Yes | | |
| amount | Currency | Yes | | |
| status | Select | Yes | Pending, Ready to Bill, Invoiced, Paid, Disputed | Default: Pending |
| due_date | Date | No | | |
| invoiced_date | Date | No | | |
| quickbooks_invoice_id | Data | No | 50 | Read Only |
| quickbooks_invoice_number | Data | No | 50 | Read Only |
| paid_date | Date | No | | |
| payment_amount | Currency | No | | |
| notes | Text | No | | |

### Permissions

| Role | Read | Write | Create | Delete |
|------|------|-------|--------|--------|
| System Manager | Yes | Yes | Yes | Yes |
| Leadership | Yes | Yes | Yes | Yes |
| Project Manager | Yes | Yes | Yes | No |
| Office Staff | Yes | Yes | Yes | No |
| Read Only | Yes | No | No | No |

---

## Document

**DocType Name:** `Document`  
**Module:** Cunningham  
**Naming:** `DOC-.#####`  
**Is Submittable:** No

### Fields

| Field Name | Type | Required | Options/Length | Description |
|------------|------|----------|----------------|-------------|
| file_name | Data | Yes | 255 | |
| file_url | Data | Yes | 500 | Frappe file path |
| file_type | Data | No | 50 | MIME type or extension |
| file_size | Int | No | | Bytes |
| category | Select | Yes | Contract, Proposal, Report, Inspection, Drawing, Permit, Safety, Correspondence, Photo, Other | |
| description | Text | No | | |
| attached_to_doctype | Data | Yes | 140 | |
| attached_to_name | Data | Yes | 140 | |
| uploaded_by | Link | No | User | |
| tags | Data | No | 255 | Comma-separated |
| is_private | Check | No | Default: 0 | |

### Permissions

| Role | Read | Write | Create | Delete |
|------|------|-------|--------|--------|
| System Manager | Yes | Yes | Yes | Yes |
| Leadership | Yes | Yes | Yes | Yes |
| Sales Manager | Yes | Yes | Yes | No |
| Sales Rep | Yes | Yes | Yes | No |
| Project Manager | Yes | Yes | Yes | No |
| Field Superintendent | Yes | Yes | Yes | No |
| Field Technician | Yes | Yes | Yes | No |
| Office Staff | Yes | Yes | Yes | No |
| Read Only | Yes | No | No | No |

---

## Photo

**DocType Name:** `Photo`  
**Module:** Cunningham  
**Naming:** `PHO-.#####`  
**Is Submittable:** No

### Fields

| Field Name | Type | Required | Options/Length | Description |
|------------|------|----------|----------------|-------------|
| file_name | Data | Yes | 255 | |
| file_url | Data | Yes | 500 | |
| thumbnail_url | Data | No | 500 | |
| category | Select | Yes | Exterior, Interior, Coating, Defect, Measurement, Before, After, Progress, Safety, Other | |
| caption | Data | No | 255 | |
| attached_to_doctype | Data | Yes | 140 | |
| attached_to_name | Data | Yes | 140 | |
| taken_by | Link | No | User | |
| taken_date | Date | No | | |
| latitude | Float | No | | EXIF or manual |
| longitude | Float | No | | EXIF or manual |
| location_on_tank | Data | No | 100 | e.g., "North side, 30ft" |
| is_required | Check | No | Default: 0 | Checklist-required photo |
| is_hero | Check | No | Default: 0 | Featured in reports |
| tags | Data | No | 255 | |

### Permissions

Same as Document.

---

## User (Extended)

Extend the standard Frappe User DocType with these custom fields:

### Custom Fields

| Field Name | Type | Required | Options/Length | Description |
|------------|------|----------|----------------|-------------|
| cunningham_role | Select | Yes | System Manager, Leadership, Sales Manager, Sales Rep, Project Manager, Field Superintendent, Field Technician, Office Staff, Read Only | |
| phone | Data | No | 20 | |
| mobile | Data | No | 20 | |
| preferred_language | Select | No | en, es | Default: en |
| signature | Attach Image | No | | Digital signature |
| can_access_financials | Check | No | Default: 0 | |
| can_approve_proposals | Check | No | Default: 0 | |
| can_approve_reports | Check | No | Default: 0 | |

---

## Audit Log Entry

**DocType Name:** `Audit Log Entry`  
**Module:** Cunningham  
**Naming:** `AUD-.#####`  
**Is Submittable:** No

### Fields

| Field Name | Type | Required | Options/Length | Description |
|------------|------|----------|----------------|-------------|
| doctype_name | Data | Yes | 140 | |
| document_name | Data | Yes | 140 | |
| action | Select | Yes | Create, Update, Delete, Submit, Cancel, View | |
| user | Link | Yes | User | |
| timestamp | Datetime | Yes | | |
| ip_address | Data | No | 45 | |
| changes | Text | No | | JSON diff |
| notes | Text | No | | |

### Permissions

| Role | Read | Write | Create | Delete |
|------|------|-------|--------|--------|
| System Manager | Yes | No | Yes | No |
| Leadership | Yes | No | No | No |

---

## Notes for Frappe Admin

1. **Computed Fields**: Fields marked "Computed" should have `read_only: 1` and use `fetch_from` or server scripts.

2. **Naming Series**: Configure in Frappe Settings → Naming Series for each DocType.

3. **Workflows**: Create workflows for submittable DocTypes (Service Visit, Service Report, Proposal, Contract, Daily Log).

4. **Link Field Filters**: Add `get_query` filters where needed (e.g., Site filtered by Customer).

5. **Permissions**: Create Roles first, then apply DocType permissions as specified.

6. **Custom Scripts**: Add client scripts for:
   - Auto-populating denormalized fields
   - Computing totals
   - Validations

7. **Print Formats**: Create print formats for Proposal, Service Report, Contract.

8. **Reports**: Consider creating Report Builder reports for:
   - Pipeline summary
   - Service due list
   - Project status
   - Financial overview
