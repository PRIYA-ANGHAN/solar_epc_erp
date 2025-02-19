import frappe
from frappe.model.document import Document

class Opportunity(Document):
    pass
    # def onload(self):
    #     """Load the Site Visit History and Activity for the linked Lead"""
    #     if self.lead_id:
    #         self.site_visit_history = self.get_site_visit_history(self.lead_id)
    #         self.activity_logs = self.get_activity_logs(self.lead_id)  # Ensure this method is defined

    # def get_site_visit_history(self, lead_id):
    #     """Fetch the site visit history from the Lead."""
    #     visits = frappe.get_all('Site_Visit', filters={'lead': lead_id}, fields=[
    #         'lead_owner', 'cantilever_position', 'lead', 'shadow_object_analysis',
    #         'roof_type', 'structure_type', 'sanction_load', 'is_same_name', 
    #         'no_of_floor', 'final_note', 'remarks', '2d_diagram_of_site', 'site_image', 'site_video'
    #     ])
    #     return visits  # Return the fetched data

    # def get_activity_logs(self, lead_id):
    #     """Fetch activity logs for the linked Lead (e.g., comments or changes)."""
    #     return frappe.get_all('Comment', filters={'reference_doctype': 'Leads', 'reference_name': lead_id}, 
    #                           fields=['content', 'creation'], order_by="creation desc")

# @frappe.whitelist()
# def get_lead_activity_logs(lead_id):
#     """Fetch activity logs (comments, status changes, etc.) from the linked Lead."""
#     data =  frappe.get_all(
#         "Comment",
#         filters={"reference_doctype": "Leads", "reference_name": lead_id},
#         fields=["content", "creation",""],
#         order_by="creation desc"
#     )
#     print(f"DDDDDDD ::::::: {data}")
#     return data