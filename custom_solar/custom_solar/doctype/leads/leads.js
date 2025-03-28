frappe.ui.form.on('Leads', {
    electricity_bill: function(frm) {
        calculate_required_kw(frm);
    },
    unit_rate: function(frm) {
        calculate_required_kw(frm);
    },
    watt_peakkw: function(frm) {
        calculate_panel_count(frm);
    },
    required__kw: function(frm) {
        calculate_panel_count(frm);
    },
    panel_count: function(frm) {
        calculate_total_price(frm);
    },
    per_panel_price: function(frm) {
        calculate_total_price(frm);
    },
    panel_count: function(frm) {
        calculate_system_size(frm);
    },
    watt_peakkw: function(frm) {
        calculate_system_size(frm);
    },

    refresh: function(frm) {
        add_custom_timeline_tabs(frm); // Ensure tabs are added

        // Ensure tabs are added only once
        if (!frm.custom_tabs_added) {
            add_custom_timeline_tabs(frm); 
        }

        load_site_visit_data(frm); // Load correct Site Visit data for the opened lead
    
        // Set Site Visit as the default tab when opening a new Lead
        $('#site-visit-tab').addClass('active');
        $('#activity-tab').removeClass('active');
        $('#quotation-tab').removeClass('active');
    
        // Show Site Visit content and hide Activity content
        $('#site-visit-content').show();
        frm.timeline.timeline_items_wrapper.hide();
        frm.timeline.wrapper.find('.timeline-item').hide();
        $('#activity-content').hide();
        $('#quotation-content').hide();

        // Add Save Button at the bottom if not already added
        if (!frm.custom_save_button) {
            let save_button = $('<button class="btn btn-primary mt-4" style="float: right;">Save</button>').click(() => frm.save());
            $(frm.fields_dict[Object.keys(frm.fields_dict).pop()].wrapper).append(save_button);
            frm.custom_save_button = true;
        }
    },
    
    onload: function(frm) {
        add_custom_timeline_tabs(frm); // Ensure tabs are added
        load_site_visit_data(frm); // Load correct Site Visit data for the opened lead

        if (!frm.doc.status) {
            frm.old_status = "";
        } else {
            frm.old_status = frm.doc.status;
        }
        console.log("Initial Status:", frm.old_status);

        if (!frm.doc.mobile_no) {  
            frm.set_value('mobile_no', '+91 ');  
        }

        frappe.call({                      //onload logic for rejected quotation when quotation is reject add quotation button is shown
            method: 'custom_solar.custom_solar.doctype.leads.leads.get_quotation_ids',
            args: { lead_id: frm.doc.name },
            callback: function(response) {
                let quotations = response.message || [];
                let hasRejectedQuotation = quotations.some(q => q.status === 'Rejected');
                let hasAcceptedQuotation = quotations.some(q => q.status === 'Accepted');

                if (hasRejectedQuotation && !hasAcceptedQuotation) {
                    // Show the "Add New Quotation" button in the Lead list view
                    frm.add_custom_button(__('Add New Quotation'), function() {
                        frappe.model.with_doctype('Quotations', () => {
                            let doc = frappe.model.get_new_doc('Quotations');

                            // Map Lead fields to Quotation fields
                            doc.lead_id = frm.doc.name || "";
                            doc.email_id = frm.doc.email_id || "";
                            doc.address = frm.doc.address || "";
                            doc.mobile_no = frm.doc.mobile_no || "";
                            doc.date = frappe.datetime.now_datetime();
                            doc.company_name = frm.doc.company_name || "";
                            doc.panel_tech = frm.doc.panel_tech || "";
                            doc.watt_peak = frm.doc.watt_peakkw || "";

                            // Navigate to the new Quotation form
                            frappe.set_route('Form', 'Quotations', doc.name);
                        });
                    }).css({
                        "color": "white",
                        "background-color": "#14141f",
                        "font-weight": "800"
                    });
                }
            }
        });

    },

    services: function(frm) {
        if (frm.doc.services && frm.doc.services.length > 0) {
            let selected_services = frm.doc.services;
            console.log(selected_services)
    
            frm.set_query("panel_tech", function() {
                return {
                    filters: {
                        "service": frm.doc.services  // Filter Panel Tech based on selected Service
                    }
                };
            });
        } else {
            frm.set_query('panel_tech', function() {
                return {};
            });
        }
    },
 
    panel_tech: function(frm) {
        if (!frm.doc.services) {
            frappe.msgprint({
                title: __('Missing Selection'),
                message: __('Please select a Service before choosing Panel Tech.'),
                indicator: 'red'
            });
            frm.set_value("panel_tech", ""); // Reset invalid input
            return;
        }
        if (frm.doc.panel_tech) {
            frm.set_query("watt_peakkw", function() {
                return {
                    filters: {
                        "panel_tech": frm.doc.panel_tech  // Filter Watt Peak based on selected Panel Tech
                    }
                };
            });
        } else {
            frm.set_query("watt_peakkw", function() {
                return {};
            });
        }
    },

    watt_peakkw: function(frm) {
        if (!frm.doc.panel_tech) {
            frappe.msgprint({
                title: __('Missing Selection'),
                message: __('Please select a Panel Tech before choosing Watt Peak.'),
                indicator: 'red'
            });
            frm.set_value("watt_peakkw", ""); // Reset invalid input
            return;
        }

        if (frm.doc.watt_peakkw) {
            frappe.call({
                method: 'frappe.client.get_list',
                args: {
                    doctype: 'Company Details', //get filter from company detail doctype
                    filters: { 'watt_peak': frm.doc.watt_peakkw }, //filter according wattpeak
                    fields: ['panel_company']
                },
                callback: function(response) {
                    if (response.message) {
                        let company_list = response.message.map(c => c.panel_company);
                        frm.set_query("company_name", function() {
                            return {
                                filters: { "name": ["in", company_list] }
                            };
                        });
                    }
                }
            });
        } else {
            frm.set_query("company_name", function() {
                return {};
            });
        }
    },

    company_name: function(frm) {  
        if (!frm.doc.watt_peakkw) {
            frappe.msgprint({
                title: __('Missing Selection'),
                message: __('Please select a Watt Peak before choosing Company Name.'),
                indicator: 'red'
            });
            frm.set_value("company_name", ""); // Reset invalid input
            return;
        }         //this filter is for panel per price from company detail doctype
        if (frm.doc.company_name && frm.doc.watt_peakkw) {
            frappe.call({
                method: 'frappe.client.get_value',
                args: {
                    doctype: 'Company Details',
                    filters: {
                        'panel_company': frm.doc.company_name,
                        'watt_peak': frm.doc.watt_peakkw
                    },
                    fieldname: 'per_panel_price'
                },
                callback: function(response) {
                    if (response.message) {
                        frm.set_value("per_panel_price", response.message.per_panel_price);
                    } else {
                        frm.set_value("per_panel_price", "");
                    }
                },
            });
        } else {
            frm.set_value("per_panel_price", "");
        }
        calculate_panel_count(frm)
    },

    status: function(frm) {
        if (frm.doc && frm.doc.status) {
            const old_status = frm.old_status;
            const new_status = frm.doc.status;

             // Show message when user selects "Closed" (but still block save in Python)
            if (new_status === "Closed") {
                frappe.msgprint({
                    title: __('Validation'),
                    message: __('Lead cannot be closed unless a Quotation is created and accepted.'),
                    indicator: 'red'
                });
                return;
            }

            // Always open the prompt regardless of status change
            if (new_status !== "Quotation") {
                frappe.prompt(
                    {
                        label: 'Add Comment',
                        fieldname: 'status_comment',
                        fieldtype: 'Small Text',
                        reqd: 1
                    },
                    (values) => {
                        // Log comment via Frappe
                        frappe.call({
                            method: 'frappe.desk.form.utils.add_comment',
                            args: {
                                reference_doctype: 'Leads',
                                reference_name: frm.doc.name,
                                content: `Status changed from **${old_status}** to **${new_status}** by ${frappe.session.user}:\n\n> **"${values.status_comment}"**`,
                                comment_by: frappe.session.user,
                                comment_email: frappe.session.user
                            },
                            callback: function() {
                                frm.refresh();
                                frm.old_status = new_status;
                            }
                        });
                    },
                    'Status Change Comment',
                    'Submit'
                );
    
            } else {
                // If status is "Quotation", log status change directly and open Quotation form
                frappe.call({
                    method: 'frappe.desk.form.utils.add_comment',
                    args: {
                        reference_doctype: 'Leads',
                        reference_name: frm.doc.name,
                        content: `Status changed from **${old_status}** to **${new_status}** by ${frappe.session.user}`,
                        comment_by: frappe.session.user,
                        comment_email: frappe.session.user
                    },
                    callback: function() {
                        frm.refresh();
                        frm.old_status = new_status;
    
                        // Open Quotation form with Lead data
                        frappe.model.with_doctype('Quotations', () => {
                            let doc = frappe.model.get_new_doc('Quotations');
    
                            // Map Lead fields to Quotation fields
                            doc.lead_id = frm.doc.name || "";
                            doc.email_id = frm.doc.email_id || "";
                            doc.address = frm.doc.address || "";
                            doc.mobile_no = frm.doc.mobile_no || "";
                            doc.date = frappe.datetime.now_datetime();
                            doc.company_name = frm.doc.company_name || "";
                            doc.panel_tech = frm.doc.panel_tech || "";
                            doc.watt_peak = frm.doc.watt_peakkw || "";
    
                            // Navigate to the new Quotation form
                            frappe.set_route('Form', 'Quotations', doc.name);
                        });
                    }
                });
            }
        }
    },
    
});

