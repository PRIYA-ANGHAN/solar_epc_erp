# Copyright (c) 2025, varoon soneji and contributors
# For license information, please see license.txt


# # import frappe

# Copyright (c) 2025, Varoon Soneji and contributors
# For license information, please see license.txt

# from frappe.model.document import Document

# # import frappe

# class Opportunity(Document):
#     pass

# import frappe
# from frappe.model.document import Document

# class Opportunity(Document):
#     def onload(self):
#         """Load the Site Visit History and Activity for the linked Lead"""
#         if self.lead_id:
#             self.site_visit_history = self.get_site_visit_history(self.lead_id)
#             self.activity_logs = self.get_activity_logs(self.lead_id)

#     def get_site_visit_history(self, lead_id):
#         """Fetch the site visit history from the Lead."""
#         visits = frappe.get_all('Site_Visit', filters={'lead': lead_id}, fields=[
#             'lead_owner', 'cantilever_position', 'lead', 'shadow_object_analysis',
#             'roof_type', 'structure_type', 'sanction_load', 'is_same_name', 
#             'no_of_floor', 'final_note', 'remarks', '2d_diagram_of_site', 'site_image', 'site_video'
#         ])
#         return visits  # Return the fetched data

#     def get_activity_logs(self, lead_id):
#         """Fetch activity logs for the Lead."""
#         if not lead_id:
#             return []

#         # Fetching activity logs associated with the Lead
#         activity_logs = frappe.get_all('Comment', filters={
#             'reference_doctype': 'Leads', 
#             'reference_name': lead_id
#         }, fields=['content', 'creation'])

#         return activity_logs  # Return the activity logs


# @frappe.whitelist()
# def log_status_change(docname, old_status, new_status, comment):
#     """
#     Logs the status change activity in the system.
#     """
#     # Ensure docname is a valid lead ID
#     if not docname:
#         frappe.throw("Lead ID is required to log the status change.")

#     # Log the status change to the activity log (or Comment DocType)
#     activity_log = frappe.get_doc({
#         'doctype': 'Comment',
#         'reference_doctype': 'Leads',
#         'reference_name': docname,
#         'content': f"Status changed from {old_status} to {new_status}. Comment: {comment}",
#         'status': 'Open'
#     })
#     activity_log.insert(ignore_permissions=True)
#     frappe.db.commit()

#     return {"message": "Activity logged successfully"}


import frappe
from frappe.model.document import Document

class Opportunity(Document):
    def onload(self):
        """Load the Site Visit History and Activity for the linked Lead"""
        if self.lead_id:
            self.site_visit_history = self.get_site_visit_history(self.lead_id)
            self.activity_logs = self.get_activity_logs(self.lead_id)  # Ensure this method is defined

    def get_site_visit_history(self, lead_id):
        """Fetch the site visit history from the Lead."""
        visits = frappe.get_all('Site_Visit', filters={'lead': lead_id}, fields=[
            'lead_owner', 'cantilever_position', 'lead', 'shadow_object_analysis',
            'roof_type', 'structure_type', 'sanction_load', 'is_same_name', 
            'no_of_floor', 'final_note', 'remarks', '2d_diagram_of_site', 'site_image', 'site_video'
        ])
        return visits  # Return the fetched data

    def get_activity_logs(self, lead_id):
        """Fetch activity logs for the linked Lead (e.g., comments or changes)."""
        # You can fetch comments or any activity logs associated with the Lead
        activity_logs = frappe.get_all('Comment', filters={'reference_doctype': 'Leads', 'reference_name': lead_id}, fields=['content', 'creation'])
        return activity_logs  # Return the fetched activity logs