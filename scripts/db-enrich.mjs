/**
 * Hand-written annotations for the ConnectWise database catalog, consumed by
 * scripts/gen-db-schema.mjs. Data only — the generator holds the logic.
 *
 * Provenance: table, view and column names here were read off 38 production
 * BrightGauge reporting queries against a live ConnectWise Manage database, not
 * inferred from naming conventions. Anything not evidenced there is left out —
 * a wrong entry is worse than a missing one, because search ranks it first.
 *
 * ConnectWise ships denormalized reporting views (v_rpt_*) that already join
 * board, status, company and contact onto a record. They are the right default;
 * the base tables are here for keys and for columns the views drop.
 */

export const ENRICH = {
  // ---- Reporting views: the denormalized entry points.
  v_rpt_service: {
    keywords: "tickets ticket helpdesk servicedesk backlog queue",
    purpose:
      "Tickets, denormalized for reporting — board, status, company, contact and SLA dates already joined in. The first place to look for anything ticket-shaped.",
    pk: "SR_Service_RecID",
    keyColumns:
      "SR_Service_RecID int, TicketNbr int, company_name nvarchar, contact_name nvarchar, board_name nvarchar, status_description nvarchar, summary nvarchar, date_entered datetime, last_update datetime, date_closed datetime, closed_by nvarchar, resolved_by nvarchar, date_responded_utc datetime, date_resplan_utc datetime, date_resolved_utc datetime, team_name nvarchar, Territory nvarchar",
    joins: "SR_Service_RecID → SR_Service (base table); sr_board_recid → SR_Board",
    coveredBy: "cw_search_tickets, cw_get_ticket",
    size: "large",
    notes:
      "An open ticket is date_closed IS NULL. TicketNbr is the number people quote; SR_Service_RecID is the key everything joins on.",
  },
  v_rpt_time: {
    keywords: "time entries hours billable unbilled utilisation utilization timesheet",
    purpose:
      "Time entries, denormalized — hours, billable split, work role, agreement and company already resolved. Use this for utilisation, unbilled time and any hours reporting.",
    pk: "Time_RecID",
    keyColumns:
      "Time_RecID int, Member_ID nvarchar, Company_Name nvarchar, SR_Service_RecID int, Date_Start datetime, Hours_Actual decimal, Billable_Hrs decimal, NonBillable_Hrs decimal, Billable_Flag bit, Invoice_Flag bit, Utilization_Flag bit, AgrHrsCovered decimal, Agr_Header_RecID int, work_role nvarchar, work_type nvarchar, project_name nvarchar, Hourly_Cost_Decimal decimal",
    joins:
      "SR_Service_RecID → v_rpt_service; Agr_Header_RecID → AGR_Header; Member_ID → Member.Member_ID",
    coveredBy: "cw_list_my_time, cw_list_ticket_time, cw_list_unbilled_time",
    size: "very large",
    notes:
      "Unbilled billable time is Billable_Hrs > 0 AND Invoice_Flag = 0. Always bound by Date_Start.",
  },
  v_rpt_company: {
    keywords: "companies customers clients accounts",
    purpose:
      "Companies with status, type, market and default contact resolved to text — the reporting view of the customer list.",
    pk: "Company_RecID",
    keyColumns:
      "Company_RecID int, Company_ID nvarchar, Company_Name nvarchar, Company_Status_Desc nvarchar, Company_Type_Desc nvarchar, Market_Desc nvarchar, Location nvarchar, Territory nvarchar, Owner_Level_RecID int, Contact_RecID int, Default_Contact_First_Name nvarchar, Default_Contact_Last_Name nvarchar, Date_Acquired datetime, Delete_Flag bit",
    joins: "Company_RecID → Company; Owner_Level_RecID → Owner_Level",
    coveredBy: "cw_search_companies, cw_get_company",
    notes: "Filter Delete_Flag = 0 — deleted companies are still rows here.",
  },
  v_rpt_contact: {
    keywords: "contacts people email phone",
    purpose: "Contacts with their default email and phone already resolved.",
    pk: "Contact_RecID",
    keyColumns:
      "Contact_RecID int, Company_RecID int, Company_ID nvarchar, Company_Name nvarchar, First_Name nvarchar, Last_Name nvarchar, Title nvarchar, Default_Email nvarchar, Default_Phone nvarchar, Contact_Type_Desc nvarchar, Default_Flag bit",
    joins: "Company_RecID → v_rpt_company",
    coveredBy: "cw_search_contacts, cw_get_contact",
  },
  v_rpt_member: {
    keywords: "members technicians staff engineers users",
    purpose: "Members (staff) for reporting — identifiers, roles and reporting lines.",
    pk: "Member_RecID",
    keyColumns:
      "Member_RecID int, Member_ID nvarchar, First_Name nvarchar, Last_Name nvarchar, Inactive_Flag bit",
    joins: "Member_RecID → Member",
    coveredBy: "cw_list_members, cw_get_member",
  },
  v_rpt_agreementlist: {
    keywords: "agreements contracts renewals coverage",
    purpose:
      "Agreements with type, status, billing cycle and balance resolved — the renewal and coverage list.",
    pk: "AGR_Header_RecID",
    keyColumns:
      "AGR_Header_RecID int, AGR_Name nvarchar, Company_Name nvarchar, company_recid int, agr_type_desc nvarchar, Agreement_Status nvarchar, DateStart datetime, DateEnd datetime, Billing_Cycle_Desc nvarchar, Billing_Amount money, BalAvailable decimal, UnlimitedFlag bit, Nbr_Cycles int, Valid_flag bit, Owner_Level_Name nvarchar",
    joins: "AGR_Header_RecID → AGR_Header; company_recid → Company",
    coveredBy: "cw_list_agreements, cw_get_agreement",
  },
  v_rpt_agreementadditions: {
    purpose: "Agreement additions — the line items that make up what an agreement bills.",
    joins: "AGR_Header_RecID → AGR_Header",
    coveredBy: "cw_get_agreement",
  },
  v_rpt_invoices: {
    keywords: "invoices billing receivables payments",
    purpose: "Invoices with amounts, dates and terms — the finance reporting view over Billing_Log.",
    pk: "Billing_Log_RecID",
    keyColumns:
      "Billing_Log_RecID int, Invoice_Number nvarchar, Invoice_Type nvarchar, Company_Name nvarchar, Date_Invoice datetime, Due_Date datetime, Date_Paid datetime, Invoice_Amount money, Sales_Tax_Amount money, Time_Amount money, Expense_Amount money, Misc_Amount money, Adj_Amount money, PO_Number nvarchar, Billing_Terms nvarchar, Agreement_Name nvarchar",
    joins: "Billing_Log_RecID → Billing_Log",
    coveredBy: "cw_list_invoices, cw_get_invoice",
    notes:
      "Unpaid invoices are Date_Paid IS NULL. The identity is Billing_Log_RecID — there is no Invoice_RecID.",
  },
  v_rpt_configuration: {
    keywords: "configurations devices assets hardware warranty",
    purpose:
      "Configurations (devices and assets) with type, manufacturer, serial, dates and status resolved.",
    pk: "Config_RecID",
    keyColumns:
      "Config_RecID int, Config_Name nvarchar, Company_Name nvarchar, Config_Type nvarchar, ConfigStatus nvarchar, Manufacturer nvarchar, Serial_Number nvarchar, Model_Number nvarchar, Tag_Number nvarchar, Contact_Name nvarchar, Location nvarchar, DeviceID nvarchar, LastLogin datetime, Date_Purchased datetime, Date_Installed datetime, Date_Expiration datetime",
    joins: "Config_RecID → Config",
    coveredBy: "cw_list_configurations, cw_get_configuration",
    notes: "Date_Expiration is the warranty/expiry date used for refresh reporting.",
  },
  v_rpt_project: {
    keywords: "projects phases",
    purpose:
      "Project tickets with their phase, WBS position and budgeted vs actual hours — project reporting.",
    pk: "SR_Service_RecID",
    keyColumns:
      "SR_Service_RecID int, ProjectName nvarchar, ProjectType nvarchar, Phase nvarchar, PM_Phase_RecID int, PhaseWbsCode nvarchar, TicketWbsSequence nvarchar, Summary nvarchar, board_name nvarchar, Company_Name nvarchar, contact_name nvarchar, hours_budget decimal, hours_actual decimal, Date_Entered datetime",
    joins: "SR_Service_RecID → SR_Service; PM_Phase_RecID → PM_Phase",
    notes: "Project tickets are ordinary SR_Service rows — there is no separate project-ticket table.",
  },
  v_rpt_projectteammember: {
    purpose: "Who is on a project team.",
    joins: "→ PM_Project, Member",
  },
  v_rpt_opportunity: {
    keywords: "opportunities pipeline sales deals",
    purpose: "Sales opportunities with revenue, cost, stage and probability — the pipeline view.",
    pk: "Opportunity_RecID",
    keyColumns:
      "Opportunity_RecID int, Opportunity_Name nvarchar, Company_Name nvarchar, Contact_Name nvarchar, Status nvarchar, Closed_Status nvarchar, Sales_Stage nvarchar, Probability decimal, Total_Revenue money, Product_Revenue money, Service_Revenue money, Total_Cost money, Last_Update datetime",
    joins: "Opportunity_RecID → SO_Opportunity",
  },
  v_rpt_purchaseorder: { purpose: "Purchase orders — vendor, status and totals.", joins: "→ Purchase_Header" },
  v_rpt_purchaseorderwithlineitems: { purpose: "Purchase orders expanded to their line items." },
  v_rpt_product: { purpose: "Products sold on tickets, projects, opportunities and agreements." },
  v_rpt_inventoryitem: { purpose: "Inventory items and on-hand quantities." },
  v_rpt_sla: { purpose: "SLA definitions — response, resolution-plan and resolution targets.", joins: "→ SR_SLA" },
  v_rpt_service_sla: {
    purpose: "Per-ticket SLA outcome — the clock actually achieved against the target.",
    joins: "SR_Service_RecID → v_rpt_service",
  },
  v_rpt_billingcycle: { purpose: "Billing cycles referenced by agreements and invoices." },
  v_rpt_billingterms: { purpose: "Billing terms (Net 30 …) referenced by invoices." },
  v_configslist: { purpose: "Flat configuration list, an alternative to v_rpt_configuration." },
  v_companies_address: { purpose: "Company addresses, flattened." },
  v_companyteam_list: { purpose: "Company team members — who is assigned to which customer." },
  v_company_custom_fields: {
    purpose: "Company custom-field values, pivoted into columns.",
    notes: "Instance-specific: column names differ per instance — read INFORMATION_SCHEMA first.",
  },
  v_sr_service_custom_fields: {
    purpose: "Ticket custom-field values, pivoted into columns.",
    notes: "Instance-specific: column names differ per instance — read INFORMATION_SCHEMA first.",
  },
  v_contact_custom_fields: {
    purpose: "Contact custom-field values, pivoted into columns.",
    notes: "Instance-specific: column names differ per instance — read INFORMATION_SCHEMA first.",
  },

  // ---- Base tables: for keys, and for columns the views drop.
  SR_Service: {
    purpose: "Service tickets, base table — one row per ticket, open and closed, projects included.",
    pk: "SR_Service_RecID",
    keyColumns:
      "SR_Service_RecID int, Company_RecID int, Summary nvarchar, SR_Board_RecID int, SR_Status_RecID int, SR_Type_RecID int, SR_SubType_RecID int, sr_team_recid int, ticket_owner_recid int, SR_SLA_RecID int, SR_Urgency_RecID int, PM_Phase_RecID int, Owner_Level_RecID int, Date_Entered datetime, Last_Update datetime, Date_Closed datetime, CustUpdate_Flag bit",
    joins:
      "Company_RecID → Company; SR_Board_RecID → SR_Board; SR_Status_RecID → SR_Status; SR_Type_RecID → SR_Type; ticket_owner_recid → Member; PM_Phase_RecID → PM_Phase",
    coveredBy: "cw_search_tickets, cw_get_ticket, cw_update_ticket",
    size: "large",
    notes:
      "Closed tickets are not archived — Date_Closed IS NULL means open. Prefer v_rpt_service unless you need a raw key.",
  },
  SR_Board: {
    purpose: "Service boards — the queues tickets live on.",
    pk: "SR_Board_RecID",
    keyColumns: "SR_Board_RecID int, Board_Name nvarchar",
    coveredBy: "cw_list_boards, cw_get_board",
  },
  SR_Status: {
    purpose: "Ticket statuses. Per board — the same name can exist on several boards.",
    pk: "SR_Status_RecID",
    keyColumns: "SR_Status_RecID int, Description nvarchar, SR_Board_RecID int",
    joins: "SR_Board_RecID → SR_Board",
    coveredBy: "cw_get_board",
  },
  SR_Type: {
    purpose: "Ticket types, per board.",
    pk: "SR_Type_RecID",
    keyColumns: "SR_Type_RecID int, Description nvarchar, SR_Board_RecID int",
    joins: "SR_Board_RecID → SR_Board",
    coveredBy: "cw_get_board",
  },
  SR_SubType: { purpose: "Ticket subtypes, under a type.", pk: "SR_SubType_RecID" },
  SR_Team: { purpose: "Service teams assigned to boards.", joins: "SR_Board_RecID → SR_Board" },
  SR_Task: {
    purpose: "Ticket tasks — the checklist on a ticket.",
    joins: "SR_Service_RecID → SR_Service",
    coveredBy: "cw_list_ticket_tasks",
  },
  SR_Config: {
    purpose: "Ticket ↔ configuration links — which devices a ticket is about.",
    joins: "SR_Service_RecID → SR_Service; Config_RecID → Config",
  },
  SR_SLA: {
    purpose: "SLA definitions with response, resolution-plan and resolution hour targets.",
    pk: "SR_SLA_RecID",
    keyColumns:
      "SR_SLA_RecID int, Responded_Hours decimal, Resplan_Hours decimal, Resolution_Hours decimal",
  },
  SR_SLAPriority: {
    purpose: "Per-priority SLA overrides — the target hours actually applied to a ticket.",
    joins: "SR_SLA_RecID → SR_SLA",
  },
  SR_Service_SLA_Workflow: {
    keywords: "sla response resolution breach",
    purpose:
      "Per-ticket SLA clock: minutes to responded, resolution plan and resolved, plus skipped (out-of-hours) minutes.",
    keyColumns:
      "SR_Service_RecID int, Date_Responded_UTC datetime, Responded_Minutes int, Responded_Skipped_Minutes int, Date_Resplan_UTC datetime, Resplan_Minutes int, Resplan_Skipped_Minutes int, Date_Resolved_UTC datetime, Resolved_Minutes int",
    joins: "SR_Service_RecID → SR_Service",
    notes:
      "SLA attainment compares these minute columns against SR_SLAPriority/SR_SLA hour targets × 60.",
  },
  SR_Urgency: { purpose: "Ticket urgency values, combined with impact to derive priority." },
  SR_Impact: { purpose: "Ticket impact values, combined with urgency to derive priority." },
  SR_Severity: { purpose: "Ticket severity values." },
  SR_Source: { purpose: "How a ticket arrived (Phone, Email, Portal …)." },
  SR_Location: { purpose: "Service locations tickets and boards are scoped to." },
  Company: {
    purpose: "Customers, prospects and vendors, base table.",
    pk: "Company_RecID",
    keyColumns:
      "Company_RecID int, Company_ID nvarchar, Company_Name nvarchar, Company_Status_RecID int, Owner_Level_RecID int, PhoneNbr nvarchar",
    joins: "Company_Status_RecID → Company_Status; Owner_Level_RecID → Owner_Level",
    coveredBy: "cw_search_companies, cw_get_company",
    notes: "Company_ID is the short identifier people type; Company_Name is the display name.",
  },
  Company_Status: { purpose: "Company statuses (Active, Inactive, Prospect …)." },
  Company_Type: { purpose: "Company types (Client, Vendor, Partner …)." },
  Company_Company_Type: {
    purpose: "Company ↔ type links — a company can carry several types.",
    joins: "Company_RecID → Company; Company_Type_RecID → Company_Type",
  },
  Contact: {
    purpose: "People at companies, base table.",
    pk: "Contact_RecID",
    keyColumns:
      "Contact_RecID int, Company_RecID int, First_Name nvarchar, Last_Name nvarchar, Title nvarchar",
    joins: "Company_RecID → Company",
    coveredBy: "cw_search_contacts, cw_get_contact",
    notes: "Email and phone live in the communication tables — v_rpt_contact resolves them for you.",
  },
  Member: {
    purpose: "Staff — technicians, dispatchers and admins.",
    pk: "Member_RecID",
    keyColumns:
      "Member_RecID int, Member_ID nvarchar, First_Name nvarchar, Last_Name nvarchar, Title nvarchar, Email_Address nvarchar, Inactive_Flag bit, Daily_Capacity decimal, Reports_To int, Member_Type_RecID int, Owner_Level_RecID int, SR_Billing_Unit_RecID int",
    joins: "Reports_To → Member; Member_Type_RecID → Member_Type",
    coveredBy: "cw_list_members, cw_get_member",
    notes:
      "Member_ID is the login identifier (e.g. jsmith) that time and ticket rows reference by string. Credential columns are denied to the reporting login, so SELECT * on this table fails — name your columns.",
  },
  Member_Type: { purpose: "Member types (Full, API, Contractor …)." },
  Time_Entry: {
    purpose: "Time entries, base table. Prefer v_rpt_time unless you need a raw key.",
    pk: "Time_RecID",
    joins: "Member_RecID → Member; SR_Service_RecID → SR_Service",
    coveredBy: "cw_list_my_time, cw_create_time_entry",
    size: "very large",
  },
  Time_Sheet: {
    purpose: "Timesheets — the weekly container time entries are submitted in.",
    joins: "Member_RecID → Member",
    coveredBy: "cw_list_my_timesheets, cw_submit_timesheet",
  },
  TE_Period: { purpose: "Time periods — the reporting weeks timesheets belong to." },
  TE_Status: { purpose: "Timesheet statuses (Open, Submitted, Approved …)." },
  AGR_Header: {
    purpose: "Agreements, base table — dates, cancellation and prepaid flags.",
    pk: "AGR_Header_RecID",
    keyColumns:
      "AGR_Header_RecID int, AGR_Name nvarchar, Company_RecID int, AGR_Type_RecID int, AGR_Date_End datetime, AGR_Date_Cancel datetime, AGR_Cancel_Flag bit, AGR_Reason_Cancel nvarchar, parent_recid int, PP_Time_Flag bit, PP_Expenses_Flag bit, PP_Products_Flag bit, PP_Amount money, PP_Carryover_Flag bit, CarryOver_Days int, Overrun_Limit money, Last_Update datetime",
    joins: "Company_RecID → Company; AGR_Type_RecID → AGR_Type; parent_recid → AGR_Header",
    coveredBy: "cw_list_agreements, cw_get_agreement",
    notes: "Active agreements are AGR_Cancel_Flag = 0. parent_recid makes agreements hierarchical.",
  },
  AGR_Detail: {
    purpose: "Agreement additions — the billable lines under an agreement.",
    joins: "AGR_Header_RecID → AGR_Header",
  },
  AGR_Type: { purpose: "Agreement types (Managed Services, Block Hours …)." },
  AGR_Invoice_Amt: { purpose: "Per-invoice agreement amounts — what an agreement billed, and when." },
  Billing_Log: {
    purpose: "Invoices, base table. v_rpt_invoices is the readable view over it.",
    pk: "Billing_Log_RecID",
    coveredBy: "cw_list_invoices, cw_get_invoice",
  },
  Billing_Status: { purpose: "Invoice statuses." },
  Billing_Terms: { purpose: "Payment terms (Net 30 …)." },
  Billing_Unit: { purpose: "Billing units — how work is grouped for invoicing." },
  Config: {
    purpose: "Configurations (devices and assets), base table.",
    pk: "Config_RecID",
    keyColumns:
      "Config_RecID int, Company_RecID int, Config_Name nvarchar, Config_Status_RecID int, Date_Purchased datetime, Date_Installed datetime, Date_Expiration datetime, Os_Type nvarchar, Os_Info nvarchar, Cpu_Speed nvarchar, RAM nvarchar, Last_Update datetime",
    joins: "Company_RecID → Company; Config_Status_RecID → Config_Status",
    coveredBy: "cw_list_configurations, cw_get_configuration",
  },
  Config_Status: { purpose: "Configuration statuses (Active, Inactive …)." },
  PM_Project: { purpose: "Projects — the container for project tickets and phases.", joins: "Company_RecID → Company" },
  PM_Phase: { purpose: "Project phases — the work breakdown under a project.", joins: "→ PM_Project" },
  PM_Status: { purpose: "Project statuses." },
  Phase_Status: { purpose: "Project phase statuses." },
  Schedule_Detail: {
    keywords: "schedule dispatch bookings appointments",
    purpose: "Schedule entries — who is booked on what, and when.",
    joins: "Member_RecID → Member",
    coveredBy: "cw_list_schedule_entries, cw_my_schedule, cw_schedule_ticket",
  },
  Schedule: { purpose: "Schedule headers, above Schedule_Detail." },
  Activities: {
    purpose: "Sales and service activities — calls, meetings and follow-ups.",
    joins: "Company_RecID → Company; Member_RecID → Member",
  },
  Activity_Type: { purpose: "Activity types." },
  SO_Opportunity: {
    purpose: "Sales opportunities, base table. v_rpt_Opportunity is the readable view.",
    joins: "Company_RecID → Company",
  },
  SO_Opp_Status: { purpose: "Opportunity statuses." },
  SO_Forecast_Dtl: { purpose: "Opportunity forecast detail — revenue split by category and period." },
  Order_Header: { purpose: "Sales orders." },
  Order_Status: { purpose: "Sales order statuses." },
  Purchase_Header: { purpose: "Purchase orders raised against vendors." },
  Purchase_Order_Status: { purpose: "Purchase order statuses." },
  IV_Product: { purpose: "Products placed on tickets, projects, opportunities and agreements." },
  IV_Class: { purpose: "Product classes." },
  Owner_Level: {
    keywords: "internal company division entity",
    purpose:
      "Internal owning entity — which of your own companies or divisions a record belongs to. Used to split reporting by internal company.",
    keyColumns: "Owner_Level_RecID int, Owner_Level_Name nvarchar",
  },
  Communication_Type: { purpose: "Communication types (Email, Phone, Fax …) for contact methods." },
  CS_Survey: { purpose: "Customer satisfaction surveys." },
};

