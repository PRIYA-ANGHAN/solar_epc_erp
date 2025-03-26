import frappe
from frappe.model.document import Document
from frappe.core.doctype.file.file import File

class Quotations(Document):
    def validate(self):
        self.inverter_amount()
        self.structure_amount()
        self.wire_amount()
        self.calculate_total_amount()

    def inverter_amount(self):
        """Calculate amount for each inverter entry in the child table."""
        for item in self.get("inverter_details") or []:
            rate = float(item.rate__qty) if item.rate__qty else 0
            quantity = int(item.inverter_quantity) if item.inverter_quantity else 0
            item.inverter_amount = rate * quantity

    def structure_amount(self):
        """Calculate amount for each structure entry in the child table."""
        for item in self.get("structure_details") or []:
            rate = float(item.rate__pipe) if item.rate__pipe else 0
            quantity = int(item.structure_quantity) if item.structure_quantity else 0
            item.structure_amount = rate * quantity

    def wire_amount(self):
        """Calculate amount for each wire entry in the child table."""
        for item in self.get("wire_details") or []:
            rate = float(item.rate__1m) if item.rate__1m else 0
            size = int(item.wire_sizemeter) if item.wire_sizemeter else 0
            item.wire_amount = rate * size

    def calculate_total_amount(self):
        def get_total_amount(details, field_name):
            return sum(getattr(item, field_name, 0) for item in (details or []))

        i_sum = get_total_amount(self.inverter_details, "inverter_amount")
        s_sum = get_total_amount(self.structure_details, "structure_amount")
        w_sum = get_total_amount(self.wire_details, "wire_amount")

        # item_price = self.item_price or 0
        item_price = self.item_price if self.item_price is not None else 0
        panel_price = self.total_price_of_panel

        without_gst_amount = i_sum + s_sum + w_sum + item_price + panel_price
        self.without_gst_amount = round(without_gst_amount, 2)

        # Convert GST from percentage string to a decimal value
        try:
            gst_rate = float(self.gst.strip('%')) / 100 if self.gst else 0
        except ValueError:
            gst_rate = 0

        # Calculate GST amount
        gst_amount = without_gst_amount * gst_rate

        # Calculate amount with GST
        with_gst_amount = without_gst_amount + gst_amount
        self.with_gst_amount = round(with_gst_amount, 2)

        print(f"Inverter Amount: {i_sum}")
        print(f"Structure Amount: {s_sum}")
        print(f"Wire Amount: {w_sum}")
        print(f"Item Price: {item_price}")
        print(f"Total Without GST: {without_gst_amount}")
        print(f"Total With GST: {with_gst_amount}")


@frappe.whitelist()
def create_pdf_on_save(doc, method):
    # Get the print format
    print_format = 'Quotation'  # Your print format name
    pdf = frappe.get_print('Quotations', doc.name, print_format=print_format)

    # Create a file record
    file_data = {
        'file_name': f'{doc.name}_quotation.pdf',
        'folder': 'Home/Attachments',
        'content': pdf,
        'is_private': 1  # Optional: Set to 0 if not private
    }
    file = File.from_data(file_data)

    # Attach the file to the Quotation document
    doc.pdf_of_quotation = file.file_url
    doc.save()

# Trigger the function when a Quotations document is saved
frappe.db.commit()  # Make sure the save operation happens immediately
