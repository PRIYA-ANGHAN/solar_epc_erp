frappe.listview_settings['Opportunity'] = {
    onload: function(listview) {
        // Hide the "Add Opportunity" button
        listview.page.btn_primary.hide();
    }
};
