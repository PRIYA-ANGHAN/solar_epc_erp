import frappe
from frappe.model.document import Document

class Opportunity(Document):
    pass

@frappe.whitelist()
def get_dispatch_history(opportunity_id):
    """
    This function fetches the dispatch history for the given Opportunity.
    :param opportunity_id: ID of the Opportunity document
    :return: List of dispatch records associated with the Opportunity
    """
    # Query the Dispatch table to get all dispatches for the given opportunity
    dispatch_history = frappe.get_all('Dispatch', 
                                      filters={'opportunity': opportunity_id}, 
                                      fields=['dispatch_type', 'status', 'dispatch_date', 'comments'])

    return dispatch_history
