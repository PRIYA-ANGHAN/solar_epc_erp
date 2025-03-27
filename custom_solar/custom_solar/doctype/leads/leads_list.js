// frappe.listview_settings["Leads"] = {
//     onload: function (listview) {

            // setTimeout(() => {
            //     $('.level-item.list-row-activity.hidden-xs').hide();
            // }, 500); // Add delay to ensure elements are loaded

//         // Keeping your existing logic for the search input placeholder
//         listview.page.fields_dict['name'].$wrapper.attr('data-original-title', __('Search Lead'))
//             .find('input').attr('placeholder', __('Search Lead'));
 
//         // Retaining your custom filter logic
//         listview.get_args = function () {  
//             let args = frappe.views.ListView.prototype.get_args.call(listview);  
//             console.log("args", args);
//             args.filters.some((f, i) => {
//                 if (f[1] === 'name') {
//                     return args.or_filters = [
//                         args.filters.splice(i, 1)[0],  
//                         [f[0], 'name', f[2], f[3]],
//                         [f[0], 'full_name', f[2], f[3]],
//                     ];
//                 }
//             });
 
//             return args;
//         }
//     },
 
    // refresh: function(listview) {
    //     // Hide the "Add Opportunity" button
    //     $('[data-liked-by]').hide();   
    //     $("use.like-icon").hide();
    //     $('[list-liked-by-me]').hide();
    //     $('[es-icon es-line.icon-sm]').hide();
    //     $('.level-item.list-row-activity.hidden-xs, .es-icon.es-line.icon-sm').hide();
    //     $('.level-item.list-row-activity.hidden-xs').hide();
    // },

//     // Add fields to display in the List View, ensure "status" is included
//     add_fields: ["company_name", "full_name", "email_id", "mobile_no", "status"],
 
//     // Define the indicator and apply custom color logic based on status
//     get_indicator: function(doc) {
//         var indicator = [__(doc.status), frappe.utils.guess_colour(doc.status), "status,=," + doc.status];
 
//         // Custom color logic for statuses
//         switch (doc.status) {
//             case "Closed":
//                 indicator[1] = "green";  // Green color for Closed status
//                 break;
//             case "Unqualified Prospect":
//                 indicator[1] = "red";  // Red color for Unqualified Suspect
//                 break;
//             case "Intro Call":
//                 indicator[1] = "yellow";  // Light orange color for Intro Call
//                 break;
//             case "Follow Up":
//                 indicator[1] = "orange";  // Orange color for Follow Up
//                 break;
//             case "Site Visit Schedule":
//                 indicator[1] = "blue";  // Blue color for Site Visit Schedule
//                 break;
//             case "Site Visit Done":
//                 indicator[1] = "pink";  // Pink color for Site Visit Done
//                 break;
//             case "Dormant":
//                 indicator[1] = "grey";  // Grey color for Dormant
//                 break;
//             case "Quotation":
//                 indicator[1] = "purple";  // Light green color for Quotation
//                 break;
//             default:
//                 indicator[1] = "transparent";  // Default color if status is not listed
//                 break;
//         }
//         return indicator;  // Return the color indicator array
//     }
// };
 
// // Your existing button code remains unchanged
// frappe.listview_settings['Leads'].button = {
//     show: function(doc) {
//         return doc.status == 'Site Visit Schedule'; // Button is visible only if status is not "Closed"
//     },
//     get_label: function() {
//         return __('Site Visit');
//     },
//     get_description: function(doc) {
//         return __("Create a Site Visit for Lead: {0}", [doc.full_name]);
//     },
//     action: function(doc) {
//         create_site_visit_for_lead(doc);
//     }
// };
 
// // Function to create a Site Visit linked to the Lead (no changes)
// function create_site_visit_for_lead(doc) {
//     frappe.ui.form.on('Site_Visit', {
//         onload: function(frm) {
//             frm.set_value('lead_owner', frappe.session.user);  // Set current user as lead owner
//             frm.set_value('lead', doc.name);  // Set the lead reference in the Site Visit form
//         }
//     });
//     frappe.set_route('Form', 'Site_Visit', 'new');
// }





// ################## add status button ####################

// frappe.listview_settings["Leads"] = {
//     onload: function (listview) {
//         // Change placeholder text for search input
//         listview.page.fields_dict['name'].$wrapper.attr('data-original-title', __('Search Lead'))
//             .find('input').attr('placeholder', __('Search Lead'));

//         // Custom filtering logic
//         listview.get_args = function () {
//             let args = frappe.views.ListView.prototype.get_args.call(listview);
//             args.filters.some((f, i) => {
//                 if (f[1] === 'name') {
//                     return args.or_filters = [
//                         args.filters.splice(i, 1)[0],
//                         [f[0], 'name', f[2], f[3]],
//                         [f[0], 'full_name', f[2], f[3]],
//                     ];
//                 }
//             });
//             return args;
//         };
//     },

