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
        load_site_visit_data(frm); // Load correct Site Visit data for the opened lead
    
        // Set Site Visit as the default tab when opening a new Lead
        $('#site-visit-tab').addClass('active');
        $('#activity-tab').removeClass('active');
        $('#quotation-tab').removeClass('active');
    
        // Show Site Visit content and hide Activity content
        $('#site-visit-content').show();
        frm.timeline.timeline_items_wrapper.hide(); // Hide Activity

        // Add Save Button at the bottom if not already added
        if (!frm.custom_save_button) {
            let save_button = $('<button class="btn btn-primary mt-4" style="float: right;">Save</button>').click(() => frm.save());
            $(frm.fields_dict[Object.keys(frm.fields_dict).pop()].wrapper).append(save_button);
            frm.custom_save_button = true;
        }
    },
     
    onload: function(frm) {
        if (!frm.doc.status) {
            frm.old_status = "";
        } else {
            frm.old_status = frm.doc.status;
        }
        console.log("Initial Status:", frm.old_status);

        if (!frm.doc.mobile_no) {  
            frm.set_value('mobile_no', '+91 ');  
        }
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
    
    company_name: function(frm) {           //this filter is for panel per price from company detail doctype
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
                }
            });
        } else {
            frm.set_value("per_panel_price", "");
        }
    },

    status: function(frm) {
        if (frm.doc && frm.doc.status) {
            const old_status = frm.old_status;
            const new_status = frm.doc.status;
    
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
    }
    
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
        let timeline_wrapper = frm.timeline.wrapper; // Get the timeline wrapper
        
        // HTML structure for custom tabs
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

        // Prepend the tab structure inside the timeline wrapper
        $(timeline_wrapper).prepend(tab_html);

        // Load data related to Site Visit
        load_site_visit_data(frm);

        $(document).ready(function () {
            // Tab switching helper function
            function switchTab(activeTab, activeContent) {
                // Remove active class from all tabs and content
                $('#site-visit-tab, #activity-tab, #quotation-tab').removeClass('active');
                $('#site-visit-content, #activity-content, #quotation-content').hide();
                frm.timeline.timeline_items_wrapper.hide();

                // Set active tab and content
                $(activeTab).addClass('active');
                $(activeContent).show();
            }

            // Show Site Visit tab by default
            switchTab('#site-visit-tab', '#site-visit-content');

            // Handle Site Visit tab click
            $('#site-visit-tab').on('click', function () {
                switchTab('#site-visit-tab', '#site-visit-content');
                frm.timeline.timeline_items_wrapper.hide();
                frm.timeline.wrapper.find('.timeline-item').hide(); // Hide Activity content         
            });

            // Handle Activity tab click
            $('#activity-tab').on('click', function () {
                switchTab('#activity-tab', '#activity-content');
                frm.timeline.timeline_items_wrapper.show();
                frm.timeline.wrapper.find('.timeline-item').show();
            });

            // Handle Quotation tab click
            $('#quotation-tab').on('click', function () {
                switchTab('#quotation-tab', '#quotation-content');
                frm.timeline.timeline_items_wrapper.hide();
                frm.timeline.wrapper.find('.timeline-item').hide(); // Hide Activity content            
            });
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
            let visits = response.message || [];
            let content = '';
 
            visits.forEach((visit, index) => {
                content += `
                    <div class="site-visit-details card p-4 mb-4">
                        <h5>Site Visit</h5>
 
                        <!-- Row with 4 values -->
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
                                <div><strong>Lead:</strong></div>
                                <div>${visit.lead || '-'}</div>
                            </div>
                            <div class="col-md-3">
                                <div><strong>Shadow Object/Analysis:</strong></div>
                                <div>${visit.shadow_object_analysis || '-'}</div>
                            </div>
                        </div>
 
                        <!-- Row with another 4 values -->
                        <div class="row mb-3">
                            <div class="col-md-3">
                                <div><strong>Roof Type:</strong></div>
                                <div>${visit.roof_type || '-'}</div>
                            </div>
                            <div class="col-md-3">
                                <div><strong>Structure Type:</strong></div>
                                <div>${visit.structure_type || '-'}</div>
                            </div>
                            <div class="col-md-3">
                                <div><strong>Sanction Load:</strong></div>
                                <div>${visit.sanction_load || '-'}</div>
                            </div>
                            <div class="col-md-3">
                                <div><strong>Is Same Name:</strong></div>
                                <div>${visit.is_same_name || '-'}</div>
                            </div>
                        </div>
 
                        <!-- Row with No. of Floors and others -->
                        <div class="row mb-3">
                            <div class="col-md-3">
                                <div><strong>No. of Floors:</strong></div>
                                <div>${visit.no_of_floor || '-'}</div>
                            </div>
                            <div class="col-md-3">
                                <div><strong>Final Note:</strong></div>
                                <div>${visit.final_note || '-'}</div>
                            </div>
                            <div class="col-md-3">
                                <div><strong>Remarks:</strong></div>
                                <div>${visit.remarks || '-'}</div>
                            </div>
                        </div>
 
                        <!-- Row with additional 4 values -->
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
        }
    });
}