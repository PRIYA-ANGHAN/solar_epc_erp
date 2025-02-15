// Copyright (c) 2025, varoon soneji and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Panel Company", {
// 	refresh(frm) {

// 	},
// // });
// frappe.ui.form.on('Panel Company', {
//     refresh: function(frm) {
//         // Add a button to select multiple services
//         frm.add_custom_button(__('Select Services'), function() {
//             frappe.call({
//                 method: 'frappe.client.get_list',
//                 args: {
//                     doctype: 'Services',
//                     fields: ['service'],
//                     limit_page_length: 100
//                 },
//                 callback: function(response) {
//                     let services_list = response.message.map(row => row.service);
                    
//                     // MultiSelect Dialog
//                     let d = new frappe.ui.Dialog({
//                         title: 'Select Services',
//                         fields: [
//                             {
//                                 label: 'Services',
//                                 fieldname: 'selected_services',
//                                 fieldtype: 'MultiCheck',
//                                 options: services_list.map(service => ({ label: service, value: service }))
//                             }
//                         ],
//                         primary_action_label: 'Save',
//                         primary_action(values) {
//                             if (values.selected_services.length > 0) {
//                                 frm.set_value('services', values.selected_services.join(', ')); // Store as CSV
//                             } else {
//                                 frm.set_value('services', '');
//                             }
//                             d.hide();
//                         }
//                     });
//                     d.show();
//                 }
//             });
//         });
//     }
// });
