// filter for inverter table
frappe.ui.form.on("Inverter Child", {
    inverter_quantity: function (frm, cdt, cdn) {
        calculate_inverter_amount(frm, cdt, cdn);
    },
    rate__qty: function (frm, cdt, cdn) {
        calculate_inverter_amount(frm, cdt, cdn);
    },
    inverter_details_add: function (frm, cdt, cdn) {
        calculate_inverter_amount(frm, cdt, cdn); // Set amount on row creation
    }
});

function calculate_inverter_amount(frm, cdt, cdn) {
    let row = locals[cdt][cdn]; // Get the current row

    // Ensure rate__qty and inverter_quantity are numeric
    let rate = row.rate__qty ? parseFloat(row.rate__qty) : 0;
    let quantity = row.inverter_quantity ? parseInt(row.inverter_quantity) : 1;

    // If quantity is 1 (default), set amount as rate
    let inverter_amount = (quantity === 1) ? rate : rate * quantity;

    // Update inverter_amount in child table
    frappe.model.set_value(cdt, cdn, "inverter_amount", inverter_amount);
}

// Structure Child Calculation
frappe.ui.form.on("Structure Child", {
    structure_quantity: function (frm, cdt, cdn) {
        calculate_structure_amount(frm, cdt, cdn);
    },
    rate__pipe: function (frm, cdt, cdn) {
        calculate_structure_amount(frm, cdt, cdn);
    },
    structure_details_add: function (frm, cdt, cdn) {
        calculate_structure_amount(frm, cdt, cdn); // Set amount on row creation
    }
});

function calculate_structure_amount(frm, cdt, cdn) {
    let row = locals[cdt][cdn]; // Get the current row

    // Ensure rate__pipe and structure_quantity are numeric
    let rate = row.rate__pipe ? parseFloat(row.rate__pipe) : 0;
    let quantity = row.structure_quantity ? parseInt(row.structure_quantity) : 1;

    // If quantity is 1 (default), set amount as rate
    let structure_amount = (quantity === 1) ? rate : rate * quantity;

    // Update structure_amount in child table
    frappe.model.set_value(cdt, cdn, "structure_amount", structure_amount);
}

// Wire Child Calculation
frappe.ui.form.on("Wire Child", {
    wire_sizemeter: function (frm, cdt, cdn) {
        calculate_wire_amount(frm, cdt, cdn);
    },
    rate__1m: function (frm, cdt, cdn) {
        calculate_wire_amount(frm, cdt, cdn);
    },
    wire_details_add: function (frm, cdt, cdn) {
        calculate_wire_amount(frm, cdt, cdn); // Set amount on row creation
    }
});

function calculate_wire_amount(frm, cdt, cdn) {
    let row = locals[cdt][cdn]; // Get the current row

    // Ensure rate__100m and wire_sizemeter are numeric
    let rate = row.rate__1m ? parseFloat(row.rate__1m) : 0;
    let size = row.wire_sizemeter ? parseFloat(row.wire_sizemeter) : 1;

    // If size is 1 (default), set amount as rate
    let wire_amount = (size === 1) ? rate : rate * size;

    // Update wire_amount field in the child table
    frappe.model.set_value(cdt, cdn, "wire_amount", wire_amount);
}

frappe.ui.form.on('Quotations', {
    refresh: function(frm) {
        // Apply filter when the form loads
        filterChildFields(frm, "wire_details", "wire_type", "type", "wire_company");
    }
});

// Function to filter child table fields dynamically
function filterChildFields(frm, tableName, fieldTrigger, fieldName, fieldFiltered) {
    frm.fields_dict[tableName].grid.get_field(fieldFiltered).get_query = function(doc, cdt, cdn) {
        var child = locals[cdt][cdn];
        if (child[fieldTrigger]) {
            return {    
                filters: [
                    [fieldName, '=', child[fieldTrigger]]
                ]
            };
        }
    };
}

frappe.ui.form.on('Quotations', {
    refresh: function(frm) {
        frm.fields_dict['inverter_details'].$wrapper.find('.grid-add-row').text('Add Inverter');
        frm.fields_dict['structure_details'].$wrapper.find('.grid-add-row').text('Add Structure');
        frm.fields_dict['wire_details'].$wrapper.find('.grid-add-row').text('Add Wire');        
    }
});