/** The synthetic first entry: conventions, findable by ordinary search. */
export const CONVENTIONS = {
  schema: "(conventions)",
  name: "ConnectWise Manage schema conventions",
  purpose:
    "How the cwwebapp_* schema is laid out — read this before guessing a table or column name. Database names do NOT match the REST API names.",
  pk: "<Table>_RecID (int identity), e.g. SR_Service.SR_Service_RecID, AGR_Header.AGR_Header_RecID",
  keyColumns:
    "Foreign keys carry the target table's own key name, prefix included: SR_Service.SR_Board_RecID → SR_Board.SR_Board_RecID. " +
    "Flags are bit columns named *_Flag. Audit columns are Date_Entered / Entered_By / Last_Update / Updated_By, with UTC variants suffixed _UTC.",
  joins:
    "Start from a v_rpt_* view — they already join the lookups. Tickets: v_rpt_service (→ SR_Service). " +
    "Customers: v_rpt_company → v_rpt_contact. Staff: Member (Member_ID is the login string). " +
    "Time: v_rpt_time, joined to tickets on SR_Service_RecID and to agreements on Agr_Header_RecID. " +
    "Money: v_rpt_invoices (→ Billing_Log), v_rpt_agreementlist (→ AGR_Header → AGR_Detail).",
  notes:
    "Open ticket = date_closed IS NULL; there is no archive table. Companies carry Delete_Flag. " +
    "Agreements are cancelled via AGR_Cancel_Flag, not deleted. " +
    "This catalog lists key columns only — for a table's exact columns run " +
    "SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='v_rpt_service' ORDER BY ORDINAL_POSITION " +
    "through cw_db_query.",
};