function calculate_total_price(frm) {
    // Convert both fields to numbers (default to 0 if empty/NaN)
    let panel_count = parseFloat(frm.doc.panel_count) || 0;
    let per_panel_price = parseFloat(frm.doc.per_panel_price) || 0;
    
    // Calculate the total
    let total = panel_count * per_panel_price;
    
    // Update the total_price field
    frm.set_value('total_price', total);
}
 
function calculate_required_kw(frm) {
    let electricity_bill = frm.doc.electricity_bill || 0;
    let unit_rate = frm.doc.unit_rate || 0;
    let billing_cycle = frm.doc.billing_cycle;
 
    if (electricity_bill > 0 && unit_rate > 0 && billing_cycle) {
        let divisor = (billing_cycle === "1 Month") ? 120 : 240;
        // let required_kw = electricity_bill / (divisor * unit_rate);
        let required_kw = electricity_bill / (divisor * unit_rate);
        frm.set_value('required__kw', required_kw.toFixed(2));
    }
}
 
function calculate_panel_count(frm) {
    let required_kw = parseFloat(frm.doc.required__kw) || 0;
    let watt_peakkw = frm.doc.watt_peakkw || "";

    if (required_kw > 0 && watt_peakkw) {
        let match = watt_peakkw.match(/[\d.]+/);
        if (!match) {
            frappe.msgprint("Watt Peak value is not a valid number.");
            return;
        }

        let watt_peak = parseFloat(match[0]);
        if (watt_peak <= 0) {
            frappe.msgprint("Watt Peak value must be greater than zero.");
            return;
        }

        let panel_count = Math.ceil((required_kw * 1000) / watt_peak);

        // Only auto-update panel_count if it has not been manually modified
        if (!frm.doc.panel_count || frm.doc.panel_count === panel_count) {
            frm.set_value("panel_count", panel_count);
        }
    } else {
        frm.set_value("panel_count", 0);
    }
}

