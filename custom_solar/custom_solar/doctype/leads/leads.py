import frappe
from frappe.model.document import Document
import re
import math

class Leads(Document):
    def validate(self):
        """
        Run all validations and calculations for the lead.
        """
        self.validate_mobile_number()
        self.validate_email()
        self.calculate_required_kw()
        self.calculate_panel_count()

    def validate_mobile_number(self):
        """
        Validate and normalize the mobile number.
        The expected format is: <Country Code> <10-digit phone number>.
        If no proper country code is found, '+91' is prepended.
        """
        if not self.mobile_no:
            return

        self.mobile_no = self.mobile_no.strip()

        # Check for recognized country code; otherwise, add the default "+91"
        if not self.mobile_no.startswith(("+91", "+", "1", "44", "91", "0")):
            self.mobile_no = "+91 " + self.mobile_no.lstrip("0")
        else:
            self.mobile_no = self.mobile_no.lstrip("0")

        # Validate mobile number pattern: optional '+' with 1-3 digits, a space, then 10 digits.
        pattern = r'^\+?\d{1,3} \d{10}$'
        if not re.match(pattern, self.mobile_no):
            frappe.throw("Mobile number must follow the format: <Country Code> <10-digit phone number>")

    def validate_email(self):
        """
        Validate the email address format.
        """
        if not self.email_id:
            return

        self.email_id = self.email_id.strip()
        email_pattern = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
        if not re.match(email_pattern, self.email_id):
            frappe.throw("Invalid email format. Please enter a valid email address.")

    def calculate_required_kw(self):
        """
        Calculate the required kW based on the electricity bill, unit rate,
        and billing cycle. Uses a factor of 120 for '1 Month' and 240 for others.
        """
        if self.electricity_bill and self.unit_rate and self.billing_cycle:
            billing_cycle_factor = 120 if self.billing_cycle == "1 Month" else 240
            try:
                self.required__kw = self.electricity_bill / (billing_cycle_factor * self.unit_rate)
            except ZeroDivisionError:
                frappe.throw("Unit Rate cannot be zero.")

    def calculate_panel_count(self):
        """
        Calculate the number of panels required based on the required kW
        and watt peak per kW. Always rounds up the count.
        """
        if self.required__kw and self.watt_peakkw:
            try:
                # Convert required_kw to float
                required_kw = float(self.required__kw)
            
                # Extract the numeric part from watt_peakkw using regex
                watt_peak_numbers = re.findall(r"[\d.]+", self.watt_peakkw)
                if watt_peak_numbers:
                    watt_peak = float(watt_peak_numbers[0])
                else:
                    frappe.throw("Watt Peak value is not a valid number.")
            
                # Calculate the panel count and round up
                panel_count_calc = (required_kw * 1000) / watt_peak
                self.panel_count = math.ceil(panel_count_calc)
            
                frappe.msgprint(f"Panel Count calculated: {self.panel_count} panels")
            except ZeroDivisionError:
                frappe.throw("Watt Peak value cannot be zero.")
            except ValueError:
                frappe.throw("Invalid input values for Required kW or Watt Peak per kW.")

    def on_update(self):
        """
        Trigger validations and handle Opportunity creation or updates when a lead is updated.
        Only processes further if the lead's status is 'Closed'.
        """
        self.validate()

        if self.status != "Closed":
            return

        # Ensure all required fields are present before creating/updating an Opportunity
        for field in ['full_name', 'email_id', 'mobile_no', 'date_sgma']:
            if not getattr(self, field):
                frappe.throw(f"Required field '{field}' is missing to create an Opportunity.")

        # Try to fetch an existing Opportunity using full_name as the key
        existing_opportunity = frappe.get_all(
            'Opportunity',
            filters={'full_name': self.full_name},
            fields=['name', 'email_id', 'mobile_no', 'status'],
            limit=1
        )

        if existing_opportunity:
            self.update_opportunity(existing_opportunity[0])
        else:
            self.create_opportunity()

    def update_opportunity(self, opportunity_data):
        """
        Update the existing Opportunity if the email or mobile number has changed.
        """
        opportunity_name = opportunity_data['name']
        existing_email = opportunity_data['email_id']
        existing_mobile = opportunity_data['mobile_no']

        if self.email_id != existing_email or self.mobile_no != existing_mobile:
            try:
                opportunity_doc = frappe.get_doc('Opportunity', opportunity_name)
                opportunity_doc.email_id = self.email_id
                opportunity_doc.mobile_no = self.mobile_no
                opportunity_doc.save(ignore_permissions=True)
                frappe.db.commit()
                frappe.msgprint(
                    f"Updated Opportunity: <a href='/app/opportunity/{opportunity_name}'>{opportunity_name}</a> with new details."
                )
            except Exception as e:
                frappe.log_error(frappe.get_traceback(), "Opportunity Update Failed")
                frappe.throw(f"Failed to update opportunity: {str(e)}")
        else:
            frappe.msgprint(
                f"Opportunity already exists: <a href='/app/opportunity/{opportunity_name}'>{opportunity_name}</a> with the same details."
            )

    def create_opportunity(self):
        """
        Create a new Opportunity based on the Lead details.
        """
        try:
            opportunity = frappe.get_doc({
                'doctype': 'Opportunity',
                'lead_id': self.name,
                'full_name': self.full_name,
                'email_id': self.email_id,
                'mobile_no': self.mobile_no,
                'date_sgma': self.date_sgma,
                'status': 'Closed',
                'company_name': self.company_name,
                'services': self.services,
                'panel_tech': self.panel_tech,
                'electricity_provider': self.electricity_provider,
                'unit_rate': self.unit_rate,
                'required__kw': self.required__kw,
                'electricity_bill': self.electricity_bill,
                'billing_cycle': self.billing_cycle,
                'watt_peakkw': self.watt_peakkw,
                'panel_count': self.panel_count,
                'total_price': self.total_price
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
    Log a status change for a lead and update its timeline.
    """
    lead = frappe.get_doc("Leads", docname)
    try:
        activity = frappe.get_doc({
            'doctype': 'Comment',
            'reference_doctype': 'Leads',
            'reference_name': docname,
            'content': f"Status changed from {old_status} to {new_status} by {frappe.session.user}:\n\n> {comment}",
            'comment_type': 'Comment',
            'owner': frappe.session.user,
        })
        activity.insert(ignore_permissions=True)
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Status Change Logging Failed")
        frappe.throw(f"Failed to log status change: {str(e)}")

    # Update the Lead's status
    lead.status = new_status
    lead.save()
    return {"message": "Status change logged successfully"}

@frappe.whitelist()
def get_site_visit_history(**kwargs):
    """
    Retrieve the history of site visits for a given lead.
    """
    lead = kwargs.get("lead")
    visits = frappe.get_all(
        'Site_Visit',
        filters={'lead': lead},
        fields=[
            'lead_owner', 'cantilever_position', 'lead', 'shadow_object_analysis',
            'roof_type', 'structure_type', 'sanction_load', 'is_same_name', 'no_of_floor',
            'final_note', 'remarks', '2d_diagram_of_site', 'site_image', 'site_video'
        ]
    )
    if not visits:
        return {"message": "No site visits found for this lead"}
    return visits
