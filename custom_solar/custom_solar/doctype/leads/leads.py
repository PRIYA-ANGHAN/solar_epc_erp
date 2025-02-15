 
import frappe
from frappe.model.document import Document
import re
import math

class Leads(Document):
 
    def validate(self):
        """Validate mobile number and email format."""
        self.validate_mobile_number()
        self.validate_email()
        self.calculate_required_kw()
        self.calculate_panel_count()
        self.calculate_total_price()
 
    def validate_mobile_number(self):
        """Validate mobile number format."""
        if self.mobile_no:
            # Trim leading and trailing spaces
            self.mobile_no = self.mobile_no.strip()
 
            # If the mobile number doesn't start with a country code (1-3 digits), add the default +91
            if not self.mobile_no.startswith(("+91", "+", "1", "44", "91", "0")):
                # Prepend default +91 and remove leading zeros
                self.mobile_no = "+91 " + self.mobile_no.lstrip("0")
            else:
                # If it has a country code, allow it and remove leading zeros
                self.mobile_no = self.mobile_no.lstrip("0")
 
            # Regex pattern for the mobile number validation
            pattern = r'^\+?\d{1,3} \d{10}$'
 
            # If the mobile number doesn't match the expected pattern, raise an error
            if not re.match(pattern, self.mobile_no):
                frappe.throw("Mobile number must follow the format: <Country Code> <10-digit phone number>")

    def calculate_required_kw(self):
        """Calculate Required kW based on Electricity Bill, Unit Rate, and Billing Cycle."""
        if self.electricity_bill and self.unit_rate and self.billing_cycle:
            billing_cycle_factor = 120 if self.billing_cycle == "1 Month" else 240
            try:
                self.required__kw = self.electricity_bill / (billing_cycle_factor * self.unit_rate)
            except ZeroDivisionError:
                frappe.throw("Unit Rate cannot be zero.")

    

    def calculate_panel_count(self):
        """Calculate Panel Count when Required kW and Watt Peak are provided."""
        if self.required__kw and self.watt_peakkw:
            try:
                panel_count = (self.required__kw * 1000) / self.watt_peakkw
                self.panel_count = math.ceil(panel_count)  # Always round up
            except ZeroDivisionError:
                frappe.throw("Watt Peak value cannot be zero.")
        
            frappe.msgprint(f"Panel Count calculated: {self.panel_count} panels")


    def calculate_total_price(self):
        """Calculate Total Price based on Panel Count and Per Panel Price."""
        if self.panel_count and self.per_panel_price:
            try:
                self.total_price = self.panel_count * self.per_panel_price
            except Exception as e:
                frappe.throw(f"Error calculating Total Price: {str(e)}")



    def validate_email(self):
        """Validate email format."""
        if self.email_id:
            self.email_id = self.email_id.strip()
            
            # Regular expression pattern for email validation
            email_pattern = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
 
            if not re.match(email_pattern, self.email_id):
                frappe.throw("Invalid email format. Please enter a valid email address.")

    
 
    def on_update(self):
        """Ensure validation happens when the record is updated."""
        self.validate()  # Ensure validation happens on update
 
        # Check if the status is 'Closed' before creating/updating Opportunity
        if self.status == "Closed":
            # Ensure required fields are present in the Lead doc
            required_fields = ['full_name', 'email_id', 'mobile_no', 'date_sgma']
            for field in required_fields:
                if not getattr(self, field):
                    frappe.throw(f"Required field '{field}' is missing to create an Opportunity.")
 
            # Fetch existing Opportunity with the same full name
            existing_opportunity = frappe.get_all(
                'Opportunity',
                filters={'full_name': self.full_name},
                fields=['name', 'email_id', 'mobile_no', 'status'],  
                limit=1
            )       
 
            if existing_opportunity:
                opportunity_name = existing_opportunity[0]['name']
                existing_email = existing_opportunity[0]['email_id']
                existing_mobile = existing_opportunity[0]['mobile_no']
 
                # Update existing Opportunity if mobile or email has changed
                if self.email_id != existing_email or self.mobile_no != existing_mobile:
                    opportunity_doc = frappe.get_doc('Opportunity', opportunity_name)
                    opportunity_doc.email_id = self.email_id
                    opportunity_doc.mobile_no = self.mobile_no
                    opportunity_doc.save(ignore_permissions=True)
                    frappe.db.commit()
                    frappe.msgprint(f"Updated Opportunity: <a href='/app/opportunity/{opportunity_name}'>{opportunity_name}</a> with new details.")
                else:
                    frappe.msgprint(f"Opportunity already exists: <a href='/app/opportunity/{opportunity_name}'>{opportunity_name}</a> with the same details.")
            else:
                try:
                        # Create a new Opportunity if no matching record exists
                    opportunity = frappe.get_doc({
                        'doctype': 'Opportunity',
                        'lead_id': self.name,
                        'full_name': self.full_name,
                        'email_id': self.email_id,
                        'mobile_no': self.mobile_no,
                        'date_sgma': self.date_sgma,
                        'status': 'Closed', 
                        "company_name": self.company_name,
                        "service": self.service,
                        "electricity_provider": self.electricity_provider,
                        "unit_rate": self.unit_rate,
                        "required__kw": self.required__kw,
                        "electricity_bill": self.electricity_bill,
                        "billing_cycle": self.billing_cycle,
                        "panel_details": self.panel_details,
                        "watt_peakkw": self.watt_peakkw,
                        "per_panel_price": self.per_panel_price,
                        "panel_count": self.panel_count,
                        "total_price": self.total_price
                    })
 
                    opportunity.insert(ignore_permissions=True)
                    frappe.db.commit()
 
                    frappe.msgprint(f"New Opportunity created for lead: {self.full_name}")
 
                except Exception as e:
                    frappe.log_error(frappe.get_traceback(), "Opportunity Creation Failed")
                    frappe.throw(f"Failed to create opportunity: {str(e)}")
 