function calculate_system_size(frm) {
    let panel_count = parseFloat(frm.doc.panel_count) || 0;
    let watt_peakkw = frm.doc.watt_peakkw || "";

    if (panel_count > 0 && watt_peakkw) {
        let match = watt_peakkw.match(/[\d.]+/);
        if (!match) {
            frappe.msgprint("Watt Peak value is not a valid number.");
            return;
        }

        let watt_peak = parseFloat(match[0]);
        let system_size = (panel_count * watt_peak) / 1000;

        frm.set_value("system_size", system_size.toFixed(2));
    } else {
        frm.set_value("system_size", 0);
    }
}

function add_custom_timeline_tabs(frm) {
    if (!frm.custom_tabs_added) {
        let timeline_wrapper = frm.timeline.wrapper;
 
        let tab_html = `
        <ul class="nav nav-tabs" id="customTab" role="tablist">
            <li class="nav-item">
                <a class="nav-link active" id="site-visit-tab" role="tab">Site Visit</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="activity-tab" role="tab">Activity</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="quotation-tab" role="tab">Quotation</a>
            </li>
        </ul>
        <div class="tab-content mt-3">
            <div class="tab-pane fade show active" id="site-visit-content" role="tabpanel"></div>
            <div class="tab-pane fade" id="activity-content" role="tabpanel"></div>
            <div class="tab-pane fade" id="quotation-content" role="tabpanel"></div>
        </div>`;
 
        $(timeline_wrapper).prepend(tab_html);
 
        load_site_visit_data(frm);
 
        $('#activity-tab').on('click', function() {
            frm.timeline.timeline_items_wrapper.show();
            frm.timeline.wrapper.find('.timeline-item').show();
            $('#quotation-content').hide();
            $('#site-visit-content').hide();
 
            $('#activity-tab').addClass('active');
            $('#site-visit-tab').removeClass('active');
            $('#quotation-tab').removeClass('active');

            // Hide the div with class 'timeline-items timeline-actions'
            frm.timeline.wrapper.find('.timeline-items.timeline-actions').hide(); 
            frm.timeline.wrapper.find('.d-flex.align-items-center.show-all-activity').removeClass('d-flex').hide(); 

        });
 
        $('#site-visit-tab').on('click', function() {
            frm.timeline.timeline_items_wrapper.hide();
            frm.timeline.wrapper.find('.timeline-item').hide();
            $('#quotation-content').hide();
            $('#site-visit-content').show();

            $('#site-visit-tab').addClass('active'); 
            $('#activity-tab').removeClass('active');
            $('#quotation-tab').removeClass('active');
        });
 
        $('#quotation-tab').on('click', function() {
            frm.timeline.timeline_items_wrapper.hide();
            frm.timeline.wrapper.find('.timeline-item').hide();
            $('#site-visit-content').hide();
            $('#quotation-content').show();
 
            $('#activity-tab').removeClass('active');
            $('#quotation-tab').addClass('active');
            $('#site-visit-tab').removeClass('active');
            load_quotation_data(frm)
        });

        frm.custom_tabs_added = true;
    }
}

