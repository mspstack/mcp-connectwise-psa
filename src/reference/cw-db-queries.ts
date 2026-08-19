/**
 * The saved-query core — generic ConnectWise reporting queries that ship with
 * the server.
 *
 * Instance-specific queries do not belong here: those go in the writable
 * overlay named by CW_DB_QUERY_LIBRARY, where cw_db_save_query puts them and
 * scripts/import-queries.mjs writes a BrightGauge export. This file is public,
 * so everything in it must be true of any ConnectWise Manage database.
 *
 * Placeholders are written {{like_this}} and substituted by the caller before
 * the statement is run — there is no binding layer.
 */

export interface SavedQuery {
  /** Identity and merge key: lower-case, hyphenated. */
  slug: string;
  title: string;
  /** What question it answers, not how it works — this is what search matches. */
  description: string;
  statement: string;
  tags?: string[];
  /** {{placeholder}} names the caller must substitute. */
  placeholders?: string[];
  /** Curated MCP tool that answers the same question more cheaply. */
  coveredBy?: string;
  source: "core" | "session" | "brightgauge";
  /** Overlay entries only. */
  savedAt?: string;
  /** Session label that saved it — overlay entries only. */
  savedBy?: string;
}

export const CW_DB_QUERY_CORE: SavedQuery[] = [
  {
    slug: "unbilled-time-by-company",
    title: "Unbilled billable time by company",
    description:
      "Billable hours logged but not yet on an invoice, grouped by customer — the backlog waiting to be billed.",
    statement: `SELECT TOP 100
       Company_Name,
       SUM(Billable_Hrs) AS Unbilled_Hours,
       COUNT(*)          AS Entries,
       MIN(Date_Start)   AS Oldest_Entry
FROM v_rpt_time
WHERE Invoice_Flag = 0
  AND Billable_Hrs > 0
  AND Date_Start >= '{{start_date}}'
GROUP BY Company_Name
ORDER BY Unbilled_Hours DESC`,
    tags: ["billing", "time", "unbilled", "finance"],
    placeholders: ["start_date"],
    coveredBy: "cw_list_unbilled_time",
    source: "core",
  },
  {
    slug: "open-tickets-by-board",
    title: "Open tickets by board",
    description: "How many tickets are open on each service board, and how old the oldest one is.",
    statement: `SELECT
       board_name,
       COUNT(*)                                      AS Open_Tickets,
       MIN(date_entered)                             AS Oldest_Entered,
       DATEDIFF(day, MIN(date_entered), GETDATE())   AS Oldest_Age_Days
FROM v_rpt_service
WHERE date_closed IS NULL
GROUP BY board_name
ORDER BY Open_Tickets DESC`,
    tags: ["tickets", "backlog", "board", "service"],
    coveredBy: "cw_search_tickets",
    source: "core",
  },
  {
    slug: "oldest-open-tickets",
    title: "Oldest open tickets",
    description: "The open tickets that have been sitting longest — the aging report.",
    statement: `SELECT TOP {{limit}}
       TicketNbr,
       company_name,
       summary,
       board_name,
       status_description,
       date_entered,
       DATEDIFF(day, date_entered, GETDATE()) AS Age_Days
FROM v_rpt_service
WHERE date_closed IS NULL
ORDER BY date_entered ASC`,
    tags: ["tickets", "aging", "backlog", "sla"],
    placeholders: ["limit"],
    source: "core",
  },
  {
    slug: "hours-by-member",
    title: "Hours logged per member for a date range",
    description:
      "Actual, billable and non-billable hours each technician logged between two dates — utilisation and timesheet review.",
    statement: `SELECT
       Member_ID,
       SUM(Hours_Actual)    AS Actual_Hours,
       SUM(Billable_Hrs)    AS Billable_Hours,
       SUM(NonBillable_Hrs) AS NonBillable_Hours,
       COUNT(*)             AS Entries
FROM v_rpt_time
WHERE Date_Start >= '{{start_date}}'
  AND Date_Start <  '{{end_date}}'
GROUP BY Member_ID
ORDER BY Actual_Hours DESC`,
    tags: ["time", "utilisation", "member", "timesheet"],
    placeholders: ["start_date", "end_date"],
    coveredBy: "cw_list_my_time",
    source: "core",
  },
  {
    slug: "agreements-expiring",
    title: "Agreements expiring soon",
    description: "Agreements with an end date inside the next N days — the renewal list.",
    statement: `SELECT
       AGR_Name,
       Company_Name,
       agr_type_desc,
       DateStart,
       DateEnd,
       Billing_Amount,
       DATEDIFF(day, GETDATE(), DateEnd) AS Days_Left
FROM v_rpt_agreementlist
WHERE DateEnd BETWEEN GETDATE() AND DATEADD(day, {{days}}, GETDATE())
ORDER BY DateEnd ASC`,
    tags: ["agreements", "renewals", "finance", "contracts"],
    placeholders: ["days"],
    coveredBy: "cw_list_agreements",
    source: "core",
  },
  {
    slug: "unpaid-invoices",
    title: "Unpaid invoices by age",
    description: "Invoices with no payment recorded, oldest first — the receivables list.",
    statement: `SELECT TOP 200
       Invoice_Number,
       Company_Name,
       Date_Invoice,
       Due_Date,
       Invoice_Amount,
       DATEDIFF(day, Due_Date, GETDATE()) AS Days_Overdue
FROM v_rpt_invoices
WHERE Date_Paid IS NULL
  AND Date_Invoice >= '{{start_date}}'
ORDER BY Due_Date ASC`,
    tags: ["invoices", "finance", "receivables", "unpaid"],
    placeholders: ["start_date"],
    coveredBy: "cw_list_invoices",
    source: "core",
  },
  {
    slug: "tickets-without-time",
    title: "Open tickets with no time logged",
    description:
      "Tickets open longer than N days that carry no time entries — untracked or stalled work.",
    statement: `SELECT TOP 100
       s.TicketNbr,
       s.company_name,
       s.summary,
       s.board_name,
       s.date_entered
FROM v_rpt_service s
WHERE s.date_closed IS NULL
  AND s.date_entered < DATEADD(day, -{{days}}, GETDATE())
  AND NOT EXISTS (
        SELECT 1 FROM v_rpt_time t
         WHERE t.SR_Service_RecID = s.SR_Service_RecID
      )
ORDER BY s.date_entered ASC`,
    tags: ["tickets", "time", "hygiene", "quality"],
    placeholders: ["days"],
    source: "core",
  },
  {
    slug: "configurations-expiring",
    title: "Configurations past or near expiry",
    description:
      "Devices whose warranty or expiry date falls inside the next N days — the hardware refresh list.",
    statement: `SELECT TOP 200
       Company_Name,
       Config_Name,
       Config_Type,
       Manufacturer,
       Serial_Number,
       Date_Expiration
FROM v_rpt_configuration
WHERE Date_Expiration IS NOT NULL
  AND Date_Expiration <= DATEADD(day, {{days}}, GETDATE())
ORDER BY Date_Expiration ASC`,
    tags: ["configurations", "warranty", "assets", "refresh"],
    placeholders: ["days"],
    coveredBy: "cw_list_configurations",
    source: "core",
  },
];
