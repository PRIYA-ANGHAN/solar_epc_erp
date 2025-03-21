frappe.ui.form.on("Site_Visit", {
	refresh(frm) {
        // Add Save Button at the bottom if not already added
        if (!frm.custom_save_button) {
            let save_button = $('<button class="btn btn-primary mt-4" style="float: right;">Save</button>').click(() => frm.save());
            $(frm.fields_dict[Object.keys(frm.fields_dict).pop()].wrapper).append(save_button);
            frm.custom_save_button = true;
        }
        
	},
});