//     refresh: function (listview) {
//         $("use.like-icon").hide();
//     },

//     // Fields to display in the List View
//     add_fields: ["company_name", "full_name", "email_id", "mobile_no", "status"],

//     // Status indicator color logic
//     get_indicator: function (doc) {
//         let color_map = {
//             "Closed": "green",
//             "Unqualified Prospect": "red",
//             "Intro Call": "yellow",
//             "Follow Up": "orange",
//             "Site Visit Schedule": "blue",
//             "Site Visit Done": "pink",
//             "Dormant": "grey",
//             "Quotation": "purple"
//         };
//         return [__(doc.status), color_map[doc.status] || "transparent", "status,=," + doc.status];
//     },

//     // Buttons Configuration
//     button: {
//         show: function (doc) {
//             return doc.status === "Site Visit Schedule" || doc.status !== "Closed";
//         },
//         get_label: function (doc) {
//             if (doc.status === "Site Visit Schedule") {
//                 return __('Site Visit');
//             }
//             return __('Change Status');
//         },
//         get_description: function (doc) {
//             if (doc.status === "Site Visit Schedule") {
//                 return __("Create a Site Visit for Lead: {0}", [doc.full_name]);
//             }
//             return __("Change status for Lead: {0}", [doc.full_name]);
//         },
//         action: function (doc) {
//             if (doc.status === "Site Visit Schedule") {
//                 create_site_visit_for_lead(doc);
//             } else {
//                 change_status_of_lead(doc);
//             }
//         }
//     }
// };

// // Function to create a Site Visit linked to the Lead
// function create_site_visit_for_lead(doc) {
//     frappe.new_doc("Site_Visit", {
//         lead: doc.name,
//         lead_owner: frappe.session.user
//     });
// }

// // Function to change the status of the Lead (Without WebSockets)
// function change_status_of_lead(doc) {
//     frappe.prompt([
//         {
//             label: "New Status",
//             fieldname: "new_status",
//             fieldtype: "Select",
//             options: "\nUnqualified Prospect\nIntro Call\nFollow Up\nSite Visit Schedule\nSite Visit Done\nDormant\nQuotation\nClosed",
//             default: doc.status
//         }
//     ], function (values) {
//         frappe.call({
//             method: "frappe.client.set_value",
//             args: {
//                 doctype: "Leads",
//                 name: doc.name,
//                 fieldname: "status",
//                 value: values.new_status
//             },
//             callback: function (response) {
//                 if (!response.exc) {
//                     frappe.msgprint(__("Status updated successfully"));
//                     setTimeout(() => location.reload(), 1000);  // Refresh manually
//                 }
//             }
//         });
//     }, __("Change Lead Status"), __("Update"));
// }




// #################################################### deop down button

// frappe.listview_settings["Leads"] = {
//     onload: function (listview) {
//         // Change placeholder text for search input
//         listview.page.fields_dict['name'].$wrapper.attr('data-original-title', __('Search Lead'))
//             .find('input').attr('placeholder', __('Search Lead'));

//         // Custom filtering logic
//         listview.get_args = function () {
//             let args = frappe.views.ListView.prototype.get_args.call(listview);
//             args.filters.some((f, i) => {
//                 if (f[1] === 'name') {
//                     return args.or_filters = [
//                         args.filters.splice(i, 1)[0],
//                         [f[0], 'name', f[2], f[3]],
//                         [f[0], 'full_name', f[2], f[3]],
//                     ];
//                 }
//             });
//             return args;
//         };
//     },

//     refresh: function (listview) {
//         $("use.like-icon").hide();
//     },

//     // Fields to display in the List View
//     add_fields: ["company_name", "full_name", "email_id", "mobile_no", "status"],

//     // Status indicator color logic
//     get_indicator: function (doc) {
//         let color_map = {
//             "Closed": "green",
//             "Unqualified Prospect": "red",
//             "Intro Call": "yellow",
//             "Follow Up": "orange",
//             "Site Visit Schedule": "blue",
//             "Site Visit Done": "pink",
//             "Dormant": "grey",
//             "Quotation": "purple"
//         };
//         return [__(doc.status), color_map[doc.status] || "transparent", "status,=," + doc.status];
//     },

//     // Dropdown Button Configuration
//     dropdown_button: {
//         get_label: __("Actions"),
//         buttons: [
//             {
//                 get_label: __("Change Status"),
//                 show: function (doc) {
//                     return true; // Always show Change Status button
//                 },
//                 get_description: function (doc) {
//                     return __("Change status for Lead: {0}", [doc.full_name]);
//                 },
//                 action: function (doc) {
//                     change_status_of_lead(doc);
//                 }
//             },
//             {
//                 get_label: __("Site Visit"),
//                 show: function (doc) {
//                     return doc.status === "Site Visit Schedule"; // Show only if status is Site Visit Schedule
//                 },
//                 get_description: function (doc) {
//                     return __("Create a Site Visit for Lead: {0}", [doc.full_name]);
//                 },
//                 action: function (doc) {
//                     create_site_visit_for_lead(doc);
//                 }
//             }
//         ]
//     }
// };