@frappe.whitelist()

def log_status_change(docname, old_status, new_status, comment):
    """
    Log the status change along with the comment and update the timeline of the lead.
    """
    lead = frappe.get_doc("Leads", docname)
 
    # Create a new comment or log for status change
    activity = frappe.get_doc({
        'doctype': 'Comment',
        'reference_doctype': 'Leads',
        'reference_name': docname,
        'content': f"Status changed from {old_status} to {new_status} by {frappe.session.user}:\n\n> {comment}",
        'comment_type': 'Comment',
        'owner': frappe.session.user,
    })
    activity.insert(ignore_permissions=True)
 
    # Update the Lead's status
    lead.status = new_status
    lead.save()
 
    return {"message": "Status change logged successfully"}
 
@frappe.whitelist()
def get_site_visit_history(lead):
    """
    Get the history of site visits related to the lead.
    """
    # Fetch data related to site visits from custom doctype or any related records
    visits = frappe.get_all('Site_Visit', filters={'lead': lead}, fields=[
        'lead_owner', 'cantilever_position', 'lead', 'shadow_object_analysis',  
        'roof_type', 'structure_type', 'sanction_load', 'is_same_name', 'no_of_floor','final_note','remarks','2d_diagram_of_site','site_image','site_video'
    ])
    
    if not visits:
        return {"message": "No site visits found for this lead"}
    
    return visits



# @frappe.whitelist()
# def get_services(company_name):
#     services = []
    
#     # Fetch Panel Company document
#     panel_company = frappe.get_doc("Panel Company", company_name)

#     # Check if services exist in the child table (Multiselect)
#     if panel_company.services:
#         services = [{"service": row.service} for row in panel_company.services]
    
#     return services if services else []



@frappe.whitelist()
def get_services(company_name):
    service = []

    # Fetch the Panel Company document
    panel_company = frappe.get_doc("Panel Company", company_name)

    # Ensure services exist and iterate through the child table correctly
    if panel_company.get("service"):
        service = [{"service": row.service} for row in panel_company.get("service")]

    return service if service else []