function load_site_visit_data(frm) {
    $('#site-visit-content').html('');  // Clear previous Site Visit data

    frm.timeline.timeline_items_wrapper.hide();
    frm.timeline.wrapper.find('.timeline-item').hide(); // Hide Activity content
    $('#quotation-content').hide();

    frappe.call({
        method: 'custom_solar.custom_solar.doctype.leads.leads.get_site_visit_history',
        args: { lead: frm.doc.name },
        callback: function(response) {
            let visits = response.message; // Get response

            // show msg when no site visit for lead
            
            // if (!Array.isArray(visits)) { 
                // If response is NOT an array, show the "No site visit" message
                // $('#site-visit-content').html(`<div class="alert alert-warning text-center">No Site Visit Created for this Lead.</div>`);
                // return;
            // }

            let content = '';
            visits.forEach((visit) => {
                content += `
                    <div class="site-visit-details card p-4 mb-4">
                        <h5>Site Visit</h5>

                        <div class="row mb-3">
                            <div class="col-md-3">
                                <div><strong>Lead Owner:</strong></div>
                                <div>${visit.lead_owner || '-'}</div>
                            </div>
                            <div class="col-md-3">
                                <div><strong>Cantilever Position:</strong></div>
                                <div>${visit.cantilever_position || '-'}</div>
                            </div>
                            <div class="col-md-3">
                                <div><strong>Shadow Object/Analysis:</strong></div>
                                <div>${visit.shadow_object_analysis || '-'}</div>
                            </div>
                            <div class="col-md-3">
                                <div><strong>Roof Type:</strong></div>
                                <div>${visit.roof_type || '-'}</div>
                            </div>
                        </div>

                        <div class="row mb-3">
                            <div class="col-md-3">
                                <div><strong>Structure Type:</strong></div>
                                <div>${visit.structure_type || '-'}</div>
                            </div>
                            <div class="col-md-3">
                                <div><strong>Sanction Load:</strong></div>
                                <div>${visit.sanction_load || '-'}</div>
                            </div>
                            <div class="col-md-3">
                                <div><strong>No. of Floors:</strong></div>
                                <div>${visit.no_of_floor || '-'}</div>
                            </div>
                            <div class="col-md-3">
                                <div><strong>Remarks:</strong></div>
                                <div>${visit.remarks || '-'}</div>
                            </div>
                        </div>

                        <div class="row mb-3">
                            <div class="col-md-3">
                                <div><strong>2D Diagram of Site:</strong></div>
                                <div>
                                    ${visit['2d_diagram_of_site'] ? `<a href="${visit['2d_diagram_of_site']}" target="_blank" style="color: blue;">View Diagram</a>` : '-'}
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div><strong>Site Image:</strong></div>
                                <div>
                                    ${visit.site_image ? `<a href="${visit.site_image}" target="_blank" style="color: blue;">View Image</a>` : '-'}
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div><strong>Site Video:</strong></div>
                                <div>
                                    ${visit.site_video ? `<a href="${visit.site_video}" target="_blank" style="color: blue;">View Video</a>` : '-'}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });

            $('#site-visit-content').html(content); // Display Site Visit data
        },
        error: function(err) {
            console.error("Error fetching site visit data:", err);
            $('#site-visit-content').html(`<div class="alert alert-danger text-center">Error loading site visit data.</div>`);
        }
    });
}

function load_quotation_data(frm) {
    // Hide other tab contents to prevent overlap
    $('#site-visit-content, #activity-content').hide();

    // Clear previous Quotation data
    $('#quotation-content').html('').hide(); // Hide initially to avoid flickering

    frm.timeline.timeline_items_wrapper.hide();
    frm.timeline.wrapper.find('.timeline-item').hide(); // Hide Activity content

    frappe.call({
        method: 'custom_solar.custom_solar.doctype.leads.leads.get_quotation_ids',
        args: { lead_id: frm.doc.name },
        callback: function(response) {
            let quotations = response.message || [];
            
            let content = '';

            if (quotations.length === 0) {
                content = `<div class="alert alert-warning">No quotations found for this lead.</div>`;
            } else {
                quotations.forEach((quotation) => {
                    let status_badge_color = quotation.status === 'Accepted' ? 'success' : 
                                             (quotation.status === 'Rejected' ? 'danger' :
                                             (quotation.status === 'Pending' ? 'warning' : 'secondary'));
            
                    let buttons = '';
                    if (quotation.status !== 'Accepted' && quotation.status !== 'Rejected') {
                        buttons = `
                            <button class="btn btn-success btn-sm update-status accept-btn" data-id="${quotation.name}" data-status="Accepted">Accept</button>
                            <button class="btn btn-danger btn-sm update-status reject-btn" data-id="${quotation.name}" data-status="Rejected">Reject</button>
                        `;
                    }

                    // Add PDF button
                    buttons += `
                        <button class="btn btn-primary btn-sm pdf-btn" data-id="${quotation.name}">PDF</button>
                    `;
            
                    content += `
                        <div class="quotation-details card p-3 mb-3" style="border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; opacity: 1;">
                            <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;">
                                <div class="quotation-id">
                                    <strong>Quotation ID:</strong> ${quotation.name || '-'}
                                </div>
                                <div class="status">
                                    <strong>Status:</strong> 
                                    <span class="badge bg-${status_badge_color} p-1.5" id="status-${quotation.name}">${quotation.status || 'Pending'}</span>
                                </div>
                                <div class="actions">${buttons}</div>
                            </div>
                        </div>`;
                });
            }
            
            $('#quotation-content').html(content).attr('style', 'opacity: 1; visibility: visible; display: block;').fadeIn(); // Ensure smooth transition

            // Handle PDF Button Click
            $('.pdf-btn').on('click', function () {
                let quotation_id = $(this).data('id');
                let base_url = window.location.origin;
                let print_format = "Quotation";

                let pdf_url = `${base_url}/api/method/frappe.utils.print_format.download_pdf?doctype=Quotations&name=${quotation_id}&format=${print_format}&no_letterhead=0`;
            
                window.open(pdf_url, '_blank');
            });

            // Handle Accept & Reject Status Change
            $('.update-status').on('click', function () {
                let quotation_id = $(this).data('id');
                let new_status = $(this).data('status');
                let confirmation_message = `Are you sure you want to ${new_status.toLowerCase()} this quotation?`;

                frappe.confirm(confirmation_message, function () {
                    if (new_status === 'Accepted') {
                        frappe.call({
                            method: 'frappe.client.set_value',
                            args: {
                                doctype: 'Quotations',
                                name: quotation_id,
                                fieldname: 'status',
                                value: 'Accepted'
                            },
                            callback: function (response) {
                                if (!response.exc) {
                                    $(`#status-${quotation_id}`).text('Accepted').removeClass('bg-secondary bg-danger bg-warning').addClass('bg-success');
                                    frappe.msgprint(`Quotation ${quotation_id} has been accepted.`);
                                    $(`button.reject-btn[data-id="${quotation_id}"]`).hide();
                                    $(`button.accept-btn[data-id="${quotation_id}"]`).hide();

                                    // Update Lead Status to Closed
                                    frappe.call({
                                        method: 'frappe.client.set_value',
                                        args: { doctype: 'Leads', name: frm.doc.name, fieldname: 'status', value: 'Closed' },
                                        callback: function() {
                                            frappe.msgprint(`Lead status updated to Closed`);
                                            frm.reload_doc();
                                        }
                                    });
                                }
                            }
                        });
                    } else if (new_status === 'Rejected') {
                        frappe.prompt([{ label: 'Rejection Reason', fieldname: 'rejection_reason', fieldtype: 'Small Text', reqd: 1 }], function (values) {
                            frappe.call({
                                method: 'frappe.client.set_value',
                                args: {
                                    doctype: 'Quotations',
                                    name: quotation_id,
                                    fieldname: { 'status': 'Rejected', 'rejection_reason': values.rejection_reason }
                                },
                                callback: function (response) {
                                    if (!response.exc) {
                                        $(`#status-${quotation_id}`).text('Rejected').removeClass('bg-secondary bg-success bg-warning').addClass('bg-danger');
                                        frappe.msgprint(`Quotation ${quotation_id} has been rejected. Reason: ${values.rejection_reason}`);
                                        $(`button.reject-btn[data-id="${quotation_id}"]`).hide();
                                        $(`button.accept-btn[data-id="${quotation_id}"]`).hide();
                                        frm.reload_doc();
                                    }
                                }
                            });
                        }, 'Rejection Reason', 'Submit');
                    }
                });
            });
        }
    });
}