// // Function to create a Site Visit linked to the Lead
// function create_site_visit_for_lead(doc) {
//     frappe.new_doc("Site_Visit", {
//         lead: doc.name,
//         lead_owner: frappe.session.user
//     });
// }

// // Function to change the status of the Lead (Without WebSockets)
// function change_status_of_lead(doc) {
//     frappe.prompt([
//         {
//             label: "New Status",
//             fieldname: "new_status",
//             fieldtype: "Select",
//             options: "\nUnqualified Prospect\nIntro Call\nFollow Up\nSite Visit Schedule\nSite Visit Done\nDormant\nQuotation\nClosed",
//             default: doc.status
//         }
//     ], function (values) {
//         frappe.call({
//             method: "frappe.client.set_value",
//             args: {
//                 doctype: "Leads",
//                 name: doc.name,
//                 fieldname: "status",
//                 value: values.new_status
//             },
//             callback: function (response) {
//                 if (!response.exc) {
//                     frappe.msgprint(__("Status updated successfully"));
//                     setTimeout(() => location.reload(), 1000);  // Refresh manually
//                 }
//             }
//         });
//     }, __("Change Lead Status"), __("Update"));
// }




// +++++++++++++++++++++++++++++++++++++++++++++++++++++++

frappe.listview_settings["Leads"] = {
    add_fields: ["company_name", "full_name", "email_id", "mobile_no", "status"],

    // Set the color of the status using get_indicator
    get_indicator: function(doc) {
        let color_map = {
            "Closed": "green",
            "Unqualified Prospect": "red",
            "Intro Call": "yellow",
            "Follow Up": "orange",
            "Site Visit Schedule": "blue",
            "Site Visit Done": "pink",
            "Dormant": "grey",
            "Quotation": "purple"
        };
        return [__(doc.status), color_map[doc.status] || "transparent", "status,=," + doc.status];
    },

    button: {
        show: function(doc) {
            return doc.status === "Site Visit Schedule" || doc.status !== "Closed";
        },
        get_label: function(doc) {
            if (doc.status === "Site Visit Schedule") {
                return __('Site Visit');
            }
            return __('Change Status');
        },
        get_description: function(doc) {
            if (doc.status === "Site Visit Schedule") {
                return __("Create a Site Visit for Lead: {0}", [doc.full_name]);
            }
            return __("Change status for Lead: {0}", [doc.full_name]);
        },
        action: function(doc) {
            if (doc.status === "Site Visit Schedule") {
                create_site_visit_for_lead(doc);
            } else {
                change_status_of_lead(doc);
            }
        }
    },

    dropdown_button: {
        get_label: __("Actions"),
        buttons: [
            {
                get_label: __("Change Status"),
                show: function(doc) {
                    return doc.status !== "Closed" && doc.status !== "Dormant";
                },
                get_description: function(doc) {
                    return __("Change status for Lead: {0}", [doc.full_name]);
                },
                action: function(doc) {
                    change_status_of_lead(doc);
                }
            },
            {
                get_label: __("Site Visit"),
                show: function(doc) {
                    return doc.status === "Site Visit Schedule";
                },
                get_description: function(doc) {
                    return __("Create a Site Visit for Lead: {0}", [doc.full_name]);
                },
                action: function(doc) {
                    create_site_visit_for_lead(doc);
                }
            }
        ]
    }
};

// Function to create a Site Visit linked to the Lead
function create_site_visit_for_lead(doc) {
    frappe.new_doc("Site_Visit", {
        lead: doc.name,
        lead_owner: frappe.session.user
    });
}

// Function to change the status of the Lead (Without WebSockets)
function change_status_of_lead(doc) {
    frappe.prompt([
        {
            label: "New Status",
            fieldname: "new_status",
            fieldtype: "Select",
            options: "\nUnqualified Prospect\nIntro Call\nFollow Up\nSite Visit Schedule\nSite Visit Done\nDormant\nQuotation\nClosed",
            default: doc.status
        }
    ], function(values) {
        frappe.call({
            method: "frappe.client.set_value",
            args: {
                doctype: "Leads",
                name: doc.name,
                fieldname: "status",
                value: values.new_status
            },
            callback: function(response) {
                if (!response.exc) {
                    frappe.msgprint(__("Status updated successfully"));
                    setTimeout(() => location.reload(), 1000);  // Refresh manually
                }
            }
        });
    }, __("Change Lead Status"), __("Update"));
}
