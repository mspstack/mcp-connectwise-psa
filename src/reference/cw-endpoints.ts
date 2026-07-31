/**
 * Curated catalog of ConnectWise Manage REST endpoints, for cw_find_endpoint.
 *
 * GENERATED from a ConnectWise Manage OpenAPI spec (title "Connectwise Manage Public Endpoints", version 2026.4)
 * by scripts/gen-endpoints.mjs — DO NOT EDIT BY HAND. To refresh: obtain the
 * OpenAPI JSON and re-run the generator. `coveredBy` links to the curated tool
 * that already wraps an endpoint. /count and /info helper paths are dropped.
 */

export interface EndpointDoc {
  module: string;
  /** Path after `/apis/3.0`, e.g. "/procurement/purchaseorders". `{id}` marks a path param. */
  path: string;
  methods: string;
  summary: string;
  coveredBy?: string;
  /** Common condition/filter fields (hand-added for key endpoints). */
  keyParams?: string;
  /** Useful fields to request (hand-added for key endpoints). */
  commonFields?: string;
  notes?: string;
}

export const CW_ENDPOINTS: EndpointDoc[] = [
  {
    "module": "query grammar",
    "path": "(query params on any list endpoint)",
    "methods": "GET",
    "summary": "CW list queries: conditions (AND/OR; exact = for ids/names, 'contains' for text; dates as [2026-07-01T00:00:00Z]), childConditions, orderBy ('field asc|desc'), fields (comma list — always pass this), page, pageSize (max 1000). String values are single-quoted, e.g. status/name=\"New\"."
  },
  {
    "module": "AddressFormats",
    "path": "/company/addressFormats",
    "methods": "GET, POST",
    "summary": "Get List of AddressFormat"
  },
  {
    "module": "AddressFormats",
    "path": "/company/addressFormats/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get AddressFormat"
  },
  {
    "module": "CommunicationTypes",
    "path": "/company/communicationTypes",
    "methods": "GET, POST",
    "summary": "Get List of CommunicationType"
  },
  {
    "module": "CommunicationTypes",
    "path": "/company/communicationTypes/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get CommunicationType"
  },
  {
    "module": "CommunicationTypes",
    "path": "/company/communicationTypes/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "CommunicationTypes",
    "path": "/company/communicationTypes/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "Companies",
    "path": "/company/companies",
    "methods": "GET, POST",
    "summary": "Companies (customers / vendors).",
    "coveredBy": "cw_search_companies, cw_get_company",
    "keyParams": "identifier, name, status/name, types/id",
    "commonFields": "id,identifier,name,status/name,phoneNumber,website"
  },
  {
    "module": "Companies",
    "path": "/company/companies/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get v2015_3.Company.Company.Company"
  },
  {
    "module": "Companies",
    "path": "/company/companies/{id}/merge",
    "methods": "POST",
    "summary": "Post SuccessResponse"
  },
  {
    "module": "Companies",
    "path": "/company/companies/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "Companies",
    "path": "/company/companies/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "CompanyCustomNotes",
    "path": "/company/companies/{parentId}/customStatusNotes",
    "methods": "GET, POST",
    "summary": "Get List of CompanyCustomNote"
  },
  {
    "module": "CompanyCustomNotes",
    "path": "/company/companies/{parentId}/customStatusNotes/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get CompanyCustomNote"
  },
  {
    "module": "CompanyGroups",
    "path": "/company/companies/{parentId}/groups",
    "methods": "GET, POST",
    "summary": "Get List of CompanyGroup"
  },
  {
    "module": "CompanyGroups",
    "path": "/company/companies/{parentId}/groups/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get CompanyGroup"
  },
  {
    "module": "ManagementReportNotifications",
    "path": "/company/companies/{parentId}/managementReportNotifications",
    "methods": "GET, POST",
    "summary": "Get List of ManagementReportNotification"
  },
  {
    "module": "ManagementReportNotifications",
    "path": "/company/companies/{parentId}/managementReportNotifications/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ManagementReportNotification"
  },
  {
    "module": "ManagementReportSetups",
    "path": "/company/companies/{parentId}/managementReportSetup",
    "methods": "GET, POST",
    "summary": "Get List of ManagementReportSetup"
  },
  {
    "module": "ManagementReportSetups",
    "path": "/company/companies/{parentId}/managementReportSetup/{id}",
    "methods": "PATCH, PUT",
    "summary": "Patch ManagementReportSetup"
  },
  {
    "module": "CompanyManagementSummarys",
    "path": "/company/companies/{parentId}/managementSummaryReports",
    "methods": "GET, POST",
    "summary": "Get List of CompanyManagementSummary"
  },
  {
    "module": "CompanyManagementSummarys",
    "path": "/company/companies/{parentId}/managementSummaryReports/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get CompanyManagementSummary"
  },
  {
    "module": "CompanyNotes",
    "path": "/company/companies/{parentId}/notes",
    "methods": "GET, POST",
    "summary": "Get List of CompanyNote"
  },
  {
    "module": "CompanyNotes",
    "path": "/company/companies/{parentId}/notes/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get CompanyNote"
  },
  {
    "module": "CompanyServiceTemplates",
    "path": "/company/companies/{parentId}/serviceTemplates",
    "methods": "GET, POST",
    "summary": "Get List of CompanyServiceTemplate"
  },
  {
    "module": "CompanyServiceTemplates",
    "path": "/company/companies/{parentId}/serviceTemplates/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get a specific CompanyServiceTemplate"
  },
  {
    "module": "CompanyServiceTemplates",
    "path": "/company/companies/{parentId}/serviceTemplates/{id}/copy",
    "methods": "POST",
    "summary": "Create a Copied CompanyServiceTemplate"
  },
  {
    "module": "CompanyServiceTemplates",
    "path": "/company/companies/{parentId}/serviceTemplates/{id}/generate",
    "methods": "POST",
    "summary": "Post Count of CompanyServiceTemplate"
  },
  {
    "module": "CompanyServiceTemplates",
    "path": "/company/companies/{parentId}/serviceTemplates/{id}/link",
    "methods": "POST",
    "summary": "Create a Linked CompanyServiceTemplate"
  },
  {
    "module": "CompanyServiceTemplates",
    "path": "/company/companies/{parentId}/serviceTemplates/{id}/unlink",
    "methods": "POST",
    "summary": "Unlink a CompanyServiceTemplate"
  },
  {
    "module": "CompanySites",
    "path": "/company/companies/{parentId}/sites",
    "methods": "GET, POST",
    "summary": "Get List of CompanySite"
  },
  {
    "module": "CompanySites",
    "path": "/company/companies/{parentId}/sites/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get CompanySite"
  },
  {
    "module": "CompanySites",
    "path": "/company/companies/{parentId}/sites/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "CompanySites",
    "path": "/company/companies/{parentId}/sites/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "CompanyTeams",
    "path": "/company/companies/{parentId}/teams",
    "methods": "GET, POST",
    "summary": "Get List of CompanyTeam"
  },
  {
    "module": "CompanyTeams",
    "path": "/company/companies/{parentId}/teams/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get CompanyTeam"
  },
  {
    "module": "CompanyTracks",
    "path": "/company/companies/{parentId}/tracks",
    "methods": "GET, POST",
    "summary": "Get List of ContactTrack"
  },
  {
    "module": "CompanyTracks",
    "path": "/company/companies/{parentId}/tracks/{id}",
    "methods": "GET, DELETE",
    "summary": "Get ContactTrack"
  },
  {
    "module": "CompanyCompanyTypeAssociations",
    "path": "/company/companies/{parentId}/typeAssociations",
    "methods": "GET, POST",
    "summary": "Get List of CompanyTypeAssociation"
  },
  {
    "module": "CompanyCompanyTypeAssociations",
    "path": "/company/companies/{parentId}/typeAssociations/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get CompanyTypeAssociation"
  },
  {
    "module": "Companies",
    "path": "/company/companies/default",
    "methods": "GET",
    "summary": "Get v2015_3.Company.Company.Company"
  },
  {
    "module": "CompanyTypeInfos",
    "path": "/company/companies/info/types",
    "methods": "GET",
    "summary": "Get List of CompanyTypeInfo"
  },
  {
    "module": "CompanyTypeInfos",
    "path": "/company/companies/info/types/{id}",
    "methods": "GET",
    "summary": "Get CompanyTypeInfo"
  },
  {
    "module": "CompanyStatuses",
    "path": "/company/companies/statuses",
    "methods": "GET, POST",
    "summary": "Get List of CompanyStatus"
  },
  {
    "module": "CompanyStatuses",
    "path": "/company/companies/statuses/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get CompanyStatus"
  },
  {
    "module": "CompanyStatuses",
    "path": "/company/companies/statuses/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "CompanyStatuses",
    "path": "/company/companies/statuses/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "CompanyTypes",
    "path": "/company/companies/types",
    "methods": "GET, POST",
    "summary": "Get List of CompanyType"
  },
  {
    "module": "CompanyTypes",
    "path": "/company/companies/types/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get CompanyType"
  },
  {
    "module": "CompanyTypes",
    "path": "/company/companies/types/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "CompanyTypes",
    "path": "/company/companies/types/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "CompanyPickerItems",
    "path": "/company/companyPickerItems",
    "methods": "GET, POST",
    "summary": "Get List of CompanyPickerItem"
  },
  {
    "module": "CompanyPickerItems",
    "path": "/company/companyPickerItems/{id}",
    "methods": "GET, DELETE",
    "summary": "Get CompanyPickerItem"
  },
  {
    "module": "CompanyPickerItems",
    "path": "/company/companyPickerItems/clear",
    "methods": "POST",
    "summary": "Post ClearPickerRequest"
  },
  {
    "module": "CompanyTypeAssociations",
    "path": "/company/companyTypeAssociations",
    "methods": "GET, POST",
    "summary": "Get List of CompanyTypeAssociation"
  },
  {
    "module": "CompanyTypeAssociations",
    "path": "/company/companyTypeAssociations/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get CompanyTypeAssociation"
  },
  {
    "module": "Configurations",
    "path": "/company/configurations",
    "methods": "GET, POST",
    "summary": "Configurations (devices / assets): serials, IPs, OS, warranty.",
    "coveredBy": "cw_list_configurations, cw_get_configuration",
    "keyParams": "company/id, type/name, status/name, name",
    "commonFields": "id,name,type/name,status/name,company/name,serialNumber,ipAddress,osType"
  },
  {
    "module": "Configurations",
    "path": "/company/configurations/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Configuration"
  },
  {
    "module": "Configurations",
    "path": "/company/configurations/{id}/changeType",
    "methods": "PATCH",
    "summary": "Patch Configuration"
  },
  {
    "module": "Configurations",
    "path": "/company/configurations/bulk",
    "methods": "POST, PUT, DELETE",
    "summary": "Post Configuration"
  },
  {
    "module": "ConfigurationStatuses",
    "path": "/company/configurations/statuses",
    "methods": "GET, POST",
    "summary": "Get List of ConfigurationStatus"
  },
  {
    "module": "ConfigurationStatuses",
    "path": "/company/configurations/statuses/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ConfigurationStatus"
  },
  {
    "module": "ConfigurationStatuses",
    "path": "/company/configurations/statuses/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "ConfigurationStatuses",
    "path": "/company/configurations/statuses/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "ConfigurationTypes",
    "path": "/company/configurations/types",
    "methods": "GET, POST",
    "summary": "Get List of ConfigurationType"
  },
  {
    "module": "ConfigurationTypeQuestionValues",
    "path": "/company/configurations/types/{grandparentId}/questions/{parentId}/values",
    "methods": "GET, POST",
    "summary": "Get List of ConfigurationTypeQuestionValue"
  },
  {
    "module": "ConfigurationTypeQuestionValues",
    "path": "/company/configurations/types/{grandparentId}/questions/{parentId}/values/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ConfigurationTypeQuestionValue"
  },
  {
    "module": "ConfigurationTypeQuestionValues",
    "path": "/company/configurations/types/{grandparentId}/questions/{parentId}/values/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "ConfigurationTypeQuestionValues",
    "path": "/company/configurations/types/{grandparentId}/questions/{parentId}/values/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "ConfigurationTypes",
    "path": "/company/configurations/types/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ConfigurationType"
  },
  {
    "module": "ConfigurationTypes",
    "path": "/company/configurations/types/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "ConfigurationTypes",
    "path": "/company/configurations/types/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "ConfigurationTypeQuestions",
    "path": "/company/configurations/types/{parentId}/questions",
    "methods": "GET, POST",
    "summary": "Get List of ConfigurationTypeQuestion"
  },
  {
    "module": "ConfigurationTypeQuestions",
    "path": "/company/configurations/types/{parentId}/questions/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ConfigurationTypeQuestion"
  },
  {
    "module": "ConfigurationTypeQuestions",
    "path": "/company/configurations/types/{parentId}/questions/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "ConfigurationTypeQuestions",
    "path": "/company/configurations/types/{parentId}/questions/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "ConfigurationTypes",
    "path": "/company/configurations/types/copy",
    "methods": "POST",
    "summary": "Post Board"
  },
  {
    "module": "Contact Types",
    "path": "/company/contact/types/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "Contacts",
    "path": "/company/contacts",
    "methods": "GET, POST",
    "summary": "Contacts.",
    "coveredBy": "cw_search_contacts, cw_get_contact",
    "keyParams": "company/id, firstName, lastName, inactiveFlag",
    "commonFields": "id,firstName,lastName,title,company/name,communicationItems"
  },
  {
    "module": "Contacts",
    "path": "/company/contacts/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ApiContact"
  },
  {
    "module": "Contacts",
    "path": "/company/contacts/{id}/image",
    "methods": "GET",
    "summary": "Get ValidatePortalResponse"
  },
  {
    "module": "Contacts",
    "path": "/company/contacts/{id}/portalSecurity",
    "methods": "GET",
    "summary": "Get List of PortalSecurity"
  },
  {
    "module": "Contacts",
    "path": "/company/contacts/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "Contacts",
    "path": "/company/contacts/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "ContactCommunications",
    "path": "/company/contacts/{parentId}/communications",
    "methods": "GET, POST",
    "summary": "Get List of ContactCommunication"
  },
  {
    "module": "ContactCommunications",
    "path": "/company/contacts/{parentId}/communications/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ContactCommunication"
  },
  {
    "module": "ContactGroups",
    "path": "/company/contacts/{parentId}/groups",
    "methods": "GET, POST",
    "summary": "Get List of ContactGroup"
  },
  {
    "module": "ContactGroups",
    "path": "/company/contacts/{parentId}/groups/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ContactGroup"
  },
  {
    "module": "ContactNotes",
    "path": "/company/contacts/{parentId}/notes",
    "methods": "GET, POST",
    "summary": "Get List of ContactNote"
  },
  {
    "module": "ContactNotes",
    "path": "/company/contacts/{parentId}/notes/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ContactNote"
  },
  {
    "module": "ContactTracks",
    "path": "/company/contacts/{parentId}/tracks",
    "methods": "GET, POST",
    "summary": "Get List of ContactTrack"
  },
  {
    "module": "ContactTracks",
    "path": "/company/contacts/{parentId}/tracks/{id}",
    "methods": "GET, DELETE",
    "summary": "Get ContactTrack"
  },
  {
    "module": "ContactContactTypeAssociations",
    "path": "/company/contacts/{parentId}/typeAssociations",
    "methods": "GET, POST",
    "summary": "Get List of ContactTypeAssociation"
  },
  {
    "module": "ContactContactTypeAssociations",
    "path": "/company/contacts/{parentId}/typeAssociations/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ContactTypeAssociation"
  },
  {
    "module": "Contacts",
    "path": "/company/contacts/default",
    "methods": "GET",
    "summary": "Get ApiContact"
  },
  {
    "module": "ContactDepartments",
    "path": "/company/contacts/departments",
    "methods": "GET, POST",
    "summary": "Get List of ContactDepartment"
  },
  {
    "module": "ContactDepartments",
    "path": "/company/contacts/departments/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ContactDepartment"
  },
  {
    "module": "ContactDepartments",
    "path": "/company/contacts/departments/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "ContactDepartments",
    "path": "/company/contacts/departments/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "ContactRelationships",
    "path": "/company/contacts/relationships",
    "methods": "GET, POST",
    "summary": "Get List of ContactRelationship"
  },
  {
    "module": "ContactRelationships",
    "path": "/company/contacts/relationships/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ContactRelationship"
  },
  {
    "module": "Contacts",
    "path": "/company/contacts/requestPassword",
    "methods": "POST",
    "summary": "Post PortalSecurity"
  },
  {
    "module": "ContactTypes",
    "path": "/company/contacts/types",
    "methods": "GET, POST",
    "summary": "Get List of ContactType"
  },
  {
    "module": "ContactTypes",
    "path": "/company/contacts/types/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ContactType"
  },
  {
    "module": "Contacts",
    "path": "/company/contacts/validatePortalCredentials",
    "methods": "POST",
    "summary": "Post ValidatePortalResponse"
  },
  {
    "module": "ContactTypeAssociations",
    "path": "/company/contactTypeAssociations",
    "methods": "GET, POST",
    "summary": "Get List of ContactTypeAssociation"
  },
  {
    "module": "ContactTypeAssociations",
    "path": "/company/contactTypeAssociations/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ContactTypeAssociation"
  },
  {
    "module": "Countries",
    "path": "/company/countries",
    "methods": "GET, POST",
    "summary": "Get List of"
  },
  {
    "module": "Countries",
    "path": "/company/countries/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Count of"
  },
  {
    "module": "EntityTypes",
    "path": "/company/entityTypes",
    "methods": "GET",
    "summary": "Get List of EntityType"
  },
  {
    "module": "EntityTypes",
    "path": "/company/entityTypes/{id}",
    "methods": "GET",
    "summary": "Get EntityType"
  },
  {
    "module": "M365Contacts",
    "path": "/company/m365contact",
    "methods": "GET",
    "summary": "Get List of M365Contacts"
  },
  {
    "module": "M365Contacts",
    "path": "/company/m365contact/{id}",
    "methods": "GET",
    "summary": "Get M365Contacts"
  },
  {
    "module": "M365ContactSyncProperties",
    "path": "/company/m365contactsync/{id}/property",
    "methods": "GET",
    "summary": "Get M365ContactSyncProperties"
  },
  {
    "module": "M365ContactSyncProperties",
    "path": "/company/m365contactsync/property",
    "methods": "POST",
    "summary": "Create M365ContactSyncProperty"
  },
  {
    "module": "M365ContactSyncProperties",
    "path": "/company/m365contactsync/property/",
    "methods": "DELETE",
    "summary": "Delete M365ContactSyncProperty"
  },
  {
    "module": "M365ContactSyncProperties",
    "path": "/company/m365contactsync/property/excluded",
    "methods": "GET",
    "summary": "Get List of M365ContactSyncPropertiesExcluded"
  },
  {
    "module": "M365ContactSyncProperties",
    "path": "/company/m365contactsync/property/included",
    "methods": "GET",
    "summary": "Get List of M365ContactSyncPropertiesIncluded"
  },
  {
    "module": "ManagedDevicesIntegrations",
    "path": "/company/managedDevicesIntegrations",
    "methods": "GET, POST",
    "summary": "Get List of ManagedDevicesIntegration"
  },
  {
    "module": "ManagedDevicesIntegrations",
    "path": "/company/managedDevicesIntegrations/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ManagedDevicesIntegration"
  },
  {
    "module": "ManagedDevicesIntegrations",
    "path": "/company/managedDevicesIntegrations/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "ManagedDevicesIntegrations",
    "path": "/company/managedDevicesIntegrations/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "ManagedDevicesIntegrationCrossReferences",
    "path": "/company/managedDevicesIntegrations/{parentId}/crossReferences",
    "methods": "GET, POST",
    "summary": "Get List of ManagedDevicesIntegrationCrossReference"
  },
  {
    "module": "ManagedDevicesIntegrationCrossReferences",
    "path": "/company/managedDevicesIntegrations/{parentId}/crossReferences/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ManagedDevicesIntegrationCrossReference"
  },
  {
    "module": "ManagedDevicesIntegrationLogins",
    "path": "/company/managedDevicesIntegrations/{parentId}/logins",
    "methods": "GET, POST",
    "summary": "Get List of ManagedDevicesIntegrationLogin"
  },
  {
    "module": "ManagedDevicesIntegrationLogins",
    "path": "/company/managedDevicesIntegrations/{parentId}/logins/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ManagedDevicesIntegrationLogin"
  },
  {
    "module": "ManagedDevicesIntegrationNotifications",
    "path": "/company/managedDevicesIntegrations/{parentId}/notifications",
    "methods": "GET, POST",
    "summary": "Get List of ManagedDevicesIntegrationNotification"
  },
  {
    "module": "ManagedDevicesIntegrationNotifications",
    "path": "/company/managedDevicesIntegrations/{parentId}/notifications/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ManagedDevicesIntegrationNotification"
  },
  {
    "module": "Managements",
    "path": "/company/management",
    "methods": "GET",
    "summary": "Get List of Management"
  },
  {
    "module": "Managements",
    "path": "/company/management/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get Management"
  },
  {
    "module": "ManagementExecuteManagedItSyncs",
    "path": "/company/management/{id}/executeManagedItSync",
    "methods": "POST",
    "summary": "Post SuccessResponse"
  },
  {
    "module": "ManagementLogs",
    "path": "/company/management/{id}/log/download",
    "methods": "GET",
    "summary": "Get ManagementLogDocumentInfo"
  },
  {
    "module": "ManagementLogs",
    "path": "/company/management/{id}/logs",
    "methods": "GET",
    "summary": "Get List of ManagementLogDocumentInfo"
  },
  {
    "module": "ManagementReportNotifications",
    "path": "/company/management/{parentId}/managementReportNotifications",
    "methods": "GET, POST",
    "summary": "Get List of ManagementReportNotification"
  },
  {
    "module": "ManagementReportNotifications",
    "path": "/company/management/{parentId}/managementReportNotifications/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ManagementReportNotification"
  },
  {
    "module": "ManagementBackup",
    "path": "/company/managementBackups",
    "methods": "GET, POST",
    "summary": "Get List of ManagementBackup"
  },
  {
    "module": "ManagementBackup",
    "path": "/company/managementBackups/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ManagementBackup"
  },
  {
    "module": "ManagementItSolutions",
    "path": "/company/managementItSolutions",
    "methods": "GET, POST",
    "summary": "Get List of ManagementItSolution"
  },
  {
    "module": "ManagementItSolutions",
    "path": "/company/managementItSolutions/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ManagementItSolution"
  },
  {
    "module": "ManagementItSolutions",
    "path": "/company/managementItSolutions/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "ManagementItSolutions",
    "path": "/company/managementItSolutions/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "ManagementItSolutionAgreementInterfaceParameters",
    "path": "/company/managementItSolutions/{parentId}/managementProducts",
    "methods": "GET, POST",
    "summary": "Get List of ManagementItSolutionAgreementInterfaceParameter"
  },
  {
    "module": "ManagementItSolutionAgreementInterfaceParameters",
    "path": "/company/managementItSolutions/{parentId}/managementProducts/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ManagementItSolutionAgreementInterfaceParameter"
  },
  {
    "module": "CompanyMarketDescription",
    "path": "/company/marketDescriptions",
    "methods": "GET, POST",
    "summary": "Get List of MarketDescription"
  },
  {
    "module": "CompanyMarketDescription",
    "path": "/company/marketDescriptions/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get MarketDescription"
  },
  {
    "module": "CompanyMarketDescription",
    "path": "/company/marketDescriptions/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "CompanyMarketDescription",
    "path": "/company/marketDescriptions/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "CompanyNoteTypes",
    "path": "/company/noteTypes",
    "methods": "GET, POST",
    "summary": "Get List of CompanyNoteType"
  },
  {
    "module": "CompanyNoteTypes",
    "path": "/company/noteTypes/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get CompanyNoteType"
  },
  {
    "module": "CompanyOwnershipType",
    "path": "/company/ownershipTypes",
    "methods": "GET, POST",
    "summary": "Get List of OwnershipType"
  },
  {
    "module": "CompanyOwnershipType",
    "path": "/company/ownershipTypes/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get OwnershipType"
  },
  {
    "module": "PortalConfigurations",
    "path": "/company/portalConfigurations",
    "methods": "GET, POST",
    "summary": "Get List of PortalConfiguration"
  },
  {
    "module": "PortalConfigurations",
    "path": "/company/portalConfigurations/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get PortalConfiguration"
  },
  {
    "module": "PortalConfigurationsInvoiceSetups",
    "path": "/company/portalConfigurations/{parentId}/invoiceSetups",
    "methods": "GET",
    "summary": "Get List of PortalConfigurationInvoiceSetup"
  },
  {
    "module": "PortalConfigurationsInvoiceSetups",
    "path": "/company/portalConfigurations/{parentId}/invoiceSetups/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get PortalConfigurationInvoiceSetup"
  },
  {
    "module": "PortalConfigurationsInvoiceSetups",
    "path": "/company/portalConfigurations/{parentId}/invoiceSetups/{id}/testTransaction",
    "methods": "POST",
    "summary": "Post SuccessResponse"
  },
  {
    "module": "PortalConfigurationOpportunitySetups",
    "path": "/company/portalConfigurations/{parentId}/opportunitySetups",
    "methods": "GET, PATCH, PUT",
    "summary": "Get List of PortalConfigurationOpportunitySetup"
  },
  {
    "module": "PortalConfigurationOpportunitySetups",
    "path": "/company/portalConfigurations/{parentId}/opportunitySetups/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get PortalConfigurationOpportunitySetup"
  },
  {
    "module": "PortalConfigurationPasswordEmailSetups",
    "path": "/company/portalConfigurations/{parentId}/passwordEmailSetups",
    "methods": "GET",
    "summary": "Get List of PortalConfigurationPasswordEmailSetup"
  },
  {
    "module": "PortalConfigurationPasswordEmailSetups",
    "path": "/company/portalConfigurations/{parentId}/passwordEmailSetups/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get PortalConfigurationPasswordEmailSetup"
  },
  {
    "module": "PortalConfigurationProjectSetups",
    "path": "/company/portalConfigurations/{parentId}/projectSetups",
    "methods": "GET",
    "summary": "Get List of PortalConfigurationProjectSetup"
  },
  {
    "module": "PortalConfigurationProjectSetups",
    "path": "/company/portalConfigurations/{parentId}/projectSetups/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get PortalConfigurationProjectSetup"
  },
  {
    "module": "PortalConfigurationServiceSetups",
    "path": "/company/portalConfigurations/{parentId}/serviceSetups",
    "methods": "GET",
    "summary": "Get List of PortalConfigurationServiceSetup"
  },
  {
    "module": "PortalConfigurationServiceSetups",
    "path": "/company/portalConfigurations/{parentId}/serviceSetups/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get PortalConfigurationServiceSetup"
  },
  {
    "module": "PortalConfigurations",
    "path": "/company/portalConfigurations/copy",
    "methods": "POST",
    "summary": "Post PortalConfiguration"
  },
  {
    "module": "PortalConfigurationPaymentProcessors",
    "path": "/company/portalConfigurations/invoiceSetup/paymentProcessors",
    "methods": "GET",
    "summary": "Get List of PortalConfigurationPaymentProcessor"
  },
  {
    "module": "PortalConfigurationPaymentProcessors",
    "path": "/company/portalConfigurations/invoiceSetup/paymentProcessors/{id}",
    "methods": "GET",
    "summary": "Get PortalConfigurationPaymentProcessor"
  },
  {
    "module": "PortalSecurityLevels",
    "path": "/company/portalSecurityLevels",
    "methods": "GET",
    "summary": "Get List of PortalSecurityLevel"
  },
  {
    "module": "PortalSecurityLevels",
    "path": "/company/portalSecurityLevels/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get PortalSecurityLevel"
  },
  {
    "module": "PortalSecuritySettings",
    "path": "/company/portalSecuritySettings",
    "methods": "GET",
    "summary": "Get List of PortalSecuritySetting"
  },
  {
    "module": "PortalSecuritySettings",
    "path": "/company/portalSecuritySettings/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get PortalSecuritySetting"
  },
  {
    "module": "States",
    "path": "/company/states",
    "methods": "GET, POST",
    "summary": "Get List of State"
  },
  {
    "module": "States",
    "path": "/company/states/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get State"
  },
  {
    "module": "States",
    "path": "/company/states/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "States",
    "path": "/company/states/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "CompanyTeamRole",
    "path": "/company/teamRoles",
    "methods": "GET, POST",
    "summary": "Get List of TeamRole"
  },
  {
    "module": "CompanyTeamRole",
    "path": "/company/teamRoles/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get TeamRole"
  },
  {
    "module": "CompanyTeamRole",
    "path": "/company/teamRoles/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "CompanyTeamRole",
    "path": "/company/teamRoles/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "Tracks",
    "path": "/company/tracks",
    "methods": "GET, POST",
    "summary": "Get List of Track"
  },
  {
    "module": "Tracks",
    "path": "/company/tracks/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Track"
  },
  {
    "module": "TrackActions",
    "path": "/company/tracks/{parentId}/actions",
    "methods": "GET, POST",
    "summary": "Get List of TrackAction"
  },
  {
    "module": "TrackActions",
    "path": "/company/tracks/{parentId}/actions/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get TrackAction"
  },
  {
    "module": "Classifications",
    "path": "/expense/classifications",
    "methods": "GET",
    "summary": "Get List of Classification"
  },
  {
    "module": "Classifications",
    "path": "/expense/classifications/{id}",
    "methods": "GET",
    "summary": "Get Classification"
  },
  {
    "module": "ExpenseEntries",
    "path": "/expense/entries",
    "methods": "GET, POST",
    "summary": "Get List of ExpenseEntry"
  },
  {
    "module": "ExpenseEntries",
    "path": "/expense/entries/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ExpenseEntry"
  },
  {
    "module": "ExpenseEntryAudits",
    "path": "/expense/entries/{parentId}/audits",
    "methods": "GET",
    "summary": "Get List of ExpenseEntryAudit"
  },
  {
    "module": "ExpenseEntryAudits",
    "path": "/expense/entries/{parentId}/audits/{id}",
    "methods": "GET",
    "summary": "Get ExpenseEntryAudit"
  },
  {
    "module": "ExpenseTaxTypeInfos",
    "path": "/expense/info/taxTypes",
    "methods": "GET",
    "summary": "Get List of ExpenseTaxTypeInfo"
  },
  {
    "module": "ExpenseTaxTypeInfos",
    "path": "/expense/info/taxTypes/{id}",
    "methods": "GET",
    "summary": "Get ExpenseTaxTypeInfo"
  },
  {
    "module": "PaymentTypes",
    "path": "/expense/paymentTypes",
    "methods": "GET, POST",
    "summary": "Get List of PaymentType"
  },
  {
    "module": "PaymentTypes",
    "path": "/expense/paymentTypes/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get PaymentType"
  },
  {
    "module": "ExpenseReports",
    "path": "/expense/reports",
    "methods": "GET",
    "summary": "Get List of ExpenseReport"
  },
  {
    "module": "ExpenseReports",
    "path": "/expense/reports/{id}",
    "methods": "GET",
    "summary": "Get ExpenseReport"
  },
  {
    "module": "ExpenseReports",
    "path": "/expense/reports/{id}/approve",
    "methods": "POST",
    "summary": "Post SuccessResponse"
  },
  {
    "module": "ExpenseReports",
    "path": "/expense/reports/{id}/reject",
    "methods": "POST",
    "summary": "Post SuccessResponse"
  },
  {
    "module": "ExpenseReports",
    "path": "/expense/reports/{id}/reverse",
    "methods": "POST",
    "summary": "Post SuccessResponse"
  },
  {
    "module": "ExpenseReports",
    "path": "/expense/reports/{id}/submit",
    "methods": "POST",
    "summary": "Post SuccessResponse"
  },
  {
    "module": "ExpenseReportAudits",
    "path": "/expense/reports/{parentId}/audits",
    "methods": "GET",
    "summary": "Get List of ExpenseReportAudit"
  },
  {
    "module": "ExpenseReportAudits",
    "path": "/expense/reports/{parentId}/audits/{id}",
    "methods": "GET",
    "summary": "Get ExpenseReportAudit"
  },
  {
    "module": "ExpenseTypes",
    "path": "/expense/types",
    "methods": "GET, POST",
    "summary": "Get List of ExpenseType"
  },
  {
    "module": "ExpenseTypes",
    "path": "/expense/types/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ExpenseType"
  },
  {
    "module": "AccountingBatches",
    "path": "/finance/accounting/batches",
    "methods": "GET, POST",
    "summary": "Get List of AccountingBatch"
  },
  {
    "module": "AccountingBatches",
    "path": "/finance/accounting/batches/{id}",
    "methods": "GET, DELETE",
    "summary": "Get AccountingBatch"
  },
  {
    "module": "AccountingBatches",
    "path": "/finance/accounting/batches/{id}/export",
    "methods": "POST",
    "summary": "Post GLExport"
  },
  {
    "module": "BatchEntries",
    "path": "/finance/accounting/batches/{parentId}/entries",
    "methods": "GET",
    "summary": "Get List of BatchEntry"
  },
  {
    "module": "BatchEntries",
    "path": "/finance/accounting/batches/{parentId}/entries/{id}",
    "methods": "GET",
    "summary": "Get BatchEntry"
  },
  {
    "module": "AccountingBatches",
    "path": "/finance/accounting/export",
    "methods": "POST",
    "summary": "Post GLExport"
  },
  {
    "module": "AccountingUnpostedExpenses",
    "path": "/finance/accounting/unpostedexpenses",
    "methods": "GET",
    "summary": "Get List of UnpostedExpense"
  },
  {
    "module": "AccountingUnpostedExpenses",
    "path": "/finance/accounting/unpostedexpenses/{id}",
    "methods": "GET",
    "summary": "Get UnpostedExpense"
  },
  {
    "module": "AccountingUnpostedExpenseTaxableLevels",
    "path": "/finance/accounting/unpostedexpenses/{parentId}/taxableLevels",
    "methods": "GET",
    "summary": "Get List of UnpostedExpenseTaxableLevel"
  },
  {
    "module": "AccountingUnpostedExpenseTaxableLevels",
    "path": "/finance/accounting/unpostedexpenses/{parentId}/taxableLevels/{id}",
    "methods": "GET",
    "summary": "Get UnpostedExpenseTaxableLevel"
  },
  {
    "module": "AccountingUnpostedInvoices",
    "path": "/finance/accounting/unpostedinvoices",
    "methods": "GET",
    "summary": "Get List of UnpostedInvoice"
  },
  {
    "module": "AccountingUnpostedInvoices",
    "path": "/finance/accounting/unpostedinvoices/{id}",
    "methods": "GET",
    "summary": "Get UnpostedInvoice"
  },
  {
    "module": "AccountingUnpostedInvoiceTaxableLevels",
    "path": "/finance/accounting/unpostedinvoices/{parentId}/taxableLevels",
    "methods": "GET",
    "summary": "Get List of UnpostedInvoiceTaxableLevel"
  },
  {
    "module": "AccountingUnpostedInvoiceTaxableLevels",
    "path": "/finance/accounting/unpostedinvoices/{parentId}/taxableLevels/{id}",
    "methods": "GET",
    "summary": "Get UnpostedInvoiceTaxableLevel"
  },
  {
    "module": "AccountingUnpostedPayments",
    "path": "/finance/accounting/unpostedpayments",
    "methods": "GET",
    "summary": "Get List of UnpostedPayments"
  },
  {
    "module": "AccountingUnpostedPayments",
    "path": "/finance/accounting/unpostedPayments/{id}",
    "methods": "GET",
    "summary": "Get UnpostedPayments"
  },
  {
    "module": "AccountingUnpostedProcurements",
    "path": "/finance/accounting/unpostedprocurement",
    "methods": "GET",
    "summary": "Get List of UnpostedProcurement"
  },
  {
    "module": "AccountingUnpostedProcurements",
    "path": "/finance/accounting/unpostedprocurement/{id}",
    "methods": "GET",
    "summary": "Get UnpostedProcurement"
  },
  {
    "module": "AccountingUnpostedProcurementTaxableLevels",
    "path": "/finance/accounting/unpostedprocurement/{parentId}/taxableLevels",
    "methods": "GET",
    "summary": "Get List of UnpostedProcurementTaxableLevel"
  },
  {
    "module": "AccountingUnpostedProcurementTaxableLevels",
    "path": "/finance/accounting/unpostedprocurement/{parentId}/taxableLevels/{id}",
    "methods": "GET",
    "summary": "Get UnpostedProcurementTaxableLevel"
  },
  {
    "module": "AccountingPackages",
    "path": "/finance/accountingPackages",
    "methods": "GET",
    "summary": "Get List of AccountingPackage"
  },
  {
    "module": "AccountingPackages",
    "path": "/finance/accountingPackages/{id}",
    "methods": "GET",
    "summary": "Get AccountingPackage"
  },
  {
    "module": "AccountingPackageSetups",
    "path": "/finance/accountingPackageSetup",
    "methods": "GET",
    "summary": "Get List of AccountingPackageSetup"
  },
  {
    "module": "AccountingPackageSetups",
    "path": "/finance/accountingPackageSetup/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get AccountingPackageSetup"
  },
  {
    "module": "AgreementRecaps",
    "path": "/finance/agreementrecap/",
    "methods": "GET",
    "summary": "Get List of AgreementRecaps"
  },
  {
    "module": "AgreementRecaps",
    "path": "/finance/agreementrecap/{id}",
    "methods": "GET",
    "summary": "Get AgreementRecaps"
  },
  {
    "module": "Agreements",
    "path": "/finance/agreements",
    "methods": "GET, POST",
    "summary": "Agreements (contracts): coverage, billing cycle, limits.",
    "coveredBy": "cw_list_agreements, cw_get_agreement",
    "keyParams": "company/id, agreementStatus",
    "commonFields": "id,name,type/name,company/name,agreementStatus,startDate,endDate,billAmount"
  },
  {
    "module": "Agreements",
    "path": "/finance/agreements/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Agreement"
  },
  {
    "module": "Agreements",
    "path": "/finance/agreements/{id}/applicationParameters/{podId}",
    "methods": "GET",
    "summary": "Get AgreementApplicationParameters"
  },
  {
    "module": "Agreements",
    "path": "/finance/agreements/{id}/invoice",
    "methods": "POST",
    "summary": "Post AgreementInvoice"
  },
  {
    "module": "Agreements",
    "path": "/finance/agreements/{id}/recurringParameters/{podId}",
    "methods": "GET",
    "summary": "Get AgreementRecurringParameters"
  },
  {
    "module": "AgreementAdditions",
    "path": "/finance/agreements/{parentId}/additions",
    "methods": "GET, POST",
    "summary": "Get List of Addition"
  },
  {
    "module": "AgreementAdditions",
    "path": "/finance/agreements/{parentId}/additions/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Addition"
  },
  {
    "module": "AgreementAdjustments",
    "path": "/finance/agreements/{parentId}/adjustments",
    "methods": "GET, POST",
    "summary": "Get List of Adjustment"
  },
  {
    "module": "AgreementAdjustments",
    "path": "/finance/agreements/{parentId}/adjustments/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Adjustment"
  },
  {
    "module": "AgreementBoardDefaults",
    "path": "/finance/agreements/{parentId}/boardDefaults",
    "methods": "GET, POST",
    "summary": "Get List of BoardDefault"
  },
  {
    "module": "AgreementBoardDefaults",
    "path": "/finance/agreements/{parentId}/boardDefaults/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get BoardDefault"
  },
  {
    "module": "Agreements",
    "path": "/finance/agreements/{parentId}/configurations",
    "methods": "GET, POST",
    "summary": "Get List of ConfigurationReference"
  },
  {
    "module": "Agreements",
    "path": "/finance/agreements/{parentId}/configurations/{id}",
    "methods": "GET, DELETE",
    "summary": "Get ConfigurationReference"
  },
  {
    "module": "Agreements",
    "path": "/finance/agreements/{parentId}/copy",
    "methods": "POST",
    "summary": "Post CopyAgreementAction"
  },
  {
    "module": "AgreementSites",
    "path": "/finance/agreements/{parentId}/sites",
    "methods": "GET, POST",
    "summary": "Get List of AgreementSite"
  },
  {
    "module": "AgreementSites",
    "path": "/finance/agreements/{parentId}/sites/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get AgreementSite"
  },
  {
    "module": "AgreementWorkRoleExclusions",
    "path": "/finance/agreements/{parentId}/workRoleExclusions",
    "methods": "GET, POST",
    "summary": "Get List of AgreementWorkRoleExclusion"
  },
  {
    "module": "AgreementWorkRoleExclusions",
    "path": "/finance/agreements/{parentId}/workRoleExclusions/{id}",
    "methods": "DELETE",
    "summary": "Delete AgreementWorkRoleExclusion"
  },
  {
    "module": "AgreementWorkRoles",
    "path": "/finance/agreements/{parentId}/workroles",
    "methods": "GET, POST",
    "summary": "Get List of AgreementWorkRole"
  },
  {
    "module": "AgreementWorkRoles",
    "path": "/finance/agreements/{parentId}/workroles/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get AgreementWorkRole"
  },
  {
    "module": "AgreementWorkTypeExclusions",
    "path": "/finance/agreements/{parentId}/workTypeExclusions",
    "methods": "GET, POST",
    "summary": "Get List of AgreementWorkTypeExclusion"
  },
  {
    "module": "AgreementWorkTypeExclusions",
    "path": "/finance/agreements/{parentId}/workTypeExclusions/{id}",
    "methods": "DELETE",
    "summary": "Delete AgreementWorkTypeExclusion"
  },
  {
    "module": "AgreementWorkTypes",
    "path": "/finance/agreements/{parentId}/worktypes",
    "methods": "GET, POST",
    "summary": "Get List of AgreementWorkType"
  },
  {
    "module": "AgreementWorkTypes",
    "path": "/finance/agreements/{parentId}/worktypes/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get AgreementWorkType"
  },
  {
    "module": "AgreementTypes",
    "path": "/finance/agreements/types",
    "methods": "GET, POST",
    "summary": "Get List of AgreementType"
  },
  {
    "module": "AgreementType",
    "path": "/finance/agreements/types{id}/copy",
    "methods": "POST",
    "summary": "Post AgreementType"
  },
  {
    "module": "AgreementTypes",
    "path": "/finance/agreements/types/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get AgreementType"
  },
  {
    "module": "AgreementTypes",
    "path": "/finance/agreements/types/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "AgreementTypes",
    "path": "/finance/agreements/types/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "AgreementTypeBoardDefaults",
    "path": "/finance/agreementTypes/{parentId}/boardDefaults",
    "methods": "GET, POST",
    "summary": "Get List of AgreementTypeBoardDefault"
  },
  {
    "module": "AgreementTypeBoardDefaults",
    "path": "/finance/agreementTypes/{parentId}/boardDefaults/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get AgreementTypeBoardDefault"
  },
  {
    "module": "AgreementTypeWorkRoleExclusions",
    "path": "/finance/agreementTypes/{parentId}/workRoleExclusions",
    "methods": "GET, POST",
    "summary": "Get List of AgreementTypeWorkRoleExclusion"
  },
  {
    "module": "AgreementTypeWorkRoleExclusions",
    "path": "/finance/agreementTypes/{parentId}/workRoleExclusions/{id}",
    "methods": "GET, DELETE",
    "summary": "Get AgreementTypeWorkRoleExclusion"
  },
  {
    "module": "AgreementTypeWorkRoles",
    "path": "/finance/agreementTypes/{parentId}/workroles",
    "methods": "GET, POST",
    "summary": "Get List of AgreementTypeWorkRole"
  },
  {
    "module": "AgreementTypeWorkRoles",
    "path": "/finance/agreementTypes/{parentId}/workroles/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get AgreementTypeWorkRole"
  },
  {
    "module": "AgreementTypeWorkRoles",
    "path": "/finance/agreementTypes/{parentId}/workroles/info/{id}",
    "methods": "GET",
    "summary": "Get AgreementTypeWorkRoleInfo"
  },
  {
    "module": "AgreementTypeWorkTypeExclusions",
    "path": "/finance/agreementTypes/{parentId}/workTypeExclusions",
    "methods": "GET, POST",
    "summary": "Get List of AgreementTypeWorkTypeExclusion"
  },
  {
    "module": "AgreementTypeWorkTypeExclusions",
    "path": "/finance/agreementTypes/{parentId}/workTypeExclusions/{id}",
    "methods": "GET, DELETE",
    "summary": "Get AgreementTypeWorkTypeExclusion"
  },
  {
    "module": "AgreementTypeWorkTypes",
    "path": "/finance/agreementTypes/{parentId}/worktypes",
    "methods": "GET, POST",
    "summary": "Get List of AgreementTypeWorkType"
  },
  {
    "module": "AgreementTypeWorkTypes",
    "path": "/finance/agreementTypes/{parentId}/worktypes/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get AgreementTypeWorkType"
  },
  {
    "module": "AgreementBatchSetup",
    "path": "/finance/batchSetups",
    "methods": "GET",
    "summary": "Get List of AgreementBatchSetup"
  },
  {
    "module": "AgreementBatchSetup",
    "path": "/finance/batchSetups/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get AgreementBatchSetup"
  },
  {
    "module": "BillingCycles",
    "path": "/finance/billingCycles",
    "methods": "GET, POST",
    "summary": "Get List of BillingCycle"
  },
  {
    "module": "BillingCycles",
    "path": "/finance/billingCycles/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get BillingCycle"
  },
  {
    "module": "BillingCycles",
    "path": "/finance/billingCycles/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "BillingCycles",
    "path": "/finance/billingCycles/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "BillingSetups",
    "path": "/finance/billingSetups",
    "methods": "GET, POST",
    "summary": "Get List of BillingSetup"
  },
  {
    "module": "BillingSetups",
    "path": "/finance/billingSetups/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get BillingSetup"
  },
  {
    "module": "BillingSetupRoutings",
    "path": "/finance/billingSetups/{parentId}/routings",
    "methods": "GET, POST",
    "summary": "Get List of BillingSetupRouting"
  },
  {
    "module": "BillingSetupRoutings",
    "path": "/finance/billingSetups/{parentId}/routings/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get BillingSetupRouting"
  },
  {
    "module": "BillingStatuses",
    "path": "/finance/billingStatuses",
    "methods": "GET, POST",
    "summary": "Get List of BillingStatus"
  },
  {
    "module": "BillingStatuses",
    "path": "/finance/billingStatuses/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get BillingStatus"
  },
  {
    "module": "BillingStatuses",
    "path": "/finance/billingStatuses/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "BillingStatuses",
    "path": "/finance/billingStatuses/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "BillingTerms",
    "path": "/finance/billingTerms",
    "methods": "GET, POST",
    "summary": "Get List of BillingTerm"
  },
  {
    "module": "BillingTerms",
    "path": "/finance/billingTerms/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get BillingTerm"
  },
  {
    "module": "BillingTerms",
    "path": "/finance/billingTerms/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "BillingTerms",
    "path": "/finance/billingTerms/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "ClosedInvoices",
    "path": "/finance/closedInvoices/{id}",
    "methods": "PATCH, PUT",
    "summary": "Patch ClosedInvoice"
  },
  {
    "module": "CompanyFinances",
    "path": "/finance/companyFinance/",
    "methods": "GET",
    "summary": "Get List of CompanyFinances"
  },
  {
    "module": "CompanyFinances",
    "path": "/finance/companyFinance/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get CompanyFinances"
  },
  {
    "module": "Currencies",
    "path": "/finance/currencies",
    "methods": "GET, POST",
    "summary": "Get List of Currency"
  },
  {
    "module": "Currencies",
    "path": "/finance/currencies/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Currency"
  },
  {
    "module": "Currencies",
    "path": "/finance/currencies/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "Currencies",
    "path": "/finance/currencies/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "DeliveryMethod",
    "path": "/finance/deliveryMethods",
    "methods": "GET, POST",
    "summary": "Get List of DeliveryMethod"
  },
  {
    "module": "DeliveryMethod",
    "path": "/finance/deliveryMethods/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get DeliveryMethod"
  },
  {
    "module": "GLAccounts",
    "path": "/finance/glAccounts",
    "methods": "GET, POST",
    "summary": "Get List of GLAccount"
  },
  {
    "module": "GLAccounts",
    "path": "/finance/glAccounts/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get GLAccount"
  },
  {
    "module": "MappedTypes",
    "path": "/finance/glAccounts/mappedTypes",
    "methods": "GET",
    "summary": "Get List of MappedType"
  },
  {
    "module": "GLCaptions",
    "path": "/finance/glCaptions",
    "methods": "GET",
    "summary": "Get List of GLCaption"
  },
  {
    "module": "GLCaptions",
    "path": "/finance/glCaptions/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get GLCaption"
  },
  {
    "module": "GLPaths",
    "path": "/finance/glpaths",
    "methods": "GET, POST",
    "summary": "Get List of GLPath"
  },
  {
    "module": "GLPaths",
    "path": "/finance/glpaths/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get GLPath"
  },
  {
    "module": "CurrencyCodes",
    "path": "/finance/info/currencyCodes",
    "methods": "GET",
    "summary": "Get List of CurrencyCode"
  },
  {
    "module": "CurrencyCodes",
    "path": "/finance/info/currencyCodes/{id}",
    "methods": "GET",
    "summary": "Get CurrencyCode"
  },
  {
    "module": "InvoiceInfos",
    "path": "/finance/info/invoice/{id}",
    "methods": "GET",
    "summary": "Get InvoiceInfo"
  },
  {
    "module": "TaxIntegrationInfos",
    "path": "/finance/info/taxIntegrations",
    "methods": "GET",
    "summary": "Get List of TaxIntegrationInfo"
  },
  {
    "module": "TaxIntegrationInfos",
    "path": "/finance/info/taxIntegrations/{id}",
    "methods": "GET",
    "summary": "Get TaxIntegrationInfo"
  },
  {
    "module": "InvoiceEmailTemplates",
    "path": "/finance/invoiceEmailTemplates",
    "methods": "GET, POST",
    "summary": "Get List of InvoiceEmailTemplate"
  },
  {
    "module": "InvoiceEmailTemplates",
    "path": "/finance/invoiceEmailTemplates/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get InvoiceEmailTemplate"
  },
  {
    "module": "InvoiceEmailTemplates",
    "path": "/finance/invoiceEmailTemplates/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "InvoiceEmailTemplates",
    "path": "/finance/invoiceEmailTemplates/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "Invoices",
    "path": "/finance/invoices",
    "methods": "GET, POST",
    "summary": "Invoices.",
    "coveredBy": "cw_list_invoices, cw_get_invoice",
    "keyParams": "company/id, status/name, date",
    "commonFields": "id,invoiceNumber,status/name,company/name,date,dueDate,total,balance"
  },
  {
    "module": "Invoices",
    "path": "/finance/invoices/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Invoice"
  },
  {
    "module": "Invoices",
    "path": "/finance/invoices/{id}/pdf",
    "methods": "GET",
    "summary": "Get Invoice"
  },
  {
    "module": "InvoiceCommissions",
    "path": "/finance/invoices/{parentId}/commissions",
    "methods": "GET",
    "summary": "Get List of InvoiceCommissions"
  },
  {
    "module": "InvoiceCommissions",
    "path": "/finance/invoices/{parentId}/commissions/{id}",
    "methods": "GET, PATCH",
    "summary": "Get InvoiceCommissions"
  },
  {
    "module": "InvoiceCommissions",
    "path": "/finance/invoices/{parentId}/commissions/recalculate",
    "methods": "POST",
    "summary": "Recalculate InvoiceCommissions"
  },
  {
    "module": "GLEntries",
    "path": "/finance/invoices/{parentId}/glEntries/",
    "methods": "GET",
    "summary": "Get List of GLEntries"
  },
  {
    "module": "GLEntries",
    "path": "/finance/invoices/{parentId}/glEntries/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get GLEntries"
  },
  {
    "module": "InvoicePayments",
    "path": "/finance/invoices/{parentId}/payments",
    "methods": "GET, POST",
    "summary": "Get List of Payment"
  },
  {
    "module": "InvoicePayments",
    "path": "/finance/invoices/{parentId}/payments/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Payment"
  },
  {
    "module": "Invoice Routings",
    "path": "/finance/invoices/{parentId}/routings",
    "methods": "GET, POST",
    "summary": "Get List of Invoice Routings"
  },
  {
    "module": "Invoice Routings",
    "path": "/finance/invoices/{parentId}/routings/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Invoice Routings"
  },
  {
    "module": "InvoiceTemplates",
    "path": "/finance/invoiceTemplates",
    "methods": "GET, POST",
    "summary": "Get List of InvoiceTemplate"
  },
  {
    "module": "InvoiceTemplates",
    "path": "/finance/invoiceTemplates/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get InvoiceTemplate"
  },
  {
    "module": "InvoiceTemplates",
    "path": "/finance/invoiceTemplates/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "InvoiceTemplates",
    "path": "/finance/invoiceTemplates/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "InvoiceTemplateSetups",
    "path": "/finance/invoiceTemplateSetups",
    "methods": "GET",
    "summary": "Get List of InvoiceTemplateSetup Retrieves a list of standard and custom invoice templates"
  },
  {
    "module": "InvoiceTemplateSetups",
    "path": "/finance/invoiceTemplateSetups/{id}",
    "methods": "GET",
    "summary": "Get InvoiceTemplateSetup"
  },
  {
    "module": "TaxCodes",
    "path": "/finance/taxCodes",
    "methods": "GET, POST",
    "summary": "Get List of TaxCode"
  },
  {
    "module": "TaxableExpenseTypeLevels",
    "path": "/finance/taxCodes/{grandparentId}/expenseTypeExemptions/{parentId}/taxableExpenseTypeLevels",
    "methods": "GET, POST",
    "summary": "Get List of TaxableExpenseTypeLevel"
  },
  {
    "module": "TaxableExpenseTypeLevels",
    "path": "/finance/taxCodes/{grandparentId}/expenseTypeExemptions/{parentId}/taxableExpenseTypeLevels/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get TaxableExpenseTypeLevel"
  },
  {
    "module": "TaxableProductTypeLevels",
    "path": "/finance/taxCodes/{grandparentId}/productTypeExemptions/{parentId}/taxableProductTypeLevels",
    "methods": "GET, POST",
    "summary": "Get List of TaxableProductTypeLevel"
  },
  {
    "module": "TaxableProductTypeLevels",
    "path": "/finance/taxCodes/{grandparentId}/productTypeExemptions/{parentId}/taxableProductTypeLevels/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get TaxableProductTypeLevel"
  },
  {
    "module": "TaxableXRefLevels",
    "path": "/finance/taxCodes/{grandparentId}/taxCodeXRefs/{parentId}/taxableXRefLevels",
    "methods": "GET, POST",
    "summary": "Get List of TaxableXRefLevel"
  },
  {
    "module": "TaxableXRefLevels",
    "path": "/finance/taxCodes/{grandparentId}/taxCodeXRefs/{parentId}/taxableXRefLevels/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get TaxableXRefLevel"
  },
  {
    "module": "TaxableWorkRoleLevels",
    "path": "/finance/taxCodes/{grandparentId}/workRoleExemptions/{parentId}/taxableWorkRoleLevels",
    "methods": "GET, POST",
    "summary": "Get List of TaxableWorkRoleLevel"
  },
  {
    "module": "TaxableWorkRoleLevels",
    "path": "/finance/taxCodes/{grandparentId}/workRoleExemptions/{parentId}/taxableWorkRoleLevels/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get TaxableWorkRoleLevel"
  },
  {
    "module": "TaxCodes",
    "path": "/finance/taxCodes/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get TaxCode"
  },
  {
    "module": "TaxCodes",
    "path": "/finance/taxCodes/{id}/copy",
    "methods": "POST",
    "summary": "Post TaxCode"
  },
  {
    "module": "TaxCodes",
    "path": "/finance/taxCodes/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "TaxCodes",
    "path": "/finance/taxCodes/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "TaxCodeExpenseTypeExemptions",
    "path": "/finance/taxCodes/{parentId}/expenseTypeExemptions",
    "methods": "GET, POST",
    "summary": "Get List of ExpenseTypeExemption"
  },
  {
    "module": "TaxCodeExpenseTypeExemptions",
    "path": "/finance/taxCodes/{parentId}/expenseTypeExemptions/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ExpenseTypeExemption"
  },
  {
    "module": "TaxCodeProductTypeExemptions",
    "path": "/finance/taxCodes/{parentId}/productTypeExemptions",
    "methods": "GET, POST",
    "summary": "Get List of ProductTypeExemption"
  },
  {
    "module": "TaxCodeProductTypeExemptions",
    "path": "/finance/taxCodes/{parentId}/productTypeExemptions/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ProductTypeExemption"
  },
  {
    "module": "TaxCodeLevels",
    "path": "/finance/taxCodes/{parentId}/taxCodeLevels",
    "methods": "GET, POST",
    "summary": "Get List of TaxCodeLevel"
  },
  {
    "module": "TaxCodeLevels",
    "path": "/finance/taxCodes/{parentId}/taxCodeLevels/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get TaxCodeLevel"
  },
  {
    "module": "TaxCodeXRefs",
    "path": "/finance/taxCodes/{parentId}/taxCodeXRefs",
    "methods": "GET, POST",
    "summary": "Get List of TaxCodeXRef"
  },
  {
    "module": "TaxCodeXRefs",
    "path": "/finance/taxCodes/{parentId}/taxCodeXRefs/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get TaxCodeXRef"
  },
  {
    "module": "TaxCodeWorkRoleExemptions",
    "path": "/finance/taxCodes/{parentId}/workRoleExemptions",
    "methods": "GET, POST",
    "summary": "Get List of WorkRoleExemption"
  },
  {
    "module": "TaxCodeWorkRoleExemptions",
    "path": "/finance/taxCodes/{parentId}/workRoleExemptions/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get WorkRoleExemption"
  },
  {
    "module": "TaxIntegrations",
    "path": "/finance/taxIntegrations",
    "methods": "GET",
    "summary": "Get List of TaxIntegration"
  },
  {
    "module": "TaxIntegrations",
    "path": "/finance/taxIntegrations/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get TaxIntegration"
  },
  {
    "module": "Campaigns",
    "path": "/marketing/campaigns",
    "methods": "GET, POST",
    "summary": "Get List of Campaign"
  },
  {
    "module": "Campaigns",
    "path": "/marketing/campaigns/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Campaign"
  },
  {
    "module": "Campaigns",
    "path": "/marketing/campaigns/{id}/activities",
    "methods": "GET",
    "summary": "Get List of ActivityReference"
  },
  {
    "module": "Campaigns",
    "path": "/marketing/campaigns/{id}/opportunities",
    "methods": "GET",
    "summary": "Get List of OpportunityReference"
  },
  {
    "module": "CampaignAudits",
    "path": "/marketing/campaigns/{parentId}/audits",
    "methods": "GET, POST",
    "summary": "Get List of CampaignAudit"
  },
  {
    "module": "CampaignAudits",
    "path": "/marketing/campaigns/{parentId}/audits/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get CampaignAudit"
  },
  {
    "module": "CampaignEmailsOpened",
    "path": "/marketing/campaigns/{parentId}/emailsOpened",
    "methods": "GET, POST",
    "summary": "Get List of EmailOpened"
  },
  {
    "module": "CampaignEmailsOpened",
    "path": "/marketing/campaigns/{parentId}/emailsOpened/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get EmailOpened"
  },
  {
    "module": "CampaignFormsSubmitted",
    "path": "/marketing/campaigns/{parentId}/formsSubmitted",
    "methods": "GET, POST",
    "summary": "Get List of FormSubmitted"
  },
  {
    "module": "CampaignFormsSubmitted",
    "path": "/marketing/campaigns/{parentId}/formsSubmitted/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get FormSubmitted"
  },
  {
    "module": "CampaignLinksClicked",
    "path": "/marketing/campaigns/{parentId}/linksClicked",
    "methods": "GET, POST",
    "summary": "Get List of LinkClicked"
  },
  {
    "module": "CampaignLinksClicked",
    "path": "/marketing/campaigns/{parentId}/linksClicked/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get LinkClicked"
  },
  {
    "module": "CampaignStatuses",
    "path": "/marketing/campaigns/statuses",
    "methods": "GET, POST",
    "summary": "Get List of CampaignStatus"
  },
  {
    "module": "CampaignStatuses",
    "path": "/marketing/campaigns/statuses/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get CampaignStatus"
  },
  {
    "module": "CampaignSubTypes",
    "path": "/marketing/campaigns/subTypes",
    "methods": "GET, POST",
    "summary": "Get List of CampaignSubType"
  },
  {
    "module": "CampaignSubTypes",
    "path": "/marketing/campaigns/subTypes/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get CampaignSubType"
  },
  {
    "module": "CampaignTypes",
    "path": "/marketing/campaigns/types",
    "methods": "GET, POST",
    "summary": "Get List of CampaignType"
  },
  {
    "module": "CampaignTypes",
    "path": "/marketing/campaigns/types/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get CampaignType"
  },
  {
    "module": "LegacyCampaignSubTypes",
    "path": "/marketing/campaigns/types/{parentId}/subTypes",
    "methods": "GET",
    "summary": "Get List of CampaignSubType"
  },
  {
    "module": "LegacyCampaignSubTypes",
    "path": "/marketing/campaigns/types/{parentId}/subTypes/{id}",
    "methods": "GET",
    "summary": "Get CampaignSubType"
  },
  {
    "module": "Groups",
    "path": "/marketing/groups",
    "methods": "GET, POST",
    "summary": "Get List of Group"
  },
  {
    "module": "Groups",
    "path": "/marketing/groups/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Group"
  },
  {
    "module": "Groups",
    "path": "/marketing/groups/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "Groups",
    "path": "/marketing/groups/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "MarketingCompanies",
    "path": "/marketing/groups/{parentId}/companies",
    "methods": "GET, POST",
    "summary": "Get List of MarketingCompany"
  },
  {
    "module": "MarketingCompanies",
    "path": "/marketing/groups/{parentId}/companies/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get MarketingCompany"
  },
  {
    "module": "MarketingContacts",
    "path": "/marketing/groups/{parentId}/contacts",
    "methods": "GET, POST",
    "summary": "Get List of MarketingContact"
  },
  {
    "module": "MarketingContacts",
    "path": "/marketing/groups/{parentId}/contacts/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get MarketingContact"
  },
  {
    "module": "ProcurementAdjustments",
    "path": "/procurement/adjustments",
    "methods": "GET, POST",
    "summary": "Get List of ProcurementAdjustment"
  },
  {
    "module": "ProcurementAdjustments",
    "path": "/procurement/adjustments/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ProcurementAdjustment"
  },
  {
    "module": "AdjustmentDetails",
    "path": "/procurement/adjustments/{parentId}/details",
    "methods": "GET, POST",
    "summary": "Get List of AdjustmentDetail"
  },
  {
    "module": "AdjustmentDetails",
    "path": "/procurement/adjustments/{parentId}/details/{id}",
    "methods": "GET, DELETE",
    "summary": "Get AdjustmentDetail"
  },
  {
    "module": "AdjustmentTypes",
    "path": "/procurement/adjustments/types",
    "methods": "GET, POST",
    "summary": "Get List of AdjustmentType"
  },
  {
    "module": "AdjustmentTypes",
    "path": "/procurement/adjustments/types/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get AdjustmentType"
  },
  {
    "module": "AdjustmentTypes",
    "path": "/procurement/adjustments/types/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "AdjustmentTypes",
    "path": "/procurement/adjustments/types/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "CatalogsItem",
    "path": "/procurement/catalog",
    "methods": "GET, POST",
    "summary": "Get List of CatalogItem"
  },
  {
    "module": "CatalogsItem",
    "path": "/procurement/catalog/{catalogItemIdentifier}/quantityOnHand",
    "methods": "GET",
    "summary": "Get Count of CatalogItem"
  },
  {
    "module": "CatalogsItem",
    "path": "/procurement/catalog/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get CatalogItem"
  },
  {
    "module": "CatalogsItem",
    "path": "/procurement/catalog/{id}/copy",
    "methods": "POST",
    "summary": "Post Copy CatalogItem"
  },
  {
    "module": "CatalogsItem",
    "path": "/procurement/catalog/{id}/pricing",
    "methods": "POST",
    "summary": "Post CatalogPricing"
  },
  {
    "module": "CatalogComponents",
    "path": "/procurement/catalog/{parentId}/components",
    "methods": "GET, POST",
    "summary": "Get List of CatalogComponent"
  },
  {
    "module": "CatalogComponents",
    "path": "/procurement/catalog/{parentId}/components/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get CatalogComponent"
  },
  {
    "module": "CatalogInventories",
    "path": "/procurement/catalog/{parentId}/inventory",
    "methods": "GET",
    "summary": "Get List of CatalogInventory"
  },
  {
    "module": "CatalogInventories",
    "path": "/procurement/catalog/{parentId}/inventory/{id}",
    "methods": "GET",
    "summary": "Get CatalogInventory"
  },
  {
    "module": "MinimumStockByWarehouses",
    "path": "/procurement/catalog/{parentId}/minimumStockByWarehouse",
    "methods": "GET, POST",
    "summary": "Get List of MinimumStockByWarehouse"
  },
  {
    "module": "MinimumStockByWarehouses",
    "path": "/procurement/catalog/{parentId}/minimumStockByWarehouse/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get MinimumStockByWarehouse"
  },
  {
    "module": "CatalogsItem",
    "path": "/procurement/catalog/{parentId}/vendors/{id}",
    "methods": "PUT, DELETE",
    "summary": "Put CatalogItem"
  },
  {
    "module": "BillingCycles",
    "path": "/procurement/catalog/{parentId}/vendors/{id}{id}",
    "methods": "PATCH",
    "summary": "Patch BillingCycle"
  },
  {
    "module": "CatalogsItem",
    "path": "/procurement/catalog/vendors",
    "methods": "POST",
    "summary": "Post CatalogItem"
  },
  {
    "module": "CatalogsItem",
    "path": "/procurement/catalog/vendors/{parentId}",
    "methods": "GET",
    "summary": "Get List of CatalogItem"
  },
  {
    "module": "Categories",
    "path": "/procurement/categories",
    "methods": "GET, POST",
    "summary": "Get List of Category"
  },
  {
    "module": "Categories",
    "path": "/procurement/categories/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Category"
  },
  {
    "module": "LegacySubCategories",
    "path": "/procurement/categories/{parentId}/subcategories/",
    "methods": "GET, POST",
    "summary": "Get List of LegacySubCategory"
  },
  {
    "module": "LegacySubCategories",
    "path": "/procurement/categories/{parentId}/subcategories/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get LegacySubCategory"
  },
  {
    "module": "ChangeOrder",
    "path": "/procurement/changeorder",
    "methods": "GET, POST",
    "summary": "Get List of ChangeOrders"
  },
  {
    "module": "ChangeOrder",
    "path": "/procurement/changeorder/{id}",
    "methods": "PATCH, DELETE",
    "summary": "Patch ChangeOrder"
  },
  {
    "module": "DirectionalSyncs",
    "path": "/procurement/directionalSyncs",
    "methods": "GET, POST",
    "summary": "Get List of DirectionalSync"
  },
  {
    "module": "DirectionalSyncs",
    "path": "/procurement/directionalSyncs/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get DirectionalSync"
  },
  {
    "module": "InvoiceGroupings",
    "path": "/procurement/invoicegrouping",
    "methods": "GET",
    "summary": "Get List of InvoiceGrouping"
  },
  {
    "module": "InvoiceGroupings",
    "path": "/procurement/invoicegrouping/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get InvoiceGrouping"
  },
  {
    "module": "InvoiceGroupings",
    "path": "/procurement/invoicegrouping/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "InvoiceGroupings",
    "path": "/procurement/invoicegrouping/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "Manufacturers",
    "path": "/procurement/manufacturers",
    "methods": "GET, POST",
    "summary": "Get List of Manufacturer"
  },
  {
    "module": "Manufacturers",
    "path": "/procurement/manufacturers/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Manufacturer"
  },
  {
    "module": "OnHandSerialNumberses",
    "path": "/procurement/onhandserialnumbers",
    "methods": "GET",
    "summary": "Get List of OnHandSerialNumber"
  },
  {
    "module": "OnHandSerialNumberses",
    "path": "/procurement/onhandserialnumbers/{id}",
    "methods": "GET",
    "summary": "Get OnHandSerialNumber"
  },
  {
    "module": "PricingSchedules",
    "path": "/procurement/pricingschedules",
    "methods": "GET, POST",
    "summary": "Get List of PricingSchedule"
  },
  {
    "module": "PricingBreaks",
    "path": "/procurement/pricingschedules/{grandparentId}/details/{parentId}/breaks",
    "methods": "GET, POST",
    "summary": "Get List of PricingBreak"
  },
  {
    "module": "PricingBreaks",
    "path": "/procurement/pricingschedules/{grandparentId}/details/{parentId}/breaks/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get PricingBreak"
  },
  {
    "module": "PricingSchedules",
    "path": "/procurement/pricingschedules/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get PricingSchedule"
  },
  {
    "module": "PricingDetails",
    "path": "/procurement/pricingschedules/{parentId}/details",
    "methods": "GET, POST",
    "summary": "Get List of PricingDetail"
  },
  {
    "module": "PricingDetails",
    "path": "/procurement/pricingschedules/{parentId}/details/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get PricingDetail"
  },
  {
    "module": "ProductsItem",
    "path": "/procurement/products",
    "methods": "GET, POST",
    "summary": "Get List of ProductItem"
  },
  {
    "module": "ProductsItem",
    "path": "/procurement/products/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ProductItem"
  },
  {
    "module": "ProductsItem",
    "path": "/procurement/products/{id}/detach",
    "methods": "POST",
    "summary": "Post ProductDetach"
  },
  {
    "module": "ProductComponents",
    "path": "/procurement/products/{parentId}/components",
    "methods": "GET, POST",
    "summary": "Get List of ProductComponent"
  },
  {
    "module": "ProductComponents",
    "path": "/procurement/products/{parentId}/components/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get List of ProductComponent"
  },
  {
    "module": "ProductPickingShippingDetails",
    "path": "/procurement/products/{parentId}/pickingShippingDetails",
    "methods": "GET, POST",
    "summary": "Get List of ProductPickingShippingDetail"
  },
  {
    "module": "ProductPickingShippingDetails",
    "path": "/procurement/products/{parentId}/pickingShippingDetails/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get List of ProductPickingShippingDetail"
  },
  {
    "module": "PurchaseOrders",
    "path": "/procurement/purchaseorders",
    "methods": "GET, POST",
    "summary": "Purchase orders.",
    "keyParams": "vendorCompany/id, status/id",
    "commonFields": "id,poNumber,status/name,vendorCompany/name,total,orderDate"
  },
  {
    "module": "PurchaseOrders",
    "path": "/procurement/purchaseorders/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get PurchaseOrder"
  },
  {
    "module": "PurchaseOrders",
    "path": "/procurement/purchaseorders/{id}/copy",
    "methods": "POST",
    "summary": "Post PurchaseOrderCopy"
  },
  {
    "module": "PurchaseOrders",
    "path": "/procurement/purchaseorders/{id}/rebatch",
    "methods": "POST",
    "summary": "Post RebatchPurchaseOrder"
  },
  {
    "module": "PurchaseOrders",
    "path": "/procurement/purchaseorders/{id}/unbatch",
    "methods": "POST",
    "summary": "Post UnbatchPurchaseOrder"
  },
  {
    "module": "PurchaseOrderLineItems",
    "path": "/procurement/purchaseorders/{parentId}/lineitems",
    "methods": "GET, POST, DELETE",
    "summary": "Get List of PurchaseOrderLineItem"
  },
  {
    "module": "PurchaseOrderLineItems",
    "path": "/procurement/purchaseorders/{parentId}/lineitems/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get PurchaseOrderLineItem"
  },
  {
    "module": "PurchaseOrderLineItems",
    "path": "/procurement/purchaseorders/{parentId}/lineitems/bulk",
    "methods": "POST, PUT, DELETE",
    "summary": "Post BulkResult"
  },
  {
    "module": "PurchaseOrders",
    "path": "/procurement/purchaseorders/{parentId}/notes",
    "methods": "GET, POST",
    "summary": "Get List of PurchaseOrder"
  },
  {
    "module": "PurchaseOrdersNote",
    "path": "/procurement/purchaseorders/{parentId}/notes/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get PurchaseOrderNote"
  },
  {
    "module": "PurchaseOrderStatuses",
    "path": "/procurement/purchaseorderstatuses",
    "methods": "GET, POST",
    "summary": "Get List of PurchaseOrderStatus"
  },
  {
    "module": "PurchaseOrderStatuses",
    "path": "/procurement/purchaseorderstatuses/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get PurchaseOrderStatus"
  },
  {
    "module": "PurchaseOrderStatuses",
    "path": "/procurement/purchaseorderstatuses/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "PurchaseOrderStatuses",
    "path": "/procurement/purchaseorderstatuses/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "PurchaseOrderStatusEmailTemplates",
    "path": "/procurement/purchaseorderstatuses/{parentId}/emailtemplates/",
    "methods": "GET, POST",
    "summary": "Get List of PurchaseOrderStatusEmailTemplate"
  },
  {
    "module": "PurchaseOrderStatusEmailTemplates",
    "path": "/procurement/purchaseorderstatuses/{parentId}/emailtemplates/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get PurchaseOrderStatusEmailTemplate"
  },
  {
    "module": "PurchaseOrderStatusNotifications",
    "path": "/procurement/purchaseorderstatuses/{parentId}/notifications",
    "methods": "GET, POST",
    "summary": "Get List of PurchaseOrderStatusNotification"
  },
  {
    "module": "PurchaseOrderStatusNotifications",
    "path": "/procurement/purchaseorderstatuses/{parentId}/notifications/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get PurchaseOrderStatusNotification"
  },
  {
    "module": "PurchasingDemands",
    "path": "/procurement/purchasingDemands",
    "methods": "POST",
    "summary": "Post PurchasingDemand"
  },
  {
    "module": "RMAActions",
    "path": "/procurement/rmaActions",
    "methods": "GET, POST",
    "summary": "Get List of RmaAction"
  },
  {
    "module": "RMAActions",
    "path": "/procurement/rmaActions/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get RmaAction"
  },
  {
    "module": "RmaAction",
    "path": "/procurement/rmaActions/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "RmaAction",
    "path": "/procurement/rmaActions/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "RMADispositions",
    "path": "/procurement/RMADispositions",
    "methods": "GET, POST",
    "summary": "Get List of RmaDisposition"
  },
  {
    "module": "RMADispositions",
    "path": "/procurement/RMADispositions/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get RmaDisposition"
  },
  {
    "module": "RMADispositions",
    "path": "/procurement/RMADispositions/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "RMADispositions",
    "path": "/procurement/RMADispositions/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "RmaStatuses",
    "path": "/procurement/rmaStatuses",
    "methods": "GET, POST",
    "summary": "Get List of RmaStatus"
  },
  {
    "module": "RmaStatuses",
    "path": "/procurement/rmaStatuses/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get RmaStatus"
  },
  {
    "module": "RmaStatuses",
    "path": "/procurement/rmaStatuses/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "RmaStatuses",
    "path": "/procurement/rmaStatuses/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "RmaStatusEmailTemplates",
    "path": "/procurement/rmaStatuses/{parentId}/emailtemplates/",
    "methods": "POST",
    "summary": "Post RmaStatusEmailTemplate"
  },
  {
    "module": "RmaStatusEmailTemplates",
    "path": "/procurement/rmaStatuses/{parentId}/emailTemplates/",
    "methods": "GET",
    "summary": "Get List of RmaStatusEmailTemplate"
  },
  {
    "module": "RmaStatusEmailTemplates",
    "path": "/procurement/rmaStatuses/{parentId}/emailtemplates/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get RmaStatusEmailTemplate"
  },
  {
    "module": "RmaStatusNotifications",
    "path": "/procurement/rmaStatuses/{parentId}/notifications",
    "methods": "GET, POST",
    "summary": "Get List of RmaStatusNotification"
  },
  {
    "module": "RmaStatusNotifications",
    "path": "/procurement/rmaStatuses/{parentId}/notifications/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get RmaStatusNotification"
  },
  {
    "module": "RmaTags",
    "path": "/procurement/rmaTags",
    "methods": "GET, POST",
    "summary": "Get List of RmaTag"
  },
  {
    "module": "RmaTags",
    "path": "/procurement/rmaTags/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get RmaTag"
  },
  {
    "module": "RmaTags",
    "path": "/procurement/rmaTags/default",
    "methods": "GET",
    "summary": "Get RmaTag"
  },
  {
    "module": "ProcurementSettings",
    "path": "/procurement/settings",
    "methods": "GET",
    "summary": "Get List of ProcurementSetting"
  },
  {
    "module": "ProcurementSettings",
    "path": "/procurement/settings/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get ProcurementSetting"
  },
  {
    "module": "ShipmentMethods",
    "path": "/procurement/shipmentmethods",
    "methods": "GET, POST",
    "summary": "Get List of ShipmentMethod"
  },
  {
    "module": "ShipmentMethods",
    "path": "/procurement/shipmentmethods/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ShipmentMethod"
  },
  {
    "module": "ShipmentMethods",
    "path": "/procurement/shipmentmethods/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "ShipmentMethods",
    "path": "/procurement/shipmentmethods/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "SubCategories",
    "path": "/procurement/subcategories/",
    "methods": "GET, POST",
    "summary": "Get List of SubCategory"
  },
  {
    "module": "SubCategories",
    "path": "/procurement/subcategories/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get SubCategory"
  },
  {
    "module": "SubCategories",
    "path": "/procurement/subcategories/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "SubCategories",
    "path": "/procurement/subcategories/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "SubCategories",
    "path": "/procurement/subcategories/info/",
    "methods": "GET",
    "summary": "Get List of SubCategoryInfo"
  },
  {
    "module": "ProductTypes",
    "path": "/procurement/types",
    "methods": "GET, POST",
    "summary": "Get List of ProductType"
  },
  {
    "module": "ProductTypes",
    "path": "/procurement/types/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ProductType"
  },
  {
    "module": "ProductTypes",
    "path": "/procurement/types/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "ProductTypes",
    "path": "/procurement/types/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "UnitOfMeasures",
    "path": "/procurement/unitOfMeasures",
    "methods": "GET, POST",
    "summary": "Get List of UnitOfMeasure"
  },
  {
    "module": "UnitOfMeasures",
    "path": "/procurement/unitOfMeasures/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get UnitOfMeasure"
  },
  {
    "module": "UnitOfMeasureConversions",
    "path": "/procurement/unitOfMeasures/{parentId}/conversions",
    "methods": "GET, POST",
    "summary": "Get List of Conversion"
  },
  {
    "module": "UnitOfMeasureConversions",
    "path": "/procurement/unitOfMeasures/{parentId}/conversions/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Conversion"
  },
  {
    "module": "WarehouseBins",
    "path": "/procurement/warehouseBins",
    "methods": "GET, POST",
    "summary": "Get List of WarehouseBin"
  },
  {
    "module": "WarehouseBins",
    "path": "/procurement/warehouseBins/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get WarehouseBin"
  },
  {
    "module": "InventoryOnHands",
    "path": "/procurement/warehouseBins/{parentId}/inventoryOnHand",
    "methods": "GET",
    "summary": "Get List of InventoryOnHand"
  },
  {
    "module": "InventoryOnHands",
    "path": "/procurement/warehouseBins/{parentId}/inventoryOnHand/{id}",
    "methods": "GET",
    "summary": "Get InventoryOnHand"
  },
  {
    "module": "Warehouses",
    "path": "/procurement/warehouses",
    "methods": "GET, POST",
    "summary": "Get List of Warehouse"
  },
  {
    "module": "Warehouses",
    "path": "/procurement/warehouses/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Warehouse"
  },
  {
    "module": "ProjectBillingRates",
    "path": "/project/{parentId}/billingRates",
    "methods": "GET, POST",
    "summary": "Get List of ProjectBillingRate"
  },
  {
    "module": "ProjectBillingRates",
    "path": "/project/{parentId}/billingRates/{id}",
    "methods": "GET, PUT, DELETE",
    "summary": "Get ProjectBillingRate"
  },
  {
    "module": "ProjectBillingRates",
    "path": "/project/billingRates/{parentId}/billingRates/{id}",
    "methods": "PATCH",
    "summary": "Patch ProjectBillingRate"
  },
  {
    "module": "ProjectBoardTeamMembers",
    "path": "/project/boards/{grandparentId}/teams/{parentId}/members",
    "methods": "GET, POST",
    "summary": "Get List of ProjectBoardTeamMember"
  },
  {
    "module": "ProjectBoardTeamMembers",
    "path": "/project/boards/{grandparentId}/teams/{parentId}/members/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ProjectBoardTeamMember"
  },
  {
    "module": "ProjectBoardKanbanSettings",
    "path": "/project/boards/{parentId}/kanbanSettings",
    "methods": "GET, POST",
    "summary": "Get List of ProjectBoardKanbanSettings"
  },
  {
    "module": "ProjectBoardKanbanSettings",
    "path": "/project/boards/{parentId}/kanbanSettings/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ProjectBoardKanbanSetting"
  },
  {
    "module": "ProjectBoardTeams",
    "path": "/project/boards/{parentId}/teams",
    "methods": "GET, POST",
    "summary": "Get List of ProjectBoardTeam"
  },
  {
    "module": "ProjectBoardTeams",
    "path": "/project/boards/{parentId}/teams/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ProjectBoardTeam"
  },
  {
    "module": "PhaseStatuses",
    "path": "/project/phaseStatuses",
    "methods": "GET, POST",
    "summary": "Get List of PhaseStatus"
  },
  {
    "module": "PhaseStatuses",
    "path": "/project/phaseStatuses/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get PhaseStatus"
  },
  {
    "module": "PhaseStatuses",
    "path": "/project/phaseStatuses/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "PhaseStatuses",
    "path": "/project/phaseStatuses/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "Projects",
    "path": "/project/projects",
    "methods": "GET, POST",
    "summary": "Projects.",
    "keyParams": "company/id, status/id",
    "commonFields": "id,name,company/name,status/name,estimatedStart,estimatedEnd"
  },
  {
    "module": "Projects",
    "path": "/project/projects/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ApiProject"
  },
  {
    "module": "Projects",
    "path": "/project/projects/{id}/projectRecap",
    "methods": "GET",
    "summary": "Get ProjectRecap"
  },
  {
    "module": "Projects",
    "path": "/project/projects/{id}/projectWorkplan",
    "methods": "GET",
    "summary": "Get ProjectWorkplan"
  },
  {
    "module": "Projects",
    "path": "/project/projects/{parentId}/applyTemplate/{id}",
    "methods": "POST",
    "summary": "Post ApplyTemplate"
  },
  {
    "module": "Projects",
    "path": "/project/projects/{parentId}/applyTemplates",
    "methods": "POST",
    "summary": "Post ApplyTemplates"
  },
  {
    "module": "ProjectContacts",
    "path": "/project/projects/{parentId}/contacts",
    "methods": "GET, POST",
    "summary": "Get List of ProjectContact"
  },
  {
    "module": "ProjectContacts",
    "path": "/project/projects/{parentId}/contacts/{id}",
    "methods": "GET, DELETE",
    "summary": "Get ProjectContact"
  },
  {
    "module": "ProjectNotes",
    "path": "/project/projects/{parentId}/notes",
    "methods": "GET, POST",
    "summary": "Get List of ProjectNote"
  },
  {
    "module": "ProjectNotes",
    "path": "/project/projects/{parentId}/notes/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ProjectNote"
  },
  {
    "module": "ProjectPhases",
    "path": "/project/projects/{parentId}/phases",
    "methods": "GET, POST",
    "summary": "Get List of ProjectPhase"
  },
  {
    "module": "ProjectPhases",
    "path": "/project/projects/{parentId}/phases/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ProjectPhase"
  },
  {
    "module": "ProjectsTeamMembers",
    "path": "/project/projects/{parentId}/teamMembers",
    "methods": "GET, POST",
    "summary": "Get List of ProjectTeamMember"
  },
  {
    "module": "ProjectsTeamMembers",
    "path": "/project/projects/{parentId}/teamMembers/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ProjectTeamMember"
  },
  {
    "module": "ProjectTemplates",
    "path": "/project/projectTemplates/",
    "methods": "GET, POST",
    "summary": "Get List of ProjectTemplates"
  },
  {
    "module": "ProjectTemplateTasks",
    "path": "/project/projectTemplates/{grandParentId}/projectTemplateTickets/{parentId}/tasks",
    "methods": "GET, POST",
    "summary": "Get List of ProjectTemplateTasks"
  },
  {
    "module": "ProjectTemplateTasks",
    "path": "/project/projectTemplates/{grandParentId}/projectTemplateTickets/{parentId}/tasks/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ProjectTemplateTasks"
  },
  {
    "module": "ProjectTemplates",
    "path": "/project/projectTemplates/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ProjectTemplates"
  },
  {
    "module": "ProjectTemplates",
    "path": "/project/projectTemplates/{id}/workplan",
    "methods": "GET",
    "summary": "Get ProjectTemplatesWorkplan"
  },
  {
    "module": "ProjectTemplatePhases",
    "path": "/project/projectTemplates/{parentId}/projectTemplatePhases",
    "methods": "GET, POST",
    "summary": "Get List of ProjectTemplatePhases"
  },
  {
    "module": "ProjectTemplatePhases",
    "path": "/project/projectTemplates/{parentId}/projectTemplatePhases/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ProjectTemplatePhases"
  },
  {
    "module": "ProjectTemplateTickets",
    "path": "/project/projectTemplates/{parentId}/projectTemplateTickets",
    "methods": "GET, POST",
    "summary": "Get List of ProjectTemplateTickets"
  },
  {
    "module": "ProjectTemplateTickets",
    "path": "/project/projectTemplates/{parentId}/projectTemplateTickets/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ProjectTemplateTickets"
  },
  {
    "module": "ProjectTemplates",
    "path": "/project/projectTemplates/createFromProject/{id}",
    "methods": "POST",
    "summary": "Post CreateFromProject"
  },
  {
    "module": "ProjectTemplatePhases",
    "path": "/project/projectTemplates/projectTemplatePhases",
    "methods": "GET",
    "summary": "Get List of ProjectTemplatePhases"
  },
  {
    "module": "ProjectTemplateTickets",
    "path": "/project/projectTemplates/projectTemplateTickets",
    "methods": "GET",
    "summary": "Get List of ProjectTemplateTickets"
  },
  {
    "module": "ProjectTemplateTasks",
    "path": "/project/projectTemplates/projectTemplateTickets/tasks",
    "methods": "GET",
    "summary": "Get List of ProjectTemplateTasks"
  },
  {
    "module": "ProjectTypes",
    "path": "/project/projectTypes",
    "methods": "GET, POST",
    "summary": "Get List of ProjectType"
  },
  {
    "module": "ProjectTypes",
    "path": "/project/projectTypes/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ProjectType"
  },
  {
    "module": "ProjectTypes",
    "path": "/project/projectTypes/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "ProjectTypes",
    "path": "/project/projectTypes/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "ProjectSecurityRoles",
    "path": "/project/securityRoles",
    "methods": "GET, POST",
    "summary": "Get List of ProjectSecurityRole"
  },
  {
    "module": "ProjectSecurityRoles",
    "path": "/project/securityRoles/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ProjectSecurityRole"
  },
  {
    "module": "ProjectSecurityRoleSettings",
    "path": "/project/securityRoles/{parentId}/settings",
    "methods": "GET",
    "summary": "Get List of ProjectSecurityRoleSetting"
  },
  {
    "module": "ProjectSecurityRoleSettings",
    "path": "/project/securityRoles/{parentId}/settings/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get ProjectSecurityRoleSetting"
  },
  {
    "module": "ProjectStatuses",
    "path": "/project/statuses",
    "methods": "GET, POST",
    "summary": "Get List of ProjectStatus"
  },
  {
    "module": "ProjectStatuses",
    "path": "/project/statuses/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ProjectStatus"
  },
  {
    "module": "Statuses",
    "path": "/project/statuses/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "Statuses",
    "path": "/project/statuses/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "StatusIndicators",
    "path": "/project/statusIndicators",
    "methods": "GET",
    "summary": "Get List of StatusIndicator"
  },
  {
    "module": "StatusIndicators",
    "path": "/project/statusIndicators/{id}",
    "methods": "GET",
    "summary": "Get StatusIndicator"
  },
  {
    "module": "ProjectTicketNotes",
    "path": "/project/ticketNote/{id}/markAs/",
    "methods": "POST",
    "summary": "Post ProjectTicketNote"
  },
  {
    "module": "ProjectTickets",
    "path": "/project/tickets",
    "methods": "GET, POST",
    "summary": "Get List of ProjectTicket"
  },
  {
    "module": "ProjectTickets",
    "path": "/project/tickets/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ProjectTicket"
  },
  {
    "module": "ProjectTickets",
    "path": "/project/tickets/{parentId}/activities",
    "methods": "GET",
    "summary": "Get List of ActivityReference Gets activities associated to the ticket Please use the /sales/activities?conditions=ticket/id={id} endpoint"
  },
  {
    "module": "ProjectTicketNotes",
    "path": "/project/tickets/{parentId}/allNotes",
    "methods": "GET",
    "summary": "Get List of ProjectTicketNote"
  },
  {
    "module": "ProjectTickets",
    "path": "/project/tickets/{parentId}/configurations",
    "methods": "GET, POST",
    "summary": "Get List of ConfigurationReference"
  },
  {
    "module": "ProjectTickets",
    "path": "/project/tickets/{parentId}/configurations/{id}",
    "methods": "GET, DELETE",
    "summary": "Get ConfigurationReference"
  },
  {
    "module": "ProjectTickets",
    "path": "/project/tickets/{parentId}/convert",
    "methods": "POST",
    "summary": "Post SuccessResponse"
  },
  {
    "module": "ProjectTickets",
    "path": "/project/tickets/{parentId}/documents",
    "methods": "GET",
    "summary": "Get List of DocumentReference Gets the documents associated to the ticket Please use the /system/documents?recordType=Ticket&amp;recordId={id} endpoint"
  },
  {
    "module": "TicketNotes",
    "path": "/project/tickets/{parentId}/notes",
    "methods": "GET, POST",
    "summary": "Get List of TicketNote"
  },
  {
    "module": "TicketNotes",
    "path": "/project/tickets/{parentId}/notes/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get TicketNote"
  },
  {
    "module": "ProjectTickets",
    "path": "/project/tickets/{parentId}/products",
    "methods": "GET",
    "summary": "Get List of ProductReference Gets the products associated to the ticket Please use the /procurement/products?conditions=chargeToType='Ticket' AND chargeToId={id} endpoint"
  },
  {
    "module": "ProjectTickets",
    "path": "/project/tickets/{parentId}/scheduleentries",
    "methods": "GET",
    "summary": "Get List of ScheduleEntryReference Gets the schedule entries associated to the ticket Please use the /schedule/entries?conditions=type/id=4 AND objectId={id} endpoint"
  },
  {
    "module": "TicketTasks",
    "path": "/project/tickets/{parentId}/tasks",
    "methods": "GET, POST",
    "summary": "Get List of TicketTask"
  },
  {
    "module": "TicketTasks",
    "path": "/project/tickets/{parentId}/tasks/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get TicketTask"
  },
  {
    "module": "ProjectTickets",
    "path": "/project/tickets/{parentId}/timeentries",
    "methods": "GET",
    "summary": "Get List of TimeEntryReference Gets time entries associated to the ticket Please use the /time/entries?conditions=(chargeToType=\"ServiceTicket\" OR chargeToType=\"ProjectTicket\") AND"
  },
  {
    "module": "ProjectTickets",
    "path": "/project/tickets/search",
    "methods": "POST",
    "summary": "Post List of ProjectTicket"
  },
  {
    "module": "Activities",
    "path": "/sales/activities",
    "methods": "GET, POST",
    "summary": "Get List of Activity"
  },
  {
    "module": "Activities",
    "path": "/sales/activities/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Activity"
  },
  {
    "module": "ActivityStatuses",
    "path": "/sales/activities/statuses",
    "methods": "GET, POST",
    "summary": "Get List of ActivityStatus"
  },
  {
    "module": "ActivityStatuses",
    "path": "/sales/activities/statuses/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ActivityStatus"
  },
  {
    "module": "ActivityTypes",
    "path": "/sales/activities/types",
    "methods": "GET, POST",
    "summary": "Get List of ActivityType"
  },
  {
    "module": "ActivityTypes",
    "path": "/sales/activities/types/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ActivityType"
  },
  {
    "module": "ActivityTypes",
    "path": "/sales/activities/types/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "ActivityTypes",
    "path": "/sales/activities/types/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "Commissions",
    "path": "/sales/commissions",
    "methods": "GET, POST",
    "summary": "Get List of Commission"
  },
  {
    "module": "Commissions",
    "path": "/sales/commissions/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Commission"
  },
  {
    "module": "Commissions",
    "path": "/sales/commissions/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "Commissions",
    "path": "/sales/commissions/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "Opportunities",
    "path": "/sales/opportunities",
    "methods": "GET, POST",
    "summary": "Sales opportunities (pipeline).",
    "keyParams": "company/id, stage/id, status/id",
    "commonFields": "id,name,company/name,stage/name,status/name,expectedCloseDate"
  },
  {
    "module": "Opportunities",
    "path": "/sales/opportunities/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get v2015_3.Sales.Opportunity.Opportunity"
  },
  {
    "module": "Opportunities",
    "path": "/sales/opportunities/{id}/convertToAgreement",
    "methods": "POST",
    "summary": "Post ApiAgreement"
  },
  {
    "module": "Opportunities",
    "path": "/sales/opportunities/{id}/convertToProject",
    "methods": "POST",
    "summary": "Post ApiProject"
  },
  {
    "module": "Opportunities",
    "path": "/sales/opportunities/{id}/convertToSalesOrder",
    "methods": "POST",
    "summary": "Post ApiSalesOrder"
  },
  {
    "module": "Opportunities",
    "path": "/sales/opportunities/{id}/convertToServiceTicket",
    "methods": "POST",
    "summary": "Post ApiTicket"
  },
  {
    "module": "OpportunityContacts",
    "path": "/sales/opportunities/{parentId}/contacts",
    "methods": "GET, POST",
    "summary": "Get List of OpportunityContact"
  },
  {
    "module": "OpportunityContacts",
    "path": "/sales/opportunities/{parentId}/contacts/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get OpportunityContact"
  },
  {
    "module": "OpportunityForecasts",
    "path": "/sales/opportunities/{parentId}/forecast",
    "methods": "GET, POST",
    "summary": "Get List of Forecast"
  },
  {
    "module": "OpportunityForecasts",
    "path": "/sales/opportunities/{parentId}/forecast/",
    "methods": "PATCH, PUT, DELETE",
    "summary": "Patch Forecast"
  },
  {
    "module": "OpportunityForecastItems",
    "path": "/sales/opportunities/{parentId}/forecast/{id}",
    "methods": "GET, POST, PATCH, PUT, DELETE",
    "summary": "Get ForecastItem"
  },
  {
    "module": "OpportunityForecasts",
    "path": "/sales/opportunities/{parentId}/forecast/copy/{id}",
    "methods": "POST",
    "summary": "Post SuccessResponse"
  },
  {
    "module": "OpportunityNotes",
    "path": "/sales/opportunities/{parentId}/notes",
    "methods": "GET, POST",
    "summary": "Get List of OpportunityNote"
  },
  {
    "module": "OpportunityNotes",
    "path": "/sales/opportunities/{parentId}/notes/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get OpportunityNote"
  },
  {
    "module": "OpportunityTeams",
    "path": "/sales/opportunities/{parentId}/team",
    "methods": "GET, POST",
    "summary": "Get List of Team"
  },
  {
    "module": "OpportunityTeams",
    "path": "/sales/opportunities/{parentId}/team/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Team"
  },
  {
    "module": "Opportunities",
    "path": "/sales/opportunities/conversions/{id}",
    "methods": "GET",
    "summary": "Get Conversion"
  },
  {
    "module": "Opportunities",
    "path": "/sales/opportunities/default",
    "methods": "GET",
    "summary": "Get v2015_3.Sales.Opportunity.Opportunity"
  },
  {
    "module": "OpportunityRatings",
    "path": "/sales/opportunities/ratings",
    "methods": "GET, POST",
    "summary": "Get List of OpportunityRating"
  },
  {
    "module": "OpportunityRatings",
    "path": "/sales/opportunities/ratings/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get OpportunityRating"
  },
  {
    "module": "OpportunityStatuses",
    "path": "/sales/opportunities/statuses",
    "methods": "GET, POST",
    "summary": "Get List of OpportunityStatus"
  },
  {
    "module": "OpportunityStatuses",
    "path": "/sales/opportunities/statuses/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get OpportunityStatus"
  },
  {
    "module": "OpportunityStatuses",
    "path": "/sales/opportunities/statuses/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "OpportunityStatuses",
    "path": "/sales/opportunities/statuses/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "OpportunityTypes",
    "path": "/sales/opportunities/types",
    "methods": "GET, POST",
    "summary": "Get List of OpportunityType"
  },
  {
    "module": "OpportunityTypes",
    "path": "/sales/opportunities/types/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get OpportunityType"
  },
  {
    "module": "OpportunityTypes",
    "path": "/sales/opportunities/types/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "OpportunityTypes",
    "path": "/sales/opportunities/types/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "Orders",
    "path": "/sales/orders",
    "methods": "GET, POST",
    "summary": "Get List of Order"
  },
  {
    "module": "Orders",
    "path": "/sales/orders/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Order"
  },
  {
    "module": "Orders",
    "path": "/sales/orders/{id}/convertToAgreement",
    "methods": "POST",
    "summary": "Post ApiAgreement"
  },
  {
    "module": "Orders",
    "path": "/sales/orders/{id}/convertToProject",
    "methods": "POST",
    "summary": "Post ApiProject"
  },
  {
    "module": "Orders",
    "path": "/sales/orders/{id}/convertToServiceTicket",
    "methods": "POST",
    "summary": "Post Ticket"
  },
  {
    "module": "SalesOrderRecaps",
    "path": "/sales/orders/{id}/financialrecap",
    "methods": "GET",
    "summary": "Get List of SalesOrderRecaps"
  },
  {
    "module": "SalesOrdersLineItems",
    "path": "/sales/orders/{parentId}/lineitems/",
    "methods": "GET, POST",
    "summary": "Get List of SalesOrdersLineItems"
  },
  {
    "module": "SalesOrdersLineItems",
    "path": "/sales/orders/{parentId}/lineitems/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get SalesOrdersLineItems"
  },
  {
    "module": "Orders",
    "path": "/sales/orders/conversions/{id}",
    "methods": "GET",
    "summary": "Get Conversion"
  },
  {
    "module": "OrderStatuses",
    "path": "/sales/orders/statuses",
    "methods": "GET, POST",
    "summary": "Get List of OrderStatus"
  },
  {
    "module": "OrderStatuses",
    "path": "/sales/orders/statuses/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get OrderStatus"
  },
  {
    "module": "OrderStatuses",
    "path": "/sales/orders/statuses/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "OrderStatuses",
    "path": "/sales/orders/statuses/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "OrderStatusesEmailTemplate",
    "path": "/sales/orders/statuses/{parentId}/emailtemplates/",
    "methods": "GET, POST",
    "summary": "Get List of OrderStatusEmailTemplate"
  },
  {
    "module": "OrderStatusesEmailTemplate",
    "path": "/sales/orders/statuses/{parentId}/emailtemplates/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get OrderStatusEmailTemplate"
  },
  {
    "module": "OrderStatusNotifications",
    "path": "/sales/orders/statuses/{parentId}/notifications",
    "methods": "GET, POST",
    "summary": "Get List of OrderStatusNotification"
  },
  {
    "module": "OrderStatusNotifications",
    "path": "/sales/orders/statuses/{parentId}/notifications/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get OrderStatusNotification"
  },
  {
    "module": "SalesProbabilities",
    "path": "/sales/probabilities",
    "methods": "GET, POST",
    "summary": "Get List of SalesProbability"
  },
  {
    "module": "SalesProbabilities",
    "path": "/sales/probabilities/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get SalesProbability"
  },
  {
    "module": "SalesQuotas",
    "path": "/sales/quotas",
    "methods": "GET, POST",
    "summary": "Get List of SalesQuota"
  },
  {
    "module": "SalesQuotas",
    "path": "/sales/quotas/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get SalesQuota"
  },
  {
    "module": "Roles",
    "path": "/sales/roles",
    "methods": "GET, POST",
    "summary": "Get List of Role"
  },
  {
    "module": "Roles",
    "path": "/sales/roles/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Role"
  },
  {
    "module": "SalesTeams",
    "path": "/sales/salesTeams",
    "methods": "GET, POST",
    "summary": "Get List of SalesTeam"
  },
  {
    "module": "SalesTeams",
    "path": "/sales/salesTeams/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get SalesTeam"
  },
  {
    "module": "SalesTeamMembers",
    "path": "/sales/salesTeams/{parentId}/members",
    "methods": "GET, POST",
    "summary": "Get List of SalesTeamMember"
  },
  {
    "module": "SalesTeamMembers",
    "path": "/sales/salesTeams/{parentId}/members/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get SalesTeamMember"
  },
  {
    "module": "OpportunityStages",
    "path": "/sales/stages",
    "methods": "GET, POST",
    "summary": "Get List of Stage"
  },
  {
    "module": "OpportunityStages",
    "path": "/sales/stages/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Stage"
  },
  {
    "module": "OpportunityStages",
    "path": "/sales/stages/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "OpportunityStages",
    "path": "/sales/stages/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "Calendars",
    "path": "/schedule/calendars",
    "methods": "GET, POST",
    "summary": "Working-hours calendars (weekday start/end + holidayList); a member's calendar points here.",
    "coveredBy": "cw_get_member"
  },
  {
    "module": "Calendars",
    "path": "/schedule/calendars/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Calendar"
  },
  {
    "module": "Calendars",
    "path": "/schedule/calendars/{id}/copy",
    "methods": "POST",
    "summary": "Post Calendar"
  },
  {
    "module": "Calendars",
    "path": "/schedule/calendars/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "Calendars",
    "path": "/schedule/calendars/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "ScheduleColors",
    "path": "/schedule/colors",
    "methods": "GET",
    "summary": "Get List of ScheduleColor"
  },
  {
    "module": "ScheduleColors",
    "path": "/schedule/colors/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get ScheduleColor"
  },
  {
    "module": "ScheduleColors",
    "path": "/schedule/colors/{id}/clear",
    "methods": "POST",
    "summary": "Post ScheduleColor"
  },
  {
    "module": "ScheduleColors",
    "path": "/schedule/colors/reset",
    "methods": "POST",
    "summary": "Post List of ScheduleColor"
  },
  {
    "module": "ScheduleEntryDetails",
    "path": "/schedule/details",
    "methods": "GET",
    "summary": "Get List of ScheduleEntryDetail"
  },
  {
    "module": "ScheduleEntryDetails",
    "path": "/schedule/details/{id}",
    "methods": "GET",
    "summary": "Get ScheduleEntryDetail"
  },
  {
    "module": "ScheduleEntries",
    "path": "/schedule/entries",
    "methods": "GET, POST",
    "summary": "Schedule / dispatch entries. objectId = scheduled ticket id; type/identifier \"S\" = service ticket.",
    "coveredBy": "cw_list_schedule_entries, cw_my_schedule, cw_schedule_ticket, cw_update_schedule_entry, cw_delete_schedule_entry",
    "keyParams": "member/identifier, objectId, dateStart",
    "commonFields": "id,objectId,name,member/identifier,type/identifier,status/name,dateStart,dateEnd,hours,doneFlag"
  },
  {
    "module": "ScheduleEntries",
    "path": "/schedule/entries/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ScheduleEntry"
  },
  {
    "module": "ScheduleEntries",
    "path": "/schedule/entries/{id}/{notifyResource}",
    "methods": "DELETE",
    "summary": "Delete ScheduleEntry"
  },
  {
    "module": "ScheduleDetails",
    "path": "/schedule/entries/{parentId}/details",
    "methods": "GET",
    "summary": "Get List of ScheduleDetail"
  },
  {
    "module": "ScheduleDetails",
    "path": "/schedule/entries/{parentId}/details/{id}",
    "methods": "GET",
    "summary": "Get ScheduleDetail"
  },
  {
    "module": "HolidayLists",
    "path": "/schedule/holidayLists",
    "methods": "GET, POST",
    "summary": "Get List of HolidayList"
  },
  {
    "module": "HolidayLists",
    "path": "/schedule/holidayLists/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get HolidayList"
  },
  {
    "module": "HolidayLists",
    "path": "/schedule/holidayLists/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "HolidayLists",
    "path": "/schedule/holidayLists/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "Holidays",
    "path": "/schedule/holidayLists/{parentId}/holidays",
    "methods": "GET, POST",
    "summary": "Get List of Holiday"
  },
  {
    "module": "Holidays",
    "path": "/schedule/holidayLists/{parentId}/holidays/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Holiday"
  },
  {
    "module": "HolidayLists",
    "path": "/schedule/holidayLists/copy",
    "methods": "POST",
    "summary": "Post HolidayList"
  },
  {
    "module": "PortalCalendars",
    "path": "/schedule/portalcalendars",
    "methods": "GET",
    "summary": "Get List of PortalCalendar"
  },
  {
    "module": "PortalCalendars",
    "path": "/schedule/portalcalendars/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get PortalCalendar"
  },
  {
    "module": "ScheduleReminderTime",
    "path": "/schedule/reminderTimes",
    "methods": "GET",
    "summary": "Get List of ScheduleReminderTime"
  },
  {
    "module": "ScheduleReminderTime",
    "path": "/schedule/reminderTimes/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get ScheduleReminderTime"
  },
  {
    "module": "ScheduleStatuses",
    "path": "/schedule/statuses",
    "methods": "GET, POST",
    "summary": "Get List of ScheduleStatus"
  },
  {
    "module": "ScheduleStatuses",
    "path": "/schedule/statuses/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ScheduleStatus"
  },
  {
    "module": "ScheduleTypes",
    "path": "/schedule/types",
    "methods": "GET, POST",
    "summary": "Get List of ScheduleType"
  },
  {
    "module": "ScheduleTypes",
    "path": "/schedule/types/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ScheduleType"
  },
  {
    "module": "ScheduleTypes",
    "path": "/schedule/types/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "ScheduleTypes",
    "path": "/schedule/types/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "Boards",
    "path": "/service/boards",
    "methods": "GET, POST",
    "summary": "Service boards.",
    "coveredBy": "cw_list_boards"
  },
  {
    "module": "BoardItemAssociations",
    "path": "/service/boards/{grandparentId}/items/{parentId}/associations",
    "methods": "GET",
    "summary": "Get List of BoardItemAssociation"
  },
  {
    "module": "BoardItemAssociations",
    "path": "/service/boards/{grandparentId}/items/{parentId}/associations/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get BoardItemAssociation"
  },
  {
    "module": "BoardStatusNotifications",
    "path": "/service/boards/{grandparentId}/statuses/{parentId}/notifications",
    "methods": "GET, POST",
    "summary": "Get List of BoardStatusNotification"
  },
  {
    "module": "BoardStatusNotifications",
    "path": "/service/boards/{grandparentId}/statuses/{parentId}/notifications/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get BoardStatusNotification"
  },
  {
    "module": "Boards",
    "path": "/service/boards/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Board"
  },
  {
    "module": "Boards",
    "path": "/service/boards/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "Boards",
    "path": "/service/boards/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "BoardAutoAssignResources",
    "path": "/service/boards/{parentId}/autoAssignResources",
    "methods": "GET, POST",
    "summary": "Get List of BoardAutoAssignResource"
  },
  {
    "module": "BoardAutoAssignResources",
    "path": "/service/boards/{parentId}/autoAssignResources/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get BoardAutoAssignResource"
  },
  {
    "module": "BoardAutoTemplates",
    "path": "/service/boards/{parentId}/autoTemplates",
    "methods": "GET, POST",
    "summary": "Get List of BoardAutoTemplate"
  },
  {
    "module": "BoardAutoTemplates",
    "path": "/service/boards/{parentId}/autoTemplates/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get BoardAutoTemplate"
  },
  {
    "module": "BoardExcludedMembers",
    "path": "/service/boards/{parentId}/excludedMembers",
    "methods": "GET, POST",
    "summary": "Get List of BoardExcludedMember"
  },
  {
    "module": "BoardExcludedMembers",
    "path": "/service/boards/{parentId}/excludedMembers/{id}",
    "methods": "GET, DELETE",
    "summary": "Get BoardExcludedMember"
  },
  {
    "module": "BoardItems",
    "path": "/service/boards/{parentId}/items",
    "methods": "GET, POST",
    "summary": "Get List of BoardItem"
  },
  {
    "module": "BoardItems",
    "path": "/service/boards/{parentId}/items/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get BoardItem"
  },
  {
    "module": "BoardItems",
    "path": "/service/boards/{parentId}/items/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "BoardItems",
    "path": "/service/boards/{parentId}/items/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "BoardNotifications",
    "path": "/service/boards/{parentId}/notifications",
    "methods": "GET, POST",
    "summary": "Get List of BoardNotification"
  },
  {
    "module": "BoardNotifications",
    "path": "/service/boards/{parentId}/notifications/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get BoardNotification"
  },
  {
    "module": "BoardSkillMappings",
    "path": "/service/boards/{parentId}/skillMappings/",
    "methods": "GET, POST",
    "summary": "Get List of BoardSkillMappings"
  },
  {
    "module": "BoardSkillMappings",
    "path": "/service/boards/{parentId}/skillMappings/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get BoardSkillMappings"
  },
  {
    "module": "BoardStatuses",
    "path": "/service/boards/{parentId}/statuses",
    "methods": "GET, POST",
    "summary": "Get List of BoardStatus"
  },
  {
    "module": "BoardStatuses",
    "path": "/service/boards/{parentId}/statuses/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get BoardStatus"
  },
  {
    "module": "BoardStatuses",
    "path": "/service/boards/{parentId}/statuses/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "BoardStatuses",
    "path": "/service/boards/{parentId}/statuses/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "BoardSubTypes",
    "path": "/service/boards/{parentId}/subtypes",
    "methods": "GET, POST",
    "summary": "Get List of BoardSubType"
  },
  {
    "module": "BoardSubTypes",
    "path": "/service/boards/{parentId}/subtypes/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get BoardSubType"
  },
  {
    "module": "BoardSubTypes",
    "path": "/service/boards/{parentId}/subtypes/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "BoardSubTypes",
    "path": "/service/boards/{parentId}/subtypes/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "BoardTeams",
    "path": "/service/boards/{parentId}/teams",
    "methods": "GET, POST",
    "summary": "Get List of BoardTeam"
  },
  {
    "module": "BoardTeams",
    "path": "/service/boards/{parentId}/teams/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get BoardTeam"
  },
  {
    "module": "BoardTeams",
    "path": "/service/boards/{parentId}/teams/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "BoardTypes",
    "path": "/service/boards/{parentId}/types",
    "methods": "GET, POST",
    "summary": "Get List of BoardType"
  },
  {
    "module": "BoardTypes",
    "path": "/service/boards/{parentId}/types/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get BoardType"
  },
  {
    "module": "BoardTypes",
    "path": "/service/boards/{parentId}/types/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "BoardTypes",
    "path": "/service/boards/{parentId}/types/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "BoardTypeSubTypeItemAssociation",
    "path": "/service/boards/{parentId}/typeSubTypeItemAssociations",
    "methods": "GET",
    "summary": "Get List of BoardTypeSubTypeItemAssociation"
  },
  {
    "module": "BoardTypeSubTypeItemAssociation",
    "path": "/service/boards/{parentId}/typeSubTypeItemAssociations/{id}",
    "methods": "GET",
    "summary": "Get BoardTypeSubTypeItemAssociation"
  },
  {
    "module": "Boards",
    "path": "/service/boards/copy",
    "methods": "POST",
    "summary": "Post Board"
  },
  {
    "module": "Codes",
    "path": "/service/codes",
    "methods": "GET, POST",
    "summary": "Get List of Code"
  },
  {
    "module": "Codes",
    "path": "/service/codes/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Code"
  },
  {
    "module": "ServiceEmailTemplates",
    "path": "/service/emailTemplates",
    "methods": "GET, POST",
    "summary": "Get List of ServiceEmailTemplate"
  },
  {
    "module": "ServiceEmailTemplates",
    "path": "/service/emailTemplates/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ServiceEmailTemplate"
  },
  {
    "module": "ServiceEmailTemplates",
    "path": "/service/emailTemplates/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "ServiceEmailTemplates",
    "path": "/service/emailTemplates/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "Impacts",
    "path": "/service/impacts",
    "methods": "GET",
    "summary": "Get List of Impact"
  },
  {
    "module": "Impacts",
    "path": "/service/impacts/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get Impact"
  },
  {
    "module": "BoardInfos",
    "path": "/service/info/boards",
    "methods": "GET",
    "summary": "Get List of BoardInfo"
  },
  {
    "module": "BoardInfos",
    "path": "/service/info/boards/{id}",
    "methods": "GET",
    "summary": "Get BoardInfo"
  },
  {
    "module": "BoardInfos",
    "path": "/service/info/boards/active",
    "methods": "GET",
    "summary": "Get List of active BoardInfo"
  },
  {
    "module": "BoardTypeInfos",
    "path": "/service/info/boardtypes",
    "methods": "GET",
    "summary": "Get List of BoardTypeInfo"
  },
  {
    "module": "BoardTypeInfos",
    "path": "/service/info/boardtypes/{id}",
    "methods": "GET",
    "summary": "Get BoardTypeInfo"
  },
  {
    "module": "KnowledgeBaseArticles",
    "path": "/service/knowledgeBaseArticles",
    "methods": "GET, POST",
    "summary": "Get List of KnowledgeBaseArticle"
  },
  {
    "module": "KnowledgeBaseArticles",
    "path": "/service/knowledgeBaseArticles/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get KnowledgeBaseArticle"
  },
  {
    "module": "KnowledgeBaseCategories",
    "path": "/service/knowledgeBaseCategories",
    "methods": "GET, POST",
    "summary": "Get List of KnowledgeBaseCategory"
  },
  {
    "module": "KnowledgeBaseCategories",
    "path": "/service/knowledgeBaseCategories/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get KnowledgeBaseCategory"
  },
  {
    "module": "KnowledgeBaseSettingses",
    "path": "/service/knowledgebasesettings",
    "methods": "GET, POST",
    "summary": "Get KnowledgeBaseSettings"
  },
  {
    "module": "KnowledgeBaseSettingses",
    "path": "/service/knowledgebasesettings/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get KnowledgeBaseSettings"
  },
  {
    "module": "KnowledgeBaseSubCategories",
    "path": "/service/knowledgeBaseSubCategories",
    "methods": "GET, POST",
    "summary": "Get List of KnowledgeBaseSubCategory"
  },
  {
    "module": "KnowledgeBaseSubCategories",
    "path": "/service/knowledgeBaseSubCategories/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get KnowledgeBaseSubCategory"
  },
  {
    "module": "KnowledgeBaseSubCategories",
    "path": "/service/knowledgeBaseSubCategories/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "KnowledgeBaseSubCategories",
    "path": "/service/knowledgeBaseSubCategories/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "ServiceLocations",
    "path": "/service/locations",
    "methods": "GET, POST",
    "summary": "Get List of ServiceLocation"
  },
  {
    "module": "ServiceLocations",
    "path": "/service/locations/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ServiceLocation"
  },
  {
    "module": "ServiceLocations",
    "path": "/service/locations/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "Locations",
    "path": "/service/locations/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "Priorities",
    "path": "/service/priorities",
    "methods": "GET, POST",
    "summary": "Ticket priorities.",
    "coveredBy": "cw_list_priorities"
  },
  {
    "module": "Priorities",
    "path": "/service/priorities/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Priority"
  },
  {
    "module": "Priorities",
    "path": "/service/priorities/{id}/image",
    "methods": "GET",
    "summary": "Get Priority"
  },
  {
    "module": "Priorities",
    "path": "/service/priorities/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "Priorities",
    "path": "/service/priorities/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "ServiceSignoffs",
    "path": "/service/serviceSignoff",
    "methods": "GET, POST",
    "summary": "Get List of ServiceSignoff"
  },
  {
    "module": "ServiceSignoffs",
    "path": "/service/serviceSignoff/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ServiceSignoff"
  },
  {
    "module": "ServiceSignoffs",
    "path": "/service/serviceSignoff/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "ServiceSignoffs",
    "path": "/service/serviceSignoff/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "ServiceSignoffCustomField",
    "path": "/service/serviceSignoff/{parentId}/signoffcustomfields",
    "methods": "GET, POST",
    "summary": "Get List of ServiceSignoffCustomField"
  },
  {
    "module": "ServiceSignoffCustomField",
    "path": "/service/serviceSignoff/{parentId}/signoffcustomfields/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ServiceSignoffCustomField"
  },
  {
    "module": "Severities",
    "path": "/service/severities",
    "methods": "GET",
    "summary": "Get List of Severity"
  },
  {
    "module": "Severities",
    "path": "/service/severities/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get Severity"
  },
  {
    "module": "SLAs",
    "path": "/service/SLAs",
    "methods": "GET, POST",
    "summary": "Get List of SLA"
  },
  {
    "module": "SLAs",
    "path": "/service/SLAs/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get SLA"
  },
  {
    "module": "SLAs",
    "path": "/service/SLAs/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "SLAs",
    "path": "/service/SLAs/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "SLAPriorities",
    "path": "/service/SLAs/{parentId}/priorities",
    "methods": "GET, POST",
    "summary": "Get List of SLAPriority"
  },
  {
    "module": "SLAPriorities",
    "path": "/service/SLAs/{parentId}/priorities/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get SLAPriority"
  },
  {
    "module": "Sources",
    "path": "/service/sources",
    "methods": "GET, POST",
    "summary": "Get List of Source"
  },
  {
    "module": "Sources",
    "path": "/service/sources/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Source"
  },
  {
    "module": "Sources",
    "path": "/service/sources/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "Sources",
    "path": "/service/sources/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "ServiceSurveys",
    "path": "/service/surveys",
    "methods": "GET, POST",
    "summary": "Get List of ServiceSurvey"
  },
  {
    "module": "SurveyOptions",
    "path": "/service/surveys/{grandparentId}/questions/{parentId}/options",
    "methods": "GET, POST",
    "summary": "Get List of SurveyOption"
  },
  {
    "module": "SurveyOptions",
    "path": "/service/surveys/{grandparentId}/questions/{parentId}/options/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get SurveyOption"
  },
  {
    "module": "ServiceSurveys",
    "path": "/service/surveys/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ServiceSurvey"
  },
  {
    "module": "ServiceSurveys",
    "path": "/service/surveys/{id}/copy",
    "methods": "POST",
    "summary": "Post ServiceSurvey"
  },
  {
    "module": "ServiceSurveys",
    "path": "/service/surveys/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "ServiceSurveys",
    "path": "/service/surveys/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "ServiceSurveyQuestions",
    "path": "/service/surveys/{parentId}/questions",
    "methods": "GET, POST",
    "summary": "Get List of ServiceSurveyQuestion"
  },
  {
    "module": "ServiceSurveyQuestions",
    "path": "/service/surveys/{parentId}/questions/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ServiceSurveyQuestion"
  },
  {
    "module": "ServiceSurveyQuestions",
    "path": "/service/surveys/{parentId}/questions/{id}/copy",
    "methods": "POST",
    "summary": "Post ServiceSurveyQuestion"
  },
  {
    "module": "SurveyResults",
    "path": "/service/surveys/{parentId}/results",
    "methods": "GET, POST",
    "summary": "Get List of SurveyResult"
  },
  {
    "module": "SurveyResults",
    "path": "/service/surveys/{parentId}/results/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get SurveyResult"
  },
  {
    "module": "TeamMembers",
    "path": "/service/teamMembers",
    "methods": "POST",
    "summary": "Post TeamMember"
  },
  {
    "module": "ServiceTeams",
    "path": "/service/teams",
    "methods": "GET",
    "summary": "Get List of ServiceTeam"
  },
  {
    "module": "ServiceTeams",
    "path": "/service/teams/{id}",
    "methods": "GET",
    "summary": "Get ServiceTeam"
  },
  {
    "module": "ServiceTemplates",
    "path": "/service/templates",
    "methods": "GET, POST",
    "summary": "Get List of ServiceTemplate"
  },
  {
    "module": "ServiceTemplates",
    "path": "/service/templates/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ServiceTemplate"
  },
  {
    "module": "ServiceTemplates",
    "path": "/service/templates/{id}/generate",
    "methods": "POST",
    "summary": "Post Count of ServiceTemplate"
  },
  {
    "module": "ServiceTemplateTasks",
    "path": "/service/templates/{parentId}/tasks",
    "methods": "GET, POST",
    "summary": "Get List of Tasks"
  },
  {
    "module": "ServiceTemplateTasks",
    "path": "/service/templates/{parentId}/tasks/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Task"
  },
  {
    "module": "ServiceTicketLinks",
    "path": "/service/ticketLinks",
    "methods": "GET, POST",
    "summary": "Get List of ServiceTicketLink"
  },
  {
    "module": "ServiceTicketLinks",
    "path": "/service/ticketLinks/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ServiceTicketLink"
  },
  {
    "module": "Tickets",
    "path": "/service/tickets",
    "methods": "GET, POST",
    "summary": "Service tickets — search, get, create, update.",
    "coveredBy": "cw_search_tickets, cw_get_ticket, cw_create_ticket, cw_update_ticket",
    "keyParams": "company/id, board/name, status/name, closedFlag, summary, contact/id",
    "commonFields": "id,summary,status/name,board/name,company/name,priority/name,owner/identifier"
  },
  {
    "module": "Tickets",
    "path": "/service/tickets/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Ticket"
  },
  {
    "module": "Tickets",
    "path": "/service/tickets/{id}/copy",
    "methods": "POST",
    "summary": "Post TicketCopy"
  },
  {
    "module": "Tickets",
    "path": "/service/tickets/{parentId}/activities",
    "methods": "GET",
    "summary": "Get List of ActivityReference Gets activities associated to the ticket Please use the /sales/activities?conditions=ticket/id={id} endpoint"
  },
  {
    "module": "ServiceTicketNotes",
    "path": "/service/tickets/{parentId}/allNotes",
    "methods": "GET",
    "summary": "Get List of ServiceTicketNote"
  },
  {
    "module": "Tickets",
    "path": "/service/tickets/{parentId}/attachChildren",
    "methods": "POST",
    "summary": "Post SuccessResponse"
  },
  {
    "module": "Tickets",
    "path": "/service/tickets/{parentId}/configurations",
    "methods": "GET, POST",
    "summary": "Get List of ConfigurationReference"
  },
  {
    "module": "Tickets",
    "path": "/service/tickets/{parentId}/configurations/{id}",
    "methods": "GET, DELETE",
    "summary": "Get ConfigurationReference"
  },
  {
    "module": "Tickets",
    "path": "/service/tickets/{parentId}/convert",
    "methods": "POST",
    "summary": "Post SuccessResponse"
  },
  {
    "module": "Tickets",
    "path": "/service/tickets/{parentId}/documents",
    "methods": "GET",
    "summary": "Get List of DocumentReference Gets the documents associated to the ticket Please use the /system/documents?recordType=Ticket&amp;recordId={id} endpoint"
  },
  {
    "module": "Tickets",
    "path": "/service/tickets/{parentId}/merge",
    "methods": "POST",
    "summary": "Post SuccessResponse"
  },
  {
    "module": "TicketNotes",
    "path": "/service/tickets/{parentId}/notes",
    "methods": "GET, POST",
    "summary": "Get List of ServiceNote"
  },
  {
    "module": "TicketNotes",
    "path": "/service/tickets/{parentId}/notes/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ServiceNote"
  },
  {
    "module": "Tickets",
    "path": "/service/tickets/{parentId}/products",
    "methods": "GET",
    "summary": "Get List of ProductReference Gets the products associated to the ticket Please use the /procurement/products?conditions=chargeToType='Ticket' AND chargeToId={id} endpoint"
  },
  {
    "module": "Tickets",
    "path": "/service/tickets/{parentId}/scheduleentries",
    "methods": "GET",
    "summary": "Get List of ScheduleEntryReference Gets the schedule entries associated to the ticket Please use the /schedule/entries?conditions=type/id=4 AND objectId={id} endpoint"
  },
  {
    "module": "TicketTasks",
    "path": "/service/tickets/{parentId}/tasks",
    "methods": "GET, POST",
    "summary": "Get List of Task"
  },
  {
    "module": "TicketTasks",
    "path": "/service/tickets/{parentId}/tasks/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Task"
  },
  {
    "module": "Tickets",
    "path": "/service/tickets/{parentId}/timeentries",
    "methods": "GET",
    "summary": "Get List of TimeEntryReference Gets time entries associated to the ticket Please use the /time/entries?conditions=(chargeToType=\"ServiceTicket\" OR chargeToType=\"ProjectTicket\") AND"
  },
  {
    "module": "TicketContactAuthentications",
    "path": "/service/tickets/authstatus",
    "methods": "GET",
    "summary": "Get List of TicketContactAuthentications"
  },
  {
    "module": "TicketContactAuthentications",
    "path": "/service/tickets/authstatus/{id}",
    "methods": "GET",
    "summary": "Get TicketContactAuthentications"
  },
  {
    "module": "Tickets",
    "path": "/service/tickets/calculateSla",
    "methods": "GET",
    "summary": "Get List of v2015_3.Service.Ticket.Ticket with SLA calculated"
  },
  {
    "module": "TicketChangeLog",
    "path": "/service/tickets/changelogs",
    "methods": "GET, DELETE",
    "summary": "Get List of Ticket Change Log"
  },
  {
    "module": "Tickets",
    "path": "/service/tickets/search",
    "methods": "POST",
    "summary": "Post List of Ticket"
  },
  {
    "module": "TicketSyncs",
    "path": "/service/ticketSyncs",
    "methods": "GET, POST",
    "summary": "Get List of TicketSync"
  },
  {
    "module": "TicketSyncs",
    "path": "/service/ticketSyncs/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get TicketSync"
  },
  {
    "module": "AllowedFileType",
    "path": "/system/allowedfiletypes/",
    "methods": "GET",
    "summary": "Get List of AllowedFileType"
  },
  {
    "module": "AllowedFileType",
    "path": "/system/AllowedFileTypes/",
    "methods": "POST",
    "summary": "Post AllowedFileType"
  },
  {
    "module": "AllowedFileType",
    "path": "/system/allowedfiletypes/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get AllowedFileType"
  },
  {
    "module": "AllowedOrigins",
    "path": "/system/allowedorigins",
    "methods": "GET, POST",
    "summary": "Get List of AllowedOrigin"
  },
  {
    "module": "AllowedOrigins",
    "path": "/system/allowedorigins/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get AllowedOrigin"
  },
  {
    "module": "ApiMembers",
    "path": "/system/apiMembers",
    "methods": "GET, POST",
    "summary": "Get List of ApiMember"
  },
  {
    "module": "ApiMembers",
    "path": "/system/apiMembers/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get ApiMember"
  },
  {
    "module": "ApiMembers",
    "path": "/system/apiMembers/default",
    "methods": "GET",
    "summary": "Get ApiMember"
  },
  {
    "module": "AuditTrail",
    "path": "/system/audittrail",
    "methods": "GET",
    "summary": "Audit trail of ONE record — who changed what, when. Requires its own query params via cw_get's params argument: {\"type\":…,\"id\":…}.",
    "keyParams": "params={\"type\":\"Ticket\",\"id\":123} — types (v2025.1): Ticket, Company, Contact, Agreement, Invoice, Time (time entries), Expense, PurchaseOrder, Project, Opportunity, Configuration",
    "notes": "Per-record only (no global/member-wide query). Nonexistent id → 400, not 404."
  },
  {
    "module": "AuthAnvils",
    "path": "/system/authAnvils",
    "methods": "GET",
    "summary": "Get List of v2015_3.System.AuthAnvil.AuthAnvil"
  },
  {
    "module": "AuthAnvils",
    "path": "/system/authAnvils/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get v2015_3.System.AuthAnvil.AuthAnvil"
  },
  {
    "module": "AuthAnvils",
    "path": "/system/authAnvils/testConnection",
    "methods": "GET",
    "summary": "Get SuccessResponse"
  },
  {
    "module": "AutoSyncTimes",
    "path": "/system/autoSyncTime",
    "methods": "GET, POST",
    "summary": "Get List of AutoSyncTime"
  },
  {
    "module": "AutoSyncTimes",
    "path": "/system/autoSyncTime/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get AutoSyncTime"
  },
  {
    "module": "Bundles",
    "path": "/system/bundles",
    "methods": "POST",
    "summary": "Post BundleResultsCollection"
  },
  {
    "module": "CallbackEntries",
    "path": "/system/callbacks",
    "methods": "GET, POST",
    "summary": "Get List of CallbackEntry"
  },
  {
    "module": "CallbackEntries",
    "path": "/system/callbacks/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get CallbackEntry"
  },
  {
    "module": "Certifications",
    "path": "/system/certifications",
    "methods": "GET, POST",
    "summary": "Get List of Certification"
  },
  {
    "module": "Certifications",
    "path": "/system/certifications/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Certification"
  },
  {
    "module": "Certifications",
    "path": "/system/certifications/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "Certifications",
    "path": "/system/certifications/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "ConnectWiseHostedScreens",
    "path": "/system/connectWiseHostedScreens",
    "methods": "GET",
    "summary": "Get List of ConnectWiseHostedScreen"
  },
  {
    "module": "ConnectWiseHostedScreens",
    "path": "/system/connectWiseHostedScreens/{id}",
    "methods": "GET",
    "summary": "Get ConnectWiseHostedScreen"
  },
  {
    "module": "ConnectWiseHostedSetups",
    "path": "/system/connectwisehostedsetups",
    "methods": "GET, POST",
    "summary": "Get List of ConnectWiseHostedSetup"
  },
  {
    "module": "ConnectWiseHostedSetups",
    "path": "/system/connectwisehostedsetups/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ConnectWiseHostedSetup"
  },
  {
    "module": "M365ContactSyncMonitorings",
    "path": "/system/contactsync/monitoring",
    "methods": "GET",
    "summary": "Get List of M365ContactSyncMonitorings"
  },
  {
    "module": "M365ContactSyncMonitorings",
    "path": "/system/contactsync/monitoring/",
    "methods": "POST, PATCH",
    "summary": "Create Async"
  },
  {
    "module": "M365ContactSyncMonitorings",
    "path": "/system/contactsync/monitoring/{id}",
    "methods": "GET",
    "summary": "Get M365ContactSyncMonitorings"
  },
  {
    "module": "M365ContactSyncMonitorings",
    "path": "/system/contactsync/monitoring/notificationtype/",
    "methods": "GET",
    "summary": "Get M365ContactSyncMonitoringNotification TypeId Async"
  },
  {
    "module": "M365ContactSyncMonitorings",
    "path": "/system/contactsync/monitoring/type/{id}",
    "methods": "GET, DELETE",
    "summary": "Get M365ContactSyncMonitoring By TypeId Async"
  },
  {
    "module": "CustomFieldInfos",
    "path": "/system/customFieldInfos",
    "methods": "GET",
    "summary": "Get List of CustomFieldInfos"
  },
  {
    "module": "CustomReports",
    "path": "/system/customReports",
    "methods": "GET, POST",
    "summary": "Get List of CustomReport"
  },
  {
    "module": "CustomReports",
    "path": "/system/customReports/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get CustomReport"
  },
  {
    "module": "CustomReportParameters",
    "path": "/system/customReports/{parentId}/parameters",
    "methods": "GET, POST",
    "summary": "Get List of CustomReportParameter"
  },
  {
    "module": "CustomReportParameters",
    "path": "/system/customReports/{parentId}/parameters/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get CustomReportParameter"
  },
  {
    "module": "CwTimeZones",
    "path": "/system/cwTimeZones",
    "methods": "GET",
    "summary": "Get List of CwTimeZone"
  },
  {
    "module": "CwTimeZones",
    "path": "/system/cwTimeZones/{id}",
    "methods": "GET",
    "summary": "Get CwTimeZone"
  },
  {
    "module": "Departments",
    "path": "/system/departments",
    "methods": "GET, POST",
    "summary": "Get List of Department"
  },
  {
    "module": "Departments",
    "path": "/system/departments/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Department"
  },
  {
    "module": "Departments",
    "path": "/system/departments/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "Departments",
    "path": "/system/departments/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "DepartmentLocations",
    "path": "/system/departments/{parentId}/locations",
    "methods": "GET, POST",
    "summary": "Get List of DepartmentLocation"
  },
  {
    "module": "DepartmentLocations",
    "path": "/system/departments/{parentId}/locations/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get DepartmentLocation"
  },
  {
    "module": "Documents",
    "path": "/system/documents",
    "methods": "GET, POST",
    "summary": "Get List of DocumentInfo"
  },
  {
    "module": "Documents",
    "path": "/system/documents/{id}",
    "methods": "GET, POST, DELETE",
    "summary": "Get DocumentInfo"
  },
  {
    "module": "Documents",
    "path": "/system/documents/{id}/download",
    "methods": "GET",
    "summary": "Get DocumentInfo"
  },
  {
    "module": "Documents",
    "path": "/system/documents/{id}/thumbnail",
    "methods": "GET",
    "summary": "Get DocumentInfo"
  },
  {
    "module": "Documents",
    "path": "/system/documents/uploadsample",
    "methods": "GET",
    "summary": "Get DocumentInfo"
  },
  {
    "module": "EmailConnectors",
    "path": "/system/emailConnectors",
    "methods": "GET, POST",
    "summary": "Get List of EmailConnector"
  },
  {
    "module": "EmailConnectorParsingRules",
    "path": "/system/emailConnectors/{grandparentId}/parsingStyles/{parentId}/parsingRules",
    "methods": "GET, POST",
    "summary": "Get List of EmailConnectorParsingRule"
  },
  {
    "module": "EmailConnectorParsingRules",
    "path": "/system/emailConnectors/{grandparentId}/parsingStyles/{parentId}/parsingRules/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get EmailConnectorParsingRule"
  },
  {
    "module": "EmailConnectors",
    "path": "/system/emailConnectors/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get EmailConnector"
  },
  {
    "module": "EmailConnectorParsingStyles",
    "path": "/system/emailConnectors/{parentId}/parsingStyles",
    "methods": "GET, POST",
    "summary": "Get List of EmailConnectorParsingStyle"
  },
  {
    "module": "EmailConnectorParsingStyles",
    "path": "/system/emailConnectors/{parentId}/parsingStyles/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get EmailConnectorParsingStyle"
  },
  {
    "module": "EmailExclusions",
    "path": "/system/emailExclusions",
    "methods": "GET, POST",
    "summary": "Get List of EmailExclusion"
  },
  {
    "module": "EmailExclusions",
    "path": "/system/emailExclusions/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get EmailExclusion"
  },
  {
    "module": "EmailTokens",
    "path": "/system/emailTokens",
    "methods": "GET",
    "summary": "Get List of EmailToken"
  },
  {
    "module": "EmailTokens",
    "path": "/system/emailTokens/{id}",
    "methods": "GET",
    "summary": "Get EmailToken"
  },
  {
    "module": "EPayConfigurations",
    "path": "/system/ePayConfigurations",
    "methods": "GET, POST",
    "summary": "Get List of EPayConfiguration"
  },
  {
    "module": "EPayConfigurations",
    "path": "/system/ePayConfigurations/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get EPayConfiguration"
  },
  {
    "module": "Experiments",
    "path": "/system/experiments",
    "methods": "GET",
    "summary": "Get List of Experiment"
  },
  {
    "module": "Experiments",
    "path": "/system/experiments/{id}",
    "methods": "GET",
    "summary": "Get Experiment"
  },
  {
    "module": "FileUploadSettings",
    "path": "/system/fileuploadsettings/",
    "methods": "GET",
    "summary": "Get List of FileUploadSettings"
  },
  {
    "module": "FileUploadSettings",
    "path": "/system/fileuploadsettings/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get FileUploadSettings"
  },
  {
    "module": "GoogleEmailSetups",
    "path": "/system/googleemailsetup/",
    "methods": "GET, POST",
    "summary": "Get List of GoogleEmailSetups"
  },
  {
    "module": "GoogleEmailSetups",
    "path": "/system/googleemailsetup/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get GoogleEmailSetups"
  },
  {
    "module": "GoogleEmailSetups",
    "path": "/system/googleemailsetup/{id}/testConnection",
    "methods": "POST",
    "summary": "Post SuccessResponse"
  },
  {
    "module": "Imaps",
    "path": "/system/imaps",
    "methods": "GET, POST",
    "summary": "Get List of Imap"
  },
  {
    "module": "Imaps",
    "path": "/system/imaps/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Imap"
  },
  {
    "module": "ImportsMassMaintenance",
    "path": "/system/importMassMaintenance/{id}",
    "methods": "POST",
    "summary": "Post ImportMassMaintenance"
  },
  {
    "module": "DepartmentLocationInfos",
    "path": "/system/info/departmentlocations",
    "methods": "GET",
    "summary": "Get List of DepartmentLocationInfo"
  },
  {
    "module": "DepartmentLocationInfos",
    "path": "/system/info/departmentlocations/{id}",
    "methods": "GET",
    "summary": "Get DepartmentLocationInfo"
  },
  {
    "module": "DepartmentInfos",
    "path": "/system/info/departments",
    "methods": "GET",
    "summary": "Get List of DepartmentInfo"
  },
  {
    "module": "DepartmentInfos",
    "path": "/system/info/departments/{id}",
    "methods": "GET",
    "summary": "Get DepartmentInfo"
  },
  {
    "module": "LinkInfos",
    "path": "/system/info/links",
    "methods": "GET",
    "summary": "Get List of LinkInfo"
  },
  {
    "module": "LinkInfos",
    "path": "/system/info/links/{id}",
    "methods": "GET",
    "summary": "Get LinkInfo"
  },
  {
    "module": "LinkInfos",
    "path": "/system/info/links/{id}/resolveurl",
    "methods": "POST",
    "summary": "Post LinkResolveUrlInfo"
  },
  {
    "module": "LocaleInfos",
    "path": "/system/info/locales",
    "methods": "GET",
    "summary": "Get List of LocaleInfo"
  },
  {
    "module": "LocaleInfos",
    "path": "/system/info/locales/{id}",
    "methods": "GET",
    "summary": "Get LocaleInfo"
  },
  {
    "module": "LocationInfos",
    "path": "/system/info/locations",
    "methods": "GET",
    "summary": "Get List of LocationInfo"
  },
  {
    "module": "LocationInfos",
    "path": "/system/info/locations/{id}",
    "methods": "GET",
    "summary": "Get LocationInfo"
  },
  {
    "module": "MemberInfos",
    "path": "/system/info/members",
    "methods": "GET",
    "summary": "Get List of MemberInfo"
  },
  {
    "module": "MemberInfos",
    "path": "/system/info/members/{id}",
    "methods": "GET",
    "summary": "Get MemberInfo"
  },
  {
    "module": "MemberInfos",
    "path": "/system/info/members/{memberIdentifier:regex(^(types. |(",
    "methods": "GET",
    "summary": "Get MemberInfo"
  },
  {
    "module": "PersonasInfos",
    "path": "/system/info/personas",
    "methods": "GET",
    "summary": "Get List of PersonasInfo"
  },
  {
    "module": "PersonasInfos",
    "path": "/system/info/personas/{id}",
    "methods": "GET",
    "summary": "Get PersonasInfo"
  },
  {
    "module": "StandardNoteInfos",
    "path": "/system/info/standardNotes",
    "methods": "GET",
    "summary": "Get List of StandardNoteInfo"
  },
  {
    "module": "StandardNoteInfos",
    "path": "/system/info/standardNotes/{id}",
    "methods": "GET",
    "summary": "Get StandardNoteInfo"
  },
  {
    "module": "InOutBoards",
    "path": "/system/inOutBoards",
    "methods": "GET, POST",
    "summary": "Get List of InOutBoard"
  },
  {
    "module": "InOutBoards",
    "path": "/system/inOutBoards/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get InOutBoard"
  },
  {
    "module": "InOutTypes",
    "path": "/system/inOutTypes",
    "methods": "GET, POST",
    "summary": "Get List of InOutType"
  },
  {
    "module": "InOutTypes",
    "path": "/system/inOutTypes/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get InOutType"
  },
  {
    "module": "IntegratorLogins",
    "path": "/system/integratorlogins",
    "methods": "GET, POST",
    "summary": "Get List of IntegratorLogin"
  },
  {
    "module": "IntegratorLogins",
    "path": "/system/integratorlogins/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get IntegratorLogin"
  },
  {
    "module": "IntegratorTags",
    "path": "/system/integratorTags",
    "methods": "GET, POST",
    "summary": "Get List of IntegratorTag"
  },
  {
    "module": "IntegratorTags",
    "path": "/system/integratorTags/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get IntegratorTag"
  },
  {
    "module": "KPICategories",
    "path": "/system/kpiCategories",
    "methods": "GET",
    "summary": "Get List of KPICategory"
  },
  {
    "module": "KPICategories",
    "path": "/system/kpiCategories/{id}",
    "methods": "GET",
    "summary": "Get KPICategory"
  },
  {
    "module": "KPIs",
    "path": "/system/kpis",
    "methods": "GET",
    "summary": "Get List of KPI"
  },
  {
    "module": "KPIs",
    "path": "/system/kpis/{id}",
    "methods": "GET",
    "summary": "Get KPI"
  },
  {
    "module": "LdapConfigurations",
    "path": "/system/ldapConfigurations",
    "methods": "GET, POST",
    "summary": "Get List of LdapConfiguration"
  },
  {
    "module": "LdapConfigurations",
    "path": "/system/ldapConfigurations/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get LdapConfiguration"
  },
  {
    "module": "LdapConfigurations",
    "path": "/system/ldapConfigurations/testLink",
    "methods": "POST",
    "summary": "Post SuccessResponse"
  },
  {
    "module": "Links",
    "path": "/system/links",
    "methods": "GET, POST",
    "summary": "Get List of Link"
  },
  {
    "module": "Links",
    "path": "/system/links/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Link"
  },
  {
    "module": "Locations",
    "path": "/system/locations",
    "methods": "GET, POST",
    "summary": "Get List of Location"
  },
  {
    "module": "Locations",
    "path": "/system/locations/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Location"
  },
  {
    "module": "Locations",
    "path": "/system/locations/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "Locations",
    "path": "/system/locations/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "LocationDepartments",
    "path": "/system/locations/{parentId}/departments",
    "methods": "GET",
    "summary": "Get List of LocationDepartment"
  },
  {
    "module": "LocationDepartments",
    "path": "/system/locations/{parentId}/departments/{id}",
    "methods": "GET",
    "summary": "Get LocationDepartment"
  },
  {
    "module": "LocationWorkRoles",
    "path": "/system/locations/{parentId}/workRoles",
    "methods": "GET",
    "summary": "Get List of LocationWorkRole"
  },
  {
    "module": "LocationWorkRoles",
    "path": "/system/locations/{parentId}/workRoles/{id}",
    "methods": "GET",
    "summary": "Get LocationWorkRole"
  },
  {
    "module": "ManagementNetworksSecurity",
    "path": "/system/managementNetworkSecurities",
    "methods": "GET, POST",
    "summary": "Get List of ManagementNetworkSecurity"
  },
  {
    "module": "ManagementNetworksSecurity",
    "path": "/system/managementNetworkSecurities/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ManagementNetworkSecurity"
  },
  {
    "module": "ManagementNetworksSecurity",
    "path": "/system/managementNetworkSecurities/{id}/testCredentials",
    "methods": "GET",
    "summary": "Get SuccessResponse"
  },
  {
    "module": "MarketplaceImports",
    "path": "/system/marketplaceimport/getdefinition/{id}",
    "methods": "GET",
    "summary": "Get MarketplaceImport"
  },
  {
    "module": "MarketplaceImports",
    "path": "/system/marketplaceimport/import",
    "methods": "POST",
    "summary": "Post MarketplaceImport"
  },
  {
    "module": "Members",
    "path": "/system/members",
    "methods": "GET, POST",
    "summary": "Members (staff): timezone, calendar, capacity, dispatch flags.",
    "coveredBy": "cw_list_members, cw_get_member",
    "keyParams": "identifier, inactiveFlag",
    "commonFields": "id,identifier,firstName,lastName,timeZone/name,calendar/name,dailyCapacity,scheduleCapacity"
  },
  {
    "module": "Members",
    "path": "/system/members/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get Member"
  },
  {
    "module": "Members",
    "path": "/system/members/{id}/deactivate",
    "methods": "POST",
    "summary": "Post MemberDeactivation"
  },
  {
    "module": "MemberImages",
    "path": "/system/members/{id}/image",
    "methods": "GET",
    "summary": "Get"
  },
  {
    "module": "Members",
    "path": "/system/members/{id}/linkSsoUser",
    "methods": "POST",
    "summary": "Post SuccessResponse"
  },
  {
    "module": "Members",
    "path": "/system/members/{id}/submit",
    "methods": "POST",
    "summary": "Post SuccessResponse"
  },
  {
    "module": "Members",
    "path": "/system/members/{id}/unlinkSsoUser",
    "methods": "POST",
    "summary": "Post SuccessResponse"
  },
  {
    "module": "Members",
    "path": "/system/members/{id}/unusedTimeSheets",
    "methods": "DELETE",
    "summary": "Delete Member"
  },
  {
    "module": "Members",
    "path": "/system/members/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "Members",
    "path": "/system/members/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "Members",
    "path": "/system/members/{memberIdentifier:regex(^(types. |(",
    "methods": "GET",
    "summary": "Get Member"
  },
  {
    "module": "Members",
    "path": "/system/members/{memberIdentifier}/tokens",
    "methods": "POST",
    "summary": "Post Token"
  },
  {
    "module": "MemberAccruals",
    "path": "/system/members/{parentId}/accruals",
    "methods": "GET, POST",
    "summary": "Get List of MemberAccrual"
  },
  {
    "module": "MemberAccruals",
    "path": "/system/members/{parentId}/accruals/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get MemberAccrual"
  },
  {
    "module": "MemberCertifications",
    "path": "/system/members/{parentId}/certifications",
    "methods": "GET, POST",
    "summary": "Get List of MemberCertification"
  },
  {
    "module": "MemberCertifications",
    "path": "/system/members/{parentId}/certifications/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get MemberCertification"
  },
  {
    "module": "MemberDelegations",
    "path": "/system/members/{parentId}/delegations",
    "methods": "GET, POST",
    "summary": "Get List of MemberDelegation"
  },
  {
    "module": "MemberDelegations",
    "path": "/system/members/{parentId}/delegations/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get MemberDelegation"
  },
  {
    "module": "ManagedDeviceAccounts",
    "path": "/system/members/{parentId}/managedDeviceAccounts",
    "methods": "GET",
    "summary": "Get List of ManagedDeviceAccount"
  },
  {
    "module": "ManagedDeviceAccounts",
    "path": "/system/members/{parentId}/managedDeviceAccounts/bulk",
    "methods": "PUT, DELETE",
    "summary": "Put BulkResult"
  },
  {
    "module": "MyMemberCertifications",
    "path": "/system/members/{parentId}/mycertifications",
    "methods": "GET, POST",
    "summary": "Get List of MemberCertification"
  },
  {
    "module": "MyMemberCertifications",
    "path": "/system/members/{parentId}/mycertifications/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get MemberCertification"
  },
  {
    "module": "MemberNotificationSettings",
    "path": "/system/members/{parentId}/notificationSettings",
    "methods": "GET, POST",
    "summary": "Get List of MemberNotificationSetting"
  },
  {
    "module": "MemberNotificationSettings",
    "path": "/system/members/{parentId}/notificationSettings/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get MemberNotificationSetting"
  },
  {
    "module": "MemberPersonas",
    "path": "/system/members/{parentId}/personas",
    "methods": "GET, POST",
    "summary": "Get List of MemberPersona"
  },
  {
    "module": "MemberPersonas",
    "path": "/system/members/{parentId}/personas/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get MemberPersona"
  },
  {
    "module": "MemberSkills",
    "path": "/system/members/{parentId}/skills",
    "methods": "GET, POST",
    "summary": "Get List of MemberSkill"
  },
  {
    "module": "MemberSkills",
    "path": "/system/members/{parentId}/skills/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get MemberSkill"
  },
  {
    "module": "Members",
    "path": "/system/members/{ssoid}/deactivateIamMember",
    "methods": "POST",
    "summary": "Delete Member Via IAM"
  },
  {
    "module": "Members",
    "path": "/system/members/calendarsync",
    "methods": "GET",
    "summary": "Get List of Member to be use for calendar sync subscriptions"
  },
  {
    "module": "MemberTypes",
    "path": "/system/members/types",
    "methods": "GET, POST",
    "summary": "Get List of MemberType"
  },
  {
    "module": "MemberTypes",
    "path": "/system/members/types/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get MemberType"
  },
  {
    "module": "Members",
    "path": "/system/members/withSso",
    "methods": "GET",
    "summary": "Get List of Member"
  },
  {
    "module": "MemberTemplates",
    "path": "/system/membertemplates/",
    "methods": "GET, POST",
    "summary": "Get List of MemberTemplates"
  },
  {
    "module": "MemberTemplates",
    "path": "/system/membertemplates/{id}",
    "methods": "GET, PATCH",
    "summary": "Get MemberTemplates"
  },
  {
    "module": "MenuEntries",
    "path": "/system/menuentries",
    "methods": "GET, POST",
    "summary": "Get List of MenuEntry"
  },
  {
    "module": "MenuEntries",
    "path": "/system/menuentries/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get MenuEntry"
  },
  {
    "module": "MenuEntries",
    "path": "/system/menuentries/{id}/image",
    "methods": "GET, POST",
    "summary": "Get MenuEntry"
  },
  {
    "module": "MenuEntryLocations",
    "path": "/system/menuEntries/{parentId}/locations",
    "methods": "GET, POST",
    "summary": "Get List of MenuEntryLocation"
  },
  {
    "module": "MenuEntryLocations",
    "path": "/system/menuEntries/{parentId}/locations/{id}",
    "methods": "GET, DELETE",
    "summary": "Get MenuEntryLocation"
  },
  {
    "module": "MyAccounts",
    "path": "/system/myAccount/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get MyAccount"
  },
  {
    "module": "MemberDelegations",
    "path": "/system/myAccount/{parentId}/delegations",
    "methods": "GET, POST",
    "summary": "Get List of MemberDelegation"
  },
  {
    "module": "MemberDelegations",
    "path": "/system/myAccount/{parentId}/delegations/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get MemberDelegation"
  },
  {
    "module": "MemberSkills",
    "path": "/system/myAccount/{parentId}/skills",
    "methods": "GET, POST",
    "summary": "Get List of MemberSkill"
  },
  {
    "module": "MemberSkills",
    "path": "/system/myAccount/{parentId}/skills/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get MemberSkill"
  },
  {
    "module": "CorporateStructures",
    "path": "/system/myCompany/corporateStructure",
    "methods": "GET",
    "summary": "Get List of CorporateStructure"
  },
  {
    "module": "CorporateStructures",
    "path": "/system/myCompany/corporateStructure/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get CorporateStructure"
  },
  {
    "module": "CorporateStructureLevels",
    "path": "/system/myCompany/corporateStructureLevels",
    "methods": "GET",
    "summary": "Get List of CorporateStructureLevel"
  },
  {
    "module": "CorporateStructureLevels",
    "path": "/system/myCompany/corporateStructureLevels/{id}",
    "methods": "GET",
    "summary": "Get CorporateStructureLevel"
  },
  {
    "module": "Crms",
    "path": "/system/myCompany/crm",
    "methods": "GET",
    "summary": "Get List of Crm"
  },
  {
    "module": "Crms",
    "path": "/system/myCompany/crm/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get Crm"
  },
  {
    "module": "MyCompanyDocumentSetup",
    "path": "/system/mycompany/documents",
    "methods": "GET",
    "summary": "Get List of DocumentSetup"
  },
  {
    "module": "MyCompanyDocumentSetup",
    "path": "/system/mycompany/documents/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get DocumentSetup"
  },
  {
    "module": "MyCompanyServiceInfos",
    "path": "/system/mycompany/info/services",
    "methods": "GET",
    "summary": "Get List of ServiceInfo"
  },
  {
    "module": "MyCompanyServiceInfos",
    "path": "/system/mycompany/info/services/{id}",
    "methods": "GET",
    "summary": "Get ServiceInfo"
  },
  {
    "module": "Others",
    "path": "/system/myCompany/other",
    "methods": "GET",
    "summary": "Get List of Other"
  },
  {
    "module": "Others",
    "path": "/system/myCompany/other/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get Other"
  },
  {
    "module": "ReportingServices",
    "path": "/system/mycompany/reportingServices",
    "methods": "GET",
    "summary": "Get List of ReportingService"
  },
  {
    "module": "ReportingServices",
    "path": "/system/mycompany/reportingServices/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get ReportingService"
  },
  {
    "module": "ReportingServices",
    "path": "/system/mycompany/reportingServices/{id}/testConnection",
    "methods": "POST",
    "summary": "Post SuccessResponse"
  },
  {
    "module": "MyCompanyServices",
    "path": "/system/mycompany/services",
    "methods": "GET",
    "summary": "Get List of MyCompanyService"
  },
  {
    "module": "MyCompanyServices",
    "path": "/system/mycompany/services/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get MyCompanyService"
  },
  {
    "module": "TimeExpenses",
    "path": "/system/myCompany/timeExpense",
    "methods": "GET",
    "summary": "Get List of TimeExpense"
  },
  {
    "module": "TimeExpenses",
    "path": "/system/myCompany/timeExpense/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get TimeExpense"
  },
  {
    "module": "MyMembers",
    "path": "/system/myMembers",
    "methods": "GET",
    "summary": "Get MyMember"
  },
  {
    "module": "MySecuritys",
    "path": "/system/mySecurity",
    "methods": "GET",
    "summary": "Get List of MySecurity"
  },
  {
    "module": "MySecurityCustomizeItems",
    "path": "/system/mySecurity/customizeItems/",
    "methods": "GET",
    "summary": "Get List of MySecurityCustomizeItems"
  },
  {
    "module": "NotificationRecipients",
    "path": "/system/notificationRecipients",
    "methods": "GET",
    "summary": "Get List of NotificationRecipient"
  },
  {
    "module": "NotificationRecipients",
    "path": "/system/notificationRecipients/{id}",
    "methods": "GET",
    "summary": "Get NotificationRecipient"
  },
  {
    "module": "Office365EmailSetups",
    "path": "/system/office365/emailSetups",
    "methods": "GET, POST",
    "summary": "Get List of Office365EmailSetup"
  },
  {
    "module": "Office365EmailSetups",
    "path": "/system/office365/emailSetups/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Office365EmailSetup"
  },
  {
    "module": "Office365EmailSetups",
    "path": "/system/office365/emailSetups/{id}/authorize",
    "methods": "POST",
    "summary": "Post SuccessResponse"
  },
  {
    "module": "Office365EmailSetups",
    "path": "/system/office365/emailSetups/{id}/getEmails/",
    "methods": "GET",
    "summary": "Get List of UserEmails from inbound ticket service"
  },
  {
    "module": "Office365EmailSetups",
    "path": "/system/office365/emailSetups/{id}/testConnection",
    "methods": "POST",
    "summary": "Post SuccessResponse"
  },
  {
    "module": "OnPremiseSearchSettings",
    "path": "/system/onPremiseSearchSetting/",
    "methods": "GET",
    "summary": "Get List of OnPremiseSearchSettings"
  },
  {
    "module": "OnPremiseSearchSettings",
    "path": "/system/onPremiseSearchSetting/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get OnPremiseSearchSettings"
  },
  {
    "module": "OsGradeWeights",
    "path": "/system/osgradeweights",
    "methods": "GET",
    "summary": "Get List of OsGradeWeight"
  },
  {
    "module": "OsGradeWeights",
    "path": "/system/osgradeweights/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get OsGradeWeight"
  },
  {
    "module": "ParsingTypes",
    "path": "/system/parsingTypes",
    "methods": "GET",
    "summary": "Get List of ParsingType"
  },
  {
    "module": "ParsingTypes",
    "path": "/system/parsingTypes/{id}",
    "methods": "GET",
    "summary": "Get ParsingType"
  },
  {
    "module": "ParsingVariables",
    "path": "/system/parsingVariables",
    "methods": "GET",
    "summary": "Get List of ParsingVariable"
  },
  {
    "module": "ParsingVariables",
    "path": "/system/parsingVariables/{id}",
    "methods": "GET",
    "summary": "Get ParsingVariable"
  },
  {
    "module": "PortalReports",
    "path": "/system/portalReports",
    "methods": "GET, POST",
    "summary": "Get List of PortalReport"
  },
  {
    "module": "PortalReports",
    "path": "/system/portalReports/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get PortalReport"
  },
  {
    "module": "QuoteLinks",
    "path": "/system/quoteLinkSetup",
    "methods": "GET, POST",
    "summary": "Get List of QuoteLink"
  },
  {
    "module": "QuoteLinks",
    "path": "/system/quoteLinkSetup/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get QuoteLink"
  },
  {
    "module": "QuoteLinks",
    "path": "/system/quoteLinkSetup/testConnection",
    "methods": "GET",
    "summary": "Get SuccessResponse"
  },
  {
    "module": "ReportCards",
    "path": "/system/reportCards",
    "methods": "GET, POST",
    "summary": "Get List of ReportCard"
  },
  {
    "module": "ReportCards",
    "path": "/system/reportCards/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ReportCard"
  },
  {
    "module": "ReportCardDetails",
    "path": "/system/reportCards/{parentId}/details",
    "methods": "GET, POST",
    "summary": "Get List of ReportCardDetail"
  },
  {
    "module": "ReportCardDetails",
    "path": "/system/reportCards/{parentId}/details/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ReportCardDetail"
  },
  {
    "module": "Reports",
    "path": "/system/reports",
    "methods": "GET",
    "summary": "Get List of Report"
  },
  {
    "module": "Reports",
    "path": "/system/reports/{reportName}",
    "methods": "GET",
    "summary": "Get ReportDataResponse"
  },
  {
    "module": "Reports",
    "path": "/system/reports/{reportName}/columns",
    "methods": "GET",
    "summary": "Get List of JObject"
  },
  {
    "module": "SecurityRoles",
    "path": "/system/securityroles",
    "methods": "GET, POST",
    "summary": "Get List of SecurityRole"
  },
  {
    "module": "SecurityRoles",
    "path": "/system/securityroles/{id}",
    "methods": "GET, DELETE",
    "summary": "Get SecurityRole"
  },
  {
    "module": "SecurityRoleSettings",
    "path": "/system/securityRoles/{parentId}/settings",
    "methods": "GET",
    "summary": "Get List of SecurityRoleSetting"
  },
  {
    "module": "SecurityRoleSettings",
    "path": "/system/securityRoles/{parentId}/settings/{id}",
    "methods": "GET",
    "summary": "Get SecurityRoleSetting"
  },
  {
    "module": "SystemSettings",
    "path": "/system/settings",
    "methods": "GET",
    "summary": "Get List of SystemSetting"
  },
  {
    "module": "SystemSettings",
    "path": "/system/settings/{id}",
    "methods": "GET, PATCH, PUT",
    "summary": "Get SystemSetting"
  },
  {
    "module": "SetupScreens",
    "path": "/system/setupScreens",
    "methods": "GET",
    "summary": "Get List of SetupScreen"
  },
  {
    "module": "SetupScreens",
    "path": "/system/setupScreens/{id}",
    "methods": "GET",
    "summary": "Get SetupScreen"
  },
  {
    "module": "SkillCategories",
    "path": "/system/skillCategories",
    "methods": "GET, POST",
    "summary": "Get List of SkillCategory"
  },
  {
    "module": "SkillCategories",
    "path": "/system/skillCategories/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get SkillCategory"
  },
  {
    "module": "Skills",
    "path": "/system/skills",
    "methods": "GET, POST",
    "summary": "Get List of Skill"
  },
  {
    "module": "Skills",
    "path": "/system/skills/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Skill"
  },
  {
    "module": "SsoConfigurations",
    "path": "/system/ssoConfigurations",
    "methods": "GET, POST",
    "summary": "Get List of SsoConfiguration"
  },
  {
    "module": "SsoConfigurations",
    "path": "/system/ssoConfigurations/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get SsoConfiguration"
  },
  {
    "module": "SsoConfigurations",
    "path": "/system/ssoConfigurations/{id}/registertoken",
    "methods": "POST",
    "summary": "Post SsoConfiguration"
  },
  {
    "module": "SsoConfigurations",
    "path": "/system/ssoConfigurations/{id}/submitmembers",
    "methods": "POST",
    "summary": "Post SsoConfiguration"
  },
  {
    "module": "SsoUsers",
    "path": "/system/ssoUsers",
    "methods": "GET",
    "summary": "Get List of SsoUser"
  },
  {
    "module": "SsoUsers",
    "path": "/system/ssoUsers/{externalId}",
    "methods": "GET",
    "summary": "Get SsoUser"
  },
  {
    "module": "StandardNotes",
    "path": "/system/standardNotes",
    "methods": "GET, POST",
    "summary": "Get List of StandardNote"
  },
  {
    "module": "StandardNotes",
    "path": "/system/standardNotes/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get StandardNote"
  },
  {
    "module": "Reports",
    "path": "/system/standardreport/{id}",
    "methods": "POST",
    "summary": "Get ReportData"
  },
  {
    "module": "Surveys",
    "path": "/system/surveys",
    "methods": "GET, POST",
    "summary": "Get List of Survey"
  },
  {
    "module": "SurveyQuestionValues",
    "path": "/system/surveys/{grandparentId}/questions/{parentId}/values",
    "methods": "GET, POST",
    "summary": "Get List of SurveyQuestionValue"
  },
  {
    "module": "SurveyQuestionValues",
    "path": "/system/surveys/{grandparentId}/questions/{parentId}/values/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get SurveyQuestionValue"
  },
  {
    "module": "Surveys",
    "path": "/system/surveys/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Survey"
  },
  {
    "module": "Surveys",
    "path": "/system/surveys/{id}/copy",
    "methods": "POST",
    "summary": "Post Survey"
  },
  {
    "module": "SurveyQuestions",
    "path": "/system/surveys/{parentId}/questions",
    "methods": "GET, POST",
    "summary": "Get List of SurveyQuestion"
  },
  {
    "module": "SurveyQuestions",
    "path": "/system/surveys/{parentId}/questions/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get SurveyQuestion"
  },
  {
    "module": "TimeZoneSetups",
    "path": "/system/timeZoneSetups",
    "methods": "GET, POST",
    "summary": "Get List of TimeZoneSetup"
  },
  {
    "module": "TimeZoneSetups",
    "path": "/system/timeZoneSetups/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get TimeZoneSetup"
  },
  {
    "module": "TodayPageCategories",
    "path": "/system/todayPageCategories",
    "methods": "GET, POST",
    "summary": "Get List of TodayPageCategory"
  },
  {
    "module": "TodayPageCategories",
    "path": "/system/todayPageCategories/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get TodayPageCategory"
  },
  {
    "module": "TodayPageLinks",
    "path": "/system/todayPagelinks",
    "methods": "GET",
    "summary": "Get List of TodayPageLinks"
  },
  {
    "module": "TodayPageLinks",
    "path": "/system/todayPagelinks/",
    "methods": "POST",
    "summary": "Post TodayPageLinks"
  },
  {
    "module": "TodayPageLinks",
    "path": "/system/todayPagelinks/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get TodayPageLinks"
  },
  {
    "module": "UserDefinedFields",
    "path": "/system/userDefinedFields",
    "methods": "GET, POST",
    "summary": "Get List of UserDefinedField"
  },
  {
    "module": "UserDefinedFields",
    "path": "/system/userDefinedFields/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get UserDefinedField"
  },
  {
    "module": "WorkflowActionAutomateParameters",
    "path": "/system/workflowActions/{parentId}/automateParameters",
    "methods": "GET, POST",
    "summary": "Get List of WorkflowActionAutomateParameter"
  },
  {
    "module": "WorkflowActionAutomateParameters",
    "path": "/system/workflowActions/{parentId}/automateParameters/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get WorkflowActionAutomateParameter"
  },
  {
    "module": "WorkflowActionAutomateParameters",
    "path": "/system/workflowActions/automateParameters",
    "methods": "GET",
    "summary": "Get List of WorkflowActionAutomateParameter"
  },
  {
    "module": "WorkflowActionAutomateParameters",
    "path": "/system/workflowActions/automateParameters/{id}",
    "methods": "GET",
    "summary": "Get WorkflowActionAutomateParameter"
  },
  {
    "module": "Workflows",
    "path": "/system/workflows",
    "methods": "GET, POST",
    "summary": "Get List of Workflow"
  },
  {
    "module": "WorkflowActions",
    "path": "/system/workflows/{grandparentId}/events/{parentId}/actions",
    "methods": "GET, POST",
    "summary": "Get List of WorkflowAction"
  },
  {
    "module": "WorkflowActions",
    "path": "/system/workflows/{grandparentId}/events/{parentId}/actions/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get WorkflowAction"
  },
  {
    "module": "WorkflowTriggerOptions",
    "path": "/system/workflows/{grandparentId}/triggers/{parentId}/options",
    "methods": "GET",
    "summary": "Get List of WorkflowTriggerOption"
  },
  {
    "module": "Workflows",
    "path": "/system/workflows/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get Workflow"
  },
  {
    "module": "Workflows",
    "path": "/system/workflows/{id}/copy",
    "methods": "POST",
    "summary": "Post Workflow"
  },
  {
    "module": "WorkflowAttachments",
    "path": "/system/workflows/{parentId}/attachments",
    "methods": "GET",
    "summary": "Get List of WorkflowAttachment"
  },
  {
    "module": "WorkflowAttachments",
    "path": "/system/workflows/{parentId}/attachments/{id}",
    "methods": "GET",
    "summary": "Get WorkflowAttachment"
  },
  {
    "module": "WorkflowEvents",
    "path": "/system/workflows/{parentId}/events",
    "methods": "GET, POST",
    "summary": "Get List of WorkflowEvent"
  },
  {
    "module": "WorkflowEvents",
    "path": "/system/workflows/{parentId}/events/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get WorkflowEvent"
  },
  {
    "module": "WorkflowEvents",
    "path": "/system/workflows/{parentId}/events/{id}/copy",
    "methods": "POST",
    "summary": "Post WorkflowEvent"
  },
  {
    "module": "WorkflowEvents",
    "path": "/system/workflows/{parentId}/events/{id}/test",
    "methods": "GET",
    "summary": "Get workflow test results"
  },
  {
    "module": "WorkflowNotifyTypes",
    "path": "/system/workflows/{parentId}/notifyTypes",
    "methods": "GET",
    "summary": "Get List of WorkflowNotifyType"
  },
  {
    "module": "WorkflowNotifyTypes",
    "path": "/system/workflows/{parentId}/notifyTypes/{id}",
    "methods": "GET",
    "summary": "Get WorkflowNotifyType"
  },
  {
    "module": "WorkflowTriggers",
    "path": "/system/workflows/{parentId}/triggers",
    "methods": "GET",
    "summary": "Get List of WorkflowTrigger"
  },
  {
    "module": "WorkflowAttachments",
    "path": "/system/workflows/attachments",
    "methods": "GET",
    "summary": "Get List of WorkflowAttachment"
  },
  {
    "module": "WorkflowAttachments",
    "path": "/system/workflows/attachments/{id}",
    "methods": "GET",
    "summary": "Get WorkflowAttachment"
  },
  {
    "module": "WorkflowEvents",
    "path": "/system/workflows/events",
    "methods": "GET",
    "summary": "Get List of WorkflowEvent"
  },
  {
    "module": "WorkflowEvents",
    "path": "/system/workflows/events/{id}",
    "methods": "GET",
    "summary": "Get WorkflowEvent"
  },
  {
    "module": "WorkflowActions",
    "path": "/system/workflows/events/actions",
    "methods": "GET",
    "summary": "Get List of WorkflowAction"
  },
  {
    "module": "WorkflowActions",
    "path": "/system/workflows/events/actions/{id}",
    "methods": "GET",
    "summary": "Get WorkflowAction"
  },
  {
    "module": "WorkflowNotifyTypes",
    "path": "/system/workflows/notifyTypes",
    "methods": "GET",
    "summary": "Get List of WorkflowNotifyType"
  },
  {
    "module": "WorkflowNotifyTypes",
    "path": "/system/workflows/notifyTypes/{id}",
    "methods": "GET",
    "summary": "Get WorkflowNotifyType"
  },
  {
    "module": "WorkflowTableTypes",
    "path": "/system/workflows/tableTypes",
    "methods": "GET",
    "summary": "Get List of WorkflowTableType"
  },
  {
    "module": "WorkflowTableTypes",
    "path": "/system/workflows/tableTypes/{id}",
    "methods": "GET",
    "summary": "Get WorkflowTableType"
  },
  {
    "module": "WorkflowTriggers",
    "path": "/system/workflows/triggers",
    "methods": "GET",
    "summary": "Get List of WorkflowTrigger"
  },
  {
    "module": "WorkflowTriggerOptions",
    "path": "/system/workflows/triggers/options",
    "methods": "GET",
    "summary": "Get List of WorkflowTriggerOption"
  },
  {
    "module": "WorkflowActionUserDefinedFields",
    "path": "/system/workflows/userdefinedfields/{id}",
    "methods": "PATCH, PUT",
    "summary": "Patch WorkflowActionUserDefinedField"
  },
  {
    "module": "WorkflowActionUserDefinedFields",
    "path": "/system/workflows/userdefinedfields/actions/{parentId}",
    "methods": "DELETE",
    "summary": "Delete WorkflowActionUserDefinedField"
  },
  {
    "module": "WorkflowActionUserDefinedFields",
    "path": "/system/workflows/userdefinedfields/events/{grandparentId}",
    "methods": "POST",
    "summary": "Post WorkflowActionUserDefinedField"
  },
  {
    "module": "WorkflowActionUserDefinedFields",
    "path": "/system/workflows/userdefinedfields/events/{grandparentId}/actions/{parentId}",
    "methods": "GET",
    "summary": "Get List of WorkflowActionUserDefinedField"
  },
  {
    "module": "WorkflowActionUserDefinedFields",
    "path": "/system/workflows/userdefinedfields/events/actions",
    "methods": "GET",
    "summary": "Get List of WorkflowActionUserDefinedField"
  },
  {
    "module": "TimeAccruals",
    "path": "/time/accruals",
    "methods": "GET, POST",
    "summary": "Get List of TimeAccrual"
  },
  {
    "module": "TimeAccruals",
    "path": "/time/accruals/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get TimeAccrual"
  },
  {
    "module": "TimeAccrualDetails",
    "path": "/time/accruals/{parentId}/details",
    "methods": "GET",
    "summary": "Get List of TimeAccrualDetail"
  },
  {
    "module": "TimeAccrualDetails",
    "path": "/time/accruals/{parentId}/details/",
    "methods": "POST",
    "summary": "Post TimeAccrualDetail"
  },
  {
    "module": "TimeAccrualDetails",
    "path": "/time/accruals/{parentId}/details/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get TimeAccrualDetail"
  },
  {
    "module": "ActivityStopwatches",
    "path": "/time/activitystopwatches",
    "methods": "GET, POST",
    "summary": "Get List of ActivityStopwatch"
  },
  {
    "module": "ActivityStopwatches",
    "path": "/time/activitystopwatches/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ActivityStopwatch"
  },
  {
    "module": "TimeEntryChangeLog",
    "path": "/time/changelogs",
    "methods": "GET, DELETE",
    "summary": "Get List of Time Entry Change Logs"
  },
  {
    "module": "ChargeCodes",
    "path": "/time/chargeCodes",
    "methods": "GET, POST",
    "summary": "Get List of ChargeCode"
  },
  {
    "module": "ChargeCodes",
    "path": "/time/chargeCodes/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ChargeCode"
  },
  {
    "module": "ChargeCodes",
    "path": "/time/chargeCodes/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "ChargeCodes",
    "path": "/time/chargeCodes/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "ChargeCodeExpenseTypes",
    "path": "/time/chargeCodes/{parentId}/expenseTypes",
    "methods": "GET, POST",
    "summary": "Get List of ChargeCodeExpenseType"
  },
  {
    "module": "ChargeCodeExpenseTypes",
    "path": "/time/chargeCodes/{parentId}/expenseTypes/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ChargeCodeExpenseType"
  },
  {
    "module": "TimeEntries",
    "path": "/time/entries",
    "methods": "GET, POST",
    "summary": "Time entries. Unbilled billable time = billableOption=\"Billable\" AND invoiceFlag=false.",
    "coveredBy": "cw_create_time_entry, cw_update_time_entry, cw_list_my_time, cw_list_ticket_time, cw_list_unbilled_time",
    "keyParams": "chargeToId, chargeToType, member/identifier, company/id, billableOption, invoiceFlag",
    "commonFields": "id,member/identifier,company/name,chargeToId,timeStart,actualHours,billableOption,notes"
  },
  {
    "module": "TimeEntries",
    "path": "/time/entries/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get TimeEntry"
  },
  {
    "module": "TimeEntries",
    "path": "/time/entries/{id}/cancelReject",
    "methods": "POST",
    "summary": "Cancel the Rejection of a Time Entry"
  },
  {
    "module": "TimeEntries",
    "path": "/time/entries/{id}/detach",
    "methods": "POST",
    "summary": "Detch TimeEntry"
  },
  {
    "module": "TimeEntries",
    "path": "/time/entries/{id}/reject",
    "methods": "POST",
    "summary": "Reject a Time Entry"
  },
  {
    "module": "TimeEntryAudits",
    "path": "/time/entries/{parentId}/audits",
    "methods": "GET",
    "summary": "Get List of TimeEntryAudit"
  },
  {
    "module": "TimeEntryAudits",
    "path": "/time/entries/{parentId}/audits/{id}",
    "methods": "GET",
    "summary": "Get TimeEntryAudit"
  },
  {
    "module": "TimeEntries",
    "path": "/time/entries/defaults",
    "methods": "POST",
    "summary": "Post TimeEntry"
  },
  {
    "module": "ChargeCodeExpenseTypeInfos",
    "path": "/time/info/chargeCodeExpenseTypes",
    "methods": "GET",
    "summary": "Get List of ChargeCodeExpenseType"
  },
  {
    "module": "ScheduleStopwatch",
    "path": "/time/schedulestopwatches",
    "methods": "GET, POST",
    "summary": "Get List of ScheduleStopwatch"
  },
  {
    "module": "ScheduleStopwatch",
    "path": "/time/schedulestopwatches/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get ScheduleStopwatch"
  },
  {
    "module": "TimeSheets",
    "path": "/time/sheets",
    "methods": "GET",
    "summary": "Timesheets (per member, per period).",
    "coveredBy": "cw_list_my_timesheets, cw_submit_timesheet",
    "keyParams": "member/identifier, status"
  },
  {
    "module": "TimeSheets",
    "path": "/time/sheets/{id}",
    "methods": "GET, DELETE",
    "summary": "Get TimeSheet"
  },
  {
    "module": "TimeSheets",
    "path": "/time/sheets/{id}/approve",
    "methods": "POST",
    "summary": "Post SuccessResponse"
  },
  {
    "module": "TimeSheets",
    "path": "/time/sheets/{id}/reject",
    "methods": "POST",
    "summary": "Post SuccessResponse"
  },
  {
    "module": "TimeSheets",
    "path": "/time/sheets/{id}/reverse",
    "methods": "POST",
    "summary": "Post SuccessResponse"
  },
  {
    "module": "TimeSheets",
    "path": "/time/sheets/{id}/submit",
    "methods": "POST",
    "summary": "Submit a timesheet for approval (Open sheets only).",
    "coveredBy": "cw_submit_timesheet"
  },
  {
    "module": "TimeSheetAudits",
    "path": "/time/sheets/{parentId}/audits",
    "methods": "GET",
    "summary": "Get List of TimeSheetAudit"
  },
  {
    "module": "TimeSheetAudits",
    "path": "/time/sheets/{parentId}/audits/{id}",
    "methods": "GET",
    "summary": "Get TimeSheetAudit"
  },
  {
    "module": "TicketStopwatches",
    "path": "/time/ticketstopwatches",
    "methods": "GET, POST",
    "summary": "Get List of TicketStopwatch"
  },
  {
    "module": "TicketStopwatches",
    "path": "/time/ticketstopwatches/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get TicketStopwatch"
  },
  {
    "module": "TimePeriodSetups",
    "path": "/time/timePeriodSetups",
    "methods": "GET, POST",
    "summary": "Get List of TimePeriodSetup"
  },
  {
    "module": "TimePeriodSetups",
    "path": "/time/timePeriodSetups/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get TimePeriodSetup"
  },
  {
    "module": "TimePeriods",
    "path": "/time/timePeriodSetups/{parentId}/periods",
    "methods": "GET",
    "summary": "Get List of TimePeriod"
  },
  {
    "module": "TimePeriods",
    "path": "/time/timePeriodSetups/{parentId}/periods/{id}",
    "methods": "GET",
    "summary": "Get TimePeriod"
  },
  {
    "module": "TimePeriodSetups",
    "path": "/time/timePeriodSetups/default",
    "methods": "GET",
    "summary": "Get TimePeriodSetupDefaults"
  },
  {
    "module": "WorkRoles",
    "path": "/time/workRoles",
    "methods": "GET, POST",
    "summary": "Work roles (used on time entries).",
    "coveredBy": "cw_list_work_roles"
  },
  {
    "module": "WorkRoles",
    "path": "/time/workRoles/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get WorkRole"
  },
  {
    "module": "WorkRoles",
    "path": "/time/workRoles/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "WorkRoles",
    "path": "/time/workRoles/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  },
  {
    "module": "WorkRoleLocations",
    "path": "/time/workRoles/{parentId}/locations",
    "methods": "GET, POST",
    "summary": "Get List of WorkRoleLocation"
  },
  {
    "module": "WorkRoleLocations",
    "path": "/time/workRoles/{parentId}/locations/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get WorkRoleLocation"
  },
  {
    "module": "WorkTypes",
    "path": "/time/workTypes",
    "methods": "GET, POST",
    "summary": "Get List of WorkType"
  },
  {
    "module": "WorkTypes",
    "path": "/time/workTypes/{id}",
    "methods": "GET, PATCH, PUT, DELETE",
    "summary": "Get WorkType"
  },
  {
    "module": "WorkTypes",
    "path": "/time/workTypes/{id}/usages",
    "methods": "GET",
    "summary": "Get List of Usage Count"
  },
  {
    "module": "WorkTypes",
    "path": "/time/workTypes/{id}/usages/list",
    "methods": "GET",
    "summary": "Get List of Usage"
  }
];
