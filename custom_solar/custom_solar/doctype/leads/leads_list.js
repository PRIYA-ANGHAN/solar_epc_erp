frappe.listview_settings["Leads"] = {
    onload: function (listview) {
        // Keeping your existing logic for the search input placeholder
        listview.page.fields_dict['name'].$wrapper.attr('data-original-title', __('Search Lead'))
            .find('input').attr('placeholder', __('Search Lead'));
 
        // Retaining your custom filter logic
        listview.get_args = function () {  
            let args = frappe.views.ListView.prototype.get_args.call(listview);  
            console.log("args", args);
            args.filters.some((f, i) => {
                if (f[1] === 'name') {
                    return args.or_filters = [
                        args.filters.splice(i, 1)[0],  
                        [f[0], 'name', f[2], f[3]],
                        [f[0], 'full_name', f[2], f[3]],
                    ];
                }
            });
 
            return args;
        }
    },
 
    // Add fields to display in the List View, ensure "status" is included
    add_fields: ["company_name", "full_name", "email_id", "mobile_no", "status"],
 
    // Define the indicator and apply custom color logic based on status
    get_indicator: function(doc) {
        var indicator = [__(doc.status), frappe.utils.guess_colour(doc.status), "status,=," + doc.status];
 
        // Custom color logic for statuses
        switch (doc.status) {
            case "Closed":
                indicator[1] = "green";  // Green color for Closed status
                break;
            case "Unqualified Suspect":
                indicator[1] = "red";  // Red color for Unqualified Suspect
                break;
            case "Follow Up":
                indicator[1] = "orange";  // Orange color for Follow Up
                break;
            case "Site Visit Schedule":
                indicator[1] = "blue";  // Blue color for Site Visit Schedule
                break;
            case "Site Visit Done":
                indicator[1] = "lightblue";  // Lightblue color for Site Visit Done
                break;
            case "Dormant":
                indicator[1] = "grey";  // Grey color for Dormant
                break;
            default:
                indicator[1] = "transparent";  // Default color if status is not listed
                break;
        }
 
        return indicator;  // Return the color indicator array
    }
};
 
// Your existing button code remains unchanged
frappe.listview_settings['Leads'].button = {
    show: function(doc) {
        return doc.status !== 'Closed'; // Button is visible only if status is not "Closed"
    },
    get_label: function() {
        return __('Site Visit');
    },
    get_description: function(doc) {
        return __("Create a Site Visit for Lead: {0}", [doc.full_name]);
    },
    action: function(doc) {
        create_site_visit_for_lead(doc);
    }
};
 
// Function to create a Site Visit linked to the Lead (no changes)
function create_site_visit_for_lead(doc) {
    frappe.ui.form.on('Site_Visit', {
        onload: function(frm) {
            frm.set_value('lead_owner', frappe.session.user);  // Set current user as lead owner
            frm.set_value('lead', doc.name);  // Set the lead reference in the Site Visit form
        }
    });
    frappe.set_route('Form', 'Site_Visit', 'new');
}
 
 