import frappe
from frappe.model.document import Document

class Quotations(Document):
    def validate(self):
        self.inverter_amount()
        self.structure_amount()
        self.wire_amount()

    def inverter_amount(self):
        """Calculate amount for each inverter entry in the child table."""
        for item in self.get("inverter_details"):
            rate = float(item.rate__qty) if item.rate__qty else 0
            quantity = int(item.inverter_quantity) if item.inverter_quantity else 0
            item.inverter_amount = rate * quantity

    def structure_amount(self):
        """Calculate amount for each structure entry in the child table."""
        for item in self.get("structure_details"):  # Ensure the child table exists
            rate = float(item.rate__pipe) if item.rate__pipe else 0
            quantity = int(item.structure_quantity) if item.structure_quantity else 0
            item.structure_amount = rate * quantity

    def wire_amount(self):
        """Calculate amount for each wire entry in the child table."""
        for item in self.get("wire_details"):  # Access child table
            rate = float(item.rate__100m)if item.rate__100m else 0
            size = int(item.size_mm2) if item.size_mm2 else 0
            item.wire_amount = rate * size